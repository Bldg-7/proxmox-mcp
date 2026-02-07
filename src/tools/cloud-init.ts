import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import type {
  GetCloudInitConfigInput,
  DumpCloudInitInput,
  RegenerateCloudInitInput,
} from '../schemas/cloud-init.js';

/**
 * Get cloud-init configuration items for a QEMU VM.
 */
export async function getCloudInitConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetCloudInitConfigInput
): Promise<ToolResponse> {
  try {
    const safeNode = validateNodeName(input.node);
    const safeVmid = validateVMID(input.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit`
    );

    const output =
      `☁️ **Cloud-Init Configuration**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Cloud-Init Config');
  }
}

/**
 * Dump rendered cloud-init configuration for a QEMU VM.
 * Returns raw cloud-init content (YAML for user-data, etc.).
 */
export async function dumpCloudInit(
  client: ProxmoxApiClient,
  _config: Config,
  input: DumpCloudInitInput
): Promise<ToolResponse> {
  try {
    const safeNode = validateNodeName(input.node);
    const safeVmid = validateVMID(input.vmid);

    const result = await client.request<string>(
      `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit/dump?type=${input.type}`
    );

    const output =
      `☁️ **Cloud-Init Dump (${input.type})**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Type**: ${input.type}\n\n` +
      `\`\`\`\n${result}\n\`\`\``;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Dump Cloud-Init Config');
  }
}

/**
 * Regenerate the cloud-init drive for a QEMU VM.
 * This re-creates the cloud-init ISO with current configuration.
 */
export async function regenerateCloudInit(
  client: ProxmoxApiClient,
  config: Config,
  input: RegenerateCloudInitInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'regenerate cloud-init drive');

    const safeNode = validateNodeName(input.node);
    const safeVmid = validateVMID(input.vmid);

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit`,
      'PUT'
    );

    const output =
      `☁️ **Cloud-Init Drive Regenerated**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `The cloud-init drive has been regenerated with current configuration.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Regenerate Cloud-Init');
  }
}
