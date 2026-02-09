import { z } from 'zod';

const baseConsoleSchema = z.object({
  node: z.string().min(1).describe('Node name where the guest is located'),
  vmid: z.coerce.number().describe('VM or container ID'),
});

export const consoleVncSchema = baseConsoleSchema.extend({
  type: z.enum(['vm', 'lxc']).describe('Guest type: vm or lxc'),
});
export type ConsoleVncInput = z.input<typeof consoleVncSchema>;

export const consoleTermSchema = baseConsoleSchema.extend({
  type: z.enum(['vm', 'lxc']).describe('Guest type: vm or lxc'),
});
export type ConsoleTermInput = z.input<typeof consoleTermSchema>;

export const getSpiceProxySchema = baseConsoleSchema;
export type GetSpiceProxyInput = z.input<typeof getSpiceProxySchema>;
