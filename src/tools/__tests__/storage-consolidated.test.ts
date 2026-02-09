import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleStorageConfigTool,
  handleStorageContentTool,
  handlePoolTool,
} from '../storage-management.js';

describe('Storage consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  // ── proxmox_storage_config ──────────────────────────────────────────
  describe('proxmox_storage_config', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { storage: 'local', type: 'dir', content: 'images,iso' },
      ]);

      const result = await handleStorageConfigTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Configurations');
      expect(client.request).toHaveBeenCalledWith('/storage');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ storage: 'local', type: 'dir' });

      const result = await handleStorageConfigTool(client, config, {
        action: 'get',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Configuration');
      expect(client.request).toHaveBeenCalledWith('/storage/local');
    });

    it('supports action=cluster_usage', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { storage: 'local', total: 1000000, used: 500000, avail: 500000, type: 'dir' },
      ]);

      const result = await handleStorageConfigTool(client, config, {
        action: 'cluster_usage',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/storage');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageConfigTool(client, config, {
        action: 'create',
        storage: 'nfs1',
        type: 'nfs',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleStorageConfigTool(client, config, {
        action: 'create',
        storage: 'nfs1',
        type: 'nfs',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Created');
      expect(client.request).toHaveBeenCalledWith('/storage', 'POST', expect.any(Object));
    });

    it('requires elevated permissions for action=update', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageConfigTool(client, config, {
        action: 'update',
        storage: 'local',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=update with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleStorageConfigTool(client, config, {
        action: 'update',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Updated');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageConfigTool(client, config, {
        action: 'delete',
        storage: 'local',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=delete with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleStorageConfigTool(client, config, {
        action: 'delete',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Deleted');
    });
  });

  // ── proxmox_storage_content ──────────────────────────────────────────
  describe('proxmox_storage_content', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { volid: 'local:iso/test.iso', content: 'iso', size: 1024 },
      ]);

      const result = await handleStorageContentTool(client, config, {
        action: 'list',
        node: 'pve1',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Content');
    });

    it('supports action=list_templates', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { volid: 'local:vztmpl/ubuntu.tar.gz', content: 'vztmpl' },
      ]);

      const result = await handleStorageContentTool(client, config, {
        action: 'list_templates',
        node: 'pve1',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
    });

    it('requires elevated permissions for action=upload', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageContentTool(client, config, {
        action: 'upload',
        node: 'pve1',
        storage: 'local',
        content: 'iso',
        filename: 'test.iso',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=upload with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:123');

      const result = await handleStorageContentTool(client, config, {
        action: 'upload',
        node: 'pve1',
        storage: 'local',
        content: 'iso',
        filename: 'test.iso',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Upload');
    });

    it('requires elevated permissions for action=download_url', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageContentTool(client, config, {
        action: 'download_url',
        node: 'pve1',
        storage: 'local',
        url: 'https://example.com/test.iso',
        content: 'iso',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageContentTool(client, config, {
        action: 'delete',
        node: 'pve1',
        storage: 'local',
        volume: 'local:iso/test.iso',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requires elevated permissions for action=prune', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleStorageContentTool(client, config, {
        action: 'prune',
        node: 'pve1',
        storage: 'local',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=prune with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleStorageContentTool(client, config, {
        action: 'prune',
        node: 'pve1',
        storage: 'local',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Prune');
    });
  });

  // ── proxmox_pool ──────────────────────────────────────────
  describe('proxmox_pool', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { poolid: 'pool1', comment: 'Test pool' },
      ]);

      const result = await handlePoolTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Pools');
      expect(client.request).toHaveBeenCalledWith('/pools');
    });

    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ poolid: 'pool1', comment: 'Test', members: [] });

      const result = await handlePoolTool(client, config, {
        action: 'get',
        poolid: 'pool1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Pool Details');
      expect(client.request).toHaveBeenCalledWith('/pools/pool1');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handlePoolTool(client, config, {
        action: 'create',
        poolid: 'pool2',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=create with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handlePoolTool(client, config, {
        action: 'create',
        poolid: 'pool2',
        comment: 'New pool',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Pool Created');
      expect(client.request).toHaveBeenCalledWith('/pools', 'POST', expect.any(Object));
    });

    it('requires elevated permissions for action=update', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handlePoolTool(client, config, {
        action: 'update',
        poolid: 'pool1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=update with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handlePoolTool(client, config, {
        action: 'update',
        poolid: 'pool1',
        comment: 'Updated comment',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Pool Updated');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handlePoolTool(client, config, {
        action: 'delete',
        poolid: 'pool1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('supports action=delete with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handlePoolTool(client, config, {
        action: 'delete',
        poolid: 'pool1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Pool Deleted');
    });
  });
});
