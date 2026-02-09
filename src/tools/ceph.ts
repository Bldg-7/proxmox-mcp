import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName } from '../validators/index.js';
import {
  getCephStatusSchema,
  listCephOsdsSchema,
  createCephOsdSchema,
  deleteCephOsdSchema,
  listCephMonsSchema,
  createCephMonSchema,
  deleteCephMonSchema,
  listCephMdsSchema,
  createCephMdsSchema,
  deleteCephMdsSchema,
  listCephPoolsSchema,
  createCephPoolSchema,
  updateCephPoolSchema,
  deleteCephPoolSchema,
  listCephFsSchema,
  createCephFsSchema,
} from '../schemas/ceph.js';
import type {
  GetCephStatusInput,
  ListCephOsdsInput,
  CreateCephOsdInput,
  DeleteCephOsdInput,
  ListCephMonsInput,
  CreateCephMonInput,
  DeleteCephMonInput,
  ListCephMdsInput,
  CreateCephMdsInput,
  DeleteCephMdsInput,
  ListCephPoolsInput,
  CreateCephPoolInput,
  UpdateCephPoolInput,
  DeleteCephPoolInput,
  ListCephFsInput,
  CreateCephFsInput,
  CephToolInput,
} from '../schemas/ceph.js';

function validateCephIdentifier(value: string, label: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
    throw new Error(
      `${label} contains invalid characters. Only alphanumeric, dots, hyphens, and underscores allowed`
    );
  }

  if (value.length > 128) {
    throw new Error(`${label} is too long (max 128 characters)`);
  }

  return value;
}

function formatOptionalNumber(value: unknown): string | undefined {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

/**
 * Get Ceph cluster status.
 */
export async function getCephStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetCephStatusInput
): Promise<ToolResponse> {
  try {
    const validated = getCephStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const status = (await client.request(`/nodes/${safeNode}/ceph/status`)) as Record<
      string,
      any
    >;

    const health =
      status?.health?.status ?? status?.health?.overall_status ?? status?.health ?? status?.status;
    const fsid = status?.fsid;
    const mons = status?.monmap?.mons ?? status?.monmap?.num_mons ?? status?.monmap?.mon_count;
    const osds = status?.osdmap?.num_osds ?? status?.osdmap?.osd_count;
    const pgs = status?.pgmap?.num_pgs ?? status?.pgmap?.pgs;

    let output = '🧱 **Ceph Status**\n\n';
    if (health) output += `• **Health**: ${health}\n`;
    if (fsid) output += `• **FSID**: ${fsid}\n`;
    if (mons !== undefined) output += `• **Mons**: ${mons}\n`;
    if (osds !== undefined) output += `• **OSDs**: ${osds}\n`;
    if (pgs !== undefined) output += `• **PGs**: ${pgs}\n`;

    if (!health && !fsid && mons === undefined && osds === undefined && pgs === undefined) {
      output += 'No status details reported.';
    }

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Ceph Status');
  }
}

/**
 * List Ceph OSDs.
 */
export async function listCephOsds(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListCephOsdsInput
): Promise<ToolResponse> {
  try {
    const validated = listCephOsdsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const osds = (await client.request(`/nodes/${safeNode}/ceph/osd`)) as Array<
      Record<string, unknown>
    >;

    let output = '🧱 **Ceph OSDs**\n\n';
    if (!osds || osds.length === 0) {
      output += 'No OSDs found.';
      return formatToolResponse(output);
    }

    for (const osd of osds) {
      const id = formatOptionalNumber(osd.id ?? osd.osd ?? osd.osd_id) ?? 'unknown';
      const up = osd.up ?? osd.state ?? osd.up_in;
      const inState = osd.in ?? osd.in_state ?? osd.in_out;
      const host = osd.host ?? osd.node;
      let line = `• **osd.${id}**`;
      if (up !== undefined || inState !== undefined) {
        const upLabel = typeof up === 'string' ? up : up ? 'up' : 'down';
        const inLabel =
          typeof inState === 'string' ? inState : inState ? 'in' : 'out';
        line += ` - ${upLabel}/${inLabel}`;
      }
      if (host) line += ` - host: ${host}`;
      output += `${line}\n`;
    }

    output += `\n**Total**: ${osds.length} OSD(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Ceph OSDs');
  }
}

/**
 * Create Ceph OSD.
 */
export async function createCephOsd(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateCephOsdInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ceph osd');

    const validated = createCephOsdSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const payload: Record<string, unknown> = {
      dev: validated.dev,
    };

    if (validated.osdid !== undefined) payload.osdid = validated.osdid;
    if (validated.dbdev) payload.dbdev = validated.dbdev;
    if (validated.waldev) payload.waldev = validated.waldev;
    if (validated['crush-device-class']) {
      payload['crush-device-class'] = validated['crush-device-class'];
    }
    if (validated.encrypted !== undefined) payload.encrypted = validated.encrypted;

    const result = await client.request(`/nodes/${safeNode}/ceph/osd`, 'POST', payload);

    let output = '✅ **Ceph OSD Creation Started**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Device**: ${validated.dev}\n`;
    if (validated.osdid !== undefined) output += `• **OSD ID**: ${validated.osdid}\n`;
    output += `• **Task ID**: ${result ?? 'N/A'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Ceph OSD');
  }
}

/**
 * Delete Ceph OSD.
 */
export async function deleteCephOsd(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteCephOsdInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete ceph osd');

    const validated = deleteCephOsdSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const osdId = validated.id.toString();
    const result = await client.request(
      `/nodes/${safeNode}/ceph/osd/${encodeURIComponent(osdId)}`,
      'DELETE'
    );

    let output = '🗑️  **Ceph OSD Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **OSD ID**: ${osdId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Ceph OSD');
  }
}

/**
 * List Ceph monitors.
 */
export async function listCephMons(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListCephMonsInput
): Promise<ToolResponse> {
  try {
    const validated = listCephMonsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const mons = (await client.request(`/nodes/${safeNode}/ceph/mon`)) as Array<
      Record<string, unknown>
    >;

    let output = '🧭 **Ceph Monitors**\n\n';
    if (!mons || mons.length === 0) {
      output += 'No monitors found.';
      return formatToolResponse(output);
    }

    for (const mon of mons) {
      const name =
        (mon.name ?? mon.mon ?? mon.monid ?? mon.id ?? 'unknown').toString();
      const rank = formatOptionalNumber(mon.rank ?? mon.rank_num);
      const addr = mon.addr ?? mon.address;
      const quorum = mon.quorum;
      let line = `• **${name}**`;
      if (rank) line += ` - rank: ${rank}`;
      if (addr) line += ` - addr: ${addr}`;
      if (quorum !== undefined) line += ` - quorum: ${quorum ? 'yes' : 'no'}`;
      output += `${line}\n`;
    }

    output += `\n**Total**: ${mons.length} monitor(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Ceph Monitors');
  }
}

/**
 * Create Ceph monitor.
 */
export async function createCephMon(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateCephMonInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ceph mon');

    const validated = createCephMonSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeMonId = validateCephIdentifier(validated.monid, 'Monitor ID');
    const result = await client.request(`/nodes/${safeNode}/ceph/mon`, 'POST', {
      monid: safeMonId,
    });

    let output = '✅ **Ceph Monitor Created**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Monitor**: ${safeMonId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Ceph Monitor');
  }
}

/**
 * Delete Ceph monitor.
 */
export async function deleteCephMon(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteCephMonInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete ceph mon');

    const validated = deleteCephMonSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeMonId = validateCephIdentifier(validated.monid, 'Monitor ID');
    const result = await client.request(
      `/nodes/${safeNode}/ceph/mon/${encodeURIComponent(safeMonId)}`,
      'DELETE'
    );

    let output = '🗑️  **Ceph Monitor Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Monitor**: ${safeMonId}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Ceph Monitor');
  }
}

/**
 * List Ceph MDS daemons.
 */
export async function listCephMds(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListCephMdsInput
): Promise<ToolResponse> {
  try {
    const validated = listCephMdsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const mdsList = (await client.request(`/nodes/${safeNode}/ceph/mds`)) as Array<
      Record<string, unknown>
    >;

    let output = '📁 **Ceph MDS Daemons**\n\n';
    if (!mdsList || mdsList.length === 0) {
      output += 'No MDS daemons found.';
      return formatToolResponse(output);
    }

    for (const mds of mdsList) {
      const name = (mds.name ?? mds.mds ?? mds.id ?? 'unknown').toString();
      const state = mds.state ?? mds.status;
      const addr = mds.addr ?? mds.address;
      let line = `• **${name}**`;
      if (state) line += ` - ${state}`;
      if (addr) line += ` - addr: ${addr}`;
      output += `${line}\n`;
    }

    output += `\n**Total**: ${mdsList.length} MDS daemon(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Ceph MDS');
  }
}

/**
 * Create Ceph MDS daemon.
 */
export async function createCephMds(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateCephMdsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ceph mds');

    const validated = createCephMdsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'MDS name');
    const result = await client.request(`/nodes/${safeNode}/ceph/mds`, 'POST', {
      name: safeName,
    });

    let output = '✅ **Ceph MDS Created**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **MDS**: ${safeName}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Ceph MDS');
  }
}

/**
 * Delete Ceph MDS daemon.
 */
export async function deleteCephMds(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteCephMdsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete ceph mds');

    const validated = deleteCephMdsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'MDS name');
    const result = await client.request(
      `/nodes/${safeNode}/ceph/mds/${encodeURIComponent(safeName)}`,
      'DELETE'
    );

    let output = '🗑️  **Ceph MDS Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **MDS**: ${safeName}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Ceph MDS');
  }
}

/**
 * List Ceph pools.
 */
export async function listCephPools(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListCephPoolsInput
): Promise<ToolResponse> {
  try {
    const validated = listCephPoolsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const pools = (await client.request(`/nodes/${safeNode}/ceph/pools`)) as Array<
      Record<string, unknown>
    >;

    let output = '🏊 **Ceph Pools**\n\n';
    if (!pools || pools.length === 0) {
      output += 'No pools found.';
      return formatToolResponse(output);
    }

    for (const pool of pools) {
      const name = (pool.name ?? pool.pool_name ?? pool.pool ?? 'unknown').toString();
      const size = formatOptionalNumber(pool.size);
      const minSize = formatOptionalNumber(pool.min_size ?? pool.min_size_num);
      const pgNum = formatOptionalNumber(pool.pg_num ?? pool.pg_num_actual ?? pool.pg_num_target);
      let line = `• **${name}**`;
      if (size) line += ` - size: ${size}`;
      if (minSize) line += ` - min: ${minSize}`;
      if (pgNum) line += ` - pgs: ${pgNum}`;
      output += `${line}\n`;
    }

    output += `\n**Total**: ${pools.length} pool(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Ceph Pools');
  }
}

/**
 * Create Ceph pool.
 */
export async function createCephPool(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateCephPoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ceph pool');

    const validated = createCephPoolSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'Pool name');
    const payload: Record<string, unknown> = {
      name: safeName,
    };

    if (validated.pg_num !== undefined) payload.pg_num = validated.pg_num;
    if (validated.size !== undefined) payload.size = validated.size;
    if (validated.min_size !== undefined) payload.min_size = validated.min_size;
    if (validated.crush_rule) {
      payload.crush_rule = validateCephIdentifier(validated.crush_rule, 'CRUSH rule');
    }
    if (validated['pg_autoscale_mode']) {
      payload['pg_autoscale_mode'] = validated['pg_autoscale_mode'];
    }

    const result = await client.request(`/nodes/${safeNode}/ceph/pools`, 'POST', payload);

    let output = '✅ **Ceph Pool Created**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Pool**: ${safeName}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Ceph Pool');
  }
}

/**
 * Update Ceph pool.
 */
export async function updateCephPool(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateCephPoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update ceph pool');

    const validated = updateCephPoolSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'Pool name');
    const payload: Record<string, unknown> = {};

    if (validated.pg_num !== undefined) payload.pg_num = validated.pg_num;
    if (validated.size !== undefined) payload.size = validated.size;
    if (validated.min_size !== undefined) payload.min_size = validated.min_size;
    if (validated.crush_rule) {
      payload.crush_rule = validateCephIdentifier(validated.crush_rule, 'CRUSH rule');
    }
    if (validated['pg_autoscale_mode']) {
      payload['pg_autoscale_mode'] = validated['pg_autoscale_mode'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/ceph/pools/${encodeURIComponent(safeName)}`,
      'PUT',
      payload
    );

    let output = '🔁 **Ceph Pool Updated**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Pool**: ${safeName}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Ceph Pool');
  }
}

/**
 * Delete Ceph pool.
 */
export async function deleteCephPool(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteCephPoolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete ceph pool');

    const validated = deleteCephPoolSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'Pool name');
    const result = await client.request(
      `/nodes/${safeNode}/ceph/pools/${encodeURIComponent(safeName)}`,
      'DELETE'
    );

    let output = '🗑️  **Ceph Pool Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Pool**: ${safeName}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Ceph Pool');
  }
}

/**
 * List Ceph filesystems.
 */
export async function listCephFs(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListCephFsInput
): Promise<ToolResponse> {
  try {
    const validated = listCephFsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const filesystems = (await client.request(`/nodes/${safeNode}/ceph/fs`)) as Array<
      Record<string, unknown>
    >;

    let output = '📦 **Ceph Filesystems**\n\n';
    if (!filesystems || filesystems.length === 0) {
      output += 'No filesystems found.';
      return formatToolResponse(output);
    }

    for (const fs of filesystems) {
      const name = (fs.name ?? fs.fs_name ?? fs.id ?? 'unknown').toString();
      const metadata = fs.metadata_pool ?? fs.metadata;
      const dataPools = fs.data_pools ?? fs.data_pool;
      let line = `• **${name}**`;
      if (metadata) line += ` - metadata: ${metadata}`;
      if (dataPools) {
        const dataList = Array.isArray(dataPools) ? dataPools.join(', ') : dataPools;
        line += ` - data: ${dataList}`;
      }
      output += `${line}\n`;
    }

    output += `\n**Total**: ${filesystems.length} filesystem(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Ceph Filesystems');
  }
}

/**
 * Create Ceph filesystem.
 */
export async function createCephFs(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateCephFsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ceph fs');

    const validated = createCephFsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeName = validateCephIdentifier(validated.name, 'CephFS name');
    const payload: Record<string, unknown> = {
      name: safeName,
    };

    if (validated.pool) {
      payload.pool = validateCephIdentifier(validated.pool, 'Pool name');
    }
    if (validated.data_pool) {
      payload.data_pool = validateCephIdentifier(validated.data_pool, 'Data pool name');
    }
    if (validated.metadata_pool) {
      payload.metadata_pool = validateCephIdentifier(
        validated.metadata_pool,
        'Metadata pool name'
      );
    }

    const result = await client.request(`/nodes/${safeNode}/ceph/fs`, 'POST', payload);

    let output = '✅ **Ceph Filesystem Created**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Filesystem**: ${safeName}\n`;
    if (validated.pool) output += `• **Pool**: ${validated.pool}\n`;
    if (validated.metadata_pool) {
      output += `• **Metadata Pool**: ${validated.metadata_pool}\n`;
    }
    if (validated.data_pool) output += `• **Data Pool**: ${validated.data_pool}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Ceph Filesystem');
  }
}

export async function handleCephTool(
  client: ProxmoxApiClient,
  config: Config,
  input: CephToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'status':
      return getCephStatus(client, config, input);
    default:
      throw new Error(`Unknown ceph action: ${(input as { action: string }).action}`);
  }
}
