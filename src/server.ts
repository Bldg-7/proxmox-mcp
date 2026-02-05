import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { toJsonSchemaCompat } from '@modelcontextprotocol/sdk/server/zod-json-schema-compat.js';
import type { ProxmoxApiClient } from './client/proxmox.js';
import type { Config } from './config/index.js';
import type { ToolName } from './types/tools.js';
import { toolRegistry } from './tools/registry.js';
import { TOOL_NAMES } from './types/tools.js';

const SERVER_VERSION = '0.1.0';

const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  // Node & Cluster
  proxmox_get_nodes: 'List all Proxmox cluster nodes with their status and resources',
  proxmox_get_node_status: 'Get detailed status information for a specific Proxmox node',
  proxmox_get_cluster_status: 'Get overall cluster status including nodes and resource usage',
  proxmox_get_next_vmid: 'Get the next available VM/Container ID number',

  // VM Query
  proxmox_get_vms: 'List all virtual machines across the cluster with their status',
  proxmox_get_vm_status: 'Get detailed status information for a specific VM',
  proxmox_get_vm_config: 'Get hardware configuration for a QEMU VM (disks, network, CPU, memory)',
  proxmox_get_lxc_config: 'Get hardware configuration for an LXC container (mount points, network, CPU, memory)',
  proxmox_get_storage: 'List all storage pools and their usage across the cluster',

  // VM Lifecycle
  proxmox_start_lxc: 'Start an LXC container (requires elevated permissions)',
  proxmox_start_vm: 'Start a QEMU virtual machine (requires elevated permissions)',
  proxmox_stop_lxc: 'Stop an LXC container (requires elevated permissions)',
  proxmox_stop_vm: 'Stop a QEMU virtual machine (requires elevated permissions)',
  proxmox_delete_lxc: 'Delete an LXC container (requires elevated permissions)',
  proxmox_delete_vm: 'Delete a QEMU virtual machine (requires elevated permissions)',
  proxmox_reboot_lxc: 'Reboot an LXC container (requires elevated permissions)',
  proxmox_reboot_vm: 'Reboot a QEMU virtual machine (requires elevated permissions)',
  proxmox_shutdown_lxc: 'Gracefully shutdown an LXC container (requires elevated permissions)',
  proxmox_shutdown_vm: 'Gracefully shutdown a QEMU virtual machine (requires elevated permissions)',
  proxmox_pause_vm: 'Pause a QEMU virtual machine (requires elevated permissions)',
  proxmox_resume_vm: 'Resume a paused QEMU virtual machine (requires elevated permissions)',

  // VM Modify
  proxmox_clone_lxc: 'Clone an LXC container (requires elevated permissions)',
  proxmox_clone_vm: 'Clone a QEMU virtual machine (requires elevated permissions)',
  proxmox_resize_lxc: 'Resize an LXC container CPU/memory (requires elevated permissions)',
  proxmox_resize_vm: 'Resize a QEMU VM CPU/memory (requires elevated permissions)',

  // Snapshots
  proxmox_create_snapshot_lxc: 'Create a snapshot of an LXC container (requires elevated permissions)',
  proxmox_create_snapshot_vm: 'Create a snapshot of a QEMU virtual machine (requires elevated permissions)',
  proxmox_list_snapshots_lxc: 'List all snapshots of an LXC container (requires elevated permissions)',
  proxmox_list_snapshots_vm: 'List all snapshots of a QEMU virtual machine (requires elevated permissions)',
  proxmox_rollback_snapshot_lxc: 'Rollback an LXC container to a snapshot (requires elevated permissions)',
  proxmox_rollback_snapshot_vm: 'Rollback a QEMU virtual machine to a snapshot (requires elevated permissions)',
  proxmox_delete_snapshot_lxc: 'Delete a snapshot of an LXC container (requires elevated permissions)',
  proxmox_delete_snapshot_vm: 'Delete a snapshot of a QEMU virtual machine (requires elevated permissions)',

  // Backups
  proxmox_create_backup_lxc: 'Create a backup of an LXC container (requires elevated permissions)',
  proxmox_create_backup_vm: 'Create a backup of a QEMU virtual machine (requires elevated permissions)',
  proxmox_list_backups: 'List all backups on a storage (requires elevated permissions)',
  proxmox_restore_backup_lxc: 'Restore an LXC container from backup (requires elevated permissions)',
  proxmox_restore_backup_vm: 'Restore a QEMU virtual machine from backup (requires elevated permissions)',
  proxmox_delete_backup: 'Delete a backup file from storage (requires elevated permissions)',

  // Disks
  proxmox_add_disk_vm: 'Add a new disk to a QEMU virtual machine (requires elevated permissions)',
  proxmox_add_mountpoint_lxc: 'Add a mount point to an LXC container (requires elevated permissions)',
  proxmox_resize_disk_vm: 'Resize a QEMU VM disk (requires elevated permissions)',
  proxmox_resize_disk_lxc: 'Resize an LXC container disk or mount point (requires elevated permissions)',
  proxmox_remove_disk_vm: 'Remove a disk from a QEMU virtual machine (requires elevated permissions)',
  proxmox_remove_mountpoint_lxc: 'Remove a mount point from an LXC container (requires elevated permissions)',
  proxmox_move_disk_vm: 'Move a QEMU VM disk to different storage (requires elevated permissions)',
  proxmox_move_disk_lxc: 'Move an LXC container disk to different storage (requires elevated permissions)',

  // Network
  proxmox_add_network_vm: 'Add network interface to QEMU VM (requires elevated permissions)',
  proxmox_add_network_lxc: 'Add network interface to LXC container (requires elevated permissions)',
  proxmox_update_network_vm: 'Update/modify VM network interface configuration (requires elevated permissions)',
  proxmox_update_network_lxc: 'Update/modify LXC network interface configuration (requires elevated permissions)',
  proxmox_remove_network_vm: 'Remove network interface from QEMU VM (requires elevated permissions)',
  proxmox_remove_network_lxc: 'Remove network interface from LXC container (requires elevated permissions)',

  // Command
  proxmox_execute_vm_command: 'Execute a shell command on a virtual machine via Proxmox API',

  // Creation
  proxmox_list_templates: 'List available LXC container templates on a storage',
  proxmox_create_lxc: 'Create a new LXC container (requires elevated permissions)',
  proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)',
};

export function createServer(client: ProxmoxApiClient, config: Config): Server {
  const server = new Server(
    {
      name: 'proxmox-mcp',
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolDefinitions = TOOL_NAMES.map((name) => {
    const entry = toolRegistry[name];
    const jsonSchema = toJsonSchemaCompat(entry.schema) as Record<string, unknown>;

    // $schema meta-property is not part of the MCP tool inputSchema spec
    const { $schema: _$schema, ...inputSchema } = jsonSchema;

    return {
      name,
      description: TOOL_DESCRIPTIONS[name],
      inputSchema: inputSchema as {
        type: 'object';
        properties?: Record<string, unknown>;
        required?: string[];
      },
    };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;

    const entry = toolRegistry[name as ToolName];
    if (!entry) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: Unknown tool "${name}". Use ListTools to see available tools.`,
          },
        ],
        isError: true,
      };
    }

    try {
      const validated = entry.schema.parse(args ?? {});
      const result = await entry.handler(client, config, validated);

      return { ...result };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Validation error for tool "${name}": ${error.message}`,
            },
          ],
          isError: true,
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error executing tool "${name}": ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
