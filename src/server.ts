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

  // Node Management (consolidated)
  proxmox_node_service: 'Manage node services. action=list: list services | action=control: start/stop/restart a service (elevated)',
  proxmox_node_log: 'Read node logs. action=syslog: read syslog | action=journal: read systemd journal',
  proxmox_node_task: 'Query node tasks. action=list: list recent tasks | action=get: get task details by UPID',
  proxmox_node_info: 'Query node information. action=aplinfo: appliance templates | action=netstat: network stats | action=rrddata: performance metrics | action=storage_rrddata: storage metrics | action=report: diagnostic report',
  proxmox_node_config: 'Manage node configuration. action=get_time|set_time(elevated)|set_dns(elevated)|get_hosts|set_hosts(elevated)',
  proxmox_node_subscription: 'Manage node subscription. action=get: get info | action=set: set key (elevated) | action=delete: remove (elevated)',
  proxmox_apt: 'Manage APT packages. action=update(elevated)|upgrade(elevated): package ops | action=versions: list versions',
  proxmox_node_bulk: 'Bulk guest operations. action=start_all|stop_all|migrate_all (all elevated)',
  proxmox_node_power: 'Node power control. action=shutdown|reboot|wakeonlan (all elevated)',
  proxmox_node_replication: 'Manage node replication. action=status|log: query | action=schedule: trigger now (elevated)',
  proxmox_node_network_iface: 'Manage node network interfaces. action=create|update|delete|apply (all elevated)',

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
  proxmox_file_restore: 'Restore files from backup. action=list: list files in backup | action=download: download file from backup',

  // Ceph Integration (consolidated)
  proxmox_ceph: 'Query Ceph cluster. action=status: get Ceph cluster health, FSID, monitors, OSDs, and placement groups',
  proxmox_ceph_osd: 'Manage Ceph OSDs (list, create, delete)',
  proxmox_ceph_mon: 'Manage Ceph monitors (list, create, delete)',
  proxmox_ceph_mds: 'Manage Ceph MDS daemons (list, create, delete)',
  proxmox_ceph_pool: 'Manage Ceph pools (list, create, update, delete)',
  proxmox_ceph_fs: 'Manage Ceph filesystems (list, create)',

  // Console Access
  proxmox_console_vnc: 'Get a VNC proxy ticket for a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_console_term: 'Get a terminal proxy ticket for a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_console_spice: 'Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)',



  // Guest Query (consolidated VM/LXC)
  proxmox_guest_list: 'List all virtual machines and containers across the cluster with their status',
  proxmox_guest_status: 'Get detailed status for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_config: 'Get hardware configuration for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_pending: 'Get pending configuration changes for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_feature: 'Check if a feature (snapshot, clone, copy) is available for a VM (type=vm) or LXC container (type=lxc)',
  proxmox_guest_rrddata: 'Get performance metrics (RRD data) for a VM (type=vm) or LXC container (type=lxc)',
  // Guest Lifecycle (consolidated VM/LXC)
  proxmox_guest_start: 'Start a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_stop: 'Forcefully stop a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_reboot: 'Reboot a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_shutdown: 'Gracefully shutdown a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_delete: 'Delete a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_pause: 'Pause a QEMU virtual machine — VM only (requires elevated permissions)',
  proxmox_guest_resume: 'Resume a paused QEMU virtual machine — VM only (requires elevated permissions)',

  // Guest Modify (consolidated VM/LXC)
  proxmox_guest_clone: 'Clone a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',
  proxmox_guest_resize: 'Resize VM/LXC CPU or memory (type=vm|lxc) (requires elevated permissions)',
  proxmox_guest_config_update: 'Update VM/LXC config key-value pairs (type=vm|lxc) (requires elevated permissions)',
  proxmox_guest_migrate: 'Migrate a VM or LXC container to another node (type=vm|lxc) (requires elevated permissions)',
  proxmox_guest_template: 'Convert a VM or LXC container to a template (type=vm|lxc) (requires elevated permissions)',

  // VM/LXC Advanced

  proxmox_agent_info: 'Query guest info via QEMU agent. operation=ping|osinfo|fsinfo|network_interfaces|time|timezone (requires elevated permissions)',
  proxmox_agent_hw: 'Query guest hardware via QEMU agent. operation=memory_blocks|vcpus|memory_block_info|hostname|users (requires elevated permissions)',
  proxmox_agent_exec: 'Execute commands via QEMU agent. operation=exec: run command | operation=status: check execution status (requires elevated permissions)',
  proxmox_agent_file: 'Read/write files via QEMU agent. operation=read|write (requires elevated permissions)',
  proxmox_agent_freeze: 'Manage filesystem freeze via QEMU agent. operation=status|freeze|thaw|fstrim (requires elevated permissions)',
  proxmox_agent_power: 'Guest power control via QEMU agent. operation=shutdown|suspend_disk|suspend_ram|suspend_hybrid (requires elevated permissions)',
  proxmox_agent_user: 'Manage guest users via QEMU agent. operation=set_password (requires elevated permissions)',
  proxmox_guest_firewall_rule: 'Manage per-guest firewall rules. action=list|get: query rules | action=create|update|delete: manage rules (elevated). type=vm|lxc. Uses rule_action for firewall action (ACCEPT/REJECT/DROP), rule_type for direction (in/out/group).',

  // Snapshots
  proxmox_guest_snapshot: 'Manage guest snapshots (create, list, rollback, delete) for VMs and LXC containers (requires elevated permissions)',

  // Backups
  proxmox_backup: 'Manage guest backups (create, list, restore, delete) for VMs and LXC containers (requires elevated permissions)',

  // Disks
  proxmox_vm_disk: 'Manage VM disks. action=add: add disk | action=remove: remove disk (all elevated)',
  proxmox_lxc_mountpoint: 'Manage LXC mount points. action=add: add mountpoint | action=remove: remove mountpoint (all elevated)',
  proxmox_guest_disk_resize: 'Resize guest storage for VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',

  proxmox_guest_disk_move: 'Move guest storage for VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)',

  // Network
  proxmox_guest_network: 'Manage guest network interfaces. action=add|update|remove with type=vm|lxc (requires elevated permissions)',

   // Creation
   proxmox_create_lxc: 'Create a new LXC container (requires elevated permissions)',
   proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)',

    // Node Disk Query
    proxmox_node_disk: 'Query node disk information. action=list|smart|lvm|zfs|lvmthin|directory',
     proxmox_node_disk_admin: 'Destructive disk operations. action=init_gpt: initialize GPT | action=wipe: wipe disk (all elevated)',

    // Cloud-Init
     proxmox_cloudinit: 'Manage cloud-init for a QEMU VM. action=get: list config | action=dump: dump rendered config (dump_type=user|network|meta) | action=regenerate: regenerate drive (requires elevated)',

  proxmox_certificate: 'Manage node SSL certificates. action=list: view certs | action=upload: upload custom cert (requires elevated) | action=delete: remove custom cert (requires elevated)',
  proxmox_acme_cert: 'Manage ACME certificates. action=order|renew|revoke: certificate ops (requires elevated) | action=config: get ACME config',

  proxmox_acme_account: 'Manage ACME accounts. action=list|get: query accounts | action=create|update|delete: manage accounts (requires elevated)',
  proxmox_acme_info: 'Query ACME information. action=list_plugins|get_plugin|directories',

  proxmox_notification: 'Manage notification targets. action=list|get: query targets | action=create|delete|test: manage targets (requires elevated)',
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
