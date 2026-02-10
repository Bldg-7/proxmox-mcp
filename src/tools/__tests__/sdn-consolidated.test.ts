import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  sampleSdnVnets,
  sampleSdnZones,
  sampleSdnControllers,
  sampleSdnSubnets,
} from '../../__fixtures__/sdn.js';
import {
  handleSdnVnetTool,
  handleSdnZoneTool,
  handleSdnControllerTool,
  handleSdnSubnetTool,
} from '../sdn.js';

describe('SDN consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('proxmox_sdn_vnet', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnVnets);

      const result = await handleSdnVnetTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Vnets');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/vnets');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnVnets[0]);

      const result = await handleSdnVnetTool(client, config, {
        action: 'get',
        vnet: 'vnet0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Vnet Details');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/vnets/vnet0');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnVnetTool(client, config, {
        action: 'create',
        vnet: 'vnet1',
        zone: 'zone0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ status: 'ok' });

      const result = await handleSdnVnetTool(client, config, {
        action: 'create',
        vnet: 'vnet1',
        zone: 'zone0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Vnet Created');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/vnets', 'POST', expect.any(Object));
    });

    it('requires elevated permissions for action=update', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnVnetTool(client, config, {
        action: 'update',
        vnet: 'vnet0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnVnetTool(client, config, {
        action: 'delete',
        vnet: 'vnet0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_sdn_zone', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnZones);

      const result = await handleSdnZoneTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Zones');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/zones');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnZones[0]);

      const result = await handleSdnZoneTool(client, config, {
        action: 'get',
        zone: 'zone0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Zone Details');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/zones/zone0');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnZoneTool(client, config, {
        action: 'create',
        zone: 'zone1',
        type: 'simple',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnZoneTool(client, config, {
        action: 'delete',
        zone: 'zone0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_sdn_controller', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnControllers);

      const result = await handleSdnControllerTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Controllers');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/controllers');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnControllers[0]);

      const result = await handleSdnControllerTool(client, config, {
        action: 'get',
        controller: 'ctrl0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Controller Details');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/controllers/ctrl0');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnControllerTool(client, config, {
        action: 'create',
        controller: 'ctrl1',
        type: 'evpn',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnControllerTool(client, config, {
        action: 'delete',
        controller: 'ctrl0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_sdn_subnet', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnSubnets);

      const result = await handleSdnSubnetTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Subnets');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/subnets');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleSdnSubnets[0]);

      const result = await handleSdnSubnetTool(client, config, {
        action: 'get',
        subnet: 'subnet0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SDN Subnet Details');
      expect(client.request).toHaveBeenCalledWith('/cluster/sdn/subnets/subnet0');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnSubnetTool(client, config, {
        action: 'create',
        subnet: 'subnet1',
        vnet: 'vnet0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleSdnSubnetTool(client, config, {
        action: 'delete',
        subnet: 'subnet0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });
});
