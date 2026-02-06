import { z } from 'zod';

const nodeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

const cephNameSchema = z
  .string()
  .min(1)
  .max(128)
  .describe('Ceph identifier');

// proxmox_get_ceph_status - Get Ceph cluster status
export const getCephStatusSchema = nodeSchema;

export type GetCephStatusInput = z.input<typeof getCephStatusSchema>;

// proxmox_list_ceph_osds - List Ceph OSDs
export const listCephOsdsSchema = nodeSchema;

export type ListCephOsdsInput = z.input<typeof listCephOsdsSchema>;

// proxmox_create_ceph_osd - Create Ceph OSD
export const createCephOsdSchema = nodeSchema.extend({
  dev: z.string().min(1).describe('OSD device path (e.g., /dev/sdb)'),
  osdid: z.coerce.number().int().min(0).optional().describe('Optional OSD ID'),
  dbdev: z.string().optional().describe('Optional DB device path'),
  waldev: z.string().optional().describe('Optional WAL device path'),
  ['crush-device-class']: z
    .string()
    .optional()
    .describe('CRUSH device class (e.g., hdd, ssd)'),
  encrypted: z.boolean().optional().describe('Enable dm-crypt encryption'),
});

export type CreateCephOsdInput = z.input<typeof createCephOsdSchema>;

// proxmox_delete_ceph_osd - Delete Ceph OSD
export const deleteCephOsdSchema = nodeSchema.extend({
  id: z.coerce.number().int().min(0).describe('OSD ID'),
});

export type DeleteCephOsdInput = z.input<typeof deleteCephOsdSchema>;

// proxmox_list_ceph_mons - List Ceph monitors
export const listCephMonsSchema = nodeSchema;

export type ListCephMonsInput = z.input<typeof listCephMonsSchema>;

// proxmox_create_ceph_mon - Create Ceph monitor
export const createCephMonSchema = nodeSchema.extend({
  monid: cephNameSchema.describe('Monitor ID'),
});

export type CreateCephMonInput = z.input<typeof createCephMonSchema>;

// proxmox_delete_ceph_mon - Delete Ceph monitor
export const deleteCephMonSchema = nodeSchema.extend({
  monid: cephNameSchema.describe('Monitor ID'),
});

export type DeleteCephMonInput = z.input<typeof deleteCephMonSchema>;

// proxmox_list_ceph_mds - List Ceph MDS daemons
export const listCephMdsSchema = nodeSchema;

export type ListCephMdsInput = z.input<typeof listCephMdsSchema>;

// proxmox_create_ceph_mds - Create Ceph MDS daemon
export const createCephMdsSchema = nodeSchema.extend({
  name: cephNameSchema.describe('MDS daemon name'),
});

export type CreateCephMdsInput = z.input<typeof createCephMdsSchema>;

// proxmox_delete_ceph_mds - Delete Ceph MDS daemon
export const deleteCephMdsSchema = nodeSchema.extend({
  name: cephNameSchema.describe('MDS daemon name'),
});

export type DeleteCephMdsInput = z.input<typeof deleteCephMdsSchema>;

// proxmox_list_ceph_pools - List Ceph pools
export const listCephPoolsSchema = nodeSchema;

export type ListCephPoolsInput = z.input<typeof listCephPoolsSchema>;

// proxmox_create_ceph_pool - Create Ceph pool
export const createCephPoolSchema = nodeSchema.extend({
  name: cephNameSchema.describe('Pool name'),
  pg_num: z.coerce.number().int().min(1).optional().describe('Placement group count'),
  size: z.coerce.number().int().min(1).optional().describe('Replication size'),
  min_size: z
    .coerce
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Minimum replication size'),
  crush_rule: z.string().optional().describe('CRUSH rule name'),
  ['pg_autoscale_mode']: z
    .string()
    .optional()
    .describe('PG autoscale mode (e.g., on, off, warn)'),
});

export type CreateCephPoolInput = z.input<typeof createCephPoolSchema>;

// proxmox_update_ceph_pool - Update Ceph pool
export const updateCephPoolSchema = nodeSchema.extend({
  name: cephNameSchema.describe('Pool name'),
  pg_num: z.coerce.number().int().min(1).optional().describe('Placement group count'),
  size: z.coerce.number().int().min(1).optional().describe('Replication size'),
  min_size: z
    .coerce
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Minimum replication size'),
  crush_rule: z.string().optional().describe('CRUSH rule name'),
  ['pg_autoscale_mode']: z
    .string()
    .optional()
    .describe('PG autoscale mode (e.g., on, off, warn)'),
});

export type UpdateCephPoolInput = z.input<typeof updateCephPoolSchema>;

// proxmox_delete_ceph_pool - Delete Ceph pool
export const deleteCephPoolSchema = nodeSchema.extend({
  name: cephNameSchema.describe('Pool name'),
});

export type DeleteCephPoolInput = z.input<typeof deleteCephPoolSchema>;

// proxmox_list_ceph_fs - List Ceph filesystems
export const listCephFsSchema = nodeSchema;

export type ListCephFsInput = z.input<typeof listCephFsSchema>;

// proxmox_create_ceph_fs - Create Ceph filesystem
export const createCephFsSchema = nodeSchema.extend({
  name: cephNameSchema.describe('CephFS name'),
  pool: z.string().optional().describe('Primary data pool name'),
  data_pool: z.string().optional().describe('Data pool name'),
  metadata_pool: z.string().optional().describe('Metadata pool name'),
});

export type CreateCephFsInput = z.input<typeof createCephFsSchema>;
