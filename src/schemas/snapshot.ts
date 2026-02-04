import { z } from 'zod';

// Base schema for snapshot operations
const baseSnapshotSchema = z.object({
  node: z.string().min(1).describe('Node name where container/VM is located'),
  vmid: z.coerce.number().describe('Container/VM ID number'),
  snapname: z.string().min(1).describe('Snapshot name'),
});

// Base schema for create operations with optional description
const createSnapshotSchema = baseSnapshotSchema.extend({
  description: z.string().optional().describe('Optional snapshot description'),
});

// proxmox_create_snapshot_lxc - Create a snapshot of an LXC container
export const createSnapshotLxcSchema = createSnapshotSchema;

export type CreateSnapshotLxcInput = z.infer<typeof createSnapshotLxcSchema>;

// proxmox_create_snapshot_vm - Create a snapshot of a QEMU VM
export const createSnapshotVmSchema = createSnapshotSchema;

export type CreateSnapshotVmInput = z.infer<typeof createSnapshotVmSchema>;

// proxmox_list_snapshots_lxc - List all snapshots of an LXC container
export const listSnapshotsLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
});

export type ListSnapshotsLxcInput = z.infer<typeof listSnapshotsLxcSchema>;

// proxmox_list_snapshots_vm - List all snapshots of a QEMU VM
export const listSnapshotsVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

export type ListSnapshotsVmInput = z.infer<typeof listSnapshotsVmSchema>;

// proxmox_rollback_snapshot_lxc - Rollback an LXC container to a snapshot
export const rollbackSnapshotLxcSchema = baseSnapshotSchema;

export type RollbackSnapshotLxcInput = z.infer<typeof rollbackSnapshotLxcSchema>;

// proxmox_rollback_snapshot_vm - Rollback a QEMU VM to a snapshot
export const rollbackSnapshotVmSchema = baseSnapshotSchema;

export type RollbackSnapshotVmInput = z.infer<typeof rollbackSnapshotVmSchema>;

// proxmox_delete_snapshot_lxc - Delete a snapshot of an LXC container
export const deleteSnapshotLxcSchema = baseSnapshotSchema;

export type DeleteSnapshotLxcInput = z.infer<typeof deleteSnapshotLxcSchema>;

// proxmox_delete_snapshot_vm - Delete a snapshot of a QEMU VM
export const deleteSnapshotVmSchema = baseSnapshotSchema;

export type DeleteSnapshotVmInput = z.infer<typeof deleteSnapshotVmSchema>;
