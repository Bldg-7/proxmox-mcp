import { describe, it, expect } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { executeVMCommand } from './command.js';

describe('Command Tools', () => {
  describe('executeVMCommand', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls -la',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('executes command and returns PID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ pid: 12345 });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls -la',
        type: 'qemu',
      });

      expect(result.content[0].text).toContain('⚡');
      expect(result.content[0].text).toContain('12345');
      expect(result.content[0].text).toContain('ls -la');
      expect(result.content[0].text).toContain('QEMU');
      expect(result.isError).toBe(false);
    });

     it('rejects LXC type', async () => {
       const client = createMockProxmoxClient();
       const config = createTestConfig({ allowElevated: true });

       const result = await executeVMCommand(client, config, {
         node: 'pve1',
         vmid: 100,
         command: 'whoami',
         type: 'lxc' as any,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Invalid');
     });

    it('validates command for dangerous characters', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'ls; rm -rf /',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('rejects command with pipe character', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'cat /etc/passwd | grep root',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('rejects command with backticks', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'echo `whoami`',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('dangerous characters');
    });

    it('validates node name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'invalid@node',
        vmid: 100,
        command: 'ls',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VM ID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 50,
        command: 'ls',
        type: 'qemu',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });
});
