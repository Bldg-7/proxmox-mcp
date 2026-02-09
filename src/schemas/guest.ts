import { z } from 'zod';

// ── Consolidated: proxmox_guest_list ─────────────────────────────────────
// Replaces: proxmox_get_vms (already queries both VM and LXC)
export const guestListSchema = z.object({
  node: z.string().optional().describe('Optional: filter by specific node'),
  type: z.enum(['qemu', 'lxc', 'all']).default('all').describe('VM type filter'),
});

export type GuestListInput = z.infer<typeof guestListSchema>;

// ── Consolidated: proxmox_guest_status ───────────────────────────────────
// Replaces: proxmox_get_vm_status + proxmox_get_lxc_status
export const guestStatusSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestStatusInput = z.infer<typeof guestStatusSchema>;

// ── Consolidated: proxmox_guest_config ───────────────────────────────────
// Replaces: proxmox_get_vm_config + proxmox_get_lxc_config
export const guestConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestConfigInput = z.infer<typeof guestConfigSchema>;

// ── Consolidated: proxmox_guest_pending ──────────────────────────────────
// Replaces: proxmox_get_vm_pending + proxmox_get_lxc_pending
export const guestPendingSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestPendingInput = z.infer<typeof guestPendingSchema>;

// ── Consolidated: proxmox_guest_feature ──────────────────────────────────
// Replaces: proxmox_check_vm_feature + proxmox_check_lxc_feature
export const guestFeatureSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
    feature: z.enum(['snapshot', 'clone', 'copy']).describe('Feature to check (snapshot, clone, copy)'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
    feature: z.enum(['snapshot', 'clone', 'copy']).describe('Feature to check (snapshot, clone, copy)'),
  }),
]);

export type GuestFeatureInput = z.infer<typeof guestFeatureSchema>;

// ── Consolidated: proxmox_guest_rrddata ──────────────────────────────────
// Replaces: proxmox_get_vm_rrddata + proxmox_get_lxc_rrddata
export const guestRrddataSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
    timeframe: z.string().optional().describe('Timeframe (e.g., hour, day, week, month, year)'),
    cf: z.string().optional().describe('Consolidation function (e.g., AVERAGE, MAX)'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
    timeframe: z.string().optional().describe('Timeframe (e.g., hour, day, week, month, year)'),
    cf: z.string().optional().describe('Consolidation function (e.g., AVERAGE, MAX)'),
  }),
]);

export type GuestRrddataInput = z.infer<typeof guestRrddataSchema>;

// ── Consolidated: proxmox_guest_start ────────────────────────────────────
// Replaces: proxmox_start_vm + proxmox_start_lxc
export const guestStartSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestStartInput = z.infer<typeof guestStartSchema>;

// ── Consolidated: proxmox_guest_stop ─────────────────────────────────────
// Replaces: proxmox_stop_vm + proxmox_stop_lxc
export const guestStopSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestStopInput = z.infer<typeof guestStopSchema>;

// ── Consolidated: proxmox_guest_reboot ───────────────────────────────────
// Replaces: proxmox_reboot_vm + proxmox_reboot_lxc
export const guestRebootSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestRebootInput = z.infer<typeof guestRebootSchema>;

// ── Consolidated: proxmox_guest_shutdown ─────────────────────────────────
// Replaces: proxmox_shutdown_vm + proxmox_shutdown_lxc
export const guestShutdownSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestShutdownInput = z.infer<typeof guestShutdownSchema>;

// ── Consolidated: proxmox_guest_delete ───────────────────────────────────
// Replaces: proxmox_delete_vm + proxmox_delete_lxc
export const guestDeleteSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestDeleteInput = z.infer<typeof guestDeleteSchema>;

// ── proxmox_guest_pause (VM only) ────────────────────────────────────────
// Replaces: proxmox_pause_vm (LXC does not support pause)
export const guestPauseSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

export type GuestPauseInput = z.infer<typeof guestPauseSchema>;

// ── proxmox_guest_resume (VM only) ───────────────────────────────────────
// Replaces: proxmox_resume_vm (LXC does not support resume)
export const guestResumeSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

export type GuestResumeInput = z.infer<typeof guestResumeSchema>;

// ── Consolidated: proxmox_guest_clone ────────────────────────────────────
// Replaces legacy VM/LXC clone tools
export const guestCloneSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID to clone from'),
    newid: z.coerce.number().describe('New VM ID'),
    name: z.string().optional().describe('Name for cloned VM (optional)'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID to clone from'),
    newid: z.coerce.number().describe('New container ID'),
    hostname: z.string().optional().describe('Hostname for cloned container (optional)'),
  }),
]);

export type GuestCloneInput = z.infer<typeof guestCloneSchema>;

// ── Consolidated: proxmox_guest_resize ───────────────────────────────────
// Replaces legacy VM/LXC resize tools
export const guestResizeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
    memory: z.number().optional().describe('Memory in MB (optional)'),
    cores: z.number().optional().describe('Number of CPU cores (optional)'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
    memory: z.number().optional().describe('Memory in MB (optional)'),
    cores: z.number().optional().describe('Number of CPU cores (optional)'),
  }),
]);

export type GuestResizeInput = z.infer<typeof guestResizeSchema>;

// ── Consolidated: proxmox_guest_config_update ────────────────────────────
// Replaces legacy VM/LXC config update tools
export const guestConfigUpdateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
    config: z.record(z.string(), z.any()).optional().describe(
      'Key-value pairs of VM configuration to set. Use proxmox_guest_config with type=vm to discover valid keys.'
    ),
    delete: z.string().optional().describe(
      'Comma-separated list of config keys to REMOVE (e.g. "ciuser,cipassword"). Does NOT delete the VM.'
    ),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
    config: z.record(z.string(), z.any()).optional().describe(
      'Key-value pairs of container configuration to set. Use proxmox_guest_config with type=lxc to discover valid keys.'
    ),
    delete: z.string().optional().describe(
      'Comma-separated list of config keys to REMOVE (e.g. "mp0,nameserver"). Does NOT delete the container.'
    ),
  }),
]);

export type GuestConfigUpdateInput = z.infer<typeof guestConfigUpdateSchema>;

// ── Consolidated: proxmox_guest_migrate ──────────────────────────────────
// Replaces legacy VM/LXC migration tools
export const guestMigrateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Source node name'),
    vmid: z.coerce.number().describe('VM ID to migrate'),
    target: z.string().min(1).describe('Target node name'),
    online: z.boolean().optional().describe('Live migrate running VM'),
    force: z.boolean().optional().describe('Force migration'),
    bwlimit: z.number().int().min(0).optional().describe('Migration bandwidth limit (MB/s)'),
    ['with-local-disks']: z.boolean().optional().describe('Migrate local disks'),
    ['with-local-storage']: z.boolean().optional().describe('Migrate local storage'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Source node name'),
    vmid: z.coerce.number().describe('Container ID to migrate'),
    target: z.string().min(1).describe('Target node name'),
    online: z.boolean().optional().describe('Live migrate running container'),
    force: z.boolean().optional().describe('Force migration'),
    bwlimit: z.number().int().min(0).optional().describe('Migration bandwidth limit (MB/s)'),
    ['with-local-disks']: z.boolean().optional().describe('Migrate local disks'),
    ['with-local-storage']: z.boolean().optional().describe('Migrate local storage'),
  }),
]);

export type GuestMigrateInput = z.infer<typeof guestMigrateSchema>;

// ── Consolidated: proxmox_guest_template ─────────────────────────────────
// Replaces legacy VM/LXC template tools
export const guestTemplateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('vm'),
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  }),
  z.object({
    type: z.literal('lxc'),
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  }),
]);

export type GuestTemplateInput = z.infer<typeof guestTemplateSchema>;
