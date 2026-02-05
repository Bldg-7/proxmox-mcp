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
import { validateNodeName, validateInterfaceName } from '../validators/index.js';
import {
  getNodesSchema,
  getNodeStatusSchema,
  getNodeNetworkSchema,
  getNodeDnsSchema,
  getNetworkIfaceSchema,
} from '../schemas/node.js';
import type {
  GetNodesInput,
  GetNodeStatusInput,
  GetNodeNetworkInput,
  GetNodeDnsInput,
  GetNetworkIfaceInput,
} from '../schemas/node.js';
import type { ProxmoxNetwork, ProxmoxDNS } from '../types/proxmox.js';

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

/**
 * Get network interfaces for a specific node.
 * No elevated permissions required.
 */
export async function getNodeNetwork(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeNetworkInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeNetworkSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    let path = `/nodes/${safeNode}/network`;
    if (validated.type) {
      path += `?type=${validated.type}`;
    }

    const interfaces = (await client.request(path)) as ProxmoxNetwork[];

    if (interfaces.length === 0) {
      return formatToolResponse('No network interfaces found.');
    }

    let output = '🌐 **Network Interfaces**\n\n';
    for (const iface of interfaces) {
      const status = iface.active ? '🟢' : '⚪';
      output += `${status} **${iface.iface}** (${iface.type})\n`;
      if (iface.address) output += `   • IP: ${iface.address}/${iface.netmask || 'N/A'}\n`;
      if (iface.gateway) output += `   • Gateway: ${iface.gateway}\n`;
      if (iface.bridge_ports) output += `   • Bridge Ports: ${iface.bridge_ports}\n`;
      output += '\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Network');
  }
}

/**
 * Get DNS configuration for a specific node.
 * No elevated permissions required.
 */
export async function getNodeDns(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeDnsInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeDnsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const dns = (await client.request(`/nodes/${safeNode}/dns`)) as ProxmoxDNS;

    let output = '🌐 **DNS Configuration**\n\n';
    output += `• **Search Domain**: ${dns.search}\n`;
    if (dns.dns1) output += `• **DNS 1**: ${dns.dns1}\n`;
    if (dns.dns2) output += `• **DNS 2**: ${dns.dns2}\n`;
    if (dns.dns3) output += `• **DNS 3**: ${dns.dns3}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node DNS');
  }
}

/**
 * Get details for a specific network interface on a node.
 * No elevated permissions required.
 */
export async function getNetworkIface(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNetworkIfaceInput
): Promise<ToolResponse> {
  try {
    const validated = getNetworkIfaceSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeIface = validateInterfaceName(validated.iface);

    const iface = (await client.request(
      `/nodes/${safeNode}/network/${safeIface}`
    )) as ProxmoxNetwork;

    let output = '🌐 **Network Interface Details**\n\n';
    const status = iface.active ? '🟢' : '⚪';
    output += `${status} **${iface.iface}** (${iface.type})\n\n`;
    if (iface.method) output += `• **Method**: ${iface.method}\n`;
    if (iface.address) output += `• **IP Address**: ${iface.address}/${iface.netmask || 'N/A'}\n`;
    if (iface.gateway) output += `• **Gateway**: ${iface.gateway}\n`;
    if (iface.cidr) output += `• **CIDR**: ${iface.cidr}\n`;
    if (iface.bridge_ports) output += `• **Bridge Ports**: ${iface.bridge_ports}\n`;
    if (iface.bridge_stp) output += `• **Bridge STP**: ${iface.bridge_stp}\n`;
    if (iface.bridge_fd) output += `• **Bridge FD**: ${iface.bridge_fd}\n`;
    if (iface.autostart !== undefined)
      output += `• **Autostart**: ${iface.autostart ? 'Yes' : 'No'}\n`;
    if (iface.families) output += `• **Families**: ${iface.families.join(', ')}\n`;
    if (iface.priority !== undefined) output += `• **Priority**: ${iface.priority}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Network Interface');
  }
}
