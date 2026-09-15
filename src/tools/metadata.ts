import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { ToolName } from '../types/tools.js';

/**
 * Display name and behavioural hints for each tool, surfaced on `tools/list`.
 *
 * `annotations` follows the MCP tool annotation semantics:
 * - `readOnlyHint`    - the tool does not modify the cluster.
 * - `destructiveHint` - the tool may perform destructive (non-additive) updates.
 *                       Only meaningful when `readOnlyHint` is false, so it is
 *                       omitted for read-only tools.
 * - `idempotentHint`  - repeating the call with the same arguments has no
 *                       additional effect. Only meaningful when `readOnlyHint`
 *                       is false, so it is omitted for read-only tools.
 * - `openWorldHint`   - the tool reaches beyond the Proxmox cluster itself,
 *                       either by running arbitrary code inside a guest or by
 *                       contacting a third party (ACME CAs, notification
 *                       targets, download sources).
 *
 * These are hints, not a permission model. Elevated operations are still
 * gated by `requireElevated()` at call time.
 *
 * Tools that expose several actions are annotated for their most dangerous
 * action, since the annotation describes the tool as a whole. A tool offering
 * `list` alongside `delete` is therefore marked destructive.
 */
export interface ToolMetadata {
  title: string;
  annotations: ToolAnnotations;
}

/** Query-only tool that stays within the cluster. */
const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  openWorldHint: false,
};

/** Query-only tool that contacts a third party. */
const READ_ONLY_EXTERNAL: ToolAnnotations = {
  readOnlyHint: true,
  openWorldHint: true,
};

function writes(
  destructiveHint: boolean,
  idempotentHint: boolean,
  openWorldHint = false
): ToolAnnotations {
  return { readOnlyHint: false, destructiveHint, idempotentHint, openWorldHint };
}

export const TOOL_METADATA: Record<ToolName, ToolMetadata> = {
  // Node & Cluster
  proxmox_node: { title: 'Node Info', annotations: READ_ONLY },
  proxmox_cluster: { title: 'Cluster Info', annotations: writes(true, true) },
  proxmox_get_next_vmid: { title: 'Next Available VMID', annotations: READ_ONLY },

  // Node Management
  proxmox_node_service: { title: 'Node Services', annotations: writes(true, false) },
  proxmox_node_log: { title: 'Node Logs', annotations: READ_ONLY },
  proxmox_node_task: { title: 'Node Tasks', annotations: READ_ONLY },
  proxmox_node_info: { title: 'Node Diagnostics', annotations: READ_ONLY },
  proxmox_node_config: { title: 'Node Configuration', annotations: writes(true, true) },
  proxmox_node_subscription: { title: 'Node Subscription', annotations: writes(true, true) },
  proxmox_apt: { title: 'APT Packages', annotations: writes(true, false) },
  proxmox_node_bulk: { title: 'Bulk Guest Operations', annotations: writes(true, false) },
  proxmox_node_power: { title: 'Node Power Control', annotations: writes(true, false) },
  proxmox_node_replication: { title: 'Node Replication', annotations: writes(false, false) },
  proxmox_node_network_iface: { title: 'Node Network Interfaces', annotations: writes(true, true) },

  // Cluster Management
  proxmox_ha_resource: { title: 'HA Resources', annotations: writes(true, true) },
  proxmox_ha_group: { title: 'HA Groups', annotations: writes(true, true) },
  proxmox_cluster_firewall_rule: { title: 'Cluster Firewall Rules', annotations: writes(true, false) },
  proxmox_cluster_firewall_group: { title: 'Cluster Firewall Groups', annotations: writes(true, true) },
  proxmox_cluster_firewall: { title: 'Cluster Firewall Settings', annotations: writes(true, true) },
  proxmox_cluster_firewall_alias: { title: 'Cluster Firewall Aliases', annotations: writes(true, true) },
  proxmox_cluster_firewall_ipset: { title: 'Cluster Firewall IP Sets', annotations: writes(true, true) },
  proxmox_cluster_firewall_ipset_entry: {
    title: 'Cluster Firewall IP Set Entries',
    annotations: writes(true, true),
  },
  proxmox_cluster_backup_job: { title: 'Cluster Backup Jobs', annotations: writes(true, true) },
  proxmox_cluster_replication_job: { title: 'Cluster Replication Jobs', annotations: writes(true, true) },
  proxmox_cluster_config: { title: 'Cluster Configuration', annotations: writes(true, false) },

  // SDN
  proxmox_sdn_vnet: { title: 'SDN Virtual Networks', annotations: writes(true, true) },
  proxmox_sdn_zone: { title: 'SDN Zones', annotations: writes(true, true) },
  proxmox_sdn_controller: { title: 'SDN Controllers', annotations: writes(true, true) },
  proxmox_sdn_subnet: { title: 'SDN Subnets', annotations: writes(true, true) },

  // Access Control
  proxmox_user: { title: 'Users', annotations: writes(true, true) },
  proxmox_group: { title: 'Groups', annotations: writes(true, true) },
  proxmox_role: { title: 'Roles', annotations: writes(true, true) },
  proxmox_acl: { title: 'Access Control Lists', annotations: writes(true, true) },
  proxmox_domain: { title: 'Authentication Domains', annotations: writes(true, true) },
  proxmox_user_token: { title: 'API Tokens', annotations: writes(true, true) },

  // Pool Management
  proxmox_pool: { title: 'Resource Pools', annotations: writes(true, true) },

  // Storage Management
  proxmox_storage_config: { title: 'Storage Configuration', annotations: writes(true, true) },
  proxmox_storage_content: { title: 'Storage Content', annotations: writes(true, false, true) },
  proxmox_file_restore: { title: 'Backup File Restore', annotations: READ_ONLY },

  // Ceph
  proxmox_ceph: { title: 'Ceph Status', annotations: READ_ONLY },
  proxmox_ceph_osd: { title: 'Ceph OSDs', annotations: writes(true, false) },
  proxmox_ceph_mon: { title: 'Ceph Monitors', annotations: writes(true, false) },
  proxmox_ceph_mds: { title: 'Ceph MDS Daemons', annotations: writes(true, false) },
  proxmox_ceph_pool: { title: 'Ceph Pools', annotations: writes(true, true) },
  proxmox_ceph_fs: { title: 'Ceph Filesystems', annotations: writes(false, false) },

  // Console Access
  proxmox_console_vnc: { title: 'VNC Console Ticket', annotations: writes(false, false) },
  proxmox_console_term: { title: 'Terminal Console Ticket', annotations: writes(false, false) },
  proxmox_console_spice: { title: 'SPICE Console Ticket', annotations: writes(false, false) },

  // Guest Query
  proxmox_guest_list: { title: 'List Guests', annotations: READ_ONLY },
  proxmox_guest_status: { title: 'Guest Status', annotations: READ_ONLY },
  proxmox_guest_config: { title: 'Guest Configuration', annotations: READ_ONLY },
  proxmox_guest_pending: { title: 'Guest Pending Changes', annotations: READ_ONLY },
  proxmox_guest_feature: { title: 'Guest Feature Availability', annotations: READ_ONLY },
  proxmox_guest_rrddata: { title: 'Guest Metrics', annotations: READ_ONLY },

  // Guest Lifecycle
  proxmox_guest_start: { title: 'Start Guest', annotations: writes(false, true) },
  proxmox_guest_stop: { title: 'Force Stop Guest', annotations: writes(true, true) },
  proxmox_guest_reboot: { title: 'Reboot Guest', annotations: writes(true, false) },
  proxmox_guest_shutdown: { title: 'Shut Down Guest', annotations: writes(true, true) },
  proxmox_guest_delete: { title: 'Delete Guest', annotations: writes(true, true) },
  proxmox_guest_pause: { title: 'Pause VM', annotations: writes(true, true) },
  proxmox_guest_resume: { title: 'Resume VM', annotations: writes(false, true) },

  // Guest Modify
  proxmox_guest_clone: { title: 'Clone Guest', annotations: writes(false, false) },
  proxmox_guest_resize: { title: 'Resize Guest CPU/Memory', annotations: writes(true, true) },
  proxmox_guest_config_update: { title: 'Update Guest Configuration', annotations: writes(true, true) },
  proxmox_guest_migrate: { title: 'Migrate Guest', annotations: writes(true, false) },
  proxmox_guest_template: { title: 'Convert Guest to Template', annotations: writes(true, true) },

  // QEMU Guest Agent
  proxmox_agent_info: { title: 'Guest Agent Info', annotations: READ_ONLY },
  proxmox_agent_hw: { title: 'Guest Agent Hardware Info', annotations: READ_ONLY },
  proxmox_agent_exec: { title: 'Guest Agent Command Execution', annotations: writes(true, false, true) },
  proxmox_agent_file: { title: 'Guest Agent File Access', annotations: writes(true, false, true) },
  proxmox_agent_freeze: { title: 'Guest Agent Filesystem Freeze', annotations: writes(true, false) },
  proxmox_agent_power: { title: 'Guest Agent Power Control', annotations: writes(true, false) },
  proxmox_agent_user: { title: 'Guest Agent User Management', annotations: writes(true, true) },
  proxmox_guest_firewall_rule: { title: 'Guest Firewall Rules', annotations: writes(true, false) },

  // Snapshots
  proxmox_guest_snapshot: { title: 'Guest Snapshots', annotations: writes(true, false) },

  // Backups
  proxmox_backup: { title: 'Guest Backups', annotations: writes(true, false) },

  // Disks
  proxmox_vm_disk: { title: 'VM Disks', annotations: writes(true, false) },
  proxmox_lxc_mountpoint: { title: 'LXC Mount Points', annotations: writes(true, false) },
  proxmox_guest_disk_resize: { title: 'Resize Guest Disk', annotations: writes(true, false) },
  proxmox_guest_disk_move: { title: 'Move Guest Disk', annotations: writes(true, false) },

  // Network
  proxmox_guest_network: { title: 'Guest Network Interfaces', annotations: writes(true, false) },

  // Creation
  proxmox_create_lxc: { title: 'Create LXC Container', annotations: writes(false, false) },
  proxmox_create_vm: { title: 'Create Virtual Machine', annotations: writes(false, false) },

  // Node Disks
  proxmox_node_disk: { title: 'Node Disks', annotations: READ_ONLY },
  proxmox_node_disk_admin: { title: 'Node Disk Administration', annotations: writes(true, false) },

  // Cloud-Init
  proxmox_cloudinit: { title: 'Cloud-Init Configuration', annotations: writes(true, true) },

  // Certificates
  proxmox_certificate: { title: 'Node SSL Certificates', annotations: writes(true, true) },
  proxmox_acme_cert: { title: 'ACME Certificates', annotations: writes(true, false, true) },
  proxmox_acme_account: { title: 'ACME Accounts', annotations: writes(true, true, true) },
  proxmox_acme_info: { title: 'ACME Information', annotations: READ_ONLY_EXTERNAL },

  // Notifications
  proxmox_notification: { title: 'Notification Targets', annotations: writes(true, false, true) },

  // LXC Exec
  proxmox_lxc_exec: { title: 'LXC Command Execution', annotations: writes(true, false, true) },
};
