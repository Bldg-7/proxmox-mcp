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

// proxmox_list_cluster_firewall_aliases - List cluster firewall aliases
export const listClusterFirewallAliasesSchema = z.object({});

export type ListClusterFirewallAliasesInput = z.infer<typeof listClusterFirewallAliasesSchema>;

// proxmox_get_cluster_firewall_alias - Get cluster firewall alias
export const getClusterFirewallAliasSchema = z.object({
  name: z.string().min(1).describe('Firewall alias name'),
});

export type GetClusterFirewallAliasInput = z.infer<typeof getClusterFirewallAliasSchema>;

// proxmox_create_cluster_firewall_alias - Create cluster firewall alias
export const createClusterFirewallAliasSchema = z.object({
  name: z.string().min(1).describe('Firewall alias name'),
  cidr: z.string().min(1).describe('IP address or CIDR network'),
  comment: z.string().optional().describe('Description'),
});

export type CreateClusterFirewallAliasInput = z.infer<typeof createClusterFirewallAliasSchema>;

// proxmox_update_cluster_firewall_alias - Update cluster firewall alias
export const updateClusterFirewallAliasSchema = z.object({
  name: z.string().min(1).describe('Firewall alias name'),
  cidr: z.string().min(1).describe('IP address or CIDR network'),
  comment: z.string().optional().describe('Description'),
  rename: z.string().optional().describe('New alias name'),
});

export type UpdateClusterFirewallAliasInput = z.infer<typeof updateClusterFirewallAliasSchema>;

// proxmox_delete_cluster_firewall_alias - Delete cluster firewall alias
export const deleteClusterFirewallAliasSchema = z.object({
  name: z.string().min(1).describe('Firewall alias name'),
});

export type DeleteClusterFirewallAliasInput = z.infer<typeof deleteClusterFirewallAliasSchema>;

// proxmox_list_cluster_firewall_ipsets - List cluster firewall IP sets
export const listClusterFirewallIpsetsSchema = z.object({});

export type ListClusterFirewallIpsetsInput = z.infer<typeof listClusterFirewallIpsetsSchema>;

// proxmox_create_cluster_firewall_ipset - Create cluster firewall IP set
export const createClusterFirewallIpsetSchema = z.object({
  name: z.string().min(1).describe('IP set name'),
  comment: z.string().optional().describe('Description'),
});

export type CreateClusterFirewallIpsetInput = z.infer<typeof createClusterFirewallIpsetSchema>;

// proxmox_delete_cluster_firewall_ipset - Delete cluster firewall IP set
export const deleteClusterFirewallIpsetSchema = z.object({
  name: z.string().min(1).describe('IP set name'),
});

export type DeleteClusterFirewallIpsetInput = z.infer<typeof deleteClusterFirewallIpsetSchema>;

// proxmox_list_cluster_firewall_ipset_entries - List IP set entries
export const listClusterFirewallIpsetEntriesSchema = z.object({
  name: z.string().min(1).describe('IP set name'),
});

export type ListClusterFirewallIpsetEntriesInput = z.infer<typeof listClusterFirewallIpsetEntriesSchema>;

// proxmox_add_cluster_firewall_ipset_entry - Add IP set entry
export const addClusterFirewallIpsetEntrySchema = z.object({
  name: z.string().min(1).describe('IP set name'),
  cidr: z.string().min(1).describe('CIDR network address'),
  comment: z.string().optional().describe('Description'),
  nomatch: z.boolean().optional().describe('Invert match (exclude this entry)'),
});

export type AddClusterFirewallIpsetEntryInput = z.infer<typeof addClusterFirewallIpsetEntrySchema>;

// proxmox_update_cluster_firewall_ipset_entry - Update IP set entry
export const updateClusterFirewallIpsetEntrySchema = z.object({
  name: z.string().min(1).describe('IP set name'),
  cidr: z.string().min(1).describe('CIDR network address'),
  comment: z.string().optional().describe('Description'),
  nomatch: z.boolean().optional().describe('Invert match (exclude this entry)'),
});

export type UpdateClusterFirewallIpsetEntryInput = z.infer<typeof updateClusterFirewallIpsetEntrySchema>;

// proxmox_delete_cluster_firewall_ipset_entry - Delete IP set entry
export const deleteClusterFirewallIpsetEntrySchema = z.object({
  name: z.string().min(1).describe('IP set name'),
  cidr: z.string().min(1).describe('CIDR network address'),
});

export type DeleteClusterFirewallIpsetEntryInput = z.infer<typeof deleteClusterFirewallIpsetEntrySchema>;

// proxmox_get_cluster_config - Get cluster config
export const getClusterConfigSchema = z.object({});

export type GetClusterConfigInput = z.infer<typeof getClusterConfigSchema>;

// proxmox_list_cluster_config_nodes - List cluster config nodes
export const listClusterConfigNodesSchema = z.object({});

export type ListClusterConfigNodesInput = z.infer<typeof listClusterConfigNodesSchema>;

// proxmox_get_cluster_config_node - Get cluster config node
export const getClusterConfigNodeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetClusterConfigNodeInput = z.infer<typeof getClusterConfigNodeSchema>;

// proxmox_join_cluster - Join cluster
export const joinClusterSchema = z.object({
  hostname: z.string().min(1).describe('Hostname of cluster node to join'),
  password: z.string().min(1).describe('Cluster password'),
  fingerprint: z.string().optional().describe('SSL certificate fingerprint'),
  force: z.boolean().optional().describe('Force join even if node exists'),
});

export type JoinClusterInput = z.infer<typeof joinClusterSchema>;

// proxmox_get_cluster_totem - Get cluster totem config
export const getClusterTotemSchema = z.object({});

export type GetClusterTotemInput = z.infer<typeof getClusterTotemSchema>;

// ── Consolidated: proxmox_ha_resource ─────────────────────────────────────
export const haResourceToolSchema = z.discriminatedUnion('action', [
  getHaResourcesSchema.extend({
    action: z.literal('list'),
  }),
  getHaResourceSchema.extend({
    action: z.literal('get'),
  }),
  getHaStatusSchema.extend({
    action: z.literal('status'),
  }),
  createHaResourceSchema.extend({
    action: z.literal('create'),
  }),
  updateHaResourceSchema.extend({
    action: z.literal('update'),
  }),
  deleteHaResourceSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type HaResourceToolInput = z.infer<typeof haResourceToolSchema>;

// ── Consolidated: proxmox_ha_group ────────────────────────────────────────
export const haGroupToolSchema = z.discriminatedUnion('action', [
  getHaGroupsSchema.extend({
    action: z.literal('list'),
  }),
  getHaGroupSchema.extend({
    action: z.literal('get'),
  }),
  createHaGroupSchema.extend({
    action: z.literal('create'),
  }),
  updateHaGroupSchema.extend({
    action: z.literal('update'),
  }),
  deleteHaGroupSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type HaGroupToolInput = z.infer<typeof haGroupToolSchema>;

// ── Consolidated: proxmox_cluster_firewall_rule ───────────────────────────
export const clusterFirewallRuleToolSchema = z.discriminatedUnion('action', [
  listClusterFirewallRulesSchema.extend({
    action: z.literal('list'),
  }),
  getClusterFirewallRuleSchema.extend({
    action: z.literal('get'),
  }),
  z.object({
    action: z.literal('create'),
    rule_action: z.string().min(1).describe('Rule action (ACCEPT, REJECT, DROP)'),
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
  }),
  z.object({
    action: z.literal('update'),
    pos: z.number().int().min(0).describe('Rule position'),
    rule_action: z.string().optional(),
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
  }),
  deleteClusterFirewallRuleSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterFirewallRuleToolInput = z.infer<typeof clusterFirewallRuleToolSchema>;

// ── Consolidated: proxmox_cluster_firewall_group ──────────────────────────
export const clusterFirewallGroupToolSchema = z.discriminatedUnion('action', [
  listClusterFirewallGroupsSchema.extend({
    action: z.literal('list'),
  }),
  getClusterFirewallGroupSchema.extend({
    action: z.literal('get'),
  }),
  createClusterFirewallGroupSchema.extend({
    action: z.literal('create'),
  }),
  updateClusterFirewallGroupSchema.extend({
    action: z.literal('update'),
  }),
  deleteClusterFirewallGroupSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterFirewallGroupToolInput = z.infer<typeof clusterFirewallGroupToolSchema>;

// ── Consolidated: proxmox_cluster_firewall ────────────────────────────────
export const clusterFirewallToolSchema = z.discriminatedUnion('action', [
  getClusterFirewallOptionsSchema.extend({
    action: z.literal('get_options'),
  }),
  updateClusterFirewallOptionsSchema.extend({
    action: z.literal('update_options'),
  }),
  listClusterFirewallMacrosSchema.extend({
    action: z.literal('list_macros'),
  }),
  listClusterFirewallRefsSchema.extend({
    action: z.literal('list_refs'),
  }),
]);

export type ClusterFirewallToolInput = z.infer<typeof clusterFirewallToolSchema>;

// ── Consolidated: proxmox_cluster_firewall_alias ──────────────────────────
export const clusterFirewallAliasToolSchema = z.discriminatedUnion('action', [
  listClusterFirewallAliasesSchema.extend({
    action: z.literal('list'),
  }),
  getClusterFirewallAliasSchema.extend({
    action: z.literal('get'),
  }),
  createClusterFirewallAliasSchema.extend({
    action: z.literal('create'),
  }),
  updateClusterFirewallAliasSchema.extend({
    action: z.literal('update'),
  }),
  deleteClusterFirewallAliasSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterFirewallAliasToolInput = z.infer<typeof clusterFirewallAliasToolSchema>;

// ── Consolidated: proxmox_cluster_firewall_ipset ──────────────────────────
export const clusterFirewallIpsetToolSchema = z.discriminatedUnion('action', [
  listClusterFirewallIpsetsSchema.extend({
    action: z.literal('list'),
  }),
  createClusterFirewallIpsetSchema.extend({
    action: z.literal('create'),
  }),
  deleteClusterFirewallIpsetSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterFirewallIpsetToolInput = z.infer<typeof clusterFirewallIpsetToolSchema>;

// ── Consolidated: proxmox_cluster_firewall_ipset_entry ────────────────────
export const clusterFirewallIpsetEntryToolSchema = z.discriminatedUnion('action', [
  listClusterFirewallIpsetEntriesSchema.extend({
    action: z.literal('list'),
  }),
  addClusterFirewallIpsetEntrySchema.extend({
    action: z.literal('create'),
  }),
  updateClusterFirewallIpsetEntrySchema.extend({
    action: z.literal('update'),
  }),
  deleteClusterFirewallIpsetEntrySchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterFirewallIpsetEntryToolInput = z.infer<typeof clusterFirewallIpsetEntryToolSchema>;

// ── Consolidated: proxmox_cluster_backup_job ──────────────────────────────
export const clusterBackupJobToolSchema = z.discriminatedUnion('action', [
  listClusterBackupJobsSchema.extend({
    action: z.literal('list'),
  }),
  getClusterBackupJobSchema.extend({
    action: z.literal('get'),
  }),
  createClusterBackupJobSchema.extend({
    action: z.literal('create'),
  }),
  updateClusterBackupJobSchema.extend({
    action: z.literal('update'),
  }),
  deleteClusterBackupJobSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterBackupJobToolInput = z.infer<typeof clusterBackupJobToolSchema>;

// ── Consolidated: proxmox_cluster_replication_job ─────────────────────────
export const clusterReplicationJobToolSchema = z.discriminatedUnion('action', [
  listClusterReplicationJobsSchema.extend({
    action: z.literal('list'),
  }),
  getClusterReplicationJobSchema.extend({
    action: z.literal('get'),
  }),
  createClusterReplicationJobSchema.extend({
    action: z.literal('create'),
  }),
  updateClusterReplicationJobSchema.extend({
    action: z.literal('update'),
  }),
  deleteClusterReplicationJobSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type ClusterReplicationJobToolInput = z.infer<typeof clusterReplicationJobToolSchema>;

// ── Consolidated: proxmox_cluster_config ──────────────────────────────────
export const clusterConfigToolSchema = z.discriminatedUnion('action', [
  getClusterConfigSchema.extend({
    action: z.literal('get'),
  }),
  listClusterConfigNodesSchema.extend({
    action: z.literal('list_nodes'),
  }),
  getClusterConfigNodeSchema.extend({
    action: z.literal('get_node'),
  }),
  joinClusterSchema.extend({
    action: z.literal('join'),
  }),
  getClusterTotemSchema.extend({
    action: z.literal('totem'),
  }),
]);

export type ClusterConfigToolInput = z.infer<typeof clusterConfigToolSchema>;
