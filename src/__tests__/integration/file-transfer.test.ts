import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerRuntime } from '../../runtime.js';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import type { Config } from '../../config/index.js';
import type { JobStatus } from '../../transfers/job-journal.js';

// Use actual MCP handshake, discovery and call dispatch; replace only the external PVE boundary.
describe.skipIf(!['linux','darwin'].includes(process.platform))('file transfer MCP lifecycle', () => {
  let base:string, roots:NonNullable<Config['fileTransfer']>, mcp:Client;
  let runtime:Awaited<ReturnType<typeof createServerRuntime>> | undefined;
  let api:ReturnType<typeof createMockProxmoxClient>;
  const download = (): Record<string,unknown> => ({action:'download',node:'lab',storage:'pbs',volume:'backup/vm/100/test',filepath:'/+8=',request_id:randomUUID()});
  const upload = (): Record<string,unknown> => ({action:'upload',node:'lab',storage:'local',content:'iso',filename:'disk.iso',request_id:randomUUID()});
  beforeEach(async () => {
    base=await mkdtemp(join(await realpath(tmpdir()),'pve-runtime-'));
    roots={transferRoot:join(base,'out'),journalRoot:join(base,'journal'),uploadRoot:join(base,'in')};
    await Promise.all([roots.transferRoot,roots.journalRoot,roots.uploadRoot!].map(p=>mkdir(p,{mode:0o700})));
    await writeFile(join(roots.uploadRoot!,'disk.iso'),'image');
    api=createMockProxmoxClient();
  });
  async function connect(config: Config): Promise<void> {
    runtime=await createServerRuntime(config,api);
    const [a,b]=InMemoryTransport.createLinkedPair();
    mcp=new Client({name:'test-client',version:'1'});
    await runtime.server.connect(a); await mcp.connect(b);
  }
  async function call(name:string,args:Record<string,unknown>): Promise<JobStatus> {
    const r=await mcp.callTool({name,arguments:args});
    const text=(r.content as Array<{text:string}>)[0].text;
    if(r.isError) throw new Error(text);
    return JSON.parse(text) as JobStatus;
  }
  const status=(id:string): Promise<JobStatus> => call('proxmox_file_transfer',{action:'status',id});
  afterEach(async () => { await runtime?.close(); runtime=undefined; await rm(base,{recursive:true,force:true}); });

  it.each([false,true])('does not open a journal or contact PVE without opt-in (elevated=%s)', async allowElevated => {
    const uploadCall=vi.spyOn(api.storageTransfer,'upload'); const downloadCall=vi.spyOn(api.storageTransfer,'download');
    await connect(createTestConfig({allowElevated}));
    for(const [name,args] of [['proxmox_storage_content',upload()],['proxmox_file_restore',download()],
      ['proxmox_file_transfer',{action:'status',id:randomUUID()}],['proxmox_file_transfer',{action:'cancel',id:randomUUID()}]] as const) {
      await expect(call(name,args)).rejects.toThrow(allowElevated ? /not enabled/ : /Permission denied/);
    }
    expect(await readdir(roots.journalRoot)).toEqual([]); expect(await readdir(roots.transferRoot)).toEqual([]);
    expect(api.request).not.toHaveBeenCalled(); expect(uploadCall).not.toHaveBeenCalled(); expect(downloadCall).not.toHaveBeenCalled();
  });

  it('discovers controls, publishes a download artifact and distinguishes upload UPID from local ID', async () => {
    vi.spyOn(api.storageTransfer,'download').mockImplementation(async function* (): AsyncGenerator<Buffer> { yield Buffer.from('restored'); });
    const preflight=vi.spyOn(api.storageTransfer,'assertUploadAvailable').mockResolvedValue(undefined);
    const send=vi.spyOn(api.storageTransfer,'upload').mockImplementation(async snap => {
      const bytes=[]; for await(const chunk of snap.bytes) bytes.push(chunk);
      expect(Buffer.concat(bytes).toString()).toBe('image'); return 'UPID:lab:local-test:';
    });
    await connect(createTestConfig({allowElevated:true,fileTransfer:roots}));
    expect((await mcp.listTools()).tools.some(tool=>tool.name==='proxmox_file_transfer')).toBe(true);
    const args=download(); const start=await call('proxmox_file_restore',args);
    await vi.waitFor(async () => expect((await status(start.id)).state).toBe('received'));
    expect((await call('proxmox_file_restore',args)).id).toBe(start.id);
    const artifact=(await status(start.id)).artifact!;
    expect(await readFile(join(roots.transferRoot,artifact.filename),'utf8')).toBe('restored');
    const request=await call('proxmox_storage_content',upload());
    await vi.waitFor(async () => expect(await status(request.id)).toMatchObject({state:'submitted',upid:'UPID:lab:local-test:'}));
    expect(preflight).toHaveBeenCalledTimes(1); expect(send).toHaveBeenCalledTimes(1);
    expect(request.remoteFilename).toBe(`mcp-${request.id}-disk.iso`);
  });

  it('rejects journal reuse under another PVE identity without contacting PVE', async () => {
    const config=createTestConfig({allowElevated:true,fileTransfer:roots}); await connect(config);
    await runtime!.close();
    const otherApi=createMockProxmoxClient();
    await expect(createServerRuntime({...config,tokenName:'different'},otherApi)).rejects.toThrow('PVE identity');
    expect(otherApi.request).not.toHaveBeenCalled();
  });

  it('fails closed on a preflight error, and rejects local paths/legacy checksum fields', async () => {
    vi.spyOn(api.storageTransfer,'assertUploadAvailable').mockRejectedValue(new Error('remote name exists'));
    const send=vi.spyOn(api.storageTransfer,'upload'); await connect(createTestConfig({allowElevated:true,fileTransfer:roots}));
    for(const extra of [{filename:'../outside.iso'},{checksum:'ignored'},{content:'backup'},{request_id:undefined}]) {
      await expect(call('proxmox_storage_content',{...upload(),...extra})).rejects.toThrow(/Validation error/);
    }
    const job=await call('proxmox_storage_content',upload());
    await vi.waitFor(async () => expect((await status(job.id)).state).toBe('failed'));
    expect(send).not.toHaveBeenCalled();
  });

  it('cancels and cleans partials; disconnect interrupts work and the journal reopens', async () => {
    vi.spyOn(api.storageTransfer,'download').mockImplementation(async function* (_target,_tar,_max,signal): AsyncGenerator<Buffer> {
      yield Buffer.from('partial'); signal.throwIfAborted();
      await new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
    });
    const config=createTestConfig({allowElevated:true,fileTransfer:roots}); await connect(config);
    const a=await call('proxmox_file_restore',download());
    await vi.waitFor(async () => expect(await readdir(roots.transferRoot)).toContain(`.${a.id}.partial`));
    expect((await call('proxmox_file_transfer',{action:'cancel',id:a.id})).state).toBe('cancelled');
    expect(await readdir(roots.transferRoot)).toEqual([]);
    const b=await call('proxmox_file_restore',download());
    await vi.waitFor(async () => expect(await readdir(roots.transferRoot)).toContain(`.${b.id}.partial`));
    await mcp.close();
    await vi.waitFor(async () => expect(await readdir(roots.transferRoot)).toEqual([]));
    await runtime!.close(); api=createMockProxmoxClient(); await connect(config);
    expect(await status(b.id)).toMatchObject({state:'interrupted',reason:'shutdown'});
  });
});
