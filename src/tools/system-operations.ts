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
