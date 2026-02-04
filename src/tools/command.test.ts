import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import { executeVMCommand } from './command.js';

function createMockProxmoxClient(): ProxmoxApiClient {
  return {
    request: vi.fn(),
  } as unknown as ProxmoxApiClient;
}

function createTestConfig(overrides?: Partial<Config>): Config {
  return {
    allowElevated: true,
    ...overrides,
  } as Config;
}

describe('Command Tools', () => {
  describe('executeVMCommand', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls -la',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('executes command and returns PID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue({ pid: 12345 });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls -la',
      });

      expect(result.content[0].text).toContain('⚡');
      expect(result.content[0].text).toContain('12345');
      expect(result.content[0].text).toContain('ls -la');
      expect(result.content[0].text).toContain('QEMU');
      expect(result.isError).toBe(false);
    });

    it('executes command on LXC container', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue({ pid: 54321 });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'whoami',
        type: 'lxc',
      });

      expect(result.content[0].text).toContain('⚡');
      expect(result.content[0].text).toContain('54321');
      expect(result.content[0].text).toContain('whoami');
      expect(result.content[0].text).toContain('LXC');
      expect(result.isError).toBe(false);
    });

    it('validates command for dangerous characters', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls; rm -rf /',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('rejects command with pipe character', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'cat /etc/passwd | grep root',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('rejects command with backticks', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'echo `whoami`',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('validates node name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await executeVMCommand(client, config, {
        node: 'invalid@node',
        vmid: 100,
        command: 'ls',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VM ID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 50,
        command: 'ls',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });
});
