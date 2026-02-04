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
  createBackupLxcSchema,
  createBackupVmSchema,
  listBackupsSchema,
  restoreBackupLxcSchema,
  restoreBackupVmSchema,
  deleteBackupSchema,
} from '../schemas/backup.js';
import type {
  CreateBackupLxcInput,
  CreateBackupVmInput,
  ListBackupsInput,
  RestoreBackupLxcInput,
  RestoreBackupVmInput,
  DeleteBackupInput,
} from '../schemas/backup.js';

/**
 * Create a backup of an LXC container
 * Requires elevated permissions
 */
export async function createBackupLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateBackupLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create LXC backup');

    const validated = createBackupLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/vzdump`,
      'POST',
      {
        vmid: safeVmid,
        storage: validated.storage || 'local',
        mode: validated.mode || 'snapshot',
        compress: validated.compress || 'zstd',
      }
    );

    let output = `💾 **Backup Creation Started**\n\n`;
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${validated.storage || 'local'}\n`;
    output += `• **Mode**: ${validated.mode || 'snapshot'}\n`;
    output += `• **Compression**: ${validated.compress || 'zstd'}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Backup Modes**:\n`;
    output += `  • snapshot: Quick backup using snapshots (recommended)\n`;
    output += `  • suspend: Suspends container during backup\n`;
    output += `  • stop: Stops container during backup\n\n`;
    output += `Use \`list_backups\` to view all backups.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create LXC Backup');
  }
}

/**
 * Create a backup of a QEMU VM
 * Requires elevated permissions
 */
export async function createBackupVM(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateBackupVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create VM backup');

    const validated = createBackupVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/vzdump`,
      'POST',
      {
        vmid: safeVmid,
        storage: validated.storage || 'local',
        mode: validated.mode || 'snapshot',
        compress: validated.compress || 'zstd',
      }
    );

    let output = `💾 **Backup Creation Started**\n\n`;
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${validated.storage || 'local'}\n`;
    output += `• **Mode**: ${validated.mode || 'snapshot'}\n`;
    output += `• **Compression**: ${validated.compress || 'zstd'}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Backup Modes**:\n`;
    output += `  • snapshot: Quick backup using snapshots (recommended)\n`;
    output += `  • suspend: Suspends VM during backup\n`;
    output += `  • stop: Stops VM during backup\n\n`;
    output += `Use \`list_backups\` to view all backups.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create VM Backup');
  }
}

/**
 * List all backups on a storage
 * Requires elevated permissions
 */
export async function listBackups(
  client: ProxmoxApiClient,
  config: Config,
  input: ListBackupsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'list backups');

    const validated = listBackupsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const storage = validated.storage || 'local';

    const backups = (await client.request(
      `/nodes/${safeNode}/storage/${storage}/content?content=backup`
    )) as Array<{
      volid: string;
      size?: number;
      ctime?: number;
    }>;

    let output = `📦 **Backups on ${storage}**\n\n`;

    if (!backups || backups.length === 0) {
      output += `No backups found on storage \`${storage}\`.\n\n`;
      output += `Use \`create_backup_lxc\` or \`create_backup_vm\` to create backups.`;
    } else {
      // Sort by creation time (newest first)
      const sorted = backups.sort((a, b) => (b.ctime || 0) - (a.ctime || 0));

      for (const backup of sorted) {
        // Parse filename to extract VM type and ID
        const filename = backup.volid.split('/').pop() || backup.volid;
        const match = filename.match(/vzdump-(lxc|qemu)-(\d+)-/);
        const vmType = match ? match[1].toUpperCase() : 'UNKNOWN';
        const vmId = match ? match[2] : 'N/A';

        output += `**${filename}**\n`;
        output += `   • VM ID: ${vmId} (${vmType})\n`;
        output += `   • Size: ${backup.size ? formatBytes(backup.size) : 'N/A'}\n`;
        if (backup.ctime) {
          const date = new Date(backup.ctime * 1000);
          output += `   • Created: ${date.toLocaleString()}\n`;
        }
        output += `   • Volume: ${backup.volid}\n\n`;
      }
      output += `**Total**: ${sorted.length} backup(s)`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Backups');
  }
}

/**
 * Restore an LXC container from backup
 * Requires elevated permissions
 */
export async function restoreBackupLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: RestoreBackupLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'restore LXC backup');

    const validated = restoreBackupLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const body: Record<string, unknown> = {
      vmid: safeVmid,
      archive: validated.archive,
      restore: 1,
    };

    if (validated.storage) {
      body.storage = validated.storage;
    }

    const result = await client.request(
      `/nodes/${safeNode}/lxc`,
      'POST',
      body
    );

    let output = `♻️  **Backup Restore Started**\n\n`;
    output += `• **New Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Archive**: ${validated.archive}\n`;
    if (validated.storage) {
      output += `• **Storage**: ${validated.storage}\n`;
    }
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Note**: Restore operation may take several minutes depending on backup size.\n`;
    output += `**Tip**: Use \`get_vm_status\` to check the restored container status after completion.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Restore LXC Backup');
  }
}

/**
 * Restore a QEMU VM from backup
 * Requires elevated permissions
 */
export async function restoreBackupVM(
  client: ProxmoxApiClient,
  config: Config,
  input: RestoreBackupVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'restore VM backup');

    const validated = restoreBackupVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const body: Record<string, unknown> = {
      vmid: safeVmid,
      archive: validated.archive,
      restore: 1,
    };

    if (validated.storage) {
      body.storage = validated.storage;
    }

    const result = await client.request(
      `/nodes/${safeNode}/qemu`,
      'POST',
      body
    );

    let output = `♻️  **Backup Restore Started**\n\n`;
    output += `• **New VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Archive**: ${validated.archive}\n`;
    if (validated.storage) {
      output += `• **Storage**: ${validated.storage}\n`;
    }
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Note**: Restore operation may take several minutes depending on backup size.\n`;
    output += `**Tip**: Use \`get_vm_status\` to check the restored VM status after completion.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Restore VM Backup');
  }
}

/**
 * Delete a backup file from storage
 * Requires elevated permissions
 */
export async function deleteBackup(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteBackupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete backup');

    const validated = deleteBackupSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    // URL-encode the volume parameter
    const encodedVolume = encodeURIComponent(validated.volume);

    const result = await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/content/${encodedVolume}`,
      'DELETE'
    );

    let output = `🗑️  **Backup Deletion Started**\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Volume**: ${validated.volume}\n`;
    output += `• **Task ID**: ${result || 'N/A'}\n\n`;
    output += `**Warning**: Backup file will be permanently deleted from storage.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Backup');
  }
}
