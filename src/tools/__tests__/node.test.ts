import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { sampleNodes } from '../../__fixtures__/nodes.js';
import { handleNodeTool } from '../node.js';

describe('handleNodeTool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('action=list', () => {
    it('returns formatted list of nodes', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleNodes);

      const result = await handleNodeTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Proxmox Cluster Nodes');
      expect(result.content[0].text).toContain('pve1');
    });

    it('handles empty node list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await handleNodeTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Proxmox Cluster Nodes');
    });

    it('handles API errors gracefully', async () => {
      const config = createTestConfig();
      client.request.mockRejectedValue(new Error('Connection failed'));

      const result = await handleNodeTool(client, config, { action: 'list' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Connection failed');
    });
  });

  describe('action=status', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleNodeTool(client, config, { action: 'status', node: 'pve1' });

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

      const result = await handleNodeTool(client, config, { action: 'status', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node pve1 Status');
      expect(result.content[0].text).toContain('Online');
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

      await handleNodeTool(client, config, { action: 'status', node: 'pve1' });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/status');
    });
  });

  describe('action=network', () => {
    it('returns formatted list of interfaces', async () => {
      const config = createTestConfig();
      const { sampleNetworkInterfaces } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleNetworkInterfaces);

      const result = await handleNodeTool(client, config, { action: 'network', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Network Interfaces');
      expect(result.content[0].text).toContain('vmbr0');
    });

    it('handles empty interface list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await handleNodeTool(client, config, { action: 'network', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('No network interfaces found');
    });

    it('passes type filter', async () => {
      const config = createTestConfig();
      const { sampleNetworkInterfaces } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleNetworkInterfaces);

      await handleNodeTool(client, config, { action: 'network', node: 'pve1', type: 'bridge' });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network?type=bridge');
    });
  });

  describe('action=dns', () => {
    it('returns formatted DNS configuration', async () => {
      const config = createTestConfig();
      const { sampleDnsConfig } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleDnsConfig);

      const result = await handleNodeTool(client, config, { action: 'dns', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('DNS Configuration');
      expect(result.content[0].text).toContain('8.8.8.8');
    });

    it('calls correct API endpoint', async () => {
      const config = createTestConfig();
      const { sampleDnsConfig } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleDnsConfig);

      await handleNodeTool(client, config, { action: 'dns', node: 'pve1' });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/dns');
    });
  });

  describe('action=iface', () => {
    it('returns formatted interface details', async () => {
      const config = createTestConfig();
      const { sampleInterfaceDetail } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleInterfaceDetail);

      const result = await handleNodeTool(client, config, { action: 'iface', node: 'pve1', iface: 'vmbr0' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Network Interface');
      expect(result.content[0].text).toContain('vmbr0');
    });

    it('calls correct API endpoint', async () => {
      const config = createTestConfig();
      const { sampleInterfaceDetail } = await import('../../__fixtures__/network.js');
      client.request.mockResolvedValue(sampleInterfaceDetail);

      await handleNodeTool(client, config, { action: 'iface', node: 'pve1', iface: 'vmbr0' });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network/vmbr0');
    });

    it('validates interface name', async () => {
      const config = createTestConfig();

      const result = await handleNodeTool(client, config, { action: 'iface', node: 'pve1', iface: '@invalid' });

      expect(result.isError).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('returns error for unknown action', async () => {
      const config = createTestConfig();

      const result = await handleNodeTool(client, config, { action: 'unknown' as any });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
