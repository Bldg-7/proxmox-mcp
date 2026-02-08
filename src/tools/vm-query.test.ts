import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../client/proxmox.js';
import { createTestConfig } from '../__test-utils__/index.js';
import { sampleQemuVMs, sampleLxcContainers } from '../__fixtures__/vms.js';
import { sampleNodes } from '../__fixtures__/nodes.js';
import { sampleStorage } from '../__fixtures__/storage.js';
import { getVMs, getVMStatus, getStorage, getVmPending, getLxcPending } from './vm-query.js';

function createMockClient(): ProxmoxApiClient {
  return {
    request: vi.fn(),
  } as unknown as ProxmoxApiClient;
}

describe('getVMs', () => {
  let client: ProxmoxApiClient;
  let config = createTestConfig();

  beforeEach(() => {
    client = createMockClient();
    config = createTestConfig();
  });

  it('lists all VMs across all nodes', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockImplementation((path: string) => {
      if (path === '/nodes') return Promise.resolve(sampleNodes);
      if (path === '/nodes/pve1/qemu') return Promise.resolve(sampleQemuVMs);
      if (path === '/nodes/pve1/lxc') return Promise.resolve(sampleLxcContainers.slice(0, 1));
      if (path === '/nodes/pve2/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve2/lxc') return Promise.resolve(sampleLxcContainers.slice(1));
      if (path === '/nodes/pve3/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve3/lxc') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await getVMs(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('💻 **Virtual Machines**');
    expect(result.content[0].text).toContain('ubuntu-server');
    expect(result.content[0].text).toContain('🖥️');
    expect(result.content[0].text).toContain('📦');
  });

  it('filters by node', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleQemuVMs);
    mockRequest.mockResolvedValueOnce(sampleLxcContainers.slice(0, 1));

    const result = await getVMs(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('pve1');
    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/qemu');
    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/lxc');
  });

  it('filters by type (qemu only)', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleQemuVMs);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getVMs(client, config, { type: 'qemu' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🖥️');
    expect(result.content[0].text).not.toContain('nginx-proxy');
  });

  it('filters by type (lxc only)', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce(sampleLxcContainers.slice(0, 1));
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce(sampleLxcContainers.slice(1));

    const result = await getVMs(client, config, { type: 'lxc' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('📦');
    expect(result.content[0].text).not.toContain('ubuntu-server');
  });

  it('handles empty VM list', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getVMs(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No virtual machines found');
  });

  it('sorts VMs by vmid ascending', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockImplementation((path: string) => {
      if (path === '/nodes') return Promise.resolve(sampleNodes);
      if (path === '/nodes/pve1/qemu') return Promise.resolve(sampleQemuVMs);
      if (path === '/nodes/pve1/lxc') return Promise.resolve(sampleLxcContainers.slice(0, 1));
      if (path === '/nodes/pve2/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve2/lxc') return Promise.resolve(sampleLxcContainers.slice(1));
      if (path === '/nodes/pve3/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve3/lxc') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await getVMs(client, config, {});

    const text = result.content[0].text;
    const vm100Index = text.indexOf('ID: 100');
    const vm101Index = text.indexOf('ID: 101');
    const vm200Index = text.indexOf('ID: 200');

    expect(vm100Index).toBeLessThan(vm101Index);
    expect(vm101Index).toBeLessThan(vm200Index);
  });

  it('shows running VM stats', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockImplementation((path: string) => {
      if (path === '/nodes') return Promise.resolve(sampleNodes);
      if (path === '/nodes/pve1/qemu') return Promise.resolve([sampleQemuVMs[0]]);
      if (path === '/nodes/pve1/lxc') return Promise.resolve([]);
      if (path === '/nodes/pve2/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve2/lxc') return Promise.resolve([]);
      if (path === '/nodes/pve3/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve3/lxc') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await getVMs(client, config, {});

    expect(result.content[0].text).toContain('Uptime');
    expect(result.content[0].text).toContain('CPU');
    expect(result.content[0].text).toContain('Memory');
  });

  it('hides stats for stopped VMs', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockImplementation((path: string) => {
      if (path === '/nodes') return Promise.resolve(sampleNodes);
      if (path === '/nodes/pve1/qemu') return Promise.resolve([sampleQemuVMs[1]]);
      if (path === '/nodes/pve1/lxc') return Promise.resolve([]);
      if (path === '/nodes/pve2/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve2/lxc') return Promise.resolve([]);
      if (path === '/nodes/pve3/qemu') return Promise.resolve([]);
      if (path === '/nodes/pve3/lxc') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await getVMs(client, config, {});

    const text = result.content[0].text;
    expect(text).toContain('windows-desktop');
    expect(text).not.toContain('Uptime');
  });

  it('handles API errors', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockRejectedValue(new Error('Connection failed'));

    const result = await getVMs(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });

  it('validates node name', async () => {
    const result = await getVMs(client, config, { node: 'invalid@node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });
});

describe('getVMStatus', () => {
  let client: ProxmoxApiClient;
  let config = createTestConfig();

  beforeEach(() => {
    client = createMockClient();
    config = createTestConfig();
  });

  it('returns VM status for running VM', async () => {
    const mockStatus = {
      name: 'test-vm',
      status: 'running',
      uptime: 86400,
      cpu: 0.25,
      mem: 4294967296,
      maxmem: 8589934592,
      diskread: 1073741824,
      diskwrite: 2147483648,
      netin: 536870912,
      netout: 1073741824,
    };

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue(mockStatus);

    const result = await getVMStatus(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🟢');
    expect(result.content[0].text).toContain('test-vm');
    expect(result.content[0].text).toContain('Uptime');
    expect(result.content[0].text).toContain('CPU Usage');
    expect(result.content[0].text).toContain('Memory');
    expect(result.content[0].text).toContain('Disk Read');
    expect(result.content[0].text).toContain('Disk Write');
    expect(result.content[0].text).toContain('Network In');
    expect(result.content[0].text).toContain('Network Out');
  });

  it('returns VM status for stopped VM', async () => {
    const mockStatus = {
      name: 'stopped-vm',
      status: 'stopped',
    };

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue(mockStatus);

    const result = await getVMStatus(client, config, { node: 'pve1', vmid: 101 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔴');
    expect(result.content[0].text).toContain('stopped-vm');
    expect(result.content[0].text).not.toContain('Uptime');
  });

  it('uses default type (qemu)', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue({ name: 'test', status: 'running' });

    await getVMStatus(client, config, { node: 'pve1', vmid: 100 });

    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/current');
  });

  it('uses specified type (lxc)', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue({ name: 'test', status: 'running' });

    await getVMStatus(client, config, { node: 'pve1', vmid: 200, type: 'lxc' });

    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/current');
  });

  it('validates node name', async () => {
    const result = await getVMStatus(client, config, { node: 'invalid@node', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('validates VMID', async () => {
    const result = await getVMStatus(client, config, { node: 'pve1', vmid: -1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockRejectedValue(new Error('VM not found'));

    const result = await getVMStatus(client, config, { node: 'pve1', vmid: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('VM not found');
  });

  it('shows memory percentage', async () => {
    const mockStatus = {
      name: 'test-vm',
      status: 'running',
      mem: 2147483648,
      maxmem: 8589934592,
    };

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue(mockStatus);

    const result = await getVMStatus(client, config, { node: 'pve1', vmid: 100 });

    expect(result.content[0].text).toContain('25.0%');
  });
});

describe('getStorage', () => {
  let client: ProxmoxApiClient;
  let config = createTestConfig();

  beforeEach(() => {
    client = createMockClient();
    config = createTestConfig();
  });

  it('lists all storage pools', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('💾 **Storage Pools**');
    expect(result.content[0].text).toContain('local');
    expect(result.content[0].text).toContain('local-lvm');
    expect(result.content[0].text).toContain('nfs-backup');
  });

  it('shows active storage with green status', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    expect(result.content[0].text).toContain('🟢');
  });

  it('shows inactive storage with red status', async () => {
    const inactiveStorage = [
      {
        storage: 'offline-pool',
        type: 'dir',
        content: 'iso',
        active: 0,
        enabled: 0,
        total: 0,
        used: 0,
        avail: 0,
        shared: 0,
      },
    ];

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(inactiveStorage);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    expect(result.content[0].text).toContain('🔴');
  });

  it('filters by node', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleStorage);

    const result = await getStorage(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/storage');
  });

  it('deduplicates storage pools', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    const localCount = (result.content[0].text.match(/\*\*local\*\*/g) || []).length;
    expect(localCount).toBe(1);
  });

  it('sorts storage by name', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    const text = result.content[0].text;
    const localIndex = text.indexOf('**local**');
    const localLvmIndex = text.indexOf('**local-lvm**');
    const nfsIndex = text.indexOf('**nfs-backup**');

    expect(localIndex).toBeLessThan(localLvmIndex);
    expect(localLvmIndex).toBeLessThan(nfsIndex);
  });

  it('shows storage usage percentage', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce(sampleStorage);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    expect(result.content[0].text).toContain('30.0%');
    expect(result.content[0].text).toContain('50.0%');
    expect(result.content[0].text).toContain('25.0%');
  });

  it('handles empty storage list', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValueOnce(sampleNodes);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);
    mockRequest.mockResolvedValueOnce([]);

    const result = await getStorage(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No storage found');
  });

  it('validates node name', async () => {
    const result = await getStorage(client, config, { node: 'invalid@node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockRejectedValue(new Error('API error'));

    const result = await getStorage(client, config, {});

   expect(result.isError).toBe(true);
   expect(result.content[0].text).toContain('❌');
   expect(result.content[0].text).toContain('API error');
 });
});

describe('getVmPending', () => {
  let client: ProxmoxApiClient;
  let config = createTestConfig();

  beforeEach(() => {
    client = createMockClient();
    config = createTestConfig();
  });

  it('returns pending changes for a QEMU VM', async () => {
    const mockPending = [
      { key: 'memory', value: '8192' },
      { key: 'cores', value: '4' },
    ];

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue(mockPending);

    const result = await getVmPending(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🖥️ **QEMU VM Pending Changes**');
    expect(result.content[0].text).toContain('ID: 100');
    expect(result.content[0].text).toContain('memory');
    expect(result.content[0].text).toContain('cores');
    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/qemu/100/pending');
  });

  it('handles empty pending changes', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue([]);

    const result = await getVmPending(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No pending changes');
  });

  it('validates node name', async () => {
    const result = await getVmPending(client, config, { node: 'invalid@node', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('validates VMID', async () => {
    const result = await getVmPending(client, config, { node: 'pve1', vmid: -1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockRejectedValue(new Error('VM not found'));

    const result = await getVmPending(client, config, { node: 'pve1', vmid: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('VM not found');
  });
});

describe('getLxcPending', () => {
  let client: ProxmoxApiClient;
  let config = createTestConfig();

  beforeEach(() => {
    client = createMockClient();
    config = createTestConfig();
  });

  it('returns pending changes for an LXC container', async () => {
    const mockPending = [
      { key: 'memory', value: '2048' },
      { key: 'cores', value: '2' },
    ];

    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue(mockPending);

    const result = await getLxcPending(client, config, { node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('📦 **LXC Container Pending Changes**');
    expect(result.content[0].text).toContain('ID: 200');
    expect(result.content[0].text).toContain('memory');
    expect(result.content[0].text).toContain('cores');
    expect(mockRequest).toHaveBeenCalledWith('/nodes/pve1/lxc/200/pending');
  });

  it('handles empty pending changes', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockResolvedValue([]);

    const result = await getLxcPending(client, config, { node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No pending changes');
  });

  it('validates node name', async () => {
    const result = await getLxcPending(client, config, { node: 'invalid@node', vmid: 200 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('validates VMID', async () => {
    const result = await getLxcPending(client, config, { node: 'pve1', vmid: -1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors', async () => {
    const mockRequest = vi.mocked(client.request);
    mockRequest.mockRejectedValue(new Error('Container not found'));

    const result = await getLxcPending(client, config, { node: 'pve1', vmid: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Container not found');
  });
});
