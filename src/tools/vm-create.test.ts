import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import { listTemplates, createLxc, createVM } from './vm-create.js';

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

describe('VM Creation Tools', () => {
  describe('listTemplates', () => {
    it('lists available templates', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue([
        {
          volid: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
          size: 314572800,
        },
        {
          volid: 'local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.gz',
          size: 419430400,
        },
      ]);

      const result = await listTemplates(client, config, {
        node: 'pve1',
        storage: 'local',
      });

      expect(result.content[0].text).toContain('📋');
      expect(result.content[0].text).toContain('debian-12');
      expect(result.content[0].text).toContain('ubuntu-22.04');
      expect(result.isError).toBe(false);
    });

    it('handles empty template list', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue([]);

      const result = await listTemplates(client, config, {
        node: 'pve1',
        storage: 'local',
      });

      expect(result.content[0].text).toContain('No templates found');
      expect(result.content[0].text).toContain('Tip');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await listTemplates(client, config, {
        node: 'invalid@node',
        storage: 'local',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates storage name', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await listTemplates(client, config, {
        node: 'pve1',
        storage: 'invalid@storage',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid storage name');
    });
  });

  describe('createLxc', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await createLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        ostemplate: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('generates password if not provided', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        ostemplate: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
      });

      expect(result.content[0].text).toContain('📦');
      expect(result.content[0].text).toContain('Generated Password');
      expect(result.content[0].text).toContain('SAVE THIS PASSWORD');
      expect(result.isError).toBe(false);
    });

    it('uses provided password', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        ostemplate: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
        password: 'MySecurePassword123!',
      });

      expect(result.content[0].text).toContain('📦');
      expect(result.content[0].text).toContain('lxc-100');
      expect(result.isError).toBe(false);
    });

    it('creates container with custom hostname', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        ostemplate: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
        hostname: 'mycontainer',
        memory: 1024,
        storage: 'local-lvm',
        rootfs: '16',
      });

      expect(result.content[0].text).toContain('mycontainer');
      expect(result.content[0].text).toContain('1024 MB');
      expect(result.content[0].text).toContain('local-lvm:16');
      expect(result.isError).toBe(false);
    });

    it('validates VM ID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await createLxc(client, config, {
        node: 'pve1',
        vmid: 50,
        ostemplate: 'local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });

  describe('createVM', () => {
    it('requires elevated permissions', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: false });

      const result = await createVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('creates VM with minimal config', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('🖥️');
      expect(result.content[0].text).toContain('vm-100');
      expect(result.content[0].text).toContain('512 MB');
      expect(result.content[0].text).toContain('1 socket(s), 1 core(s)');
      expect(result.isError).toBe(false);
    });

    it('creates VM with custom config', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createVM(client, config, {
        node: 'pve1',
        vmid: 100,
        name: 'myvm',
        memory: 2048,
        cores: 4,
        sockets: 2,
        disk_size: '20G',
        storage: 'local-lvm',
        iso: 'local:iso/debian-12.2-amd64-netinst.iso',
        ostype: 'l26',
        net0: 'virtio,bridge=vmbr0',
      });

      expect(result.content[0].text).toContain('myvm');
      expect(result.content[0].text).toContain('2048 MB');
      expect(result.content[0].text).toContain('2 socket(s), 4 core(s)');
      expect(result.content[0].text).toContain('local-lvm:20');
      expect(result.content[0].text).toContain('debian-12.2');
      expect(result.isError).toBe(false);
    });

    it('handles disk size with various formats', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();
      (client.request as any).mockResolvedValue('UPID:pve1:00001234');

      const result = await createVM(client, config, {
        node: 'pve1',
        vmid: 100,
        disk_size: '50G',
      });

      expect(result.content[0].text).toContain('local-lvm:50');
      expect(result.isError).toBe(false);
    });

    it('validates VM ID', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig();

      const result = await createVM(client, config, {
        node: 'pve1',
        vmid: 50,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });
});
