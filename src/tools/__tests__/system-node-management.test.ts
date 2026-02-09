import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../../client/proxmox.js';
import type { Config } from '../../config/index.js';

// Import consolidated handlers
import {
  handleNodeService,
  handleNodeLog,
  handleNodeTask,
  handleNodeInfo,
} from '../node.js';
import {
  handleNodeConfig,
  handleNodeSubscription,
  handleApt,
  handleNodeBulk,
  handleNodePower,
  handleNodeReplication,
} from '../system-operations.js';
import { handleNodeNetworkIface } from '../node-network.js';

// Mock client and config
const mockClient = {
  request: vi.fn(),
} as unknown as ProxmoxApiClient;

const mockConfig = {
  allowElevated: true,
} as unknown as Config;

const mockConfigNoElevated = {
  allowElevated: false,
} as unknown as Config;

describe('System Operations & Node Management Consolidation (Wave 4, Task 14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // NODE SERVICES (2→1)
  // ============================================================
  describe('handleNodeService (proxmox_node_service)', () => {
    it('action=list: should list services on a node', async () => {
      (mockClient.request as any).mockResolvedValue([
        { name: 'pveproxy', state: 'running', desc: 'PVE Proxy' },
      ]);

      const result = await handleNodeService(mockClient, mockConfig, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Services');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/services');
    });

    it('action=control: should control a service (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleNodeService(mockClient, mockConfig, {
        action: 'control',
        node: 'pve1',
        service: 'pveproxy',
        command: 'restart',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Service Command');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/services/pveproxy',
        'POST',
        { command: 'restart' }
      );
    });

    it('action=control: should deny without elevated permissions', async () => {
      const result = await handleNodeService(mockClient, mockConfigNoElevated, {
        action: 'control',
        node: 'pve1',
        service: 'pveproxy',
        command: 'restart',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // NODE LOGS (2→1)
  // ============================================================
  describe('handleNodeLog (proxmox_node_log)', () => {
    it('action=syslog: should read syslog entries', async () => {
      (mockClient.request as any).mockResolvedValue([
        { n: 1, t: 'System started' },
      ]);

      const result = await handleNodeLog(mockClient, mockConfig, {
        action: 'syslog',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Syslog');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/syslog');
    });

    it('action=journal: should read journal entries', async () => {
      (mockClient.request as any).mockResolvedValue([
        { n: 1, t: 'Journal entry' },
      ]);

      const result = await handleNodeLog(mockClient, mockConfig, {
        action: 'journal',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Journal');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/journal');
    });
  });

  // ============================================================
  // NODE TASKS (2→1)
  // ============================================================
  describe('handleNodeTask (proxmox_node_task)', () => {
    it('action=list: should list tasks', async () => {
      (mockClient.request as any).mockResolvedValue([
        { type: 'vzdump', status: 'OK', upid: 'UPID:pve1:000:000' },
      ]);

      const result = await handleNodeTask(mockClient, mockConfig, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Tasks');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/tasks');
    });

    it('action=get: should get specific task details', async () => {
      (mockClient.request as any).mockResolvedValue({
        upid: 'UPID:pve1:000:000',
        type: 'vzdump',
        status: 'OK',
      });

      const result = await handleNodeTask(mockClient, mockConfig, {
        action: 'get',
        node: 'pve1',
        upid: 'UPID:pve1:000:000',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Task Details');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/tasks/UPID:pve1:000:000'
      );
    });
  });

  // ============================================================
  // NODE INFO (5→1)
  // ============================================================
  describe('handleNodeInfo (proxmox_node_info)', () => {
    it('action=aplinfo: should list appliance templates', async () => {
      (mockClient.request as any).mockResolvedValue([
        { template: 'ubuntu-22.04', version: '1.0' },
      ]);

      const result = await handleNodeInfo(mockClient, mockConfig, {
        action: 'aplinfo',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Appliance');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/aplinfo');
    });

    it('action=netstat: should get network stats', async () => {
      (mockClient.request as any).mockResolvedValue([
        { proto: 'tcp', local_address: '0.0.0.0:22', state: 'LISTEN' },
      ]);

      const result = await handleNodeInfo(mockClient, mockConfig, {
        action: 'netstat',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Network');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/netstat');
    });

    it('action=rrddata: should get node RRD data', async () => {
      (mockClient.request as any).mockResolvedValue([{ time: 123, cpu: 0.5 }]);

      const result = await handleNodeInfo(mockClient, mockConfig, {
        action: 'rrddata',
        node: 'pve1',
        timeframe: 'hour',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Performance');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/rrddata?timeframe=hour'
      );
    });

    it('action=storage_rrddata: should get storage RRD data', async () => {
      (mockClient.request as any).mockResolvedValue([{ time: 123, total: 1000 }]);

      const result = await handleNodeInfo(mockClient, mockConfig, {
        action: 'storage_rrddata',
        node: 'pve1',
        storage: 'local-lvm',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Storage Performance');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/storage/local-lvm/rrddata'
      );
    });

    it('action=report: should get node diagnostic report', async () => {
      (mockClient.request as any).mockResolvedValue('System Report Data');

      const result = await handleNodeInfo(mockClient, mockConfig, {
        action: 'report',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Diagnostic Report');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/report');
    });
  });

  // ============================================================
  // NODE CONFIG (6→1, max 6 actions)
  // ============================================================
  describe('handleNodeConfig (proxmox_node_config)', () => {
    it('action=get_time: should get node time', async () => {
      (mockClient.request as any).mockResolvedValue({
        time: 1700000000,
        timezone: 'UTC',
      });

      const result = await handleNodeConfig(mockClient, mockConfig, {
        action: 'get_time',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Time');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/time');
    });

    it('action=set_time: should update time (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeConfig(mockClient, mockConfig, {
        action: 'set_time',
        node: 'pve1',
        timezone: 'America/New_York',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Time Updated');
    });

    it('action=set_time: should deny without elevated', async () => {
      const result = await handleNodeConfig(mockClient, mockConfigNoElevated, {
        action: 'set_time',
        node: 'pve1',
        timezone: 'UTC',
      });

      expect(result.isError).toBe(true);
    });

    it('action=set_dns: should update DNS (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeConfig(mockClient, mockConfig, {
        action: 'set_dns',
        node: 'pve1',
        search: 'example.com',
        dns1: '8.8.8.8',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('DNS Updated');
    });

    it('action=get_hosts: should get hosts entries', async () => {
      (mockClient.request as any).mockResolvedValue([
        { ip: '192.168.1.1', name: 'pve1' },
      ]);

      const result = await handleNodeConfig(mockClient, mockConfig, {
        action: 'get_hosts',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Hosts');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/hosts');
    });

    it('action=set_hosts: should update hosts (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeConfig(mockClient, mockConfig, {
        action: 'set_hosts',
        node: 'pve1',
        ip: '192.168.1.10',
        name: 'newhost',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Hosts Updated');
    });
  });

  // ============================================================
  // NODE SUBSCRIPTION (3→1)
  // ============================================================
  describe('handleNodeSubscription (proxmox_node_subscription)', () => {
    it('action=get: should get subscription info', async () => {
      (mockClient.request as any).mockResolvedValue({
        status: 'active',
        key: 'pve-123',
      });

      const result = await handleNodeSubscription(mockClient, mockConfig, {
        action: 'get',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Subscription');
      expect(mockClient.request).toHaveBeenCalledWith('/nodes/pve1/subscription');
    });

    it('action=set: should set subscription (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeSubscription(mockClient, mockConfig, {
        action: 'set',
        node: 'pve1',
        key: 'pve-new-key',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Subscription Set');
    });

    it('action=set: should deny without elevated', async () => {
      const result = await handleNodeSubscription(mockClient, mockConfigNoElevated, {
        action: 'set',
        node: 'pve1',
        key: 'pve-key',
      });

      expect(result.isError).toBe(true);
    });

    it('action=delete: should delete subscription (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeSubscription(mockClient, mockConfig, {
        action: 'delete',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Subscription Deleted');
    });
  });

  // ============================================================
  // APT (3→1)
  // ============================================================
  describe('handleApt (proxmox_apt)', () => {
    it('action=update: should refresh package lists (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleApt(mockClient, mockConfig, {
        action: 'update',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Update');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/apt/update',
        'POST'
      );
    });

    it('action=upgrade: should upgrade packages (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleApt(mockClient, mockConfig, {
        action: 'upgrade',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Upgrade');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/apt/upgrade',
        'POST'
      );
    });

    it('action=versions: should list package versions', async () => {
      (mockClient.request as any).mockResolvedValue([
        { package: 'pve-manager', version: '8.0.0' },
      ]);

      const result = await handleApt(mockClient, mockConfig, {
        action: 'versions',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Package Versions');
    });

    it('action=update: should deny without elevated', async () => {
      const result = await handleApt(mockClient, mockConfigNoElevated, {
        action: 'update',
        node: 'pve1',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // NODE BULK (3→1)
  // ============================================================
  describe('handleNodeBulk (proxmox_node_bulk)', () => {
    it('action=start_all: should start all guests (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleNodeBulk(mockClient, mockConfig, {
        action: 'start_all',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Start All');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/startall',
        'POST'
      );
    });

    it('action=stop_all: should stop all guests (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleNodeBulk(mockClient, mockConfig, {
        action: 'stop_all',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Stop All');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/stopall',
        'POST'
      );
    });

    it('action=migrate_all: should migrate all guests (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:000:000');

      const result = await handleNodeBulk(mockClient, mockConfig, {
        action: 'migrate_all',
        node: 'pve1',
        target: 'pve2',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Migrate All');
    });

    it('action=start_all: should deny without elevated', async () => {
      const result = await handleNodeBulk(mockClient, mockConfigNoElevated, {
        action: 'start_all',
        node: 'pve1',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // NODE POWER (3→1)
  // ============================================================
  describe('handleNodePower (proxmox_node_power)', () => {
    it('action=shutdown: should shutdown node (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodePower(mockClient, mockConfig, {
        action: 'shutdown',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Shutdown');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/status',
        'POST',
        { command: 'shutdown' }
      );
    });

    it('action=reboot: should reboot node (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodePower(mockClient, mockConfig, {
        action: 'reboot',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Reboot');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/status',
        'POST',
        { command: 'reboot' }
      );
    });

    it('action=wakeonlan: should wake node (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodePower(mockClient, mockConfig, {
        action: 'wakeonlan',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Wake-on-LAN');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/wakeonlan',
        'POST'
      );
    });

    it('action=shutdown: should deny without elevated', async () => {
      const result = await handleNodePower(mockClient, mockConfigNoElevated, {
        action: 'shutdown',
        node: 'pve1',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // NODE REPLICATION (3→1)
  // ============================================================
  describe('handleNodeReplication (proxmox_node_replication)', () => {
    it('action=status: should get replication status', async () => {
      (mockClient.request as any).mockResolvedValue({
        state: 'ok',
        last_sync: 1700000000,
      });

      const result = await handleNodeReplication(mockClient, mockConfig, {
        action: 'status',
        node: 'pve1',
        id: 'job-1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Replication Status');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/replication/job-1/status'
      );
    });

    it('action=log: should get replication log', async () => {
      (mockClient.request as any).mockResolvedValue([
        { time: 1700000000, msg: 'sync started' },
      ]);

      const result = await handleNodeReplication(mockClient, mockConfig, {
        action: 'log',
        node: 'pve1',
        id: 'job-1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Replication Log');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/replication/job-1/log'
      );
    });

    it('action=schedule: should schedule replication (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeReplication(mockClient, mockConfig, {
        action: 'schedule',
        node: 'pve1',
        id: 'job-1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Replication Scheduled');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/replication/job-1/schedule_now',
        'POST'
      );
    });

    it('action=schedule: should deny without elevated', async () => {
      const result = await handleNodeReplication(mockClient, mockConfigNoElevated, {
        action: 'schedule',
        node: 'pve1',
        id: 'job-1',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // NODE NETWORK IFACE (4→1)
  // ============================================================
  describe('handleNodeNetworkIface (proxmox_node_network_iface)', () => {
    it('action=create: should create network interface (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeNetworkIface(mockClient, mockConfig, {
        action: 'create',
        node: 'pve1',
        iface: 'vmbr1',
        type: 'bridge',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Interface Created');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/network',
        'POST',
        expect.objectContaining({ iface: 'vmbr1', type: 'bridge' })
      );
    });

    it('action=update: should update network interface (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeNetworkIface(mockClient, mockConfig, {
        action: 'update',
        node: 'pve1',
        iface: 'vmbr0',
        address: '192.168.1.1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Interface Updated');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/network/vmbr0',
        'PUT',
        expect.objectContaining({ address: '192.168.1.1' })
      );
    });

    it('action=delete: should delete network interface (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeNetworkIface(mockClient, mockConfig, {
        action: 'delete',
        node: 'pve1',
        iface: 'vmbr1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Interface Deleted');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/network/vmbr1',
        'DELETE',
        undefined
      );
    });

    it('action=apply: should apply network config (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNodeNetworkIface(mockClient, mockConfig, {
        action: 'apply',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Configuration Applied');
    });

    it('action=create: should deny without elevated', async () => {
      const result = await handleNodeNetworkIface(mockClient, mockConfigNoElevated, {
        action: 'create',
        node: 'pve1',
        iface: 'vmbr1',
        type: 'bridge',
      });

      expect(result.isError).toBe(true);
    });
  });
});
