// Real SSH handshakes against a local ssh2 server on 127.0.0.1. No Proxmox or external network.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Server, utils } from 'ssh2';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SshClient } from '../ssh.js';

const hostEd25519 = utils.generateKeyPairSync('ed25519');
const hostRsa = utils.generateKeyPairSync('rsa', { bits: 2048 });
const clientKey = utils.generateKeyPairSync('ed25519');
const stranger = utils.generateKeyPairSync('ed25519');
const entry = (name: string, publicKey: string): string => `${name} ${publicKey.split(' ').slice(0, 2).join(' ')}\n`;

let server: Server;
let port: number;
let dir: string;
let keyPath: string;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'ssh-known-hosts-'));
  keyPath = join(dir, 'id_ed25519');
  writeFileSync(keyPath, clientKey.private, { mode: 0o600 });
  // The server can present either key; the client decides which type it accepts.
  server = new Server({ hostKeys: [hostEd25519.private, hostRsa.private] }, client => {
    client.on('authentication', ctx => (ctx.method === 'publickey' ? ctx.accept() : ctx.reject(['publickey'])));
    client.on('error', () => undefined);
    client.on('ready', () => {
      client.on('session', accept => {
        accept().on('exec', (acceptExec, _reject, info) => {
          const stream = acceptExec();
          stream.write(`ran:${info.command}`);
          stream.exit(0);
          stream.end();
        });
      });
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  port = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
  rmSync(dir, { recursive: true, force: true });
});

async function runWith(knownHosts: string): Promise<string> {
  const path = join(dir, `known_hosts_${Math.random().toString(16).slice(2)}`);
  writeFileSync(path, knownHosts);
  const ssh = new SshClient({ host: '127.0.0.1', port, username: 'root', privateKeyPath: keyPath, knownHostsPath: path });
  try {
    return (await ssh.exec('echo ok', 10)).stdout;
  } finally {
    ssh.close();
  }
}

describe('SSH known_hosts verification (real handshake)', () => {
  it('connects when known_hosts holds the ed25519 host key', async () => {
    await expect(runWith(entry(`[127.0.0.1]:${port}`, hostEd25519.public))).resolves.toBe('ran:echo ok');
  });

  it('negotiates RSA when known_hosts holds only the RSA key, even though the server prefers ed25519', async () => {
    await expect(runWith(entry(`[127.0.0.1]:${port}`, hostRsa.public))).resolves.toBe('ran:echo ok');
  });

  it('rejects a server whose key differs from known_hosts', async () => {
    await expect(runWith(entry(`[127.0.0.1]:${port}`, stranger.public))).rejects.toThrow('SSH connection failed');
  });

  it('rejects a revoked host key', async () => {
    const text = entry(`[127.0.0.1]:${port}`, hostEd25519.public) + `@revoked ${entry('*', hostEd25519.public)}`;
    await expect(runWith(text)).rejects.toThrow('SSH connection failed');
  });

  it('refuses to start without an entry for the host and port', () => {
    const path = join(dir, 'known_hosts_other_port');
    writeFileSync(path, entry('127.0.0.1', hostEd25519.public));
    expect(() => new SshClient({ host: '127.0.0.1', port, username: 'root', privateKeyPath: keyPath, knownHostsPath: path }))
      .toThrow(`No usable SSH host key for [127.0.0.1]:${port}`);
  });
});
