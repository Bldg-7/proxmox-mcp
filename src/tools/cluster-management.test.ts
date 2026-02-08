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
  getClusterFirewallOptions,
   updateClusterFirewallOptions,
   listClusterFirewallMacros,
   listClusterFirewallRefs,
   listClusterFirewallAliases,
   getClusterFirewallAlias,
   createClusterFirewallAlias,
   updateClusterFirewallAlias,
   deleteClusterFirewallAlias,
   listClusterFirewallIpsets,
   createClusterFirewallIpset,
   deleteClusterFirewallIpset,
    listClusterFirewallIpsetEntries,
    addClusterFirewallIpsetEntry,
    updateClusterFirewallIpsetEntry,
    deleteClusterFirewallIpsetEntry,
    getClusterConfig,
    listClusterConfigNodes,
    getClusterConfigNode,
    joinCluster,
    getClusterTotem,
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

describe('getClusterFirewallOptions', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns cluster firewall options', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({ enable: 1, policy_in: 'ACCEPT', policy_out: 'ACCEPT' });

    const result = await getClusterFirewallOptions(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Firewall Options');
    expect(result.content[0].text).toContain('enable');
  });
});

describe('updateClusterFirewallOptions', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await updateClusterFirewallOptions(client, config, { enable: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await updateClusterFirewallOptions(client, config, { enable: 1, policy_in: 'REJECT' });

    expect(client.request).toHaveBeenCalledWith('/cluster/firewall/options', 'PUT', {
      enable: 1,
      policy_in: 'REJECT',
    });
  });
});

describe('listClusterFirewallMacros', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted firewall macros', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([
      { name: 'HTTP', descr: 'HTTP traffic' },
      { name: 'HTTPS', descr: 'HTTPS traffic' },
    ]);

    const result = await listClusterFirewallMacros(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Firewall Macros');
    expect(result.content[0].text).toContain('HTTP');
  });
});

describe('listClusterFirewallRefs', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted firewall refs', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([
      { name: 'office', type: 'alias', comment: 'Office network' },
      { name: 'trusted', type: 'ipset', comment: 'Trusted hosts' },
    ]);

    const result = await listClusterFirewallRefs(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Firewall References');
    expect(result.content[0].text).toContain('office');
  });

   it('applies type filter to API endpoint', async () => {
     const config = createTestConfig();
     client.request.mockResolvedValue([]);

     await listClusterFirewallRefs(client, config, { type: 'alias' });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/refs?type=alias');
   });
 });

 describe('listClusterFirewallAliases', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('returns formatted firewall aliases', async () => {
     const config = createTestConfig();
     client.request.mockResolvedValue([
       { name: 'office', cidr: '192.168.1.0/24', comment: 'Office network' },
       { name: 'home', cidr: '10.0.0.0/8' },
     ]);

     const result = await listClusterFirewallAliases(client, config, {});

     expect(result.isError).toBe(false);
     expect(result.content[0].text).toContain('Firewall Aliases');
     expect(result.content[0].text).toContain('office');
     expect(result.content[0].text).toContain('home');
   });
 });

 describe('getClusterFirewallAlias', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('returns firewall alias details', async () => {
     const config = createTestConfig();
     client.request.mockResolvedValue({
       name: 'office',
       cidr: '192.168.1.0/24',
       comment: 'Office network',
     });

     const result = await getClusterFirewallAlias(client, config, { name: 'office' });

     expect(result.isError).toBe(false);
     expect(result.content[0].text).toContain('office');
     expect(result.content[0].text).toContain('192.168.1.0/24');
   });
 });

 describe('createClusterFirewallAlias', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await createClusterFirewallAlias(client, config, {
       name: 'office',
       cidr: '192.168.1.0/24',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await createClusterFirewallAlias(client, config, {
       name: 'office',
       cidr: '192.168.1.0/24',
       comment: 'Office network',
     });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/aliases', 'POST', {
       name: 'office',
       cidr: '192.168.1.0/24',
       comment: 'Office network',
     });
   });
 });

 describe('updateClusterFirewallAlias', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await updateClusterFirewallAlias(client, config, {
       name: 'office',
       cidr: '192.168.1.0/24',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await updateClusterFirewallAlias(client, config, {
       name: 'office',
       cidr: '192.168.2.0/24',
       comment: 'Updated office',
     });

     expect(client.request).toHaveBeenCalledWith(
       '/cluster/firewall/aliases/office',
       'PUT',
       {
         cidr: '192.168.2.0/24',
         comment: 'Updated office',
       }
     );
   });
 });

 describe('deleteClusterFirewallAlias', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await deleteClusterFirewallAlias(client, config, { name: 'office' });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await deleteClusterFirewallAlias(client, config, { name: 'office' });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/aliases/office', 'DELETE');
   });
 });

 describe('listClusterFirewallIpsets', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('returns formatted IP sets', async () => {
     const config = createTestConfig();
     client.request.mockResolvedValue([
       { name: 'trusted', comment: 'Trusted hosts' },
       { name: 'blocked' },
     ]);

     const result = await listClusterFirewallIpsets(client, config, {});

     expect(result.isError).toBe(false);
     expect(result.content[0].text).toContain('Firewall IP Sets');
     expect(result.content[0].text).toContain('trusted');
     expect(result.content[0].text).toContain('blocked');
   });
 });

 describe('createClusterFirewallIpset', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await createClusterFirewallIpset(client, config, { name: 'trusted' });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await createClusterFirewallIpset(client, config, { name: 'trusted', comment: 'Trusted hosts' });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/ipset', 'POST', {
       name: 'trusted',
       comment: 'Trusted hosts',
     });
   });
 });

 describe('deleteClusterFirewallIpset', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await deleteClusterFirewallIpset(client, config, { name: 'trusted' });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await deleteClusterFirewallIpset(client, config, { name: 'trusted' });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/ipset/trusted', 'DELETE');
   });
 });

 describe('listClusterFirewallIpsetEntries', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('returns formatted IP set entries', async () => {
     const config = createTestConfig();
     client.request.mockResolvedValue([
       { cidr: '192.168.1.0/24', comment: 'Office network' },
       { cidr: '10.0.0.1', nomatch: true },
     ]);

     const result = await listClusterFirewallIpsetEntries(client, config, { name: 'trusted' });

     expect(result.isError).toBe(false);
     expect(result.content[0].text).toContain('IP Set Entries: trusted');
     expect(result.content[0].text).toContain('192.168.1.0/24');
     expect(result.content[0].text).toContain('10.0.0.1');
     expect(result.content[0].text).toContain('nomatch');
   });
 });

 describe('addClusterFirewallIpsetEntry', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await addClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await addClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
       comment: 'Office network',
       nomatch: false,
     });

     expect(client.request).toHaveBeenCalledWith('/cluster/firewall/ipset/trusted', 'POST', {
       cidr: '192.168.1.0/24',
       comment: 'Office network',
       nomatch: false,
     });
   });
 });

 describe('updateClusterFirewallIpsetEntry', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await updateClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint with URL encoding', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await updateClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
       comment: 'Updated comment',
     });

     expect(client.request).toHaveBeenCalledWith(
       '/cluster/firewall/ipset/trusted/192.168.1.0%2F24',
       'PUT',
       {
         comment: 'Updated comment',
       }
     );
   });
 });

 describe('deleteClusterFirewallIpsetEntry', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;

   beforeEach(() => {
     client = createMockProxmoxClient();
   });

   it('requires elevated permissions', async () => {
     const config = createTestConfig({ allowElevated: false });

     const result = await deleteClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission');
   });

   it('calls correct API endpoint with URL encoding', async () => {
     const config = createTestConfig({ allowElevated: true });
     client.request.mockResolvedValue('OK');

     await deleteClusterFirewallIpsetEntry(client, config, {
       name: 'trusted',
       cidr: '192.168.1.0/24',
     });

     expect(client.request).toHaveBeenCalledWith(
       '/cluster/firewall/ipset/trusted/192.168.1.0%2F24',
       'DELETE'
     );
   });
 });

 describe('Cluster Config', () => {
   let client: ReturnType<typeof createMockProxmoxClient>;
   let config: ReturnType<typeof createTestConfig>;

   beforeEach(() => {
     client = createMockProxmoxClient();
     config = createTestConfig();
   });

   it('should get cluster config', async () => {
     const mockConfig = { cluster_name: 'pve-cluster', corosync_conf: 'data' };
     (client.request as jest.Mock).mockResolvedValue(mockConfig);

     const result = await getClusterConfig(client, config, {});

     expect(client.request).toHaveBeenCalledWith('/cluster/config');
     expect(result.content[0].text).toContain('🔧 **Cluster Config**');
     expect(result.content[0].text).toContain('cluster_name');
   });

   it('should list cluster config nodes', async () => {
     const mockNodes = [
       { name: 'pve1', nodeid: 1 },
       { name: 'pve2', nodeid: 2 },
     ];
     (client.request as jest.Mock).mockResolvedValue(mockNodes);

     const result = await listClusterConfigNodes(client, config, {});

     expect(client.request).toHaveBeenCalledWith('/cluster/config/nodes');
     expect(result.content[0].text).toContain('🖥️  **Cluster Config Nodes**');
     expect(result.content[0].text).toContain('pve1');
     expect(result.content[0].text).toContain('**Total**: 2');
   });

   it('should get cluster config node', async () => {
     const mockNode = { name: 'pve1', nodeid: 1, type: 'node' };
     (client.request as jest.Mock).mockResolvedValue(mockNode);

     const result = await getClusterConfigNode(client, config, { node: 'pve1' });

     expect(client.request).toHaveBeenCalledWith('/cluster/config/nodes/pve1');
     expect(result.content[0].text).toContain('🖥️  **Cluster Config Node**');
     expect(result.content[0].text).toContain('pve1');
   });

   it('should join cluster', async () => {
     const elevatedConfig = { ...config, allowElevated: true };
     (client.request as jest.Mock).mockResolvedValue('OK');

     const result = await joinCluster(client, elevatedConfig, {
       hostname: 'pve2.example.com',
       password: 'secret123',
       fingerprint: 'abc123',
     });

     expect(client.request).toHaveBeenCalledWith('/cluster/config/join', 'POST', {
       hostname: 'pve2.example.com',
       password: 'secret123',
       fingerprint: 'abc123',
     });
     expect(result.content[0].text).toContain('✅ **Joined Cluster**');
     expect(result.content[0].text).toContain('[REDACTED]');
     expect(result.content[0].text).not.toContain('secret123');
   });

   it('should deny join cluster without elevated permissions', async () => {
     const basicConfig = { ...config, allowElevated: false };

     const result = await joinCluster(client, basicConfig, {
       hostname: 'pve2.example.com',
       password: 'secret123',
     });

     expect(result.isError).toBe(true);
     expect(result.content[0].text).toContain('Permission denied');
   });

   it('should get cluster totem config', async () => {
     const mockTotem = { version: 2, cluster_name: 'pve-cluster' };
     (client.request as jest.Mock).mockResolvedValue(mockTotem);

     const result = await getClusterTotem(client, config, {});

     expect(client.request).toHaveBeenCalledWith('/cluster/config/totem');
     expect(result.content[0].text).toContain('⚙️  **Cluster Totem Config**');
     expect(result.content[0].text).toContain('version');
   });
 });
