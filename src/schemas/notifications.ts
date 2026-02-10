import { z } from 'zod';

export const notificationSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list').describe('List all notification targets'),
  }),
  z.object({
    action: z.literal('get').describe('Get notification target details'),
    target_type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
    name: z.string().min(1).describe('Notification target name'),
  }),
  z.object({
    action: z.literal('create').describe('Create notification target'),
    target_type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
    name: z.string().min(1).describe('Notification target name'),
    comment: z.string().optional().describe('Comment'),
    disable: z.boolean().optional().describe('Disable this target'),
    server: z.string().optional().describe('SMTP server address (for smtp type)'),
    port: z.number().optional().describe('SMTP server port (for smtp type)'),
    username: z.string().optional().describe('SMTP username (for smtp type)'),
    password: z.string().optional().describe('SMTP password (for smtp type)'),
    mode: z.enum(['insecure', 'starttls', 'tls']).optional().describe('SMTP encryption mode'),
    token: z.string().optional().describe('Gotify API token (for gotify type)'),
    mailto: z.string().optional().describe('Recipient email address'),
    'mailto-user': z.string().optional().describe('Recipient user'),
    from: z.string().optional().describe('Sender email address'),
    author: z.string().optional().describe('Author name'),
  }),
  z.object({
    action: z.literal('delete').describe('Delete notification target'),
    target_type: z.enum(['smtp', 'gotify', 'sendmail']).describe('Notification target type'),
    name: z.string().min(1).describe('Notification target name'),
  }),
  z.object({
    action: z.literal('test').describe('Test notification target'),
    name: z.string().min(1).describe('Notification target name'),
  }),
]);
export type NotificationInput = z.input<typeof notificationSchema>;
