import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** OpenSSH known_hosts files are small; refuse to parse something that is clearly not one. */
const MAX_KNOWN_HOSTS_BYTES = 4 * 1024 * 1024;

/**
 * ssh2 host key algorithms for each key type, in ssh2's own preference order.
 * DSA keys are left out on purpose: OpenSSH removed them as insecure.
 */
const HOST_KEY_ALGORITHMS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['ssh-ed25519', ['ssh-ed25519']],
  ['ecdsa-sha2-nistp256', ['ecdsa-sha2-nistp256']],
  ['ecdsa-sha2-nistp384', ['ecdsa-sha2-nistp384']],
  ['ecdsa-sha2-nistp521', ['ecdsa-sha2-nistp521']],
  ['ssh-rsa', ['rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']],
];
const SUPPORTED_TYPES = new Set(HOST_KEY_ALGORITHMS.map(([type]) => type));

export interface KnownHostKeys {
  /** Raw SSH wire-format public keys trusted for the host. */
  trusted: Buffer[];
  /** Raw keys marked @revoked for the host. They are never accepted. */
  revoked: Buffer[];
  /** Host key algorithms to offer, so the server presents a key type we know. */
  algorithms: string[];
}

export interface HostTrust {
  /** The known_hosts file the keys came from. */
  path: string;
  /** Host key algorithms to offer to the server. */
  algorithms: string[];
  verify: (key: Buffer) => boolean;
}

function howToAddHost(host: string, port: number): string {
  return `Connect once with OpenSSH as the user that runs this server (ssh -p ${port} <user>@${host}) ` +
    'and accept the key only after it matches the fingerprint shown on the node console.';
}

/** The name OpenSSH records for a host: "host" on port 22, "[host]:port" otherwise. */
export function knownHostsName(host: string, port: number): string {
  const name = host.toLowerCase();
  return port === 22 ? name : `[${name}]:${port}`;
}

function globToRegExp(pattern: string): RegExp {
  const body = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${body}$`, 'i');
}

function matchesHashed(entry: string, name: string): boolean {
  // |1|base64(salt)|base64(HMAC-SHA1(salt, name))
  const [, magic, salt, hash] = entry.split('|');
  if (magic !== '1' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = createHmac('sha1', Buffer.from(salt, 'base64')).update(name).digest();
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** OpenSSH semantics: any positive pattern must match and no negated ("!") pattern may match. */
function matchesHost(field: string, name: string): boolean {
  if (field.startsWith('|')) return matchesHashed(field, name);
  let matched = false;
  for (const pattern of field.split(',')) {
    if (pattern.startsWith('!')) {
      if (globToRegExp(pattern.slice(1)).test(name)) return false;
    } else if (pattern && globToRegExp(pattern).test(name)) {
      matched = true;
    }
  }
  return matched;
}

/** Read the key type that the SSH wire-format blob declares about itself. */
function blobType(blob: Buffer): string | undefined {
  if (blob.length < 4) return undefined;
  const length = blob.readUInt32BE(0);
  if (length === 0 || length > 64 || blob.length < 4 + length) return undefined;
  return blob.subarray(4, 4 + length).toString('latin1');
}

/** Parse known_hosts text and collect the keys that apply to host:port. Malformed lines are skipped, as OpenSSH does. */
export function parseKnownHosts(text: string, host: string, port: number): KnownHostKeys {
  const name = knownHostsName(host, port);
  const trusted: Buffer[] = [];
  const revoked: Buffer[] = [];
  const types = new Set<string>();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(/\s+/);
    const marker = fields[0].startsWith('@') ? fields.shift() : undefined;
    // @cert-authority needs SSH host certificates, which ssh2 does not verify.
    if (marker !== undefined && marker !== '@revoked') continue;
    const [hosts, type, encoded] = fields;
    if (!hosts || !type || !encoded || !matchesHost(hosts, name)) continue;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) continue;
    const blob = Buffer.from(encoded, 'base64');
    if (blobType(blob) !== type) continue;
    if (marker === '@revoked') {
      revoked.push(blob);
    } else if (SUPPORTED_TYPES.has(type)) {
      trusted.push(blob);
      types.add(type);
    }
  }
  const algorithms = HOST_KEY_ALGORITHMS.filter(([type]) => types.has(type)).flatMap(([, names]) => names);
  return { trusted, revoked, algorithms };
}

export function matchesKnownHostKey(key: Buffer, keys: KnownHostKeys): boolean {
  if (keys.revoked.some(revoked => revoked.equals(key))) return false;
  return keys.trusted.some(trusted => trusted.equals(key));
}

/**
 * Trust the host key that ~/.ssh/known_hosts of the service user records for host:port,
 * the same file the OpenSSH client uses. There is no setting to skip or replace this check.
 * The file is read on every call, so call it again before each new connection.
 */
export function loadHostTrust(host: string, port: number): HostTrust {
  const path = join(homedir(), '.ssh', 'known_hosts');
  let text: string;
  try {
    if (statSync(path).size > MAX_KNOWN_HOSTS_BYTES) throw new Error(`known_hosts file is too large: ${path}`);
    text = readFileSync(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`SSH host key verification needs ${path}, but it does not exist. ${howToAddHost(host, port)}`);
    }
    if ((error as NodeJS.ErrnoException).code !== undefined) {
      throw new Error(`Cannot read ${path}: ${(error as Error).message}`);
    }
    throw error;
  }
  const keys = parseKnownHosts(text, host, port);
  if (keys.trusted.length === 0) {
    throw new Error(
      `No usable SSH host key for ${knownHostsName(host, port)} in ${path}. ${howToAddHost(host, port)} ` +
      'ed25519, ECDSA and RSA keys are supported; @cert-authority entries are not.'
    );
  }
  return { path, algorithms: keys.algorithms, verify: key => matchesKnownHostKey(key, keys) };
}
