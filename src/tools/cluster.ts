import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type { ProxmoxNode } from '../types/proxmox.js';
import {
  formatToolResponse,
  formatErrorResponse,
  formatBytes,
} from '../formatters/index.js';
import { getClusterStatusSchema, getNextVmidSchema } from '../schemas/node.js';
import type { GetClusterStatusInput, GetNextVmidInput, ClusterToolInput } from '../schemas/node.js';
import { getClusterOptions, updateClusterOptions } from './cluster-management.js';

/**
 * Get overall cluster status with resource usage and node information.
 * Gracefully degrades without elevated permissions.
 */
export async function getClusterStatus(
  client: ProxmoxApiClient,
  config: Config,
  input: GetClusterStatusInput
): Promise<ToolResponse> {
  try {
    // Validate input (empty schema)
    getClusterStatusSchema.parse(input);

    // Get nodes list
    const nodes = (await client.request('/nodes')) as ProxmoxNode[];

    // Try to get cluster status if elevated, but ignore errors
    if (config.allowElevated) {
      try {
        await client.request('/cluster/status');
      } catch {
        // Ignore cluster status errors
      }
    }

    // Format response
    let output = '🏗️  **Proxmox Cluster Status**\n\n';

    // Cluster overview
    const onlineNodes = nodes.filter((n) => n.status === 'online').length;
    const totalNodes = nodes.length;

    output += `**Cluster Health**: ${onlineNodes === totalNodes ? '🟢 Healthy' : '🟡 Warning'}\n`;
    output += `**Nodes**: ${onlineNodes}/${totalNodes} online\n\n`;

    if (config.allowElevated) {
      // Resource summary (only available with elevated permissions)
      let totalCpu = 0;
      let usedCpu = 0;
      let totalMem = 0;
      let usedMem = 0;

      for (const node of nodes) {
        if (node.status === 'online') {
          totalCpu += node.maxcpu || 0;
          usedCpu += (node.cpu || 0) * (node.maxcpu || 0);
          totalMem += node.maxmem || 0;
          usedMem += node.mem || 0;
        }
      }

      const cpuPercent = totalCpu > 0 ? ((usedCpu / totalCpu) * 100).toFixed(1) : 'N/A';
      const memPercent = totalMem > 0 ? ((usedMem / totalMem) * 100).toFixed(1) : 'N/A';

      output += `**Resource Usage**:\n`;
      output += `• CPU: ${cpuPercent}% (${usedCpu.toFixed(1)}/${totalCpu} cores)\n`;
      output += `• Memory: ${memPercent}% (${formatBytes(usedMem)}/${formatBytes(totalMem)})\n\n`;
    } else {
      output += `⚠️  **Limited Information**: Resource usage requires elevated permissions\n\n`;
    }

    // Node status
    output += `**Node Details**:\n`;
    for (const node of nodes.sort((a, b) => a.node.localeCompare(b.node))) {
      const status = node.status === 'online' ? '🟢' : '🔴';
      output += `${status} ${node.node} - ${node.status}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Status');
  }
}

/**
 * Get the next available VM/Container ID.
 * No elevated permissions required.
 */
export async function getNextVMID(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNextVmidInput
): Promise<ToolResponse> {
  try {
    // Validate input (empty schema)
    getNextVmidSchema.parse(input);

    // Call Proxmox API
    const result = await client.request('/cluster/nextid');

    // Format response
    const output = `**Next Available VM/Container ID**: ${result}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Next VMID');
  }
}

export async function handleClusterTool(
  client: ProxmoxApiClient,
  config: Config,
  input: ClusterToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'status':
      return getClusterStatus(client, config, {});
    case 'options':
      return getClusterOptions(client, config, {});
    case 'update_options':
      return updateClusterOptions(client, config, input.options);
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Cluster Tool');
  }
}
