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
  // Node & Cluster (consolidated)
  proxmox_node: 'Query Proxmox node info. action=list: list all nodes | action=status: node status (elevated) | action=network: network interfaces | action=dns: DNS config | action=iface: specific interface details',
  proxmox_cluster: 'Query Proxmox cluster info. action=status: overall cluster status with nodes and resource usage | action=options: get cluster-wide options | action=update_options: update cluster-wide options (requires elevated permissions)',
  proxmox_get_next_vmid: 'Get the next available VM/Container ID number',

  // Node Network Configuration
  proxmox_create_network_iface: 'Create a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_update_network_iface: 'Update a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_delete_network_iface: 'Delete a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_apply_network_config: 'Apply or revert pending network changes on a Proxmox node (requires elevated permissions)',

  // System Operations
  proxmox_get_node_time: 'Get node time and timezone information',
  proxmox_update_node_time: 'Update node time or timezone (requires elevated permissions)',
  proxmox_update_node_dns: 'Update DNS configuration on a Proxmox node (requires elevated permissions)',
  proxmox_get_node_hosts: 'Get hosts file entries for a Proxmox node',
  proxmox_update_node_hosts: 'Add/update a hosts entry on a Proxmox node (requires elevated permissions)',
  proxmox_get_node_subscription: 'Get subscription information for a Proxmox node',
  proxmox_set_node_subscription: 'Set subscription information for a Proxmox node (requires elevated permissions)',
  proxmox_delete_node_subscription: 'Delete subscription information for a Proxmox node (requires elevated permissions)',
  proxmox_apt_update: 'Update APT package lists (requires elevated permissions)',
  proxmox_apt_upgrade: 'Upgrade packages via APT (requires elevated permissions)',
  proxmox_apt_versions: 'List installed/upgradable APT package versions',
  proxmox_start_all: 'Start all VMs/containers on a node (requires elevated permissions)',
  proxmox_stop_all: 'Stop all VMs/containers on a node (requires elevated permissions)',
  proxmox_migrate_all: 'Migrate all VMs/containers to another node (requires elevated permissions)',
  proxmox_node_shutdown: 'Shutdown a node (requires elevated permissions)',
  proxmox_node_reboot: 'Reboot a node (requires elevated permissions)',
  proxmox_node_wakeonlan: 'Wake a node via Wake-on-LAN (requires elevated permissions)',
  proxmox_get_node_replication_status: 'Get node replication job status',
  proxmox_get_node_replication_log: 'Get node replication job log',
  proxmox_schedule_node_replication: 'Schedule immediate node replication (requires elevated permissions)',

  // Cluster Management
  proxmox_ha_resource: 'Manage HA resources. action=list: list resources | action=get: get resource details | action=status: get HA manager status | action=create: create resource (elevated) | action=update: update resource (elevated) | action=delete: delete resource (elevated)',
  proxmox_ha_group: 'Manage HA groups. action=list: list groups | action=get: get group details | action=create: create group (elevated) | action=update: update group (elevated) | action=delete: delete group (elevated)',
  proxmox_cluster_firewall_rule: 'Manage cluster firewall rules. action=list: list rules | action=get: get rule by position | action=create: create rule (elevated) | action=update: update rule (elevated) | action=delete: delete rule (elevated)',
  proxmox_cluster_firewall_group: 'Manage cluster firewall groups. action=list: list groups | action=get: get group by name | action=create: create group (elevated) | action=update: update group (elevated) | action=delete: delete group (elevated)',
  proxmox_cluster_firewall: 'Query/manage cluster firewall metadata. action=get_options: get firewall options | action=update_options: update firewall options (elevated) | action=list_macros: list firewall macros | action=list_refs: list firewall refs',
  proxmox_cluster_firewall_alias: 'Manage cluster firewall aliases. action=list: list aliases | action=get: get alias by name | action=create: create alias (elevated) | action=update: update alias (elevated) | action=delete: delete alias (elevated)',
  proxmox_cluster_firewall_ipset: 'Manage cluster firewall IP sets. action=list: list IP sets | action=create: create IP set (elevated) | action=delete: delete IP set (elevated)',
  proxmox_cluster_firewall_ipset_entry: 'Manage cluster firewall IP set entries. action=list: list entries | action=create: add entry (elevated) | action=update: update entry (elevated) | action=delete: delete entry (elevated)',
  proxmox_cluster_backup_job: 'Manage cluster backup jobs. action=list: list jobs | action=get: get job by ID | action=create: create job (elevated) | action=update: update job (elevated) | action=delete: delete job (elevated)',
  proxmox_cluster_replication_job: 'Manage cluster replication jobs. action=list: list jobs | action=get: get job by ID | action=create: create job (elevated) | action=update: update job (elevated) | action=delete: delete job (elevated)',
  proxmox_cluster_config: 'Manage cluster config. action=get: get config | action=list_nodes: list config nodes | action=get_node: get node config | action=join: join cluster (elevated) | action=totem: get totem config',

  // SDN
  proxmox_sdn_vnet: 'Manage SDN virtual networks (list, get, create, update, delete)',
  proxmox_sdn_zone: 'Manage SDN zones (list, get, create, update, delete)',
  proxmox_sdn_controller: 'Manage SDN controllers (list, get, create, update, delete)',
  proxmox_sdn_subnet: 'Manage SDN subnets (list, get, create, update, delete)',

  // Access Control
  proxmox_user: 'Manage Proxmox users (list, get, create, update, delete)',
  proxmox_group: 'Manage Proxmox groups (list, create, update, delete)',
  proxmox_role: 'Manage Proxmox roles (list, create, update, delete)',
  proxmox_acl: 'Manage ACL entries (get, update)',
  proxmox_domain: 'Manage authentication domains (list, get, create, update, delete)',
  proxmox_user_token: 'Manage user API tokens (list, get, create, update, delete)',

  // Pool Management (consolidated)
  proxmox_pool: 'Manage resource pools (list, get, create, update, delete)',

  // Storage Management (consolidated)
  proxmox_storage_config: 'Manage storage configurations (list, get, create, update, delete, cluster_usage)',
  proxmox_storage_content: 'Manage storage content (list, list_templates, upload, download_url, delete, prune)',
  proxmox_list_file_restore: 'List files in a backup for restore',
  proxmox_download_file_restore: 'Download a file from backup',

  // Ceph Integration (consolidated)
  proxmox_ceph: 'Query Ceph cluster. action=status: get Ceph cluster health, FSID, monitors, OSDs, and placement groups',
  proxmox_ceph_osd: 'Manage Ceph OSDs (list, create, delete)',
  proxmox_ceph_mon: 'Manage Ceph monitors (list, create, delete)',
  proxmox_ceph_mds: 'Manage Ceph MDS daemons (list, create, delete)',
  proxmox_ceph_pool: 'Manage Ceph pools (list, create, update, delete)',
  proxmox_ceph_fs: 'Manage Ceph filesystems (list, create)',

  // Console Access
  proxmox_get_vnc_proxy: 'Get a VNC proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_spice_proxy: 'Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_term_proxy: 'Get a terminal proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_lxc_vnc_proxy: 'Get a VNC proxy ticket for an LXC container (requires elevated permissions)',
  proxmox_get_lxc_term_proxy: 'Get a terminal proxy ticket for an LXC container (requires elevated permissions)',

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
  proxmox_get_node_rrddata: 'Get node RRD performance metrics (CPU, memory, disk I/O)',
  proxmox_get_storage_rrddata: 'Get storage RRD performance metrics (read/write throughput, usage)',
  proxmox_get_node_report: 'Get node diagnostic report with system information',

  // Guest Query (consolidated VM/LXC)
  proxmox_guest_list: 'List all virtual machines and containers across the cluster with their status',
  proxmox_guest_status: 'Get detailed status for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_config: 'Get hardware configuration for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_pending: 'Get pending configuration changes for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_feature: 'Check if a feature (snapshot, clone, copy) is available for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_rrddata: 'Get performance metrics (RRD data) for a VM (type=vm) or LXC container (type=lxc)',
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
  proxmox_update_vm_config: 'Update QEMU VM configuration with arbitrary key-value pairs (requires elevated permissions)',
  proxmox_update_lxc_config: 'Update LXC container configuration with arbitrary key-value pairs (requires elevated permissions)',

  // VM/LXC Advanced
  proxmox_migrate_vm: 'Migrate a QEMU VM to another node (requires elevated permissions)',
  proxmox_migrate_lxc: 'Migrate an LXC container to another node (requires elevated permissions)',
  proxmox_create_template_vm: 'Convert a QEMU VM to a template (requires elevated permissions)',
  proxmox_create_template_lxc: 'Convert an LXC container to a template (requires elevated permissions)',

  proxmox_agent_ping: 'Ping the QEMU guest agent to verify availability',
  proxmox_agent_get_osinfo: 'Get guest OS information via QEMU guest agent',
  proxmox_agent_get_fsinfo: 'Get guest filesystem information via QEMU guest agent',
  proxmox_agent_get_memory_blocks: 'Get guest memory block information via QEMU guest agent',
  proxmox_agent_get_network_interfaces: 'Get guest network interfaces via QEMU guest agent',
  proxmox_agent_get_time: 'Get guest time via QEMU guest agent',
  proxmox_agent_get_timezone: 'Get guest timezone via QEMU guest agent',
  proxmox_agent_get_vcpus: 'Get guest vCPU information via QEMU guest agent',
   proxmox_agent_exec: 'Execute a command via QEMU guest agent (requires elevated permissions)',
   proxmox_agent_exec_status: 'Get status for a QEMU guest agent command',
   proxmox_agent_file_read: 'Read file content from guest via QEMU agent (requires elevated permissions)',
   proxmox_agent_file_write: 'Write content to file in guest via QEMU agent (requires elevated permissions)',
   proxmox_agent_get_hostname: 'Get hostname from guest via QEMU agent',
   proxmox_agent_get_users: 'Get list of logged-in users from guest via QEMU agent',
   proxmox_agent_set_user_password: 'Set user password in guest via QEMU agent (requires elevated permissions)',
   proxmox_agent_shutdown: 'Shutdown guest via QEMU agent (requires elevated permissions)',
   proxmox_agent_fsfreeze_status: 'Get guest filesystem freeze status via QEMU agent',
   proxmox_agent_fsfreeze_freeze: 'Freeze guest filesystems for consistent backup via QEMU agent (requires elevated permissions)',
   proxmox_agent_fsfreeze_thaw: 'Thaw (unfreeze) guest filesystems via QEMU agent (requires elevated permissions)',
   proxmox_agent_fstrim: 'Discard unused blocks on guest filesystems via QEMU agent (requires elevated permissions)',
   proxmox_agent_get_memory_block_info: 'Get guest memory block size information via QEMU agent',
   proxmox_agent_suspend_disk: 'Suspend guest to disk (hibernate) via QEMU agent (requires elevated permissions)',
   proxmox_agent_suspend_ram: 'Suspend guest to RAM (sleep) via QEMU agent (requires elevated permissions)',
   proxmox_agent_suspend_hybrid: 'Hybrid suspend guest (RAM + disk) via QEMU agent (requires elevated permissions)',
   proxmox_list_vm_firewall_rules: 'List per-VM firewall rules',
  proxmox_get_vm_firewall_rule: 'Get a VM firewall rule by position',
  proxmox_create_vm_firewall_rule: 'Create a VM firewall rule (requires elevated permissions)',
  proxmox_update_vm_firewall_rule: 'Update a VM firewall rule (requires elevated permissions)',
  proxmox_delete_vm_firewall_rule: 'Delete a VM firewall rule (requires elevated permissions)',
  proxmox_list_lxc_firewall_rules: 'List per-LXC firewall rules',
  proxmox_get_lxc_firewall_rule: 'Get an LXC firewall rule by position',
  proxmox_create_lxc_firewall_rule: 'Create an LXC firewall rule (requires elevated permissions)',
  proxmox_update_lxc_firewall_rule: 'Update an LXC firewall rule (requires elevated permissions)',
  proxmox_delete_lxc_firewall_rule: 'Delete an LXC firewall rule (requires elevated permissions)',

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
  proxmox_execute_vm_command: 'Execute a shell command on a QEMU VM via guest agent (QEMU only)',

   // Creation
   proxmox_list_templates: 'List available LXC container templates on a storage',
   proxmox_create_lxc: 'Create a new LXC container (requires elevated permissions)',
   proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)',

    // Node Disk Query
    proxmox_get_node_disks: 'List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status',
    proxmox_get_disk_smart: 'Get SMART health data for a specific disk on a Proxmox node',
    proxmox_get_node_lvm: 'List LVM volume groups and physical volumes on a Proxmox node',
    proxmox_get_node_zfs: 'List ZFS pools on a Proxmox node with health and capacity info',
    proxmox_init_disk_gpt: 'Initialize GPT partition table on a disk (requires elevated permissions, destructive)',
    proxmox_wipe_disk: 'Wipe all data from a disk (requires elevated permissions, destructive)',
    proxmox_get_node_lvmthin: 'List LVM thin pools on a Proxmox node with capacity info',
    proxmox_get_node_directory: 'List directory-based storage on a Proxmox node',

    // Cloud-Init
    proxmox_get_cloudinit_config: 'Get cloud-init configuration items for a QEMU VM',
    proxmox_dump_cloudinit: 'Dump rendered cloud-init config (user-data, network-config, or meta-data) for a QEMU VM',
    proxmox_regenerate_cloudinit: 'Regenerate the cloud-init drive for a QEMU VM (requires elevated permissions)',

  // Certificate Management
  proxmox_get_node_certificates: 'Get SSL certificate information for a Proxmox node',
  proxmox_upload_custom_certificate: 'Upload a custom SSL certificate to a Proxmox node (requires elevated permissions)',
  proxmox_delete_custom_certificate: 'Delete the custom SSL certificate from a Proxmox node (requires elevated permissions)',
  proxmox_order_acme_certificate: 'Order a new ACME (Let\'s Encrypt) certificate for a Proxmox node (requires elevated permissions)',
  proxmox_renew_acme_certificate: 'Renew the ACME certificate for a Proxmox node (requires elevated permissions)',
  proxmox_revoke_acme_certificate: 'Revoke the ACME certificate for a Proxmox node (requires elevated permissions)',
  proxmox_get_node_acme_config: 'Get ACME configuration for a Proxmox node',

  // ACME Management
  proxmox_list_acme_accounts: 'List all ACME accounts configured in the cluster',
  proxmox_get_acme_account: 'Get detailed information about a specific ACME account',
  proxmox_create_acme_account: 'Create a new ACME account (requires elevated permissions)',
  proxmox_update_acme_account: 'Update an existing ACME account (requires elevated permissions)',
  proxmox_delete_acme_account: 'Delete an ACME account (requires elevated permissions)',
  proxmox_list_acme_plugins: 'List all ACME challenge plugins configured in the cluster',
  proxmox_get_acme_plugin: 'Get detailed configuration for a specific ACME plugin',
  proxmox_get_acme_directories: 'Get available ACME directory endpoints (Let\'s Encrypt, etc.)',
  proxmox_list_notification_targets: 'List all notification targets (SMTP, Gotify, Sendmail)',
  proxmox_get_notification_target: 'Get detailed configuration for a specific notification target',
  proxmox_create_notification_target: 'Create a new notification target (requires elevated permissions)',
  proxmox_delete_notification_target: 'Delete a notification target (requires elevated permissions)',
  proxmox_test_notification_target: 'Send a test notification to a target (requires elevated permissions)',
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
