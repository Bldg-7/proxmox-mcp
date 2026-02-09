import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName } from '../validators/index.js';
import {
  getNodeTimeSchema,
  updateNodeTimeSchema,
  updateNodeDnsSchema,
  getNodeHostsSchema,
  updateNodeHostsSchema,
  getNodeSubscriptionSchema,
  setNodeSubscriptionSchema,
  deleteNodeSubscriptionSchema,
  aptUpdateSchema,
  aptUpgradeSchema,
  aptVersionsSchema,
  startAllSchema,
  stopAllSchema,
  migrateAllSchema,
  nodeShutdownSchema,
  nodeRebootSchema,
  nodeWakeonlanSchema,
  getNodeReplicationStatusSchema,
  getNodeReplicationLogSchema,
  scheduleNodeReplicationSchema,
} from '../schemas/system-operations.js';
import type {
  GetNodeTimeInput,
  UpdateNodeTimeInput,
  UpdateNodeDnsInput,
  GetNodeHostsInput,
  UpdateNodeHostsInput,
  GetNodeSubscriptionInput,
  SetNodeSubscriptionInput,
  DeleteNodeSubscriptionInput,
  AptUpdateInput,
  AptUpgradeInput,
  AptVersionsInput,
  StartAllInput,
  StopAllInput,
  MigrateAllInput,
  NodeShutdownInput,
  NodeRebootInput,
  NodeWakeonlanInput,
  GetNodeReplicationStatusInput,
  GetNodeReplicationLogInput,
  ScheduleNodeReplicationInput,
  NodeConfigToolInput,
  NodeSubscriptionToolInput,
  AptToolInput,
  NodeBulkToolInput,
  NodePowerToolInput,
  NodeReplicationToolInput,
} from '../schemas/system-operations.js';

interface ProxmoxNodeTime {
  time?: number;
  localtime?: number;
  timezone?: string;
}

interface ProxmoxHostEntry {
  ip?: string;
  name?: string;
  comment?: string;
}

interface ProxmoxSubscriptionInfo {
  status?: string;
  key?: string;
  level?: string;
  nextduedate?: number;
  enddate?: number;
  message?: string;
}

interface ProxmoxAptVersion {
  package?: string;
  version?: string;
  oldversion?: string;
  newversion?: string;
  arch?: string;
  description?: string;
}

const formatEpoch = (value?: number): string =>
  value !== undefined ? new Date(value * 1000).toISOString() : 'N/A';

/**
 * Get node time and timezone details.
 * No elevated permissions required.
 */
export async function getNodeTime(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeTimeInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeTimeSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const timeInfo = (await client.request(
      `/nodes/${safeNode}/time`
    )) as ProxmoxNodeTime;

    let output = '🕒 **Node Time**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Time**: ${formatEpoch(timeInfo.time)}\n`;
    output += `• **Local Time**: ${formatEpoch(timeInfo.localtime)}\n`;
    if (timeInfo.timezone) output += `• **Timezone**: ${timeInfo.timezone}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Time');
  }
}

/**
 * Update node time and/or timezone.
 * Requires elevated permissions.
 */
export async function updateNodeTime(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNodeTimeInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update node time');

    const validated = updateNodeTimeSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {};
    if (validated.time !== undefined) payload.time = validated.time;
    if (validated.timezone) payload.timezone = validated.timezone;

    const result = await client.request(
      `/nodes/${safeNode}/time`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '🕒 **Node Time Updated**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    if (validated.time !== undefined) output += `• **Time**: ${validated.time}\n`;
    if (validated.timezone) output += `• **Timezone**: ${validated.timezone}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Node Time');
  }
}

/**
 * Update DNS configuration for a node.
 * Requires elevated permissions.
 */
export async function updateNodeDns(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNodeDnsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update node dns');

    const validated = updateNodeDnsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {};
    if (validated.search) payload.search = validated.search;
    if (validated.dns1) payload.dns1 = validated.dns1;
    if (validated.dns2) payload.dns2 = validated.dns2;
    if (validated.dns3) payload.dns3 = validated.dns3;
    if (validated.delete) payload.delete = validated.delete;

    const result = await client.request(
      `/nodes/${safeNode}/dns`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '🌐 **Node DNS Updated**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    if (validated.search) output += `• **Search Domain**: ${validated.search}\n`;
    if (validated.dns1) output += `• **DNS 1**: ${validated.dns1}\n`;
    if (validated.dns2) output += `• **DNS 2**: ${validated.dns2}\n`;
    if (validated.dns3) output += `• **DNS 3**: ${validated.dns3}\n`;
    if (validated.delete) output += `• **Delete**: ${validated.delete}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Node DNS');
  }
}

/**
 * Get /etc/hosts entries for a node.
 * No elevated permissions required.
 */
export async function getNodeHosts(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeHostsInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeHostsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const hosts = (await client.request(
      `/nodes/${safeNode}/hosts`
    )) as ProxmoxHostEntry[];

    if (hosts.length === 0) {
      return formatToolResponse('No host entries found.');
    }

    let output = '🧾 **Node Hosts**\n\n';
    for (const entry of hosts) {
      const name = entry.name || 'unknown';
      const ip = entry.ip || 'N/A';
      output += `• **${name}** (${ip})\n`;
      if (entry.comment) output += `   • Comment: ${entry.comment}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Hosts');
  }
}

/**
 * Update /etc/hosts entries for a node.
 * Requires elevated permissions.
 */
export async function updateNodeHosts(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNodeHostsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update node hosts');

    const validated = updateNodeHostsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {
      ip: validated.ip,
      name: validated.name,
    };
    if (validated.comment) payload.comment = validated.comment;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/nodes/${safeNode}/hosts`,
      'POST',
      payload
    );

    let output = '🧾 **Node Hosts Updated**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **IP**: ${validated.ip}\n`;
    output += `• **Name**: ${validated.name}\n`;
    if (validated.comment) output += `• **Comment**: ${validated.comment}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Node Hosts');
  }
}

/**
 * Get node subscription information.
 * No elevated permissions required.
 */
export async function getNodeSubscription(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeSubscriptionInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeSubscriptionSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const subscription = (await client.request(
      `/nodes/${safeNode}/subscription`
    )) as ProxmoxSubscriptionInfo;

    let output = '🧾 **Node Subscription**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    if (subscription.status) output += `• **Status**: ${subscription.status}\n`;
    if (subscription.level) output += `• **Level**: ${subscription.level}\n`;
    if (subscription.key) output += `• **Key**: ${subscription.key}\n`;
    if (subscription.nextduedate !== undefined) {
      output += `• **Next Due**: ${subscription.nextduedate}\n`;
    }
    if (subscription.enddate !== undefined) {
      output += `• **End Date**: ${subscription.enddate}\n`;
    }
    if (subscription.message) output += `• **Message**: ${subscription.message}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Subscription');
  }
}

/**
 * Set node subscription key.
 * Requires elevated permissions.
 */
export async function setNodeSubscription(
  client: ProxmoxApiClient,
  config: Config,
  input: SetNodeSubscriptionInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'set node subscription');

    const validated = setNodeSubscriptionSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/subscription`, 'POST', {
      key: validated.key,
    });

    let output = '🔑 **Node Subscription Set**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Key**: ${validated.key}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Set Node Subscription');
  }
}

/**
 * Delete node subscription key.
 * Requires elevated permissions.
 */
export async function deleteNodeSubscription(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteNodeSubscriptionInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete node subscription');

    const validated = deleteNodeSubscriptionSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/subscription`, 'DELETE');

    let output = '🧹 **Node Subscription Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Node Subscription');
  }
}

/**
 * Refresh APT package lists on a node.
 * Requires elevated permissions.
 */
export async function aptUpdate(
  client: ProxmoxApiClient,
  config: Config,
  input: AptUpdateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'apt update');

    const validated = aptUpdateSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/apt/update`, 'POST');

    let output = '🧰 **APT Update Started**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'APT Update');
  }
}

/**
 * Upgrade APT packages on a node.
 * Requires elevated permissions.
 */
export async function aptUpgrade(
  client: ProxmoxApiClient,
  config: Config,
  input: AptUpgradeInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'apt upgrade');

    const validated = aptUpgradeSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/apt/upgrade`, 'POST');

    let output = '🧰 **APT Upgrade Started**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'APT Upgrade');
  }
}

/**
 * List APT package versions on a node.
 * No elevated permissions required.
 */
export async function aptVersions(
  client: ProxmoxApiClient,
  _config: Config,
  input: AptVersionsInput
): Promise<ToolResponse> {
  try {
    const validated = aptVersionsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    let path = `/nodes/${safeNode}/apt/versions`;
    if (validated.package) {
      path += `?package=${validated.package}`;
    }

    const versions = (await client.request(path)) as ProxmoxAptVersion[];

    if (versions.length === 0) {
      return formatToolResponse('No package versions found.');
    }

    let output = '📦 **APT Package Versions**\n\n';
    for (const entry of versions) {
      const name = entry.package || 'unknown';
      const version = entry.version || entry.newversion || 'N/A';
      output += `• **${name}**: ${version}\n`;
      if (entry.arch) output += `   • Arch: ${entry.arch}\n`;
      if (entry.oldversion) output += `   • Current: ${entry.oldversion}\n`;
      if (entry.newversion) output += `   • Candidate: ${entry.newversion}\n`;
      if (entry.description) output += `   • Description: ${entry.description}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'APT Versions');
  }
}

/**
 * Start all guests on a node.
 * Requires elevated permissions.
 */
export async function startAll(
  client: ProxmoxApiClient,
  config: Config,
  input: StartAllInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'start all guests');

    const validated = startAllSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/startall`, 'POST');

    let output = '🚀 **Start All Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Start All');
  }
}

/**
 * Stop all guests on a node.
 * Requires elevated permissions.
 */
export async function stopAll(
  client: ProxmoxApiClient,
  config: Config,
  input: StopAllInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'stop all guests');

    const validated = stopAllSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/stopall`, 'POST');

    let output = '🛑 **Stop All Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Stop All');
  }
}

/**
 * Migrate all guests from a node.
 * Requires elevated permissions.
 */
export async function migrateAll(
  client: ProxmoxApiClient,
  config: Config,
  input: MigrateAllInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'migrate all guests');

    const validated = migrateAllSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {
      target: validated.target,
    };
    if (validated.maxworkers !== undefined) payload.maxworkers = validated.maxworkers;
    if (validated['with-local-disks'] !== undefined) {
      payload['with-local-disks'] = validated['with-local-disks'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/migrateall`,
      'POST',
      payload
    );

    let output = '🚚 **Migrate All Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Target**: ${validated.target}\n`;
    if (validated.maxworkers !== undefined) {
      output += `• **Max Workers**: ${validated.maxworkers}\n`;
    }
    if (validated['with-local-disks'] !== undefined) {
      output += `• **With Local Disks**: ${validated['with-local-disks'] ? 'Yes' : 'No'}\n`;
    }
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Migrate All');
  }
}

/**
 * Shutdown a node.
 * Requires elevated permissions.
 */
export async function nodeShutdown(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeShutdownInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'shutdown node');

    const validated = nodeShutdownSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/status`, 'POST', {
      command: 'shutdown',
    });

    let output = '🛑 **Node Shutdown Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Node Shutdown');
  }
}

/**
 * Reboot a node.
 * Requires elevated permissions.
 */
export async function nodeReboot(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeRebootInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'reboot node');

    const validated = nodeRebootSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/status`, 'POST', {
      command: 'reboot',
    });

    let output = '🔄 **Node Reboot Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Node Reboot');
  }
}

/**
 * Wake a node via Wake-on-LAN.
 * Requires elevated permissions.
 */
export async function nodeWakeonlan(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeWakeonlanInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'wake node via WOL');

    const validated = nodeWakeonlanSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/wakeonlan`, 'POST');

    let output = '🌙 **Wake-on-LAN Issued**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Node Wake-on-LAN');
  }
}

/**
 * Get node replication job status.
 * No elevated permissions required.
 */
export async function getNodeReplicationStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeReplicationStatusInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeReplicationStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeId = validated.id;

    const status = (await client.request(
      `/nodes/${safeNode}/replication/${safeId}/status`
    )) as Record<string, unknown>;

    let output = '📊 **Replication Status**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Job ID**: ${safeId}\n`;
    for (const [key, value] of Object.entries(status)) {
      output += `• **${key}**: ${value}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Replication Status');
  }
}

/**
 * Get node replication job log.
 * No elevated permissions required.
 */
export async function getNodeReplicationLog(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeReplicationLogInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeReplicationLogSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeId = validated.id;

    const logEntries = (await client.request(
      `/nodes/${safeNode}/replication/${safeId}/log`
    )) as Array<Record<string, unknown>>;

    if (logEntries.length === 0) {
      return formatToolResponse('No replication log entries found.');
    }

    let output = '📋 **Replication Log**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Job ID**: ${safeId}\n`;
    output += `• **Entries**: ${logEntries.length}\n\n`;
    for (const entry of logEntries) {
      output += `• ${JSON.stringify(entry)}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Replication Log');
  }
}

/**
 * Schedule immediate node replication.
 * Requires elevated permissions.
 */
export async function scheduleNodeReplication(
  client: ProxmoxApiClient,
  config: Config,
  input: ScheduleNodeReplicationInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'schedule node replication');

    const validated = scheduleNodeReplicationSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeId = validated.id;

    const result = await client.request(
      `/nodes/${safeNode}/replication/${safeId}/schedule_now`,
      'POST'
    );

    let output = '⏱️ **Replication Scheduled**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Job ID**: ${safeId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Schedule Node Replication');
  }
}

export async function handleNodeConfig(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeConfigToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'get_time':
      return getNodeTime(client, config, { node: input.node });
    case 'set_time':
      return updateNodeTime(client, config, { node: input.node, time: input.time, timezone: input.timezone });
    case 'set_dns':
      return updateNodeDns(client, config, { node: input.node, search: input.search, dns1: input.dns1, dns2: input.dns2, dns3: input.dns3, delete: input.delete });
    case 'get_hosts':
      return getNodeHosts(client, config, { node: input.node });
    case 'set_hosts':
      return updateNodeHosts(client, config, { node: input.node, ip: input.ip, name: input.name, comment: input.comment, digest: input.digest });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Config');
  }
}

export async function handleNodeSubscription(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeSubscriptionToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'get':
      return getNodeSubscription(client, config, { node: input.node });
    case 'set':
      return setNodeSubscription(client, config, { node: input.node, key: input.key });
    case 'delete':
      return deleteNodeSubscription(client, config, { node: input.node });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Subscription');
  }
}

export async function handleApt(
  client: ProxmoxApiClient,
  config: Config,
  input: AptToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'update':
      return aptUpdate(client, config, { node: input.node });
    case 'upgrade':
      return aptUpgrade(client, config, { node: input.node });
    case 'versions':
      return aptVersions(client, config, { node: input.node, package: input.package });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'APT');
  }
}

export async function handleNodeBulk(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeBulkToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'start_all':
      return startAll(client, config, { node: input.node });
    case 'stop_all':
      return stopAll(client, config, { node: input.node });
    case 'migrate_all':
      return migrateAll(client, config, { node: input.node, target: input.target, maxworkers: input.maxworkers, 'with-local-disks': input['with-local-disks'] });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Bulk');
  }
}

export async function handleNodePower(
  client: ProxmoxApiClient,
  config: Config,
  input: NodePowerToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'shutdown':
      return nodeShutdown(client, config, { node: input.node });
    case 'reboot':
      return nodeReboot(client, config, { node: input.node });
    case 'wakeonlan':
      return nodeWakeonlan(client, config, { node: input.node });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Power');
  }
}

export async function handleNodeReplication(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeReplicationToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'status':
      return getNodeReplicationStatus(client, config, { node: input.node, id: input.id });
    case 'log':
      return getNodeReplicationLog(client, config, { node: input.node, id: input.id });
    case 'schedule':
      return scheduleNodeReplication(client, config, { node: input.node, id: input.id });
    default:
      return formatErrorResponse(new Error(`Unknown action: ${(input as any).action}`), 'Node Replication');
  }
}
