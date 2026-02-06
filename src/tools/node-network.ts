import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateInterfaceName } from '../validators/index.js';
import {
  createNetworkIfaceSchema,
  updateNetworkIfaceSchema,
  deleteNetworkIfaceSchema,
  applyNetworkConfigSchema,
} from '../schemas/node-network.js';
import type {
  CreateNetworkIfaceInput,
  UpdateNetworkIfaceInput,
  DeleteNetworkIfaceInput,
  ApplyNetworkConfigInput,
} from '../schemas/node-network.js';

/**
 * Create a network interface on a node.
 * Requires elevated permissions.
 */
export async function createNetworkIface(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateNetworkIfaceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create network interface');

    const validated = createNetworkIfaceSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeIface = validateInterfaceName(validated.iface);

    const payload: Record<string, unknown> = {
      iface: safeIface,
      type: validated.type,
    };

    if (validated.autostart !== undefined) payload.autostart = validated.autostart;
    if (validated.method) payload.method = validated.method;
    if (validated.address) payload.address = validated.address;
    if (validated.netmask) payload.netmask = validated.netmask;
    if (validated.gateway) payload.gateway = validated.gateway;
    if (validated.cidr) payload.cidr = validated.cidr;
    if (validated.mtu !== undefined) payload.mtu = validated.mtu;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.bridge_ports) payload.bridge_ports = validated.bridge_ports;
    if (validated.bridge_stp) payload.bridge_stp = validated.bridge_stp;
    if (validated.bridge_fd) payload.bridge_fd = validated.bridge_fd;
    if (validated.bond_mode) payload.bond_mode = validated.bond_mode;
    if (validated.bond_xmit_hash_policy)
      payload.bond_xmit_hash_policy = validated.bond_xmit_hash_policy;
    if (validated.bond_miimon !== undefined) payload.bond_miimon = validated.bond_miimon;
    if (validated.bond_primary) payload.bond_primary = validated.bond_primary;
    if (validated.bond_slaves) payload.bond_slaves = validated.bond_slaves;
    if (validated['vlan-id'] !== undefined) payload['vlan-id'] = validated['vlan-id'];
    if (validated['vlan-raw-device']) payload['vlan-raw-device'] = validated['vlan-raw-device'];

    const result = await client.request(`/nodes/${safeNode}/network`, 'POST', payload);

    let output = '🌐 **Node Network Interface Created**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Interface**: ${safeIface}\n`;
    output += `• **Type**: ${validated.type}\n`;
    if (validated.bridge_ports) output += `• **Bridge Ports**: ${validated.bridge_ports}\n`;
    if (validated.bond_slaves) output += `• **Bond Slaves**: ${validated.bond_slaves}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Network Interface');
  }
}

/**
 * Update a network interface on a node.
 * Requires elevated permissions.
 */
export async function updateNetworkIface(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNetworkIfaceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update network interface');

    const validated = updateNetworkIfaceSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeIface = validateInterfaceName(validated.iface);

    const payload: Record<string, unknown> = {};

    if (validated.type) payload.type = validated.type;
    if (validated.autostart !== undefined) payload.autostart = validated.autostart;
    if (validated.method) payload.method = validated.method;
    if (validated.address) payload.address = validated.address;
    if (validated.netmask) payload.netmask = validated.netmask;
    if (validated.gateway) payload.gateway = validated.gateway;
    if (validated.cidr) payload.cidr = validated.cidr;
    if (validated.mtu !== undefined) payload.mtu = validated.mtu;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.bridge_ports) payload.bridge_ports = validated.bridge_ports;
    if (validated.bridge_stp) payload.bridge_stp = validated.bridge_stp;
    if (validated.bridge_fd) payload.bridge_fd = validated.bridge_fd;
    if (validated.bond_mode) payload.bond_mode = validated.bond_mode;
    if (validated.bond_xmit_hash_policy)
      payload.bond_xmit_hash_policy = validated.bond_xmit_hash_policy;
    if (validated.bond_miimon !== undefined) payload.bond_miimon = validated.bond_miimon;
    if (validated.bond_primary) payload.bond_primary = validated.bond_primary;
    if (validated.bond_slaves) payload.bond_slaves = validated.bond_slaves;
    if (validated['vlan-id'] !== undefined) payload['vlan-id'] = validated['vlan-id'];
    if (validated['vlan-raw-device']) payload['vlan-raw-device'] = validated['vlan-raw-device'];
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/nodes/${safeNode}/network/${safeIface}`,
      'PUT',
      payload
    );

    let output = '🔧 **Node Network Interface Updated**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Interface**: ${safeIface}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Network Interface');
  }
}

/**
 * Delete a network interface on a node.
 * Requires elevated permissions.
 */
export async function deleteNetworkIface(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteNetworkIfaceInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete network interface');

    const validated = deleteNetworkIfaceSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeIface = validateInterfaceName(validated.iface);

    const payload: Record<string, unknown> = {};
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/nodes/${safeNode}/network/${safeIface}`,
      'DELETE',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '🗑️ **Node Network Interface Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Interface**: ${safeIface}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Network Interface');
  }
}

/**
 * Apply pending network configuration changes on a node.
 * Requires elevated permissions.
 */
export async function applyNetworkConfig(
  client: ProxmoxApiClient,
  config: Config,
  input: ApplyNetworkConfigInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'apply network configuration');

    const validated = applyNetworkConfigSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {};
    if (validated.revert !== undefined) payload.revert = validated.revert;

    const result = await client.request(
      `/nodes/${safeNode}/network`,
      'PUT',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '✅ **Node Network Configuration Applied**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    if (validated.revert !== undefined) {
      output += `• **Revert**: ${validated.revert ? 'Yes' : 'No'}\n`;
    }
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Apply Network Configuration');
  }
}
