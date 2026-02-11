import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID, validateCommand } from '../validators/index.js';
import { getSshClient, shellQuote } from '../client/ssh.js';
import { lxcExecSchema } from '../schemas/lxc-exec.js';
import type { LxcExecInput } from '../schemas/lxc-exec.js';

export async function handleLxcExec(
  _client: ProxmoxApiClient,
  config: Config,
  input: LxcExecInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'LXC exec');

    if (!config.sshEnabled) {
      throw new Error(
        'SSH is not enabled. Set PROXMOX_SSH_ENABLED=true, PROXMOX_SSH_KEY_PATH, ' +
          'and PROXMOX_SSH_NODE to use LXC exec.'
      );
    }

    if (!config.sshKeyPath) {
      throw new Error(
        'PROXMOX_SSH_KEY_PATH is required when SSH is enabled'
      );
    }

    if (!config.sshNode) {
      throw new Error(
        'PROXMOX_SSH_NODE is required when SSH is enabled (the Proxmox node name reachable via SSH)'
      );
    }

    const validated = lxcExecSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeCommand = validateCommand(validated.command);

    if (safeNode !== config.sshNode) {
      throw new Error(
        `Node mismatch: requested "${safeNode}" but SSH is configured for "${config.sshNode}". ` +
          'LXC exec can only target containers on the SSH-connected node.'
      );
    }

    const sshHost = config.sshHost ?? config.host;
    const ssh = getSshClient({
      host: sshHost,
      port: config.sshPort,
      username: config.sshUser,
      privateKeyPath: config.sshKeyPath,
      hostKeyFingerprint: config.sshHostKeyFingerprint,
    });

    // Fixed command template: only `pct exec` is allowed via SSH
    const pctCommand = `/usr/sbin/pct exec ${safeVmid} -- /bin/sh -c ${shellQuote(safeCommand)}`;
    const result = await ssh.exec(pctCommand, validated.timeout);

    const parts: string[] = [
      `**LXC Command Result**\n`,
      `* **Node**: ${safeNode}`,
      `* **Container**: ${safeVmid}`,
      `* **Command**: \`${safeCommand}\``,
      `* **Exit Code**: ${result.exitCode}`,
    ];

    if (result.stdout.trim()) {
      parts.push(`\n**stdout**:\n\`\`\`\n${result.stdout.trim()}\n\`\`\``);
    }

    if (result.stderr.trim()) {
      parts.push(`\n**stderr**:\n\`\`\`\n${result.stderr.trim()}\n\`\`\``);
    }

    const isError = result.exitCode !== 0;
    const output = parts.join('\n');

    return {
      content: [{ type: 'text', text: isError ? `${output}` : output }],
      isError,
    };
  } catch (error) {
    return formatErrorResponse(error as Error, 'LXC Exec');
  }
}
