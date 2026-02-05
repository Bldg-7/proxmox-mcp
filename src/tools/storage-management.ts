import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateStorageName } from '../validators/index.js';
import {
  listStorageConfigSchema,
  getStorageConfigSchema,
  createStorageSchema,
  updateStorageSchema,
  deleteStorageSchema,
  uploadToStorageSchema,
  downloadUrlToStorageSchema,
  listStorageContentSchema,
  deleteStorageContentSchema,
  listFileRestoreSchema,
  downloadFileRestoreSchema,
  pruneBackupsSchema,
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
} from '../schemas/storage-management.js';

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

interface FileRestoreEntry {
  filepath?: string;
  path?: string;
  filename?: string;
  size?: number;
  type?: string;
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
  client: ProxmoxApiClient,
  config: Config,
  input: UploadToStorageInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'upload to storage');

    const validated = uploadToStorageSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);
    const payload: Record<string, unknown> = {
      content: validated.content,
      filename: validated.filename,
    };

    if (validated.checksum) payload.checksum = validated.checksum;
    if (validated['checksum-algorithm']) {
      payload['checksum-algorithm'] = validated['checksum-algorithm'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/upload`,
      'POST',
      payload
    );

    let output = '📤 **Storage Upload Started**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Content**: ${validated.content}\n`;
    output += `• **Filename**: ${validated.filename}\n`;
    output += `• **Task ID**: ${result ?? 'N/A'}\n\n`;
    output += 'Upload runs asynchronously.';

    return formatToolResponse(output);
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
  _config: Config,
  input: ListFileRestoreInput
): Promise<ToolResponse> {
  try {
    const validated = listFileRestoreSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const params = new URLSearchParams();
    params.set('volume', validated.volume);
    if (validated.path) params.set('path', validated.path);

    const path = `/nodes/${safeNode}/storage/${safeStorage}/file-restore/list?${params}`;
    const files = (await client.request(path)) as FileRestoreEntry[];

    let output = '🧾 **File Restore Listing**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Volume**: ${validated.volume}\n\n`;

    if (!files || files.length === 0) {
      output += 'No files found in backup.';
      return formatToolResponse(output);
    }

    for (const file of files) {
      const name = file.filepath ?? file.path ?? file.filename ?? 'unknown';
      output += `• **${name}**`;
      if (file.type) output += ` (${file.type})`;
      if (file.size !== undefined) output += ` - ${file.size} bytes`;
      output += '\n';
    }

    output += `\n**Total**: ${files.length} item(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List File Restore');
  }
}

/**
 * Download file from backup.
 */
export async function downloadFileRestore(
  client: ProxmoxApiClient,
  _config: Config,
  input: DownloadFileRestoreInput
): Promise<ToolResponse> {
  try {
    const validated = downloadFileRestoreSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const params = new URLSearchParams();
    params.set('volume', validated.volume);
    params.set('filepath', validated.filepath);

    const path = `/nodes/${safeNode}/storage/${safeStorage}/file-restore/download?${params}`;
    const result = await client.request(path);

    let output = '📥 **File Restore Download**\n\n';
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Storage**: ${safeStorage}\n`;
    output += `• **Volume**: ${validated.volume}\n`;
    output += `• **File**: ${validated.filepath}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
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
