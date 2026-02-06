import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type { ProxmoxPool, ProxmoxPoolMember } from '../types/proxmox.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  listPoolsSchema,
  getPoolSchema,
  createPoolSchema,
  updatePoolSchema,
  deletePoolSchema,
} from '../schemas/pool-management.js';
import type {
  ListPoolsInput,
  GetPoolInput,
  CreatePoolInput,
  UpdatePoolInput,
  DeletePoolInput,
} from '../schemas/pool-management.js';

function formatPoolMembers(members?: ProxmoxPoolMember[]): string {
  if (!members || members.length === 0) return 'No members assigned.';

  return members
    .map((member) => {
      let line = `• **${member.id}** (${member.type})`;
      if (member.node) line += ` - node: ${member.node}`;
      if (member.vmid !== undefined) line += ` - vmid: ${member.vmid}`;
      if (member.storage) line += ` - storage: ${member.storage}`;
      if (member.status) line += ` - status: ${member.status}`;
      return line;
    })
    .join('\n');
}

/**
 * List resource pools.
 */
export async function listPools(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListPoolsInput
): Promise<ToolResponse> {
  try {
    listPoolsSchema.parse(input);
    const pools = (await client.request('/pools')) as ProxmoxPool[];

    let output = '🏊 **Pools**\n\n';

    if (!pools || pools.length === 0) {
      output += 'No pools found.';
      return formatToolResponse(output);
    }

    for (const pool of pools) {
      const name = pool.poolid ?? 'unknown';
      output += `• **${name}**`;
      if (pool.comment) output += ` - ${pool.comment}`;
      if (pool.members) output += ` - members: ${pool.members.length}`;
      output += '\n';
    }

    output += `\n**Total**: ${pools.length} pool(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Pools');
  }
}

/**
 * Get pool details by pool ID.
 */
export async function getPool(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetPoolInput
): Promise<ToolResponse> {
  try {
    const validated = getPoolSchema.parse(input);
    const safePool = validated.poolid;
    const pool = (await client.request(
      `/pools/${encodeURIComponent(safePool)}`
    )) as ProxmoxPool;

    let output = '🏊 **Pool Details**\n\n';
    output += `• **Pool**: ${safePool}\n`;
    if (pool.comment) output += `• **Comment**: ${pool.comment}\n`;
    output += '\n**Members**\n';
    output += formatPoolMembers(pool.members);

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Pool');
  }
}

/**
 * Create a new pool.
 */
export async function createPool(
  client: ProxmoxApiClient,
  config: Config,
  input: CreatePoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create pool');

    const validated = createPoolSchema.parse(input);
    const payload: Record<string, unknown> = {
      poolid: validated.poolid,
    };

    if (validated.comment) payload.comment = validated.comment;

    const result = await client.request('/pools', 'POST', payload);

    let output = '✅ **Pool Created**\n\n';
    output += `• **Pool**: ${validated.poolid}\n`;
    if (validated.comment) output += `• **Comment**: ${validated.comment}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Pool');
  }
}

/**
 * Update pool settings.
 */
export async function updatePool(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdatePoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update pool');

    const validated = updatePoolSchema.parse(input);
    const safePool = validated.poolid;
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/pools/${encodeURIComponent(safePool)}`,
      'PUT',
      payload
    );

    let output = '✅ **Pool Updated**\n\n';
    output += `• **Pool**: ${safePool}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Pool');
  }
}

/**
 * Delete a pool.
 */
export async function deletePool(
  client: ProxmoxApiClient,
  config: Config,
  input: DeletePoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete pool');

    const validated = deletePoolSchema.parse(input);
    const safePool = validated.poolid;
    const result = await client.request(
      `/pools/${encodeURIComponent(safePool)}`,
      'DELETE'
    );

    let output = '🗑️  **Pool Deleted**\n\n';
    output += `• **Pool**: ${safePool}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Pool');
  }
}
