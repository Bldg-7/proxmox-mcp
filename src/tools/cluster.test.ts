import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { sampleNodes } from '../__fixtures__/nodes.js';
import { getClusterStatus, getNextVMID } from './cluster.js';

describe('getClusterStatus', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted cluster status', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🏗️  **Proxmox Cluster Status**');
    expect(result.content[0].text).toContain('Cluster Health');
    expect(result.content[0].text).toContain('**Nodes**');
  });

  it('shows healthy status when all nodes are online', async () => {
    const config = createTestConfig();
    const onlineNodes = sampleNodes.filter((n) => n.status === 'online');
    client.request.mockResolvedValue(onlineNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('🟢 Healthy');
  });

  it('shows warning status when some nodes are offline', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('🟡 Warning');
  });

  it('shows node count correctly', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('2/3 online');
  });

  it('includes resource usage with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('Resource Usage');
    expect(result.content[0].text).toContain('CPU:');
    expect(result.content[0].text).toContain('Memory:');
  });

  it('shows limited information without elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('⚠️  **Limited Information**');
    expect(result.content[0].text).toContain('requires elevated permissions');
  });

  it('lists all nodes in details section', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('Node Details');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('pve2');
    expect(result.content[0].text).toContain('pve3');
  });

  it('shows node status with emoji', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('🟢 pve1 - online');
    expect(result.content[0].text).toContain('🟢 pve2 - online');
    expect(result.content[0].text).toContain('🔴 pve3 - offline');
  });

  it('sorts nodes alphabetically', async () => {
    const config = createTestConfig();
    const unsortedNodes = [sampleNodes[2], sampleNodes[0], sampleNodes[1]];
    client.request.mockResolvedValue(unsortedNodes);

    const result = await getClusterStatus(client, config, {});

    const text = result.content[0].text;
    const pve1Index = text.indexOf('pve1');
    const pve2Index = text.indexOf('pve2');
    const pve3Index = text.indexOf('pve3');

    expect(pve1Index < pve2Index && pve2Index < pve3Index).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await getClusterStatus(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });

  it('gracefully handles cluster status API errors with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockImplementation((endpoint: string) => {
      if (endpoint === '/nodes') {
        return Promise.resolve(sampleNodes);
      }
      if (endpoint === '/cluster/status') {
        return Promise.reject(new Error('Cluster status unavailable'));
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const result = await getClusterStatus(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🏗️  **Proxmox Cluster Status**');
  });

  it('calculates resource usage correctly', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(sampleNodes);

    const result = await getClusterStatus(client, config, {});

    expect(result.content[0].text).toContain('Resource Usage');
    expect(result.content[0].text).toContain('%');
  });
});

describe('getNextVMID', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns next available VMID', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(100);

    const result = await getNextVMID(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Next Available VM/Container ID');
    expect(result.content[0].text).toContain('100');
  });

  it('returns different VMID values', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(250);

    const result = await getNextVMID(client, config, {});

    expect(result.content[0].text).toContain('250');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(100);

    await getNextVMID(client, config, {});

    expect(client.request).toHaveBeenCalledWith('/cluster/nextid');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Cluster unavailable'));

    const result = await getNextVMID(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Cluster unavailable');
  });

  it('formats output as markdown', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(500);

    const result = await getNextVMID(client, config, {});

    expect(result.content[0].text).toContain('**Next Available VM/Container ID**');
  });

  it('does not require elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });
    client.request.mockResolvedValue(100);

    const result = await getNextVMID(client, config, {});

    expect(result.isError).toBe(false);
  });
});
