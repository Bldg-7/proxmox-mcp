import { createHash, randomUUID } from 'node:crypto';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TransferJobs, type JobInput } from './job-service.js';
import { JobJournal, type JobRecord } from './job-journal.js';
import type { StorageTransferClient } from '../client/storage-transfer.js';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const upid = 'UPID:lab:0123:0001:abcd:imgcopy::root@pam!test:';
const download = (): JobInput => ({kind:'download',requestId:randomUUID(),node:'lab',storage:'pbs',filepath:'/+8=',volume:'backup/vm/100/t'});
const upload = (): JobInput => ({kind:'upload',requestId:randomUUID(),node:'lab',storage:'local',filename:'test.iso',content:'iso'});
function mockTransport(): Pick<StorageTransferClient,'upload'|'download'|'assertUploadAvailable'> {
  return {
    assertUploadAvailable:vi.fn(async () => undefined),
    upload:vi.fn(async snap => { for await (const _ of snap.bytes) void _; return upid; }),
    download:vi.fn(async function* (): AsyncGenerator<Buffer> { yield Buffer.from('abc'); }),
  };
}
async function stopped(signal: AbortSignal): Promise<never> {
  signal.throwIfAborted();
  return new Promise((_,reject) => signal.addEventListener('abort', () => reject(signal.reason), {once:true}));
}

describe.skipIf(!['linux','darwin'].includes(process.platform))('durable transfer jobs (no PVE)', () => {
  let base: string;
  let policy: {enabled:boolean;allowElevated:boolean;journalRoot:string;transferRoot:string;uploadRoot:string};
  let jobs: TransferJobs | undefined;
  beforeEach(async () => {
    base = await mkdtemp(join(await realpath(tmpdir()),'pve-jobs-'));
    policy = {enabled:true,allowElevated:true,journalRoot:join(base,'journal'),uploadRoot:join(base,'in'),transferRoot:join(base,'out')};
    await Promise.all([policy.journalRoot,policy.uploadRoot,policy.transferRoot].map(p => mkdir(p,{mode:0o700})));
    await writeFile(join(policy.uploadRoot,'test.iso'),'abc');
  });
  afterEach(async () => { await jobs?.close(); jobs=undefined; await rm(base,{recursive:true,force:true}); });

  it('requires opt-in, elevation, and disjoint private journal before journal I/O', async () => {
    for (const overrides of [{enabled:false},{allowElevated:false},{journalRoot:policy.transferRoot}]) {
      await expect(TransferJobs.open({...policy,...overrides},mockTransport())).rejects.toThrow();
    }
    expect(await readdir(policy.journalRoot)).toEqual([]);
  });
  it('prevents simultaneous service owners and releases the lease on graceful close', async () => {
    jobs=await TransferJobs.open(policy,mockTransport());
    await expect(TransferJobs.open(policy,mockTransport())).rejects.toThrow(/locked|busy/i);
    await jobs.close(); jobs=await TransferJobs.open(policy,mockTransport());
  });
  it('persists preparing before work, canonicalizes duplicates and retains terminal results on restart', async () => {
    const transport=mockTransport(); jobs=await TransferJobs.open(policy,transport);
    const input={...download(), expectedSha256:sha('abc').toUpperCase()} as Extract<JobInput,{kind:'download'}>;
    const start=jobs.start(input);
    expect(start.state).toBe('preparing'); expect(transport.download).not.toHaveBeenCalled();
    expect(jobs.start({...input, tar:false, expectedSha256:sha('abc')}).id).toBe(start.id);
    expect(() => jobs!.start({...input,volume:'different'})).toThrow('different transfer input');
    expect(() => jobs!.start(download())).toThrow('active');
    await vi.waitFor(() => expect(jobs!.status(start.id).state).toBe('received'));
    expect(jobs.status(start.id).artifact).toMatchObject({id:start.id,size:3,integrity:'checksum_matched'});
    expect(await readFile(join(policy.transferRoot,`${start.id}.bin`),'utf8')).toBe('abc');
    await jobs.close(); jobs=await TransferJobs.open(policy,transport);
    expect(jobs.start(input)).toMatchObject({id:start.id,state:'received'}); expect(transport.download).toHaveBeenCalledTimes(1);
  });
  it('returns submitted + PVE UPID, not remote completion', async () => {
    const transport=mockTransport(); jobs=await TransferJobs.open(policy,transport);
    const job=jobs.start(upload());
    await vi.waitFor(() => expect(jobs!.status(job.id)).toMatchObject({state:'submitted',upid}));
    expect(transport.upload).toHaveBeenCalledWith(expect.objectContaining({filename:`mcp-${job.id}-test.iso`,size:3,sha256:sha('abc')}),expect.any(AbortSignal));
    expect((await jobs.cancel(job.id)).state).toBe('submitted');
  });
  it('rejects duplicate request IDs after ambiguous upload without retrying', async () => {
    const transport=mockTransport(); vi.mocked(transport.upload).mockRejectedValue(new Error('raw secret details'));
    jobs=await TransferJobs.open(policy,transport);
    const input=upload(); const job=jobs.start(input);
    await vi.waitFor(() => expect(jobs!.status(job.id).state).toBe('remote_outcome_unknown'));
    expect(jobs.start(input).state).toBe('remote_outcome_unknown'); expect(transport.upload).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(jobs.status(job.id))).not.toContain('secret');
  });
  it('distinguishes pre-dispatch snapshot errors from unknown remote outcomes', async () => {
    const transport=mockTransport(); jobs=await TransferJobs.open(policy,transport);
    const job=jobs.start({...upload(),expectedSha256:sha('other')});
    await vi.waitFor(() => expect(jobs!.status(job.id).state).toBe('failed'));
    expect(transport.upload).not.toHaveBeenCalled();
  });
  it('cancels before network access and during download, cleaning the partial', async () => {
    const transport=mockTransport();
    vi.mocked(transport.download).mockImplementation(async function* (_target,_tar,_limit,signal) { yield Buffer.from('a'); await stopped(signal); });
    jobs=await TransferJobs.open(policy,transport);
    const first=jobs.start(download()); expect((await jobs.cancel(first.id)).state).toBe('cancelled');
    expect(transport.download).not.toHaveBeenCalled();
    const second=jobs.start(download());
    await vi.waitFor(async () => expect(await readdir(policy.transferRoot)).toContain(`.${second.id}.partial`));
    expect(await jobs.cancel(second.id)).toMatchObject({state:'cancelled',reason:'user'});
    expect(await readdir(policy.transferRoot)).toEqual([]);
  });
  it('aborts local upload on close without claiming the remote worker stopped', async () => {
    const transport=mockTransport(); vi.mocked(transport.upload).mockImplementation((_snapshot,signal) => stopped(signal));
    jobs=await TransferJobs.open(policy,transport);
    const job=jobs.start(upload()); await vi.waitFor(() => expect(transport.upload).toHaveBeenCalled());
    await jobs.close(); expect(() => jobs!.start(upload())).toThrow('closed');
    jobs=await TransferJobs.open(policy,transport);
    expect(jobs.status(job.id)).toMatchObject({state:'remote_outcome_unknown',reason:'shutdown'});
  });
  it('does not open a journal against a different artifact directory on restart', async () => {
    jobs=await TransferJobs.open(policy,mockTransport()); await jobs.close();
    const other=join(base,'new-out'); await mkdir(other,{mode:0o700});
    await expect(TransferJobs.open({...policy,transferRoot:other},mockTransport())).rejects.toThrow('different managed directory');
  });
  it('caps the journal without evicting past idempotency records', async () => {
    const journal=await JobJournal.open(policy.journalRoot);
    const record:JobRecord={id:randomUUID(),requestId:randomUUID(),createdAt:1,updatedAt:2,digest:sha('x'),kind:'download',state:'received'};
    try {
      journal.insert(record);
      for(let i=1;i<1000;i++) journal.insert({...record,id:randomUUID(),requestId:randomUUID()});
      expect(() => journal.insert({...record,id:randomUUID(),requestId:randomUUID()})).toThrow('full');
      expect(journal.find('request_id',record.requestId)).toEqual(record);
    } finally { journal.close(); }
  }, 20000);
  it('enforces total transfer deadline', async () => {
    const transport=mockTransport(); vi.mocked(transport.upload).mockImplementation((_snapshot,signal) => stopped(signal));
    jobs=await TransferJobs.open({...policy,timeoutMs:100},transport);
    const job=jobs.start(upload());
    await vi.waitFor(() => expect(jobs!.status(job.id)).toMatchObject({state:'remote_outcome_unknown',reason:'timeout'}));
  });
  it('recovers an upload after a real process kill, without replaying it', async () => {
    const require = createRequire(import.meta.url);
    const cli = require.resolve('vite-node/vite-node.mjs', {paths:[require.resolve('vitest/package.json')]});
    const worker = fileURLToPath(new URL('./__tests__/crash-worker.mjs',import.meta.url));
    const input=upload();
    const child=fork(cli,[worker,base,input.requestId],{silent:true,execArgv:[]});
    const exit=once(child,'exit');
    let id: string;
    try {
      const [message] = await Promise.race([once(child,'message',{signal:AbortSignal.timeout(10000)}),
        exit.then(() => { throw new Error('Crash fixture exited before its durable checkpoint'); })]);
      id=message.id;
      await expect(TransferJobs.open(policy,mockTransport())).rejects.toThrow(/locked|busy/i);
    } finally { child.kill('SIGKILL'); await exit; }
    const transport=mockTransport(); jobs=await TransferJobs.open(policy,transport);
    expect(jobs.start(input)).toMatchObject({id,state:'remote_outcome_unknown',reason:'restart'});
    expect(transport.upload).not.toHaveBeenCalled(); expect(await readdir(policy.transferRoot)).toEqual([]);
  }, 15000);

  it('reconciles durable crash checkpoints without invoking either transport', async () => {
    const journal=await JobJournal.open(policy.journalRoot);
    const record=(kind:JobRecord['kind'],state:JobRecord['state']): JobRecord => ({id:randomUUID(),requestId:randomUUID(),digest:sha('input'),kind,state,createdAt:1,updatedAt:2});
    const pending=record('upload','preparing'), sent=record('upload','transferring'), ack={...record('upload','transferring'),upid};
    const writing=record('download','transferring'), published=record('download','publishing'), wrong=record('download','publishing');
    const collision=record('download','publishing');
    for (const job of [published,wrong,collision]) {
      job.artifact={id:job.id,filename:`${job.id}.bin`,size:3,sha256:sha('abc'),integrity:'received'};
      const final=join(policy.transferRoot,job.artifact.filename);
      await writeFile(final, job === wrong ? 'bad' : 'abc');
      const st=await stat(final,{bigint:true});
      job.witness={device:st.dev.toString(),inode:job === collision ? '-1' : st.ino.toString()};
    }
    for (const job of [pending,sent,ack,writing,published,wrong,collision]) journal.insert(job);
    journal.close();
    await writeFile(join(policy.transferRoot,'.transfer.lock'),writing.id);
    await writeFile(join(policy.transferRoot,`.${writing.id}.partial`),'part');
    const transport=mockTransport(); jobs=await TransferJobs.open(policy,transport);
    expect([pending,sent,ack,writing,published,wrong,collision].map(job=>jobs!.status(job.id).state)).toEqual([
      'interrupted','remote_outcome_unknown','submitted','interrupted','received','interrupted','interrupted']);
    expect(jobs.status(wrong.id).artifact).toBeUndefined();
    expect((await readdir(policy.transferRoot)).sort()).toEqual([`${published.id}.bin`,`${wrong.id}.bin`,`${collision.id}.bin`].sort());
    expect(transport.upload).not.toHaveBeenCalled(); expect(transport.download).not.toHaveBeenCalled();
  });
  it('rejects unknown status/cancel IDs, stale foreign locks, and malformed input', async () => {
    jobs=await TransferJobs.open(policy,mockTransport());
    expect(() => jobs!.status(randomUUID())).toThrow('Unknown'); await expect(jobs.cancel(randomUUID())).rejects.toThrow('Unknown');
    expect(() => jobs!.start({...upload(),requestId:'bad'})).toThrow();
    await writeFile(join(policy.transferRoot,'.transfer.lock'),'foreign');
    const job=jobs.start(upload()); await vi.waitFor(() => expect(jobs!.status(job.id).state).toBe('failed'));
    expect(await readFile(join(policy.transferRoot,'.transfer.lock'),'utf8')).toBe('foreign');
  });
});
