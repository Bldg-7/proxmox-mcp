import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleGetNodeTime,
  sampleUpdateNodeTime,
  sampleUpdateNodeDns,
  sampleGetNodeHosts,
  sampleUpdateNodeHosts,
  sampleGetNodeSubscription,
  sampleSetNodeSubscription,
  sampleDeleteNodeSubscription,
  sampleAptUpdate,
  sampleAptUpgrade,
  sampleAptVersions,
  sampleStartAll,
  sampleStopAll,
  sampleMigrateAll,
  sampleNodeShutdown,
  sampleNodeReboot,
  sampleNodeWakeonlan,
} from '../__fixtures__/system-operations.js';
import {
  getNodeTime,
  updateNodeTime,
  updateNodeDns,
  getNodeHosts,
  updateNodeHosts,
  getNodeSubscription,
  setNodeSubscription,
  deleteNodeSubscription,
  aptUpdate,
  aptUpgrade,
  aptVersions,
  startAll,
  stopAll,
  migrateAll,
  nodeShutdown,
  nodeReboot,
  nodeWakeonlan,
} from './system-operations.js';

describe('System Operations Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  type ElevatedOperation = {
    name: string;
    handler: (
      client: ReturnType<typeof createMockProxmoxClient>,
      config: ReturnType<typeof createTestConfig>,
      input: any
    ) => Promise<any>;
    input: any;
  };

  const elevatedOperations: ElevatedOperation[] = [
    { name: 'updateNodeTime', handler: updateNodeTime, input: sampleUpdateNodeTime },
    { name: 'updateNodeDns', handler: updateNodeDns, input: sampleUpdateNodeDns },
    { name: 'updateNodeHosts', handler: updateNodeHosts, input: sampleUpdateNodeHosts },
    { name: 'setNodeSubscription', handler: setNodeSubscription, input: sampleSetNodeSubscription },
    {
      name: 'deleteNodeSubscription',
      handler: deleteNodeSubscription,
      input: sampleDeleteNodeSubscription,
    },
    { name: 'aptUpdate', handler: aptUpdate, input: sampleAptUpdate },
    { name: 'aptUpgrade', handler: aptUpgrade, input: sampleAptUpgrade },
    { name: 'startAll', handler: startAll, input: sampleStartAll },
    { name: 'stopAll', handler: stopAll, input: sampleStopAll },
    { name: 'migrateAll', handler: migrateAll, input: sampleMigrateAll },
    { name: 'nodeShutdown', handler: nodeShutdown, input: sampleNodeShutdown },
    { name: 'nodeReboot', handler: nodeReboot, input: sampleNodeReboot },
    { name: 'nodeWakeonlan', handler: nodeWakeonlan, input: sampleNodeWakeonlan },
  ];

  it.each(elevatedOperations)('requires elevated permissions for $name', async ({
    handler,
    input,
  }) => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handler(client, config, input);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  describe('getNodeTime', () => {
    it('returns formatted node time information', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({
        time: 1710000000,
        localtime: 1710003600,
        timezone: 'UTC',
      });

      const result = await getNodeTime(client, config, sampleGetNodeTime);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Time');
      expect(result.content[0].text).toContain('UTC');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/time');
    });

    it('validates node name', async () => {
      const config = createTestConfig();

      const result = await getNodeTime(client, config, { node: 'invalid;node' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
    });
  });

  describe('updateNodeTime', () => {
    it('updates node time with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await updateNodeTime(client, config, sampleUpdateNodeTime);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Time Updated');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/time', 'PUT', {
        time: 1710000000,
        timezone: 'UTC',
      });
    });
  });

  describe('updateNodeDns', () => {
    it('updates node DNS with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await updateNodeDns(client, config, sampleUpdateNodeDns);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node DNS Updated');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/dns', 'PUT', {
        search: 'example.com',
        dns1: '8.8.8.8',
        dns2: '1.1.1.1',
      });
    });
  });

  describe('getNodeHosts', () => {
    it('returns formatted host entries', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { ip: '192.168.1.10', name: 'pve1', comment: 'Management' },
        { ip: '192.168.1.11', name: 'pve2' },
      ]);

      const result = await getNodeHosts(client, config, sampleGetNodeHosts);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Hosts');
      expect(result.content[0].text).toContain('pve1');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/hosts');
    });
  });

  describe('updateNodeHosts', () => {
    it('updates host entries with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await updateNodeHosts(client, config, sampleUpdateNodeHosts);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Hosts Updated');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/hosts', 'POST', {
        ip: '192.168.1.10',
        name: 'pve1',
        comment: 'Management',
      });
    });
  });

  describe('getNodeSubscription', () => {
    it('returns formatted subscription info', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({
        status: 'Active',
        level: 'Premium',
        key: 'AAAA-BBBB-CCCC',
      });

      const result = await getNodeSubscription(client, config, sampleGetNodeSubscription);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Subscription');
      expect(result.content[0].text).toContain('Active');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/subscription');
    });
  });

  describe('setNodeSubscription', () => {
    it('sets subscription key with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await setNodeSubscription(client, config, sampleSetNodeSubscription);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Subscription Set');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/subscription', 'POST', {
        key: 'AAAA-BBBB-CCCC',
      });
    });
  });

  describe('deleteNodeSubscription', () => {
    it('deletes subscription key', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await deleteNodeSubscription(client, config, sampleDeleteNodeSubscription);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Subscription Deleted');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/subscription', 'DELETE');
    });
  });

  describe('aptUpdate', () => {
    it('triggers APT update', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await aptUpdate(client, config, sampleAptUpdate);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Update Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/apt/update', 'POST');
    });
  });

  describe('aptUpgrade', () => {
    it('triggers APT upgrade', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await aptUpgrade(client, config, sampleAptUpgrade);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Upgrade Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/apt/upgrade', 'POST');
    });
  });

  describe('aptVersions', () => {
    it('lists package versions with package filter', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { package: 'pve-manager', version: '8.2.1', arch: 'amd64' },
      ]);

      const result = await aptVersions(client, config, sampleAptVersions);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('APT Package Versions');
      expect(result.content[0].text).toContain('pve-manager');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/apt/versions?package=pve-manager'
      );
    });
  });

  describe('startAll', () => {
    it('starts all guests', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await startAll(client, config, sampleStartAll);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Start All Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/startall', 'POST');
    });
  });

  describe('stopAll', () => {
    it('stops all guests', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await stopAll(client, config, sampleStopAll);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Stop All Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/stopall', 'POST');
    });
  });

  describe('migrateAll', () => {
    it('migrates all guests with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await migrateAll(client, config, sampleMigrateAll);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Migrate All Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/migrateall', 'POST', {
        target: 'pve2',
        maxworkers: 2,
        'with-local-disks': true,
      });
    });
  });

  describe('nodeShutdown', () => {
    it('shuts down a node with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await nodeShutdown(client, config, sampleNodeShutdown);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Shutdown Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/status', 'POST', {
        command: 'shutdown',
      });
    });
  });

  describe('nodeReboot', () => {
    it('reboots a node with expected payload', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await nodeReboot(client, config, sampleNodeReboot);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Node Reboot Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/status', 'POST', {
        command: 'reboot',
      });
    });
  });

  describe('nodeWakeonlan', () => {
    it('wakes a node via WOL', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('OK');

      const result = await nodeWakeonlan(client, config, sampleNodeWakeonlan);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Wake-on-LAN Issued');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/wakeonlan', 'POST');
    });
  });
});
