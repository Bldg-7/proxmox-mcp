import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../../client/proxmox.js';
import type { Config } from '../../config/index.js';
import { handleGuestSnapshot } from '../snapshot.js';
import { handleBackup } from '../backup.js';

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

describe('Snapshot & Backup Consolidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleGuestSnapshot', () => {
    describe('create action', () => {
      it('should create VM snapshot with required fields', async () => {
        (mockClient.request as any).mockResolvedValue('task-123');

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'create',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
          snapname: 'backup-1',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshot Created');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/qemu/100/snapshot',
          'POST',
          expect.objectContaining({
            snapname: 'backup-1',
          })
        );
      });

      it('should create LXC snapshot with description', async () => {
        (mockClient.request as any).mockResolvedValue('task-456');

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'create',
          type: 'lxc',
          node: 'pve2',
          vmid: 200,
          snapname: 'snap-1',
          description: 'Test snapshot',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshot Created');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve2/lxc/200/snapshot',
          'POST',
          expect.objectContaining({
            snapname: 'snap-1',
            description: 'Test snapshot',
          })
        );
      });

      it('should require elevated permissions for create', async () => {
        const result = await handleGuestSnapshot(mockClient, mockConfigNoElevated, {
          action: 'create',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
          snapname: 'backup-1',
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
    });

    describe('list action', () => {
      it('should list VM snapshots', async () => {
        (mockClient.request as any).mockResolvedValue([
          { name: 'snap-1', snaptime: 1000000, description: 'First' },
          { name: 'snap-2', snaptime: 2000000, description: 'Second' },
          { name: 'current' }, // Should be filtered out
        ]);

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'list',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshots for VM 100');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/qemu/100/snapshot'
        );
      });

      it('should list LXC snapshots', async () => {
        (mockClient.request as any).mockResolvedValue([
          { name: 'snap-1', snaptime: 1000000 },
        ]);

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'list',
          type: 'lxc',
          node: 'pve2',
          vmid: 200,
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshots for Container 200');
      });
    });

    describe('rollback action', () => {
      it('should rollback VM snapshot', async () => {
        (mockClient.request as any).mockResolvedValue('task-789');

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'rollback',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
          snapname: 'backup-1',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshot Rollback Initiated');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/qemu/100/snapshot/backup-1/rollback',
          'POST',
          {}
        );
      });

      it('should require elevated permissions for rollback', async () => {
        const result = await handleGuestSnapshot(mockClient, mockConfigNoElevated, {
          action: 'rollback',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
          snapname: 'backup-1',
        });

        expect(result.isError).toBe(true);
      });
    });

    describe('delete action', () => {
      it('should delete VM snapshot', async () => {
        (mockClient.request as any).mockResolvedValue('task-999');

        const result = await handleGuestSnapshot(mockClient, mockConfig, {
          action: 'delete',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
          snapname: 'backup-1',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Snapshot Deleted');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/qemu/100/snapshot/backup-1',
          'DELETE'
        );
      });

      it('should require elevated permissions for delete', async () => {
        const result = await handleGuestSnapshot(mockClient, mockConfigNoElevated, {
          action: 'delete',
          type: 'lxc',
          node: 'pve2',
          vmid: 200,
          snapname: 'snap-1',
        });

        expect(result.isError).toBe(true);
      });
    });
  });

  describe('handleBackup', () => {
    describe('create action', () => {
      it('should create VM backup with defaults', async () => {
        (mockClient.request as any).mockResolvedValue('task-111');

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'create',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Backup Creation Started');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/vzdump',
          'POST',
          expect.objectContaining({
            vmid: '100',
            storage: 'local',
            mode: 'snapshot',
            compress: 'zstd',
          })
        );
      });

      it('should create LXC backup with custom options', async () => {
        (mockClient.request as any).mockResolvedValue('task-222');

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'create',
          type: 'lxc',
          node: 'pve2',
          vmid: 200,
          storage: 'backup-storage',
          mode: 'stop',
          compress: 'gzip',
        });

        expect(result.isError).toBe(false);
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve2/vzdump',
          'POST',
          expect.objectContaining({
            vmid: '200',
            storage: 'backup-storage',
            mode: 'stop',
            compress: 'gzip',
          })
        );
      });

      it('should require elevated permissions for create', async () => {
        const result = await handleBackup(mockClient, mockConfigNoElevated, {
          action: 'create',
          type: 'vm',
          node: 'pve1',
          vmid: 100,
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
    });

    describe('list action', () => {
      it('should list backups (no type parameter)', async () => {
        (mockClient.request as any).mockResolvedValue([
          {
            volid: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
            size: 1000000,
            ctime: 1000000,
          },
          {
            volid: 'local:backup/vzdump-lxc-200-2025_02_10-11_00_00.tar.zst',
            size: 500000,
            ctime: 2000000,
          },
        ]);

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'list',
          node: 'pve1',
          storage: 'local',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Backups on local');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/storage/local/content?content=backup'
        );
      });

      it('should require elevated permissions for list', async () => {
        const result = await handleBackup(mockClient, mockConfigNoElevated, {
          action: 'list',
          node: 'pve1',
          storage: 'local',
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
    });

    describe('restore action', () => {
      it('should restore VM backup', async () => {
        (mockClient.request as any).mockResolvedValue('task-333');

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'restore',
          type: 'vm',
          node: 'pve1',
          vmid: 105,
          archive: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Backup Restore Started');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/qemu',
          'POST',
          expect.objectContaining({
            vmid: '105',
            archive: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
            restore: 1,
          })
        );
      });

      it('should restore LXC backup with storage', async () => {
        (mockClient.request as any).mockResolvedValue('task-444');

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'restore',
          type: 'lxc',
          node: 'pve2',
          vmid: 205,
          archive: 'local:backup/vzdump-lxc-200-2025_02_10-11_00_00.tar.zst',
          storage: 'local-lvm',
        });

        expect(result.isError).toBe(false);
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve2/lxc',
          'POST',
          expect.objectContaining({
            vmid: '205',
            archive: 'local:backup/vzdump-lxc-200-2025_02_10-11_00_00.tar.zst',
            storage: 'local-lvm',
            restore: 1,
          })
        );
      });

      it('should require elevated permissions for restore', async () => {
        const result = await handleBackup(mockClient, mockConfigNoElevated, {
          action: 'restore',
          type: 'vm',
          node: 'pve1',
          vmid: 105,
          archive: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
    });

    describe('delete action', () => {
      it('should delete backup (no type parameter)', async () => {
        (mockClient.request as any).mockResolvedValue('task-555');

        const result = await handleBackup(mockClient, mockConfig, {
          action: 'delete',
          node: 'pve1',
          storage: 'local',
          volume: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
        });

        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Backup Deletion Started');
        expect(mockClient.request).toHaveBeenCalledWith(
          '/nodes/pve1/storage/local/content/local%3Abackup%2Fvzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
          'DELETE'
        );
      });

      it('should require elevated permissions for delete', async () => {
        const result = await handleBackup(mockClient, mockConfigNoElevated, {
          action: 'delete',
          node: 'pve1',
          storage: 'local',
          volume: 'local:backup/vzdump-qemu-100-2025_02_10-10_00_00.vma.zst',
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
    });
  });
});
