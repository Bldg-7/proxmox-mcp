import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  createSnapshotLxc,
  createSnapshotVM,
  listSnapshotsLxc,
  listSnapshotsVM,
  rollbackSnapshotLxc,
  rollbackSnapshotVM,
  deleteSnapshotLxc,
  deleteSnapshotVM,
} from './snapshot.js';

describe('Snapshot Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('createSnapshotLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('creates LXC snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
        description: 'Test snapshot',
      });

      expect(result.content[0].text).toContain('📸');
      expect(result.content[0].text).toContain('Snapshot Created');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.content[0].text).toContain('Test snapshot');
      expect(result.content[0].text).toContain('pve1');
      expect(result.content[0].text).toContain('UPID');
      expect(result.isError).toBe(false);
    });

    it('creates LXC snapshot without description', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.content[0].text).toContain('📸');
      expect(result.content[0].text).toContain('Snapshot Created');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await createSnapshotLxc(client, config, {
        node: 'invalid@node',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 50,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('validates snapshot name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'invalid@snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid snapshot name');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Snapshot already exists'));

      const result = await createSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Snapshot already exists');
    });
  });

  describe('createSnapshotVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await createSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('creates VM snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await createSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
        description: 'Test VM snapshot',
      });

      expect(result.content[0].text).toContain('📸');
      expect(result.content[0].text).toContain('Snapshot Created');
      expect(result.content[0].text).toContain('VM ID');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.content[0].text).toContain('Test VM snapshot');
      expect(result.isError).toBe(false);
    });

    it('validates snapshot name for VM', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await createSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'invalid@snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid snapshot name');
    });
  });

  describe('listSnapshotsLxc', () => {
    it('lists snapshots without permission check', async () => {
      const config = createTestConfig({ allowElevated: false });

      const mockSnapshots = [
        {
          name: 'snap1',
          description: 'First snapshot',
          snaptime: 1704067200,
          parent: 'current',
        },
        {
          name: 'snap2',
          description: 'Second snapshot',
          snaptime: 1704153600,
        },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('📸');
      expect(result.content[0].text).toContain('Snapshots for Container 100');
      expect(result.content[0].text).toContain('snap1');
      expect(result.content[0].text).toContain('snap2');
      expect(result.content[0].text).toContain('First snapshot');
      expect(result.content[0].text).toContain('Second snapshot');
      expect(result.isError).toBe(false);
    });

    it('handles empty snapshot list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('No snapshots found');
      expect(result.isError).toBe(false);
    });

    it('filters out current pseudo-snapshot', async () => {
      const config = createTestConfig();

      const mockSnapshots = [
        { name: 'current', snaptime: 1704153600 },
        { name: 'snap1', snaptime: 1704067200 },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('snap1');
      expect(result.content[0].text).not.toContain('**current**');
    });

    it('sorts snapshots by date (newest first)', async () => {
      const config = createTestConfig();

      const mockSnapshots = [
        { name: 'old', snaptime: 1704067200 },
        { name: 'new', snaptime: 1704153600 },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      const text = result.content[0].text;
      const newIndex = text.indexOf('**new**');
      const oldIndex = text.indexOf('**old**');
      expect(newIndex).toBeLessThan(oldIndex);
    });

    it('formats snapshot dates correctly', async () => {
      const config = createTestConfig();

      const mockSnapshots = [
        { name: 'snap1', snaptime: 1704067200 },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('Date:');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig();

      const result = await listSnapshotsLxc(client, config, {
        node: 'invalid@node',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('handles API errors', async () => {
      const config = createTestConfig();
      client.request.mockRejectedValue(new Error('Container not found'));

      const result = await listSnapshotsLxc(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Container not found');
    });
  });

  describe('listSnapshotsVM', () => {
    it('lists VM snapshots without permission check', async () => {
      const config = createTestConfig({ allowElevated: false });

      const mockSnapshots = [
        {
          name: 'snap1',
          description: 'First VM snapshot',
          snaptime: 1704067200,
        },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('📸');
      expect(result.content[0].text).toContain('Snapshots for VM 100');
      expect(result.content[0].text).toContain('snap1');
      expect(result.isError).toBe(false);
    });

    it('handles empty VM snapshot list', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await listSnapshotsVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('No snapshots found');
    });

    it('filters out current pseudo-snapshot for VM', async () => {
      const config = createTestConfig();

      const mockSnapshots = [
        { name: 'current', snaptime: 1704153600 },
        { name: 'snap1', snaptime: 1704067200 },
      ];
      client.request.mockResolvedValue(mockSnapshots);

      const result = await listSnapshotsVM(client, config, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.content[0].text).toContain('snap1');
      expect(result.content[0].text).not.toContain('**current**');
    });
  });

  describe('rollbackSnapshotLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await rollbackSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('rolls back LXC snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await rollbackSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.content[0].text).toContain('⏮️');
      expect(result.content[0].text).toContain('Snapshot Rollback Initiated');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.content[0].text).toContain('Warning');
      expect(result.content[0].text).toContain('revert');
      expect(result.isError).toBe(false);
    });

    it('validates snapshot name for rollback', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await rollbackSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'invalid@snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid snapshot name');
    });

    it('handles API errors during rollback', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Snapshot not found'));

      const result = await rollbackSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Snapshot not found');
    });
  });

  describe('rollbackSnapshotVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await rollbackSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('rolls back VM snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await rollbackSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.content[0].text).toContain('⏮️');
      expect(result.content[0].text).toContain('Snapshot Rollback Initiated');
      expect(result.content[0].text).toContain('VM ID');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.content[0].text).toContain('Warning');
      expect(result.isError).toBe(false);
    });
  });

  describe('deleteSnapshotLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await deleteSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('deletes LXC snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await deleteSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('Snapshot Deleted');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.content[0].text).toContain('pve1');
      expect(result.isError).toBe(false);
    });

    it('validates snapshot name for deletion', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await deleteSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'invalid@snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid snapshot name');
    });

    it('handles API errors during deletion', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Snapshot in use'));

      const result = await deleteSnapshotLxc(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Snapshot in use');
    });
  });

  describe('deleteSnapshotVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await deleteSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('deletes VM snapshot with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await deleteSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 100,
        snapname: 'test-snap',
      });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('Snapshot Deleted');
      expect(result.content[0].text).toContain('VM ID');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('test-snap');
      expect(result.isError).toBe(false);
    });

    it('validates VMID for VM snapshot deletion', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await deleteSnapshotVM(client, config, {
        node: 'pve1',
        vmid: 50,
        snapname: 'test-snap',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });
});
