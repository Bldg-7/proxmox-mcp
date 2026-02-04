import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID, validateStorageName } from '../validators/index.js';
import {
  addDiskVmSchema,
  addMountpointLxcSchema,
  resizeDiskVmSchema,
  resizeDiskLxcSchema,
  removeDiskVmSchema,
  removeMountpointLxcSchema,
  moveDiskVmSchema,
  moveDiskLxcSchema,
} from '../schemas/disk.js';
import type {
  AddDiskVmInput,
  AddMountpointLxcInput,
  ResizeDiskVmInput,
  ResizeDiskLxcInput,
  RemoveDiskVmInput,
  RemoveMountpointLxcInput,
  MoveDiskVmInput,
  MoveDiskLxcInput,
} from '../schemas/disk.js';

/**
 * Add a new disk to a QEMU VM
 * Requires elevated permissions
 */
export async function addDiskVM(
  client: ProxmoxApiClient,
  config: Config,
  input: AddDiskVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'add VM disk');

    const validated = addDiskVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeStorage = validateStorageName(validated.storage);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      {
        [validated.disk]: `${safeStorage}:${validated.size}`,
      }
    );

    let output = `💿 **VM Disk Addition Started**\n\n`;
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Size**: ${validated.size} GB\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Disk naming conventions**:\n`;
    output += `  • SCSI: scsi0-15\n`;
    output += `  • VirtIO: virtio0-15\n`;
    output += `  • SATA: sata0-5\n`;
    output += `  • IDE: ide0-3\n\n`;
    output += `**Note**: The VM may need to be stopped for this operation depending on configuration.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Add VM Disk');
  }
}

/**
 * Add a mount point to an LXC container
 * Requires elevated permissions
 */
export async function addMountpointLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: AddMountpointLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'add LXC mount point');

    const validated = addMountpointLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeStorage = validateStorageName(validated.storage);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      {
        [validated.mp]: `${safeStorage}:${validated.size}`,
      }
    );

    let output = `💿 **LXC Mount Point Addition Started**\n\n`;
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Mount Point**: ${validated.mp}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Size**: ${validated.size} GB\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Mount point naming**: mp0-255\n\n`;
    output += `**Note**: The container may need to be stopped for this operation.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Add LXC Mount Point');
  }
}

/**
 * Resize a QEMU VM disk
 * Requires elevated permissions
 */
export async function resizeDiskVM(
  client: ProxmoxApiClient,
  config: Config,
  input: ResizeDiskVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'resize VM disk');

    const validated = resizeDiskVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/resize`,
      'PUT',
      {
        disk: validated.disk,
        size: validated.size,
      }
    );

    let output = `📏 **VM Disk Resize Started**\n\n`;
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **New Size**: ${validated.size}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Size format examples**:\n`;
    output += `  • +10G: Add 10GB to current size\n`;
    output += `  • 50G: Set absolute size to 50GB\n\n`;
    output += `**Note**: Disks can only be expanded, not shrunk. Some configurations allow online resizing.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Resize VM Disk');
  }
}

/**
 * Resize an LXC container disk or mount point
 * Requires elevated permissions
 */
export async function resizeDiskLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: ResizeDiskLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'resize LXC disk');

    const validated = resizeDiskLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/resize`,
      'PUT',
      {
        disk: validated.disk,
        size: validated.size,
      }
    );

    let output = `📏 **LXC Disk Resize Started**\n\n`;
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **New Size**: ${validated.size}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Size format examples**:\n`;
    output += `  • +10G: Add 10GB to current size\n`;
    output += `  • 50G: Set absolute size to 50GB\n\n`;
    output += `**Valid disk names**: rootfs, mp0, mp1, mp2, etc.\n\n`;
    output += `**Note**: Disks can only be expanded, not shrunk. Container may need to be stopped.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Resize LXC Disk');
  }
}

/**
 * Remove a disk from a QEMU VM
 * Requires elevated permissions
 */
export async function removeDiskVM(
  client: ProxmoxApiClient,
  config: Config,
  input: RemoveDiskVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'remove VM disk');

    const validated = removeDiskVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/config`,
      'PUT',
      {
        delete: validated.disk,
      }
    );

    let output = `➖ **VM Disk Removal Started**\n\n`;
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Warning**: This will permanently delete the disk and all its data.\n`;
    output += `**Note**: The VM should be stopped for this operation.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Remove VM Disk');
  }
}

/**
 * Remove a mount point from an LXC container
 * Requires elevated permissions
 */
export async function removeMountpointLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: RemoveMountpointLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'remove LXC mount point');

    const validated = removeMountpointLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/config`,
      'PUT',
      {
        delete: validated.mp,
      }
    );

    let output = `➖ **LXC Mount Point Removal Started**\n\n`;
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Mount Point**: ${validated.mp}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Warning**: This will permanently delete the mount point and all its data.\n`;
    output += `**Note**: The container should be stopped for this operation.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Remove LXC Mount Point');
  }
}

/**
 * Move a QEMU VM disk to different storage
 * Requires elevated permissions
 */
export async function moveDiskVM(
  client: ProxmoxApiClient,
  config: Config,
  input: MoveDiskVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'move VM disk');

    const validated = moveDiskVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeStorage = validateStorageName(validated.storage);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/move_disk`,
      'POST',
      {
        disk: validated.disk,
        storage: safeStorage,
        delete: validated.delete !== false ? 1 : 0,
      }
    );

    let output = `📦 **VM Disk Move Started**\n\n`;
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **Target Storage**: ${safeStorage}\n`;
    output += `• **Delete Source**: ${validated.delete !== false ? 'Yes' : 'No'}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Note**: Disk move operation may take several minutes depending on disk size.\n`;
    output += `**Tip**: The VM should be stopped for this operation in most configurations.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Move VM Disk');
  }
}

/**
 * Move an LXC container disk to different storage
 * Requires elevated permissions
 */
export async function moveDiskLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: MoveDiskLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'move LXC disk');

    const validated = moveDiskLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeStorage = validateStorageName(validated.storage);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/move_volume`,
      'POST',
      {
        volume: validated.disk,
        storage: safeStorage,
        delete: validated.delete !== false ? 1 : 0,
      }
    );

    let output = `📦 **LXC Disk Move Started**\n\n`;
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Volume**: ${validated.disk}\n`;
    output += `• **Target Storage**: ${safeStorage}\n`;
    output += `• **Delete Source**: ${validated.delete !== false ? 'Yes' : 'No'}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Valid volumes**: rootfs, mp0, mp1, mp2, etc.\n\n`;
    output += `**Note**: Volume move operation may take several minutes depending on volume size.\n`;
    output += `**Tip**: The container should be stopped for this operation.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Move LXC Disk');
  }
}
