import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleCephTool,
  handleCephOsdTool,
  handleCephMonTool,
  handleCephMdsTool,
  handleCephPoolTool,
  handleCephFsTool,
} from '../ceph.js';

describe('Ceph consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('proxmox_ceph (status - from Task 3)', () => {
    it('supports action=status', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({
        health: { status: 'HEALTH_OK' },
        fsid: 'abc-123',
      });

      const result = await handleCephTool(client, config, {
        action: 'status',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Status');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/status');
    });
  });

  describe('proxmox_ceph_osd', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { id: 0, up: true, in: true, host: 'pve1' },
      ]);

      const result = await handleCephOsdTool(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph OSDs');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/osd');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephOsdTool(client, config, {
        action: 'create',
        node: 'pve1',
        dev: '/dev/sdb',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:123');

      const result = await handleCephOsdTool(client, config, {
        action: 'create',
        node: 'pve1',
        dev: '/dev/sdb',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph OSD Creation Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/osd', 'POST', expect.any(Object));
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephOsdTool(client, config, {
        action: 'delete',
        node: 'pve1',
        id: 0,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=delete with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephOsdTool(client, config, {
        action: 'delete',
        node: 'pve1',
        id: 0,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph OSD Deleted');
    });
  });

  describe('proxmox_ceph_mon', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { name: 'mon0', rank: 0, addr: '10.0.0.1' },
      ]);

      const result = await handleCephMonTool(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Monitors');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mon');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephMonTool(client, config, {
        action: 'create',
        node: 'pve1',
        monid: 'mon1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephMonTool(client, config, {
        action: 'create',
        node: 'pve1',
        monid: 'mon1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Monitor Created');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephMonTool(client, config, {
        action: 'delete',
        node: 'pve1',
        monid: 'mon0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_ceph_mds', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { name: 'mds0', state: 'active' },
      ]);

      const result = await handleCephMdsTool(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph MDS');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mds');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephMdsTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'mds1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephMdsTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'mds1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph MDS Created');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephMdsTool(client, config, {
        action: 'delete',
        node: 'pve1',
        name: 'mds0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_ceph_pool', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { name: 'rbd', size: 3, min_size: 2, pg_num: 128 },
      ]);

      const result = await handleCephPoolTool(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Pools');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/pools');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephPoolTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'newpool',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephPoolTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'newpool',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Pool Created');
    });

    it('requires elevated permissions for action=update', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephPoolTool(client, config, {
        action: 'update',
        node: 'pve1',
        name: 'rbd',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=update with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephPoolTool(client, config, {
        action: 'update',
        node: 'pve1',
        name: 'rbd',
        size: 2,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Pool Updated');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephPoolTool(client, config, {
        action: 'delete',
        node: 'pve1',
        name: 'oldpool',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_ceph_fs', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { name: 'cephfs', metadata_pool: 'cephfs-metadata' },
      ]);

      const result = await handleCephFsTool(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Filesystems');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/fs');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleCephFsTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'newfs',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleCephFsTool(client, config, {
        action: 'create',
        node: 'pve1',
        name: 'newfs',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Filesystem Created');
    });
  });
});
