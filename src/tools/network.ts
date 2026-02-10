import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  validateNodeName,
  validateVMID,
  validateNetworkId,
  validateBridgeName,
} from '../validators/index.js';
import {
  addNetworkVmSchema,
  addNetworkLxcSchema,
  updateNetworkVmSchema,
  updateNetworkLxcSchema,
  removeNetworkVmSchema,
  removeNetworkLxcSchema,
  guestNetworkSchema,
} from '../schemas/network.js';
import type {
  AddNetworkVmInput,
  AddNetworkLxcInput,
  UpdateNetworkVmInput,
  UpdateNetworkLxcInput,
  RemoveNetworkVmInput,
  RemoveNetworkLxcInput,
  GuestNetworkInput,
} from '../schemas/network.js';

/**
 * Add network interface to QEMU VM
 * Requires elevated permissions
 */
export async function addNetworkVm(
  client: ProxmoxApiClient,
  config: Config,
  input: AddNetworkVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'add VM network');

    const validated = addNetworkVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);
    const safeBridge = validateBridgeName(validated.bridge);

    // Build network config string
    let netConfig = `model=${validated.model || 'virtio'},bridge=${safeBridge}`;
    if (validated.macaddr) netConfig += `,macaddr=${validated.macaddr}`;
    if (validated.vlan !== undefined && validated.vlan !== null) {
      netConfig += `,tag=${validated.vlan}`;
    }
    if (validated.firewall) netConfig += `,firewall=1`;

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      { [safeNet]: netConfig }
    );

    const output =
      `🌐 **VM Network Added**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet}\n` +
      `• **Bridge**: ${safeBridge}\n` +
      `• **Model**: ${validated.model || 'virtio'}\n` +
      (validated.macaddr ? `• **MAC Address**: ${validated.macaddr}\n` : '') +
      (validated.vlan !== undefined && validated.vlan !== null
        ? `• **VLAN Tag**: ${validated.vlan}\n`
        : '') +
      (validated.firewall ? `• **Firewall**: Enabled\n` : '') +
      `• **Task ID**: ${result}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Add VM Network');
  }
}

/**
 * Add network interface to LXC container
 * Requires elevated permissions
 */
export async function addNetworkLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: AddNetworkLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'add LXC network');

    const validated = addNetworkLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);
    const safeBridge = validateBridgeName(validated.bridge);

    // Extract interface number (e.g., net0 -> 0, net1 -> 1)
    const netNum = safeNet.replace('net', '');

    // Build network config string
    let netConfig = `name=eth${netNum},bridge=${safeBridge}`;
    if (validated.ip) netConfig += `,ip=${validated.ip}`;
    if (validated.gw) netConfig += `,gw=${validated.gw}`;
    if (validated.firewall) netConfig += `,firewall=1`;

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      { [safeNet]: netConfig }
    );

    const output =
      `🌐 **LXC Network Added**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet} (eth${netNum})\n` +
      `• **Bridge**: ${safeBridge}\n` +
      (validated.ip ? `• **IP Address**: ${validated.ip}\n` : '') +
      (validated.gw ? `• **Gateway**: ${validated.gw}\n` : '') +
      (validated.firewall ? `• **Firewall**: Enabled\n` : '') +
      `• **Task ID**: ${result}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Add LXC Network');
  }
}

/**
 * Update network interface on QEMU VM
 * Requires elevated permissions
 */
export async function updateNetworkVm(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNetworkVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update VM network');

    const validated = updateNetworkVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);

    // Get current VM configuration
    const currentConfig = (await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'GET'
    )) as Record<string, string>;

    if (!currentConfig[safeNet]) {
      return formatErrorResponse(
        new Error(`Network interface ${safeNet} does not exist`),
        'Update VM Network'
      );
    }

    // Parse current configuration
    const configParts: Record<string, string> = {};
    currentConfig[safeNet].split(',').forEach((part) => {
      const [key, value] = part.split('=');
      if (key && value) configParts[key] = value;
    });

    // Update only provided parameters
    if (validated.bridge !== undefined) {
      const safeBridge = validateBridgeName(validated.bridge);
      configParts.bridge = safeBridge;
    }

    if (validated.model !== undefined) {
      configParts.model = validated.model;
    }

    if (validated.macaddr !== undefined) {
      configParts.macaddr = validated.macaddr;
    }

    if (validated.vlan !== undefined && validated.vlan !== null) {
      configParts.tag = validated.vlan.toString();
    } else if (validated.vlan === null) {
      delete configParts.tag;
    }

    if (validated.firewall !== undefined) {
      if (validated.firewall) {
        configParts.firewall = '1';
      } else {
        delete configParts.firewall;
      }
    }

    // Rebuild configuration string
    const netConfig = Object.entries(configParts)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      { [safeNet]: netConfig }
    );

    const output =
      `🔧 **VM Network Updated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet}\n` +
      `• **New Configuration**: ${netConfig}\n\n` +
      `**Changes applied**:\n` +
      (validated.bridge !== undefined ? `- Bridge: ${validated.bridge}\n` : '') +
      (validated.model !== undefined ? `- Model: ${validated.model}\n` : '') +
      (validated.macaddr !== undefined
        ? `- MAC Address: ${validated.macaddr}\n`
        : '') +
      (validated.vlan !== undefined
        ? `- VLAN Tag: ${validated.vlan !== null ? validated.vlan : 'Removed'}\n`
        : '') +
      (validated.firewall !== undefined
        ? `- Firewall: ${validated.firewall ? 'Enabled' : 'Disabled'}\n`
        : '') +
      `• **Task ID**: ${result}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update VM Network');
  }
}

/**
 * Update network interface on LXC container
 * Requires elevated permissions
 */
export async function updateNetworkLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateNetworkLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update LXC network');

    const validated = updateNetworkLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);

    // Get current container configuration
    const currentConfig = (await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'GET'
    )) as Record<string, string>;

    if (!currentConfig[safeNet]) {
      return formatErrorResponse(
        new Error(`Network interface ${safeNet} does not exist`),
        'Update LXC Network'
      );
    }

    // Parse current configuration
    const configParts: Record<string, string> = {};
    currentConfig[safeNet].split(',').forEach((part) => {
      const [key, value] = part.split('=');
      if (key && value) configParts[key] = value;
    });

    // Update only provided parameters
    if (validated.bridge !== undefined) {
      const safeBridge = validateBridgeName(validated.bridge);
      configParts.bridge = safeBridge;
    }

    if (validated.ip !== undefined) {
      configParts.ip = validated.ip;
    }

    if (validated.gw !== undefined) {
      configParts.gw = validated.gw;
    }

    if (validated.firewall !== undefined) {
      if (validated.firewall) {
        configParts.firewall = '1';
      } else {
        delete configParts.firewall;
      }
    }

    // Rebuild configuration string
    const netConfig = Object.entries(configParts)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      { [safeNet]: netConfig }
    );

    const output =
      `🔧 **LXC Network Updated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet}\n` +
      `• **New Configuration**: ${netConfig}\n\n` +
      `**Changes applied**:\n` +
      (validated.bridge !== undefined ? `- Bridge: ${validated.bridge}\n` : '') +
      (validated.ip !== undefined ? `- IP Address: ${validated.ip}\n` : '') +
      (validated.gw !== undefined ? `- Gateway: ${validated.gw}\n` : '') +
      (validated.firewall !== undefined
        ? `- Firewall: ${validated.firewall ? 'Enabled' : 'Disabled'}\n`
        : '') +
      `• **Task ID**: ${result}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update LXC Network');
  }
}

/**
 * Remove network interface from QEMU VM
 * Requires elevated permissions
 */
export async function removeNetworkVm(
  client: ProxmoxApiClient,
  config: Config,
  input: RemoveNetworkVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'remove VM network');

    const validated = removeNetworkVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      { delete: safeNet }
    );

    const output =
      `🗑️ **VM Network Removed**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet}\n` +
      `• **Task ID**: ${result}\n\n` +
      `**Note**: The network interface has been removed from the VM configuration.\n` +
      `**Tip**: If the VM is running, you may need to restart it for changes to take effect.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Remove VM Network');
  }
}

/**
 * Remove network interface from LXC container
 * Requires elevated permissions
 */
export async function removeNetworkLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: RemoveNetworkLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'remove LXC network');

    const validated = removeNetworkLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNet = validateNetworkId(validated.net);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      { delete: safeNet }
    );

    const output =
      `🗑️ **LXC Network Removed**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Network**: ${safeNet}\n` +
      `• **Task ID**: ${result}\n\n` +
      `**Note**: The network interface has been removed from the container configuration.\n` +
      `**Tip**: If the container is running, you may need to restart it for changes to take effect.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Remove LXC Network');
  }
}

export async function handleGuestNetwork(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestNetworkInput
): Promise<ToolResponse> {
  const validated = guestNetworkSchema.parse(input);

  switch (validated.action) {
    case 'add':
      if (validated.type === 'vm') {
        return addNetworkVm(client, config, {
          node: validated.node,
          vmid: validated.vmid,
          net: validated.net,
          bridge: validated.bridge,
          model: validated.model ?? 'virtio',
          macaddr: validated.macaddr,
          vlan: validated.vlan,
          firewall: validated.firewall,
        });
      }

      return addNetworkLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        net: validated.net,
        bridge: validated.bridge,
        ip: validated.ip,
        gw: validated.gw,
        firewall: validated.firewall,
      });

    case 'update':
      if (validated.type === 'vm') {
        return updateNetworkVm(client, config, {
          node: validated.node,
          vmid: validated.vmid,
          net: validated.net,
          bridge: validated.bridge,
          model: validated.model,
          macaddr: validated.macaddr,
          vlan: validated.vlan,
          firewall: validated.firewall,
        });
      }

      return updateNetworkLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        net: validated.net,
        bridge: validated.bridge,
        ip: validated.ip,
        gw: validated.gw,
        firewall: validated.firewall,
      });

    case 'remove':
      if (validated.type === 'vm') {
        return removeNetworkVm(client, config, {
          node: validated.node,
          vmid: validated.vmid,
          net: validated.net,
        });
      }

      return removeNetworkLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        net: validated.net,
      });

    default:
      throw new Error(`Unknown action: ${(validated as { action: string }).action}`);
  }
}
