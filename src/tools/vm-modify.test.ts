import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { cloneLxc, cloneVM, resizeLxc, resizeVM, updateVmConfig, updateLxcConfig } from './vm-modify.js';

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

  describe('updateVmConfig', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { boot: 'order=scsi0' },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('updates VM config with params', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { boot: 'order=scsi0', agent: '1' },
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('🔧');
      expect(result.content[0].text).toContain('VM Configuration Updated');
      expect(result.content[0].text).toContain('`boot`');
      expect(result.content[0].text).toContain('order=scsi0');
      expect(result.content[0].text).toContain('`agent`');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/config',
        'PUT',
        { boot: 'order=scsi0', agent: '1' }
      );
    });

    it('supports delete parameter', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        delete: 'ciuser,cipassword',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Parameters Removed');
      expect(result.content[0].text).toContain('ciuser,cipassword');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/config',
        'PUT',
        { delete: 'ciuser,cipassword' }
      );
    });

    it('rejects when no config or delete provided', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('At least one');
    });

    it('masks password values in output', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { cipassword: 'supersecret', ciuser: 'admin' },
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('***');
      expect(result.content[0].text).not.toContain('supersecret');
      expect(result.content[0].text).toContain('admin');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Parameter verification failed'));

      const result = await updateVmConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { invalid_param: 'value' },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Parameter verification failed');
    });
  });

  describe('updateLxcConfig', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { hostname: 'new-name' },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('updates LXC config with params', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { hostname: 'new-name', memory: 2048 },
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('🔧');
      expect(result.content[0].text).toContain('Container Configuration Updated');
      expect(result.content[0].text).toContain('`hostname`');
      expect(result.content[0].text).toContain('new-name');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/config',
        'PUT',
        { hostname: 'new-name', memory: 2048 }
      );
    });

    it('supports delete parameter', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        delete: 'mp0,nameserver',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Parameters Removed');
      expect(result.content[0].text).toContain('mp0,nameserver');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/config',
        'PUT',
        { delete: 'mp0,nameserver' }
      );
    });

    it('rejects when no config or delete provided', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('At least one');
    });

    it('masks password values in output', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { password: 'topsecret', hostname: 'myhost' },
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('***');
      expect(result.content[0].text).not.toContain('topsecret');
      expect(result.content[0].text).toContain('myhost');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container is locked'));

      const result = await updateLxcConfig(client, config, {
        node: 'pve1',
        vmid: 100,
        config: { hostname: 'test' },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Container is locked');
    });
  });
});
