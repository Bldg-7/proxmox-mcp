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
  proxmox_get_cluster_firewall_options: 'Get cluster firewall options',
  proxmox_update_cluster_firewall_options: 'Update cluster firewall options (requires elevated permissions)',
   proxmox_list_cluster_firewall_macros: 'List available firewall macros',
   proxmox_list_cluster_firewall_refs: 'List firewall references (aliases/ipsets)',
   proxmox_list_cluster_firewall_aliases: 'List cluster firewall aliases',
   proxmox_get_cluster_firewall_alias: 'Get a cluster firewall alias by name',
   proxmox_create_cluster_firewall_alias: 'Create a cluster firewall alias (requires elevated permissions)',
   proxmox_update_cluster_firewall_alias: 'Update a cluster firewall alias (requires elevated permissions)',
   proxmox_delete_cluster_firewall_alias: 'Delete a cluster firewall alias (requires elevated permissions)',
   proxmox_list_cluster_firewall_ipsets: 'List cluster firewall IP sets',
   proxmox_create_cluster_firewall_ipset: 'Create a cluster firewall IP set (requires elevated permissions)',
   proxmox_delete_cluster_firewall_ipset: 'Delete a cluster firewall IP set (requires elevated permissions)',
   proxmox_list_cluster_firewall_ipset_entries: 'List entries in a cluster firewall IP set',
   proxmox_add_cluster_firewall_ipset_entry: 'Add an entry to a cluster firewall IP set (requires elevated permissions)',
   proxmox_update_cluster_firewall_ipset_entry: 'Update an entry in a cluster firewall IP set (requires elevated permissions)',
   proxmox_delete_cluster_firewall_ipset_entry: 'Delete an entry from a cluster firewall IP set (requires elevated permissions)',

   // SDN
  proxmox_list_sdn_vnets: 'List SDN virtual networks',
  proxmox_get_sdn_vnet: 'Get an SDN virtual network by name',
  proxmox_create_sdn_vnet: 'Create an SDN virtual network (requires elevated permissions)',
  proxmox_update_sdn_vnet: 'Update an SDN virtual network (requires elevated permissions)',
  proxmox_delete_sdn_vnet: 'Delete an SDN virtual network (requires elevated permissions)',
  proxmox_list_sdn_zones: 'List SDN zones',
  proxmox_get_sdn_zone: 'Get an SDN zone by name',
  proxmox_create_sdn_zone: 'Create an SDN zone (requires elevated permissions)',
  proxmox_update_sdn_zone: 'Update an SDN zone (requires elevated permissions)',
  proxmox_delete_sdn_zone: 'Delete an SDN zone (requires elevated permissions)',
  proxmox_list_sdn_controllers: 'List SDN controllers',
  proxmox_get_sdn_controller: 'Get an SDN controller by name',
  proxmox_create_sdn_controller: 'Create an SDN controller (requires elevated permissions)',
  proxmox_update_sdn_controller: 'Update an SDN controller (requires elevated permissions)',
  proxmox_delete_sdn_controller: 'Delete an SDN controller (requires elevated permissions)',
  proxmox_list_sdn_subnets: 'List SDN subnets',
  proxmox_get_sdn_subnet: 'Get an SDN subnet by name',
  proxmox_create_sdn_subnet: 'Create an SDN subnet (requires elevated permissions)',
  proxmox_update_sdn_subnet: 'Update an SDN subnet (requires elevated permissions)',
  proxmox_delete_sdn_subnet: 'Delete an SDN subnet (requires elevated permissions)',

  // Access Control
  proxmox_list_users: 'List Proxmox users',
  proxmox_get_user: 'Get details for a Proxmox user',
  proxmox_create_user: 'Create a Proxmox user (requires elevated permissions)',
  proxmox_update_user: 'Update a Proxmox user (requires elevated permissions)',
  proxmox_delete_user: 'Delete a Proxmox user (requires elevated permissions)',
  proxmox_list_groups: 'List Proxmox groups',
  proxmox_create_group: 'Create a Proxmox group (requires elevated permissions)',
  proxmox_update_group: 'Update a Proxmox group (requires elevated permissions)',
  proxmox_delete_group: 'Delete a Proxmox group (requires elevated permissions)',
  proxmox_list_roles: 'List Proxmox roles',
  proxmox_create_role: 'Create a Proxmox role (requires elevated permissions)',
  proxmox_update_role: 'Update a Proxmox role (requires elevated permissions)',
  proxmox_delete_role: 'Delete a Proxmox role (requires elevated permissions)',
  proxmox_get_acl: 'Get ACL entries',
  proxmox_update_acl: 'Update ACL entries (requires elevated permissions)',
  proxmox_list_domains: 'List authentication domains',
  proxmox_get_domain: 'Get authentication domain details',
  proxmox_create_domain: 'Create an authentication domain (requires elevated permissions)',
  proxmox_update_domain: 'Update an authentication domain (requires elevated permissions)',
  proxmox_delete_domain: 'Delete an authentication domain (requires elevated permissions)',

  // User API Tokens
  proxmox_list_user_tokens: 'List API tokens for a user',
  proxmox_get_user_token: 'Get details of a specific user API token',
  proxmox_create_user_token: 'Create a new API token for a user (requires elevated permissions)',
  proxmox_update_user_token: 'Update a user API token (requires elevated permissions)',
  proxmox_delete_user_token: 'Delete a user API token (requires elevated permissions)',

  // Pool Management
  proxmox_list_pools: 'List resource pools',
  proxmox_get_pool: 'Get a resource pool by ID',
  proxmox_create_pool: 'Create a resource pool (requires elevated permissions)',
  proxmox_update_pool: 'Update a resource pool (requires elevated permissions)',
  proxmox_delete_pool: 'Delete a resource pool (requires elevated permissions)',

  // Storage Management
  proxmox_list_storage_config: 'List storage configurations available in Proxmox',
  proxmox_get_storage_config: 'Get a storage configuration by name',
  proxmox_create_storage: 'Create a storage configuration (requires elevated permissions)',
  proxmox_update_storage: 'Update a storage configuration (requires elevated permissions)',
  proxmox_delete_storage: 'Delete a storage configuration (requires elevated permissions)',
  proxmox_upload_to_storage: 'Upload ISO/template to storage (requires elevated permissions)',
  proxmox_download_url_to_storage:
    'Download a file from URL to storage (requires elevated permissions)',
  proxmox_list_storage_content: 'List content stored on a storage',
  proxmox_delete_storage_content: 'Delete content from storage (requires elevated permissions)',
  proxmox_list_file_restore: 'List files in a backup for restore',
  proxmox_download_file_restore: 'Download a file from backup',
  proxmox_prune_backups: 'Prune old backups from storage (requires elevated permissions)',

  // Ceph Integration
  proxmox_get_ceph_status: 'Get Ceph cluster status',
  proxmox_list_ceph_osds: 'List Ceph OSDs',
  proxmox_create_ceph_osd: 'Create a Ceph OSD (requires elevated permissions)',
  proxmox_delete_ceph_osd: 'Delete a Ceph OSD (requires elevated permissions)',
  proxmox_list_ceph_mons: 'List Ceph monitors',
  proxmox_create_ceph_mon: 'Create a Ceph monitor (requires elevated permissions)',
  proxmox_delete_ceph_mon: 'Delete a Ceph monitor (requires elevated permissions)',
  proxmox_list_ceph_mds: 'List Ceph MDS daemons',
  proxmox_create_ceph_mds: 'Create a Ceph MDS daemon (requires elevated permissions)',
  proxmox_delete_ceph_mds: 'Delete a Ceph MDS daemon (requires elevated permissions)',
  proxmox_list_ceph_pools: 'List Ceph pools',
  proxmox_create_ceph_pool: 'Create a Ceph pool (requires elevated permissions)',
  proxmox_update_ceph_pool: 'Update a Ceph pool (requires elevated permissions)',
  proxmox_delete_ceph_pool: 'Delete a Ceph pool (requires elevated permissions)',
  proxmox_list_ceph_fs: 'List Ceph filesystems',
  proxmox_create_ceph_fs: 'Create a Ceph filesystem (requires elevated permissions)',

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

  // VM/LXC Advanced
  proxmox_migrate_vm: 'Migrate a QEMU VM to another node (requires elevated permissions)',
  proxmox_migrate_lxc: 'Migrate an LXC container to another node (requires elevated permissions)',
  proxmox_create_template_vm: 'Convert a QEMU VM to a template (requires elevated permissions)',
  proxmox_create_template_lxc: 'Convert an LXC container to a template (requires elevated permissions)',
  proxmox_get_vm_rrddata: 'Get performance metrics (RRD data) for a QEMU VM',
  proxmox_get_lxc_rrddata: 'Get performance metrics (RRD data) for an LXC container',
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
  proxmox_execute_vm_command: 'Execute a shell command on a QEMU VM via guest agent (requires QEMU Guest Agent; LXC unsupported)',

   // Creation
   proxmox_list_templates: 'List available LXC container templates on a storage',
   proxmox_create_lxc: 'Create a new LXC container (requires elevated permissions)',
   proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)',

    // Node Disk Query
    proxmox_get_node_disks: 'List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status',
    proxmox_get_disk_smart: 'Get SMART health data for a specific disk on a Proxmox node',
    proxmox_get_node_lvm: 'List LVM volume groups and physical volumes on a Proxmox node',
    proxmox_get_node_zfs: 'List ZFS pools on a Proxmox node with health and capacity info',

    // Cloud-Init
    proxmox_get_cloudinit_config: 'Get cloud-init configuration items for a QEMU VM',
    proxmox_dump_cloudinit: 'Dump rendered cloud-init config (user-data, network-config, or meta-data) for a QEMU VM',
    proxmox_regenerate_cloudinit: 'Regenerate the cloud-init drive for a QEMU VM (requires elevated permissions)',
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
