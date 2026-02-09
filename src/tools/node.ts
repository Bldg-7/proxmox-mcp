import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type {
  ProxmoxNode,
  ProxmoxService,
  ProxmoxSyslogEntry,
  ProxmoxJournalEntry,
  ProxmoxTask,
  ProxmoxApplianceTemplate,
  ProxmoxNetstatEntry,
} from '../types/proxmox.js';
import {
  formatToolResponse,
  formatErrorResponse,
  formatPermissionDenied,
  formatBytes,
  formatUptime,
  formatCpuPercent,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  validateNodeName,
  validateInterfaceName,
  validateServiceName,
  validateUpid,
} from '../validators/index.js';
import {
  getNodesSchema,
  getNodeStatusSchema,
  getNodeNetworkSchema,
  getNodeDnsSchema,
  getNetworkIfaceSchema,
  getNodeServicesSchema,
  controlNodeServiceSchema,
  getNodeSyslogSchema,
  getNodeJournalSchema,
  getNodeTasksSchema,
  getNodeTaskSchema,
  getNodeAplinfoSchema,
  getNodeNetstatSchema,
  getNodeRrddataSchema,
  getStorageRrddataSchema,
  getNodeReportSchema,
} from '../schemas/node.js';
import type {
  GetNodesInput,
  GetNodeStatusInput,
  GetNodeNetworkInput,
  GetNodeDnsInput,
  GetNetworkIfaceInput,
  GetNodeServicesInput,
  ControlNodeServiceInput,
  GetNodeSyslogInput,
  GetNodeJournalInput,
  GetNodeTasksInput,
  GetNodeTaskInput,
  GetNodeAplinfoInput,
  GetNodeNetstatInput,
  GetNodeRrddataInput,
  GetStorageRrddataInput,
  GetNodeReportInput,
} from '../schemas/node.js';
import type { ProxmoxNetwork, ProxmoxDNS } from '../types/proxmox.js';
import type { NodeToolInput, NodeServiceToolInput, NodeLogToolInput, NodeTaskToolInput, NodeInfoToolInput } from '../schemas/node.js';

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

/**
 * List services on a specific node.
 * No elevated permissions required.
 */
export async function getNodeServices(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeServicesInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeServicesSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const services = (await client.request(
      `/nodes/${safeNode}/services`
    )) as ProxmoxService[];

    if (services.length === 0) {
      return formatToolResponse('No services found.');
    }

    let output = '🛠️  **Node Services**\n\n';
    for (const service of services) {
      const name = service.name || service.service || 'unknown';
      const state = service.state || service.status || 'unknown';
      const description = service.desc || 'N/A';
      const enabled =
        service.enabled === undefined
          ? 'N/A'
          : service.enabled === 1
            ? 'Yes'
            : 'No';

      output += `• **${name}** (${state})\n`;
      if (description !== 'N/A') {
        output += `   • Description: ${description}\n`;
      }
      if (enabled !== 'N/A') {
        output += `   • Enabled: ${enabled}\n`;
      }
      output += '\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Services');
  }
}

/**
 * Start/stop/restart a service on a specific node.
 * Requires elevated permissions.
 */
export async function controlNodeService(
  client: ProxmoxApiClient,
  config: Config,
  input: ControlNodeServiceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'control node service');

    const validated = controlNodeServiceSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeService = validateServiceName(validated.service);

    const result = await client.request(
      `/nodes/${safeNode}/services/${safeService}`,
      'POST',
      { command: validated.command }
    );

    const output =
      `🛠️  **Service Command Issued**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Service**: ${safeService}\n` +
      `• **Command**: ${validated.command}\n` +
      `• **Task ID**: ${result || 'N/A'}\n`;

    return formatToolResponse(output);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('Permission denied')) {
      return formatPermissionDenied('control node service');
    }
    return formatErrorResponse(err, 'Control Node Service');
  }
}

/**
 * Read syslog for a specific node.
 * No elevated permissions required.
 */
export async function getNodeSyslog(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeSyslogInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeSyslogSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const entries = (await client.request(
      `/nodes/${safeNode}/syslog`
    )) as ProxmoxSyslogEntry[];

    if (entries.length === 0) {
      return formatToolResponse('No syslog entries found.');
    }

    let output = '📜 **System Log (Syslog)**\n\n';
    entries.forEach((entry, index) => {
      const line = entry.n ?? index + 1;
      const message = entry.t || entry.msg || 'N/A';
      const time = entry.time ? ` (${entry.time})` : '';
      output += `• [${line}]${time} ${message}\n`;
    });

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Syslog');
  }
}

/**
 * Read systemd journal for a specific node.
 * No elevated permissions required.
 */
export async function getNodeJournal(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeJournalInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeJournalSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const entries = (await client.request(
      `/nodes/${safeNode}/journal`
    )) as ProxmoxJournalEntry[];

    if (entries.length === 0) {
      return formatToolResponse('No journal entries found.');
    }

    let output = '📚 **Systemd Journal**\n\n';
    entries.forEach((entry, index) => {
      const line = entry.n ?? index + 1;
      const message = entry.t || entry.msg || 'N/A';
      const time = entry.time ? ` (${entry.time})` : '';
      output += `• [${line}]${time} ${message}\n`;
    });

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Journal');
  }
}

/**
 * List tasks for a specific node.
 * No elevated permissions required.
 */
export async function getNodeTasks(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeTasksInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeTasksSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const tasks = (await client.request(
      `/nodes/${safeNode}/tasks`
    )) as ProxmoxTask[];

    if (tasks.length === 0) {
      return formatToolResponse('No tasks found.');
    }

    let output = '📋 **Node Tasks**\n\n';
    for (const task of tasks) {
      const status = task.status || 'unknown';
      const type = task.type || 'task';
      output += `• **${type}** (${status})\n`;
      if (task.id) output += `   • ID: ${task.id}\n`;
      if (task.user) output += `   • User: ${task.user}\n`;
      if (task.starttime !== undefined) output += `   • Start: ${task.starttime}\n`;
      if (task.upid) output += `   • UPID: ${task.upid}\n`;
      if (task.exitstatus) output += `   • Exit: ${task.exitstatus}\n`;
      output += '\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Tasks');
  }
}

/**
 * Get details for a specific node task.
 * No elevated permissions required.
 */
export async function getNodeTask(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeTaskInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeTaskSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeUpid = validateUpid(validated.upid);

    const task = (await client.request(
      `/nodes/${safeNode}/tasks/${safeUpid}`
    )) as ProxmoxTask;

    let output = `📌 **Task Details**\n\n`;
    output += `• **UPID**: ${task.upid || safeUpid}\n`;
    output += `• **Type**: ${task.type || 'N/A'}\n`;
    output += `• **Status**: ${task.status || 'N/A'}\n`;
    if (task.exitstatus) output += `• **Exit Status**: ${task.exitstatus}\n`;
    if (task.user) output += `• **User**: ${task.user}\n`;
    if (task.starttime !== undefined) output += `• **Start Time**: ${task.starttime}\n`;
    if (task.endtime !== undefined) output += `• **End Time**: ${task.endtime}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Task');
  }
}

/**
 * List available appliance templates on a node.
 * No elevated permissions required.
 */
export async function getNodeAplinfo(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeAplinfoInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeAplinfoSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const templates = (await client.request(
      `/nodes/${safeNode}/aplinfo`
    )) as ProxmoxApplianceTemplate[];

    if (templates.length === 0) {
      return formatToolResponse('No appliance templates found.');
    }

    let output = '📦 **Appliance Templates**\n\n';
    for (const template of templates) {
      const name = template.template || template.package || 'unknown';
      const version = template.version || 'N/A';
      const type = template.type || template.os || 'N/A';
      output += `• **${name}**\n`;
      if (type !== 'N/A') output += `   • Type: ${type}\n`;
      if (version !== 'N/A') output += `   • Version: ${version}\n`;
      if (template.description) output += `   • Description: ${template.description}\n`;
      output += '\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Appliance Templates');
  }
}

/**
 * Get network statistics for a node.
 * No elevated permissions required.
 */
export async function getNodeNetstat(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeNetstatInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeNetstatSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const entries = (await client.request(
      `/nodes/${safeNode}/netstat`
    )) as ProxmoxNetstatEntry[];

    if (entries.length === 0) {
      return formatToolResponse('No network statistics found.');
    }

    let output = '📡 **Network Connections**\n\n';
    for (const entry of entries) {
      const proto = entry.proto || 'N/A';
      const local = entry.local_address || entry.local || 'N/A';
      const remote = entry.remote_address || entry.remote || 'N/A';
      const state = entry.state || 'N/A';
      output += `• **${proto}** ${local} → ${remote} (${state})\n`;
      if (entry.pid !== undefined) output += `   • PID: ${entry.pid}\n`;
      if (entry.program) output += `   • Program: ${entry.program}\n`;
      output += '\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Netstat');
  }
}

interface ProxmoxRrdDataPoint {
  [key: string]: number | string | null | undefined;
  time?: number;
}

function formatJsonBlock(data: unknown): string {
  return `\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
}

/**
 * Get node RRD performance metrics.
 * No elevated permissions required.
 */
export async function getNodeRrddata(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeRrddataInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeRrddataSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const params = new URLSearchParams();
    if (validated.timeframe) params.set('timeframe', validated.timeframe);
    if (validated.cf) params.set('cf', validated.cf);

    const query = params.toString();
    const path = `/nodes/${safeNode}/rrddata${query ? `?${query}` : ''}`;
    const data = (await client.request(path)) as ProxmoxRrdDataPoint[];

    let output = '📈 **Node Performance Metrics**\n\n';
    output += `• **Node**: ${safeNode}\n`;

    if (!data || data.length === 0) {
      output += '\nNo performance metrics available.';
      return formatToolResponse(output);
    }

    output += `• **Points**: ${data.length}`;
    output += formatJsonBlock(data.slice(0, 5));

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node RRD Data');
  }
}

/**
 * Get storage RRD performance metrics.
 * No elevated permissions required.
 */
export async function getStorageRrddata(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetStorageRrddataInput
): Promise<ToolResponse> {
  try {
    const validated = getStorageRrddataSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validated.storage;

    const params = new URLSearchParams();
    if (validated.timeframe) params.set('timeframe', validated.timeframe);
    if (validated.cf) params.set('cf', validated.cf);

    const query = params.toString();
    const path = `/nodes/${safeNode}/storage/${safeStorage}/rrddata${query ? `?${query}` : ''}`;
    const data = (await client.request(path)) as ProxmoxRrdDataPoint[];

    let output = '📈 **Storage Performance Metrics**\n\n';
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Node**: ${safeNode}\n`;

    if (!data || data.length === 0) {
      output += '\nNo performance metrics available.';
      return formatToolResponse(output);
    }

    output += `• **Points**: ${data.length}`;
    output += formatJsonBlock(data.slice(0, 5));

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Storage RRD Data');
  }
}

/**
 * Get node diagnostic report.
 * No elevated permissions required.
 */
export async function getNodeReport(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeReportInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeReportSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const report = (await client.request(`/nodes/${safeNode}/report`)) as string;

    let output = '📋 **Node Diagnostic Report**\n\n';
    output += `• **Node**: ${safeNode}\n\n`;

    if (!report || report.length === 0) {
      output += 'No diagnostic report available.';
      return formatToolResponse(output);
    }

    output += '```\n' + report + '\n```';

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Report');
  }
}

export async function handleNodeTool(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return getNodes(client, config, {});
    case 'status':
      return getNodeStatus(client, config, { node: input.node });
    case 'network':
      return getNodeNetwork(client, config, { node: input.node, type: input.type });
    case 'dns':
      return getNodeDns(client, config, { node: input.node });
    case 'iface':
      return getNetworkIface(client, config, { node: input.node, iface: input.iface });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Tool');
  }
}

export async function handleNodeService(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeServiceToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return getNodeServices(client, config, { node: input.node });
    case 'control':
      return controlNodeService(client, config, { node: input.node, service: input.service, command: input.command });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Service');
  }
}

export async function handleNodeLog(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeLogToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'syslog':
      return getNodeSyslog(client, config, { node: input.node });
    case 'journal':
      return getNodeJournal(client, config, { node: input.node });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Log');
  }
}

export async function handleNodeTask(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeTaskToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return getNodeTasks(client, config, { node: input.node });
    case 'get':
      return getNodeTask(client, config, { node: input.node, upid: input.upid });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Task');
  }
}

export async function handleNodeInfo(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeInfoToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'aplinfo':
      return getNodeAplinfo(client, config, { node: input.node });
    case 'netstat':
      return getNodeNetstat(client, config, { node: input.node });
    case 'rrddata':
      return getNodeRrddata(client, config, { node: input.node, timeframe: input.timeframe, cf: input.cf });
    case 'storage_rrddata':
      return getStorageRrddata(client, config, { node: input.node, storage: input.storage, timeframe: input.timeframe, cf: input.cf });
    case 'report':
      return getNodeReport(client, config, { node: input.node });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Info');
  }
}
