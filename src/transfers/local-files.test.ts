import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chmod, link, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, stat, symlink, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalTransferFiles, type LocalFilePolicy } from './local-files.js';

async function* chunks(...values: string[]): AsyncGenerator<Buffer> {
  for (const value of values) yield Buffer.from(value);
}
const hash = (text: string): string => createHash('sha256').update(text).digest('hex');
const signal = (): AbortSignal => AbortSignal.timeout(5000);

describe.skipIf(!['darwin', 'linux'].includes(process.platform))('local transfer storage boundary', () => {
  let base: string, uploads: string, managed: string, policy: LocalFilePolicy;
  beforeEach(async () => {
    base = await mkdtemp(join(await realpath(tmpdir()), 'pve-local-'));
    uploads = join(base, 'in'); managed = join(base, 'out');
    await Promise.all([mkdir(uploads, {mode:0o700}), mkdir(managed, {mode:0o700})]);
    policy = { enabled:true, allowElevated:true, transferRoot:managed, uploadRoot:uploads, quotaBytes:12, uploadMaxBytes:8, downloadMaxBytes:8 };
  });
  afterEach(async () => { vi.restoreAllMocks(); await rm(base, {recursive:true, force:true}); });

  it('checks opt-in and elevation before touching even a nonexistent root', async () => {
    for (const gate of [{enabled:false}, {allowElevated:false}]) {
      await expect(LocalTransferFiles.create({...policy, transferRoot:'/does-not-exist', ...gate})).rejects.toThrow('disabled or not elevated');
    }
  });

  it('rejects unsafe, overlapping and aliased roots', async () => {
    await expect(LocalTransferFiles.create({...policy, uploadRoot:base})).rejects.toThrow('disjoint');
    await expect(LocalTransferFiles.create({...policy, transferRoot:uploads})).rejects.toThrow('disjoint');
    const alias = join(base,'alias'); await symlink(uploads,alias);
    await expect(LocalTransferFiles.create({...policy, uploadRoot:alias})).rejects.toThrow();
    await chmod(uploads,0o750);
    await expect(LocalTransferFiles.create(policy)).rejects.toThrow('0700');
    await chmod(base,0o777);
    await expect(LocalTransferFiles.create({...policy, uploadRoot:undefined})).rejects.toThrow('Unsafe parent');
  });

  it('rechecks roots before each job and refuses changed permissions or a replacement directory', async () => {
    const store = await LocalTransferFiles.create(policy);
    await chmod(managed,0o755);
    await expect(store.receive(chunks('x'),signal())).rejects.toThrow('0700');
    await rename(managed,join(base,'previous'));
    await mkdir(managed,{mode:0o700});
    await expect(store.receive(chunks('x'),signal())).rejects.toThrow('replaced');
    expect(await readdir(managed)).toEqual([]);
  });

  it.each(['../file', '/file', 'sub/file', 'sub\\file', '.hidden', 'name\n', 'name\0'])('rejects non-basename %j', async name => {
    const store = await LocalTransferFiles.create(policy);
    await expect(store.withSnapshot(name, signal(), vi.fn())).rejects.toThrow('basename');
    expect(await readdir(managed)).toEqual([]);
  });

  it('rejects symlinks, hard links, directories and FIFOs without consuming them', async () => {
    const store = await LocalTransferFiles.create(policy);
    const outside = join(base, 'original'); await writeFile(outside, 'secret');
    await symlink(outside,join(uploads,'sym')); await link(outside,join(uploads,'hard'));
    await mkdir(join(uploads,'dir')); execFileSync('mkfifo',[join(uploads,'pipe')]);
    const consumer = vi.fn();
    for (const name of ['sym','hard','dir','pipe']) await expect(store.withSnapshot(name,signal(),consumer)).rejects.toThrow('single-link regular');
    expect(consumer).not.toHaveBeenCalled(); expect(await readFile(outside,'utf8')).toBe('secret');
  });

  it('uses snapshot bytes rather than reopening a mutable source path', async () => {
    const store = await LocalTransferFiles.create(policy);
    const path = join(uploads,'probe.iso'); await writeFile(path,'original');
    const value = await store.withSnapshot('probe.iso', signal(), async snap => {
      expect(snap.size).toBe(8); expect(snap.sha256).toBe(hash('original'));
      await writeFile(path,'changed');
      const result = []; for await (const chunk of snap.bytes) result.push(chunk);
      return Buffer.concat(result).toString();
    }, hash('original'));
    expect(value).toBe('original'); expect(await readdir(managed)).toEqual([]);
  });

  it('rejects a source modified between copying and handing off the snapshot', async () => {
    const store = await LocalTransferFiles.create(policy);
    const path = join(uploads,'a'); await writeFile(path,'12345');
    const sample = await open(path,'r'); const prototype = Object.getPrototypeOf(sample); await sample.close();
    const originalWrite = prototype.writeFile;
    vi.spyOn(prototype,'writeFile').mockImplementationOnce(async function(this: typeof sample, ...args) {
      await originalWrite.apply(this,args); await truncate(path,2);
    });
    const consume = vi.fn();
    await expect(store.withSnapshot('a',signal(),consume)).rejects.toThrow('source changed');
    expect(consume).not.toHaveBeenCalled(); expect(await readdir(managed)).toEqual([]);
  });

  it('rejects oversized or checksum-mismatched uploads before handing off', async () => {
    const store = await LocalTransferFiles.create(policy);
    const path = join(uploads,'a'); await writeFile(path,'123456789');
    const consume = vi.fn();
    await expect(store.withSnapshot('a',signal(),consume)).rejects.toThrow('upload size');
    await writeFile(path,'123');
    await expect(store.withSnapshot('a',signal(),consume,hash('other'))).rejects.toThrow('checksum');
    expect(consume).not.toHaveBeenCalled(); expect(await readdir(managed)).toEqual([]);
  });

  it('publishes exact bytes privately and returns relative metadata', async () => {
    const store = await LocalTransferFiles.create({...policy,uploadRoot:undefined});
    const artifact = await store.receive(chunks('one','two'), signal(), hash('onetwo'));
    expect(artifact).toMatchObject({ size:6, sha256:hash('onetwo'), integrity:'checksum_matched' });
    expect(artifact.filename).toBe(`${artifact.id}.bin`);
    expect(await readFile(join(managed,artifact.filename),'utf8')).toBe('onetwo');
    expect((await stat(join(managed,artifact.filename))).mode & 0o777).toBe(0o600);
    expect(await readdir(managed)).toEqual([artifact.filename]);
    const empty = await store.receive(chunks(), signal());
    expect(empty).toMatchObject({size:0,sha256:hash(''),integrity:'received'});
  });

  it('accounts for existing and stale files and unknown-length writes before exceeding quota', async () => {
    const store = await LocalTransferFiles.create(policy);
    await writeFile(join(managed,'old.bin'),'12345'); await writeFile(join(managed,'.old.partial'),'123');
    await expect(store.receive(chunks('123','45'),signal())).rejects.toThrow('quota');
    await writeFile(join(uploads,'iso'),'12345');
    await expect(store.withSnapshot('iso',signal(),vi.fn())).rejects.toThrow('quota');
    expect((await readdir(managed)).sort()).toEqual(['.old.partial','old.bin']);
  });

  it('rejects file size overflow and mismatched digest without leaving output', async () => {
    const store = await LocalTransferFiles.create(policy);
    await expect(store.receive(chunks('12345','6789'),signal())).rejects.toThrow('size limit');
    await expect(store.receive(chunks('abc'),signal(),hash('bad'))).rejects.toThrow('checksum');
    expect(await readdir(managed)).toEqual([]);
  });

  it('does not overwrite even when a final name already exists at publication', async () => {
    const store = await LocalTransferFiles.create(policy);
    async function* collide(): AsyncGenerator<Buffer> {
      const partial = (await readdir(managed)).find(name => name.endsWith('.partial'))!;
      await writeFile(join(managed,partial.slice(1,-8)+'.bin'),'original',{flag:'wx'});
      yield Buffer.from('new');
    }
    await expect(store.receive(collide(),signal())).rejects.toMatchObject({code:'EEXIST'});
    const files = await readdir(managed); expect(files).toHaveLength(1);
    expect(await readFile(join(managed,files[0]),'utf8')).toBe('original');
  });

  it('cleans up after cancellation, upstream failure and a failed snapshot consumer', async () => {
    const store = await LocalTransferFiles.create(policy);
    const controller = new AbortController();
    async function* cancel(): AsyncGenerator<Buffer> { yield Buffer.from('a'); controller.abort(); yield Buffer.from('b'); }
    await expect(store.receive(cancel(),controller.signal)).rejects.toMatchObject({name:'AbortError'});
    async function* broken(): AsyncGenerator<Buffer> { yield Buffer.from('a'); throw new Error('upstream failed'); }
    await expect(store.receive(broken(),signal())).rejects.toThrow('upstream failed');
    await writeFile(join(uploads,'iso'),'keep');
    await expect(store.withSnapshot('iso',signal(),async () => { throw new Error('consumer failed'); })).rejects.toThrow('consumer failed');
    expect(await readFile(join(uploads,'iso'),'utf8')).toBe('keep'); expect(await readdir(managed)).toEqual([]);
  });

  it('cleans up on ENOSPC from the filesystem', async () => {
    const store = await LocalTransferFiles.create(policy);
    const sample = await open(join(base,'sample'),'wx');
    const prototype = Object.getPrototypeOf(sample); await sample.close();
    const fail = vi.spyOn(prototype,'writeFile').mockRejectedValueOnce(Object.assign(new Error('disk full'),{code:'ENOSPC'}));
    try { await expect(store.receive(chunks('x'),signal())).rejects.toMatchObject({code:'ENOSPC'}); }
    finally { fail.mockRestore(); }
    expect(await readdir(managed)).toEqual([]);
  });

  it('serializes independent stores sharing a quota and never steals a stale lock', async () => {
    const one = await LocalTransferFiles.create(policy), two = await LocalTransferFiles.create(policy);
    await writeFile(join(uploads,'a'),'abc');
    await one.withSnapshot('a',signal(),async () => {
      await expect(two.receive(chunks('a'),signal())).rejects.toThrow('busy');
    });
    await writeFile(join(managed,'.transfer.lock'),'previous');
    await expect(two.receive(chunks('b'),signal())).rejects.toThrow('stale lock');
    expect(await readFile(join(managed,'.transfer.lock'),'utf8')).toBe('previous');
  });
});
