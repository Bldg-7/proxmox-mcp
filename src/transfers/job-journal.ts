import { constants as F } from 'node:fs';
import { lstat, open } from 'node:fs/promises';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { FileIdentity, LocalArtifact } from './local-files.js';

export type JobState = 'preparing' | 'transferring' | 'publishing' | 'submitted' | 'received' |
  'failed' | 'cancelled' | 'interrupted' | 'remote_outcome_unknown';
export interface JobStatus {
  id: string; requestId: string; kind: 'upload' | 'download'; state: JobState;
  createdAt: number; updatedAt: number; remoteFilename?: string; upid?: string; artifact?: LocalArtifact;
  size?: number; sha256?: string; // immutable upload snapshot metadata; not bytes sent
  reason?: 'user' | 'shutdown' | 'timeout' | 'restart' | 'transfer_error';
}
export interface JobRecord extends JobStatus { digest: string; witness?: FileIdentity }

/** One exclusive SQLite connection holds the service lease even BETWEEN committed transactions.
 * The kernel releases it on process exit. Never infer that a job is dead from its age or PID. */
export class JobJournal {
  private constructor(private readonly db: DatabaseSync) {}
  static async open(root: string): Promise<JobJournal> {
    const path = join(root, 'jobs.sqlite');
    try { await (await open(path, F.O_CREAT | F.O_EXCL | F.O_WRONLY | F.O_NOFOLLOW, 0o600)).close(); }
    catch (err) { if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err; }
    for (const name of [path, path+'-journal', path+'-wal', path+'-shm']) {
      try {
        const st = await lstat(name);
        if (!st.isFile() || st.nlink !== 1 || st.uid !== process.geteuid!() || (st.mode & 0o077)) throw new Error('Unsafe transfer journal file');
      } catch (err) { if ((err as NodeJS.ErrnoException).code !== 'ENOENT' || name === path) throw err; }
    }
    // Lazy import: disabled tools do not load the SQLite runtime or create files.
    const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
    const db = new DatabaseSync(path);
    try {
      db.exec('PRAGMA busy_timeout=0; PRAGMA trusted_schema=OFF; PRAGMA locking_mode=EXCLUSIVE; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; BEGIN EXCLUSIVE;');
      db.exec('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, record TEXT NOT NULL) STRICT; COMMIT;');
      return new JobJournal(db);
    } catch (err) { db.close(); throw err; }
  }

  /** A restart must reconcile against the original artifact directory, not a new mount/path. */
  bindManagedRoot(identity: string): void {
    this.db.exec('CREATE TABLE IF NOT EXISTS binding (name TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT');
    this.db.prepare('INSERT OR IGNORE INTO binding VALUES (?,?)').run('managedRoot',identity);
    if (this.db.prepare('SELECT value FROM binding WHERE name=?').get('managedRoot')?.value !== identity) {
      throw new Error('Transfer journal belongs to a different managed directory');
    }
  }
  close(): void { this.db.close(); }
  all(): JobRecord[] {
    return this.db.prepare('SELECT record FROM jobs').all().map(row => JSON.parse(String(row.record)) as JobRecord);
  }
  find(key: 'id' | 'request_id', value: string): JobRecord | undefined {
    const sql = key === 'id' ? 'SELECT record FROM jobs WHERE id=?' : 'SELECT record FROM jobs WHERE request_id=?';
    const row = this.db.prepare(sql).get(value);
    return row ? JSON.parse(String(row.record)) as JobRecord : undefined;
  }
  insert(record: JobRecord): void {
    if (Number(this.db.prepare('SELECT count(*) AS n FROM jobs').get()?.n) >= 1000) throw new Error('Transfer journal is full; operator maintenance required');
    this.db.prepare('INSERT INTO jobs VALUES (?,?,?)').run(record.id, record.requestId, JSON.stringify(record));
  }
  save(record: JobRecord): void {
    const changes = this.db.prepare('UPDATE jobs SET record=? WHERE id=?').run(JSON.stringify(record), record.id).changes;
    if (changes !== 1) throw new Error('Missing transfer journal entry');
  }
}
