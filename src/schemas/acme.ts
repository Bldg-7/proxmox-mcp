import { z } from 'zod';

export const acmeAccountSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list').describe('List all ACME accounts'),
  }),
  z.object({
    action: z.literal('get').describe('Get ACME account details'),
    name: z.string().min(1).describe('ACME account name'),
  }),
  z.object({
    action: z.literal('create').describe('Create ACME account'),
    contact: z.string().min(1).describe('Contact email address'),
    name: z.string().min(1).optional().describe('ACME account name'),
    tos_url: z.string().optional().describe('URL of CA TermsOfService'),
    directory: z.string().optional().describe('URL of ACME CA directory endpoint'),
  }),
  z.object({
    action: z.literal('update').describe('Update ACME account'),
    name: z.string().min(1).describe('ACME account name'),
    contact: z.string().optional().describe('Contact email address'),
  }),
  z.object({
    action: z.literal('delete').describe('Delete ACME account'),
    name: z.string().min(1).describe('ACME account name'),
  }),
]);
export type AcmeAccountInput = z.input<typeof acmeAccountSchema>;

export const acmeInfoSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list_plugins').describe('List ACME plugins'),
  }),
  z.object({
    action: z.literal('get_plugin').describe('Get ACME plugin details'),
    id: z.string().min(1).describe('ACME plugin ID'),
  }),
  z.object({
    action: z.literal('directories').describe('Get ACME directory endpoints'),
  }),
]);
export type AcmeInfoInput = z.input<typeof acmeInfoSchema>;
