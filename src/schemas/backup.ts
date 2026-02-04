import { z } from 'zod';

// proxmox_create_backup_lxc - Create a backup of an LXC container
export const createBackupLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  storage: z.string().default('local').describe('Storage location for backup'),
  mode: z.enum(['snapshot', 'suspend', 'stop']).default('snapshot').describe('Backup mode'),
  compress: z.enum(['none', 'lzo', 'gzip', 'zstd']).default('zstd').describe('Compression algorithm'),
});

export type CreateBackupLxcInput = z.infer<typeof createBackupLxcSchema>;

// proxmox_create_backup_vm - Create a backup of a QEMU VM
export const createBackupVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  storage: z.string().default('local').describe('Storage location for backup'),
  mode: z.enum(['snapshot', 'suspend', 'stop']).default('snapshot').describe('Backup mode'),
  compress: z.enum(['none', 'lzo', 'gzip', 'zstd']).default('zstd').describe('Compression algorithm'),
});

export type CreateBackupVmInput = z.infer<typeof createBackupVmSchema>;

// proxmox_list_backups - List all backups on a storage
export const listBackupsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().default('local').describe('Storage name'),
});

export type ListBackupsInput = z.infer<typeof listBackupsSchema>;

// proxmox_restore_backup_lxc - Restore an LXC container from backup
export const restoreBackupLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container will be restored'),
  vmid: z.coerce.number().describe('New container ID for restored container'),
  archive: z.string().min(1).describe('Backup archive path (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst)'),
  storage: z.string().optional().describe('Storage location for restored container (optional)'),
});

export type RestoreBackupLxcInput = z.infer<typeof restoreBackupLxcSchema>;

// proxmox_restore_backup_vm - Restore a QEMU VM from backup
export const restoreBackupVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM will be restored'),
  vmid: z.coerce.number().describe('New VM ID for restored VM'),
  archive: z.string().min(1).describe('Backup archive path (e.g., local:backup/vzdump-qemu-100-2025_11_06-09_00_00.vma.zst)'),
  storage: z.string().optional().describe('Storage location for restored VM (optional)'),
});

export type RestoreBackupVmInput = z.infer<typeof restoreBackupVmSchema>;

// proxmox_delete_backup - Delete a backup file from storage
export const deleteBackupSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage name (e.g., local)'),
  volume: z.string().min(1).describe('Backup volume ID (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst)'),
});

export type DeleteBackupInput = z.infer<typeof deleteBackupSchema>;
