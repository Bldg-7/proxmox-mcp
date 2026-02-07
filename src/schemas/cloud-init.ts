import { z } from 'zod';

const baseVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

// proxmox_get_cloudinit_config — List cloud-init configuration items
export const getCloudInitConfigSchema = baseVmSchema;
export type GetCloudInitConfigInput = z.input<typeof getCloudInitConfigSchema>;

// proxmox_dump_cloudinit — Dump rendered cloud-init config
export const dumpCloudInitSchema = baseVmSchema.extend({
  type: z.enum(['user', 'network', 'meta']).describe('Cloud-init config type to dump (user, network, or meta)'),
});
export type DumpCloudInitInput = z.input<typeof dumpCloudInitSchema>;

// proxmox_regenerate_cloudinit — Regenerate the cloud-init drive
export const regenerateCloudInitSchema = baseVmSchema;
export type RegenerateCloudInitInput = z.input<typeof regenerateCloudInitSchema>;
