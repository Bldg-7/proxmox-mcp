import { z } from 'zod';

// proxmox_list_pools - List pools
export const listPoolsSchema = z.object({});

export type ListPoolsInput = z.input<typeof listPoolsSchema>;

// proxmox_get_pool - Get pool details
export const getPoolSchema = z.object({
  poolid: z.string().min(1).describe('Pool identifier'),
});

export type GetPoolInput = z.input<typeof getPoolSchema>;

// proxmox_create_pool - Create pool
export const createPoolSchema = z.object({
  poolid: z.string().min(1).describe('Pool identifier'),
  comment: z.string().optional().describe('Pool description'),
});

export type CreatePoolInput = z.input<typeof createPoolSchema>;

// proxmox_update_pool - Update pool
export const updatePoolSchema = z.object({
  poolid: z.string().min(1).describe('Pool identifier'),
  comment: z.string().optional().describe('Updated pool description'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdatePoolInput = z.input<typeof updatePoolSchema>;

// proxmox_delete_pool - Delete pool
export const deletePoolSchema = z.object({
  poolid: z.string().min(1).describe('Pool identifier'),
});

export type DeletePoolInput = z.input<typeof deletePoolSchema>;
