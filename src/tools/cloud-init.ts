import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import { cloudInitSchema } from '../schemas/cloud-init.js';
import type { CloudInitInput } from '../schemas/cloud-init.js';

export async function handleCloudInit(
  client: ProxmoxApiClient,
  config: Config,
  input: CloudInitInput
): Promise<ToolResponse> {
  try {
    const validated = cloudInitSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    switch (validated.action) {
      case 'get': {
        const result = await client.request(
          `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit`
        );

        const output =
          `☁️ **Cloud-Init Configuration**\n\n` +
          `• **Node**: ${safeNode}\n` +
          `• **VM ID**: ${safeVmid}\n\n` +
          `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;

        return formatToolResponse(output);
      }

      case 'dump': {
        const result = await client.request<string>(
          `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit/dump?type=${validated.dump_type}`
        );

        const output =
          `☁️ **Cloud-Init Dump (${validated.dump_type})**\n\n` +
          `• **Node**: ${safeNode}\n` +
          `• **VM ID**: ${safeVmid}\n` +
          `• **Type**: ${validated.dump_type}\n\n` +
          `\`\`\`\n${result}\n\`\`\``;

        return formatToolResponse(output);
      }

      case 'regenerate': {
        requireElevated(config, 'regenerate cloud-init drive');

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
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Cloud-Init');
  }
}
