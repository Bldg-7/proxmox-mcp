import { z } from 'zod';

// proxmox_get_node_time - Get node time and timezone
export const getNodeTimeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeTimeInput = z.infer<typeof getNodeTimeSchema>;

// proxmox_update_node_time - Update node time and/or timezone
export const updateNodeTimeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  time: z
    .number()
    .int()
    .optional()
    .describe('Unix epoch time in seconds'),
  timezone: z.string().optional().describe('Timezone (e.g., UTC, America/New_York)'),
});

export type UpdateNodeTimeInput = z.infer<typeof updateNodeTimeSchema>;

// proxmox_update_node_dns - Update DNS configuration
export const updateNodeDnsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  search: z.string().optional().describe('Search domain'),
  dns1: z.string().optional().describe('Primary DNS server'),
  dns2: z.string().optional().describe('Secondary DNS server'),
  dns3: z.string().optional().describe('Tertiary DNS server'),
  delete: z.string().optional().describe('Comma-separated list of settings to delete'),
});

export type UpdateNodeDnsInput = z.infer<typeof updateNodeDnsSchema>;

// proxmox_get_node_hosts - Get /etc/hosts entries for a node
export const getNodeHostsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeHostsInput = z.infer<typeof getNodeHostsSchema>;

// proxmox_update_node_hosts - Update /etc/hosts entries for a node
export const updateNodeHostsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  ip: z.string().min(1).describe('IP address'),
  name: z.string().min(1).describe('Hostname or alias'),
  comment: z.string().optional().describe('Optional comment'),
  digest: z.string().optional().describe('Configuration digest'),
});

export type UpdateNodeHostsInput = z.infer<typeof updateNodeHostsSchema>;

// proxmox_get_node_subscription - Get node subscription details
export const getNodeSubscriptionSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeSubscriptionInput = z.infer<typeof getNodeSubscriptionSchema>;

// proxmox_set_node_subscription - Set node subscription key
export const setNodeSubscriptionSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  key: z.string().min(1).describe('Subscription key'),
});

export type SetNodeSubscriptionInput = z.infer<typeof setNodeSubscriptionSchema>;

// proxmox_delete_node_subscription - Delete node subscription key
export const deleteNodeSubscriptionSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type DeleteNodeSubscriptionInput = z.infer<typeof deleteNodeSubscriptionSchema>;

// proxmox_apt_update - Refresh APT package lists
export const aptUpdateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type AptUpdateInput = z.infer<typeof aptUpdateSchema>;

// proxmox_apt_upgrade - Upgrade APT packages
export const aptUpgradeSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type AptUpgradeInput = z.infer<typeof aptUpgradeSchema>;

// proxmox_apt_versions - List package versions
export const aptVersionsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  package: z.string().optional().describe('Filter by package name'),
});

export type AptVersionsInput = z.infer<typeof aptVersionsSchema>;

// proxmox_start_all - Start all guests on a node
export const startAllSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type StartAllInput = z.infer<typeof startAllSchema>;

// proxmox_stop_all - Stop all guests on a node
export const stopAllSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type StopAllInput = z.infer<typeof stopAllSchema>;

// proxmox_migrate_all - Migrate all guests from a node
export const migrateAllSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  target: z.string().min(1).describe('Target node name'),
  maxworkers: z.number().int().optional().describe('Maximum parallel migrations'),
  'with-local-disks': z
    .boolean()
    .optional()
    .describe('Include local disks in migration'),
});

export type MigrateAllInput = z.infer<typeof migrateAllSchema>;

// proxmox_node_shutdown - Shutdown a node
export const nodeShutdownSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type NodeShutdownInput = z.infer<typeof nodeShutdownSchema>;

// proxmox_node_reboot - Reboot a node
export const nodeRebootSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type NodeRebootInput = z.infer<typeof nodeRebootSchema>;

// proxmox_node_wakeonlan - Wake a node via WOL
export const nodeWakeonlanSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type NodeWakeonlanInput = z.infer<typeof nodeWakeonlanSchema>;

// proxmox_get_node_replication_status - Get node replication job status
export const getNodeReplicationStatusSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  id: z.string().min(1).describe('Replication job ID'),
});

export type GetNodeReplicationStatusInput = z.infer<typeof getNodeReplicationStatusSchema>;

// proxmox_get_node_replication_log - Get node replication job log
export const getNodeReplicationLogSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  id: z.string().min(1).describe('Replication job ID'),
});

export type GetNodeReplicationLogInput = z.infer<typeof getNodeReplicationLogSchema>;

// proxmox_schedule_node_replication - Schedule immediate node replication
export const scheduleNodeReplicationSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  id: z.string().min(1).describe('Replication job ID'),
});

export type ScheduleNodeReplicationInput = z.infer<typeof scheduleNodeReplicationSchema>;

// ── Consolidated: proxmox_node_config ────────────────────────────────────
export const nodeConfigToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('get_time'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('set_time'),
    node: z.string().min(1).describe('Node name'),
    time: z.number().int().optional().describe('Unix epoch time in seconds'),
    timezone: z.string().optional().describe('Timezone (e.g., UTC, America/New_York)'),
  }),
  z.object({
    action: z.literal('set_dns'),
    node: z.string().min(1).describe('Node name'),
    search: z.string().optional().describe('Search domain'),
    dns1: z.string().optional().describe('Primary DNS server'),
    dns2: z.string().optional().describe('Secondary DNS server'),
    dns3: z.string().optional().describe('Tertiary DNS server'),
    delete: z.string().optional().describe('Comma-separated list of settings to delete'),
  }),
  z.object({
    action: z.literal('get_hosts'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('set_hosts'),
    node: z.string().min(1).describe('Node name'),
    ip: z.string().min(1).describe('IP address'),
    name: z.string().min(1).describe('Hostname or alias'),
    comment: z.string().optional().describe('Optional comment'),
    digest: z.string().optional().describe('Configuration digest'),
  }),
]);

export type NodeConfigToolInput = z.infer<typeof nodeConfigToolSchema>;

// ── Consolidated: proxmox_node_subscription ──────────────────────────────
export const nodeSubscriptionToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('get'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('set'),
    node: z.string().min(1).describe('Node name'),
    key: z.string().min(1).describe('Subscription key'),
  }),
  z.object({
    action: z.literal('delete'),
    node: z.string().min(1).describe('Node name'),
  }),
]);

export type NodeSubscriptionToolInput = z.infer<typeof nodeSubscriptionToolSchema>;

// ── Consolidated: proxmox_apt ────────────────────────────────────────────
export const aptToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('update'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('upgrade'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('versions'),
    node: z.string().min(1).describe('Node name'),
    package: z.string().optional().describe('Filter by package name'),
  }),
]);

export type AptToolInput = z.infer<typeof aptToolSchema>;

// ── Consolidated: proxmox_node_bulk ──────────────────────────────────────
export const nodeBulkToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('start_all'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('stop_all'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('migrate_all'),
    node: z.string().min(1).describe('Node name'),
    target: z.string().min(1).describe('Target node name'),
    maxworkers: z.number().int().optional().describe('Maximum parallel migrations'),
    'with-local-disks': z.boolean().optional().describe('Include local disks in migration'),
  }),
]);

export type NodeBulkToolInput = z.infer<typeof nodeBulkToolSchema>;

// ── Consolidated: proxmox_node_power ─────────────────────────────────────
export const nodePowerToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('shutdown'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('reboot'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('wakeonlan'),
    node: z.string().min(1).describe('Node name'),
  }),
]);

export type NodePowerToolInput = z.infer<typeof nodePowerToolSchema>;

// ── Consolidated: proxmox_node_replication ────────────────────────────────
export const nodeReplicationToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('status'),
    node: z.string().min(1).describe('Node name'),
    id: z.string().min(1).describe('Replication job ID'),
  }),
  z.object({
    action: z.literal('log'),
    node: z.string().min(1).describe('Node name'),
    id: z.string().min(1).describe('Replication job ID'),
  }),
  z.object({
    action: z.literal('schedule'),
    node: z.string().min(1).describe('Node name'),
    id: z.string().min(1).describe('Replication job ID'),
  }),
]);

export type NodeReplicationToolInput = z.infer<typeof nodeReplicationToolSchema>;
