import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import {
  addNetworkVm,
  addNetworkLxc,
  updateNetworkVm,
  updateNetworkLxc,
  removeNetworkVm,
  removeNetworkLxc,
} from './network.js';

function createMockProxmoxClient(): ProxmoxApiClient {
  return {
    request: vi.fn(),
  } as unknown as ProxmoxApiClient;
}

function createTestConfig(overrides?: Partial<Config>): Config {
  return {
    allowElevated: true,
    ...overrides,
  } as Config;
}

describe('Network Tools', () => {
  describe('addNetworkVm', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await addNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('adds network with minimal config', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await addNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
      });

      expect(result.content[0].text).toContain('🌐');
      expect(result.content[0].text).toContain('net0');
      expect(result.content[0].text).toContain('vmbr0');
      expect(result.content[0].text).toContain('virtio');
      expect(result.isError).toBe(false);
    });

    it('adds network with full config', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await addNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
        model: 'e1000',
        macaddr: 'AA:BB:CC:DD:EE:FF',
        vlan: 100,
        firewall: true,
      });

      expect(result.content[0].text).toContain('e1000');
      expect(result.content[0].text).toContain('AA:BB:CC:DD:EE:FF');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('Firewall');
      expect(result.isError).toBe(false);
    });

    it('validates network interface name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await addNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'invalid',
        bridge: 'vmbr0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid network identifier');
    });

    it('validates bridge name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await addNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'invalid',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid bridge name');
    });
  });

  describe('addNetworkLxc', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await addNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('adds network with minimal config', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await addNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
      });

      expect(result.content[0].text).toContain('🌐');
      expect(result.content[0].text).toContain('net0');
      expect(result.content[0].text).toContain('eth0');
      expect(result.content[0].text).toContain('vmbr0');
      expect(result.isError).toBe(false);
    });

    it('adds network with IP and gateway', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await addNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
        ip: '192.168.1.100/24',
        gw: '192.168.1.1',
        firewall: true,
      });

      expect(result.content[0].text).toContain('192.168.1.100/24');
      expect(result.content[0].text).toContain('192.168.1.1');
      expect(result.content[0].text).toContain('Firewall');
      expect(result.isError).toBe(false);
    });
  });

  describe('updateNetworkVm', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await updateNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('updates network bridge', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any)
        .mockResolvedValueOnce({
          net0: 'model=virtio,bridge=vmbr0',
        })
        .mockResolvedValueOnce('UPID:pve1:00001234');

      const result = await updateNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr1',
      });

      expect(result.content[0].text).toContain('🔧');
      expect(result.content[0].text).toContain('vmbr1');
      expect(result.isError).toBe(false);
    });

    it('returns error if network does not exist', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValueOnce({});

      const result = await updateNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('does not exist');
    });
  });

  describe('updateNetworkLxc', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await updateNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        ip: 'dhcp',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('updates network IP address', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any)
        .mockResolvedValueOnce({
          net0: 'name=eth0,bridge=vmbr0,ip=dhcp',
        })
        .mockResolvedValueOnce('UPID:pve1:00001234');

      const result = await updateNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        ip: '192.168.1.100/24',
      });

      expect(result.content[0].text).toContain('🔧');
      expect(result.content[0].text).toContain('192.168.1.100/24');
      expect(result.isError).toBe(false);
    });
  });

  describe('removeNetworkVm', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await removeNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('removes network interface', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await removeNetworkVm(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
      });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('net0');
      expect(result.isError).toBe(false);
    });
  });

  describe('removeNetworkLxc', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await removeNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('removes network interface', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await removeNetworkLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        net: 'net0',
      });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('net0');
      expect(result.isError).toBe(false);
    });
  });
});
