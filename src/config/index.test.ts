import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from './index.js';

vi.mock('dotenv', () => ({default:{config:vi.fn()}}));
afterEach(() => vi.unstubAllEnvs());

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
