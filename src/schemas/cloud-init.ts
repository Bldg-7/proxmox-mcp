import { z } from 'zod';

const baseVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

export const cloudInitSchema = z.discriminatedUnion('action', [
  baseVmSchema.extend({
    action: z.literal('get').describe('Get cloud-init configuration items'),
  }),
  baseVmSchema.extend({
    action: z.literal('dump').describe('Dump rendered cloud-init config'),
    dump_type: z.enum(['user', 'network', 'meta']).describe('Cloud-init config type to dump'),
  }),
  baseVmSchema.extend({
    action: z.literal('regenerate').describe('Regenerate the cloud-init drive'),
  }),
]);
export type CloudInitInput = z.input<typeof cloudInitSchema>;
