// Design probe only. Uses loopback HTTP, a temporary directory and synthetic bytes.
// Run from repository root: node docs/bug-reports/evidence/file-transfer-feasibility.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, open, symlink, link, unlink, readFile, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { request, Agent } from 'undici';

const root = await mkdtemp(join(tmpdir(), 'proxmox-transfer-probe-'));
const agent = new Agent();
const bytes = randomBytes(256 * 1024 + 17);
const digest = data => createHash('sha256').update(data).digest('hex');
const boundary = `probe-${randomBytes(24).toString('hex')}`;
const parts = [
  ['content', 'iso'], ['checksum-algorithm', 'sha256'], ['checksum', digest(bytes)],
];
const prefix = Buffer.from(parts.map(([name, value]) =>
  `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
).join('') + `--${boundary}\r\nContent-Disposition: form-data; name="filename"; filename="probe.iso"\r\nContent-Type: application/octet-stream\r\n\r\n`);
const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
let uploaded = false;
let redirected = false;
let serverFailure;
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/upload') {
      assert.equal(req.headers['content-length'], String(prefix.length + bytes.length + suffix.length));
      assert.equal(req.headers['transfer-encoding'], undefined);
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk); // Tiny fixture only; not a production upload parser.
      const body = Buffer.concat(chunks);
      assert.deepEqual(body.subarray(0, prefix.length), prefix);
      assert.deepEqual(body.subarray(prefix.length, -suffix.length), bytes);
      assert.deepEqual(body.subarray(-suffix.length), suffix);
      uploaded = true;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({data:'UPID:probe:1:1:1:imgcopy::root@pam!test:'}));
    } else if (req.url === '/redirect') {
      res.writeHead(302, {location:'/must-not-follow'}); res.end();
    } else if (req.url === '/must-not-follow') {
      redirected = true; res.end('unexpected');
    } else {
      res.writeHead(200, {'content-type':'application/octet-stream', connection:'close'});
      res.write(bytes.subarray(0, 1024));
      res.end(bytes.subarray(1024)); // No Content-Length, matching close-delimited restore streams.
    }
  } catch (error) { serverFailure = error; res.writeHead(500); res.end('probe failed'); }
});
let source;
let output;
try {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const input = join(root, 'input.iso');
  source = await open(input, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR, 0o600);
  await source.writeFile(bytes);
  await source.close(); source = undefined;
  source = await open(input, constants.O_RDONLY | constants.O_NOFOLLOW);
  assert.equal((await source.stat()).isFile(), true);
  const upload = await request(`${base}/upload`, {
    dispatcher:agent, method:'POST', maxRedirections:0,
    headers:{'content-type':`multipart/form-data; boundary=${boundary}`, 'content-length':String(prefix.length + bytes.length + suffix.length)},
    body:(async function* () {
      yield prefix;
      yield* source.createReadStream({start:0, autoClose:false, highWaterMark:16384});
      yield suffix;
    })(),
  });
  assert.equal(upload.statusCode, 200);
  assert.match((await upload.body.json()).data, /^UPID:/);
  assert.equal(uploaded, true);
  assert.equal(serverFailure, undefined);

  const download = await request(`${base}/download`, {dispatcher:agent, headers:{'accept-encoding':'identity'}, maxRedirections:0});
  assert.equal(download.headers['content-length'], undefined);
  const partial = join(root, 'download.partial');
  const final = join(root, 'artifact.bin');
  output = await open(partial, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  let count = 0;
  for await (const chunk of download.body) {
    count += chunk.length;
    assert.ok(count <= 1024 * 1024);
    await output.writeFile(chunk);
  }
  await output.sync(); await output.close(); output = undefined;
  await link(partial, final); // Same filesystem, atomic publish without overwriting an existing path.
  await assert.rejects(link(partial, final), {code:'EEXIST'});
  await unlink(partial);
  assert.deepEqual(await readFile(final), bytes);

  await symlink(input, join(root, 'symlink.iso'));
  await assert.rejects(open(join(root, 'symlink.iso'), constants.O_RDONLY | constants.O_NOFOLLOW), {code:'ELOOP'});
  const redirect = await request(`${base}/redirect`, {dispatcher:agent,maxRedirections:0});
  assert.equal(redirect.statusCode, 302);
  await redirect.body.dump();
  assert.equal(redirected, false);
  console.log(JSON.stringify({node:process.version, uploadContentLength:true, multipartOrderAndBytes:true,
    closeDelimitedBinaryDownload:true, byteCount:count, sha256:digest(bytes), noOverwrite:true,
    finalSymlinkRejected:true, redirectsNotFollowed:true, realPveContacted:false}, null, 2));
} finally {
  await source?.close(); await output?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await agent.close();
  await rm(root, {recursive:true,force:true});
}
