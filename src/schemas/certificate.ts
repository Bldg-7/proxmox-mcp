import { z } from 'zod';

const nodeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export const certificateSchema = z.discriminatedUnion('action', [
  nodeSchema.extend({
    action: z.literal('list').describe('List node certificates'),
  }),
  nodeSchema.extend({
    action: z.literal('upload').describe('Upload custom SSL certificate'),
    certificates: z.string().describe('PEM encoded certificate(s)'),
    key: z.string().optional().describe('PEM encoded private key'),
    force: z.boolean().optional().describe('Overwrite existing custom certificate'),
    restart: z.boolean().optional().describe('Restart pveproxy service'),
  }),
  nodeSchema.extend({
    action: z.literal('delete').describe('Delete custom SSL certificate'),
  }),
]);
export type CertificateInput = z.input<typeof certificateSchema>;

export const acmeCertSchema = z.discriminatedUnion('action', [
  nodeSchema.extend({
    action: z.literal('order').describe('Order new ACME certificate'),
    force: z.boolean().optional().describe('Force renewal even if certificate is still valid'),
  }),
  nodeSchema.extend({
    action: z.literal('renew').describe('Renew ACME certificate'),
    force: z.boolean().optional().describe('Force renewal even if certificate is still valid'),
  }),
  nodeSchema.extend({
    action: z.literal('revoke').describe('Revoke ACME certificate'),
  }),
  nodeSchema.extend({
    action: z.literal('config').describe('Get ACME configuration'),
  }),
]);
export type AcmeCertInput = z.input<typeof acmeCertSchema>;
