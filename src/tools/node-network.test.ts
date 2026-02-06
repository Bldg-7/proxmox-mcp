import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleCreateNetworkIface,
  sampleUpdateNetworkIface,
  sampleApplyNetworkConfig,
} from '../__fixtures__/node-network.js';
import {
  createNetworkIface,
  updateNetworkIface,
  deleteNetworkIface,
  applyNetworkConfig,
} from './node-network.js';

describe('Node Network Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('createNetworkIface', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await createNetworkIface(client, config, sampleCreateNetworkIface);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission');
    });

    it('creates a network interface with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await createNetworkIface(client, config, sampleCreateNetworkIface);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Network Interface Created');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network', 'POST', {
        iface: 'vmbr1',
        type: 'bridge',
        bridge_ports: 'eth0',
        bridge_stp: 'on',
        bridge_fd: '0',
        autostart: true,
        comment: 'Secondary bridge',
      });
    });

    it('validates interface name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await createNetworkIface(client, config, {
        node: 'pve1',
        iface: '1eth',
        type: 'bridge',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid interface name format');
    });
  });

  describe('updateNetworkIface', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await updateNetworkIface(client, config, sampleUpdateNetworkIface);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission');
    });

    it('updates a network interface with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await updateNetworkIface(client, config, sampleUpdateNetworkIface);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Network Interface Updated');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network/vmbr1', 'PUT', {
        bridge_ports: 'eth1',
        mtu: 9000,
        comment: 'Updated bridge config',
        delete: 'bridge_fd',
      });
    });
  });

  describe('deleteNetworkIface', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await deleteNetworkIface(client, config, {
        node: 'pve1',
        iface: 'vmbr1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission');
    });

    it('deletes a network interface', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await deleteNetworkIface(client, config, {
        node: 'pve1',
        iface: 'vmbr1',
        digest: 'deadbeef',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Network Interface Deleted');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/network/vmbr1',
        'DELETE',
        { digest: 'deadbeef' }
      );
    });
  });

  describe('applyNetworkConfig', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await applyNetworkConfig(client, config, sampleApplyNetworkConfig);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission');
    });

    it('applies network configuration changes', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await applyNetworkConfig(client, config, sampleApplyNetworkConfig);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Network Configuration Applied');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/network', 'PUT', {
        revert: true,
      });
    });
  });
});
