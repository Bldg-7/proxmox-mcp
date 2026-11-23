import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { utils } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from './index.js';

vi.mock('dotenv', () => ({default:{config:vi.fn()}}));
afterEach(() => vi.unstubAllEnvs());

describe('file transfer opt-in', () => {
  it('requires literal true, elevated access, private root settings and positive limits', () => {
    vi.stubEnv('PROXMOX_HOST','example.invalid'); vi.stubEnv('PROXMOX_TOKEN_NAME','test'); vi.stubEnv('PROXMOX_TOKEN_VALUE','dummy');
    vi.stubEnv('PROXMOX_FILE_TRANSFER_ENABLED','TRUE');
    expect(loadConfig().fileTransfer).toBeUndefined();
    vi.stubEnv('PROXMOX_FILE_TRANSFER_ENABLED','true'); vi.stubEnv('PROXMOX_ALLOW_ELEVATED','false');
    vi.stubEnv('PROXMOX_TRANSFER_ROOT','/managed'); vi.stubEnv('PROXMOX_TRANSFER_JOURNAL_ROOT','/journal');
    expect(() => loadConfig()).toThrow('PROXMOX_ALLOW_ELEVATED');
    vi.stubEnv('PROXMOX_ALLOW_ELEVATED','true'); vi.stubEnv('PROXMOX_DOWNLOAD_MAX_BYTES','4junk');
    expect(() => loadConfig()).toThrow('downloadMaxBytes');
    vi.stubEnv('PROXMOX_DOWNLOAD_MAX_BYTES','16');
    expect(loadConfig().fileTransfer).toMatchObject({transferRoot:'/managed',journalRoot:'/journal',downloadMaxBytes:16});
  });
});

describe('SSH environment trust policy', () => {
  let home: string | undefined;
  afterEach(() => { if (home) rmSync(home, { recursive: true, force: true }); home = undefined; });

  it('requires a pin, a known_hosts entry or explicit true insecure opt-in when SSH is enabled', () => {
    home = mkdtempSync(join(tmpdir(), 'config-home-'));
    vi.stubEnv('HOME', home);
    vi.stubEnv('PROXMOX_HOST','example.invalid');
    vi.stubEnv('PROXMOX_TOKEN_NAME','test');
    vi.stubEnv('PROXMOX_TOKEN_VALUE','test-only-value');
    vi.stubEnv('PROXMOX_SSH_ENABLED','true');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT','');
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','false');
    expect(() => loadConfig()).toThrow(/known_hosts.*PROXMOX_SSH_HOST_KEY_FINGERPRINT/s);
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','TRUE');
    expect(() => loadConfig()).toThrow('PROXMOX_SSH_HOST_KEY_FINGERPRINT');
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','true');
    expect(loadConfig().sshAllowInsecure).toBe(true);
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','false');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT','a'.repeat(64));
    expect(loadConfig().sshHostKeyFingerprint).toBe('a'.repeat(64));
  });

  it('accepts a known_hosts entry for the SSH host from the default or an explicit file', () => {
    home = mkdtempSync(join(tmpdir(), 'config-home-'));
    vi.stubEnv('HOME', home);
    vi.stubEnv('PROXMOX_HOST','api.example.invalid');
    vi.stubEnv('PROXMOX_TOKEN_NAME','test');
    vi.stubEnv('PROXMOX_TOKEN_VALUE','test-only-value');
    vi.stubEnv('PROXMOX_SSH_ENABLED','true');
    vi.stubEnv('PROXMOX_SSH_HOST','ssh.example.invalid');
    vi.stubEnv('PROXMOX_SSH_PORT','2222');
    const [type, key] = utils.generateKeyPairSync('ed25519').public.split(' ');

    mkdirSync(join(home, '.ssh'));
    writeFileSync(join(home, '.ssh', 'known_hosts'), `api.example.invalid ${type} ${key}\n`);
    expect(() => loadConfig()).toThrow('No usable SSH host key for [ssh.example.invalid]:2222');
    writeFileSync(join(home, '.ssh', 'known_hosts'), `[ssh.example.invalid]:2222 ${type} ${key}\n`);
    expect(loadConfig().sshEnabled).toBe(true);

    const explicit = join(home, 'pve_known_hosts');
    writeFileSync(explicit, `other.invalid ${type} ${key}\n`);
    vi.stubEnv('PROXMOX_SSH_KNOWN_HOSTS', explicit);
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE', 'true');
    expect(() => loadConfig()).toThrow('No usable SSH host key');
    vi.stubEnv('PROXMOX_SSH_KNOWN_HOSTS', '~/.ssh/known_hosts');
    expect(loadConfig().sshKnownHostsPath).toBe('~/.ssh/known_hosts');
  });
});
