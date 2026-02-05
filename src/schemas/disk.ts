import { z } from 'zod';

// proxmox_add_disk_vm - Add a new disk to a QEMU VM
export const addDiskVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  disk: z.string().min(1).describe('Disk name (e.g., scsi1, virtio1, sata1, ide1)'),
  storage: z.string().min(1).describe('Storage name (e.g., local-lvm)'),
  size: z.string().min(1).describe('Disk size in GB (e.g., 10)'),
});

export type AddDiskVmInput = z.infer<typeof addDiskVmSchema>;

// proxmox_add_mountpoint_lxc - Add a mount point to an LXC container
export const addMountpointLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  mp: z.string().min(1).describe('Mount point name (e.g., mp0, mp1, mp2)'),
  storage: z.string().min(1).describe('Storage name (e.g., local-lvm)'),
  size: z.string().min(1).describe('Mount point size in GB (e.g., 10)'),
});

export type AddMountpointLxcInput = z.infer<typeof addMountpointLxcSchema>;

// proxmox_resize_disk_vm - Resize a QEMU VM disk
export const resizeDiskVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  disk: z.string().min(1).describe('Disk name (e.g., scsi0, virtio0, sata0, ide0)'),
  size: z.string().min(1).describe('New size with + for relative or absolute (e.g., +10G or 50G)'),
});

export type ResizeDiskVmInput = z.infer<typeof resizeDiskVmSchema>;

// proxmox_resize_disk_lxc - Resize an LXC container disk or mount point
export const resizeDiskLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  disk: z.string().min(1).describe('Disk name (rootfs, mp0, mp1, etc.)'),
  size: z.string().min(1).describe('New size with + for relative or absolute (e.g., +10G or 50G)'),
});

export type ResizeDiskLxcInput = z.infer<typeof resizeDiskLxcSchema>;

// proxmox_remove_disk_vm - Remove a disk from a QEMU VM
export const removeDiskVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  disk: z.string().min(1).describe('Disk name to remove (e.g., scsi1, virtio1, sata1, ide1)'),
});

export type RemoveDiskVmInput = z.infer<typeof removeDiskVmSchema>;

// proxmox_remove_mountpoint_lxc - Remove a mount point from an LXC container
export const removeMountpointLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  mp: z.string().min(1).describe('Mount point name to remove (e.g., mp0, mp1, mp2)'),
});

export type RemoveMountpointLxcInput = z.infer<typeof removeMountpointLxcSchema>;

// proxmox_move_disk_vm - Move a QEMU VM disk to different storage
export const moveDiskVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  disk: z.string().min(1).describe('Disk name to move (e.g., scsi0, virtio0, sata0, ide0)'),
  storage: z.string().min(1).describe('Target storage name'),
  delete: z.boolean().default(true).describe('Delete source disk after move (default: true)'),
});

export type MoveDiskVmInput = z.infer<typeof moveDiskVmSchema>;

// proxmox_move_disk_lxc - Move an LXC container disk to different storage
export const moveDiskLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  disk: z.string().min(1).describe('Disk/volume name to move (rootfs, mp0, mp1, etc.)'),
  storage: z.string().min(1).describe('Target storage name'),
  delete: z.boolean().default(true).describe('Delete source disk after move (default: true)'),
});

export type MoveDiskLxcInput = z.infer<typeof moveDiskLxcSchema>;

// proxmox_get_node_disks - Get list of disks on a node
export const getNodeDisksSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  include_partitions: z.boolean().optional().describe('Include partitions in listing'),
  skip_smart: z.boolean().optional().describe('Skip SMART health checks (faster)'),
  type: z.enum(['unused', 'journal_disks']).optional().describe('Filter by disk type'),
});

export type GetNodeDisksInput = z.infer<typeof getNodeDisksSchema>;

// proxmox_get_disk_smart - Get SMART health information for a disk
export const getDiskSmartSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  disk: z.string().min(1).describe('Block device path (e.g., /dev/sda)'),
  health_only: z.boolean().optional().describe('Only return health status'),
});

export type GetDiskSmartInput = z.infer<typeof getDiskSmartSchema>;

// proxmox_get_node_lvm - Get LVM information for a node
export const getNodeLvmSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeLvmInput = z.infer<typeof getNodeLvmSchema>;

// proxmox_get_node_zfs - Get ZFS information for a node
export const getNodeZfsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeZfsInput = z.infer<typeof getNodeZfsSchema>;
