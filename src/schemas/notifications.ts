import { z } from 'zod';

// proxmox_list_notification_targets - List notification targets
export const listNotificationTargetsSchema = z.object({});

export type ListNotificationTargetsInput = z.infer<typeof listNotificationTargetsSchema>;

// proxmox_get_notification_target - Get notification target configuration
export const getNotificationTargetSchema = z.object({
  type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
  name: z.string().min(1).describe('Notification target name'),
});

export type GetNotificationTargetInput = z.infer<typeof getNotificationTargetSchema>;

// proxmox_create_notification_target - Create notification target
export const createNotificationTargetSchema = z.object({
  type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
  name: z.string().min(1).describe('Notification target name'),
  // Common optional parameters for all types
  comment: z.string().optional().describe('Comment'),
  disable: z.boolean().optional().describe('Disable this target'),
  // SMTP-specific parameters
  server: z.string().optional().describe('SMTP server address (for smtp type)'),
  port: z.number().optional().describe('SMTP server port (for smtp type)'),
  username: z.string().optional().describe('SMTP username (for smtp type)'),
  password: z.string().optional().describe('SMTP password (for smtp type)'),
  mode: z.enum(['insecure', 'starttls', 'tls']).optional().describe('SMTP encryption mode (for smtp type)'),
  // Gotify-specific parameters
  token: z.string().optional().describe('Gotify API token (for gotify type)'),
  // Common email parameters (for smtp and sendmail types)
  mailto: z.string().optional().describe('Recipient email address'),
  'mailto-user': z.string().optional().describe('Recipient user'),
  from: z.string().optional().describe('Sender email address'),
  author: z.string().optional().describe('Author name'),
});

export type CreateNotificationTargetInput = z.infer<typeof createNotificationTargetSchema>;

// proxmox_delete_notification_target - Delete notification target
export const deleteNotificationTargetSchema = z.object({
  type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
  name: z.string().min(1).describe('Notification target name'),
});

export type DeleteNotificationTargetInput = z.infer<typeof deleteNotificationTargetSchema>;

// proxmox_test_notification_target - Test notification target
export const testNotificationTargetSchema = z.object({
  name: z.string().min(1).describe('Notification target name'),
});

export type TestNotificationTargetInput = z.infer<typeof testNotificationTargetSchema>;
