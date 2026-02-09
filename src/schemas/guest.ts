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
