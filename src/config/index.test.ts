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
  it('requires a pin or explicit true insecure opt-in when SSH is enabled', () => {
    vi.stubEnv('PROXMOX_HOST','example.invalid');
    vi.stubEnv('PROXMOX_TOKEN_NAME','test');
    vi.stubEnv('PROXMOX_TOKEN_VALUE','test-only-value');
    vi.stubEnv('PROXMOX_SSH_ENABLED','true');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT','');
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','false');
    expect(() => loadConfig()).toThrow('PROXMOX_SSH_HOST_KEY_FINGERPRINT');
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','TRUE');
    expect(() => loadConfig()).toThrow('PROXMOX_SSH_HOST_KEY_FINGERPRINT');
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','true');
    expect(loadConfig().sshAllowInsecure).toBe(true);
    vi.stubEnv('PROXMOX_SSH_ALLOW_INSECURE','false');
    vi.stubEnv('PROXMOX_SSH_HOST_KEY_FINGERPRINT','a'.repeat(64));
    expect(loadConfig().sshHostKeyFingerprint).toBe('a'.repeat(64));
  });
});
