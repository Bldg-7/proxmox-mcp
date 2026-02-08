import { z } from 'zod';

// proxmox_list_acme_accounts - List ACME accounts
export const listAcmeAccountsSchema = z.object({});

export type ListAcmeAccountsInput = z.infer<typeof listAcmeAccountsSchema>;

// proxmox_get_acme_account - Get ACME account information
export const getAcmeAccountSchema = z.object({
  name: z.string().min(1).describe('ACME account name'),
});

export type GetAcmeAccountInput = z.infer<typeof getAcmeAccountSchema>;

// proxmox_create_acme_account - Create ACME account
export const createAcmeAccountSchema = z.object({
  name: z.string().min(1).optional().describe('ACME account name'),
  contact: z.string().min(1).describe('Contact email address'),
  tos_url: z.string().optional().describe('URL of CA TermsOfService - setting this indicates agreement'),
  directory: z.string().optional().describe('URL of ACME CA directory endpoint'),
});

export type CreateAcmeAccountInput = z.infer<typeof createAcmeAccountSchema>;

// proxmox_update_acme_account - Update ACME account
export const updateAcmeAccountSchema = z.object({
  name: z.string().min(1).describe('ACME account name'),
  contact: z.string().optional().describe('Contact email address'),
});

export type UpdateAcmeAccountInput = z.infer<typeof updateAcmeAccountSchema>;

// proxmox_delete_acme_account - Delete ACME account
export const deleteAcmeAccountSchema = z.object({
  name: z.string().min(1).describe('ACME account name'),
});

export type DeleteAcmeAccountInput = z.infer<typeof deleteAcmeAccountSchema>;

// proxmox_list_acme_plugins - List ACME plugins
export const listAcmePluginsSchema = z.object({});

export type ListAcmePluginsInput = z.infer<typeof listAcmePluginsSchema>;

// proxmox_get_acme_plugin - Get ACME plugin configuration
export const getAcmePluginSchema = z.object({
  id: z.string().min(1).describe('ACME plugin ID'),
});

export type GetAcmePluginInput = z.infer<typeof getAcmePluginSchema>;

// proxmox_get_acme_directories - Get ACME directories
export const getAcmeDirectoriesSchema = z.object({});

export type GetAcmeDirectoriesInput = z.infer<typeof getAcmeDirectoriesSchema>;
