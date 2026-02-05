import { z } from 'zod';

// Base schema for node + vmid operations
const baseVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

// proxmox_get_vms - List all VMs
export const getVmsSchema = z.object({
  node: z.string().optional().describe('Optional: filter by specific node'),
  type: z.enum(['qemu', 'lxc', 'all']).default('all').describe('VM type filter'),
});

export type GetVmsInput = z.infer<typeof getVmsSchema>;

// proxmox_get_vm_status - Get detailed status for a specific VM
export const getVmStatusSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  type: z.enum(['qemu', 'lxc']).default('qemu').describe('VM type'),
});

export type GetVmStatusInput = z.infer<typeof getVmStatusSchema>;

// proxmox_get_vm_config - Get hardware configuration for a QEMU VM
export const getVmConfigSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

export type GetVmConfigInput = z.infer<typeof getVmConfigSchema>;

// proxmox_get_lxc_config - Get hardware configuration for an LXC container
export const getLxcConfigSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
});

export type GetLxcConfigInput = z.infer<typeof getLxcConfigSchema>;

// proxmox_get_storage - List all storage pools
export const getStorageSchema = z.object({
  node: z.string().optional().describe('Optional: filter by specific node'),
});

export type GetStorageInput = z.infer<typeof getStorageSchema>;

// proxmox_execute_vm_command - Execute a shell command on a VM
export const executeVmCommandSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  command: z.string().min(1).describe('Shell command to execute'),
  type: z.enum(['qemu', 'lxc']).default('qemu').describe('VM type'),
});

export type ExecuteVmCommandInput = z.infer<typeof executeVmCommandSchema>;

// proxmox_list_templates - List available LXC templates
export const listTemplatesSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().default('local').describe('Storage name (e.g., local)'),
});

export type ListTemplatesInput = z.infer<typeof listTemplatesSchema>;

// proxmox_create_lxc - Create a new LXC container
export const createLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container will be created'),
  vmid: z.coerce.number().describe('Container ID number (must be unique, or use proxmox_get_next_vmid)'),
  ostemplate: z.string().min(1).describe('OS template (e.g., local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz)'),
  hostname: z.string().min(1).optional().describe('Container hostname'),
  password: z.string().min(1).optional().describe('Root password'),
  memory: z.number().default(512).describe('RAM in MB'),
  storage: z.string().default('local-lvm').describe('Storage location'),
  rootfs: z.string().default('8').describe('Root filesystem size in GB'),
});

export type CreateLxcInput = z.infer<typeof createLxcSchema>;

// proxmox_create_vm - Create a new QEMU VM
export const createVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM will be created'),
  vmid: z.coerce.number().describe('VM ID number (must be unique, or use proxmox_get_next_vmid)'),
  name: z.string().min(1).optional().describe('VM name'),
  memory: z.number().default(512).describe('RAM in MB'),
  cores: z.number().default(1).describe('Number of CPU cores'),
  sockets: z.number().default(1).describe('Number of CPU sockets'),
  disk_size: z.string().default('8G').describe('Disk size (e.g., "8G", "10G")'),
  storage: z.string().default('local-lvm').describe('Storage location for disk'),
  iso: z.string().optional().describe('ISO image (e.g., "local:iso/alpine-virt-3.19.1-x86_64.iso"), optional'),
  ostype: z.string().default('l26').describe('OS type (l26=Linux 2.6+, win10, etc)'),
  net0: z.string().default('virtio,bridge=vmbr0').describe('Network interface config'),
});

export type CreateVmInput = z.infer<typeof createVmSchema>;

// proxmox_start_lxc - Start an LXC container
export const startLxcSchema = baseVmSchema;

export type StartLxcInput = z.infer<typeof startLxcSchema>;

// proxmox_start_vm - Start a QEMU VM
export const startVmSchema = baseVmSchema;

export type StartVmInput = z.infer<typeof startVmSchema>;

// proxmox_stop_lxc - Stop an LXC container
export const stopLxcSchema = baseVmSchema;

export type StopLxcInput = z.infer<typeof stopLxcSchema>;

// proxmox_stop_vm - Stop a QEMU VM
export const stopVmSchema = baseVmSchema;

export type StopVmInput = z.infer<typeof stopVmSchema>;

// proxmox_delete_lxc - Delete an LXC container
export const deleteLxcSchema = baseVmSchema;

export type DeleteLxcInput = z.infer<typeof deleteLxcSchema>;

// proxmox_delete_vm - Delete a QEMU VM
export const deleteVmSchema = baseVmSchema;

export type DeleteVmInput = z.infer<typeof deleteVmSchema>;

// proxmox_reboot_lxc - Reboot an LXC container
export const rebootLxcSchema = baseVmSchema;

export type RebootLxcInput = z.infer<typeof rebootLxcSchema>;

// proxmox_reboot_vm - Reboot a QEMU VM
export const rebootVmSchema = baseVmSchema;

export type RebootVmInput = z.infer<typeof rebootVmSchema>;

// proxmox_shutdown_lxc - Gracefully shutdown an LXC container
export const shutdownLxcSchema = baseVmSchema;

export type ShutdownLxcInput = z.infer<typeof shutdownLxcSchema>;

// proxmox_shutdown_vm - Gracefully shutdown a QEMU VM
export const shutdownVmSchema = baseVmSchema;

export type ShutdownVmInput = z.infer<typeof shutdownVmSchema>;

// proxmox_pause_vm - Pause a QEMU VM
export const pauseVmSchema = baseVmSchema;

export type PauseVmInput = z.infer<typeof pauseVmSchema>;

// proxmox_resume_vm - Resume a paused QEMU VM
export const resumeVmSchema = baseVmSchema;

export type ResumeVmInput = z.infer<typeof resumeVmSchema>;

// proxmox_clone_lxc - Clone an LXC container
export const cloneLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID to clone from'),
  newid: z.coerce.number().describe('New container ID'),
  hostname: z.string().optional().describe('Hostname for cloned container (optional)'),
});

export type CloneLxcInput = z.infer<typeof cloneLxcSchema>;

// proxmox_clone_vm - Clone a QEMU VM
export const cloneVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID to clone from'),
  newid: z.coerce.number().describe('New VM ID'),
  name: z.string().optional().describe('Name for cloned VM (optional)'),
});

export type CloneVmInput = z.infer<typeof cloneVmSchema>;

// proxmox_resize_lxc - Resize an LXC container CPU/memory
export const resizeLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  memory: z.number().optional().describe('Memory in MB (optional)'),
  cores: z.number().optional().describe('Number of CPU cores (optional)'),
});

export type ResizeLxcInput = z.infer<typeof resizeLxcSchema>;

// proxmox_resize_vm - Resize a QEMU VM CPU/memory
export const resizeVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  memory: z.number().optional().describe('Memory in MB (optional)'),
  cores: z.number().optional().describe('Number of CPU cores (optional)'),
});

export type ResizeVmInput = z.infer<typeof resizeVmSchema>;
