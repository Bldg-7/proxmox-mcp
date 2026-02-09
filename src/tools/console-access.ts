import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import {
  consoleVncSchema,
  consoleTermSchema,
  getSpiceProxySchema,
} from '../schemas/console-access.js';
import type {
  ConsoleVncInput,
  ConsoleTermInput,
  GetSpiceProxyInput,
} from '../schemas/console-access.js';

function formatJsonBlock(data: unknown): string {
  return `\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
}

export async function handleConsoleVnc(
  client: ProxmoxApiClient,
  config: Config,
  input: ConsoleVncInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get VNC proxy ticket');

    const validated = consoleVncSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const guestPath = validated.type === 'vm' ? 'qemu' : 'lxc';
    const label = validated.type === 'vm' ? 'VM' : 'LXC';

    const result = await client.request(
      `/nodes/${safeNode}/${guestPath}/${safeVmid}/vncproxy`,
      'POST'
    );

    let output = `🖥️ **${label} VNC Proxy Ticket**\n\n`;
    output += `• **${validated.type === 'vm' ? 'VM' : 'Container'} ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VNC Proxy');
  }
}

export async function handleConsoleTerm(
  client: ProxmoxApiClient,
  config: Config,
  input: ConsoleTermInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get terminal proxy ticket');

    const validated = consoleTermSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const guestPath = validated.type === 'vm' ? 'qemu' : 'lxc';
    const label = validated.type === 'vm' ? 'VM' : 'LXC';

    const result = await client.request(
      `/nodes/${safeNode}/${guestPath}/${safeVmid}/termproxy`,
      'POST'
    );

    let output = `⌨️ **${label} Terminal Proxy Ticket**\n\n`;
    output += `• **${validated.type === 'vm' ? 'VM' : 'Container'} ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Terminal Proxy');
  }
}

export async function getSpiceProxy(
  client: ProxmoxApiClient,
  config: Config,
  input: GetSpiceProxyInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get VM SPICE proxy ticket');

    const validated = getSpiceProxySchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/spiceproxy`,
      'POST'
    );

    let output = '🖥️ **VM SPICE Proxy Ticket**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM SPICE Proxy');
  }
}
