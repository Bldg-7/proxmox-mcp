import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import {
  cloneLxcSchema,
  cloneVmSchema,
  resizeLxcSchema,
  resizeVmSchema,
} from '../schemas/vm.js';
import type {
  CloneLxcInput,
  CloneVmInput,
  ResizeLxcInput,
  ResizeVmInput,
} from '../schemas/vm.js';

/**
 * Clone an LXC container
 * Requires elevated permissions
 */
export async function cloneLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: CloneLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'clone LXC container');

    // Validate input
    const validated = cloneLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNewid = validateVMID(validated.newid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/clone`,
      'POST',
      {
        newid: safeNewid,
        hostname: validated.hostname,
      }
    );

    // Format success response
    const output = `📋 **Container Clone Initiated**\n\n` +
      `• **Original ID**: ${safeVmid}\n` +
      `• **New ID**: ${safeNewid}\n` +
      `• **Hostname**: ${validated.hostname || `clone-${safeNewid}`}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Use \`get_vm_status\` to check the new container.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Clone LXC Container');
  }
}

/**
 * Clone a QEMU VM
 * Requires elevated permissions
 */
export async function cloneVM(
  client: ProxmoxApiClient,
  config: Config,
  input: CloneVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'clone QEMU VM');

    // Validate input
    const validated = cloneVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeNewid = validateVMID(validated.newid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/clone`,
      'POST',
      {
        newid: safeNewid,
        name: validated.name,
      }
    );

    // Format success response
    const output = `📋 **VM Clone Initiated**\n\n` +
      `• **Original ID**: ${safeVmid}\n` +
      `• **New ID**: ${safeNewid}\n` +
      `• **Name**: ${validated.name || `clone-${safeNewid}`}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Use \`get_vm_status\` to check the new VM.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Clone QEMU VM');
  }
}

/**
 * Resize an LXC container (memory and/or CPU cores)
 * Requires elevated permissions
 */
export async function resizeLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: ResizeLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'resize LXC container');

    // Validate input
    const validated = resizeLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Build config object with provided values
    const configUpdate: Record<string, number> = {};
    if (validated.memory !== undefined) {
      configUpdate.memory = validated.memory;
    }
    if (validated.cores !== undefined) {
      configUpdate.cores = validated.cores;
    }

    // Ensure at least one parameter is provided
    if (Object.keys(configUpdate).length === 0) {
      return formatErrorResponse(
        new Error('At least one of memory or cores must be specified'),
        'Resize LXC Container'
      );
    }

    // Call Proxmox API
    await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      configUpdate
    );

    // Format success response
    let output = `📏 **Container Resize Initiated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n`;

    if (validated.memory !== undefined) {
      output += `• **New Memory**: ${validated.memory} MB\n`;
    }
    if (validated.cores !== undefined) {
      output += `• **New Cores**: ${validated.cores}\n`;
    }

    output += `\n**Note**: Changes will take effect after container restart.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Resize LXC Container');
  }
}

/**
 * Resize a QEMU VM (memory and/or CPU cores)
 * Requires elevated permissions
 */
export async function resizeVM(
  client: ProxmoxApiClient,
  config: Config,
  input: ResizeVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'resize QEMU VM');

    // Validate input
    const validated = resizeVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Build config object with provided values
    const configUpdate: Record<string, number> = {};
    if (validated.memory !== undefined) {
      configUpdate.memory = validated.memory;
    }
    if (validated.cores !== undefined) {
      configUpdate.cores = validated.cores;
    }

    // Ensure at least one parameter is provided
    if (Object.keys(configUpdate).length === 0) {
      return formatErrorResponse(
        new Error('At least one of memory or cores must be specified'),
        'Resize QEMU VM'
      );
    }

    // Call Proxmox API
    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      configUpdate
    );

    // Format success response
    let output = `📏 **VM Resize Initiated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n`;

    if (validated.memory !== undefined) {
      output += `• **New Memory**: ${validated.memory} MB\n`;
    }
    if (validated.cores !== undefined) {
      output += `• **New Cores**: ${validated.cores}\n`;
    }

    output += `\n**Note**: Changes will take effect after VM restart.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Resize QEMU VM');
  }
}
