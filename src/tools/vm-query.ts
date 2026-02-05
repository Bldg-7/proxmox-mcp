import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import type { ProxmoxVM, ProxmoxNode, ProxmoxStorage, VMType } from '../types/proxmox.js';
import {
  formatToolResponse,
  formatErrorResponse,
  formatBytes,
  formatUptime,
  formatCpuPercent,
} from '../formatters/index.js';
import { validateNodeName, validateVMID } from '../validators/index.js';
import { getVmsSchema, getVmStatusSchema, getStorageSchema, getVmConfigSchema, getLxcConfigSchema } from '../schemas/vm.js';
import type { GetVmsInput, GetVmStatusInput, GetStorageInput, GetVmConfigInput, GetLxcConfigInput } from '../schemas/vm.js';

interface VMWithType extends ProxmoxVM {
  type: VMType;
  node: string;
}

/**
 * List all VMs/LXCs across cluster with status.
 * No elevated permissions required.
 */
export async function getVMs(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetVmsInput
): Promise<ToolResponse> {
  try {
    const validated = getVmsSchema.parse(input);
    const nodeFilter = validated.node;
    const typeFilter = validated.type || 'all';

    const vms: VMWithType[] = [];

    if (nodeFilter) {
      // Single node logic
      const safeNode = validateNodeName(nodeFilter);
      if (typeFilter === 'all' || typeFilter === 'qemu') {
        const nodeVMs = (await client.request(`/nodes/${safeNode}/qemu`)) as ProxmoxVM[];
        vms.push(...nodeVMs.map((vm) => ({ ...vm, type: 'qemu' as VMType, node: safeNode })));
      }
      if (typeFilter === 'all' || typeFilter === 'lxc') {
        const nodeLXCs = (await client.request(`/nodes/${safeNode}/lxc`)) as ProxmoxVM[];
        vms.push(...nodeLXCs.map((vm) => ({ ...vm, type: 'lxc' as VMType, node: safeNode })));
      }
    } else {
      // All nodes logic
      const nodes = (await client.request('/nodes')) as ProxmoxNode[];

      for (const node of nodes) {
        if (typeFilter === 'all' || typeFilter === 'qemu') {
          const nodeVMs = (await client.request(`/nodes/${node.node}/qemu`)) as ProxmoxVM[];
          vms.push(...nodeVMs.map((vm) => ({ ...vm, type: 'qemu' as VMType, node: node.node })));
        }

        if (typeFilter === 'all' || typeFilter === 'lxc') {
          const nodeLXCs = (await client.request(`/nodes/${node.node}/lxc`)) as ProxmoxVM[];
          vms.push(...nodeLXCs.map((vm) => ({ ...vm, type: 'lxc' as VMType, node: node.node })));
        }
      }
    }

    // Sort by vmid (ascending)
    vms.sort((a, b) => parseInt(String(a.vmid)) - parseInt(String(b.vmid)));

    // Format output
    let output = '💻 **Virtual Machines**\n\n';

    if (vms.length === 0) {
      output += 'No virtual machines found.\n';
    } else {
      for (const vm of vms) {
        const status = vm.status === 'running' ? '🟢' : vm.status === 'stopped' ? '🔴' : '🟡';
        const typeIcon = vm.type === 'qemu' ? '🖥️' : '📦';
        const uptime = vm.uptime ? formatUptime(vm.uptime) : 'N/A';
        const cpuUsage = vm.mem && vm.maxmem ? formatCpuPercent(vm.mem / vm.maxmem) : 'N/A';
        const memUsage =
          vm.mem && vm.maxmem ? `${formatBytes(vm.mem)} / ${formatBytes(vm.maxmem)}` : 'N/A';

        output += `${status} ${typeIcon} **${vm.name || `VM-${vm.vmid}`}** (ID: ${vm.vmid})\n`;
        output += `   • Node: ${vm.node}\n`;
        output += `   • Status: ${vm.status}\n`;
        output += `   • Type: ${vm.type.toUpperCase()}\n`;
        if (vm.status === 'running') {
          output += `   • Uptime: ${uptime}\n`;
          output += `   • CPU: ${cpuUsage}\n`;
          output += `   • Memory: ${memUsage}\n`;
        }
        output += '\n';
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VMs');
  }
}

interface VMStatus {
  name?: string;
  status: string;
  uptime?: number;
  cpu?: number;
  mem?: number;
  maxmem?: number;
  diskread?: number;
  diskwrite?: number;
  netin?: number;
  netout?: number;
}

/**
 * Get detailed status for a specific VM/LXC.
 * No elevated permissions required.
 */
export async function getVMStatus(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetVmStatusInput
): Promise<ToolResponse> {
  try {
    const validated = getVmStatusSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVMID = validateVMID(validated.vmid);
    const type = validated.type || 'qemu';

    const vmStatus = (await client.request(
      `/nodes/${safeNode}/${type}/${safeVMID}/status/current`
    )) as VMStatus;

    const status = vmStatus.status === 'running' ? '🟢' : vmStatus.status === 'stopped' ? '🔴' : '🟡';
    const typeIcon = type === 'qemu' ? '🖥️' : '📦';

    let output = `${status} ${typeIcon} **${vmStatus.name || `VM-${safeVMID}`}** (ID: ${safeVMID})\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Status**: ${vmStatus.status}\n`;
    output += `• **Type**: ${type.toUpperCase()}\n`;

    if (vmStatus.status === 'running') {
      output += `• **Uptime**: ${vmStatus.uptime ? formatUptime(vmStatus.uptime) : 'N/A'}\n`;
      output += `• **CPU Usage**: ${vmStatus.cpu ? formatCpuPercent(vmStatus.cpu) : 'N/A'}\n`;
      output += `• **Memory**: ${
        vmStatus.mem && vmStatus.maxmem
          ? `${formatBytes(vmStatus.mem)} / ${formatBytes(vmStatus.maxmem)} (${((vmStatus.mem / vmStatus.maxmem) * 100).toFixed(1)}%)`
          : 'N/A'
      }\n`;
      output += `• **Disk Read**: ${vmStatus.diskread ? formatBytes(vmStatus.diskread) : 'N/A'}\n`;
      output += `• **Disk Write**: ${vmStatus.diskwrite ? formatBytes(vmStatus.diskwrite) : 'N/A'}\n`;
      output += `• **Network In**: ${vmStatus.netin ? formatBytes(vmStatus.netin) : 'N/A'}\n`;
      output += `• **Network Out**: ${vmStatus.netout ? formatBytes(vmStatus.netout) : 'N/A'}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM Status');
  }
}

/**
 * Get hardware configuration for a QEMU VM.
 * Returns disks, network interfaces, CPU, memory settings.
 * No elevated permissions required.
 */
export async function getVMConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetVmConfigInput
): Promise<ToolResponse> {
  try {
    const validated = getVmConfigSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVMID = validateVMID(validated.vmid);

    const vmConfig = await client.request(
      `/nodes/${safeNode}/qemu/${safeVMID}/config`
    ) as Record<string, unknown>;

    let output = `🖥️ **QEMU VM Configuration** (ID: ${safeVMID})\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Name**: ${vmConfig.name || 'N/A'}\n`;
    output += `• **Memory**: ${vmConfig.memory || 'N/A'} MB\n`;
    output += `• **CPU Cores**: ${vmConfig.cores || 1}\n`;
    output += `• **CPU Sockets**: ${vmConfig.sockets || 1}\n`;
    output += `• **OS Type**: ${vmConfig.ostype || 'N/A'}\n\n`;

    // Disks
    output += `**💿 Disks**:\n`;
    const diskKeys = Object.keys(vmConfig).filter(k => 
      /^(scsi|virtio|ide|sata)\d+$/.test(k)
    ).sort();
    if (diskKeys.length === 0) {
      output += `  (none)\n`;
    } else {
      for (const key of diskKeys) {
        output += `  • ${key}: ${vmConfig[key]}\n`;
      }
    }

    // Network interfaces
    output += `\n**🌐 Network Interfaces**:\n`;
    const netKeys = Object.keys(vmConfig).filter(k => /^net\d+$/.test(k)).sort();
    if (netKeys.length === 0) {
      output += `  (none)\n`;
    } else {
      for (const key of netKeys) {
        output += `  • ${key}: ${vmConfig[key]}\n`;
      }
    }

    // Boot order
    if (vmConfig.boot) {
      output += `\n**🔄 Boot Order**: ${vmConfig.boot}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get VM Config');
  }
}

/**
 * Get hardware configuration for an LXC container.
 * Returns mount points, network interfaces, CPU, memory settings.
 * No elevated permissions required.
 */
export async function getLxcConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetLxcConfigInput
): Promise<ToolResponse> {
  try {
    const validated = getLxcConfigSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVMID = validateVMID(validated.vmid);

    const lxcConfig = await client.request(
      `/nodes/${safeNode}/lxc/${safeVMID}/config`
    ) as Record<string, unknown>;

    let output = `📦 **LXC Container Configuration** (ID: ${safeVMID})\n\n`;
    output += `• **Node**: ${safeNode}\n`;
    output += `• **Hostname**: ${lxcConfig.hostname || 'N/A'}\n`;
    output += `• **Memory**: ${lxcConfig.memory || 'N/A'} MB\n`;
    output += `• **Swap**: ${lxcConfig.swap || 0} MB\n`;
    output += `• **CPU Cores**: ${lxcConfig.cores || 'unlimited'}\n`;
    output += `• **OS Type**: ${lxcConfig.ostype || 'N/A'}\n\n`;

    // Root filesystem
    if (lxcConfig.rootfs) {
      output += `**💿 Root Filesystem**:\n`;
      output += `  • rootfs: ${lxcConfig.rootfs}\n\n`;
    }

    // Mount points
    output += `**📁 Mount Points**:\n`;
    const mpKeys = Object.keys(lxcConfig).filter(k => /^mp\d+$/.test(k)).sort();
    if (mpKeys.length === 0) {
      output += `  (none)\n`;
    } else {
      for (const key of mpKeys) {
        output += `  • ${key}: ${lxcConfig[key]}\n`;
      }
    }

    // Network interfaces
    output += `\n**🌐 Network Interfaces**:\n`;
    const netKeys = Object.keys(lxcConfig).filter(k => /^net\d+$/.test(k)).sort();
    if (netKeys.length === 0) {
      output += `  (none)\n`;
    } else {
      for (const key of netKeys) {
        output += `  • ${key}: ${lxcConfig[key]}\n`;
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get LXC Config');
  }
}

interface StorageWithNode extends ProxmoxStorage {
  node: string;
}

/**
 * List all storage pools and their usage.
 * No elevated permissions required.
 */
export async function getStorage(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetStorageInput
): Promise<ToolResponse> {
  try {
    const validated = getStorageSchema.parse(input);
    const nodeFilter = validated.node;

    const storages: StorageWithNode[] = [];

    if (nodeFilter) {
      // Single node logic
      const safeNode = validateNodeName(nodeFilter);
      const nodeStorages = (await client.request(`/nodes/${safeNode}/storage`)) as ProxmoxStorage[];
      storages.push(...nodeStorages.map((storage) => ({ ...storage, node: safeNode })));
    } else {
      // All nodes logic
      const nodes = (await client.request('/nodes')) as ProxmoxNode[];

      for (const node of nodes) {
        const nodeStorages = (await client.request(`/nodes/${node.node}/storage`)) as ProxmoxStorage[];
        storages.push(...nodeStorages.map((storage) => ({ ...storage, node: node.node })));
      }
    }

    // Deduplicate by storage ID (keep first occurrence)
    const uniqueStorages: StorageWithNode[] = [];
    const seen = new Set<string>();

    for (const storage of storages) {
      const key = storage.storage;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueStorages.push(storage);
      }
    }

    // Sort by storage name
    uniqueStorages.sort((a, b) => a.storage.localeCompare(b.storage));

    // Format output
    let output = '💾 **Storage Pools**\n\n';

    if (uniqueStorages.length === 0) {
      output += 'No storage found.\n';
    } else {
      for (const storage of uniqueStorages) {
        const status = storage.enabled ? '🟢' : '🔴';
        const usagePercent =
          storage.total && storage.used ? ((storage.used / storage.total) * 100).toFixed(1) : 'N/A';

        output += `${status} **${storage.storage}**\n`;
        output += `   • Type: ${storage.type || 'N/A'}\n`;
        output += `   • Node: ${storage.node}\n`;
        output += `   • Content: ${storage.content || 'N/A'}\n`;
        if (storage.total && storage.used) {
          output += `   • Usage: ${formatBytes(storage.used)} / ${formatBytes(storage.total)} (${usagePercent}%)\n`;
        }
        output += `   • Status: ${storage.enabled ? 'Enabled' : 'Disabled'}\n\n`;
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Storage');
  }
}
