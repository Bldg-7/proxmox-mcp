import { createHash } from 'node:crypto';
import { Client, type ConnectConfig } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SshClient, getSshClient, closeSshClient } from '../ssh.js';
import { configSchema } from '../../config/schema.js';

const key = Buffer.from('mock SSH server public key');
const digest = createHash('sha256').update(key).digest();
const fingerprint = `SHA256:${digest.toString('base64').replace(/=+$/, '')}`;
const base = { host:'invalid.example', port:22, username:'root', privateKeyPath:'package.json' };
const baseConfig = { host:'invalid.example', tokenName:'test', tokenValue:'dummy' };
afterEach(() => { closeSshClient(); vi.restoreAllMocks(); });

describe('SSH host identity verification', () => {
  it('requires explicit trust before any network connection', () => {
    const connect = vi.spyOn(Client.prototype, 'connect');
    expect(() => new SshClient(base)).toThrow('PROXMOX_SSH_HOST_KEY_FINGERPRINT');
    expect(connect).not.toHaveBeenCalled();
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
    closeSshClient();
    expect(getSshClient({...base,hostKeyFingerprint:fingerprint})).not.toBe(first);
  });

  it('defaults to secure mode and rejects enabled SSH without a fingerprint', () => {
    expect(configSchema.parse(baseConfig).sshAllowInsecure).toBe(false);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true}).success).toBe(false);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshAllowInsecure:true}).success).toBe(true);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshHostKeyFingerprint:fingerprint}).success).toBe(true);
    expect(configSchema.safeParse({...baseConfig,sshEnabled:true,sshAllowInsecure:true,sshHostKeyFingerprint:'invalid'}).success).toBe(false);
  });
});
