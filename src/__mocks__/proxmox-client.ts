import { vi } from 'vitest';
import type { Config } from '../config/index.js';
import { ProxmoxApiClient } from '../client/proxmox.js';

const defaultConfig: Config = {
  host: '10.0.0.1',
  port: 8006,
  user: 'root@pam',
  tokenName: 'test-token',
  tokenValue: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  allowElevated: false,
  sslMode: 'insecure',
};

export class MockProxmoxClient extends ProxmoxApiClient {
  request = vi.fn();

  constructor(overrides: Partial<Config> = {}) {
    super({ ...defaultConfig, ...overrides });
  }
}

export function createMockProxmoxClient(
  overrides: Partial<Config> = {}
): MockProxmoxClient {
  return new MockProxmoxClient(overrides);
}
