import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID, validateCommand } from '../validators/index.js';
import { executeVmCommandSchema } from '../schemas/vm.js';
import type { ExecuteVmCommandInput } from '../schemas/vm.js';

export async function executeVMCommand(
  client: ProxmoxApiClient,
  config: Config,
  input: ExecuteVmCommandInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'execute VM command');

    const validated = executeVmCommandSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeCommand = validateCommand(validated.command);
    const type = validated.type || 'qemu';

    const escapeShellArg = (value: string): string => {
      return `'${value.replace(/'/g, `'\\''`)}'`;
    };

    if (type === 'lxc') {
      const wrappedCommand = `pct exec ${safeVmid} -- sh -c ${escapeShellArg(safeCommand)}`;
      const result = await client.request(
        `/nodes/${safeNode}/execute`,
        'POST',
        { commands: wrappedCommand }
      );

      const output =
        `⚡ **Command Execution Started**\n\n` +
        `• **Container ID**: ${safeVmid}\n` +
        `• **Type**: LXC\n` +
        `• **Command**: \`${safeCommand}\`\n` +
        `• **Task ID**: ${result || 'N/A'}\n\n` +
        `**Note**: LXC exec runs via host \`pct exec\` and returns a task ID.`;

      return formatToolResponse(output);
    }

    const result = (await client.request(
      `/nodes/${safeNode}/${type}/${safeVmid}/agent/exec`,
      'POST',
      { command: ['sh', '-c', safeCommand] }
    )) as { pid: number };

    const output =
      `⚡ **Command Execution Started**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Type**: ${type.toUpperCase()}\n` +
      `• **Command**: \`${safeCommand}\`\n` +
      `• **PID**: ${result.pid}\n\n` +
      `**Note**: Command runs asynchronously via QEMU guest agent.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Execute VM Command');
  }
}
