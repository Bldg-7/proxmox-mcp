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
  proxmox_get_node_network: 'Get network interfaces for a specific Proxmox node',
  proxmox_get_node_dns: 'Get DNS configuration for a specific Proxmox node',
  proxmox_get_network_iface: 'Get details for a specific network interface on a Proxmox node',
  proxmox_get_cluster_status: 'Get overall cluster status including nodes and resource usage',
  proxmox_get_next_vmid: 'Get the next available VM/Container ID number',

  // Cluster Management
  proxmox_get_ha_resources: 'List High Availability resources in the cluster',
  proxmox_get_ha_resource: 'Get details for a specific HA resource',
  proxmox_create_ha_resource: 'Create a new HA resource (requires elevated permissions)',
  proxmox_update_ha_resource: 'Update an HA resource (requires elevated permissions)',
  proxmox_delete_ha_resource: 'Delete an HA resource (requires elevated permissions)',
  proxmox_get_ha_groups: 'List High Availability groups in the cluster',
  proxmox_get_ha_group: 'Get details for a specific HA group',
  proxmox_create_ha_group: 'Create a new HA group (requires elevated permissions)',
  proxmox_update_ha_group: 'Update an HA group (requires elevated permissions)',
  proxmox_delete_ha_group: 'Delete an HA group (requires elevated permissions)',
  proxmox_get_ha_status: 'Get HA manager status information for the cluster',
  proxmox_list_cluster_firewall_rules: 'List cluster-wide firewall rules',
  proxmox_get_cluster_firewall_rule: 'Get a cluster firewall rule by position',
  proxmox_create_cluster_firewall_rule:
    'Create a cluster-wide firewall rule (requires elevated permissions)',
  proxmox_update_cluster_firewall_rule:
    'Update a cluster firewall rule (requires elevated permissions)',
  proxmox_delete_cluster_firewall_rule:
    'Delete a cluster firewall rule (requires elevated permissions)',
  proxmox_list_cluster_firewall_groups: 'List cluster firewall security groups',
  proxmox_get_cluster_firewall_group: 'Get a cluster firewall group by name',
  proxmox_create_cluster_firewall_group:
    'Create a cluster firewall group (requires elevated permissions)',
  proxmox_update_cluster_firewall_group:
    'Update a cluster firewall group (requires elevated permissions)',
  proxmox_delete_cluster_firewall_group:
    'Delete a cluster firewall group (requires elevated permissions)',
  proxmox_list_cluster_backup_jobs: 'List scheduled cluster backup jobs',
  proxmox_get_cluster_backup_job: 'Get a scheduled cluster backup job',
  proxmox_create_cluster_backup_job:
    'Create a scheduled cluster backup job (requires elevated permissions)',
  proxmox_update_cluster_backup_job:
    'Update a scheduled cluster backup job (requires elevated permissions)',
  proxmox_delete_cluster_backup_job:
    'Delete a scheduled cluster backup job (requires elevated permissions)',
  proxmox_list_cluster_replication_jobs: 'List cluster replication jobs',
  proxmox_get_cluster_replication_job: 'Get a cluster replication job by ID',
  proxmox_create_cluster_replication_job:
    'Create a cluster replication job (requires elevated permissions)',
  proxmox_update_cluster_replication_job:
    'Update a cluster replication job (requires elevated permissions)',
  proxmox_delete_cluster_replication_job:
    'Delete a cluster replication job (requires elevated permissions)',
  proxmox_get_cluster_options: 'Get cluster-wide options',
  proxmox_update_cluster_options: 'Update cluster-wide options (requires elevated permissions)',

  // Node Management
  proxmox_get_node_services: 'List system services on a Proxmox node',
  proxmox_control_node_service:
    'Start/stop/restart a system service on a Proxmox node (requires elevated permissions)',
  proxmox_get_node_syslog: 'Read syslog entries from a Proxmox node',
  proxmox_get_node_journal: 'Read systemd journal entries from a Proxmox node',
  proxmox_get_node_tasks: 'List recent tasks for a Proxmox node',
  proxmox_get_node_task: 'Get status details for a specific Proxmox node task',
  proxmox_get_node_aplinfo: 'List available appliance templates on a Proxmox node',
  proxmox_get_node_netstat: 'Get network connection statistics for a Proxmox node',

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

   // Node Disk Query
   proxmox_get_node_disks: 'List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status',
   proxmox_get_disk_smart: 'Get SMART health data for a specific disk on a Proxmox node',
   proxmox_get_node_lvm: 'List LVM volume groups and physical volumes on a Proxmox node',
   proxmox_get_node_zfs: 'List ZFS pools on a Proxmox node with health and capacity info',
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
    const { $schema, ...inputSchema } = jsonSchema;
    void $schema;

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
