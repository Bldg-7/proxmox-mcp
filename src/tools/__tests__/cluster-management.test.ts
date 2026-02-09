import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  sampleBackupJobs,
  sampleFirewallGroups,
  sampleFirewallRules,
  sampleHaGroups,
  sampleHaResources,
  sampleHaStatus,
  sampleReplicationJobs,
} from '../../__fixtures__/cluster-management.js';
import {
  handleClusterBackupJobTool,
  handleClusterConfigTool,
  handleClusterFirewallAliasTool,
  handleClusterFirewallGroupTool,
  handleClusterFirewallIpsetEntryTool,
  handleClusterFirewallIpsetTool,
  handleClusterFirewallRuleTool,
  handleClusterFirewallTool,
  handleClusterReplicationJobTool,
  handleHaGroupTool,
  handleHaResourceTool,
} from '../cluster-management.js';
import { handleClusterTool } from '../cluster.js';

describe('cluster management consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('proxmox_ha_resource', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleHaResources);

      const result = await handleHaResourceTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('HA Resources');
      expect(client.request).toHaveBeenCalledWith('/cluster/ha/resources');
    });

    it('supports action=status', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleHaStatus);

      const result = await handleHaResourceTool(client, config, { action: 'status' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('HA Status');
      expect(client.request).toHaveBeenCalledWith('/cluster/ha/status');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleHaResourceTool(client, config, {
        action: 'create',
        sid: 'vm:100',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_ha_group', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleHaGroups);

      const result = await handleHaGroupTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('HA Groups');
      expect(client.request).toHaveBeenCalledWith('/cluster/ha/groups');
    });

    it('requires elevated permissions for action=create', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleHaGroupTool(client, config, {
        action: 'create',
        group: 'prod',
        nodes: 'pve1:1,pve2:2',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_cluster_firewall_rule', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleFirewallRules);

      const result = await handleClusterFirewallRuleTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Firewall Rules');
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/rules');
    });

    it('requires elevated permissions for action=delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleClusterFirewallRuleTool(client, config, {
        action: 'delete',
        pos: 1,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_cluster_firewall_group', () => {
    it('supports action=get', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleFirewallGroups[0]);

      const result = await handleClusterFirewallGroupTool(client, config, {
        action: 'get',
        group: 'web-servers',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('web-servers');
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/groups/web-servers');
    });
  });

  describe('proxmox_cluster_firewall', () => {
    it('supports action=list_refs with type filter', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await handleClusterFirewallTool(client, config, {
        action: 'list_refs',
        type: 'alias',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/refs?type=alias');
    });

    it('requires elevated permissions for action=update_options', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleClusterFirewallTool(client, config, {
        action: 'update_options',
        enable: 1,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_cluster_firewall_alias', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([{ name: 'office', cidr: '192.168.1.0/24' }]);

      const result = await handleClusterFirewallAliasTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Firewall Aliases');
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/aliases');
    });
  });

  describe('proxmox_cluster_firewall_ipset', () => {
    it('supports action=create', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleClusterFirewallIpsetTool(client, config, {
        action: 'create',
        name: 'trusted',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/ipset', 'POST', {
        name: 'trusted',
      });
    });
  });

  describe('proxmox_cluster_firewall_ipset_entry', () => {
    it('supports action=create', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await handleClusterFirewallIpsetEntryTool(client, config, {
        action: 'create',
        name: 'trusted',
        cidr: '192.168.1.0/24',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/cluster/firewall/ipset/trusted', 'POST', {
        cidr: '192.168.1.0/24',
      });
    });
  });

  describe('proxmox_cluster_backup_job', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleBackupJobs);

      const result = await handleClusterBackupJobTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Backup Jobs');
      expect(client.request).toHaveBeenCalledWith('/cluster/backup');
    });
  });

  describe('proxmox_cluster_replication_job', () => {
    it('supports action=list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleReplicationJobs);

      const result = await handleClusterReplicationJobTool(client, config, { action: 'list' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Replication Jobs');
      expect(client.request).toHaveBeenCalledWith('/cluster/replication');
    });
  });

  describe('proxmox_cluster_config', () => {
    it('supports action=list_nodes', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([{ name: 'pve1', nodeid: 1 }]);

      const result = await handleClusterConfigTool(client, config, { action: 'list_nodes' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Cluster Config Nodes');
      expect(client.request).toHaveBeenCalledWith('/cluster/config/nodes');
    });

    it('requires elevated permissions for action=join', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleClusterConfigTool(client, config, {
        action: 'join',
        hostname: 'pve2.example.com',
        password: 'secret123',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });
});

describe('proxmox_cluster consolidated options actions', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('supports action=options', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({ console: 'xtermjs' });

    const result = await handleClusterTool(client, config, { action: 'options' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Cluster Options');
    expect(client.request).toHaveBeenCalledWith('/cluster/options');
  });

  it('requires elevated permissions for action=update_options', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleClusterTool(client, config, {
      action: 'update_options',
      options: { console: 'xtermjs' },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
});
