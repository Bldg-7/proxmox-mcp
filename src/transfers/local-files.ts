import { createHash, randomUUID } from 'node:crypto';
import { constants as F } from 'node:fs';
import { link, lstat, open, opendir, realpath, unlink, type FileHandle } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';

/** Operator configuration only. Never populate roots or limits from MCP arguments. */
export interface LocalFilePolicy {
  enabled?: boolean;
  allowElevated?: boolean;
  transferRoot: string;
  uploadRoot?: string;
  uploadMaxBytes?: number;
  downloadMaxBytes?: number;
  quotaBytes?: number;
}
interface Digest { size: number; sha256: string }
export interface LocalSnapshot extends Digest { bytes: AsyncIterable<Uint8Array> }
export interface LocalArtifact extends Digest {
  id: string; filename: string; integrity: 'received' | 'checksum_matched';
}
const GiB = 1024 ** 3;
const lockName = '.transfer.lock';
const exclusive = F.O_CREAT | F.O_EXCL | F.O_NOFOLLOW | F.O_RDWR;

function limit(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error('Transfer byte limits must be positive safe integers');
  return value;
}
function validateDigest(value?: string): void {
  if (value !== undefined && !/^[a-fA-F0-9]{64}$/.test(value)) throw new Error('Invalid expected SHA-256');
}

interface Root { path: string; identity: string; ancestors: Set<string> }
async function privateRoot(path: string, uid: number): Promise<Root> {
  if (!isAbsolute(path) || resolve(path) !== path || path === '/') throw new Error('Use a dedicated absolute canonical transfer directory');
  const ancestors = new Set<string>();
  let identity = '';
  for (let current = path; ; current = dirname(current)) {
    const st = await lstat(current, { bigint: true });
    if (!st.isDirectory()) throw new Error('Transfer directory paths must not contain symlinks');
    const owner = Number(st.uid), mode = Number(st.mode);
    const key = `${st.dev}:${st.ino}`;
    ancestors.add(key);
    if (current === path) {
      if (owner !== uid || (mode & 0o777) !== 0o700) throw new Error('Transfer directories must be owned by the service user with mode 0700');
      identity = key;
    } else if ((owner !== 0 && owner !== uid) || ((mode & 0o022) && !(mode & 0o1000))) {
      throw new Error('Unsafe parent of transfer directory');
    }
    if (current === '/') break;
  }
  if (await realpath(path) === await realpath(homedir())) throw new Error('Do not use the entire home directory for transfers');
  return { path, identity, ancestors };
}

/** Counts existing artifacts AND abandoned partial files. No automatic deletion/eviction. */
async function usedBytes(root: string, quota: number): Promise<number> {
  let used = 0, entries = 0;
  for await (const entry of await opendir(root)) {
    if (entry.name === lockName) continue;
    if (++entries >= 1000) throw new Error('Transfer directory entry limit reached');
    const st = await lstat(join(root, entry.name));
    if (!st.isFile()) throw new Error('Unexpected non-file in dedicated transfer directory');
    if (!Number.isSafeInteger(st.size) || st.size > quota - used) throw new Error('Transfer quota exceeded');
    used += st.size;
  }
  return used;
}

async function copyBytes(input: AsyncIterable<Uint8Array>, output: FileHandle, perFile: number,
  available: number, signal: AbortSignal, expected?: string): Promise<Digest> {
  let size = 0;
  const hash = createHash('sha256');
  signal.throwIfAborted();
  for await (const chunk of input) {
    signal.throwIfAborted();
    if (chunk.byteLength > perFile - size) throw new Error('File exceeds transfer size limit');
    if (chunk.byteLength > available - size) throw new Error('Transfer quota exceeded');
    await output.writeFile(chunk); // handles short writes; only one write in flight
    hash.update(chunk);
    size += chunk.byteLength;
  }
  signal.throwIfAborted();
  const sha256 = hash.digest('hex');
  if (expected !== undefined && expected.toLowerCase() !== sha256) throw new Error('Transfer checksum mismatch');
  return { size, sha256 };
}

/** POSIX local storage boundary. Assumes trusted parents, no hostile same-UID process/ACLs,
 * and a local filesystem with reliable exclusive opens and hard links. No network access. */
export class LocalTransferFiles {
  private constructor(private readonly managed: Root, private readonly uploads: Root | undefined,
    private readonly quota: number, private readonly uploadMax: number, private readonly downloadMax: number) {}

  static async create(policy: LocalFilePolicy): Promise<LocalTransferFiles> {
    if (policy.enabled !== true || policy.allowElevated !== true) throw new Error('Local transfer access is disabled or not elevated');
    if (!['darwin', 'linux'].includes(process.platform) || !process.geteuid || !F.O_NOFOLLOW || !F.O_NONBLOCK) {
      throw new Error('Local transfer protection requires Linux or macOS');
    }
    const uid = process.geteuid();
    const managed = await privateRoot(policy.transferRoot, uid);
    const uploads = policy.uploadRoot === undefined ? undefined : await privateRoot(policy.uploadRoot, uid);
    if (uploads && (managed.ancestors.has(uploads.identity) || uploads.ancestors.has(managed.identity))) {
      throw new Error('Upload and managed directories must be disjoint');
    }
    return new LocalTransferFiles(managed, uploads, limit(policy.quotaBytes ?? 4 * GiB),
      limit(policy.uploadMaxBytes ?? 2 * GiB), limit(policy.downloadMaxBytes ?? 2 * GiB));
  }

  private async locked<T>(signal: AbortSignal, roots: Root[], work: (available: number) => Promise<T>): Promise<T> {
    signal.throwIfAborted();
    // Do not keep using a path whose permissions or identity changed between jobs.
    for (const root of roots) {
      const current = await privateRoot(root.path, process.geteuid!());
      if (current.identity !== root.identity) throw new Error('Configured transfer directory was replaced');
    }
    const lock = join(this.managed.path, lockName);
    let fd: FileHandle;
    try { fd = await open(lock, exclusive, 0o600); }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('Transfer directory is busy or contains a stale lock');
      throw err;
    }
    try {
      const available = this.quota - await usedBytes(this.managed.path, this.quota);
      signal.throwIfAborted();
      return await work(available);
    } finally {
      try { await fd.close(); } finally { await unlink(lock); }
    }
  }

  /** Snapshot lifetime, quota reservation and FD release include the entire async consumer. */
  async withSnapshot<T>(basename: string, signal: AbortSignal, consume: (snapshot: LocalSnapshot) => Promise<T>, expectedSha256?: string): Promise<T> {
    if (!this.uploads) throw new Error('No upload directory configured');
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,254}$/.test(basename)) throw new Error('Expected a single safe upload basename');
    validateDigest(expectedSha256);
    const path = join(this.uploads.path, basename);
    return this.locked(signal, [this.managed, this.uploads], async available => {
      // Do not open devices/FIFOs. Recheck identity and type on the actual descriptor.
      const pre = await lstat(path, { bigint: true });
      if (!pre.isFile() || pre.nlink !== 1n) throw new Error('Expected a single-link regular upload file');
      const source = await open(path, F.O_RDONLY | F.O_NOFOLLOW | F.O_NONBLOCK);
      try {
        const start = await source.stat({ bigint: true });
        if (!start.isFile() || start.nlink !== 1n || pre.ino !== start.ino || pre.dev !== start.dev) throw new Error('Upload source changed');
        if (start.size <= 0n || start.size > BigInt(this.uploadMax)) throw new Error('Invalid upload size');
        if (start.size > BigInt(available)) throw new Error('Transfer quota exceeded');
        const temp = join(this.managed.path, `.${randomUUID()}.snapshot`);
        const stage = await open(temp, exclusive, 0o600);
        try {
          // Anonymous inode: neither an in-progress upload nor a crash leaves a readable snapshot path.
          await unlink(temp);
          const stream = source.createReadStream({ autoClose: false, signal });
          const digest = await copyBytes(stream, stage, Number(start.size), available, signal, expectedSha256);
          const end = await source.stat({ bigint: true });
          if (BigInt(digest.size) !== start.size || end.size !== start.size || end.ctimeNs !== start.ctimeNs || end.mtimeNs !== start.mtimeNs) throw new Error('Upload source changed during snapshot');
          signal.throwIfAborted();
          const bytes = stage.createReadStream({ start: 0, autoClose: false, signal });
          try { return await consume({ ...digest, bytes }); }
          finally { bytes.destroy(); }
        } finally { await stage.close(); }
      } finally { await source.close(); }
    });
  }

  /** Input must observe the same signal (as StorageTransferClient.download does).
   * Final artifact is published only after EOF, optional digest verification and fsync. */
  async receive(input: AsyncIterable<Uint8Array>, signal: AbortSignal, expectedSha256?: string): Promise<LocalArtifact> {
    validateDigest(expectedSha256);
    return this.locked(signal, [this.managed], async available => {
      const id = randomUUID();
      const filename = `${id}.bin`;
      const temp = join(this.managed.path, `.${id}.partial`);
      const out = await open(temp, exclusive, 0o600);
      try {
        let digest: Digest;
        try {
          digest = await copyBytes(input, out, this.downloadMax, available, signal, expectedSha256);
          await out.sync();
        } finally { await out.close(); }
        signal.throwIfAborted();
        await link(temp, join(this.managed.path, filename)); // atomic no-replace, no rename fallback
        return { id, filename, ...digest, integrity: expectedSha256 ? 'checksum_matched' : 'received' };
      } finally { await unlink(temp); }
    });
  }
}
