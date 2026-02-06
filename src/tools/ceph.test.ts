import { beforeEach, describe, expect, it } from 'vitest';

import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleCephStatus,
  sampleCephOsds,
  sampleCephMons,
  sampleCephMds,
  sampleCephPools,
  sampleCephFilesystems,
} from '../__fixtures__/ceph.js';
import {
  getCephStatus,
  listCephOsds,
  createCephOsd,
  deleteCephOsd,
  listCephMons,
  createCephMon,
  deleteCephMon,
  listCephMds,
  createCephMds,
  deleteCephMds,
  listCephPools,
  createCephPool,
  updateCephPool,
  deleteCephPool,
  listCephFs,
  createCephFs,
} from './ceph.js';

describe('getCephStatus', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted Ceph status', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephStatus);

    const result = await getCephStatus(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Ceph Status');
    expect(result.content[0].text).toContain('HEALTH_OK');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/status');
  });
});

describe('listCephOsds', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists Ceph OSDs', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephOsds);

    const result = await listCephOsds(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('osd.0');
  });
});

describe('createCephOsd', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createCephOsd(client, config, { node: 'pve1', dev: '/dev/sdb' });

    expect(result.isError).toBe(true);
  });

  it('creates an OSD with payload', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:osd');

    await createCephOsd(client, config, {
      node: 'pve1',
      dev: '/dev/sdb',
      osdid: 3,
      waldev: '/dev/nvme0n1',
    });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/osd', 'POST', {
      dev: '/dev/sdb',
      osdid: 3,
      waldev: '/dev/nvme0n1',
    });
  });
});

describe('deleteCephOsd', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes an OSD', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteCephOsd(client, config, { node: 'pve1', id: 1 });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/osd/1', 'DELETE');
  });
});

describe('listCephMons', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists monitors', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephMons);

    const result = await listCephMons(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('mon1');
  });
});

describe('createCephMon', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates a monitor', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createCephMon(client, config, { node: 'pve1', monid: 'mon3' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mon', 'POST', {
      monid: 'mon3',
    });
  });
});

describe('deleteCephMon', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes a monitor', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteCephMon(client, config, { node: 'pve1', monid: 'mon2' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mon/mon2', 'DELETE');
  });
});

describe('listCephMds', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists MDS daemons', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephMds);

    const result = await listCephMds(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('mds-a');
  });
});

describe('createCephMds', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates an MDS daemon', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createCephMds(client, config, { node: 'pve1', name: 'mds-c' });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mds', 'POST', {
      name: 'mds-c',
    });
  });
});

describe('deleteCephMds', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes an MDS daemon', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteCephMds(client, config, { node: 'pve1', name: 'mds-b' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/mds/mds-b', 'DELETE');
  });
});

describe('listCephPools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists pools', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephPools);

    const result = await listCephPools(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('rbd');
  });

  it('validates node name', async () => {
    const config = createTestConfig();

    const result = await listCephPools(client, config, { node: 'bad node' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid node name');
  });
});

describe('createCephPool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates a pool', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createCephPool(client, config, { node: 'pve1', name: 'rbd', size: 3, pg_num: 64 });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/pools', 'POST', {
      name: 'rbd',
      size: 3,
      pg_num: 64,
    });
  });
});

describe('updateCephPool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates a pool', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateCephPool(client, config, { node: 'pve1', name: 'rbd', size: 2 });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/pools/rbd', 'PUT', {
      size: 2,
    });
  });
});

describe('deleteCephPool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes a pool', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteCephPool(client, config, { node: 'pve1', name: 'rbd' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/pools/rbd', 'DELETE');
  });
});

describe('listCephFs', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists filesystems', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleCephFilesystems);

    const result = await listCephFs(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('cephfs');
  });
});

describe('createCephFs', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates a filesystem', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createCephFs(client, config, {
      node: 'pve1',
      name: 'cephfs',
      metadata_pool: 'cephfs_metadata',
      data_pool: 'cephfs_data',
    });

    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/fs', 'POST', {
      name: 'cephfs',
      metadata_pool: 'cephfs_metadata',
      data_pool: 'cephfs_data',
    });
  });
});
