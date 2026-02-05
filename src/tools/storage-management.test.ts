import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleStorageConfigs,
  sampleStorageConfig,
  sampleStorageContent,
  sampleFileRestoreList,
  samplePruneResult,
} from '../__fixtures__/storage-management.js';
import {
  listStorageConfig,
  getStorageConfig,
  createStorage,
  updateStorage,
  deleteStorage,
  uploadToStorage,
  downloadUrlToStorage,
  listStorageContent,
  deleteStorageContent,
  listFileRestore,
  downloadFileRestore,
  pruneBackups,
} from './storage-management.js';

describe('listStorageConfig', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted storage configurations', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleStorageConfigs);

    const result = await listStorageConfig(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Storage Configurations');
    expect(result.content[0].text).toContain('backup-nfs');
  });
});

describe('getStorageConfig', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns storage configuration details', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleStorageConfig);

    const result = await getStorageConfig(client, config, { storage: 'backup-nfs' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('backup-nfs');
    expect(result.content[0].text).toContain('nfs');
  });
});

describe('createStorage', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createStorage(client, config, {
      storage: 'backup-nfs',
      type: 'nfs',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createStorage(client, config, {
      storage: 'backup-nfs',
      type: 'nfs',
      server: '10.0.0.10',
      export: '/exports/backups',
    });

    expect(client.request).toHaveBeenCalledWith('/storage', 'POST', {
      storage: 'backup-nfs',
      type: 'nfs',
      server: '10.0.0.10',
      export: '/exports/backups',
    });
  });
});

describe('updateStorage', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates storage configuration', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateStorage(client, config, {
      storage: 'backup-nfs',
      content: 'backup',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Storage Updated');
  });
});

describe('deleteStorage', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes storage configuration', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteStorage(client, config, { storage: 'backup-nfs' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/storage/backup-nfs', 'DELETE');
  });
});

describe('uploadToStorage', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await uploadToStorage(client, config, {
      node: 'pve1',
      storage: 'local',
      content: 'iso',
      filename: 'ubuntu.iso',
    });

    expect(result.isError).toBe(true);
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await uploadToStorage(client, config, {
      node: 'pve1',
      storage: 'local',
      content: 'iso',
      filename: 'ubuntu.iso',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/storage/local/upload',
      'POST',
      {
        content: 'iso',
        filename: 'ubuntu.iso',
      }
    );
  });
});

describe('downloadUrlToStorage', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('downloads from URL to storage', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await downloadUrlToStorage(client, config, {
      node: 'pve1',
      storage: 'local',
      url: 'https://example.com/ubuntu.iso',
      content: 'iso',
      filename: 'ubuntu.iso',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('URL Download Started');
  });
});

describe('listStorageContent', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists storage content', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleStorageContent);

    const result = await listStorageContent(client, config, {
      node: 'pve1',
      storage: 'local',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Storage Content');
    expect(result.content[0].text).toContain('ubuntu-22.04.iso');
  });
});

describe('deleteStorageContent', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes storage content by volume', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await deleteStorageContent(client, config, {
      node: 'pve1',
      storage: 'local',
      volume: 'local:iso/ubuntu.iso',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/storage/local/content/local%3Aiso%2Fubuntu.iso',
      'DELETE'
    );
  });
});

describe('listFileRestore', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists files available for restore', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleFileRestoreList);

    const result = await listFileRestore(client, config, {
      node: 'pve1',
      storage: 'backup-nfs',
      volume: 'backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('File Restore Listing');
    expect(result.content[0].text).toContain('/etc/hosts');
  });
});

describe('downloadFileRestore', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('downloads file from backup', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue('OK');

    const result = await downloadFileRestore(client, config, {
      node: 'pve1',
      storage: 'backup-nfs',
      volume: 'backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst',
      filepath: '/etc/hosts',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('File Restore Download');
  });
});

describe('pruneBackups', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await pruneBackups(client, config, {
      node: 'pve1',
      storage: 'backup-nfs',
    });

    expect(result.isError).toBe(true);
  });

  it('prunes backups with retention options', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(samplePruneResult);

    const result = await pruneBackups(client, config, {
      node: 'pve1',
      storage: 'backup-nfs',
      'keep-last': 2,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Prune Backups');
  });
});
