import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { StorageTransferClient } from '../client/storage-transfer.js';
import { restoreEntryId } from '../schemas/storage-management.js';
import { validateNodeName, validateStorageName } from '../validators/index.js';
import { LocalTransferFiles, privateRoot, type LocalFilePolicy } from './local-files.js';
import { JobJournal, type JobRecord, type JobStatus } from './job-journal.js';

const uuid = z.string().uuid().transform(s => s.toLowerCase());
const base = z.object({requestId:uuid, node:z.string(), storage:z.string(),
  expectedSha256:z.string().regex(/^[a-fA-F0-9]{64}$/).transform(s => s.toLowerCase()).optional()});
const inputSchema = z.discriminatedUnion('kind', [
  base.extend({ kind:z.literal('upload'), content:z.enum(['iso','vztmpl']), filename:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,213}$/) }).strict(),
  base.extend({ kind:z.literal('download'), volume:z.string().min(1).max(1024), filepath:restoreEntryId, tar:z.boolean().default(false) }).strict(),
]);
export type JobInput = z.input<typeof inputSchema>;
type Input = z.output<typeof inputSchema>;
type Transport = Pick<StorageTransferClient, 'upload' | 'download' | 'assertUploadAvailable'>;
type Policy = LocalFilePolicy & {journalRoot: string; timeoutMs?: number; serverIdentity?: string};
interface Active { id: string; controller: AbortController; done: Promise<void> }

function view(record: JobRecord): JobStatus {
  const { digest, witness, ...status } = record;
  void digest; void witness;
  if (status.state !== 'received') delete status.artifact; // publish intent isn't proof of receipt
  return status;
}

/** Internal, single-instance service per private journal. No MCP tool exposure or network at startup. */
export class TransferJobs {
  private active?: Active;
  private closing?: Promise<void>;
  private broken = false;
  private constructor(private readonly journal: JobJournal, private readonly files: LocalTransferFiles,
    private readonly transport: Transport, private readonly timeoutMs: number, private readonly downloadMax: number) {}

  static async open(policy: Policy, transport: Transport): Promise<TransferJobs> {
    const files = await LocalTransferFiles.create(policy); // gate BEFORE opening any journal
    const timeout = policy.timeoutMs ?? 1_800_000;
    if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 2_147_483_647) throw new Error('Invalid transfer deadline');
    const root = await privateRoot(policy.journalRoot, process.geteuid!());
    const managed = await privateRoot(policy.transferRoot, process.geteuid!());
    const roots = [managed];
    if (policy.uploadRoot) roots.push(await privateRoot(policy.uploadRoot, process.geteuid!()));
    for (const data of roots) {
      if (root.ancestors.has(data.identity) || data.ancestors.has(root.identity)) throw new Error('Journal must be separate from transfer and upload directories');
    }
    const journal = await JobJournal.open(root.path);
    try {
      journal.bindManagedRoot(managed.identity, policy.serverIdentity);
      const service = new TransferJobs(journal, files, transport, timeout, policy.downloadMaxBytes ?? 2 * 1024 ** 3);
      await service.recover();
      return service;
    } catch (err) { journal.close(); throw err; }
  }

  private async recover(): Promise<void> {
    for (const job of this.journal.all()) {
      if (!['preparing','transferring','publishing'].includes(job.state)) continue;
      const published = await this.files.recoverJob(job.id, job.state === 'publishing' ? job.artifact : undefined, job.witness);
      const state = published ? 'received' : job.upid ? 'submitted' :
        job.kind === 'upload' && job.state === 'transferring' ? 'remote_outcome_unknown' : 'interrupted';
      this.save(job, { state, reason:'restart' });
    }
  }

  private assertOpen(): void {
    if (this.closing || this.broken) throw new Error('Transfer service closed or journal unavailable');
  }
  private save(job: JobRecord, patch: Partial<Pick<JobRecord, 'state'|'reason'|'artifact'|'upid'|'size'|'sha256'|'witness'>>): void {
    const next = { ...job, ...patch, updatedAt:Date.now() };
    try { this.journal.save(next); } catch (err) { this.broken = true; throw err; }
    Object.assign(job, next);
  }

  start(raw: JobInput): JobStatus {
    this.assertOpen();
    const input = inputSchema.parse(raw);
    validateNodeName(input.node); validateStorageName(input.storage);
    if (input.storage === '.' || input.storage === '..') throw new Error('Invalid storage identifier');
    // Fixed tuples, normalized defaults/case. Do not store user input, credentials or file bytes.
    const digest = createHash('sha256').update(JSON.stringify([input.kind,input.node,input.storage,input.expectedSha256 ?? null,
      ...(input.kind === 'upload' ? [input.content,input.filename] : [input.volume,input.filepath,input.tar])])).digest('hex');
    const prior = this.journal.find('request_id',input.requestId);
    if (prior) {
      if (prior.digest !== digest) throw new Error('Request ID already used for different transfer input');
      return view(prior);
    }
    if (this.active) throw new Error('Another transfer is active');
    const id = randomUUID(), now = Date.now();
    const job: JobRecord = { id, requestId:input.requestId, kind:input.kind, digest, state:'preparing', createdAt:now, updatedAt:now,
      ...(input.kind === 'upload' ? { remoteFilename:`mcp-${id}-${input.filename}` } : {}) };
    this.journal.insert(job); // committed before acknowledgement or async work
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), this.timeoutMs);
    const done = Promise.resolve().then(() => this.run(input,job,controller.signal)).catch(() => {
      // Persistence failures are not successful jobs. Fail closed until reopening can reconcile.
      this.broken = true;
    }).finally(() => { clearTimeout(timer); this.active = undefined; });
    this.active = { id, controller, done };
    return view(job);
  }

  private async run(input: Input, job: JobRecord, signal: AbortSignal): Promise<void> {
    let published = false;
    try {
      signal.throwIfAborted();
      if (input.kind === 'upload') {
        await this.files.withSnapshot(input.filename, signal, async snapshot => {
          signal.throwIfAborted();
          await this.transport.assertUploadAvailable({node:input.node,storage:input.storage},input.content,job.remoteFilename!,signal);
          signal.throwIfAborted();
          // Durable BEFORE the first possible remote write. After this point loss of
          // an acknowledgement must never be reported as a definite failure or auto-retried.
          this.save(job, {state:'transferring', size:snapshot.size, sha256:snapshot.sha256});
          const upid = await this.transport.upload({ ...snapshot, node:input.node, storage:input.storage,
            content:input.content, filename:job.remoteFilename! }, signal);
          this.save(job, {upid});
        },input.expectedSha256,job.id);
        this.save(job, {state:'submitted'});
      } else {
        this.save(job, {state:'transferring'});
        const bytes = this.transport.download({node:input.node,storage:input.storage,volume:input.volume,filepath:input.filepath},input.tar,this.downloadMax,signal);
        const artifact = await this.files.receive(bytes,signal,input.expectedSha256,{id:job.id,
          beforePublish: (intent,witness) => this.save(job,{state:'publishing',artifact:intent,witness}),
          afterPublish: () => { published = true; }});
        this.save(job, {state:'received', artifact});
      }
    } catch {
      if (this.broken) return; // last durable checkpoint is the source of truth on restart
      const reason = signal.aborted ? signal.reason as 'user'|'shutdown'|'timeout' : 'transfer_error';
      this.save(job, {state:published ? 'received' : job.upid ? 'submitted' : job.kind === 'upload' && job.state === 'transferring' ? 'remote_outcome_unknown' :
        reason === 'user' ? 'cancelled' : reason === 'shutdown' ? 'interrupted' : 'failed', reason});
    }
  }

  status(id: string): JobStatus {
    this.assertOpen();
    const job = this.journal.find('id',uuid.parse(id));
    if (!job) throw new Error('Unknown transfer ID');
    return view(job);
  }
  async cancel(id: string): Promise<JobStatus> {
    const job = this.status(id);
    if (this.active?.id === job.id) {
      this.active.controller.abort('user');
      await this.active.done;
    }
    return this.status(job.id);
  }
  close(): Promise<void> {
    if (!this.closing) {
      this.active?.controller.abort('shutdown');
      this.closing = Promise.resolve(this.active?.done).finally(() => this.journal.close());
    }
    return this.closing;
  }
}
