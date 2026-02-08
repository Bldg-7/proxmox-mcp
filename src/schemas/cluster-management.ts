import { z } from 'zod';

// proxmox_get_ha_resources - List HA resources
export const getHaResourcesSchema = z.object({
  type: z.enum(['ct', 'vm']).optional().describe('Filter by resource type'),
});

export type GetHaResourcesInput = z.infer<typeof getHaResourcesSchema>;

// proxmox_get_ha_resource - Get HA resource by ID
export const getHaResourceSchema = z.object({
  sid: z.string().min(1).describe('HA resource ID (e.g., vm:100, ct:100)'),
});

export type GetHaResourceInput = z.infer<typeof getHaResourceSchema>;

// proxmox_create_ha_resource - Create HA resource
export const createHaResourceSchema = z.object({
  sid: z.string().min(1).describe('HA resource ID (e.g., vm:100, ct:100)'),
  type: z.enum(['ct', 'vm']).optional().describe('Resource type'),
  comment: z.string().max(4096).optional().describe('Description'),
  failback: z.boolean().optional().describe('Auto-migrate to highest priority node'),
  group: z.string().optional().describe('HA group identifier'),
  max_relocate: z.number().int().min(0).optional().describe('Max relocate tries'),
  max_restart: z.number().int().min(0).optional().describe('Max restart tries'),
  state: z
    .enum(['started', 'stopped', 'enabled', 'disabled', 'ignored'])
    .optional()
    .describe('Requested resource state'),
});

export type CreateHaResourceInput = z.infer<typeof createHaResourceSchema>;

// proxmox_update_ha_resource - Update HA resource
export const updateHaResourceSchema = z.object({
  sid: z.string().min(1).describe('HA resource ID'),
  comment: z.string().max(4096).optional().describe('Description'),
  delete: z.string().max(4096).optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Prevent concurrent modifications'),
  failback: z.boolean().optional().describe('Auto-migrate to highest priority node'),
  group: z.string().optional().describe('HA group identifier'),
  max_relocate: z.number().int().min(0).optional().describe('Max relocate tries'),
  max_restart: z.number().int().min(0).optional().describe('Max restart tries'),
  state: z
    .enum(['started', 'stopped', 'enabled', 'disabled', 'ignored'])
    .optional()
    .describe('Requested resource state'),
});

export type UpdateHaResourceInput = z.infer<typeof updateHaResourceSchema>;

// proxmox_delete_ha_resource - Delete HA resource
export const deleteHaResourceSchema = z.object({
  sid: z.string().min(1).describe('HA resource ID'),
});

export type DeleteHaResourceInput = z.infer<typeof deleteHaResourceSchema>;

// proxmox_get_ha_groups - List HA groups
export const getHaGroupsSchema = z.object({});

export type GetHaGroupsInput = z.infer<typeof getHaGroupsSchema>;

// proxmox_get_ha_group - Get HA group by ID
export const getHaGroupSchema = z.object({
  group: z.string().min(1).describe('HA group identifier'),
});

export type GetHaGroupInput = z.infer<typeof getHaGroupSchema>;

// proxmox_create_ha_group - Create HA group
export const createHaGroupSchema = z.object({
  group: z.string().min(1).describe('HA group identifier'),
  nodes: z.string().min(1).describe('Nodes list with optional priorities'),
  comment: z.string().max(4096).optional().describe('Description'),
  nofailback: z.boolean().optional().describe('Prevent migration to higher priority nodes'),
  restricted: z.boolean().optional().describe('Restrict to defined nodes'),
  type: z.enum(['group']).optional().describe('Group type'),
});

export type CreateHaGroupInput = z.infer<typeof createHaGroupSchema>;

// proxmox_update_ha_group - Update HA group
export const updateHaGroupSchema = z.object({
  group: z.string().min(1).describe('HA group identifier'),
  comment: z.string().max(4096).optional().describe('Description'),
  delete: z.string().max(4096).optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Prevent concurrent modifications'),
  nodes: z.string().optional().describe('Nodes list with optional priorities'),
  nofailback: z.boolean().optional().describe('Prevent failback'),
  restricted: z.boolean().optional().describe('Restrict to defined nodes'),
});

export type UpdateHaGroupInput = z.infer<typeof updateHaGroupSchema>;

// proxmox_delete_ha_group - Delete HA group
export const deleteHaGroupSchema = z.object({
  group: z.string().min(1).describe('HA group identifier'),
});

export type DeleteHaGroupInput = z.infer<typeof deleteHaGroupSchema>;

// proxmox_get_ha_status - Get HA status index
export const getHaStatusSchema = z.object({});

export type GetHaStatusInput = z.infer<typeof getHaStatusSchema>;

// proxmox_list_cluster_firewall_rules - List cluster firewall rules
export const listClusterFirewallRulesSchema = z.object({});

export type ListClusterFirewallRulesInput = z.infer<typeof listClusterFirewallRulesSchema>;

// proxmox_get_cluster_firewall_rule - Get firewall rule by position
export const getClusterFirewallRuleSchema = z.object({
  pos: z.number().int().min(0).describe('Rule position'),
});

export type GetClusterFirewallRuleInput = z.infer<typeof getClusterFirewallRuleSchema>;

// proxmox_create_cluster_firewall_rule - Create firewall rule
export const createClusterFirewallRuleSchema = z.object({
  action: z.string().min(1).describe('Rule action (ACCEPT, REJECT, DROP)'),
  type: z.enum(['in', 'out', 'group']).describe('Rule type'),
  comment: z.string().optional(),
  dest: z.string().optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  pos: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional(),
});

export type CreateClusterFirewallRuleInput = z.infer<typeof createClusterFirewallRuleSchema>;

// proxmox_update_cluster_firewall_rule - Update firewall rule
export const updateClusterFirewallRuleSchema = z.object({
  pos: z.number().int().min(0).describe('Rule position'),
  action: z.string().optional(),
  comment: z.string().optional(),
  delete: z.string().optional(),
  dest: z.string().optional(),
  digest: z.string().max(64).optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  moveto: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional(),
  type: z.enum(['in', 'out', 'group']).optional(),
});

export type UpdateClusterFirewallRuleInput = z.infer<typeof updateClusterFirewallRuleSchema>;

// proxmox_delete_cluster_firewall_rule - Delete firewall rule
export const deleteClusterFirewallRuleSchema = z.object({
  pos: z.number().int().min(0).describe('Rule position'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type DeleteClusterFirewallRuleInput = z.infer<typeof deleteClusterFirewallRuleSchema>;

// proxmox_list_cluster_firewall_groups - List firewall groups
export const listClusterFirewallGroupsSchema = z.object({});

export type ListClusterFirewallGroupsInput = z.infer<typeof listClusterFirewallGroupsSchema>;

// proxmox_get_cluster_firewall_group - Get firewall group
export const getClusterFirewallGroupSchema = z.object({
  group: z.string().min(1).describe('Firewall group name'),
});

export type GetClusterFirewallGroupInput = z.infer<typeof getClusterFirewallGroupSchema>;

// proxmox_create_cluster_firewall_group - Create firewall group
export const createClusterFirewallGroupSchema = z.object({
  group: z.string().min(1).describe('Firewall group name'),
  comment: z.string().optional(),
  rename: z.string().optional(),
});

export type CreateClusterFirewallGroupInput = z.infer<typeof createClusterFirewallGroupSchema>;

// proxmox_update_cluster_firewall_group - Update firewall group
export const updateClusterFirewallGroupSchema = z.object({
  group: z.string().min(1).describe('Firewall group name'),
  comment: z.string().optional(),
  rename: z.string().optional(),
  delete: z.string().optional(),
  digest: z.string().max(64).optional(),
});

export type UpdateClusterFirewallGroupInput = z.infer<typeof updateClusterFirewallGroupSchema>;

// proxmox_delete_cluster_firewall_group - Delete firewall group
export const deleteClusterFirewallGroupSchema = z.object({
  group: z.string().min(1).describe('Firewall group name'),
});

export type DeleteClusterFirewallGroupInput = z.infer<typeof deleteClusterFirewallGroupSchema>;

// proxmox_list_cluster_backup_jobs - List cluster backup jobs
export const listClusterBackupJobsSchema = z.object({});

export type ListClusterBackupJobsInput = z.infer<typeof listClusterBackupJobsSchema>;

// proxmox_get_cluster_backup_job - Get backup job
export const getClusterBackupJobSchema = z.object({
  id: z.string().min(1).describe('Backup job ID'),
});

export type GetClusterBackupJobInput = z.infer<typeof getClusterBackupJobSchema>;

// proxmox_create_cluster_backup_job - Create backup job
export const createClusterBackupJobSchema = z.object({
  starttime: z.string().min(1).describe('Job start time (HH:MM)'),
  dow: z.string().min(1).describe('Day of week selection'),
  storage: z.string().min(1).describe('Storage identifier'),
  all: z.boolean().optional(),
  bwlimit: z.number().int().optional(),
  comment: z.string().optional(),
  compress: z.enum(['0', '1', 'gzip', 'lzo', 'zstd']).optional(),
  dumpdir: z.string().optional(),
  enabled: z.boolean().optional(),
  exclude: z.string().optional(),
  ['exclude-path']: z.string().optional(),
  id: z.string().optional(),
  ionice: z.number().int().optional(),
  lockwait: z.number().int().optional(),
  mailnotification: z.enum(['always', 'failure']).optional(),
  mailto: z.string().optional(),
  maxfiles: z.number().int().optional(),
  mode: z.enum(['snapshot', 'suspend', 'stop']).optional(),
  node: z.string().optional(),
  ['notes-template']: z.string().optional(),
  performance: z.string().optional(),
  pigz: z.number().int().optional(),
  pool: z.string().optional(),
  protected: z.boolean().optional(),
  ['prune-backups']: z.string().optional(),
  quiet: z.boolean().optional(),
  remove: z.boolean().optional(),
  ['repeat-missed']: z.boolean().optional(),
  script: z.string().optional(),
  stdexcludes: z.boolean().optional(),
  stop: z.boolean().optional(),
  stopwait: z.number().int().optional(),
  tmpdir: z.string().optional(),
  vmid: z.string().optional(),
  zstd: z.number().int().optional(),
});

export type CreateClusterBackupJobInput = z.infer<typeof createClusterBackupJobSchema>;

// proxmox_update_cluster_backup_job - Update backup job
export const updateClusterBackupJobSchema = z.object({
  id: z.string().min(1).describe('Backup job ID'),
  starttime: z.string().optional(),
  dow: z.string().optional(),
  storage: z.string().optional(),
  all: z.boolean().optional(),
  bwlimit: z.number().int().optional(),
  comment: z.string().optional(),
  compress: z.enum(['0', '1', 'gzip', 'lzo', 'zstd']).optional(),
  dumpdir: z.string().optional(),
  enabled: z.boolean().optional(),
  exclude: z.string().optional(),
  ['exclude-path']: z.string().optional(),
  delete: z.string().optional(),
  digest: z.string().max(64).optional(),
  ionice: z.number().int().optional(),
  lockwait: z.number().int().optional(),
  mailnotification: z.enum(['always', 'failure']).optional(),
  mailto: z.string().optional(),
  maxfiles: z.number().int().optional(),
  mode: z.enum(['snapshot', 'suspend', 'stop']).optional(),
  node: z.string().optional(),
  ['notes-template']: z.string().optional(),
  performance: z.string().optional(),
  pigz: z.number().int().optional(),
  pool: z.string().optional(),
  protected: z.boolean().optional(),
  ['prune-backups']: z.string().optional(),
  quiet: z.boolean().optional(),
  remove: z.boolean().optional(),
  ['repeat-missed']: z.boolean().optional(),
  script: z.string().optional(),
  stdexcludes: z.boolean().optional(),
  stop: z.boolean().optional(),
  stopwait: z.number().int().optional(),
  tmpdir: z.string().optional(),
  vmid: z.string().optional(),
  zstd: z.number().int().optional(),
});

export type UpdateClusterBackupJobInput = z.infer<typeof updateClusterBackupJobSchema>;

// proxmox_delete_cluster_backup_job - Delete backup job
export const deleteClusterBackupJobSchema = z.object({
  id: z.string().min(1).describe('Backup job ID'),
});

export type DeleteClusterBackupJobInput = z.infer<typeof deleteClusterBackupJobSchema>;

// proxmox_list_cluster_replication_jobs - List replication jobs
export const listClusterReplicationJobsSchema = z.object({});

export type ListClusterReplicationJobsInput = z.infer<typeof listClusterReplicationJobsSchema>;

// proxmox_get_cluster_replication_job - Get replication job
export const getClusterReplicationJobSchema = z.object({
  id: z.string().min(1).describe('Replication job ID'),
});

export type GetClusterReplicationJobInput = z.infer<typeof getClusterReplicationJobSchema>;

// proxmox_create_cluster_replication_job - Create replication job
export const createClusterReplicationJobSchema = z.object({
  id: z.string().min(1).describe('Replication job ID (<guest>-<jobnum>)'),
  target: z.string().min(1).describe('Target node name'),
  type: z.enum(['local']).describe('Replication type'),
  comment: z.string().optional(),
  disable: z.boolean().optional(),
  rate: z.number().optional(),
  remove_job: z.enum(['local', 'full']).optional(),
  schedule: z.string().optional(),
  source: z.string().optional(),
});

export type CreateClusterReplicationJobInput = z.infer<typeof createClusterReplicationJobSchema>;

// proxmox_update_cluster_replication_job - Update replication job
export const updateClusterReplicationJobSchema = z.object({
  id: z.string().min(1).describe('Replication job ID'),
  comment: z.string().optional(),
  delete: z.string().optional(),
  digest: z.string().max(64).optional(),
  disable: z.boolean().optional(),
  rate: z.number().optional(),
  remove_job: z.enum(['local', 'full']).optional(),
  schedule: z.string().optional(),
  source: z.string().optional(),
});

export type UpdateClusterReplicationJobInput = z.infer<typeof updateClusterReplicationJobSchema>;

// proxmox_delete_cluster_replication_job - Delete replication job
export const deleteClusterReplicationJobSchema = z.object({
  id: z.string().min(1).describe('Replication job ID'),
  force: z.boolean().optional(),
  keep: z.boolean().optional(),
});

export type DeleteClusterReplicationJobInput = z.infer<typeof deleteClusterReplicationJobSchema>;

// proxmox_get_cluster_options - Get cluster options
export const getClusterOptionsSchema = z.object({});

export type GetClusterOptionsInput = z.infer<typeof getClusterOptionsSchema>;

// proxmox_update_cluster_options - Update cluster options
export const updateClusterOptionsSchema = z.record(
  z.union([z.string(), z.number(), z.boolean()])
);

export type UpdateClusterOptionsInput = z.infer<typeof updateClusterOptionsSchema>;

// proxmox_get_cluster_firewall_options - Get cluster firewall options
export const getClusterFirewallOptionsSchema = z.object({});

export type GetClusterFirewallOptionsInput = z.infer<typeof getClusterFirewallOptionsSchema>;

// proxmox_update_cluster_firewall_options - Update cluster firewall options
export const updateClusterFirewallOptionsSchema = z.object({
  enable: z.number().optional().describe('Enable firewall'),
  policy_in: z.string().optional().describe('Inbound policy (ACCEPT, REJECT, DROP)'),
  policy_out: z.string().optional().describe('Outbound policy (ACCEPT, REJECT, DROP)'),
  log_ratelimit: z.string().optional().describe('Log rate limit'),
});

export type UpdateClusterFirewallOptionsInput = z.infer<typeof updateClusterFirewallOptionsSchema>;

// proxmox_list_cluster_firewall_macros - List cluster firewall macros
export const listClusterFirewallMacrosSchema = z.object({});

export type ListClusterFirewallMacrosInput = z.infer<typeof listClusterFirewallMacrosSchema>;

// proxmox_list_cluster_firewall_refs - List cluster firewall refs
export const listClusterFirewallRefsSchema = z.object({
  type: z.enum(['alias', 'ipset']).optional().describe('Filter by reference type'),
});

export type ListClusterFirewallRefsInput = z.infer<typeof listClusterFirewallRefsSchema>;
