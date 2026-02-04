import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { sampleNodes } from '../__fixtures__/nodes.js';
import { getNodes, getNodeStatus } from './node.js';

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
