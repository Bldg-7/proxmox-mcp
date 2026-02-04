import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import {
  startLxcSchema,
  startVmSchema,
  stopLxcSchema,
  stopVmSchema,
  deleteLxcSchema,
  deleteVmSchema,
  rebootLxcSchema,
  rebootVmSchema,
  shutdownLxcSchema,
  shutdownVmSchema,
  pauseVmSchema,
  resumeVmSchema,
} from '../schemas/vm.js';
import type {
  StartLxcInput,
  StartVmInput,
  StopLxcInput,
  StopVmInput,
  DeleteLxcInput,
  DeleteVmInput,
  RebootLxcInput,
  RebootVmInput,
  ShutdownLxcInput,
  ShutdownVmInput,
  PauseVmInput,
  ResumeVmInput,
} from '../schemas/vm.js';

/**
 * Start an LXC container
 * Requires elevated permissions
 */
export async function startLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: StartLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'start LXC container');

    // Validate input
    const validated = startLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/status/start`,
      'POST'
    );

    // Format success response
    const output = `▶️  **LXC Container Start Initiated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The container is starting. Use \`get_vm_status\` to check progress.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Start LXC Container');
  }
}

/**
 * Start a QEMU VM
 * Requires elevated permissions
 */
export async function startVM(
  client: ProxmoxApiClient,
  config: Config,
  input: StartVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'start VM');

    // Validate input
    const validated = startVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/start`,
      'POST'
    );

    // Format success response
    const output = `▶️  **VM Start Initiated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The VM is starting. Use \`get_vm_status\` to check progress.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Start VM');
  }
}

/**
 * Stop an LXC container (forceful)
 * Requires elevated permissions
 */
export async function stopLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: StopLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'stop LXC container');

    // Validate input
    const validated = stopLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/status/stop`,
      'POST'
    );

    // Format success response
    const output = `⏹️  **LXC Container Stop Initiated**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The container is stopping. Use \`get_vm_status\` to confirm it's stopped.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Stop LXC Container');
  }
}

/**
 * Stop a QEMU VM (forceful)
 * Requires elevated permissions
 */
export async function stopVM(
  client: ProxmoxApiClient,
  config: Config,
  input: StopVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'stop VM');

    // Validate input
    const validated = stopVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/stop`,
      'POST'
    );

    // Format success response
    const output = `⏹️  **VM Stop Initiated**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The VM is stopping. Use \`get_vm_status\` to confirm it's stopped.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Stop VM');
  }
}

/**
 * Delete an LXC container
 * Requires elevated permissions
 */
export async function deleteLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'delete LXC container');

    // Validate input
    const validated = deleteLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}`,
      'DELETE'
    );

    // Format success response
    const output = `🗑️  **LXC Container Deletion Started**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Deletion may take a moment to complete.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete LXC Container');
  }
}

/**
 * Delete a QEMU VM
 * Requires elevated permissions
 */
export async function deleteVM(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'delete VM');

    // Validate input
    const validated = deleteVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}`,
      'DELETE'
    );

    // Format success response
    const output = `🗑️  **VM Deletion Started**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `Deletion may take a moment to complete.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete VM');
  }
}

/**
 * Reboot an LXC container
 * Requires elevated permissions
 */
export async function rebootLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: RebootLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'reboot LXC container');

    // Validate input
    const validated = rebootLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/status/reboot`,
      'POST'
    );

    // Format success response
    const output = `🔄 **LXC Container Reboot Command Sent**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The container will restart momentarily.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Reboot LXC Container');
  }
}

/**
 * Reboot a QEMU VM
 * Requires elevated permissions
 */
export async function rebootVM(
  client: ProxmoxApiClient,
  config: Config,
  input: RebootVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'reboot VM');

    // Validate input
    const validated = rebootVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/reboot`,
      'POST'
    );

    // Format success response
    const output = `🔄 **VM Reboot Command Sent**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `The VM will restart momentarily.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Reboot VM');
  }
}

/**
 * Gracefully shutdown an LXC container
 * Requires elevated permissions
 */
export async function shutdownLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: ShutdownLxcInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'shutdown LXC container');

    // Validate input
    const validated = shutdownLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/lxc/${safeVmid}/status/shutdown`,
      'POST'
    );

    // Format success response
    const output = `⏸️  **LXC Container Shutdown Command Sent**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `This is a graceful shutdown. Use \`stop_lxc\` for forceful stop.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Shutdown LXC Container');
  }
}

/**
 * Gracefully shutdown a QEMU VM
 * Requires elevated permissions
 */
export async function shutdownVM(
  client: ProxmoxApiClient,
  config: Config,
  input: ShutdownVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'shutdown VM');

    // Validate input
    const validated = shutdownVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/shutdown`,
      'POST'
    );

    // Format success response
    const output = `⏸️  **VM Shutdown Command Sent**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `This is a graceful shutdown. Use \`stop_vm\` for forceful stop.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Shutdown VM');
  }
}

/**
 * Pause a QEMU VM (suspend)
 * Note: LXC containers do not support pause
 * Requires elevated permissions
 */
export async function pauseVM(
  client: ProxmoxApiClient,
  config: Config,
  input: PauseVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'pause VM');

    // Validate input
    const validated = pauseVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/suspend`,
      'POST'
    );

    // Format success response
    const output = `⏸️  **VM Pause Command Sent**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `VM is now paused. Use \`resume_vm\` to resume.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Pause VM');
  }
}

/**
 * Resume a paused QEMU VM
 * Note: LXC containers do not support resume
 * Requires elevated permissions
 */
export async function resumeVM(
  client: ProxmoxApiClient,
  config: Config,
  input: ResumeVmInput
): Promise<ToolResponse> {
  try {
    // Check elevated permissions
    requireElevated(config, 'resume VM');

    // Validate input
    const validated = resumeVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    // Call Proxmox API
    const result = await client.request(
      `/nodes/${safeNode}/qemu/${safeVmid}/status/resume`,
      'POST'
    );

    // Format success response
    const output = `▶️  **VM Resume Command Sent**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Node**: ${safeNode}\n` +
      `• **Task ID**: ${result || 'N/A'}\n\n` +
      `VM is now resuming from paused state.`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Resume VM');
  }
}
