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

describe('SSH host key trust', () => {
  let home: string | undefined;
  afterEach(() => { if (home) rmSync(home, { recursive: true, force: true }); home = undefined; });

  it('requires a ~/.ssh/known_hosts entry for the SSH host and port at startup', () => {
    home = mkdtempSync(join(tmpdir(), 'config-home-'));
    vi.stubEnv('HOME', home);
    vi.stubEnv('PROXMOX_HOST','api.example.invalid');
    vi.stubEnv('PROXMOX_TOKEN_NAME','test');
    vi.stubEnv('PROXMOX_TOKEN_VALUE','test-only-value');
    vi.stubEnv('PROXMOX_SSH_ENABLED','true');
    vi.stubEnv('PROXMOX_SSH_HOST','ssh.example.invalid');
    vi.stubEnv('PROXMOX_SSH_PORT','2222');
    // Removed settings must not bypass the check.
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','true');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT','a'.repeat(64));
    expect(() => loadConfig()).toThrow(/known_hosts, but it does not exist/);

    const [type, key] = utils.generateKeyPairSync('ed25519').public.split(' ');
    mkdirSync(join(home, '.ssh'));
    writeFileSync(join(home, '.ssh', 'known_hosts'), `api.example.invalid ${type} ${key}\n`);
    expect(() => loadConfig()).toThrow('No usable SSH host key for [ssh.example.invalid]:2222');
    writeFileSync(join(home, '.ssh', 'known_hosts'), `[ssh.example.invalid]:2222 ${type} ${key}\n`);
    expect(loadConfig().sshEnabled).toBe(true);
  });

  it('does not read known_hosts when SSH is disabled', () => {
    home = mkdtempSync(join(tmpdir(), 'config-home-'));
    vi.stubEnv('HOME', home);
    vi.stubEnv('PROXMOX_HOST','api.example.invalid');
    vi.stubEnv('PROXMOX_TOKEN_NAME','test');
    vi.stubEnv('PROXMOX_TOKEN_VALUE','test-only-value');
    vi.stubEnv('PROXMOX_SSH_ENABLED','false');
    expect(loadConfig().sshEnabled).toBe(false);
  });
});
