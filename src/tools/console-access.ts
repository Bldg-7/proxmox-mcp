import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import {
  getVncProxySchema,
  getSpiceProxySchema,
  getTermProxySchema,
  getLxcVncProxySchema,
  getLxcTermProxySchema,
} from '../schemas/console-access.js';
import type {
  GetVncProxyInput,
  GetSpiceProxyInput,
  GetTermProxyInput,
  GetLxcVncProxyInput,
  GetLxcTermProxyInput,
} from '../schemas/console-access.js';

function formatJsonBlock(data: unknown): string {
  return `\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
}

/**
 * Get VNC proxy ticket for a QEMU VM.
 */
export async function getVncProxy(
  client: ProxmoxApiClient,
  config: Config,
  input: GetVncProxyInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get VM VNC proxy ticket');

    const validated = getVncProxySchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/vncproxy`,
      'POST'
    );

    let output = '🖥️ **VM VNC Proxy Ticket**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM VNC Proxy');
  }
}

/**
 * Get SPICE proxy ticket for a QEMU VM.
 */
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

/**
 * Get terminal proxy ticket for a QEMU VM.
 */
export async function getTermProxy(
  client: ProxmoxApiClient,
  config: Config,
  input: GetTermProxyInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get VM terminal proxy ticket');

    const validated = getTermProxySchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/termproxy`,
      'POST'
    );

    let output = '⌨️ **VM Terminal Proxy Ticket**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM Terminal Proxy');
  }
}

/**
 * Get VNC proxy ticket for an LXC container.
 */
export async function getLxcVncProxy(
  client: ProxmoxApiClient,
  config: Config,
  input: GetLxcVncProxyInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get LXC VNC proxy ticket');

    const validated = getLxcVncProxySchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/vncproxy`,
      'POST'
    );

    let output = '🖥️ **LXC VNC Proxy Ticket**\n\n';
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get LXC VNC Proxy');
  }
}

/**
 * Get terminal proxy ticket for an LXC container.
 */
export async function getLxcTermProxy(
  client: ProxmoxApiClient,
  config: Config,
  input: GetLxcTermProxyInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'get LXC terminal proxy ticket');

    const validated = getLxcTermProxySchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/termproxy`,
      'POST'
    );

    let output = '⌨️ **LXC Terminal Proxy Ticket**\n\n';
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(result ?? {});

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get LXC Terminal Proxy');
  }
}
