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
