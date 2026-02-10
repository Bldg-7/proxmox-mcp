import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleGuestClone,
  handleGuestResize,
  handleGuestConfigUpdate,
  handleGuestMigrate,
  handleGuestTemplate,
} from '../guest-modify.js';

describe('handleGuestClone', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('clones a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:vm-clone');

    const result = await handleGuestClone(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      newid: 200,
      name: 'cloned-vm',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Clone Initiated');
    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/clone',
      'POST',
      expect.objectContaining({
        name: 'cloned-vm',
      })
    );
  });

  it('clones an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:lxc-clone');

    const result = await handleGuestClone(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 101,
      newid: 201,
      hostname: 'cloned-lxc',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Container Clone Initiated');
    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/101/clone',
      'POST',
      expect.objectContaining({
        hostname: 'cloned-lxc',
      })
    );
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestClone(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      newid: 200,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
});

describe('handleGuestResize', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('resizes a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(null);

    const result = await handleGuestResize(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      memory: 2048,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Resize Initiated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/config', 'PUT', {
      memory: 2048,
    });
  });

  it('resizes an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(null);

    const result = await handleGuestResize(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 200,
      cores: 2,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Container Resize Initiated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/config', 'PUT', {
      cores: 2,
    });
  });

  it('rejects when no resize values are provided', async () => {
    const config = createTestConfig({ allowElevated: true });

    const result = await handleGuestResize(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('At least one of memory or cores must be specified');
  });
});

describe('handleGuestConfigUpdate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates VM config when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(null);

    const result = await handleGuestConfigUpdate(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      config: {
        boot: 'order=scsi0',
      },
      delete: 'ciuser',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Configuration Updated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/config', 'PUT', {
      boot: 'order=scsi0',
      delete: 'ciuser',
    });
  });

  it('updates LXC config when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(null);

    const result = await handleGuestConfigUpdate(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 200,
      config: {
        hostname: 'new-host',
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Container Configuration Updated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/config', 'PUT', {
      hostname: 'new-host',
    });
  });

  it('masks password-like values in output', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(null);

    const result = await handleGuestConfigUpdate(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      config: {
        cipassword: 'supersecret',
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('***');
    expect(result.content[0].text).not.toContain('supersecret');
  });

  it('rejects when no config values are provided', async () => {
    const config = createTestConfig({ allowElevated: true });

    const result = await handleGuestConfigUpdate(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 200,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('At least one config parameter or delete must be provided');
  });
});

describe('handleGuestMigrate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('migrates a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:vm-migrate');

    const result = await handleGuestMigrate(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
      target: 'pve2',
      online: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Migration Initiated');
    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/migrate',
      'POST',
      expect.objectContaining({
        target: 'pve2',
        online: true,
      })
    );
  });

  it('migrates an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:lxc-migrate');

    const result = await handleGuestMigrate(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 200,
      target: 'pve2',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Migration Initiated');
    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/migrate',
      'POST',
      expect.objectContaining({
        target: 'pve2',
      })
    );
  });
});

describe('handleGuestTemplate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('converts a VM to template when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await handleGuestTemplate(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Converted to Template');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/template', 'POST');
  });

  it('converts an LXC container to template when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await handleGuestTemplate(client, config, {
      type: 'lxc',
      node: 'pve1',
      vmid: 200,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Converted to Template');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/template', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestTemplate(client, config, {
      type: 'vm',
      node: 'pve1',
      vmid: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
});
