import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type { ProxmoxNode } from '../types/proxmox.js';
import {
  formatToolResponse,
  formatErrorResponse,
  formatPermissionDenied,
  formatBytes,
  formatUptime,
  formatCpuPercent,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName } from '../validators/index.js';
import { getNodesSchema, getNodeStatusSchema } from '../schemas/node.js';
import type { GetNodesInput, GetNodeStatusInput } from '../schemas/node.js';

/**
 * List all Proxmox cluster nodes with their status and resource usage.
 * No elevated permissions required.
 */
export async function getNodes(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodesInput
): Promise<ToolResponse> {
  try {
    // Validate input (empty schema)
    getNodesSchema.parse(input);

    // Call Proxmox API
    const nodes = (await client.request('/nodes')) as ProxmoxNode[];

    // Format response
    let output = '🖥️  **Proxmox Cluster Nodes**\n\n';

    for (const node of nodes) {
      const status = node.status === 'online' ? '🟢' : '🔴';
      const uptime = node.uptime ? formatUptime(node.uptime) : 'N/A';
      const cpuUsage = node.cpu ? formatCpuPercent(node.cpu) : 'N/A';
      const memUsage =
        node.mem && node.maxmem
          ? `${formatBytes(node.mem)} / ${formatBytes(node.maxmem)} (${((node.mem / node.maxmem) * 100).toFixed(1)}%)`
          : 'N/A';
      const loadAvg = node.loadavg ? node.loadavg[0]?.toFixed(2) : 'N/A';

      output += `${status} **${node.node}**\n`;
      output += `   • Status: ${node.status}\n`;
      output += `   • Uptime: ${uptime}\n`;
      output += `   • CPU: ${cpuUsage}\n`;
      output += `   • Memory: ${memUsage}\n`;
      output += `   • Load: ${loadAvg}\n\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Nodes');
  }
}

interface NodeStatus {
  uptime?: number;
  loadavg?: number[];
  cpu?: number;
  memory?: { used: number; total: number };
  rootfs?: { used: number; total: number };
}

/**
 * Get detailed status for a specific node.
 * Requires elevated permissions.
 */
export async function getNodeStatus(
  client: ProxmoxApiClient,
  config: Config,
  input: GetNodeStatusInput
): Promise<ToolResponse> {
  try {
    // Check permissions
    requireElevated(config, 'get node status');

    // Validate input
    const validated = getNodeStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    // Call Proxmox API
    const status = (await client.request(`/nodes/${safeNode}/status`)) as NodeStatus;

    // Format response
    let output = `🖥️  **Node ${safeNode} Status**\n\n`;
    output += `• **Status**: ${status.uptime ? '🟢 Online' : '🔴 Offline'}\n`;
    output += `• **Uptime**: ${status.uptime ? formatUptime(status.uptime) : 'N/A'}\n`;
    output += `• **Load Average**: ${status.loadavg ? status.loadavg.join(', ') : 'N/A'}\n`;
    output += `• **CPU Usage**: ${status.cpu ? formatCpuPercent(status.cpu) : 'N/A'}\n`;
    output += `• **Memory**: ${
      status.memory
        ? `${formatBytes(status.memory.used)} / ${formatBytes(status.memory.total)} (${((status.memory.used / status.memory.total) * 100).toFixed(1)}%)`
        : 'N/A'
    }\n`;
    output += `• **Root Disk**: ${
      status.rootfs
        ? `${formatBytes(status.rootfs.used)} / ${formatBytes(status.rootfs.total)} (${((status.rootfs.used / status.rootfs.total) * 100).toFixed(1)}%)`
        : 'N/A'
    }\n`;

    return formatToolResponse(output);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('Permission denied')) {
      return formatPermissionDenied('get node status');
    }
    return formatErrorResponse(err, 'Get Node Status');
  }
}
