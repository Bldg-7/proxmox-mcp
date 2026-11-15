import { createHash, timingSafeEqual } from 'node:crypto';

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
