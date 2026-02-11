import { z } from 'zod';

export const lxcExecSchema = z.object({
  node: z.string().min(1).describe('Proxmox node name where the LXC container runs'),
  vmid: z
    .number()
    .int()
    .min(100)
    .max(999999999)
    .describe('LXC container ID'),
  command: z
    .string()
    .min(1)
    .max(1000)
    .describe('Command to execute inside the container'),
  timeout: z
    .number()
    .int()
    .min(1)
    .max(120)
    .default(30)
    .describe('Execution timeout in seconds (default: 30, max: 120)'),
});

export type LxcExecInput = z.infer<typeof lxcExecSchema>;
