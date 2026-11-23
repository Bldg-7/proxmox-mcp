import { z } from 'zod';
import { parseHostFingerprint } from '../security/ssh-host-key.js';

export const sslModeSchema = z.enum(['strict', 'verify', 'insecure']);
export type SslMode = z.infer<typeof sslModeSchema>;

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
  sslMode: sslModeSchema.default('strict'),
  sslCaCert: z
    .string()
    .optional(),
  sshEnabled: z
    .boolean()
    .default(false),
  sshHost: z
    .string()
    .optional(),
  sshPort: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(22),
  sshUser: z
    .string()
    .min(1)
    .default('root'),
  sshKeyPath: z
    .string()
    .optional(),
  sshNode: z
    .string()
    .optional(),
  sshHostKeyFingerprint: z.string().refine((value) => {
    try { parseHostFingerprint(value); return true; } catch { return false; }
  }, 'Expected OpenSSH SHA256:<base64> or 64-digit SHA-256 hex').optional(),
  sshKnownHostsPath: z.string().min(1).refine(
    (value) => value.startsWith('/') || value.startsWith('~/'),
    'PROXMOX_SSH_KNOWN_HOSTS must be an absolute path or start with ~/',
  ).optional(),
  sshAllowInsecure: z.boolean().default(false),
  // Absent unless the operator explicitly enables local file transfers.
  fileTransfer: z.object({
    transferRoot: z.string().min(1),
    journalRoot: z.string().min(1),
    uploadRoot: z.string().min(1).optional(),
    uploadMaxBytes: z.coerce.number().int().positive().safe().optional(),
    downloadMaxBytes: z.coerce.number().int().positive().safe().optional(),
    quotaBytes: z.coerce.number().int().positive().safe().optional(),
    timeoutSeconds: z.coerce.number().int().positive().max(2147483).optional(),
  }).optional(),
  allowUnsafeCommands: z
    .boolean()
    .default(false),
}).superRefine((config, ctx) => {
  if (config.fileTransfer && !config.allowElevated) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fileTransfer'], message: 'File transfers require PROXMOX_ALLOW_ELEVATED=true' });
  }
});

export type Config = z.infer<typeof configSchema>;
