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
