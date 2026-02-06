import { describe, it, expect } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleSdnVnets,
  sampleSdnVnetDetail,
  sampleSdnZones,
  sampleSdnZoneDetail,
  sampleSdnControllers,
  sampleSdnControllerDetail,
  sampleSdnSubnets,
  sampleSdnSubnetDetail,
} from '../__fixtures__/sdn.js';
import {
  listSdnVnets,
  getSdnVnet,
  createSdnVnet,
  updateSdnVnet,
  deleteSdnVnet,
  listSdnZones,
  getSdnZone,
  createSdnZone,
  updateSdnZone,
  deleteSdnZone,
  listSdnControllers,
  getSdnController,
  createSdnController,
  updateSdnController,
  deleteSdnController,
  listSdnSubnets,
  getSdnSubnet,
  createSdnSubnet,
  updateSdnSubnet,
  deleteSdnSubnet,
} from './sdn.js';

describe('SDN Tools', () => {
  it('lists SDN vnets', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnVnets);

    const result = await listSdnVnets(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('SDN Vnets');
    expect(result.content[0].text).toContain('vnet-prod');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/vnets');
  });

  it('gets SDN vnet details', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnVnetDetail);

    const result = await getSdnVnet(client, config, { vnet: 'vnet-prod' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('vnet-prod');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/vnets/vnet-prod');
  });

  it('requires elevated permissions to create SDN vnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createSdnVnet(client, config, {
      vnet: 'vnet-prod',
      zone: 'zone-core',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to update SDN vnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await updateSdnVnet(client, config, {
      vnet: 'vnet-prod',
      tag: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to delete SDN vnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteSdnVnet(client, config, { vnet: 'vnet-prod' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('lists SDN zones', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnZones);

    const result = await listSdnZones(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('SDN Zones');
    expect(result.content[0].text).toContain('zone-core');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/zones');
  });

  it('gets SDN zone details', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnZoneDetail);

    const result = await getSdnZone(client, config, { zone: 'zone-core' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('zone-core');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/zones/zone-core');
  });

  it('requires elevated permissions to create SDN zone', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createSdnZone(client, config, { zone: 'zone-core', type: 'vxlan' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to update SDN zone', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await updateSdnZone(client, config, { zone: 'zone-core', mtu: 1500 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to delete SDN zone', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteSdnZone(client, config, { zone: 'zone-core' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('lists SDN controllers', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnControllers);

    const result = await listSdnControllers(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('SDN Controllers');
    expect(result.content[0].text).toContain('ctrl-1');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/controllers');
  });

  it('gets SDN controller details', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnControllerDetail);

    const result = await getSdnController(client, config, { controller: 'ctrl-1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('ctrl-1');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/controllers/ctrl-1');
  });

  it('requires elevated permissions to create SDN controller', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createSdnController(client, config, { controller: 'ctrl-1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to update SDN controller', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await updateSdnController(client, config, {
      controller: 'ctrl-1',
      ip: '10.0.0.20',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to delete SDN controller', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteSdnController(client, config, { controller: 'ctrl-1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('lists SDN subnets', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnSubnets);

    const result = await listSdnSubnets(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('SDN Subnets');
    expect(result.content[0].text).toContain('subnet-prod');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/subnets');
  });

  it('gets SDN subnet details', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleSdnSubnetDetail);

    const result = await getSdnSubnet(client, config, { subnet: 'subnet-prod' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('subnet-prod');
    expect(client.request).toHaveBeenCalledWith('/cluster/sdn/subnets/subnet-prod');
  });

  it('requires elevated permissions to create SDN subnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createSdnSubnet(client, config, {
      subnet: 'subnet-prod',
      cidr: '10.10.0.0/24',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to update SDN subnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await updateSdnSubnet(client, config, {
      subnet: 'subnet-prod',
      dhcp: true,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('requires elevated permissions to delete SDN subnet', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteSdnSubnet(client, config, { subnet: 'subnet-prod' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
});
