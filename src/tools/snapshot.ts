import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID, validateSnapshotName } from '../validators/index.js';
import {
  createSnapshotLxcSchema,
  createSnapshotVmSchema,
  listSnapshotsLxcSchema,
  listSnapshotsVmSchema,
  rollbackSnapshotLxcSchema,
  rollbackSnapshotVmSchema,
  deleteSnapshotLxcSchema,
  deleteSnapshotVmSchema,
} from '../schemas/snapshot.js';
import type {
  CreateSnapshotLxcInput,
  CreateSnapshotVmInput,
  ListSnapshotsLxcInput,
  ListSnapshotsVmInput,
  RollbackSnapshotLxcInput,
  RollbackSnapshotVmInput,
  DeleteSnapshotLxcInput,
  DeleteSnapshotVmInput,
} from '../schemas/snapshot.js';

/**
 * Create a snapshot of an LXC container
 * Requires elevated permissions
 */
export async function createSnapshotLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSnapshotLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create LXC snapshot');

    const validated = createSnapshotLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/snapshot`,
      'POST',
      {
        snapname: safeSnapname,
        description: validated.description || '',
      }
    );

    let output = `📸 **Snapshot Created**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n`;

    if (validated.description) {
      output += `• **Description**: ${validated.description}\n`;
    }

    output += `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Use \`list_snapshots_lxc\` to view all snapshots.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create LXC Snapshot');
  }
}

/**
 * Create a snapshot of a QEMU VM
 * Requires elevated permissions
 */
export async function createSnapshotVM(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateSnapshotVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create VM snapshot');

    const validated = createSnapshotVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/snapshot`,
      'POST',
      {
        snapname: safeSnapname,
        description: validated.description || '',
      }
    );

    let output = `📸 **Snapshot Created**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n`;

    if (validated.description) {
      output += `• **Description**: ${validated.description}\n`;
    }

    output += `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Use \`list_snapshots_vm\` to view all snapshots.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create VM Snapshot');
  }
}

/**
 * List all snapshots of an LXC container
 * No permission check required (read operation)
 */
export async function listSnapshotsLxc(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSnapshotsLxcInput
): Promise<ToolResponse> {
  try {
    const validated = listSnapshotsLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const snapshots = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/snapshot`
    ) as Array<{
      name: string;
      description?: string;
      snaptime?: number;
      parent?: string;
    }>;

    let output = `📸 **Snapshots for Container ${safeVmid}**\n\n`;

    if (!snapshots || snapshots.length === 0) {
      output += 'No snapshots found.\n';
    } else {
      // Filter out 'current' pseudo-snapshot and sort by snaptime (newest first)
      const realSnapshots = snapshots
        .filter(snap => snap.name !== 'current')
        .sort((a, b) => (b.snaptime || 0) - (a.snaptime || 0));

      if (realSnapshots.length === 0) {
        output += 'No snapshots found.\n';
      } else {
        for (const snap of realSnapshots) {
          output += `**${snap.name}**\n`;
          if (snap.description) {
            output += `   • Description: ${snap.description}\n`;
          }
          if (snap.snaptime) {
            const date = new Date(snap.snaptime * 1000);
            output += `   • Date: ${date.toLocaleString()}\n`;
          }
          if (snap.parent) {
            output += `   • Parent: ${snap.parent}\n`;
          }
          output += '\n';
        }
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List LXC Snapshots');
  }
}

/**
 * List all snapshots of a QEMU VM
 * No permission check required (read operation)
 */
export async function listSnapshotsVM(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListSnapshotsVmInput
): Promise<ToolResponse> {
  try {
    const validated = listSnapshotsVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const snapshots = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/snapshot`
    ) as Array<{
      name: string;
      description?: string;
      snaptime?: number;
      parent?: string;
    }>;

    let output = `📸 **Snapshots for VM ${safeVmid}**\n\n`;

    if (!snapshots || snapshots.length === 0) {
      output += 'No snapshots found.\n';
    } else {
      // Filter out 'current' pseudo-snapshot and sort by snaptime (newest first)
      const realSnapshots = snapshots
        .filter(snap => snap.name !== 'current')
        .sort((a, b) => (b.snaptime || 0) - (a.snaptime || 0));

      if (realSnapshots.length === 0) {
        output += 'No snapshots found.\n';
      } else {
        for (const snap of realSnapshots) {
          output += `**${snap.name}**\n`;
          if (snap.description) {
            output += `   • Description: ${snap.description}\n`;
          }
          if (snap.snaptime) {
            const date = new Date(snap.snaptime * 1000);
            output += `   • Date: ${date.toLocaleString()}\n`;
          }
          if (snap.parent) {
            output += `   • Parent: ${snap.parent}\n`;
          }
          output += '\n';
        }
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List VM Snapshots');
  }
}

/**
 * Rollback an LXC container to a snapshot
 * Requires elevated permissions
 */
export async function rollbackSnapshotLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: RollbackSnapshotLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'rollback LXC snapshot');

    const validated = rollbackSnapshotLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/snapshot/${safeSnapname}/rollback`,
      'POST',
      {}
    );

    const output = `⏮️  **Snapshot Rollback Initiated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `**Warning**: This will revert the container to the snapshot state. Current state will be lost.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Rollback LXC Snapshot');
  }
}

/**
 * Rollback a QEMU VM to a snapshot
 * Requires elevated permissions
 */
export async function rollbackSnapshotVM(
  client: ProxmoxApiClient,
  config: Config,
  input: RollbackSnapshotVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'rollback VM snapshot');

    const validated = rollbackSnapshotVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/snapshot/${safeSnapname}/rollback`,
      'POST',
      {}
    );

    const output = `⏮️  **Snapshot Rollback Initiated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `**Warning**: This will revert the VM to the snapshot state. Current state will be lost.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Rollback VM Snapshot');
  }
}

/**
 * Delete a snapshot of an LXC container
 * Requires elevated permissions
 */
export async function deleteSnapshotLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSnapshotLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete LXC snapshot');

    const validated = deleteSnapshotLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/snapshot/${safeSnapname}`,
      'DELETE'
    );

    const output = `🗑️  **Snapshot Deleted**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete LXC Snapshot');
  }
}

/**
 * Delete a snapshot of a QEMU VM
 * Requires elevated permissions
 */
export async function deleteSnapshotVM(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteSnapshotVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete VM snapshot');

    const validated = deleteSnapshotVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeSnapname = validateSnapshotName(validated.snapname);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/snapshot/${safeSnapname}`,
      'DELETE'
    );

    const output = `🗑️  **Snapshot Deleted**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Snapshot Name**: ${safeSnapname}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete VM Snapshot');
  }
}
