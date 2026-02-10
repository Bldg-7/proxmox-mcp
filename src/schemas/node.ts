import { z } from 'zod';

// proxmox_get_nodes - List all Proxmox cluster nodes
export const getNodesSchema = z.object({});

export type GetNodesInput = z.infer<typeof getNodesSchema>;

// proxmox_get_node_status - Get detailed status for a specific node
export const getNodeStatusSchema = z.object({
  node: z.string().min(1).describe('Node name (e.g., pve1, proxmox-node2)'),
});

export type GetNodeStatusInput = z.infer<typeof getNodeStatusSchema>;

// proxmox_get_cluster_status - Get overall cluster status
export const getClusterStatusSchema = z.object({});

export type GetClusterStatusInput = z.infer<typeof getClusterStatusSchema>;

// proxmox_get_next_vmid - Get the next available VM/Container ID
export const getNextVmidSchema = z.object({});

export type GetNextVmidInput = z.infer<typeof getNextVmidSchema>;

// proxmox_get_node_network - Get network interfaces for a node
export const getNodeNetworkSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  type: z.string().optional().describe('Filter by interface type (bridge, bond, eth, vlan, etc.)'),
});

export type GetNodeNetworkInput = z.infer<typeof getNodeNetworkSchema>;

// proxmox_get_node_dns - Get DNS configuration for a node
export const getNodeDnsSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeDnsInput = z.infer<typeof getNodeDnsSchema>;

// proxmox_get_network_iface - Get details for a specific network interface
export const getNetworkIfaceSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  iface: z.string().min(1).describe('Interface name (e.g., eth0, vmbr0, bond0)'),
});

export type GetNetworkIfaceInput = z.infer<typeof getNetworkIfaceSchema>;

// ── Consolidated: proxmox_node ──────────────────────────────────────────
export const nodeToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
  }),
  z.object({
    action: z.literal('status'),
    node: z.string().min(1).describe('Node name (e.g., pve1, proxmox-node2)'),
  }),
  z.object({
    action: z.literal('network'),
    node: z.string().min(1).describe('Node name'),
    type: z.string().optional().describe('Filter by interface type (bridge, bond, eth, vlan, etc.)'),
  }),
  z.object({
    action: z.literal('dns'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('iface'),
    node: z.string().min(1).describe('Node name'),
    iface: z.string().min(1).describe('Interface name (e.g., eth0, vmbr0, bond0)'),
  }),
]);

export type NodeToolInput = z.infer<typeof nodeToolSchema>;

// ── Consolidated: proxmox_node_disk ──────────────────────────────────────
export const nodeDiskSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
    node: z.string().min(1).describe('Node name'),
    include_partitions: z.boolean().optional().describe('Include partitions in listing'),
    skip_smart: z.boolean().optional().describe('Skip SMART health checks (faster)'),
    type: z.enum(['unused', 'journal_disks']).optional().describe('Filter by disk type'),
  }),
  z.object({
    action: z.literal('smart'),
    node: z.string().min(1).describe('Node name'),
    disk: z.string().min(1).describe('Block device path (e.g., /dev/sda)'),
    health_only: z.boolean().optional().describe('Only return health status'),
  }),
  z.object({
    action: z.literal('lvm'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('zfs'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('lvmthin'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('directory'),
    node: z.string().min(1).describe('Node name'),
  }),
]);

export type NodeDiskInput = z.infer<typeof nodeDiskSchema>;

// ── Consolidated: proxmox_cluster ───────────────────────────────────────
export const clusterToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('status'),
  }),
  z.object({
    action: z.literal('options'),
  }),
  z.object({
    action: z.literal('update_options'),
    options: z
      .record(z.union([z.string(), z.number(), z.boolean()]))
      .describe('Cluster options to update'),
  }),
]);

export type ClusterToolInput = z.infer<typeof clusterToolSchema>;

// proxmox_get_node_services - List services on a node
export const getNodeServicesSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeServicesInput = z.infer<typeof getNodeServicesSchema>;

// proxmox_control_node_service - Start/stop/restart a service on a node
export const controlNodeServiceSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  service: z.string().min(1).describe('Service name (e.g., pveproxy, ssh, pvedaemon)'),
  command: z.enum(['start', 'stop', 'restart']).describe('Service command'),
});

export type ControlNodeServiceInput = z.infer<typeof controlNodeServiceSchema>;

// proxmox_get_node_syslog - Read syslog for a node
export const getNodeSyslogSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeSyslogInput = z.infer<typeof getNodeSyslogSchema>;

// proxmox_get_node_journal - Read systemd journal for a node
export const getNodeJournalSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeJournalInput = z.infer<typeof getNodeJournalSchema>;

// proxmox_get_node_tasks - List node tasks
export const getNodeTasksSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeTasksInput = z.infer<typeof getNodeTasksSchema>;

// proxmox_get_node_task - Get status/log for a specific task
export const getNodeTaskSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  upid: z.string().min(1).describe('Task UPID'),
});

export type GetNodeTaskInput = z.infer<typeof getNodeTaskSchema>;

// proxmox_get_node_aplinfo - List available appliance templates
export const getNodeAplinfoSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeAplinfoInput = z.infer<typeof getNodeAplinfoSchema>;

// proxmox_get_node_netstat - Network statistics for a node
export const getNodeNetstatSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeNetstatInput = z.infer<typeof getNodeNetstatSchema>;

// proxmox_get_node_rrddata - Get node RRD metrics
export const getNodeRrddataSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().describe('Timeframe for metrics'),
  cf: z.enum(['AVERAGE', 'MAX']).optional().describe('Consolidation function'),
});

export type GetNodeRrddataInput = z.infer<typeof getNodeRrddataSchema>;

// proxmox_get_storage_rrddata - Get storage RRD metrics
export const getStorageRrddataSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  storage: z.string().min(1).describe('Storage name'),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().describe('Timeframe for metrics'),
  cf: z.enum(['AVERAGE', 'MAX']).optional().describe('Consolidation function'),
});

export type GetStorageRrddataInput = z.infer<typeof getStorageRrddataSchema>;

// proxmox_get_node_report - Get node diagnostic report
export const getNodeReportSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeReportInput = z.infer<typeof getNodeReportSchema>;

// ── Consolidated: proxmox_node_service ───────────────────────────────────
export const nodeServiceToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('control'),
    node: z.string().min(1).describe('Node name'),
    service: z.string().min(1).describe('Service name (e.g., pveproxy, ssh, pvedaemon)'),
    command: z.enum(['start', 'stop', 'restart']).describe('Service command'),
  }),
]);

export type NodeServiceToolInput = z.infer<typeof nodeServiceToolSchema>;

// ── Consolidated: proxmox_node_log ───────────────────────────────────────
export const nodeLogToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('syslog'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('journal'),
    node: z.string().min(1).describe('Node name'),
  }),
]);

export type NodeLogToolInput = z.infer<typeof nodeLogToolSchema>;

// ── Consolidated: proxmox_node_task ──────────────────────────────────────
export const nodeTaskToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('list'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('get'),
    node: z.string().min(1).describe('Node name'),
    upid: z.string().min(1).describe('Task UPID'),
  }),
]);

export type NodeTaskToolInput = z.infer<typeof nodeTaskToolSchema>;

// ── Consolidated: proxmox_node_info ──────────────────────────────────────
export const nodeInfoToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('aplinfo'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('netstat'),
    node: z.string().min(1).describe('Node name'),
  }),
  z.object({
    action: z.literal('rrddata'),
    node: z.string().min(1).describe('Node name'),
    timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().describe('Timeframe for metrics'),
    cf: z.enum(['AVERAGE', 'MAX']).optional().describe('Consolidation function'),
  }),
  z.object({
    action: z.literal('storage_rrddata'),
    node: z.string().min(1).describe('Node name'),
    storage: z.string().min(1).describe('Storage name'),
    timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().describe('Timeframe for metrics'),
    cf: z.enum(['AVERAGE', 'MAX']).optional().describe('Consolidation function'),
  }),
  z.object({
    action: z.literal('report'),
    node: z.string().min(1).describe('Node name'),
  }),
]);

export type NodeInfoToolInput = z.infer<typeof nodeInfoToolSchema>;
