import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleHaResources,
  sampleHaGroups,
  sampleHaStatus,
  sampleFirewallRules,
  sampleFirewallGroups,
  sampleBackupJobs,
  sampleReplicationJobs,
  sampleClusterOptions,
} from '../__fixtures__/cluster-management.js';
import {
  getHaResources,
  getHaResource,
  createHaResource,
  getHaGroups,
  getHaStatus,
  listClusterFirewallRules,
  createClusterFirewallRule,
  listClusterFirewallGroups,
  listClusterBackupJobs,
  listClusterReplicationJobs,
  getClusterOptions,
} from './cluster-management.js';

describe('getHaResources', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted HA resources', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleHaResources);

    const result = await getHaResources(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('HA Resources');
    expect(result.content[0].text).toContain('vm:100');
  });

  it('applies type filter to API endpoint', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleHaResources);

    await getHaResources(client, config, { type: 'vm' });

    expect(client.request).toHaveBeenCalledWith('/cluster/ha/resources?type=vm');
  });
});

describe('getHaResource', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns HA resource details', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleHaResources[0]);

    const result = await getHaResource(client, config, { sid: 'vm:100' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('vm:100');
  });
});

describe('createHaResource', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createHaResource(client, config, { sid: 'vm:100' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createHaResource(client, config, { sid: 'vm:100', type: 'vm' });

    expect(client.request).toHaveBeenCalledWith('/cluster/ha/resources', 'POST', {
      sid: 'vm:100',
      type: 'vm',
    });
  });
});

describe('getHaGroups', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted HA groups', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleHaGroups);

    const result = await getHaGroups(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('HA Groups');
    expect(result.content[0].text).toContain('prod');
  });
});

describe('getHaStatus', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns HA status entries', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleHaStatus);

    const result = await getHaStatus(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('HA Status');
    expect(result.content[0].text).toContain('manager');
  });
});

describe('listClusterFirewallRules', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted firewall rules', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleFirewallRules);

    const result = await listClusterFirewallRules(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Firewall Rules');
    expect(result.content[0].text).toContain('Allow SSH');
  });
});

describe('createClusterFirewallRule', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createClusterFirewallRule(client, config, {
      action: 'ACCEPT',
      type: 'in',
    });

    expect(result.isError).toBe(true);
  });
});

describe('listClusterFirewallGroups', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted firewall groups', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleFirewallGroups);

    const result = await listClusterFirewallGroups(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Firewall Groups');
    expect(result.content[0].text).toContain('web-servers');
  });
});

describe('listClusterBackupJobs', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted backup jobs', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleBackupJobs);

    const result = await listClusterBackupJobs(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Backup Jobs');
    expect(result.content[0].text).toContain('daily-backup');
  });
});

describe('listClusterReplicationJobs', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted replication jobs', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleReplicationJobs);

    const result = await listClusterReplicationJobs(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Replication Jobs');
    expect(result.content[0].text).toContain('101-0');
  });
});

describe('getClusterOptions', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns cluster options', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleClusterOptions);

    const result = await getClusterOptions(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Cluster Options');
    expect(result.content[0].text).toContain('console');
  });
});
