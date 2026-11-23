import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client, utils, type ConnectConfig } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SshClient, getSshClient, closeSshClient } from '../ssh.js';

const base = { host:'invalid.example', port:22, username:'root', privateKeyPath:'package.json' };
const ed25519 = utils.generateKeyPairSync('ed25519').public.split(' ');
const rsa = utils.generateKeyPairSync('rsa', { bits: 2048 }).public.split(' ');

let home: string | undefined;
afterEach(() => {
  closeSshClient(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  if (home) rmSync(home, { recursive: true, force: true });
  home = undefined;
});
/** Point HOME at a fresh directory and return the path of its ~/.ssh/known_hosts. */
function useHome(): string {
  home = mkdtempSync(join(tmpdir(), 'ssh-security-home-'));
  vi.stubEnv('HOME', home);
  mkdirSync(join(home, '.ssh'));
  return join(home, '.ssh', 'known_hosts');
}
function mockConnect(): ConnectConfig[] {
  const calls: ConnectConfig[] = [];
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function(this: Client, config) {
    calls.push(config);
    queueMicrotask(() => this.emit('error', new Error('mock: no network')));
    return this;
  });
  return calls;
}

describe('SSH host identity verification', () => {
  it('requires a known_hosts entry before any network connection', () => {
    const path = useHome();
    const connect = vi.spyOn(Client.prototype, 'connect');
    expect(() => new SshClient(base)).toThrow('does not exist');
    writeFileSync(path, `other.example ${ed25519[0]} ${ed25519[1]}\n`);
    expect(() => new SshClient(base)).toThrow('No usable SSH host key for invalid.example');
    expect(connect).not.toHaveBeenCalled();
  });

  it('ignores the removed fingerprint and insecure settings', () => {
    useHome();
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE', 'true');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT', 'a'.repeat(64));
    expect(() => new SshClient(base)).toThrow('does not exist');
  });

  it('re-reads known_hosts for each new connection and limits host key types', async () => {
    const path = useHome();
    writeFileSync(path, `invalid.example ${ed25519[0]} ${ed25519[1]}\n`);
    const calls = mockConnect();
    const ssh = new SshClient(base);
    try {
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      writeFileSync(path, `invalid.example ${rsa[0]} ${rsa[1]}\n`);
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      const [before, after] = calls.map(call => call.hostVerifier as (key: Buffer) => boolean);
      expect(calls[0].hostHash).toBeUndefined();
      expect(before(Buffer.from(ed25519[1], 'base64'))).toBe(true);
      expect(after(Buffer.from(ed25519[1], 'base64'))).toBe(false);
      expect(after(Buffer.from(rsa[1], 'base64'))).toBe(true);
      expect(calls.map(call => call.algorithms?.serverHostKey))
        .toEqual([['ssh-ed25519'], ['rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']]);
    } finally { ssh.close(); }
  });

  it('does not silently reuse a cached connection for another host', () => {
    const path = useHome();
    writeFileSync(path, `invalid.example,other.example ${ed25519[0]} ${ed25519[1]}\n`);
    const first = getSshClient(base);
    expect(getSshClient(base)).toBe(first);
    expect(() => getSshClient({...base, host:'other.example'})).toThrow('SSH configuration changed');
    closeSshClient();
    expect(getSshClient({...base, host:'other.example'})).not.toBe(first);
  });
});
