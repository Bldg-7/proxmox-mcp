import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleGuestList,
  handleGuestStatus,
  handleGuestConfig,
  handleGuestPending,
  handleGuestFeature,
  handleGuestRrddata,
} from '../guest-query.js';

describe('handleGuestList', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted list of VMs and containers', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValueOnce([{ node: 'pve1' }]); // nodes
    client.request.mockResolvedValueOnce([{ vmid: 100, name: 'test-vm', status: 'running', type: 'qemu', uptime: 3600, mem: 1073741824, maxmem: 4294967296 }]); // qemu
    client.request.mockResolvedValueOnce([{ vmid: 200, name: 'test-ct', status: 'stopped', type: 'lxc' }]); // lxc

    const result = await handleGuestList(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Virtual Machines');
    expect(result.content[0].text).toContain('test-vm');
    expect(result.content[0].text).toContain('test-ct');
  });

  it('filters by node', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValueOnce([{ vmid: 100, name: 'vm1', status: 'running', type: 'qemu', uptime: 3600, mem: 1073741824, maxmem: 4294967296 }]);
    client.request.mockResolvedValueOnce([]);

    const result = await handleGuestList(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('vm1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection refused'));

    const result = await handleGuestList(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Connection refused');
  });
});

describe('handleGuestStatus', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns VM status when type=vm', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({
      name: 'my-vm',
      status: 'running',
      uptime: 86400,
      cpu: 0.15,
      mem: 2147483648,
      maxmem: 4294967296,
      diskread: 1024000,
      diskwrite: 512000,
      netin: 1000000,
      netout: 500000,
    });

    const result = await handleGuestStatus(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('my-vm');
    expect(result.content[0].text).toContain('running');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/current');
  });

  it('returns LXC status when type=lxc', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({
      name: 'my-ct',
      status: 'stopped',
    });

    const result = await handleGuestStatus(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('my-ct');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/current');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Not found'));

    const result = await handleGuestStatus(client, config, { type: 'vm', node: 'pve1', vmid: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Not found');
  });
});

describe('handleGuestConfig', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns VM config when type=vm', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({
      name: 'my-vm',
      memory: 4096,
      cores: 4,
      sockets: 1,
      ostype: 'l26',
      scsi0: 'local-lvm:vm-100-disk-0,size=32G',
      net0: 'virtio=XX:XX:XX:XX:XX:XX,bridge=vmbr0',
    });

    const result = await handleGuestConfig(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('QEMU VM Configuration');
    expect(result.content[0].text).toContain('my-vm');
    expect(result.content[0].text).toContain('4096');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/config');
  });

  it('returns LXC config when type=lxc', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({
      hostname: 'my-ct',
      memory: 2048,
      swap: 512,
      cores: 2,
      ostype: 'debian',
      rootfs: 'local-lvm:vm-200-disk-0,size=8G',
      net0: 'name=eth0,bridge=vmbr0',
    });

    const result = await handleGuestConfig(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Configuration');
    expect(result.content[0].text).toContain('my-ct');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/config');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Timeout'));

    const result = await handleGuestConfig(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Timeout');
  });
});

describe('handleGuestPending', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns VM pending changes when type=vm', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([
      { key: 'memory', value: 8192 },
    ]);

    const result = await handleGuestPending(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('QEMU VM Pending Changes');
    expect(result.content[0].text).toContain('memory');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/pending');
  });

  it('returns LXC pending changes when type=lxc', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await handleGuestPending(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Pending Changes');
    expect(result.content[0].text).toContain('No pending changes');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/pending');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Server error'));

    const result = await handleGuestPending(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Server error');
  });
});

describe('handleGuestFeature', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns VM feature check when type=vm', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({ enabled: true });

    const result = await handleGuestFeature(client, config, { type: 'vm', node: 'pve1', vmid: 100, feature: 'snapshot' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('QEMU VM Feature Check');
    expect(result.content[0].text).toContain('snapshot');
    expect(result.content[0].text).toContain('✅ Yes');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/feature?feature=snapshot');
  });

  it('returns LXC feature check when type=lxc', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({ enabled: false, reason: 'not supported' });

    const result = await handleGuestFeature(client, config, { type: 'lxc', node: 'pve1', vmid: 200, feature: 'clone' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Feature Check');
    expect(result.content[0].text).toContain('clone');
    expect(result.content[0].text).toContain('❌ No');
    expect(result.content[0].text).toContain('not supported');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/feature?feature=clone');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Permission denied'));

    const result = await handleGuestFeature(client, config, { type: 'vm', node: 'pve1', vmid: 100, feature: 'snapshot' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
});

describe('handleGuestRrddata', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns VM RRD data when type=vm', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([
      { time: 1700000000, cpu: 0.15, mem: 1073741824 },
    ]);

    const result = await handleGuestRrddata(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Performance Metrics');
    expect(result.content[0].text).toContain('100');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/rrddata');
  });

  it('returns LXC RRD data when type=lxc', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([
      { time: 1700000000, cpu: 0.05, mem: 536870912 },
    ]);

    const result = await handleGuestRrddata(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Performance Metrics');
    expect(result.content[0].text).toContain('200');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/rrddata');
  });

  it('passes timeframe and cf parameters', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    await handleGuestRrddata(client, config, { type: 'vm', node: 'pve1', vmid: 100, timeframe: 'hour', cf: 'AVERAGE' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/rrddata?timeframe=hour&cf=AVERAGE');
  });

  it('handles empty data', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await handleGuestRrddata(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No performance metrics available');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Network error'));

    const result = await handleGuestRrddata(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Network error');
  });
});
