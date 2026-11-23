import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import type { TransferJobs } from '../transfers/job-service.js';
import { requireTransfers } from './file-transfer.js';
import { formatRestoreListing } from '../formatters/restore-list.js';
import { validateNodeName, validateStorageName } from '../validators/index.js';
import {
  listStorageConfigSchema,
  getStorageConfigSchema,
  createStorageSchema,
  updateStorageSchema,
  deleteStorageSchema,
  downloadUrlToStorageSchema,
  listStorageContentSchema,
  deleteStorageContentSchema,
  listFileRestoreSchema,
  pruneBackupsSchema,
  fileRestoreSchema,
} from '../schemas/storage-management.js';
import type {
  ListStorageConfigInput,
  GetStorageConfigInput,
  CreateStorageInput,
  UpdateStorageInput,
  DeleteStorageInput,
  UploadToStorageInput,
  DownloadUrlToStorageInput,
  ListStorageContentInput,
  DeleteStorageContentInput,
  ListFileRestoreInput,
  DownloadFileRestoreInput,
  PruneBackupsInput,
  StorageConfigToolInput,
  StorageContentToolInput,
  FileRestoreInput,
} from '../schemas/storage-management.js';
import type { PoolToolInput } from '../schemas/pool-management.js';
import {
  listPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
} from './pool-management.js';

interface StorageContentEntry {
  volid?: string;
  content?: string;
  format?: string;
  size?: number;
  ctime?: number;
  vmid?: number;
  notes?: string;
  [key: string]: unknown;
}

function formatKeyValueEntries(data: Record<string, unknown>): string {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return 'No details available.';
  return entries
    .map(([key, value]) => `• **${key}**: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n');
}

/**
 * List storage configurations.
 */
export async function listStorageConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListStorageConfigInput
): Promise<ToolResponse> {
  try {
    listStorageConfigSchema.parse(input);
    const storages = (await client.request('/storage')) as Record<string, unknown>[];

    let output = '🗄️  **Storage Configurations**\n\n';

    if (!storages || storages.length === 0) {
      output += 'No storage configurations found.';
      return formatToolResponse(output);
    }

    for (const storage of storages) {
      const name = (storage.storage as string) ?? 'unknown';
      const type = (storage.type as string) ?? 'n/a';
      const content = (storage.content as string) ?? 'n/a';
      output += `• **${name}** (${type}) - content: ${content}`;
      if (storage.nodes) output += ` - nodes: ${storage.nodes}`;
      if (storage.disable !== undefined) {
        output += ` - ${storage.disable ? 'disabled' : 'enabled'}`;
      }
      output += '\n';
    }

    output += `\n**Total**: ${storages.length} storage config(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Storage Config');
  }
}

/**
 * Get storage configuration by name.
 */
export async function getStorageConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetStorageConfigInput
): Promise<ToolResponse> {
  try {
    const validated = getStorageConfigSchema.parse(input);
    const safeStorage = validateStorageName(validated.storage);
    const storage = (await client.request(
      `/storage/${encodeURIComponent(safeStorage)}`
    )) as Record<string, unknown>;

    let output = '🗄️  **Storage Configuration**\n\n';
    output += `• **Storage**: ${safeStorage}\n`;
    output += formatKeyValueEntries(storage);

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Storage Config');
  }
}

/**
 * Create storage configuration.
 */
export async function createStorage(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateStorageInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create storage');

    const validated = createStorageSchema.parse(input);
    const safeStorage = validateStorageName(validated.storage);
    const payload: Record<string, unknown> = {
      storage: safeStorage,
      type: validated.type,
    };

    if (validated.content) payload.content = validated.content;
    if (validated.path) payload.path = validated.path;
    if (validated.server) payload.server = validated.server;
    if (validated.export) payload.export = validated.export;
    if (validated.share) payload.share = validated.share;
    if (validated.username) payload.username = validated.username;
    if (validated.password) payload.password = validated.password;
    if (validated.domain) payload.domain = validated.domain;
    if (validated.smbversion) payload.smbversion = validated.smbversion;
    if (validated.nodes) payload.nodes = validated.nodes;
    if (validated.shared !== undefined) payload.shared = validated.shared;
    if (validated.disable !== undefined) payload.disable = validated.disable;
    if (validated.maxfiles !== undefined) payload.maxfiles = validated.maxfiles;
    if (validated['prune-backups']) payload['prune-backups'] = validated['prune-backups'];
    if (validated.pool) payload.pool = validated.pool;
    if (validated.vgname) payload.vgname = validated.vgname;
    if (validated.thinpool) payload.thinpool = validated.thinpool;
    if (validated.monhost) payload.monhost = validated.monhost;
    if (validated.fsname) payload.fsname = validated.fsname;
    if (validated.keyring) payload.keyring = validated.keyring;
    if (validated.portal) payload.portal = validated.portal;
    if (validated.target) payload.target = validated.target;
    if (validated.options) payload.options = validated.options;

    const result = await client.request('/storage', 'POST', payload);

    let output = '✅ **Storage Created**\n\n';
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Type**: ${validated.type}\n`;
    if (validated.content) output += `• **Content**: ${validated.content}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Storage');
  }
}

/**
 * Update storage configuration.
 */
export async function updateStorage(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateStorageInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update storage');

    const validated = updateStorageSchema.parse(input);
    const safeStorage = validateStorageName(validated.storage);
    const payload: Record<string, unknown> = {};

    if (validated.content) payload.content = validated.content;
    if (validated.path) payload.path = validated.path;
    if (validated.server) payload.server = validated.server;
    if (validated.export) payload.export = validated.export;
    if (validated.share) payload.share = validated.share;
    if (validated.username) payload.username = validated.username;
    if (validated.password) payload.password = validated.password;
    if (validated.domain) payload.domain = validated.domain;
    if (validated.smbversion) payload.smbversion = validated.smbversion;
    if (validated.nodes) payload.nodes = validated.nodes;
    if (validated.shared !== undefined) payload.shared = validated.shared;
    if (validated.disable !== undefined) payload.disable = validated.disable;
    if (validated.maxfiles !== undefined) payload.maxfiles = validated.maxfiles;
    if (validated['prune-backups']) payload['prune-backups'] = validated['prune-backups'];
    if (validated.pool) payload.pool = validated.pool;
    if (validated.vgname) payload.vgname = validated.vgname;
    if (validated.thinpool) payload.thinpool = validated.thinpool;
    if (validated.monhost) payload.monhost = validated.monhost;
    if (validated.fsname) payload.fsname = validated.fsname;
    if (validated.keyring) payload.keyring = validated.keyring;
    if (validated.portal) payload.portal = validated.portal;
    if (validated.target) payload.target = validated.target;
    if (validated.options) payload.options = validated.options;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/storage/${encodeURIComponent(safeStorage)}`,
      'PUT',
      payload
    );

    let output = '✅ **Storage Updated**\n\n';
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Storage');
  }
}

/**
 * Delete storage configuration.
 */
export async function deleteStorage(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteStorageInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete storage');

    const validated = deleteStorageSchema.parse(input);
    const safeStorage = validateStorageName(validated.storage);
    const result = await client.request(
      `/storage/${encodeURIComponent(safeStorage)}`,
      'DELETE'
    );

    let output = '🗑️  **Storage Deleted**\n\n';
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Storage');
  }
}

/**
 * Upload ISO/template file to storage.
 */
export async function uploadToStorage(
  _client: ProxmoxApiClient,
  config: Config,
  input: UploadToStorageInput,
  jobs?: TransferJobs,
): Promise<ToolResponse> {
  try {
    const service = requireTransfers(config, jobs);
    if (!config.fileTransfer?.uploadRoot) throw new Error('Upload requires PROXMOX_UPLOAD_ROOT');
    return formatToolResponse(JSON.stringify(service.start({kind:'upload', node:input.node, storage:input.storage,
      filename:input.filename, content:input.content, requestId:input.request_id, expectedSha256:input.expected_sha256})));
  } catch (error) {
    return formatErrorResponse(error as Error, 'Upload to Storage');
  }
}

/**
 * Download file from URL to storage.
 */
export async function downloadUrlToStorage(
  client: ProxmoxApiClient,
  config: Config,
  input: DownloadUrlToStorageInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'download URL to storage');

    const validated = downloadUrlToStorageSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);
    const payload: Record<string, unknown> = {
      url: validated.url,
      content: validated.content,
    };

    if (validated.filename) payload.filename = validated.filename;
    if (validated.checksum) payload.checksum = validated.checksum;
    if (validated['checksum-algorithm']) {
      payload['checksum-algorithm'] = validated['checksum-algorithm'];
    }
    if (validated['verify-certificates'] !== undefined) {
      payload['verify-certificates'] = validated['verify-certificates'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/download-url`,
      'POST',
      payload
    );

    let output = '🌐 **Storage URL Download Started**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Content**: ${validated.content}\n`;
    if (validated.filename) output += `• **Filename**: ${validated.filename}\n`;
    output += `• **Task ID**: ${result ?? 'N/A'}\n\n`;
    output += 'Download runs asynchronously.';

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Download URL to Storage');
  }
}

/**
 * List storage content.
 */
export async function listStorageContent(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListStorageContentInput
): Promise<ToolResponse> {
  try {
    const validated = listStorageContentSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const params = new URLSearchParams();
    if (validated.content) params.set('content', validated.content);
    if (validated.vmid !== undefined) params.set('vmid', validated.vmid.toString());

    const query = params.toString();
    const path = `/nodes/${safeNode}/storage/${safeStorage}/content${
      query ? `?${query}` : ''
    }`;
    const content = (await client.request(path)) as StorageContentEntry[];

    let output = `📦 **Storage Content**\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n\n`;

    if (!content || content.length === 0) {
      output += 'No storage content found.';
      return formatToolResponse(output);
    }

    for (const item of content) {
      const volid = item.volid ?? 'unknown';
      const contentType = item.content ?? 'n/a';
      output += `• **${volid}** (${contentType})`;
      if (item.size !== undefined) output += ` - ${item.size} bytes`;
      if (item.vmid !== undefined) output += ` [vmid: ${item.vmid}]`;
      if (item.notes) output += `\n  ${item.notes}`;
      output += '\n';
    }

    output += `\n**Total**: ${content.length} item(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Storage Content');
  }
}

/**
 * Delete storage content.
 */
export async function deleteStorageContent(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteStorageContentInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete storage content');

    const validated = deleteStorageContentSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);
    const encodedVolume = encodeURIComponent(validated.volume);

    const result = await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/content/${encodedVolume}`,
      'DELETE'
    );

    let output = '🗑️  **Storage Content Deleted**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Volume**: ${validated.volume}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Storage Content');
  }
}

/**
 * List files in backup for restore.
 */
export async function listFileRestore(
  client: ProxmoxApiClient,
  config: Config,
  input: ListFileRestoreInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'list files inside a PBS backup');
    const validated = listFileRestoreSchema.parse(input);
    if (validated.path !== undefined && validated.filepath !== undefined) throw new Error('Specify only filepath, not both filepath and path');
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const files = await client.storageTransfer.list({ node: safeNode, storage: safeStorage,
      volume: validated.volume, filepath: validated.filepath ?? validated.path ?? '/' });
    return formatToolResponse(formatRestoreListing(safeNode, safeStorage, validated.volume, files));
  } catch (error) {
    return formatErrorResponse(error as Error, 'List File Restore');
  }
}

/**
 * Download file from backup.
 */
export async function downloadFileRestore(
  _client: ProxmoxApiClient,
  config: Config,
  input: DownloadFileRestoreInput,
  jobs?: TransferJobs,
): Promise<ToolResponse> {
  try {
    const service = requireTransfers(config, jobs);
    return formatToolResponse(JSON.stringify(service.start({kind:'download', node:input.node, storage:input.storage,
      volume:input.volume, filepath:input.filepath, requestId:input.request_id, tar:input.archive === 'tar.zst', expectedSha256:input.expected_sha256})));
  } catch (error) {
    return formatErrorResponse(error as Error, 'Download File Restore');
  }
}

/**
 * Prune old backups from storage.
 */
export async function pruneBackups(
  client: ProxmoxApiClient,
  config: Config,
  input: PruneBackupsInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'prune backups');

    const validated = pruneBackupsSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const payload: Record<string, unknown> = {};
    if (validated['keep-last'] !== undefined) payload['keep-last'] = validated['keep-last'];
    if (validated['keep-hourly'] !== undefined) payload['keep-hourly'] = validated['keep-hourly'];
    if (validated['keep-daily'] !== undefined) payload['keep-daily'] = validated['keep-daily'];
    if (validated['keep-weekly'] !== undefined) payload['keep-weekly'] = validated['keep-weekly'];
    if (validated['keep-monthly'] !== undefined) payload['keep-monthly'] = validated['keep-monthly'];
    if (validated['keep-yearly'] !== undefined) payload['keep-yearly'] = validated['keep-yearly'];
    if (validated['prune-backups']) payload['prune-backups'] = validated['prune-backups'];
    if (validated['dry-run'] !== undefined) payload['dry-run'] = validated['dry-run'];
    if (validated.vmid !== undefined) payload.vmid = validated.vmid;
    if (validated.type) payload.type = validated.type;

    const result = await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/prunebackups`,
      'DELETE',
      Object.keys(payload).length ? payload : undefined
    );

    let output = '🧹 **Prune Backups**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    if (validated['dry-run']) output += '• **Dry Run**: yes\n';
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Prune Backups');
  }
}

export async function handleStorageConfigTool(
  client: ProxmoxApiClient,
  config: Config,
  input: StorageConfigToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return listStorageConfig(client, config, input);
    case 'get':
      return getStorageConfig(client, config, input);
    case 'cluster_usage': {
      const { getStorage } = await import('./vm-query.js');
      return getStorage(client, config, input);
    }
    case 'create':
      return createStorage(client, config, input);
    case 'update':
      return updateStorage(client, config, input);
    case 'delete':
      return deleteStorage(client, config, input);
    default:
      throw new Error(`Unknown storage_config action: ${(input as { action: string }).action}`);
  }
}

export async function handleStorageContentTool(
  client: ProxmoxApiClient,
  config: Config,
  input: StorageContentToolInput,
  jobs?: TransferJobs,
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return listStorageContent(client, config, input);
    case 'list_templates': {
      const { listTemplates } = await import('./vm-create.js');
      return listTemplates(client, config, input);
    }
    case 'upload':
      return uploadToStorage(client, config, input, jobs);
    case 'download_url':
      return downloadUrlToStorage(client, config, input);
    case 'delete':
      return deleteStorageContent(client, config, input);
    case 'prune':
      return pruneBackups(client, config, input);
    default:
      throw new Error(`Unknown storage_content action: ${(input as { action: string }).action}`);
  }
}

export async function handlePoolTool(
  client: ProxmoxApiClient,
  config: Config,
  input: PoolToolInput
): Promise<ToolResponse> {
  switch (input.action) {
    case 'list':
      return listPools(client, config, input);
    case 'get':
      return getPool(client, config, input);
    case 'create':
      return createPool(client, config, input);
    case 'update':
      return updatePool(client, config, input);
    case 'delete':
      return deletePool(client, config, input);
    default:
      throw new Error(`Unknown pool action: ${(input as { action: string }).action}`);
  }
}

export async function handleFileRestore(
  client: ProxmoxApiClient,
  config: Config,
  input: FileRestoreInput,
  jobs?: TransferJobs,
): Promise<ToolResponse> {
  const validated = fileRestoreSchema.parse(input);
  switch (validated.action) {
    case 'list':
      return listFileRestore(client, config, validated);
    case 'download':
      return downloadFileRestore(client, config, validated, jobs);
    default:
      return formatErrorResponse(
        new Error(`Unknown action: ${(validated as { action: string }).action}`),
        'File Restore'
      );
  }
}
