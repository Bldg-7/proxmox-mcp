import { vi } from 'vitest';

export interface MockProxmoxClient {
  request: ReturnType<typeof vi.fn>;
}

export function createMockProxmoxClient(): MockProxmoxClient {
  return {
    request: vi.fn(),
  };
}
