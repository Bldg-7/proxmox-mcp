import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { sampleNodes } from '../__fixtures__/nodes.js';
import { getNodes, getNodeStatus, getNodeNetwork, getNodeDns, getNetworkIface } from './node.js';

describe('getNodes', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted list of nodes', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getNodes(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🖥️  **Proxmox Cluster Nodes**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('pve2');
    expect(result.content[0].text).toContain('pve3');
    expect(result.content[0].text).toContain('🟢');
    expect(result.content[0].text).toContain('🔴');
  });

  it('shows online status with green emoji', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([sampleNodes[0]]);

    const result = await getNodes(client, config, {});

    expect(result.content[0].text).toContain('🟢 **pve1**');
    expect(result.content[0].text).toContain('Status: online');
  });

  it('shows offline status with red emoji', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([sampleNodes[2]]);

    const result = await getNodes(client, config, {});

    expect(result.content[0].text).toContain('🔴 **pve3**');
    expect(result.content[0].text).toContain('Status: offline');
  });

  it('formats memory usage correctly', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([sampleNodes[0]]);

    const result = await getNodes(client, config, {});

    expect(result.content[0].text).toContain('Memory:');
    expect(result.content[0].text).toContain('GB');
  });

  it('formats CPU usage as percentage', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([sampleNodes[0]]);

    const result = await getNodes(client, config, {});

    expect(result.content[0].text).toContain('CPU:');
    expect(result.content[0].text).toContain('%');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await getNodes(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });

  it('handles empty node list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await getNodes(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🖥️  **Proxmox Cluster Nodes**');
  });
});

describe('getNodeStatus', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission Denied');
  });

  it('returns node status with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 1209600,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🖥️  **Node pve1 Status**');
    expect(result.content[0].text).toContain('🟢 Online');
  });

  it('shows offline status when uptime is 0', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 0,
      loadavg: [0, 0, 0],
      cpu: 0,
      memory: { used: 0, total: 17179869184 },
      rootfs: { used: 0, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('🔴 Offline');
  });

  it('formats load average correctly', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 86400,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('**Load Average**');
    expect(result.content[0].text).toContain('0.5, 0.3, 0.2');
  });

  it('formats CPU usage as percentage', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 86400,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('**CPU Usage**');
    expect(result.content[0].text).toContain('25.00%');
  });

  it('formats memory usage with percentage', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 86400,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('**Memory**');
    expect(result.content[0].text).toContain('GB');
    expect(result.content[0].text).toContain('%');
  });

  it('formats root disk usage with percentage', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 86400,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('**Root Disk**');
    expect(result.content[0].text).toContain('GB');
    expect(result.content[0].text).toContain('%');
  });

  it('validates node name', async () => {
    const config = createTestConfig({ allowElevated: true });

    const result = await getNodeStatus(client, config, { node: 'invalid;node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Node not found'));

    const result = await getNodeStatus(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Node not found');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    const mockStatus = {
      uptime: 86400,
      loadavg: [0.5, 0.3, 0.2],
      cpu: 0.25,
      memory: { used: 4294967296, total: 17179869184 },
      rootfs: { used: 10737418240, total: 107374182400 },
    };
    client.request.mockResolvedValue(mockStatus);

    await getNodeStatus(client, config, { node: 'pve1' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/status');
  });
});

describe('getNodeNetwork', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted list of interfaces', async () => {
    const config = createTestConfig();
    const { sampleNetworkInterfaces } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleNetworkInterfaces);

    const result = await getNodeNetwork(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🌐');
    expect(result.content[0].text).toContain('Network Interfaces');
    expect(result.content[0].text).toContain('vmbr0');
    expect(result.content[0].text).toContain('eth0');
    expect(result.content[0].text).toContain('bond0');
    expect(result.content[0].text).toContain('eth0.100');
  });

  it('handles empty interface list', async () => {
    const config = createTestConfig();
    const { emptyNetworkList } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(emptyNetworkList);

    const result = await getNodeNetwork(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No network interfaces found');
  });

  it('filters by type when provided', async () => {
    const config = createTestConfig();
    const { sampleNetworkInterfaces } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleNetworkInterfaces);

    const result = await getNodeNetwork(client, config, { node: 'pve1', type: 'bridge' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network?type=bridge');
  });

  it('validates node name (rejects invalid names)', async () => {
    const config = createTestConfig();

    const result = await getNodeNetwork(client, config, { node: 'invalid@node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Network query failed'));

    const result = await getNodeNetwork(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Network query failed');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig();
    const { sampleNetworkInterfaces } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleNetworkInterfaces);

    await getNodeNetwork(client, config, { node: 'pve1' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network');
  });

  it('calls correct endpoint with type filter', async () => {
    const config = createTestConfig();
    const { sampleNetworkInterfaces } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleNetworkInterfaces);

    await getNodeNetwork(client, config, { node: 'pve1', type: 'bridge' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network?type=bridge');
  });
});

describe('getNodeDns', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted DNS configuration', async () => {
    const config = createTestConfig();
    const { sampleDnsConfig } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleDnsConfig);

    const result = await getNodeDns(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🌐');
    expect(result.content[0].text).toContain('DNS Configuration');
    expect(result.content[0].text).toContain('8.8.8.8');
    expect(result.content[0].text).toContain('8.8.4.4');
    expect(result.content[0].text).toContain('1.1.1.1');
    expect(result.content[0].text).toContain('example.com');
  });

  it('handles partial DNS config (missing dns2/dns3)', async () => {
    const config = createTestConfig();
    const { partialDnsConfig } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(partialDnsConfig);

    const result = await getNodeDns(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('192.168.1.1');
    expect(result.content[0].text).toContain('example.com');
  });

  it('validates node name', async () => {
    const config = createTestConfig();

    const result = await getNodeDns(client, config, { node: 'invalid;node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('DNS query failed'));

    const result = await getNodeDns(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('DNS query failed');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig();
    const { sampleDnsConfig } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleDnsConfig);

    await getNodeDns(client, config, { node: 'pve1' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/dns');
  });
});

describe('getNetworkIface', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted interface details', async () => {
    const config = createTestConfig();
    const { sampleInterfaceDetail } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleInterfaceDetail);

    const result = await getNetworkIface(client, config, { node: 'pve1', iface: 'vmbr0' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🌐');
    expect(result.content[0].text).toContain('Network Interface');
    expect(result.content[0].text).toContain('vmbr0');
    expect(result.content[0].text).toContain('bridge');
    expect(result.content[0].text).toContain('192.168.1.100');
  });

  it('handles interface not found (API error)', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Interface not found'));

    const result = await getNetworkIface(client, config, { node: 'pve1', iface: 'vmbr99' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Interface not found');
  });

  it('validates node name', async () => {
    const config = createTestConfig();

    const result = await getNetworkIface(client, config, { node: 'invalid@node', iface: 'vmbr0' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('validates interface name (uses validateInterfaceName)', async () => {
    const config = createTestConfig();

    const result = await getNetworkIface(client, config, { node: 'pve1', iface: '@invalid' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Network error'));

    const result = await getNetworkIface(client, config, { node: 'pve1', iface: 'eth0' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Network error');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig();
    const { sampleInterfaceDetail } = await import('../__fixtures__/network.js');
    client.request.mockResolvedValue(sampleInterfaceDetail);

    await getNetworkIface(client, config, { node: 'pve1', iface: 'vmbr0' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network/vmbr0');
  });
});
