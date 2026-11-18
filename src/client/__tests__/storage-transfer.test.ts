import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type RequestListener } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createHash } from 'node:crypto';
import { Agent } from 'undici';
import { StorageTransferClient } from '../storage-transfer.js';

const target = { node: 'lab', storage: 'pbs', volume: 'pbs:backup/vm/100/t', filepath: '/+8=' };
const cleanup: (() => Promise<void>)[] = [];
async function serve(handler: RequestListener): Promise<StorageTransferClient> {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const agent = new Agent();
  cleanup.push(async () => { await agent.destroy(); server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); });
  return new StorageTransferClient(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, agent, 'PVEAPIToken=test');
}
afterEach(async () => { for (const fn of cleanup.splice(0)) await fn(); });

async function collect(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

describe('storage wire contract (loopback only)', () => {
  it('preserves an opaque ID through URL encoding and uses token auth', async () => {
    let url = '', auth = '';
    const client = await serve((req, res) => {
      url = req.url!; auth = req.headers.authorization!;
      res.writeHead(200, {'content-type':'application/json; charset=UTF-8'}); res.end('{"data":[]}');
    });
    expect(await client.list(target)).toEqual([]);
    expect(url).toBe('/api2/json/nodes/lab/storage/pbs/file-restore/list?volume=pbs%3Abackup%2Fvm%2F100%2Ft&filepath=%2F%2B8%3D');
    expect(auth).toBe('PVEAPIToken=test');
  });

  it('emits a known-length multipart POST, ordered fields and exact file bytes', async () => {
    const data = Buffer.from([0, 255, 13, 10, 42]);
    const sha256 = createHash('sha256').update(data).digest('hex');
    let raw = Buffer.alloc(0), length = '', mime = '', url = '', method = '', chunked: string | undefined;
    const client = await serve(async (req, res) => {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      raw = Buffer.concat(chunks); length = req.headers['content-length']!; mime = req.headers['content-type']!;
      chunked = req.headers['transfer-encoding']; url = req.url!; method = req.method!;
      res.writeHead(200, {'content-type':'application/json'}); res.end('{"data":"UPID:lab:123:"}');
    });
    const upid = await client.upload({ ...target, content:'iso', filename:'probe.iso', size:data.length, sha256,
      bytes:(async function* (): AsyncGenerator<Uint8Array> { yield data.subarray(0,2); yield data.subarray(2); })(),
    }, AbortSignal.timeout(5000));
    expect(upid).toBe('UPID:lab:123:'); expect(method).toBe('POST');
    expect(url).toBe('/api2/json/nodes/lab/storage/pbs/upload');
    expect(chunked).toBeUndefined(); expect(Number(length)).toBe(raw.length);
    const boundary = mime.split('boundary=')[1];
    const text = raw.toString('latin1');
    expect(text.split(`--${boundary}`).slice(1,-1).map(part => part.match(/name="([^"]+)"/)?.[1]))
      .toEqual(['content','checksum-algorithm','checksum','filename']);
    expect(text).toContain(sha256); expect(text).toContain(`filename="probe.iso"\r\nContent-Type: application/octet-stream\r\n\r\n${data.toString('latin1')}\r\n--${boundary}--`);
  });

  it('reads binary (not JSON) without Content-Length, checking the running byte limit', async () => {
    const payload = Buffer.from([123,255,0,33]);
    const client = await serve((_req, res) => {
      res.writeHead(200, {'content-type':'application/octet-stream',connection:'close'});
      res.write(payload.subarray(0,2)); res.end(payload.subarray(2));
    });
    expect(await collect(client.download(target,false,4,AbortSignal.timeout(5000)))).toEqual(payload);
    await expect(collect(client.download(target,false,3,AbortSignal.timeout(5000)))).rejects.toThrow('byte limit');
  });

  it.each([['application/json','identity'],['application/octet-stream','gzip']])('rejects unexpected binary headers %s/%s', async (mime,encoding) => {
    const client = await serve((_req, res) => { res.writeHead(200, {'content-type':mime,'content-encoding':encoding}); res.end('{}'); });
    await expect(collect(client.download(target,false,10,AbortSignal.timeout(5000)))).rejects.toThrow('Unexpected storage API response');
  });

  it('aborts an in-flight download', async () => {
    const client = await serve((_req,res) => { res.writeHead(200,{'content-type':'application/octet-stream'}); res.write('x'); });
    const controller = new AbortController();
    const stream = client.download(target,false,10,controller.signal);
    expect((await stream.next()).value).toEqual(Buffer.from('x'));
    controller.abort(); await expect(stream.next()).rejects.toThrow();
  });

  it('rejects truncated fixed-length binary', async () => {
    const client = await serve((_req,res) => {
      res.writeHead(200,{'content-type':'application/octet-stream','content-length':20,connection:'close'}); res.end('short');
    });
    await expect(collect(client.download(target,false,100,AbortSignal.timeout(5000)))).rejects.toThrow();
  });

  it('never follows redirects', async () => {
    const paths: string[] = [];
    const client = await serve((req,res) => { paths.push(req.url!); res.writeHead(302,{location:'/elsewhere'}); res.end(); });
    await expect(client.list(target)).rejects.toThrow('HTTP 302'); expect(paths).toHaveLength(1);
  });

  it('rejects oversized listing data while consuming the stream', async () => {
    const client = await serve((_req,res) => { res.writeHead(200,{'content-type':'application/json'}); res.end('x'.repeat(1024*1024+1)); });
    await expect(client.list(target)).rejects.toThrow('exceeds size limit');
  });
});
