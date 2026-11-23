import { describe, it, expect, beforeEach, vi } from 'vitest';
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
      request_id: '7cf49d08-8647-439b-88ec-16b154c5a3e1',
      node: 'pve1', storage: 'local', content: 'iso', filename: 'ubuntu.iso',
    });

    expect(result.isError).toBe(true);
  });

  it('fails closed without a local file policy', async () => {
    const config = createTestConfig({ allowElevated: true });
    const upload = vi.spyOn(client.storageTransfer, 'upload');
    const result = await uploadToStorage(client, config, {
      request_id: '9f4e8485-e3a6-4b8d-8d56-943731aa45d1',
      node: 'pve1',
      storage: 'local',
      content: 'iso',
      filename: 'ubuntu.iso',
    });

    expect(result.isError).toBe(true);
    expect(client.request).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
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

  const target = { node: 'lab', storage: 'pbs', volume: 'backup/vm/102/t' };
  it('checks permission before contacting PVE', async () => {
    const list = vi.spyOn(client.storageTransfer, 'list');
    const result = await listFileRestore(client, createTestConfig(), target);
    expect(result.isError).toBe(true);
    expect(list).not.toHaveBeenCalled();
  });

  it.each([{filepath:'/etc/hosts'}, {path:'//8=',filepath:'/'}, {filepath:'//9='}])('rejects ambiguous or noncanonical input %j', async args => {
    const list = vi.spyOn(client.storageTransfer, 'list');
    const result = await listFileRestore(client, createTestConfig({allowElevated:true}), {...target,...args});
    expect(result.isError).toBe(true); expect(list).not.toHaveBeenCalled();
  });

  it('accepts opaque binary legacy path and bounds rendered output', async () => {
    const list = vi.spyOn(client.storageTransfer, 'list').mockResolvedValue(Array(101).fill(sampleFileRestoreList[0]));
    const result = await listFileRestore(client, createTestConfig({allowElevated:true}), {...target,path:'//8='});
    expect(list).toHaveBeenCalledWith({...target,filepath:'//8='});
    expect(result.content[0].text).toContain('Shown 100 of 101 entries (output truncated)');
    expect(result.content[0].text).toContain('"leaf":true');
  });

  it('rejects an invalid upstream listing instead of displaying an unusable ID', async () => {
    vi.spyOn(client.storageTransfer, 'list').mockResolvedValue([{text:'etc',filepath:'/plain/path',leaf:0,type:'d'}]);
    const result = await listFileRestore(client, createTestConfig({allowElevated:true}), target);
    expect(result.isError).toBe(true);
  });

  it('lists files available for restore', async () => {
    const config = createTestConfig({ allowElevated: true });
    const list = vi.spyOn(client.storageTransfer, 'list').mockResolvedValue(sampleFileRestoreList);

    const target = {node: 'pve1', storage: 'pbs', volume: 'pbs:backup/vm/100/2024-01-01T12:00:00Z'};
    const result = await listFileRestore(client, config, target);
    expect(list).toHaveBeenCalledWith({...target, filepath: '/'});
    const id = sampleFileRestoreList[1].filepath;
    expect(result.content[0].text).toContain(id);
    await listFileRestore(client, config, {...target, filepath: id});
    expect(list).toHaveBeenLastCalledWith({...target, filepath: id});

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

  it('does not request binary data before local transfer support is enabled', async () => {
    const config = createTestConfig({ allowElevated: true });
    const download = vi.spyOn(client.storageTransfer, 'download');

    const result = await downloadFileRestore(client, config, {
      request_id: '7cf49d08-8647-439b-88ec-16b154c5a3e1',
      node: 'pve1',
      storage: 'backup-nfs',
      volume: 'backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst',
      filepath: '/etc/hosts',
    });

    expect(result.isError).toBe(true);
    expect(client.request).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
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
