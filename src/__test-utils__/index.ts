import type { Config } from '../config/schema.js';
import { createMockProxmoxClient } from '../__mocks__/proxmox-client.js';

export { createMockProxmoxClient } from '../__mocks__/proxmox-client.js';

export function createTestConfig(overrides: Partial<Config> = {}): Config {
  return {
    host: '10.0.0.1',
    port: 8006,
    user: 'root@pam',
    tokenName: 'test-token',
    tokenValue: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    allowElevated: false,
    sslMode: 'insecure',
    sshEnabled: false,
    sshPort: 22,
    sshUser: 'root',
    ...overrides,
  };
}

export interface MockToolContext {
  config: Config;
  client: ReturnType<typeof createMockProxmoxClient>;
}

export function createMockToolContext(
  configOverrides: Partial<Config> = {},
): MockToolContext {
  return {
    config: createTestConfig(configOverrides),
    client: createMockProxmoxClient(),
  };
}

export function assertToolSuccess(result: unknown): asserts result is { content: Array<{ type: string; text: string }> } {
  if (typeof result !== 'object' || result === null) {
    throw new Error(`Expected tool result object, got ${typeof result}`);
  }
  const r = result as Record<string, unknown>;
  if (!Array.isArray(r.content)) {
    throw new Error('Expected result.content to be an array');
  }
  if (r.isError === true) {
    const text = (r.content as Array<{ text?: string }>)[0]?.text ?? 'unknown error';
    throw new Error(`Tool returned error: ${text}`);
  }
}

export function getToolResultText(result: { content: Array<{ type: string; text: string }> }): string {
  return result.content.map((c) => c.text).join('\n');
}
