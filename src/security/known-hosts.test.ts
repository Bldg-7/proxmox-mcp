import { createHmac, randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { utils } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  expandKnownHostsPath, knownHostsName, loadKnownHostKeys, matchesKnownHostKey, parseKnownHosts,
} from './known-hosts.js';
import { resolveHostTrust } from './ssh-host-key.js';

function makeKey(type: 'ed25519' | 'rsa' | 'ecdsa'): { line: string; blob: Buffer } {
  const pair = type === 'ed25519' ? utils.generateKeyPairSync('ed25519')
    : utils.generateKeyPairSync(type, { bits: type === 'rsa' ? 2048 : 256 });
  const [keyType, encoded] = pair.public.split(' ');
  return { line: `${keyType} ${encoded}`, blob: Buffer.from(encoded, 'base64') };
}
function hashed(name: string): string {
  const salt = randomBytes(20);
  return `|1|${salt.toString('base64')}|${createHmac('sha1', salt).update(name).digest('base64')}`;
}

const ed = makeKey('ed25519');
const rsa = makeKey('rsa');
const ecdsa = makeKey('ecdsa');
const other = makeKey('ed25519');

let dir: string | undefined;
afterEach(() => {
  vi.unstubAllEnvs();
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});
function writeKnownHosts(text: string): string {
  dir = mkdtempSync(join(tmpdir(), 'known-hosts-'));
  const path = join(dir, 'known_hosts');
  writeFileSync(path, text);
  return path;
}

describe('known_hosts host matching', () => {
  it('uses the OpenSSH name for standard and custom ports', () => {
    expect(knownHostsName('PVE.example', 22)).toBe('pve.example');
    expect(knownHostsName('pve.example', 2222)).toBe('[pve.example]:2222');
  });

  it('matches plain names in a comma list, case-insensitively', () => {
    const keys = parseKnownHosts(`other,PVE.example,10.0.0.5 ${ed.line}\n`, 'pve.example', 22);
    expect(keys.trusted).toEqual([ed.blob]);
    expect(parseKnownHosts(`other,PVE.example,10.0.0.5 ${ed.line}\n`, '10.0.0.5', 22).trusted).toHaveLength(1);
  });

  it('requires the [host]:port form for a custom port', () => {
    expect(parseKnownHosts(`pve.example ${ed.line}`, 'pve.example', 2222).trusted).toHaveLength(0);
    expect(parseKnownHosts(`[pve.example]:2222 ${ed.line}`, 'pve.example', 2222).trusted).toHaveLength(1);
  });

  it('matches hashed host names', () => {
    expect(parseKnownHosts(`${hashed('pve.example')} ${ed.line}`, 'pve.example', 22).trusted).toHaveLength(1);
    expect(parseKnownHosts(`${hashed('[pve.example]:2222')} ${ed.line}`, 'pve.example', 2222).trusted).toHaveLength(1);
    expect(parseKnownHosts(`${hashed('other.example')} ${ed.line}`, 'pve.example', 22).trusted).toHaveLength(0);
  });

  it('supports wildcards and negated patterns', () => {
    const text = `*.lab.example,!bad.lab.example ${ed.line}`;
    expect(parseKnownHosts(text, 'pve1.lab.example', 22).trusted).toHaveLength(1);
    expect(parseKnownHosts(text, 'bad.lab.example', 22).trusted).toHaveLength(0);
    expect(parseKnownHosts(`pve? ${ed.line}`, 'pve1', 22).trusted).toHaveLength(1);
    expect(parseKnownHosts(`pve? ${ed.line}`, 'pve10', 22).trusted).toHaveLength(0);
  });

  it('treats regex characters in host names literally', () => {
    expect(parseKnownHosts(`10.0.0.5 ${ed.line}`, '10a0b0c5', 22).trusted).toHaveLength(0);
  });
});

describe('known_hosts keys', () => {
  it('skips comments, blank lines, malformed lines and mislabelled keys', () => {
    const text = [
      '# comment', '', 'pve.example', 'pve.example ssh-ed25519', 'pve.example ssh-ed25519 not*base64',
      `pve.example ssh-rsa ${ed.line.split(' ')[1]}`, `pve.example ${ed.line} comment words`,
    ].join('\n');
    expect(parseKnownHosts(text, 'pve.example', 22).trusted).toEqual([ed.blob]);
  });

  it('ignores @cert-authority entries and never accepts @revoked keys', () => {
    const keys = parseKnownHosts([
      `@cert-authority pve.example ${other.line}`,
      `pve.example ${ed.line}`,
      `pve.example ${rsa.line}`,
      `@revoked * ${rsa.line}`,
    ].join('\n'), 'pve.example', 22);
    expect(keys.trusted).toEqual([ed.blob, rsa.blob]);
    expect(matchesKnownHostKey(ed.blob, keys)).toBe(true);
    expect(matchesKnownHostKey(rsa.blob, keys)).toBe(false);
    expect(matchesKnownHostKey(other.blob, keys)).toBe(false);
  });

  it('offers only the host key algorithms that known_hosts can verify', () => {
    expect(parseKnownHosts(`h ${rsa.line}`, 'h', 22).algorithms).toEqual(['rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']);
    expect(parseKnownHosts(`h ${rsa.line}\nh ${ecdsa.line}\nh ${ed.line}`, 'h', 22).algorithms)
      .toEqual(['ssh-ed25519', 'ecdsa-sha2-nistp256', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']);
  });

  it('explains how to add a missing host', () => {
    const path = writeKnownHosts(`other.example ${ed.line}\n@cert-authority pve.example ${rsa.line}\n`);
    expect(() => loadKnownHostKeys(path, 'pve.example', 22)).toThrow(/No usable SSH host key for pve\.example in .*known_hosts/);
  });
});

describe('host trust resolution', () => {
  it('prefers a fingerprint over every known_hosts file', () => {
    const fingerprint = 'a'.repeat(64);
    expect(resolveHostTrust({ host: 'h', port: 22, hostKeyFingerprint: fingerprint, knownHostsPath: '/nonexistent' }).mode)
      .toBe('fingerprint');
  });

  it('checks an explicit known_hosts file even in insecure mode', () => {
    const path = writeKnownHosts(`other ${ed.line}\n`);
    expect(() => resolveHostTrust({ host: 'h', port: 22, knownHostsPath: path, allowInsecure: true }))
      .toThrow('No usable SSH host key');
    expect(() => resolveHostTrust({ host: 'h', port: 22, knownHostsPath: join(dir!, 'missing'), allowInsecure: true }))
      .toThrow('Cannot read SSH known_hosts file');
  });

  it('uses ~/.ssh/known_hosts unless insecure mode is explicit', () => {
    const home = mkdtempSync(join(tmpdir(), 'known-hosts-home-'));
    dir = home;
    vi.stubEnv('HOME', home);
    expect(() => resolveHostTrust({ host: 'h', port: 22 })).toThrow(/needs a trust source.*PROXMOX_SSH_KNOWN_HOSTS/s);
    expect(resolveHostTrust({ host: 'h', port: 22, allowInsecure: true }).mode).toBe('insecure');

    mkdirSync(join(home, '.ssh'));
    writeFileSync(join(home, '.ssh', 'known_hosts'), `h ${ed.line}\n`);
    expect(resolveHostTrust({ host: 'h', port: 22 }))
      .toMatchObject({ mode: 'known_hosts', path: join(home, '.ssh', 'known_hosts'), algorithms: ['ssh-ed25519'] });
    // An explicit insecure opt-in skips the default file.
    expect(resolveHostTrust({ host: 'h', port: 22, allowInsecure: true }).mode).toBe('insecure');
  });

  it('expands ~/ and rejects relative paths', () => {
    vi.stubEnv('HOME', '/home/mcp');
    expect(expandKnownHostsPath('~/.ssh/pve_known_hosts')).toBe('/home/mcp/.ssh/pve_known_hosts');
    expect(() => expandKnownHostsPath('known_hosts')).toThrow('absolute path');
  });
});
