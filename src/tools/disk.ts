import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
  formatBytes,
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
  getNodeLvmSchema,
  getNodeDisksSchema,
  getDiskSmartSchema,
  getNodeZfsSchema,
  initDiskGptSchema,
  wipeDiskSchema,
  getNodeLvmThinSchema,
  getNodeDirectorySchema,
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
  GetNodeLvmInput,
  GetNodeDisksInput,
  GetDiskSmartInput,
  GetNodeZfsInput,
  InitDiskGptInput,
  WipeDiskInput,
  GetNodeLvmThinInput,
  GetNodeDirectoryInput,
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

/**
 * Get SMART data for a disk
 * Does not require elevated permissions
 */
export async function getDiskSmart(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetDiskSmartInput
): Promise<ToolResponse> {
  try {
    const validated = getDiskSmartSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    let endpoint = `/nodes/${safeNode}/disks/smart?disk=${encodeURIComponent(validated.disk)}`;
    if (validated.health_only) {
      endpoint += '&health_only=1';
    }

    const result = await client.request(endpoint);

    // If health_only is true, return only health status
    if (validated.health_only) {
      const health = (result as { health?: string }).health || 'UNKNOWN';
      let output = `💾 **Disk Health Status**\n\n`;
      output += `• **Disk**: ${validated.disk}\n`;
      output += `• **Health**: ${health}\n`;
      return formatToolResponse(output);
    }

    // Return full SMART data with attributes
    const smartData = result as {
      health?: string;
      type?: string;
      attributes?: Array<{
        id: number;
        name: string;
        value: number;
        worst: number;
        threshold: number;
        raw: string;
      }>;
    };

    let output = `💾 **SMART Data**\n\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **Health**: ${smartData.health || 'UNKNOWN'}\n`;
    output += `• **Type**: ${smartData.type || 'UNKNOWN'}\n\n`;

    if (smartData.attributes && smartData.attributes.length > 0) {
      output += `**SMART Attributes**:\n\n`;
      output += `| ID | Name | Value | Worst | Threshold | Raw |\n`;
      output += `|----|------|-------|-------|-----------|-----|\n`;
      for (const attr of smartData.attributes) {
        output += `| ${attr.id} | ${attr.name} | ${attr.value} | ${attr.worst} | ${attr.threshold} | ${attr.raw} |\n`;
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Disk SMART');
  }
}

/**
 * Get LVM information for a node
 * Does not require elevated permissions
 */
export async function getNodeLvm(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeLvmInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeLvmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/disks/lvm`);

    const lvmData = result as {
      leaf: boolean;
      children?: Array<{
        leaf: boolean;
        name: string;
        size: number;
        free: number;
        children?: Array<{
          leaf: boolean;
          name: string;
          size: number;
          free: number;
        }>;
      }>;
    };

    // Handle no LVM configured
    if (!lvmData.children || lvmData.children.length === 0) {
      let output = `📦 **LVM Configuration**\n\n`;
      output += `• **Node**: ${safeNode}\n`;
      output += `• **Status**: No LVM volume groups configured\n`;
      return formatToolResponse(output);
    }

    // Format LVM tree structure
    let output = `📦 **LVM Volume Groups**\n\n`;
    output += `• **Node**: ${safeNode}\n\n`;

    for (const vg of lvmData.children) {
      output += `**Volume Group: ${vg.name}**\n`;
      output += `  • Size: ${(vg.size / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `  • Free: ${(vg.free / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `  • Used: ${(((vg.size - vg.free) / vg.size) * 100).toFixed(1)}%\n`;

      if (vg.children && vg.children.length > 0) {
        output += `  • Physical Volumes:\n`;
        for (const pv of vg.children) {
          output += `    - ${pv.name}\n`;
          output += `      Size: ${(pv.size / (1024 ** 3)).toFixed(2)} GB\n`;
        }
      }
      output += `\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node LVM');
  }
}

/**
 * Get ZFS pools on a node
 * Read-only operation (no elevated permissions required)
 */
export async function getNodeZfs(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeZfsInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeZfsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const pools = await client.request(`/nodes/${safeNode}/disks/zfs`);

    if (!Array.isArray(pools) || pools.length === 0) {
      return formatToolResponse(`💾 **ZFS Pools - ${safeNode}**\n\nNo ZFS pools found.`);
    }

    let output = `💾 **ZFS Pools - ${safeNode}**\n\n`;
    output += `Found ${pools.length} pool(s):\n\n`;

    for (const pool of pools) {
      output += `---\n`;
      output += `• **Name**: ${pool.name}\n`;
      output += `• **Size**: ${formatBytes(pool.size)}\n`;
      output += `• **Allocated**: ${formatBytes(pool.alloc)}\n`;
      output += `• **Free**: ${formatBytes(pool.free)}\n`;
      output += `• **Fragmentation**: ${pool.frag}%\n`;
      output += `• **Dedup Ratio**: ${pool.dedup.toFixed(2)}x\n`;
      output += `• **Health**: ${pool.health}\n`;
      output += `\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node ZFS');
  }
}

/**
 * Get list of physical disks on a node
 * Read-only operation (no elevated permissions required)
 */
export async function getNodeDisks(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeDisksInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeDisksSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const params: Record<string, unknown> = {};
    if (validated.include_partitions !== undefined) {
      params['include-partitions'] = validated.include_partitions;
    }
    if (validated.skip_smart !== undefined) {
      params.skipsmart = validated.skip_smart;
    }
    if (validated.type !== undefined) {
      params.type = validated.type;
    }

    let disks;
    if (Object.keys(params).length > 0) {
      disks = await client.request(
        `/nodes/${safeNode}/disks/list`,
        'GET',
        params
      );
    } else {
      disks = await client.request(`/nodes/${safeNode}/disks/list`);
    }

    if (!Array.isArray(disks) || disks.length === 0) {
      return formatToolResponse(`💿 **Node Disks - ${safeNode}**\n\nNo disks found.`);
    }

    let output = `💿 **Node Disks - ${safeNode}**\n\n`;
    output += `Found ${disks.length} disk(s):\n\n`;

    for (const disk of disks) {
      output += `---\n`;
      output += `• **Device**: ${disk.devpath}\n`;
      output += `• **Size**: ${formatBytes(disk.size)}\n`;
      if (disk.model) output += `• **Model**: ${disk.vendor || ''} ${disk.model}\n`;
      if (disk.serial) output += `• **Serial**: ${disk.serial}\n`;
      output += `• **Used**: ${disk.used || 'unused'}\n`;
      if (disk.health) output += `• **Health**: ${disk.health}\n`;
      output += `\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Disks');
  }
}

/**
 * Initialize GPT partition table on disk
 * Requires elevated permissions (destructive operation)
 */
export async function initDiskGpt(
  client: ProxmoxApiClient,
  config: Config,
  input: InitDiskGptInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'initialize disk GPT');

    const validated = initDiskGptSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const payload: Record<string, unknown> = {
      disk: validated.disk,
    };
    if (validated.uuid) {
      payload.uuid = validated.uuid;
    }

    const result = await client.request(
      `/nodes/${safeNode}/disks/initgpt`,
      'POST',
      payload
    );

    let output = `🔧 **Disk GPT Initialization Started**\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    if (validated.uuid) {
      output += `• **UUID**: ${validated.uuid}\n`;
    }
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Warning**: This will erase all data on the disk and initialize a new GPT partition table.\n`;
    output += `**Note**: The disk must not be in use by any storage or VM.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Initialize Disk GPT');
  }
}

/**
 * Wipe disk data
 * Requires elevated permissions (destructive operation)
 */
export async function wipeDisk(
  client: ProxmoxApiClient,
  config: Config,
  input: WipeDiskInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'wipe disk');

    const validated = wipeDiskSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(
      `/nodes/${safeNode}/disks/wipedisk`,
      'PUT',
      {
        disk: validated.disk,
      }
    );

    let output = `🗑️ **Disk Wipe Started**\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Disk**: ${validated.disk}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Warning**: This will permanently erase all data on the disk.\n`;
    output += `**Note**: The disk must not be in use by any storage or VM.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Wipe Disk');
  }
}

/**
 * Get LVM thin pools on a node
 * Read-only operation (no elevated permissions required)
 */
export async function getNodeLvmThin(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeLvmThinInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeLvmThinSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/disks/lvmthin`);

    const lvmThinData = result as {
      leaf: boolean;
      children?: Array<{
        leaf: boolean;
        name: string;
        size: number;
        free: number;
        children?: Array<{
          leaf: boolean;
          name: string;
          size: number;
          free: number;
        }>;
      }>;
    };

    if (!lvmThinData.children || lvmThinData.children.length === 0) {
      let output = `📦 **LVM Thin Pools**\n\n`;
      output += `• **Node**: ${safeNode}\n`;
      output += `• **Status**: No LVM thin pools configured\n`;
      return formatToolResponse(output);
    }

    let output = `📦 **LVM Thin Pools**\n\n`;
    output += `• **Node**: ${safeNode}\n\n`;

    for (const pool of lvmThinData.children) {
      output += `**Thin Pool: ${pool.name}**\n`;
      output += `  • Size: ${(pool.size / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `  • Free: ${(pool.free / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `  • Used: ${(((pool.size - pool.free) / pool.size) * 100).toFixed(1)}%\n`;

      if (pool.children && pool.children.length > 0) {
        output += `  • Volumes:\n`;
        for (const vol of pool.children) {
          output += `    - ${vol.name}\n`;
          output += `      Size: ${(vol.size / (1024 ** 3)).toFixed(2)} GB\n`;
        }
      }
      output += `\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node LVM Thin');
  }
}

/**
 * Get directory-based storage on a node
 * Read-only operation (no elevated permissions required)
 */
export async function getNodeDirectory(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeDirectoryInput
): Promise<ToolResponse> {
  try {
    const validated = getNodeDirectorySchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    const result = await client.request(`/nodes/${safeNode}/disks/directory`);

    const dirData = result as Array<{
      leaf: boolean;
      name: string;
      size: number;
      free: number;
    }>;

    if (!Array.isArray(dirData) || dirData.length === 0) {
      let output = `📁 **Directory Storage**\n\n`;
      output += `• **Node**: ${safeNode}\n`;
      output += `• **Status**: No directory-based storage configured\n`;
      return formatToolResponse(output);
    }

    let output = `📁 **Directory Storage**\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Count**: ${dirData.length} directory(ies)\n\n`;

    for (const dir of dirData) {
      output += `---\n`;
      output += `• **Name**: ${dir.name}\n`;
      output += `• **Size**: ${(dir.size / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `• **Free**: ${(dir.free / (1024 ** 3)).toFixed(2)} GB\n`;
      output += `• **Used**: ${(((dir.size - dir.free) / dir.size) * 100).toFixed(1)}%\n`;
      output += `\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Directory');
  }
}
