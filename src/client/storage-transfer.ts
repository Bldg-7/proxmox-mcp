import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import type { Dispatcher } from 'undici';
import { validateNodeName, validateStorageName, validateUpid } from '../validators/index.js';

interface Target { node: string; storage: string }
interface RestoreTarget extends Target { volume: string; filepath: string }
interface Snapshot extends Target {
  content: 'iso' | 'vztmpl'; filename: string; size: number; sha256: string;
  bytes: AsyncIterable<Uint8Array>;
}

function storagePath({ node, storage }: Target): string {
  if (storage === '.' || storage === '..') throw new Error('Invalid storage identifier');
  return `/api2/json/nodes/${validateNodeName(node)}/storage/${validateStorageName(storage)}`;
}

function restorePath(target: RestoreTarget, operation: 'list' | 'download'): string {
  return `${storagePath(target)}/file-restore/${operation}?${new URLSearchParams({ volume: target.volume, filepath: target.filepath })}`;
}

function discardBody(body: Dispatcher.ResponseData['body']): void {
  if (body.destroyed) return;
  // Destroying an unread undici response emits UND_ERR_ABORTED even without an error argument.
  body.once('error', () => undefined);
  body.destroy();
}

function checkHeaders(response: Dispatcher.ResponseData, mime: string): void {
  const { statusCode, headers, body } = response;
  const contentType = String(headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (statusCode !== 200 || contentType !== mime || (headers['content-encoding'] ?? 'identity') !== 'identity') {
    // Never expose an arbitrary binary/error body or forward credentials to a redirect.
    discardBody(body);
    throw new Error(`Unexpected storage API response (HTTP ${statusCode}; expected ${mime}, identity encoding)`);
  }
}

async function readEnvelope(response: Dispatcher.ResponseData, limit: number): Promise<unknown> {
  checkHeaders(response, 'application/json');
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > limit) throw new Error('Storage API JSON response exceeds size limit');
      chunks.push(chunk);
    }
  } finally { discardBody(response.body); }
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('Invalid storage API JSON response'); }
  if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) throw new Error('Missing storage API data');
  return parsed.data;
}

/** Low-level PVE adapter; upload source and download sink policy belong to the local transfer service. */
export class StorageTransferClient {
  constructor(private readonly origin: string, private readonly dispatcher: Dispatcher, private readonly authorization: string) {}

  private send(path: string, options: Pick<Dispatcher.RequestOptions, 'method' | 'body' | 'signal'>, headers: Record<string, string> = {}): Promise<Dispatcher.ResponseData> {
    // The shared undici Agent issues exactly one request (no redirect/retry interceptor).
    return this.dispatcher.request({ origin: this.origin, path, ...options, idempotent: false,
      headersTimeout: 60_000, bodyTimeout: 60_000,
      headers: { authorization: this.authorization, 'accept-encoding': 'identity', ...headers },
    });
  }

  async list(target: RestoreTarget): Promise<unknown> {
    return readEnvelope(await this.send(restorePath(target, 'list'), { method: 'GET', signal: AbortSignal.timeout(30_000) }), 1024 * 1024);
  }

  /** Best effort only: PVE has no atomic create-if-absent upload endpoint. */
  async assertUploadAvailable(target: Target, content: 'iso' | 'vztmpl', filename: string, signal: AbortSignal): Promise<void> {
    const response = await this.send(`${storagePath(target)}/content?${new URLSearchParams({content})}`, {method:'GET', signal});
    const entries = await readEnvelope(response, 1024 * 1024);
    if (!Array.isArray(entries)) throw new Error('Invalid storage content listing');
    for (const item of entries) {
      if (!item || typeof item.volid !== 'string') throw new Error('Invalid storage content entry');
      if (item.volid === `${target.storage}:${content}/${filename}`) throw new Error('Generated upload filename already exists');
    }
  }

  async upload(snapshot: Snapshot, signal: AbortSignal): Promise<string> {
    const path = `${storagePath(snapshot)}/upload`;
    if (!Number.isSafeInteger(snapshot.size) || snapshot.size <= 0 || !/^[a-f0-9]{64}$/.test(snapshot.sha256) ||
      !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,254}$/.test(snapshot.filename) || !['iso', 'vztmpl'].includes(snapshot.content)) {
      throw new Error('Invalid upload snapshot metadata');
    }
    const boundary = `pve-mcp-${randomUUID()}`;
    const fields = [['content', snapshot.content], ['checksum-algorithm', 'sha256'], ['checksum', snapshot.sha256]];
    const prefix = Buffer.from(fields.map(([name, value]) =>
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`).join('') +
      `--${boundary}\r\nContent-Disposition: form-data; name="filename"; filename="${snapshot.filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
    const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
    const length = prefix.length + snapshot.size + suffix.length;
    if (!Number.isSafeInteger(length)) throw new Error('Invalid multipart length');
    const body = Readable.from((async function* (): AsyncGenerator<Uint8Array> {
      yield prefix;
      let count = 0;
      for await (const chunk of snapshot.bytes) {
        signal.throwIfAborted(); count += chunk.byteLength;
        if (count > snapshot.size) throw new Error('Snapshot size changed');
        yield chunk;
      }
      if (count !== snapshot.size) throw new Error('Snapshot size changed');
      yield suffix;
    })(), { objectMode: false });
    try {
      const upid = await readEnvelope(await this.send(path, { method: 'POST', body, signal }, {
        'content-length': String(length), 'content-type': `multipart/form-data; boundary=${boundary}`,
      }), 64 * 1024);
      if (typeof upid !== 'string' || !upid.startsWith('UPID:')) throw new Error('Expected an upload task UPID');
      return validateUpid(upid);
    } finally { body.destroy(); }
  }

  /** Pull-driven: the consumer owns the iteration; break/error/cancel releases the HTTP body. */
  async *download(target: RestoreTarget, tar: boolean, maxBytes: number, signal: AbortSignal): AsyncGenerator<Buffer> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('Invalid download limit');
    const response = await this.send(`${restorePath(target, 'download')}&tar=${tar ? 1 : 0}`, { method: 'GET', signal });
    checkHeaders(response, 'application/octet-stream');
    const raw = response.headers['content-length'];
    const expected = raw === undefined ? undefined : Number(raw);
    let count = 0;
    try {
      if (expected !== undefined && (!Number.isSafeInteger(expected) || expected < 0 || expected > maxBytes)) throw new Error('Invalid or excessive download length');
      for await (const chunk of response.body) {
        count += chunk.length;
        if (count > maxBytes) throw new Error('Download exceeds byte limit');
        yield chunk;
      }
      if (expected !== undefined && count !== expected) throw new Error('Download length mismatch');
    } finally { discardBody(response.body); }
  }
}
