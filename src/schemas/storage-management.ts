import { z } from 'zod';

// proxmox_list_storage_config - List storage configurations
export const listStorageConfigSchema = z.object({});

export type ListStorageConfigInput = z.input<typeof listStorageConfigSchema>;

// proxmox_get_storage_config - Get storage configuration
export const getStorageConfigSchema = z.object({
  storage: z.string().min(1).describe('Storage identifier'),
});

export type GetStorageConfigInput = z.input<typeof getStorageConfigSchema>;

const storageTypeEnum = z.enum([
  'dir',
  'lvm',
  'lvmthin',
  'nfs',
  'cifs',
  'zfspool',
  'btrfs',
  'cephfs',
  'rbd',
  'iscsi',
  'pbs',
  'glusterfs',
]);

// proxmox_create_storage - Create storage
export const createStorageSchema = z.object({
  storage: z.string().min(1).describe('Storage identifier'),
  type: storageTypeEnum.describe('Storage type'),
  content: z.string().optional().describe('Content types (comma-separated)'),
  path: z.string().optional().describe('Filesystem path for directory storage'),
  server: z.string().optional().describe('Remote server hostname or IP'),
  export: z.string().optional().describe('NFS export path'),
  share: z.string().optional().describe('CIFS share name'),
  username: z.string().optional().describe('Username for remote storage'),
  password: z.string().optional().describe('Password for remote storage'),
  domain: z.string().optional().describe('CIFS domain'),
  smbversion: z.string().optional().describe('CIFS SMB version'),
  nodes: z.string().optional().describe('Limit storage to specific nodes'),
  shared: z.boolean().optional().describe('Mark storage as shared'),
  disable: z.boolean().optional().describe('Disable storage'),
  maxfiles: z.number().int().min(0).optional().describe('Max backup files'),
  ['prune-backups']: z.string().optional().describe('Prune options for backups'),
  pool: z.string().optional().describe('Pool name for Ceph/RBD/ZFS'),
  vgname: z.string().optional().describe('LVM volume group name'),
  thinpool: z.string().optional().describe('LVM thin pool name'),
  monhost: z.string().optional().describe('Ceph monitor hosts'),
  fsname: z.string().optional().describe('CephFS filesystem name'),
  keyring: z.string().optional().describe('Ceph keyring path'),
  portal: z.string().optional().describe('iSCSI portal address'),
  target: z.string().optional().describe('iSCSI target'),
  options: z.string().optional().describe('Additional mount options'),
});

export type CreateStorageInput = z.input<typeof createStorageSchema>;

// proxmox_update_storage - Update storage configuration
export const updateStorageSchema = z.object({
  storage: z.string().min(1).describe('Storage identifier'),
  content: z.string().optional().describe('Content types (comma-separated)'),
  path: z.string().optional().describe('Filesystem path for directory storage'),
  server: z.string().optional().describe('Remote server hostname or IP'),
  export: z.string().optional().describe('NFS export path'),
  share: z.string().optional().describe('CIFS share name'),
  username: z.string().optional().describe('Username for remote storage'),
  password: z.string().optional().describe('Password for remote storage'),
  domain: z.string().optional().describe('CIFS domain'),
  smbversion: z.string().optional().describe('CIFS SMB version'),
  nodes: z.string().optional().describe('Limit storage to specific nodes'),
  shared: z.boolean().optional().describe('Mark storage as shared'),
  disable: z.boolean().optional().describe('Disable storage'),
  maxfiles: z.number().int().min(0).optional().describe('Max backup files'),
  ['prune-backups']: z.string().optional().describe('Prune options for backups'),
  pool: z.string().optional().describe('Pool name for Ceph/RBD/ZFS'),
  vgname: z.string().optional().describe('LVM volume group name'),
  thinpool: z.string().optional().describe('LVM thin pool name'),
  monhost: z.string().optional().describe('Ceph monitor hosts'),
  fsname: z.string().optional().describe('CephFS filesystem name'),
  keyring: z.string().optional().describe('Ceph keyring path'),
  portal: z.string().optional().describe('iSCSI portal address'),
  target: z.string().optional().describe('iSCSI target'),
  options: z.string().optional().describe('Additional mount options'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateStorageInput = z.input<typeof updateStorageSchema>;

// proxmox_delete_storage - Delete storage configuration
export const deleteStorageSchema = z.object({
  storage: z.string().min(1).describe('Storage identifier'),
});

export type DeleteStorageInput = z.input<typeof deleteStorageSchema>;

const requestId = z.string().uuid().describe('Client-generated UUID; reuse for retries of the same request');
const expectedSha256 = z.string().regex(/^[0-9a-fA-F]{64}$/).optional().describe('Expected SHA-256 hex digest');
export const transferControlSchema = z.object({
  action: z.enum(['status', 'cancel']),
  id: z.string().uuid().describe('Local transfer ID returned by start (not a PVE UPID)'),
}).strict();

// proxmox_upload_to_storage - Upload file to storage
export const uploadToStorageSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  content: z.enum(['iso', 'vztmpl']).describe('Upload content type'),
  filename: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,213}$/).describe('Approved local basename; remote filename is generated'),
  request_id: requestId,
  expected_sha256: expectedSha256,
}).strict();

export type UploadToStorageInput = z.input<typeof uploadToStorageSchema>;

// proxmox_download_url_to_storage - Download file from URL to storage
export const downloadUrlToStorageSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  url: z.string().url().describe('Source URL'),
  content: z.enum(['iso', 'vztmpl', 'backup']).describe('Content type'),
  filename: z.string().optional().describe('Target filename'),
  checksum: z.string().optional().describe('Checksum value'),
  ['checksum-algorithm']: z
    .enum(['md5', 'sha1', 'sha256', 'sha512'])
    .optional()
    .describe('Checksum algorithm'),
  ['verify-certificates']: z.boolean().optional().describe('Verify TLS certificates'),
});

export type DownloadUrlToStorageInput = z.input<typeof downloadUrlToStorageSchema>;

// proxmox_list_storage_content - List storage content
export const listStorageContentSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  content: z.string().optional().describe('Filter by content type'),
  vmid: z.number().int().optional().describe('Filter by VMID'),
});

export type ListStorageContentInput = z.input<typeof listStorageContentSchema>;

// proxmox_delete_storage_content - Delete storage content
export const deleteStorageContentSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  volume: z.string().min(1).describe('Volume identifier (volid)'),
});

export type DeleteStorageContentInput = z.input<typeof deleteStorageContentSchema>;

// PBS paths are opaque bytes, not necessarily UTF-8. Never reconstruct them from display text.
export const restoreEntryId = z.string().min(1).max(8192).refine(
  value => value.length <= 8192 && Buffer.from(value, 'base64').toString('base64') === value,
  'Expected the base64 filepath returned by PBS',
);
const restoreListPath = z.union([z.literal('/'), restoreEntryId]);

// proxmox_list_file_restore - List files in backup for restore
export const listFileRestoreSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  volume: z.string().min(1).max(1024).describe('PBS snapshot volume ID or name'),
  filepath: restoreListPath.optional().describe('Omit for root, or pass a filepath from a previous listing'),
  path: restoreListPath.optional().describe('Deprecated alias for filepath; do not supply both'),
});

export type ListFileRestoreInput = z.input<typeof listFileRestoreSchema>;

// proxmox_download_file_restore - Download file from backup
export const downloadFileRestoreSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  volume: z.string().min(1).max(1024).describe('PBS snapshot volume ID or name'),
  filepath: restoreEntryId.describe('Opaque filepath from the PBS listing'),
  request_id: requestId,
  archive: z.enum(['zip', 'tar.zst']).optional().describe('Directory archive format (default zip)'),
  expected_sha256: expectedSha256,
}).strict();

export type DownloadFileRestoreInput = z.input<typeof downloadFileRestoreSchema>;

export const fileRestoreSchema = z.discriminatedUnion('action', [
  listFileRestoreSchema.extend({ action: z.literal('list') }),
  downloadFileRestoreSchema.extend({ action: z.literal('download') }),
]);

export type FileRestoreInput = z.infer<typeof fileRestoreSchema>;

// proxmox_prune_backups - Prune old backups
export const pruneBackupsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage identifier'),
  ['keep-last']: z.number().int().min(0).optional().describe('Keep last N backups'),
  ['keep-hourly']: z.number().int().min(0).optional().describe('Keep hourly backups'),
  ['keep-daily']: z.number().int().min(0).optional().describe('Keep daily backups'),
  ['keep-weekly']: z.number().int().min(0).optional().describe('Keep weekly backups'),
  ['keep-monthly']: z.number().int().min(0).optional().describe('Keep monthly backups'),
  ['keep-yearly']: z.number().int().min(0).optional().describe('Keep yearly backups'),
  ['prune-backups']: z.string().optional().describe('Prune options string'),
  ['dry-run']: z.boolean().optional().describe('Only simulate pruning'),
  vmid: z.number().int().optional().describe('Filter by VMID'),
  type: z.enum(['qemu', 'lxc']).optional().describe('Filter by guest type'),
});

export type PruneBackupsInput = z.input<typeof pruneBackupsSchema>;

// ── Consolidated: proxmox_storage_config ──────────────────────────────
export const storageConfigToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
  }),
  z.object({
    action: z.literal('get'),
    storage: z.string().min(1).describe('Storage identifier'),
  }),
  z.object({
    action: z.literal('cluster_usage'),
    node: z.string().min(1).optional().describe('Node name; omit to query all nodes'),
  }),
  z.object({
    action: z.literal('create'),
    storage: z.string().min(1).describe('Storage identifier'),
    type: storageTypeEnum.describe('Storage type'),
    content: z.string().optional().describe('Content types (comma-separated)'),
    path: z.string().optional().describe('Filesystem path for directory storage'),
    server: z.string().optional().describe('Remote server hostname or IP'),
    export: z.string().optional().describe('NFS export path'),
    share: z.string().optional().describe('CIFS share name'),
    username: z.string().optional().describe('Username for remote storage'),
    password: z.string().optional().describe('Password for remote storage'),
    domain: z.string().optional().describe('CIFS domain'),
    smbversion: z.string().optional().describe('CIFS SMB version'),
    nodes: z.string().optional().describe('Limit storage to specific nodes'),
    shared: z.boolean().optional().describe('Mark storage as shared'),
    disable: z.boolean().optional().describe('Disable storage'),
    maxfiles: z.number().int().min(0).optional().describe('Max backup files'),
    ['prune-backups']: z.string().optional().describe('Prune options for backups'),
    pool: z.string().optional().describe('Pool name for Ceph/RBD/ZFS'),
    vgname: z.string().optional().describe('LVM volume group name'),
    thinpool: z.string().optional().describe('LVM thin pool name'),
    monhost: z.string().optional().describe('Ceph monitor hosts'),
    fsname: z.string().optional().describe('CephFS filesystem name'),
    keyring: z.string().optional().describe('Ceph keyring path'),
    portal: z.string().optional().describe('iSCSI portal address'),
    target: z.string().optional().describe('iSCSI target'),
    options: z.string().optional().describe('Additional mount options'),
  }),
  z.object({
    action: z.literal('update'),
    storage: z.string().min(1).describe('Storage identifier'),
    content: z.string().optional().describe('Content types (comma-separated)'),
    path: z.string().optional().describe('Filesystem path for directory storage'),
    server: z.string().optional().describe('Remote server hostname or IP'),
    export: z.string().optional().describe('NFS export path'),
    share: z.string().optional().describe('CIFS share name'),
    username: z.string().optional().describe('Username for remote storage'),
    password: z.string().optional().describe('Password for remote storage'),
    domain: z.string().optional().describe('CIFS domain'),
    smbversion: z.string().optional().describe('CIFS SMB version'),
    nodes: z.string().optional().describe('Limit storage to specific nodes'),
    shared: z.boolean().optional().describe('Mark storage as shared'),
    disable: z.boolean().optional().describe('Disable storage'),
    maxfiles: z.number().int().min(0).optional().describe('Max backup files'),
    ['prune-backups']: z.string().optional().describe('Prune options for backups'),
    pool: z.string().optional().describe('Pool name for Ceph/RBD/ZFS'),
    vgname: z.string().optional().describe('LVM volume group name'),
    thinpool: z.string().optional().describe('LVM thin pool name'),
    monhost: z.string().optional().describe('Ceph monitor hosts'),
    fsname: z.string().optional().describe('CephFS filesystem name'),
    keyring: z.string().optional().describe('Ceph keyring path'),
    portal: z.string().optional().describe('iSCSI portal address'),
    target: z.string().optional().describe('iSCSI target'),
    options: z.string().optional().describe('Additional mount options'),
    delete: z.string().optional().describe('List of settings to delete'),
    digest: z.string().max(64).optional().describe('Config digest'),
  }),
  z.object({
    action: z.literal('delete'),
    storage: z.string().min(1).describe('Storage identifier'),
  }),
]);

export type StorageConfigToolInput = z.input<typeof storageConfigToolSchema>;

// ── Consolidated: proxmox_storage_content ──────────────────────────────
export const storageContentToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage identifier'),
    content: z.string().optional().describe('Filter by content type'),
    vmid: z.number().int().optional().describe('Filter by VMID'),
  }),
  z.object({
    action: z.literal('list_templates'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage identifier'),
  }),
  uploadToStorageSchema.extend({ action: z.literal('upload') }),
  z.object({
    action: z.literal('download_url'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage identifier'),
    url: z.string().url().describe('Source URL'),
    content: z.enum(['iso', 'vztmpl', 'backup']).describe('Content type'),
    filename: z.string().optional().describe('Target filename'),
    checksum: z.string().optional().describe('Checksum value'),
    ['checksum-algorithm']: z
      .enum(['md5', 'sha1', 'sha256', 'sha512'])
      .optional()
      .describe('Checksum algorithm'),
    ['verify-certificates']: z.boolean().optional().describe('Verify TLS certificates'),
  }),
  z.object({
    action: z.literal('delete'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage identifier'),
    volume: z.string().min(1).describe('Volume identifier (volid)'),
  }),
  z.object({
    action: z.literal('prune'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage identifier'),
    ['keep-last']: z.number().int().min(0).optional().describe('Keep last N backups'),
    ['keep-hourly']: z.number().int().min(0).optional().describe('Keep hourly backups'),
    ['keep-daily']: z.number().int().min(0).optional().describe('Keep daily backups'),
    ['keep-weekly']: z.number().int().min(0).optional().describe('Keep weekly backups'),
    ['keep-monthly']: z.number().int().min(0).optional().describe('Keep monthly backups'),
    ['keep-yearly']: z.number().int().min(0).optional().describe('Keep yearly backups'),
    ['prune-backups']: z.string().optional().describe('Prune options string'),
    ['dry-run']: z.boolean().optional().describe('Only simulate pruning'),
    vmid: z.number().int().optional().describe('Filter by VMID'),
    type: z.enum(['qemu', 'lxc']).optional().describe('Filter by guest type'),
  }),
]);

export type StorageContentToolInput = z.input<typeof storageContentToolSchema>;
