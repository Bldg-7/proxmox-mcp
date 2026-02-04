import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { cloneLxc, cloneVM, resizeLxc, resizeVM } from './vm-modify.js';

describe('VM Modify Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('cloneLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        hostname: 'new-container',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('clones LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        hostname: 'new-container',
      });

      expect(result.content[0].text).toContain('📋');
      expect(result.content[0].text).toContain('Container Clone Initiated');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('200');
      expect(result.content[0].text).toContain('new-container');
      expect(result.content[0].text).toContain('UPID');
      expect(result.isError).toBe(false);
    });

    it('clones LXC container without hostname', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
      });

      expect(result.content[0].text).toContain('clone-200');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneLxc(client, config, {
        node: 'invalid@node',
        vmid: 100,
        newid: 200,
        hostname: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates source VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 50,
        newid: 200,
        hostname: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('validates new VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 50,
        hostname: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container already exists'));

      const result = await cloneLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        hostname: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Container already exists');
    });
  });

  describe('cloneVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        name: 'new-vm',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('clones QEMU VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        name: 'new-vm',
      });

      expect(result.content[0].text).toContain('📋');
      expect(result.content[0].text).toContain('VM Clone Initiated');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('200');
      expect(result.content[0].text).toContain('new-vm');
      expect(result.content[0].text).toContain('UPID');
      expect(result.isError).toBe(false);
    });

    it('clones QEMU VM without name', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
      });

      expect(result.content[0].text).toContain('clone-200');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneVM(client, config, {
        node: 'invalid@node',
        vmid: 100,
        newid: 200,
        name: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates source VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 50,
        newid: 200,
        name: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('validates new VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 50,
        name: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM already exists'));

      const result = await cloneVM(client, config, {
        node: 'pve1',
        vmid: 100,
        newid: 200,
        name: 'test',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('VM already exists');
    });
  });

  describe('resizeLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('resizes memory only', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.content[0].text).toContain('📏');
      expect(result.content[0].text).toContain('Container Resize Initiated');
      expect(result.content[0].text).toContain('2048 MB');
      expect(result.content[0].text).not.toContain('New Cores');
      expect(result.content[0].text).toContain('restart');
      expect(result.isError).toBe(false);
    });

    it('resizes cores only', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        cores: 4,
      });

      expect(result.content[0].text).toContain('**New Cores**: 4');
      expect(result.content[0].text).not.toContain('New Memory');
      expect(result.isError).toBe(false);
    });

    it('resizes both memory and cores', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
        cores: 4,
      });

      expect(result.content[0].text).toContain('2048 MB');
      expect(result.content[0].text).toContain('**New Cores**: 4');
      expect(result.isError).toBe(false);
    });

    it('requires at least one parameter', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('At least one of memory or cores');
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeLxc(client, config, {
        node: 'invalid@node',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 50,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container is running'));

      const result = await resizeLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Container is running');
    });
  });

  describe('resizeVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('resizes memory only', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.content[0].text).toContain('📏');
      expect(result.content[0].text).toContain('VM Resize Initiated');
      expect(result.content[0].text).toContain('2048 MB');
      expect(result.content[0].text).not.toContain('New Cores');
      expect(result.content[0].text).toContain('restart');
      expect(result.isError).toBe(false);
    });

    it('resizes cores only', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
        cores: 4,
      });

      expect(result.content[0].text).toContain('**New Cores**: 4');
      expect(result.content[0].text).not.toContain('New Memory');
      expect(result.isError).toBe(false);
    });

    it('resizes both memory and cores', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
        cores: 4,
      });

      expect(result.content[0].text).toContain('2048 MB');
      expect(result.content[0].text).toContain('**New Cores**: 4');
      expect(result.isError).toBe(false);
    });

    it('requires at least one parameter', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('At least one of memory or cores');
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeVM(client, config, {
        node: 'invalid@node',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 50,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM is running'));

      const result = await resizeVM(client, config, {
        node: 'pve1',
        vmid: 100,
        memory: 2048,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('VM is running');
    });
  });
});
