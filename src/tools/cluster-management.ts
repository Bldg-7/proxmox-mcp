import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type {
  ProxmoxHaResource,
  ProxmoxHaGroup,
  ProxmoxFirewallRule,
  ProxmoxFirewallGroup,
  ProxmoxBackupJob,
  ProxmoxReplicationJob,
} from '../types/proxmox.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  validateHaResourceId,
  validateHaGroupId,
  validateFirewallGroupName,
  validateFirewallRulePos,
  validateBackupJobId,
  validateReplicationJobId,
} from '../validators/index.js';
import {
  getHaResourcesSchema,
  getHaResourceSchema,
  createHaResourceSchema,
  updateHaResourceSchema,
  deleteHaResourceSchema,
  getHaGroupsSchema,
  getHaGroupSchema,
  createHaGroupSchema,
  updateHaGroupSchema,
  deleteHaGroupSchema,
  getHaStatusSchema,
  listClusterFirewallRulesSchema,
  getClusterFirewallRuleSchema,
  createClusterFirewallRuleSchema,
  updateClusterFirewallRuleSchema,
  deleteClusterFirewallRuleSchema,
  listClusterFirewallGroupsSchema,
  getClusterFirewallGroupSchema,
  createClusterFirewallGroupSchema,
  updateClusterFirewallGroupSchema,
  deleteClusterFirewallGroupSchema,
  listClusterBackupJobsSchema,
  getClusterBackupJobSchema,
  createClusterBackupJobSchema,
  updateClusterBackupJobSchema,
  deleteClusterBackupJobSchema,
  listClusterReplicationJobsSchema,
  getClusterReplicationJobSchema,
  createClusterReplicationJobSchema,
  updateClusterReplicationJobSchema,
  deleteClusterReplicationJobSchema,
  getClusterOptionsSchema,
  updateClusterOptionsSchema,
} from '../schemas/cluster-management.js';
import type {
  GetHaResourcesInput,
  GetHaResourceInput,
  CreateHaResourceInput,
  UpdateHaResourceInput,
  DeleteHaResourceInput,
  GetHaGroupsInput,
  GetHaGroupInput,
  CreateHaGroupInput,
  UpdateHaGroupInput,
  DeleteHaGroupInput,
  GetHaStatusInput,
  ListClusterFirewallRulesInput,
  GetClusterFirewallRuleInput,
  CreateClusterFirewallRuleInput,
  UpdateClusterFirewallRuleInput,
  DeleteClusterFirewallRuleInput,
  ListClusterFirewallGroupsInput,
  GetClusterFirewallGroupInput,
  CreateClusterFirewallGroupInput,
  UpdateClusterFirewallGroupInput,
  DeleteClusterFirewallGroupInput,
  ListClusterBackupJobsInput,
  GetClusterBackupJobInput,
  CreateClusterBackupJobInput,
  UpdateClusterBackupJobInput,
  DeleteClusterBackupJobInput,
  ListClusterReplicationJobsInput,
  GetClusterReplicationJobInput,
  CreateClusterReplicationJobInput,
  UpdateClusterReplicationJobInput,
  DeleteClusterReplicationJobInput,
  GetClusterOptionsInput,
  UpdateClusterOptionsInput,
} from '../schemas/cluster-management.js';

/**
 * List HA resources.
 */
export async function getHaResources(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetHaResourcesInput
): Promise<ToolResponse> {
  try {
    const validated = getHaResourcesSchema.parse(input);
    const typeFilter = validated.type ? `?type=${encodeURIComponent(validated.type)}` : '';
    const resources = (await client.request(
      `/cluster/ha/resources${typeFilter}`
    )) as ProxmoxHaResource[];

    let output = '🧩 **HA Resources**\n\n';

    if (!resources || resources.length === 0) {
      output += 'No HA resources found.';
      return formatToolResponse(output);
    }

    for (const resource of resources) {
      const sid = resource.sid ?? 'unknown';
      const state = resource.state ?? 'unknown';
      const type = resource.type ?? 'n/a';
      output += `• **${sid}** (${type}) - ${state}`;
      if (resource.group) {
        output += ` [group: ${resource.group}]`;
      }
      if (resource.comment) {
        output += `\n  ${resource.comment}`;
      }
      output += '\n';
    }

    output += `\n**Total**: ${resources.length} resource(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get HA Resources');
  }
}

/**
 * Get HA resource by ID.
 */
export async function getHaResource(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetHaResourceInput
): Promise<ToolResponse> {
  try {
    const validated = getHaResourceSchema.parse(input);
    const safeSid = validateHaResourceId(validated.sid);
    const resource = (await client.request(
      `/cluster/ha/resources/${encodeURIComponent(safeSid)}`
    )) as ProxmoxHaResource;

    let output = '🧩 **HA Resource Details**\n\n';
    output += `• **ID**: ${safeSid}\n`;
    if (resource.type) output += `• **Type**: ${resource.type}\n`;
    if (resource.state) output += `• **State**: ${resource.state}\n`;
    if (resource.group) output += `• **Group**: ${resource.group}\n`;
    if (resource.comment) output += `• **Comment**: ${resource.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get HA Resource');
  }
}

/**
 * Create HA resource.
 */
export async function createHaResource(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateHaResourceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create HA resource');

    const validated = createHaResourceSchema.parse(input);
    const safeSid = validateHaResourceId(validated.sid);
    const payload: Record<string, unknown> = { sid: safeSid };

    if (validated.type) payload.type = validated.type;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.failback !== undefined) payload.failback = validated.failback;
    if (validated.group) payload.group = validateHaGroupId(validated.group);
    if (validated.max_relocate !== undefined) payload.max_relocate = validated.max_relocate;
    if (validated.max_restart !== undefined) payload.max_restart = validated.max_restart;
    if (validated.state) payload.state = validated.state;

    const result = await client.request('/cluster/ha/resources', 'POST', payload);

    let output = '✅ **HA Resource Created**\n\n';
    output += `• **ID**: ${safeSid}\n`;
    if (payload.type) output += `• **Type**: ${payload.type}\n`;
    if (payload.group) output += `• **Group**: ${payload.group}\n`;
    if (payload.state) output += `• **State**: ${payload.state}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create HA Resource');
  }
}

/**
 * Update HA resource.
 */
export async function updateHaResource(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateHaResourceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update HA resource');

    const validated = updateHaResourceSchema.parse(input);
    const safeSid = validateHaResourceId(validated.sid);
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.failback !== undefined) payload.failback = validated.failback;
    if (validated.group) payload.group = validateHaGroupId(validated.group);
    if (validated.max_relocate !== undefined) payload.max_relocate = validated.max_relocate;
    if (validated.max_restart !== undefined) payload.max_restart = validated.max_restart;
    if (validated.state) payload.state = validated.state;

    const result = await client.request(
      `/cluster/ha/resources/${encodeURIComponent(safeSid)}`,
      'PUT',
      payload
    );

    let output = '✅ **HA Resource Updated**\n\n';
    output += `• **ID**: ${safeSid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update HA Resource');
  }
}

/**
 * Delete HA resource.
 */
export async function deleteHaResource(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteHaResourceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete HA resource');

    const validated = deleteHaResourceSchema.parse(input);
    const safeSid = validateHaResourceId(validated.sid);
    const result = await client.request(
      `/cluster/ha/resources/${encodeURIComponent(safeSid)}`,
      'DELETE'
    );

    let output = '🗑️  **HA Resource Deleted**\n\n';
    output += `• **ID**: ${safeSid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete HA Resource');
  }
}

/**
 * List HA groups.
 */
export async function getHaGroups(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetHaGroupsInput
): Promise<ToolResponse> {
  try {
    getHaGroupsSchema.parse(input);
    const groups = (await client.request('/cluster/ha/groups')) as ProxmoxHaGroup[];

    let output = '🧩 **HA Groups**\n\n';

    if (!groups || groups.length === 0) {
      output += 'No HA groups found.';
      return formatToolResponse(output);
    }

    for (const group of groups) {
      const name = group.group ?? 'unknown';
      output += `• **${name}**`;
      if (group.nodes) output += ` - nodes: ${group.nodes}`;
      if (group.restricted !== undefined) output += ` (restricted: ${group.restricted ? 'yes' : 'no'})`;
      if (group.nofailback !== undefined) output += ` (nofailback: ${group.nofailback ? 'yes' : 'no'})`;
      if (group.comment) output += `\n  ${group.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${groups.length} group(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get HA Groups');
  }
}

/**
 * Get HA group by ID.
 */
export async function getHaGroup(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetHaGroupInput
): Promise<ToolResponse> {
  try {
    const validated = getHaGroupSchema.parse(input);
    const safeGroup = validateHaGroupId(validated.group);
    const group = (await client.request(
      `/cluster/ha/groups/${encodeURIComponent(safeGroup)}`
    )) as ProxmoxHaGroup;

    let output = '🧩 **HA Group Details**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    if (group.nodes) output += `• **Nodes**: ${group.nodes}\n`;
    if (group.restricted !== undefined) {
      output += `• **Restricted**: ${group.restricted ? 'yes' : 'no'}\n`;
    }
    if (group.nofailback !== undefined) {
      output += `• **No Failback**: ${group.nofailback ? 'yes' : 'no'}\n`;
    }
    if (group.comment) output += `• **Comment**: ${group.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get HA Group');
  }
}

/**
 * Create HA group.
 */
export async function createHaGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateHaGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create HA group');

    const validated = createHaGroupSchema.parse(input);
    const safeGroup = validateHaGroupId(validated.group);
    const payload: Record<string, unknown> = {
      group: safeGroup,
      nodes: validated.nodes,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.nofailback !== undefined) payload.nofailback = validated.nofailback;
    if (validated.restricted !== undefined) payload.restricted = validated.restricted;
    if (validated.type) payload.type = validated.type;

    const result = await client.request('/cluster/ha/groups', 'POST', payload);

    let output = '✅ **HA Group Created**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Nodes**: ${validated.nodes}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create HA Group');
  }
}

/**
 * Update HA group.
 */
export async function updateHaGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateHaGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update HA group');

    const validated = updateHaGroupSchema.parse(input);
    const safeGroup = validateHaGroupId(validated.group);
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.nodes) payload.nodes = validated.nodes;
    if (validated.nofailback !== undefined) payload.nofailback = validated.nofailback;
    if (validated.restricted !== undefined) payload.restricted = validated.restricted;

    const result = await client.request(
      `/cluster/ha/groups/${encodeURIComponent(safeGroup)}`,
      'PUT',
      payload
    );

    let output = '✅ **HA Group Updated**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update HA Group');
  }
}

/**
 * Delete HA group.
 */
export async function deleteHaGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteHaGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete HA group');

    const validated = deleteHaGroupSchema.parse(input);
    const safeGroup = validateHaGroupId(validated.group);
    const result = await client.request(
      `/cluster/ha/groups/${encodeURIComponent(safeGroup)}`,
      'DELETE'
    );

    let output = '🗑️  **HA Group Deleted**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete HA Group');
  }
}

/**
 * Get HA status.
 */
export async function getHaStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetHaStatusInput
): Promise<ToolResponse> {
  try {
    getHaStatusSchema.parse(input);
    const status = (await client.request('/cluster/ha/status')) as Record<string, unknown>;

    let output = '📊 **HA Status**\n\n';
    const entries = Object.entries(status ?? {});

    if (entries.length === 0) {
      output += 'No HA status data available.';
      return formatToolResponse(output);
    }

    for (const [key, value] of entries) {
      output += `• **${key}**: ${typeof value === 'string' ? value : JSON.stringify(value)}\n`;
    }

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get HA Status');
  }
}

/**
 * List cluster firewall rules.
 */
export async function listClusterFirewallRules(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListClusterFirewallRulesInput
): Promise<ToolResponse> {
  try {
    listClusterFirewallRulesSchema.parse(input);
    const rules = (await client.request('/cluster/firewall/rules')) as ProxmoxFirewallRule[];

    let output = '🛡️  **Cluster Firewall Rules**\n\n';

    if (!rules || rules.length === 0) {
      output += 'No firewall rules found.';
      return formatToolResponse(output);
    }

    for (const rule of rules) {
      output += `• **${rule.pos}** ${rule.type} ${rule.action}`;
      if (rule.proto) output += ` ${rule.proto}`;
      if (rule.source) output += ` src=${rule.source}`;
      if (rule.dest) output += ` dst=${rule.dest}`;
      if (rule.dport) output += ` dport=${rule.dport}`;
      if (rule.comment) output += `\n  ${rule.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${rules.length} rule(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Cluster Firewall Rules');
  }
}

/**
 * Get cluster firewall rule by position.
 */
export async function getClusterFirewallRule(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetClusterFirewallRuleInput
): Promise<ToolResponse> {
  try {
    const validated = getClusterFirewallRuleSchema.parse(input);
    const safePos = validateFirewallRulePos(validated.pos);
    const rule = (await client.request(
      `/cluster/firewall/rules/${safePos}`
    )) as ProxmoxFirewallRule;

    let output = '🛡️  **Cluster Firewall Rule**\n\n';
    output += `• **Position**: ${safePos}\n`;
    if (rule.type) output += `• **Type**: ${rule.type}\n`;
    if (rule.action) output += `• **Action**: ${rule.action}\n`;
    if (rule.proto) output += `• **Protocol**: ${rule.proto}\n`;
    if (rule.source) output += `• **Source**: ${rule.source}\n`;
    if (rule.dest) output += `• **Destination**: ${rule.dest}\n`;
    if (rule.dport) output += `• **Dest Port**: ${rule.dport}\n`;
    if (rule.comment) output += `• **Comment**: ${rule.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Firewall Rule');
  }
}

/**
 * Create cluster firewall rule.
 */
export async function createClusterFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateClusterFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create cluster firewall rule');

    const validated = createClusterFirewallRuleSchema.parse(input);
    const payload: Record<string, unknown> = {
      action: validated.action,
      type: validated.type,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.pos !== undefined) payload.pos = validateFirewallRulePos(validated.pos);
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;

    const result = await client.request('/cluster/firewall/rules', 'POST', payload);

    let output = '✅ **Cluster Firewall Rule Created**\n\n';
    output += `• **Action**: ${validated.action}\n`;
    output += `• **Type**: ${validated.type}\n`;
    if (payload.pos !== undefined) output += `• **Position**: ${payload.pos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Cluster Firewall Rule');
  }
}

/**
 * Update cluster firewall rule.
 */
export async function updateClusterFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateClusterFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update cluster firewall rule');

    const validated = updateClusterFirewallRuleSchema.parse(input);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload: Record<string, unknown> = {};

    if (validated.action) payload.action = validated.action;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.moveto !== undefined) payload.moveto = validated.moveto;
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;
    if (validated.type) payload.type = validated.type;

    const result = await client.request(
      `/cluster/firewall/rules/${safePos}`,
      'PUT',
      payload
    );

    let output = '✅ **Cluster Firewall Rule Updated**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Cluster Firewall Rule');
  }
}

/**
 * Delete cluster firewall rule.
 */
export async function deleteClusterFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteClusterFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete cluster firewall rule');

    const validated = deleteClusterFirewallRuleSchema.parse(input);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload = validated.digest ? { digest: validated.digest } : undefined;

    const result = await client.request(
      `/cluster/firewall/rules/${safePos}`,
      'DELETE',
      payload
    );

    let output = '🗑️  **Cluster Firewall Rule Deleted**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Cluster Firewall Rule');
  }
}

/**
 * List cluster firewall groups.
 */
export async function listClusterFirewallGroups(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListClusterFirewallGroupsInput
): Promise<ToolResponse> {
  try {
    listClusterFirewallGroupsSchema.parse(input);
    const groups = (await client.request('/cluster/firewall/groups')) as ProxmoxFirewallGroup[];

    let output = '🛡️  **Cluster Firewall Groups**\n\n';

    if (!groups || groups.length === 0) {
      output += 'No firewall groups found.';
      return formatToolResponse(output);
    }

    for (const group of groups) {
      const name = group.group ?? 'unknown';
      output += `• **${name}**`;
      if (group.comment) output += ` - ${group.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${groups.length} group(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Cluster Firewall Groups');
  }
}

/**
 * Get cluster firewall group.
 */
export async function getClusterFirewallGroup(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetClusterFirewallGroupInput
): Promise<ToolResponse> {
  try {
    const validated = getClusterFirewallGroupSchema.parse(input);
    const safeGroup = validateFirewallGroupName(validated.group);
    const group = (await client.request(
      `/cluster/firewall/groups/${encodeURIComponent(safeGroup)}`
    )) as ProxmoxFirewallGroup;

    let output = '🛡️  **Cluster Firewall Group**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    if (group.comment) output += `• **Comment**: ${group.comment}\n`;
    if (group.digest) output += `• **Digest**: ${group.digest}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Firewall Group');
  }
}

/**
 * Create cluster firewall group.
 */
export async function createClusterFirewallGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateClusterFirewallGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create cluster firewall group');

    const validated = createClusterFirewallGroupSchema.parse(input);
    const safeGroup = validateFirewallGroupName(validated.group);
    const payload: Record<string, unknown> = { group: safeGroup };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.rename) payload.rename = validateFirewallGroupName(validated.rename);

    const result = await client.request('/cluster/firewall/groups', 'POST', payload);

    let output = '✅ **Cluster Firewall Group Created**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Cluster Firewall Group');
  }
}

/**
 * Update cluster firewall group.
 */
export async function updateClusterFirewallGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateClusterFirewallGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update cluster firewall group');

    const validated = updateClusterFirewallGroupSchema.parse(input);
    const safeGroup = validateFirewallGroupName(validated.group);
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.rename) payload.rename = validateFirewallGroupName(validated.rename);
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/cluster/firewall/groups/${encodeURIComponent(safeGroup)}`,
      'PUT',
      payload
    );

    let output = '✅ **Cluster Firewall Group Updated**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Cluster Firewall Group');
  }
}

/**
 * Delete cluster firewall group.
 */
export async function deleteClusterFirewallGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteClusterFirewallGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete cluster firewall group');

    const validated = deleteClusterFirewallGroupSchema.parse(input);
    const safeGroup = validateFirewallGroupName(validated.group);
    const result = await client.request(
      `/cluster/firewall/groups/${encodeURIComponent(safeGroup)}`,
      'DELETE'
    );

    let output = '🗑️  **Cluster Firewall Group Deleted**\n\n';
    output += `• **Group**: ${safeGroup}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Cluster Firewall Group');
  }
}

/**
 * List cluster backup jobs.
 */
export async function listClusterBackupJobs(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListClusterBackupJobsInput
): Promise<ToolResponse> {
  try {
    listClusterBackupJobsSchema.parse(input);
    const jobs = (await client.request('/cluster/backup')) as ProxmoxBackupJob[];

    let output = '🗄️  **Cluster Backup Jobs**\n\n';

    if (!jobs || jobs.length === 0) {
      output += 'No backup jobs found.';
      return formatToolResponse(output);
    }

    for (const job of jobs) {
      const id = job.id ?? 'unknown';
      output += `• **${id}**`;
      if (job.storage) output += ` - storage: ${job.storage}`;
      if (job.starttime && job.dow) output += ` (schedule: ${job.dow} @ ${job.starttime})`;
      if (job.enabled !== undefined) output += ` (enabled: ${job.enabled ? 'yes' : 'no'})`;
      if (job.comment) output += `\n  ${job.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${jobs.length} job(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Cluster Backup Jobs');
  }
}

/**
 * Get cluster backup job.
 */
export async function getClusterBackupJob(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetClusterBackupJobInput
): Promise<ToolResponse> {
  try {
    const validated = getClusterBackupJobSchema.parse(input);
    const safeId = validateBackupJobId(validated.id);
    const job = (await client.request(
      `/cluster/backup/${encodeURIComponent(safeId)}`
    )) as ProxmoxBackupJob;

    let output = '🗄️  **Cluster Backup Job**\n\n';
    output += `• **ID**: ${safeId}\n`;
    if (job.storage) output += `• **Storage**: ${job.storage}\n`;
    if (job.starttime) output += `• **Start Time**: ${job.starttime}\n`;
    if (job.dow) output += `• **Days**: ${job.dow}\n`;
    if (job.enabled !== undefined) output += `• **Enabled**: ${job.enabled ? 'yes' : 'no'}\n`;
    if (job.comment) output += `• **Comment**: ${job.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Backup Job');
  }
}

/**
 * Create cluster backup job.
 */
export async function createClusterBackupJob(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateClusterBackupJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create cluster backup job');

    const validated = createClusterBackupJobSchema.parse(input);
    const payload: Record<string, unknown> = {
      starttime: validated.starttime,
      dow: validated.dow,
      storage: validated.storage,
    };

    if (validated.all !== undefined) payload.all = validated.all;
    if (validated.bwlimit !== undefined) payload.bwlimit = validated.bwlimit;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.compress) payload.compress = validated.compress;
    if (validated.dumpdir) payload.dumpdir = validated.dumpdir;
    if (validated.enabled !== undefined) payload.enabled = validated.enabled;
    if (validated.exclude) payload.exclude = validated.exclude;
    if (validated['exclude-path']) payload['exclude-path'] = validated['exclude-path'];
    if (validated.id) payload.id = validateBackupJobId(validated.id);
    if (validated.ionice !== undefined) payload.ionice = validated.ionice;
    if (validated.lockwait !== undefined) payload.lockwait = validated.lockwait;
    if (validated.mailnotification) payload.mailnotification = validated.mailnotification;
    if (validated.mailto) payload.mailto = validated.mailto;
    if (validated.maxfiles !== undefined) payload.maxfiles = validated.maxfiles;
    if (validated.mode) payload.mode = validated.mode;
    if (validated.node) payload.node = validated.node;
    if (validated['notes-template']) payload['notes-template'] = validated['notes-template'];
    if (validated.performance) payload.performance = validated.performance;
    if (validated.pigz !== undefined) payload.pigz = validated.pigz;
    if (validated.pool) payload.pool = validated.pool;
    if (validated.protected !== undefined) payload.protected = validated.protected;
    if (validated['prune-backups']) payload['prune-backups'] = validated['prune-backups'];
    if (validated.quiet !== undefined) payload.quiet = validated.quiet;
    if (validated.remove !== undefined) payload.remove = validated.remove;
    if (validated['repeat-missed'] !== undefined) {
      payload['repeat-missed'] = validated['repeat-missed'];
    }
    if (validated.script) payload.script = validated.script;
    if (validated.stdexcludes !== undefined) payload.stdexcludes = validated.stdexcludes;
    if (validated.stop !== undefined) payload.stop = validated.stop;
    if (validated.stopwait !== undefined) payload.stopwait = validated.stopwait;
    if (validated.tmpdir) payload.tmpdir = validated.tmpdir;
    if (validated.vmid) payload.vmid = validated.vmid;
    if (validated.zstd !== undefined) payload.zstd = validated.zstd;

    const result = await client.request('/cluster/backup', 'POST', payload);

    let output = '✅ **Cluster Backup Job Created**\n\n';
    output += `• **Storage**: ${validated.storage}\n`;
    output += `• **Schedule**: ${validated.dow} @ ${validated.starttime}\n`;
    if (payload.id) output += `• **ID**: ${payload.id}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Cluster Backup Job');
  }
}

/**
 * Update cluster backup job.
 */
export async function updateClusterBackupJob(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateClusterBackupJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update cluster backup job');

    const validated = updateClusterBackupJobSchema.parse(input);
    const safeId = validateBackupJobId(validated.id);
    const payload: Record<string, unknown> = {};

    if (validated.starttime) payload.starttime = validated.starttime;
    if (validated.dow) payload.dow = validated.dow;
    if (validated.storage) payload.storage = validated.storage;
    if (validated.all !== undefined) payload.all = validated.all;
    if (validated.bwlimit !== undefined) payload.bwlimit = validated.bwlimit;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.compress) payload.compress = validated.compress;
    if (validated.dumpdir) payload.dumpdir = validated.dumpdir;
    if (validated.enabled !== undefined) payload.enabled = validated.enabled;
    if (validated.exclude) payload.exclude = validated.exclude;
    if (validated['exclude-path']) payload['exclude-path'] = validated['exclude-path'];
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.ionice !== undefined) payload.ionice = validated.ionice;
    if (validated.lockwait !== undefined) payload.lockwait = validated.lockwait;
    if (validated.mailnotification) payload.mailnotification = validated.mailnotification;
    if (validated.mailto) payload.mailto = validated.mailto;
    if (validated.maxfiles !== undefined) payload.maxfiles = validated.maxfiles;
    if (validated.mode) payload.mode = validated.mode;
    if (validated.node) payload.node = validated.node;
    if (validated['notes-template']) payload['notes-template'] = validated['notes-template'];
    if (validated.performance) payload.performance = validated.performance;
    if (validated.pigz !== undefined) payload.pigz = validated.pigz;
    if (validated.pool) payload.pool = validated.pool;
    if (validated.protected !== undefined) payload.protected = validated.protected;
    if (validated['prune-backups']) payload['prune-backups'] = validated['prune-backups'];
    if (validated.quiet !== undefined) payload.quiet = validated.quiet;
    if (validated.remove !== undefined) payload.remove = validated.remove;
    if (validated['repeat-missed'] !== undefined) {
      payload['repeat-missed'] = validated['repeat-missed'];
    }
    if (validated.script) payload.script = validated.script;
    if (validated.stdexcludes !== undefined) payload.stdexcludes = validated.stdexcludes;
    if (validated.stop !== undefined) payload.stop = validated.stop;
    if (validated.stopwait !== undefined) payload.stopwait = validated.stopwait;
    if (validated.tmpdir) payload.tmpdir = validated.tmpdir;
    if (validated.vmid) payload.vmid = validated.vmid;
    if (validated.zstd !== undefined) payload.zstd = validated.zstd;

    const result = await client.request(
      `/cluster/backup/${encodeURIComponent(safeId)}`,
      'PUT',
      payload
    );

    let output = '✅ **Cluster Backup Job Updated**\n\n';
    output += `• **ID**: ${safeId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Cluster Backup Job');
  }
}

/**
 * Delete cluster backup job.
 */
export async function deleteClusterBackupJob(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteClusterBackupJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete cluster backup job');

    const validated = deleteClusterBackupJobSchema.parse(input);
    const safeId = validateBackupJobId(validated.id);
    const result = await client.request(
      `/cluster/backup/${encodeURIComponent(safeId)}`,
      'DELETE'
    );

    let output = '🗑️  **Cluster Backup Job Deleted**\n\n';
    output += `• **ID**: ${safeId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Cluster Backup Job');
  }
}

/**
 * List cluster replication jobs.
 */
export async function listClusterReplicationJobs(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListClusterReplicationJobsInput
): Promise<ToolResponse> {
  try {
    listClusterReplicationJobsSchema.parse(input);
    const jobs = (await client.request('/cluster/replication')) as ProxmoxReplicationJob[];

    let output = '🔁 **Cluster Replication Jobs**\n\n';

    if (!jobs || jobs.length === 0) {
      output += 'No replication jobs found.';
      return formatToolResponse(output);
    }

    for (const job of jobs) {
      const id = job.id ?? 'unknown';
      output += `• **${id}**`;
      if (job.target) output += ` - target: ${job.target}`;
      if (job.schedule) output += ` (schedule: ${job.schedule})`;
      if (job.disable !== undefined) output += ` (enabled: ${job.disable ? 'no' : 'yes'})`;
      if (job.comment) output += `\n  ${job.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${jobs.length} job(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Cluster Replication Jobs');
  }
}

/**
 * Get cluster replication job.
 */
export async function getClusterReplicationJob(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetClusterReplicationJobInput
): Promise<ToolResponse> {
  try {
    const validated = getClusterReplicationJobSchema.parse(input);
    const safeId = validateReplicationJobId(validated.id);
    const job = (await client.request(
      `/cluster/replication/${encodeURIComponent(safeId)}`
    )) as ProxmoxReplicationJob;

    let output = '🔁 **Cluster Replication Job**\n\n';
    output += `• **ID**: ${safeId}\n`;
    if (job.guest !== undefined) output += `• **Guest**: ${job.guest}\n`;
    if (job.target) output += `• **Target**: ${job.target}\n`;
    if (job.schedule) output += `• **Schedule**: ${job.schedule}\n`;
    if (job.disable !== undefined) output += `• **Enabled**: ${job.disable ? 'no' : 'yes'}\n`;
    if (job.comment) output += `• **Comment**: ${job.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Replication Job');
  }
}

/**
 * Create cluster replication job.
 */
export async function createClusterReplicationJob(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateClusterReplicationJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create cluster replication job');

    const validated = createClusterReplicationJobSchema.parse(input);
    const safeId = validateReplicationJobId(validated.id);
    const payload: Record<string, unknown> = {
      id: safeId,
      target: validated.target,
      type: validated.type,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.disable !== undefined) payload.disable = validated.disable;
    if (validated.rate !== undefined) payload.rate = validated.rate;
    if (validated.remove_job) payload.remove_job = validated.remove_job;
    if (validated.schedule) payload.schedule = validated.schedule;
    if (validated.source) payload.source = validated.source;

    const result = await client.request('/cluster/replication', 'POST', payload);

    let output = '✅ **Cluster Replication Job Created**\n\n';
    output += `• **ID**: ${safeId}\n`;
    output += `• **Target**: ${validated.target}\n`;
    output += `• **Type**: ${validated.type}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Cluster Replication Job');
  }
}

/**
 * Update cluster replication job.
 */
export async function updateClusterReplicationJob(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateClusterReplicationJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update cluster replication job');

    const validated = updateClusterReplicationJobSchema.parse(input);
    const safeId = validateReplicationJobId(validated.id);
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.disable !== undefined) payload.disable = validated.disable;
    if (validated.rate !== undefined) payload.rate = validated.rate;
    if (validated.remove_job) payload.remove_job = validated.remove_job;
    if (validated.schedule) payload.schedule = validated.schedule;
    if (validated.source) payload.source = validated.source;

    const result = await client.request(
      `/cluster/replication/${encodeURIComponent(safeId)}`,
      'PUT',
      payload
    );

    let output = '✅ **Cluster Replication Job Updated**\n\n';
    output += `• **ID**: ${safeId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Cluster Replication Job');
  }
}

/**
 * Delete cluster replication job.
 */
export async function deleteClusterReplicationJob(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteClusterReplicationJobInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete cluster replication job');

    const validated = deleteClusterReplicationJobSchema.parse(input);
    const safeId = validateReplicationJobId(validated.id);
    const payload: Record<string, unknown> = {};
    if (validated.force !== undefined) payload.force = validated.force;
    if (validated.keep !== undefined) payload.keep = validated.keep;

    const result = await client.request(
      `/cluster/replication/${encodeURIComponent(safeId)}`,
      'DELETE',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '🗑️  **Cluster Replication Job Deleted**\n\n';
    output += `• **ID**: ${safeId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Cluster Replication Job');
  }
}

/**
 * Get cluster options.
 */
export async function getClusterOptions(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetClusterOptionsInput
): Promise<ToolResponse> {
  try {
    getClusterOptionsSchema.parse(input);
    const options = (await client.request('/cluster/options')) as Record<string, unknown>;

    let output = '⚙️  **Cluster Options**\n\n';
    const entries = Object.entries(options ?? {});

    if (entries.length === 0) {
      output += 'No cluster options found.';
      return formatToolResponse(output);
    }

    for (const [key, value] of entries) {
      output += `• **${key}**: ${typeof value === 'string' ? value : JSON.stringify(value)}\n`;
    }

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cluster Options');
  }
}

/**
 * Update cluster options.
 */
export async function updateClusterOptions(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateClusterOptionsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update cluster options');

    const validated = updateClusterOptionsSchema.parse(input);
    const result = await client.request('/cluster/options', 'PUT', validated);

    let output = '✅ **Cluster Options Updated**\n\n';
    output += `• **Updated Keys**: ${Object.keys(validated).join(', ') || 'none'}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Cluster Options');
  }
}
