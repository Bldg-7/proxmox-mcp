import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client, utils, type ConnectConfig } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SshClient, getSshClient, closeSshClient } from '../ssh.js';
import { configSchema } from '../../config/schema.js';

const key = Buffer.from('mock SSH server public key');
const digest = createHash('sha256').update(key).digest();
const fingerprint = `SHA256:${digest.toString('base64').replace(/=+$/, '')}`;
const base = { host:'invalid.example', port:22, username:'root', privateKeyPath:'package.json' };
const baseConfig = { host:'invalid.example', tokenName:'test', tokenValue:'dummy' };
let home: string;
afterEach(() => {
  closeSshClient(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  if (home) rmSync(home, { recursive: true, force: true });
});
function emptyHome(): string {
  home = mkdtempSync(join(tmpdir(), 'ssh-security-home-'));
  vi.stubEnv('HOME', home);
  return home;
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
  it('requires a trust source before any network connection', () => {
    emptyHome();
    const connect = vi.spyOn(Client.prototype, 'connect');
    expect(() => new SshClient(base)).toThrow(/known_hosts.*PROXMOX_SSH_HOST_KEY_FINGERPRINT/s);
    expect(connect).not.toHaveBeenCalled();
  });

  it('re-reads known_hosts for each new connection and limits host key types', async () => {
    const first = utils.generateKeyPairSync('ed25519').public.split(' ');
    const second = utils.generateKeyPairSync('rsa', { bits: 2048 }).public.split(' ');
    const path = join(emptyHome(), 'known_hosts');
    writeFileSync(path, `invalid.example ${first[0]} ${first[1]}\n`);
    const calls = mockConnect();
    const ssh = new SshClient({ ...base, knownHostsPath: path });
    try {
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      writeFileSync(path, `invalid.example ${second[0]} ${second[1]}\n`);
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      const [before, after] = calls.map(call => call.hostVerifier as (key: Buffer) => boolean);
      expect(before(Buffer.from(first[1], 'base64'))).toBe(true);
      expect(after(Buffer.from(first[1], 'base64'))).toBe(false);
      expect(after(Buffer.from(second[1], 'base64'))).toBe(true);
      expect(calls.map(call => call.algorithms?.serverHostKey))
        .toEqual([['ssh-ed25519'], ['rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']]);
    } finally { ssh.close(); }
  });

  it.each(['SHA256:bad', 'md5:00:11', '', 'a'.repeat(63)])('rejects malformed fingerprint %s even in insecure mode', value => {
    expect(() => new SshClient({...base, hostKeyFingerprint:value, allowInsecure:true})).toThrow('Invalid SSH fingerprint');
  });

  it.each([fingerprint, digest.toString('hex'), digest.toString('hex').toUpperCase()])('verifies raw ssh2 Buffer for %s', async value => {
    let options: ConnectConfig | undefined;
    vi.spyOn(Client.prototype, 'connect').mockImplementation(function(this: Client, config) {
      options = config;
      queueMicrotask(() => this.emit('error', new Error('mock: no network')));
      return this;
    });
    const ssh = new SshClient({...base,hostKeyFingerprint:value,allowInsecure:true});
    try {
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      expect(options?.hostHash).toBeUndefined();
      const verify = options?.hostVerifier as (key: Buffer) => boolean;
      expect(verify(key)).toBe(true);
      expect(verify(Buffer.from('attacker key'))).toBe(false);
    } finally { ssh.close(); }
  });

  it('only omits verifier for explicit insecure opt-in', async () => {
    emptyHome();
    let options: ConnectConfig | undefined;
    vi.spyOn(Client.prototype, 'connect').mockImplementation(function(this: Client, config) {
      options = config;
      queueMicrotask(() => this.emit('error', new Error('mock: no network')));
      return this;
    });
    const ssh = new SshClient({...base,allowInsecure:true});
    try {
      await expect(ssh.exec('true')).rejects.toThrow('mock: no network');
      expect(options?.hostVerifier).toBeUndefined();
    } finally { ssh.close(); }
  });

  it('does not silently reuse an insecure cached connection for a pinned configuration', () => {
    const first = getSshClient({...base,allowInsecure:true});
    expect(getSshClient({...base,allowInsecure:true})).toBe(first);
    expect(() => getSshClient({...base,hostKeyFingerprint:fingerprint})).toThrow('SSH configuration changed');
    expect(() => getSshClient({...base,allowInsecure:true,knownHostsPath:'/etc/ssh/ssh_known_hosts'})).toThrow('SSH configuration changed');
    closeSshClient();
    expect(getSshClient({...base,hostKeyFingerprint:fingerprint})).not.toBe(first);
  });

  it('defaults to secure mode and validates trust settings in the schema', () => {
    expect(configSchema.parse(baseConfig).sshAllowInsecure).toBe(false);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshHostKeyFingerprint:fingerprint}).success).toBe(true);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshAllowInsecure:true,sshHostKeyFingerprint:'invalid'}).success).toBe(false);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshKnownHostsPath:'known_hosts'}).success).toBe(false);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshKnownHostsPath:'~/.ssh/known_hosts'}).success).toBe(true);
  });
});
