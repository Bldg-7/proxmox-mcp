import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  listSdnVnetsSchema,
  getSdnVnetSchema,
  createSdnVnetSchema,
  updateSdnVnetSchema,
  deleteSdnVnetSchema,
  listSdnZonesSchema,
  getSdnZoneSchema,
  createSdnZoneSchema,
  updateSdnZoneSchema,
  deleteSdnZoneSchema,
  listSdnControllersSchema,
  getSdnControllerSchema,
  createSdnControllerSchema,
  updateSdnControllerSchema,
  deleteSdnControllerSchema,
  listSdnSubnetsSchema,
  getSdnSubnetSchema,
  createSdnSubnetSchema,
  updateSdnSubnetSchema,
  deleteSdnSubnetSchema,
  sdnVnetToolSchema,
  sdnZoneToolSchema,
  sdnControllerToolSchema,
  sdnSubnetToolSchema,
} from '../schemas/sdn.js';
import type {
  ListSdnVnetsInput,
  GetSdnVnetInput,
  CreateSdnVnetInput,
  UpdateSdnVnetInput,
  DeleteSdnVnetInput,
  ListSdnZonesInput,
  GetSdnZoneInput,
  CreateSdnZoneInput,
  UpdateSdnZoneInput,
  DeleteSdnZoneInput,
  ListSdnControllersInput,
  GetSdnControllerInput,
  CreateSdnControllerInput,
  UpdateSdnControllerInput,
  DeleteSdnControllerInput,
  ListSdnSubnetsInput,
  GetSdnSubnetInput,
  CreateSdnSubnetInput,
  UpdateSdnSubnetInput,
  DeleteSdnSubnetInput,
  SdnVnetToolInput,
  SdnZoneToolInput,
  SdnControllerToolInput,
  SdnSubnetToolInput,
} from '../schemas/sdn.js';

type SdnRecord = Record<string, unknown>;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'n/a';
  if (Array.isArray(value)) return value.map((entry) => String(entry)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDetails(title: string, idLabel: string, idValue: string, data: SdnRecord): string {
  let output = `${title}\n\n`;
  output += `• **${idLabel}**: ${idValue}\n`;

  const entries = Object.entries(data ?? {}).filter(([key]) => key !== idLabel);
  if (entries.length === 0) {
    output += '\nNo additional details.';
    return output;
  }

  output += '\n**Details**\n';
  output += entries
    .map(([key, value]) => `• **${key}**: ${formatValue(value)}`)
    .join('\n');

  return output;
}

function formatListHeader(title: string, items: SdnRecord[], emptyMessage: string): string {
  let output = `${title}\n\n`;
  if (!items || items.length === 0) {
    output += emptyMessage;
  }
  return output;
}

/**
 * List SDN virtual networks.
 */
export async function listSdnVnets(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSdnVnetsInput
): Promise<ToolResponse> {
  try {
    listSdnVnetsSchema.parse(input);
    const vnets = (await client.request('/cluster/sdn/vnets')) as SdnRecord[];
    let output = formatListHeader('🕸️ **SDN Vnets**', vnets, 'No SDN vnets found.');

    if (vnets && vnets.length > 0) {
      for (const vnet of vnets) {
        const name = String(vnet.vnet ?? vnet.id ?? vnet.name ?? 'unknown');
        let line = `• **${name}**`;
        if (vnet.zone) line += ` - zone: ${formatValue(vnet.zone)}`;
        if (vnet.type) line += ` - type: ${formatValue(vnet.type)}`;
        if (vnet.tag) line += ` - tag: ${formatValue(vnet.tag)}`;
        output += `${line}\n`;
      }
      output += `\n**Total**: ${vnets.length} vnet(s)`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List SDN Vnets');
  }
}

/**
 * Get SDN virtual network details.
 */
export async function getSdnVnet(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetSdnVnetInput
): Promise<ToolResponse> {
  try {
    const validated = getSdnVnetSchema.parse(input);
    const safeVnet = validated.vnet;
    const vnet = (await client.request(
      `/cluster/sdn/vnets/${encodeURIComponent(safeVnet)}`
    )) as SdnRecord;

    const output = formatDetails('🕸️ **SDN Vnet Details**', 'vnet', safeVnet, vnet);
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get SDN Vnet');
  }
}

/**
 * Create SDN virtual network.
 * Requires elevated permissions.
 */
export async function createSdnVnet(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSdnVnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create SDN vnet');

    const validated = createSdnVnetSchema.parse(input);
    const result = await client.request('/cluster/sdn/vnets', 'POST', validated);

    let output = '✅ **SDN Vnet Created**\n\n';
    output += `• **Vnet**: ${validated.vnet}\n`;
    if (validated.zone) output += `• **Zone**: ${validated.zone}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create SDN Vnet');
  }
}

/**
 * Update SDN virtual network.
 * Requires elevated permissions.
 */
export async function updateSdnVnet(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateSdnVnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update SDN vnet');

    const validated = updateSdnVnetSchema.parse(input);
    const { vnet, ...payload } = validated;
    const result = await client.request(
      `/cluster/sdn/vnets/${encodeURIComponent(vnet)}`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '✅ **SDN Vnet Updated**\n\n';
    output += `• **Vnet**: ${vnet}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update SDN Vnet');
  }
}

/**
 * Delete SDN virtual network.
 * Requires elevated permissions.
 */
export async function deleteSdnVnet(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSdnVnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete SDN vnet');

    const validated = deleteSdnVnetSchema.parse(input);
    const result = await client.request(
      `/cluster/sdn/vnets/${encodeURIComponent(validated.vnet)}`,
      'DELETE'
    );

    let output = '🗑️ **SDN Vnet Deleted**\n\n';
    output += `• **Vnet**: ${validated.vnet}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete SDN Vnet');
  }
}

/**
 * List SDN zones.
 */
export async function listSdnZones(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSdnZonesInput
): Promise<ToolResponse> {
  try {
    listSdnZonesSchema.parse(input);
    const zones = (await client.request('/cluster/sdn/zones')) as SdnRecord[];
    let output = formatListHeader('🗺️ **SDN Zones**', zones, 'No SDN zones found.');

    if (zones && zones.length > 0) {
      for (const zone of zones) {
        const name = String(zone.zone ?? zone.id ?? zone.name ?? 'unknown');
        let line = `• **${name}**`;
        if (zone.type) line += ` - type: ${formatValue(zone.type)}`;
        if (zone.bridge) line += ` - bridge: ${formatValue(zone.bridge)}`;
        output += `${line}\n`;
      }
      output += `\n**Total**: ${zones.length} zone(s)`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List SDN Zones');
  }
}

/**
 * Get SDN zone details.
 */
export async function getSdnZone(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetSdnZoneInput
): Promise<ToolResponse> {
  try {
    const validated = getSdnZoneSchema.parse(input);
    const safeZone = validated.zone;
    const zone = (await client.request(
      `/cluster/sdn/zones/${encodeURIComponent(safeZone)}`
    )) as SdnRecord;

    const output = formatDetails('🗺️ **SDN Zone Details**', 'zone', safeZone, zone);
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get SDN Zone');
  }
}

/**
 * Create SDN zone.
 * Requires elevated permissions.
 */
export async function createSdnZone(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSdnZoneInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create SDN zone');

    const validated = createSdnZoneSchema.parse(input);
    const result = await client.request('/cluster/sdn/zones', 'POST', validated);

    let output = '✅ **SDN Zone Created**\n\n';
    output += `• **Zone**: ${validated.zone}\n`;
    if (validated.type) output += `• **Type**: ${validated.type}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create SDN Zone');
  }
}

/**
 * Update SDN zone.
 * Requires elevated permissions.
 */
export async function updateSdnZone(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateSdnZoneInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update SDN zone');

    const validated = updateSdnZoneSchema.parse(input);
    const { zone, ...payload } = validated;
    const result = await client.request(
      `/cluster/sdn/zones/${encodeURIComponent(zone)}`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '✅ **SDN Zone Updated**\n\n';
    output += `• **Zone**: ${zone}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update SDN Zone');
  }
}

/**
 * Delete SDN zone.
 * Requires elevated permissions.
 */
export async function deleteSdnZone(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSdnZoneInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete SDN zone');

    const validated = deleteSdnZoneSchema.parse(input);
    const result = await client.request(
      `/cluster/sdn/zones/${encodeURIComponent(validated.zone)}`,
      'DELETE'
    );

    let output = '🗑️ **SDN Zone Deleted**\n\n';
    output += `• **Zone**: ${validated.zone}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete SDN Zone');
  }
}

/**
 * List SDN controllers.
 */
export async function listSdnControllers(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSdnControllersInput
): Promise<ToolResponse> {
  try {
    listSdnControllersSchema.parse(input);
    const controllers = (await client.request('/cluster/sdn/controllers')) as SdnRecord[];
    let output = formatListHeader(
      '🎛️ **SDN Controllers**',
      controllers,
      'No SDN controllers found.'
    );

    if (controllers && controllers.length > 0) {
      for (const controller of controllers) {
        const name = String(controller.controller ?? controller.id ?? controller.name ?? 'unknown');
        let line = `• **${name}**`;
        if (controller.type) line += ` - type: ${formatValue(controller.type)}`;
        if (controller.ip) line += ` - ip: ${formatValue(controller.ip)}`;
        output += `${line}\n`;
      }
      output += `\n**Total**: ${controllers.length} controller(s)`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List SDN Controllers');
  }
}

/**
 * Get SDN controller details.
 */
export async function getSdnController(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetSdnControllerInput
): Promise<ToolResponse> {
  try {
    const validated = getSdnControllerSchema.parse(input);
    const safeController = validated.controller;
    const controller = (await client.request(
      `/cluster/sdn/controllers/${encodeURIComponent(safeController)}`
    )) as SdnRecord;

    const output = formatDetails(
      '🎛️ **SDN Controller Details**',
      'controller',
      safeController,
      controller
    );
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get SDN Controller');
  }
}

/**
 * Create SDN controller.
 * Requires elevated permissions.
 */
export async function createSdnController(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSdnControllerInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create SDN controller');

    const validated = createSdnControllerSchema.parse(input);
    const result = await client.request('/cluster/sdn/controllers', 'POST', validated);

    let output = '✅ **SDN Controller Created**\n\n';
    output += `• **Controller**: ${validated.controller}\n`;
    if (validated.type) output += `• **Type**: ${validated.type}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create SDN Controller');
  }
}

/**
 * Update SDN controller.
 * Requires elevated permissions.
 */
export async function updateSdnController(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateSdnControllerInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update SDN controller');

    const validated = updateSdnControllerSchema.parse(input);
    const { controller, ...payload } = validated;
    const result = await client.request(
      `/cluster/sdn/controllers/${encodeURIComponent(controller)}`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '✅ **SDN Controller Updated**\n\n';
    output += `• **Controller**: ${controller}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update SDN Controller');
  }
}

/**
 * Delete SDN controller.
 * Requires elevated permissions.
 */
export async function deleteSdnController(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSdnControllerInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete SDN controller');

    const validated = deleteSdnControllerSchema.parse(input);
    const result = await client.request(
      `/cluster/sdn/controllers/${encodeURIComponent(validated.controller)}`,
      'DELETE'
    );

    let output = '🗑️ **SDN Controller Deleted**\n\n';
    output += `• **Controller**: ${validated.controller}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete SDN Controller');
  }
}

/**
 * List SDN subnets.
 */
export async function listSdnSubnets(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSdnSubnetsInput
): Promise<ToolResponse> {
  try {
    listSdnSubnetsSchema.parse(input);
    const subnets = (await client.request('/cluster/sdn/subnets')) as SdnRecord[];
    let output = formatListHeader('🧱 **SDN Subnets**', subnets, 'No SDN subnets found.');

    if (subnets && subnets.length > 0) {
      for (const subnet of subnets) {
        const name = String(subnet.subnet ?? subnet.id ?? subnet.cidr ?? 'unknown');
        let line = `• **${name}**`;
        if (subnet.vnet) line += ` - vnet: ${formatValue(subnet.vnet)}`;
        if (subnet.cidr && subnet.subnet !== subnet.cidr) {
          line += ` - cidr: ${formatValue(subnet.cidr)}`;
        }
        output += `${line}\n`;
      }
      output += `\n**Total**: ${subnets.length} subnet(s)`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List SDN Subnets');
  }
}

/**
 * Get SDN subnet details.
 */
export async function getSdnSubnet(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetSdnSubnetInput
): Promise<ToolResponse> {
  try {
    const validated = getSdnSubnetSchema.parse(input);
    const safeSubnet = validated.subnet;
    const subnet = (await client.request(
      `/cluster/sdn/subnets/${encodeURIComponent(safeSubnet)}`
    )) as SdnRecord;

    const output = formatDetails('🧱 **SDN Subnet Details**', 'subnet', safeSubnet, subnet);
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get SDN Subnet');
  }
}

/**
 * Create SDN subnet.
 * Requires elevated permissions.
 */
export async function createSdnSubnet(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSdnSubnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create SDN subnet');

    const validated = createSdnSubnetSchema.parse(input);
    const result = await client.request('/cluster/sdn/subnets', 'POST', validated);

    let output = '✅ **SDN Subnet Created**\n\n';
    output += `• **Subnet**: ${validated.subnet}\n`;
    if (validated.vnet) output += `• **Vnet**: ${validated.vnet}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create SDN Subnet');
  }
}

/**
 * Update SDN subnet.
 * Requires elevated permissions.
 */
export async function updateSdnSubnet(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateSdnSubnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update SDN subnet');

    const validated = updateSdnSubnetSchema.parse(input);
    const { subnet, ...payload } = validated;
    const result = await client.request(
      `/cluster/sdn/subnets/${encodeURIComponent(subnet)}`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '✅ **SDN Subnet Updated**\n\n';
    output += `• **Subnet**: ${subnet}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update SDN Subnet');
  }
}

/**
 * Delete SDN subnet.
 * Requires elevated permissions.
 */
export async function deleteSdnSubnet(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSdnSubnetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete SDN subnet');

    const validated = deleteSdnSubnetSchema.parse(input);
    const result = await client.request(
      `/cluster/sdn/subnets/${encodeURIComponent(validated.subnet)}`,
      'DELETE'
    );

    let output = '🗑️ **SDN Subnet Deleted**\n\n';
    output += `• **Subnet**: ${validated.subnet}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete SDN Subnet');
  }
}

export async function handleSdnVnetTool(
  client: ProxmoxApiClient,
  config: Config,
  input: SdnVnetToolInput
): Promise<ToolResponse> {
  const validated = sdnVnetToolSchema.parse(input);

  switch (validated.action) {
    case 'list': {
      const { action: _action, ...payload } = validated;
      return listSdnVnets(client, config, payload);
    }
    case 'get': {
      const { action: _action, ...payload } = validated;
      return getSdnVnet(client, config, payload);
    }
    case 'create': {
      const { action: _action, ...payload } = validated;
      return createSdnVnet(client, config, payload);
    }
    case 'update': {
      const { action: _action, ...payload } = validated;
      return updateSdnVnet(client, config, payload);
    }
    case 'delete': {
      const { action: _action, ...payload } = validated;
      return deleteSdnVnet(client, config, payload);
    }
    default:
      return formatErrorResponse(
        new Error(`Unknown action: ${(validated as { action: string }).action}`),
        'SDN Vnet Tool'
      );
  }
}

export async function handleSdnZoneTool(
  client: ProxmoxApiClient,
  config: Config,
  input: SdnZoneToolInput
): Promise<ToolResponse> {
  const validated = sdnZoneToolSchema.parse(input);

  switch (validated.action) {
    case 'list': {
      const { action: _action, ...payload } = validated;
      return listSdnZones(client, config, payload);
    }
    case 'get': {
      const { action: _action, ...payload } = validated;
      return getSdnZone(client, config, payload);
    }
    case 'create': {
      const { action: _action, ...payload } = validated;
      return createSdnZone(client, config, payload);
    }
    case 'update': {
      const { action: _action, ...payload } = validated;
      return updateSdnZone(client, config, payload);
    }
    case 'delete': {
      const { action: _action, ...payload } = validated;
      return deleteSdnZone(client, config, payload);
    }
    default:
      return formatErrorResponse(
        new Error(`Unknown action: ${(validated as { action: string }).action}`),
        'SDN Zone Tool'
      );
  }
}

export async function handleSdnControllerTool(
  client: ProxmoxApiClient,
  config: Config,
  input: SdnControllerToolInput
): Promise<ToolResponse> {
  const validated = sdnControllerToolSchema.parse(input);

  switch (validated.action) {
    case 'list': {
      const { action: _action, ...payload } = validated;
      return listSdnControllers(client, config, payload);
    }
    case 'get': {
      const { action: _action, ...payload } = validated;
      return getSdnController(client, config, payload);
    }
    case 'create': {
      const { action: _action, ...payload } = validated;
      return createSdnController(client, config, payload);
    }
    case 'update': {
      const { action: _action, ...payload } = validated;
      return updateSdnController(client, config, payload);
    }
    case 'delete': {
      const { action: _action, ...payload } = validated;
      return deleteSdnController(client, config, payload);
    }
    default:
      return formatErrorResponse(
        new Error(`Unknown action: ${(validated as { action: string }).action}`),
        'SDN Controller Tool'
      );
  }
}

export async function handleSdnSubnetTool(
  client: ProxmoxApiClient,
  config: Config,
  input: SdnSubnetToolInput
): Promise<ToolResponse> {
  const validated = sdnSubnetToolSchema.parse(input);

  switch (validated.action) {
    case 'list': {
      const { action: _action, ...payload } = validated;
      return listSdnSubnets(client, config, payload);
    }
    case 'get': {
      const { action: _action, ...payload } = validated;
      return getSdnSubnet(client, config, payload);
    }
    case 'create': {
      const { action: _action, ...payload } = validated;
      return createSdnSubnet(client, config, payload);
    }
    case 'update': {
      const { action: _action, ...payload } = validated;
      return updateSdnSubnet(client, config, payload);
    }
    case 'delete': {
      const { action: _action, ...payload } = validated;
      return deleteSdnSubnet(client, config, payload);
    }
    default:
      return formatErrorResponse(
        new Error(`Unknown action: ${(validated as { action: string }).action}`),
        'SDN Subnet Tool'
      );
  }
}
