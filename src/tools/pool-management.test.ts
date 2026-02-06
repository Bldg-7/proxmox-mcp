import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { samplePools, samplePool } from '../__fixtures__/pool-management.js';
import {
  listPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
} from './pool-management.js';

describe('listPools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted pools list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(samplePools);

    const result = await listPools(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Pools');
    expect(result.content[0].text).toContain('prod');
  });
});

describe('getPool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns pool details', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(samplePool);

    const result = await getPool(client, config, { poolid: 'prod' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Pool Details');
    expect(result.content[0].text).toContain('qemu/100');
  });
});

describe('createPool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createPool(client, config, { poolid: 'prod' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createPool(client, config, {
      poolid: 'prod',
      comment: 'Production workloads',
    });

    expect(client.request).toHaveBeenCalledWith('/pools', 'POST', {
      poolid: 'prod',
      comment: 'Production workloads',
    });
  });
});

describe('updatePool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates a pool', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updatePool(client, config, {
      poolid: 'prod',
      comment: 'Updated workloads',
    });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/pools/prod', 'PUT', {
      comment: 'Updated workloads',
    });
  });
});

describe('deletePool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes a pool', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deletePool(client, config, { poolid: 'prod' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/pools/prod', 'DELETE');
  });
});
