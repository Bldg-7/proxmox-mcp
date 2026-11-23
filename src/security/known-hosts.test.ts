import { createHmac, randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { utils } from 'ssh2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { knownHostsName, loadHostTrust, matchesKnownHostKey, parseKnownHosts } from './known-hosts.js';

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

let home: string | undefined;
afterEach(() => {
  vi.unstubAllEnvs();
  if (home) rmSync(home, { recursive: true, force: true });
  home = undefined;
});
/** Point HOME at a fresh directory; write ~/.ssh/known_hosts when text is given. */
function useHome(text?: string): string {
  home = mkdtempSync(join(tmpdir(), 'known-hosts-home-'));
  vi.stubEnv('HOME', home);
  if (text !== undefined) {
    mkdirSync(join(home, '.ssh'));
    writeFileSync(join(home, '.ssh', 'known_hosts'), text);
  }
  return home;
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

});

describe('loading ~/.ssh/known_hosts', () => {
  it('trusts the keys recorded for the host', () => {
    const dir = useHome(`h ${ed.line}\nh ${rsa.line}\n`);
    const trust = loadHostTrust('h', 22);
    expect(trust.path).toBe(join(dir, '.ssh', 'known_hosts'));
    expect(trust.algorithms).toEqual(['ssh-ed25519', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa']);
    expect(trust.verify(ed.blob)).toBe(true);
    expect(trust.verify(other.blob)).toBe(false);
  });

  it('explains how to add the host when the file is missing', () => {
    useHome();
    expect(() => loadHostTrust('pve.example', 22)).toThrow(/known_hosts, but it does not exist.*ssh -p 22 <user>@pve\.example/s);
  });

  it('explains how to add the host when it has no usable entry', () => {
    useHome(`other.example ${ed.line}\n@cert-authority pve.example ${rsa.line}\n`);
    expect(() => loadHostTrust('pve.example', 22)).toThrow(/No usable SSH host key for pve\.example in .*known_hosts/);
  });
});
