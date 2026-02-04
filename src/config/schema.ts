import { z } from 'zod';

export const configSchema = z.object({
  host: z
    .string({ required_error: 'PROXMOX_HOST is required' })
    .min(1, 'PROXMOX_HOST cannot be empty'),
  port: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(8006),
  user: z
    .string()
    .min(1)
    .default('root@pam'),
  tokenName: z
    .string({ required_error: 'PROXMOX_TOKEN_NAME is required' })
    .min(1, 'PROXMOX_TOKEN_NAME cannot be empty'),
  tokenValue: z
    .string({ required_error: 'PROXMOX_TOKEN_VALUE is required' })
    .min(1, 'PROXMOX_TOKEN_VALUE cannot be empty'),
  allowElevated: z
    .boolean()
    .default(false),
  sslVerify: z
    .boolean()
    .default(false),
  sslCaCert: z
    .string()
    .optional(),
});

export type Config = z.infer<typeof configSchema>;
