import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  createBackupLxc,
  createBackupVM,
  listBackups,
  restoreBackupLxc,
  restoreBackupVM,
  deleteBackup,
} from './backup.js';

describe('createBackupLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createBackupLxc(client, config, {
      node: 'pve1',
      vmid: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('creates backup with default options', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await createBackupLxc(client, config, {
      node: 'pve1',
      vmid: 100,
    });

    expect(result.content[0].text).toContain('💾');
    expect(result.content[0].text).toContain('Backup Creation Started');
    expect(result.content[0].text).toContain('100');
    expect(result.content[0].text).toContain('local');
    expect(result.content[0].text).toContain('snapshot');
    expect(result.content[0].text).toContain('zstd');
    expect(result.isError).toBe(false);
  });

  it('creates backup with custom options', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await createBackupLxc(client, config, {
      node: 'pve1',
      vmid: 100,
      storage: 'backup-storage',
      mode: 'suspend',
      compress: 'gzip',
    });

    expect(result.content[0].text).toContain('backup-storage');
    expect(result.content[0].text).toContain('suspend');
    expect(result.content[0].text).toContain('gzip');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await createBackupLxc(client, config, {
      node: 'pve1',
      vmid: 100,
      storage: 'local',
      mode: 'snapshot',
      compress: 'zstd',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/vzdump',
      'POST',
      {
        vmid: '100',
        storage: 'local',
        mode: 'snapshot',
        compress: 'zstd',
      }
    );
  });
});

describe('createBackupVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await createBackupVM(client, config, {
      node: 'pve1',
      vmid: 200,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('creates VM backup with default options', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await createBackupVM(client, config, {
      node: 'pve1',
      vmid: 200,
    });

    expect(result.content[0].text).toContain('💾');
    expect(result.content[0].text).toContain('Backup Creation Started');
    expect(result.content[0].text).toContain('200');
    expect(result.content[0].text).toContain('local');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await createBackupVM(client, config, {
      node: 'pve1',
      vmid: 200,
      storage: 'local',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/vzdump',
      'POST',
      expect.objectContaining({
        vmid: '200',
        storage: 'local',
      })
    );
  });
});

describe('listBackups', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await listBackups(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('shows message when no backups found', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue([]);

    const result = await listBackups(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('📦');
    expect(result.content[0].text).toContain('No backups found');
    expect(result.isError).toBe(false);
  });

  it('lists backups with parsed metadata', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });

    const mockBackups = [
      {
        volid: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
        size: 1073741824,
        ctime: 1704110400,
      },
      {
        volid: 'local:backup/vzdump-qemu-200-2024_01_02-12_00_00.vma.zst',
        size: 2147483648,
        ctime: 1704196800,
      },
    ];
    client.request.mockResolvedValue(mockBackups);

    const result = await listBackups(client, config, { node: 'pve1' });

    expect(result.content[0].text).toContain('📦');
    expect(result.content[0].text).toContain('vzdump-lxc-100');
    expect(result.content[0].text).toContain('LXC');
    expect(result.content[0].text).toContain('100');
    expect(result.content[0].text).toContain('vzdump-qemu-200');
    expect(result.content[0].text).toContain('QEMU');
    expect(result.content[0].text).toContain('200');
    expect(result.content[0].text).toContain('1 GB');
    expect(result.content[0].text).toContain('2 GB');
    expect(result.content[0].text).toContain('2 backup(s)');
    expect(result.isError).toBe(false);
  });

  it('sorts backups by date (newest first)', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });

    const mockBackups = [
      {
        volid: 'local:backup/old.tar',
        ctime: 1704110400,
      },
      {
        volid: 'local:backup/new.tar',
        ctime: 1704196800,
      },
    ];
    client.request.mockResolvedValue(mockBackups);

    const result = await listBackups(client, config, { node: 'pve1' });

    const text = result.content[0].text;
    const newIndex = text.indexOf('new.tar');
    const oldIndex = text.indexOf('old.tar');
    expect(newIndex).toBeLessThan(oldIndex);
  });

  it('calls correct API endpoint with default storage', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue([]);

    await listBackups(client, config, { node: 'pve1' });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/storage/local/content?content=backup'
    );
  });

  it('calls correct API endpoint with custom storage', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue([]);

    await listBackups(client, config, { node: 'pve1', storage: 'backup-storage' });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/storage/backup-storage/content?content=backup'
    );
  });
});

describe('restoreBackupLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await restoreBackupLxc(client, config, {
      node: 'pve1',
      vmid: 101,
      archive: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('restores backup with required parameters', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await restoreBackupLxc(client, config, {
      node: 'pve1',
      vmid: 101,
      archive: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
    });

    expect(result.content[0].text).toContain('♻️');
    expect(result.content[0].text).toContain('Backup Restore Started');
    expect(result.content[0].text).toContain('101');
    expect(result.content[0].text).toContain('local:backup/vzdump-lxc-100');
    expect(result.isError).toBe(false);
  });

  it('restores backup with optional storage parameter', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await restoreBackupLxc(client, config, {
      node: 'pve1',
      vmid: 101,
      archive: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
      storage: 'local-lvm',
    });

    expect(result.content[0].text).toContain('local-lvm');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await restoreBackupLxc(client, config, {
      node: 'pve1',
      vmid: 101,
      archive: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
      storage: 'local-lvm',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc',
      'POST',
      {
        vmid: '101',
        archive: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
        restore: 1,
        storage: 'local-lvm',
      }
    );
  });
});

describe('restoreBackupVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await restoreBackupVM(client, config, {
      node: 'pve1',
      vmid: 201,
      archive: 'local:backup/vzdump-qemu-200-2024_01_01-12_00_00.vma.zst',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('restores VM backup with required parameters', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await restoreBackupVM(client, config, {
      node: 'pve1',
      vmid: 201,
      archive: 'local:backup/vzdump-qemu-200-2024_01_01-12_00_00.vma.zst',
    });

    expect(result.content[0].text).toContain('♻️');
    expect(result.content[0].text).toContain('Backup Restore Started');
    expect(result.content[0].text).toContain('201');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await restoreBackupVM(client, config, {
      node: 'pve1',
      vmid: 201,
      archive: 'local:backup/vzdump-qemu-200-2024_01_01-12_00_00.vma.zst',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu',
      'POST',
      expect.objectContaining({
        vmid: '201',
        archive: 'local:backup/vzdump-qemu-200-2024_01_01-12_00_00.vma.zst',
        restore: 1,
      })
    );
  });
});

describe('deleteBackup', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteBackup(client, config, {
      node: 'pve1',
      storage: 'local',
      volume: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('deletes backup with correct parameters', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await deleteBackup(client, config, {
      node: 'pve1',
      storage: 'local',
      volume: 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst',
    });

    expect(result.content[0].text).toContain('🗑️');
    expect(result.content[0].text).toContain('Backup Deletion Started');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('local');
    expect(result.content[0].text).toContain('permanent');
    expect(result.isError).toBe(false);
  });

  it('URL-encodes the volume parameter', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const volumeWithSpecialChars = 'local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst';

    await deleteBackup(client, config, {
      node: 'pve1',
      storage: 'local',
      volume: volumeWithSpecialChars,
    });

    const encodedVolume = encodeURIComponent(volumeWithSpecialChars);
    expect(client.request).toHaveBeenCalledWith(
      `/nodes/pve1/storage/local/content/${encodedVolume}`,
      'DELETE'
    );
  });

  it('calls correct API endpoint', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await deleteBackup(client, config, {
      node: 'pve1',
      storage: 'local',
      volume: 'local:backup/test.tar.zst',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/storage/local/content/local%3Abackup%2Ftest.tar.zst',
      'DELETE'
    );
  });
});
