import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type { ProxmoxFirewallRule } from '../types/proxmox.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID, validateFirewallRulePos, validateFilePath, validateUsername } from '../validators/index.js';
import {
  migrateVmSchema,
  migrateLxcSchema,
  createTemplateVmSchema,
  createTemplateLxcSchema,
  getVmRrddataSchema,
  getLxcRrddataSchema,
  agentPingSchema,
  agentGetOsinfoSchema,
  agentGetFsinfoSchema,
  agentGetMemoryBlocksSchema,
  agentGetNetworkInterfacesSchema,
  agentGetTimeSchema,
  agentGetTimezoneSchema,
  agentGetVcpusSchema,
  agentExecSchema,
  agentExecStatusSchema,
  agentFileReadSchema,
  agentFileWriteSchema,
  agentGetHostnameSchema,
  agentGetUsersSchema,
  agentSetUserPasswordSchema,
  agentShutdownSchema,
  agentFsfreezeStatusSchema,
  agentFsfreezeFreezeSchema,
  agentFsfreezeThawSchema,
  agentFstrimSchema,
  agentGetMemoryBlockInfoSchema,
  agentSuspendDiskSchema,
  agentSuspendRamSchema,
  agentSuspendHybridSchema,
  listVmFirewallRulesSchema,
  getVmFirewallRuleSchema,
  createVmFirewallRuleSchema,
  updateVmFirewallRuleSchema,
  deleteVmFirewallRuleSchema,
  listLxcFirewallRulesSchema,
  getLxcFirewallRuleSchema,
  createLxcFirewallRuleSchema,
  updateLxcFirewallRuleSchema,
  deleteLxcFirewallRuleSchema,
} from '../schemas/vm-advanced.js';
import type {
  MigrateVmInput,
  MigrateLxcInput,
  CreateTemplateVmInput,
  CreateTemplateLxcInput,
  GetVmRrddataInput,
  GetLxcRrddataInput,
  AgentPingInput,
  AgentGetOsinfoInput,
  AgentGetFsinfoInput,
  AgentGetMemoryBlocksInput,
  AgentGetNetworkInterfacesInput,
  AgentGetTimeInput,
  AgentGetTimezoneInput,
  AgentGetVcpusInput,
  AgentExecInput,
  AgentExecStatusInput,
  AgentFileReadInput,
  AgentFileWriteInput,
  AgentGetHostnameInput,
  AgentGetUsersInput,
  AgentSetUserPasswordInput,
  AgentShutdownInput,
  AgentFsfreezeStatusInput,
  AgentFsfreezeFreezeInput,
  AgentFsfreezeThawInput,
  AgentFstrimInput,
  AgentGetMemoryBlockInfoInput,
  AgentSuspendDiskInput,
  AgentSuspendRamInput,
  AgentSuspendHybridInput,
  ListVmFirewallRulesInput,
  GetVmFirewallRuleInput,
  CreateVmFirewallRuleInput,
  UpdateVmFirewallRuleInput,
  DeleteVmFirewallRuleInput,
  ListLxcFirewallRulesInput,
  GetLxcFirewallRuleInput,
  CreateLxcFirewallRuleInput,
  UpdateLxcFirewallRuleInput,
  DeleteLxcFirewallRuleInput,
  AgentInfoInput,
  AgentHwInput,
  AgentExecToolInput,
  AgentFileInput,
  AgentFreezeInput,
  AgentPowerInput,
  AgentUserInput,
} from '../schemas/vm-advanced.js';

interface ProxmoxRrdDataPoint {
  [key: string]: number | string | null | undefined;
  time?: number;
}

function formatJsonBlock(data: unknown): string {
  return `\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
}

/**
 * Migrate a QEMU VM to another node.
 */
export async function migrateVm(
  client: ProxmoxApiClient,
  config: Config,
  input: MigrateVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'migrate VM');

    const validated = migrateVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeTarget = validateNodeName(validated.target);
    const payload: Record<string, unknown> = { target: safeTarget };

    if (validated.online !== undefined) payload.online = validated.online;
    if (validated.force !== undefined) payload.force = validated.force;
    if (validated.bwlimit !== undefined) payload.bwlimit = validated.bwlimit;
    if (validated['with-local-disks'] !== undefined) {
      payload['with-local-disks'] = validated['with-local-disks'];
    }
    if (validated['with-local-storage'] !== undefined) {
      payload['with-local-storage'] = validated['with-local-storage'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/migrate`,
      'POST',
      payload
    );

    const output =
      `🚚 **VM Migration Initiated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Source Node**: ${safeNode}\n` +
      `• **Target Node**: ${safeTarget}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Migration runs asynchronously.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Migrate VM');
  }
}

/**
 * Migrate an LXC container to another node.
 */
export async function migrateLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: MigrateLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'migrate LXC container');

    const validated = migrateLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeTarget = validateNodeName(validated.target);
    const payload: Record<string, unknown> = { target: safeTarget };

    if (validated.online !== undefined) payload.online = validated.online;
    if (validated.force !== undefined) payload.force = validated.force;
    if (validated.bwlimit !== undefined) payload.bwlimit = validated.bwlimit;
    if (validated['with-local-disks'] !== undefined) {
      payload['with-local-disks'] = validated['with-local-disks'];
    }
    if (validated['with-local-storage'] !== undefined) {
      payload['with-local-storage'] = validated['with-local-storage'];
    }

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/migrate`,
      'POST',
      payload
    );

    const output =
      `🚚 **LXC Migration Initiated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Source Node**: ${safeNode}\n` +
      `• **Target Node**: ${safeTarget}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Migration runs asynchronously.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Migrate LXC');
  }
}

/**
 * Convert a QEMU VM to a template.
 */
export async function createTemplateVm(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateTemplateVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'convert VM to template');

    const validated = createTemplateVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/template`,
      'POST'
    );

    const output =
      `✅ **VM Converted to Template**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Result**: ${result || 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create VM Template');
  }
}

/**
 * Convert an LXC container to a template.
 */
export async function createTemplateLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateTemplateLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'convert LXC container to template');

    const validated = createTemplateLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/template`,
      'POST'
    );

    const output =
      `✅ **LXC Converted to Template**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Result**: ${result || 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create LXC Template');
  }
}

/**
 * Get VM performance metrics (RRD data).
 */
export async function getVmRrddata(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetVmRrddataInput
): Promise<ToolResponse> {
  try {
    const validated = getVmRrddataSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const params = new URLSearchParams();
    if (validated.timeframe) params.set('timeframe', validated.timeframe);
    if (validated.cf) params.set('cf', validated.cf);

    const query = params.toString();
    const path = `/nodes/${safeNode}/qemu/${safeVmid}/rrddata${query ? `?${query}` : ''}`;
    const data = (await client.request(path)) as ProxmoxRrdDataPoint[];

    let output = '📈 **VM Performance Metrics**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;

    if (!data || data.length === 0) {
      output += '\nNo performance metrics available.';
      return formatToolResponse(output);
    }

    output += `• **Points**: ${data.length}`;
    output += formatJsonBlock(data.slice(0, 5));

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM RRD Data');
  }
}

/**
 * Get LXC performance metrics (RRD data).
 */
export async function getLxcRrddata(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetLxcRrddataInput
): Promise<ToolResponse> {
  try {
    const validated = getLxcRrddataSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const params = new URLSearchParams();
    if (validated.timeframe) params.set('timeframe', validated.timeframe);
    if (validated.cf) params.set('cf', validated.cf);

    const query = params.toString();
    const path = `/nodes/${safeNode}/lxc/${safeVmid}/rrddata${query ? `?${query}` : ''}`;
    const data = (await client.request(path)) as ProxmoxRrdDataPoint[];

    let output = '📈 **LXC Performance Metrics**\n\n';
    output += `• **Container ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;

    if (!data || data.length === 0) {
      output += '\nNo performance metrics available.';
      return formatToolResponse(output);
    }

    output += `• **Points**: ${data.length}`;
    output += formatJsonBlock(data.slice(0, 5));

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get LXC RRD Data');
  }
}

/**
 * Ping the QEMU guest agent.
 */
export async function agentPing(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentPingInput
): Promise<ToolResponse> {
  try {
    const validated = agentPingSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/ping`,
      'POST'
    );

    const output =
      `✅ **QEMU Guest Agent Ping**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Result**: ${result ?? 'pong'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Ping');
  }
}

/**
 * Get OS info via QEMU guest agent.
 */
export async function agentGetOsinfo(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetOsinfoInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetOsinfoSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const osinfo = await client.request(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-osinfo`);

    let output = '🧠 **Guest OS Information**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(osinfo);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get OS Info');
  }
}

/**
 * Get filesystem info via QEMU guest agent.
 */
export async function agentGetFsinfo(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetFsinfoInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetFsinfoSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const fsinfo = await client.request(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-fsinfo`);

    let output = '📁 **Guest Filesystem Information**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(fsinfo);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get FS Info');
  }
}

/**
 * Get memory block info via QEMU guest agent.
 */
export async function agentGetMemoryBlocks(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetMemoryBlocksInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetMemoryBlocksSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const blocks = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/get-memory-blocks`
    );

    let output = '🧠 **Guest Memory Blocks**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(blocks);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Memory Blocks');
  }
}

/**
 * Get network interfaces via QEMU guest agent.
 */
export async function agentGetNetworkInterfaces(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetNetworkInterfacesInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetNetworkInterfacesSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const interfaces = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/network-get-interfaces`
    );

    let output = '🌐 **Guest Network Interfaces**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(interfaces);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Network Interfaces');
  }
}

/**
 * Get guest time via QEMU guest agent.
 */
export async function agentGetTime(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetTimeInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetTimeSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const timeInfo = await client.request(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-time`);

    let output = '⏱️  **Guest Time**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(timeInfo);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Time');
  }
}

/**
 * Get guest timezone via QEMU guest agent.
 */
export async function agentGetTimezone(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetTimezoneInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetTimezoneSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const timezone = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/get-timezone`
    );

    let output = '🕒 **Guest Timezone**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(timezone);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Timezone');
  }
}

/**
 * Get guest vCPU info via QEMU guest agent.
 */
export async function agentGetVcpus(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetVcpusInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetVcpusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const vcpus = await client.request(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-vcpus`);

    let output = '🧩 **Guest vCPU Info**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}`;
    output += formatJsonBlock(vcpus);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get vCPUs');
  }
}

/**
 * Execute a command via QEMU guest agent.
 */
export async function agentExec(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentExecInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'execute guest agent command');

    const validated = agentExecSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const payload: Record<string, unknown> = {
      command: validated.command,
    };
    if (validated.args) payload.args = validated.args;
    if (validated['input-data']) payload['input-data'] = validated['input-data'];
    if (validated['capture-output'] !== undefined) {
      payload['capture-output'] = validated['capture-output'];
    }
    if (validated.timeout !== undefined) payload.timeout = validated.timeout;

    const result = (await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/exec`,
      'POST',
      payload
    )) as { pid?: number };

    let output = '⚡ **Guest Agent Command Started**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Command**: \`${validated.command}\`\n`;
    if (validated.args) output += `• **Args**: ${validated.args.join(' ')}\n`;
    if (result?.pid !== undefined) output += `• **PID**: ${result.pid}\n`;
    output += '\nUse `proxmox_agent_exec` with operation=status to check status.';

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Exec');
  }
}

/**
 * Get guest agent execution status.
 */
export async function agentExecStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentExecStatusInput
): Promise<ToolResponse> {
  try {
    const validated = agentExecStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePid = validated.pid;

    const status = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/exec-status?pid=${safePid}`
    );

    let output = '📋 **Guest Agent Exec Status**\n\n';
    output += `• **VM ID**: ${safeVmid}\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **PID**: ${safePid}`;
    output += formatJsonBlock(status);

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Exec Status');
  }
}

/**
 * Read file content from guest via QEMU agent.
 * Returns base64-decoded content (or base64 if binary).
 */
export async function agentFileRead(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFileReadInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'read files from guest');

    const validated = agentFileReadSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeFile = validateFilePath(validated.file);

    const result = await client.request<{
      content: string;
      'bytes-read': number;
      truncated?: boolean;
    }>(`/nodes/${safeNode}/qemu/${safeVmid}/agent/file-read`, 'GET', {
      file: safeFile,
    });

    // Decode base64 content
    let decodedContent: string;
    let isBinary = false;
    try {
      decodedContent = Buffer.from(result.content, 'base64').toString('utf-8');
    } catch {
      // Binary content - show base64
      decodedContent = result.content;
      isBinary = true;
    }

    const truncatedWarning = result.truncated
      ? '\n\n⚠️ **Warning**: Content was truncated (>16 MiB limit)'
      : '';

    const output =
      `📄 **File Read from Guest**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **File**: ${safeFile}\n` +
      `• **Bytes Read**: ${result['bytes-read']}\n` +
      (isBinary ? `• **Format**: Binary (base64 encoded)\n` : '') +
      truncatedWarning +
      `\n\n\`\`\`\n${decodedContent}\n\`\`\``;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent File Read');
  }
}

/**
 * Write content to file in guest via QEMU agent.
 * Content is base64-encoded before sending.
 */
export async function agentFileWrite(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFileWriteInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'write files to guest');

    const validated = agentFileWriteSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeFile = validateFilePath(validated.file);

    // Validate content size (60 KiB max before encoding)
    const contentBytes = Buffer.byteLength(validated.content, 'utf-8');
    if (contentBytes > 61440) {
      throw new Error(
        `Content too large: ${contentBytes} bytes (max 60 KiB = 61,440 bytes)`
      );
    }

    // Base64 encode content if encode is true (default)
    const encode = validated.encode !== false;
    const content = encode
      ? Buffer.from(validated.content).toString('base64')
      : validated.content;

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/file-write`,
      'POST',
      {
        file: safeFile,
        content,
        encode,
      }
    );

    const output =
      `📝 **File Written to Guest**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **File**: ${safeFile}\n` +
      `• **Size**: ${contentBytes} bytes\n` +
      `• **Encoded**: ${encode ? 'Yes (base64)' : 'No'}\n\n` +
      `File has been successfully written.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent File Write');
  }
}

/**
 * Get hostname from guest via QEMU agent.
 */
export async function agentGetHostname(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetHostnameInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetHostnameSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request<{ 'host-name': string }>(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/get-host-name`
    );

    const output =
      `🖥️ **Guest Hostname**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Hostname**: ${result['host-name']}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Hostname');
  }
}

/**
 * Get list of logged-in users from guest via QEMU agent.
 */
export async function agentGetUsers(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetUsersInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetUsersSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request<
      Array<{
        user: string;
        'login-time': number;
        domain?: string;
      }>
    >(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-users`);

    if (result.length === 0) {
      const output =
        `👥 **Logged-in Users**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n\n` +
        `No users currently logged in.`;
      return formatToolResponse(output);
    }

    const userList = result
      .map((u) => {
        const loginTime = new Date(u['login-time'] * 1000).toISOString();
        const domain = u.domain ? ` (${u.domain})` : '';
        return `  - **${u.user}**${domain} — logged in at ${loginTime}`;
      })
      .join('\n');

    const output =
      `👥 **Logged-in Users**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Count**: ${result.length}\n\n` +
      userList;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Users');
  }
}

/**
 * Set user password in guest via QEMU agent.
 * WARNING: Password is sent in plain text via API.
 */
export async function agentSetUserPassword(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentSetUserPasswordInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'set user password in guest');

    const validated = agentSetUserPasswordSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safeUsername = validateUsername(validated.username);

    // Note: Password is intentionally NOT logged
    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/set-user-password`,
      'POST',
      {
        username: safeUsername,
        password: validated.password,
        crypted: validated.crypted ?? false,
      }
    );

    const output =
      `🔐 **User Password Updated**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Username**: ${safeUsername}\n` +
      `• **Crypted**: ${validated.crypted ? 'Yes' : 'No'}\n\n` +
      `Password has been successfully updated.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Set User Password');
  }
}

/**
 * Shutdown guest via QEMU agent (graceful shutdown from inside guest).
 */
export async function agentShutdown(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentShutdownInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'shutdown guest via agent');

    const validated = agentShutdownSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/shutdown`,
      'POST'
    );

    const output =
      `🔌 **Guest Shutdown Initiated**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `Graceful shutdown has been initiated via guest agent.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Shutdown');
  }
}

/**
 * Get filesystem freeze status via QEMU agent.
 */
export async function agentFsfreezeStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentFsfreezeStatusInput
): Promise<ToolResponse> {
  try {
    const validated = agentFsfreezeStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const status = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/fsfreeze-status`,
      'POST'
    );

    const output =
      `❄️ **Filesystem Freeze Status**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Status**: ${status}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Fsfreeze Status');
  }
}

/**
 * Freeze guest filesystems via QEMU agent for consistent backup.
 */
export async function agentFsfreezeFreeze(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFsfreezeFreezeInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'freeze guest filesystems');

    const validated = agentFsfreezeFreezeSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/fsfreeze-freeze`,
      'POST'
    );

    const output =
      `❄️ **Filesystem Freeze**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Frozen Filesystems**: ${result}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Fsfreeze Freeze');
  }
}

/**
 * Thaw (unfreeze) guest filesystems via QEMU agent.
 */
export async function agentFsfreezeThaw(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFsfreezeThawInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'thaw guest filesystems');

    const validated = agentFsfreezeThawSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/fsfreeze-thaw`,
      'POST'
    );

    const output =
      `❄️ **Filesystem Thaw**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Thawed Filesystems**: ${result}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Fsfreeze Thaw');
  }
}

/**
 * Discard unused blocks on guest filesystems via QEMU agent.
 */
export async function agentFstrim(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFstrimInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'trim guest filesystems');

    const validated = agentFstrimSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/fstrim`,
      'POST'
    );

    let output =
      `💾 **Filesystem Trim**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n`;

    if (result && typeof result === 'object') {
      output += `\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
    } else {
      output += `• **Result**: ${result}`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Fstrim');
  }
}

/**
 * Get memory block size information via QEMU agent.
 */
export async function agentGetMemoryBlockInfo(
  client: ProxmoxApiClient,
  _config: Config,
  input: AgentGetMemoryBlockInfoInput
): Promise<ToolResponse> {
  try {
    const validated = agentGetMemoryBlockInfoSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const result = (await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/get-memory-block-info`,
      'GET'
    )) as { size?: number; [key: string]: unknown };

    let output =
      `🧠 **Memory Block Info**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n`;

    if (result?.size) {
      const sizeMB = result.size / (1024 * 1024);
      output += `• **Block Size**: ${result.size} bytes (${sizeMB} MB)`;
    } else {
      output += `\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Get Memory Block Info');
  }
}

/**
 * Suspend guest to disk (hibernate) via QEMU agent.
 */
export async function agentSuspendDisk(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentSuspendDiskInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'suspend guest to disk');

    const validated = agentSuspendDiskSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/suspend-disk`,
      'POST'
    );

    const output =
      `🔌 **Guest Suspended to Disk**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `Guest has been hibernated (suspended to disk).`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Suspend Disk');
  }
}

/**
 * Suspend guest to RAM (sleep) via QEMU agent.
 */
export async function agentSuspendRam(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentSuspendRamInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'suspend guest to RAM');

    const validated = agentSuspendRamSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/suspend-ram`,
      'POST'
    );

    const output =
      `🔌 **Guest Suspended to RAM**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `Guest has been put to sleep (suspended to RAM).`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Suspend RAM');
  }
}

/**
 * Hybrid suspend guest (RAM + disk) via QEMU agent.
 */
export async function agentSuspendHybrid(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentSuspendHybridInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'hybrid suspend guest');

    const validated = agentSuspendHybridSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/agent/suspend-hybrid`,
      'POST'
    );

    const output =
      `🔌 **Guest Hybrid Suspended**\n\n` +
      `• **Node**: ${safeNode}\n` +
      `• **VM ID**: ${safeVmid}\n\n` +
      `Guest has been hybrid suspended (RAM + disk).`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Suspend Hybrid');
  }
}

/**
 * List VM firewall rules.
 */
export async function listVmFirewallRules(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListVmFirewallRulesInput
): Promise<ToolResponse> {
  try {
    const validated = listVmFirewallRulesSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const rules = (await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/firewall/rules`
    )) as ProxmoxFirewallRule[];

    let output = '🛡️  **VM Firewall Rules**\n\n';

    if (!rules || rules.length === 0) {
      output += 'No firewall rules found.';
      return formatToolResponse(output);
    }

    for (const rule of rules) {
      output += `• **${rule.pos}** ${rule.type} ${rule.action}`;
      if (rule.proto) output += ` ${rule.proto}`;
      if (rule.source) output += ` src=${rule.source}`;
      if (rule.dest) output += ` dst=${rule.dest}`;
      if (rule.dport) output += ` dport=${rule.dport}`;
      if (rule.comment) output += `\n  ${rule.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${rules.length} rule(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List VM Firewall Rules');
  }
}

/**
 * Get VM firewall rule by position.
 */
export async function getVmFirewallRule(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetVmFirewallRuleInput
): Promise<ToolResponse> {
  try {
    const validated = getVmFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);

    const rule = (await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/firewall/rules/${safePos}`
    )) as ProxmoxFirewallRule;

    let output = '🛡️  **VM Firewall Rule**\n\n';
    output += `• **Position**: ${safePos}\n`;
    if (rule.type) output += `• **Type**: ${rule.type}\n`;
    if (rule.action) output += `• **Action**: ${rule.action}\n`;
    if (rule.proto) output += `• **Protocol**: ${rule.proto}\n`;
    if (rule.source) output += `• **Source**: ${rule.source}\n`;
    if (rule.dest) output += `• **Destination**: ${rule.dest}\n`;
    if (rule.dport) output += `• **Dest Port**: ${rule.dport}\n`;
    if (rule.comment) output += `• **Comment**: ${rule.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM Firewall Rule');
  }
}

/**
 * Create VM firewall rule.
 */
export async function createVmFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateVmFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create VM firewall rule');

    const validated = createVmFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const payload: Record<string, unknown> = {
      action: validated.action,
      type: validated.type,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.pos !== undefined) payload.pos = validateFirewallRulePos(validated.pos);
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/firewall/rules`,
      'POST',
      payload
    );

    let output = '✅ **VM Firewall Rule Created**\n\n';
    output += `• **Action**: ${validated.action}\n`;
    output += `• **Type**: ${validated.type}\n`;
    if (payload.pos !== undefined) output += `• **Position**: ${payload.pos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create VM Firewall Rule');
  }
}

/**
 * Update VM firewall rule.
 */
export async function updateVmFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateVmFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update VM firewall rule');

    const validated = updateVmFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload: Record<string, unknown> = {};

    if (validated.action) payload.action = validated.action;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.moveto !== undefined) payload.moveto = validated.moveto;
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;
    if (validated.type) payload.type = validated.type;

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/firewall/rules/${safePos}`,
      'PUT',
      payload
    );

    let output = '✅ **VM Firewall Rule Updated**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update VM Firewall Rule');
  }
}

/**
 * Delete VM firewall rule.
 */
export async function deleteVmFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteVmFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete VM firewall rule');

    const validated = deleteVmFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload = validated.digest ? { digest: validated.digest } : undefined;

    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/firewall/rules/${safePos}`,
      'DELETE',
      payload
    );

    let output = '🗑️  **VM Firewall Rule Deleted**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete VM Firewall Rule');
  }
}

/**
 * List LXC firewall rules.
 */
export async function listLxcFirewallRules(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListLxcFirewallRulesInput
): Promise<ToolResponse> {
  try {
    const validated = listLxcFirewallRulesSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const rules = (await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/firewall/rules`
    )) as ProxmoxFirewallRule[];

    let output = '🛡️  **LXC Firewall Rules**\n\n';

    if (!rules || rules.length === 0) {
      output += 'No firewall rules found.';
      return formatToolResponse(output);
    }

    for (const rule of rules) {
      output += `• **${rule.pos}** ${rule.type} ${rule.action}`;
      if (rule.proto) output += ` ${rule.proto}`;
      if (rule.source) output += ` src=${rule.source}`;
      if (rule.dest) output += ` dst=${rule.dest}`;
      if (rule.dport) output += ` dport=${rule.dport}`;
      if (rule.comment) output += `\n  ${rule.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${rules.length} rule(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List LXC Firewall Rules');
  }
}

/**
 * Get LXC firewall rule by position.
 */
export async function getLxcFirewallRule(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetLxcFirewallRuleInput
): Promise<ToolResponse> {
  try {
    const validated = getLxcFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);

    const rule = (await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/firewall/rules/${safePos}`
    )) as ProxmoxFirewallRule;

    let output = '🛡️  **LXC Firewall Rule**\n\n';
    output += `• **Position**: ${safePos}\n`;
    if (rule.type) output += `• **Type**: ${rule.type}\n`;
    if (rule.action) output += `• **Action**: ${rule.action}\n`;
    if (rule.proto) output += `• **Protocol**: ${rule.proto}\n`;
    if (rule.source) output += `• **Source**: ${rule.source}\n`;
    if (rule.dest) output += `• **Destination**: ${rule.dest}\n`;
    if (rule.dport) output += `• **Dest Port**: ${rule.dport}\n`;
    if (rule.comment) output += `• **Comment**: ${rule.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get LXC Firewall Rule');
  }
}

/**
 * Create LXC firewall rule.
 */
export async function createLxcFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateLxcFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create LXC firewall rule');

    const validated = createLxcFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const payload: Record<string, unknown> = {
      action: validated.action,
      type: validated.type,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.pos !== undefined) payload.pos = validateFirewallRulePos(validated.pos);
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/firewall/rules`,
      'POST',
      payload
    );

    let output = '✅ **LXC Firewall Rule Created**\n\n';
    output += `• **Action**: ${validated.action}\n`;
    output += `• **Type**: ${validated.type}\n`;
    if (payload.pos !== undefined) output += `• **Position**: ${payload.pos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create LXC Firewall Rule');
  }
}

/**
 * Update LXC firewall rule.
 */
export async function updateLxcFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateLxcFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update LXC firewall rule');

    const validated = updateLxcFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload: Record<string, unknown> = {};

    if (validated.action) payload.action = validated.action;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.dest) payload.dest = validated.dest;
    if (validated.digest) payload.digest = validated.digest;
    if (validated.dport) payload.dport = validated.dport;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.iface) payload.iface = validated.iface;
    if (validated.log) payload.log = validated.log;
    if (validated.macro) payload.macro = validated.macro;
    if (validated.moveto !== undefined) payload.moveto = validated.moveto;
    if (validated.proto) payload.proto = validated.proto;
    if (validated.source) payload.source = validated.source;
    if (validated.sport) payload.sport = validated.sport;
    if (validated.type) payload.type = validated.type;

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/firewall/rules/${safePos}`,
      'PUT',
      payload
    );

    let output = '✅ **LXC Firewall Rule Updated**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update LXC Firewall Rule');
  }
}

/**
 * Delete LXC firewall rule.
 */
export async function deleteLxcFirewallRule(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteLxcFirewallRuleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete LXC firewall rule');

    const validated = deleteLxcFirewallRuleSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);
    const safePos = validateFirewallRulePos(validated.pos);
    const payload = validated.digest ? { digest: validated.digest } : undefined;

    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/firewall/rules/${safePos}`,
      'DELETE',
      payload
    );

    let output = '🗑️  **LXC Firewall Rule Deleted**\n\n';
    output += `• **Position**: ${safePos}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete LXC Firewall Rule');
  }
}

export async function handleAgentInfo(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentInfoInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'query guest agent info');
    switch (input.operation) {
      case 'ping': return agentPing(client, config, input);
      case 'osinfo': return agentGetOsinfo(client, config, input);
      case 'fsinfo': return agentGetFsinfo(client, config, input);
      case 'network_interfaces': return agentGetNetworkInterfaces(client, config, input);
      case 'time': return agentGetTime(client, config, input);
      case 'timezone': return agentGetTimezone(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Info');
  }
}

export async function handleAgentHw(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentHwInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'query guest agent hardware info');
    switch (input.operation) {
      case 'memory_blocks': return agentGetMemoryBlocks(client, config, input);
      case 'vcpus': return agentGetVcpus(client, config, input);
      case 'memory_block_info': return agentGetMemoryBlockInfo(client, config, input);
      case 'hostname': return agentGetHostname(client, config, input);
      case 'users': return agentGetUsers(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Hardware');
  }
}

export async function handleAgentExec(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentExecToolInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'execute guest agent command');
    switch (input.operation) {
      case 'exec': return agentExec(client, config, input);
      case 'status': return agentExecStatus(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Exec');
  }
}

export async function handleAgentFile(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFileInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'access guest files');
    switch (input.operation) {
      case 'read': return agentFileRead(client, config, input);
      case 'write': return agentFileWrite(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent File');
  }
}

export async function handleAgentFreeze(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentFreezeInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'manage guest filesystem freeze');
    switch (input.operation) {
      case 'status': return agentFsfreezeStatus(client, config, input);
      case 'freeze': return agentFsfreezeFreeze(client, config, input);
      case 'thaw': return agentFsfreezeThaw(client, config, input);
      case 'fstrim': return agentFstrim(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Freeze');
  }
}

export async function handleAgentPower(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentPowerInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'control guest power state');
    switch (input.operation) {
      case 'shutdown': return agentShutdown(client, config, input);
      case 'suspend_disk': return agentSuspendDisk(client, config, input);
      case 'suspend_ram': return agentSuspendRam(client, config, input);
      case 'suspend_hybrid': return agentSuspendHybrid(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent Power');
  }
}

export async function handleAgentUser(
  client: ProxmoxApiClient,
  config: Config,
  input: AgentUserInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'manage guest users');
    switch (input.operation) {
      case 'set_password': return agentSetUserPassword(client, config, input);
      default: throw new Error(`Unknown operation: ${(input as { operation: string }).operation}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Agent User');
  }
}
