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
