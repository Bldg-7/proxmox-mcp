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
