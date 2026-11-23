import { createHash, timingSafeEqual } from 'node:crypto';
import {
  defaultKnownHostsPath, expandKnownHostsPath, loadKnownHostKeys, matchesKnownHostKey,
} from './known-hosts.js';

/** Accept OpenSSH SHA256:<base64> (without padding), or a 64-digit SHA-256 hex digest. */
export function parseHostFingerprint(value: string): Buffer {
  if (/^[a-fA-F0-9]{64}$/.test(value)) return Buffer.from(value, 'hex');
  if (/^SHA256:[A-Za-z0-9+/]{43}$/.test(value)) {
    const digest = Buffer.from(value.slice(7), 'base64');
    if (digest.length === 32 && digest.toString('base64').replace(/=+$/, '') === value.slice(7)) return digest;
  }
  throw new Error('Invalid SSH fingerprint: expected OpenSSH SHA256:<base64> or 64-digit SHA-256 hex');
}

export function verifyHostKey(key: Buffer, expected: Buffer): boolean {
  const actual = createHash('sha256').update(key).digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export interface HostTrustOptions {
  host: string;
  port: number;
  hostKeyFingerprint?: string;
  /** Explicit known_hosts file. Always checked, even when allowInsecure is true. */
  knownHostsPath?: string;
  allowInsecure?: boolean;
}

export type HostTrust =
  | { mode: 'fingerprint'; verify: (key: Buffer) => boolean }
  | { mode: 'known_hosts'; path: string; verify: (key: Buffer) => boolean; algorithms: string[] }
  | { mode: 'insecure' };

/**
 * Pick the host key trust source, in this order:
 * 1. PROXMOX_SSH_HOST_KEY_FINGERPRINT
 * 2. PROXMOX_SSH_KNOWN_HOSTS
 * 3. PROXMOX_SSH_ALLOW_INSECURE=true (no verification)
 * 4. ~/.ssh/known_hosts of the service user
 * Reads the known_hosts file on every call, so call it again before each new connection.
 */
export function resolveHostTrust(options: HostTrustOptions): HostTrust {
  if (options.hostKeyFingerprint !== undefined) {
    const expected = parseHostFingerprint(options.hostKeyFingerprint);
    return { mode: 'fingerprint', verify: key => verifyHostKey(key, expected) };
  }
  if (options.knownHostsPath === undefined && options.allowInsecure === true) return { mode: 'insecure' };

  const path = options.knownHostsPath === undefined ? defaultKnownHostsPath() : expandKnownHostsPath(options.knownHostsPath);
  try {
    const keys = loadKnownHostKeys(path, options.host, options.port);
    return { mode: 'known_hosts', path, algorithms: keys.algorithms, verify: key => matchesKnownHostKey(key, keys) };
  } catch (error) {
    if (options.knownHostsPath === undefined && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `SSH host key verification needs a trust source, but ${path} does not exist. ` +
        'Add the node to that file, set PROXMOX_SSH_KNOWN_HOSTS or PROXMOX_SSH_HOST_KEY_FINGERPRINT, ' +
        'or set PROXMOX_SSH_ALLOW_INSECURE=true on trusted test networks only.'
      );
    }
    if ((error as NodeJS.ErrnoException).code !== undefined) {
      throw new Error(`Cannot read SSH known_hosts file ${path}: ${(error as Error).message}`);
    }
    throw error;
  }
}
