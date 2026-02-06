import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { toolRegistry } from '../src/tools/registry.js';
import type { ToolName } from '../src/types/tools.js';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN MAPPING - Maps each tool to its domain file
// ═══════════════════════════════════════════════════════════════════════════════

type DomainFile =
  | 'nodes'
  | 'vm'
  | 'lxc'
  | 'vm-lxc-shared'
  | 'snapshots-backups'
  | 'storage'
  | 'networking'
  | 'cluster'
  | 'access-control'
  | 'ceph'
  | 'pools';

const DOMAIN_MAPPING: Record<ToolName, DomainFile> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // File 1: proxmox-nodes.md (38 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_get_nodes: 'nodes',
  proxmox_get_node_status: 'nodes',
  proxmox_get_cluster_status: 'nodes',
  proxmox_get_next_vmid: 'nodes',
  proxmox_get_node_network: 'nodes',
  proxmox_get_node_dns: 'nodes',
  proxmox_get_network_iface: 'nodes',
  proxmox_create_network_iface: 'nodes',
  proxmox_update_network_iface: 'nodes',
  proxmox_delete_network_iface: 'nodes',
  proxmox_apply_network_config: 'nodes',
  proxmox_get_node_time: 'nodes',
  proxmox_update_node_time: 'nodes',
  proxmox_update_node_dns: 'nodes',
  proxmox_get_node_hosts: 'nodes',
  proxmox_update_node_hosts: 'nodes',
  proxmox_get_node_subscription: 'nodes',
  proxmox_set_node_subscription: 'nodes',
  proxmox_delete_node_subscription: 'nodes',
  proxmox_apt_update: 'nodes',
  proxmox_apt_upgrade: 'nodes',
  proxmox_apt_versions: 'nodes',
  proxmox_start_all: 'nodes',
  proxmox_stop_all: 'nodes',
  proxmox_migrate_all: 'nodes',
  proxmox_get_vnc_proxy: 'nodes',
  proxmox_get_spice_proxy: 'nodes',
  proxmox_get_term_proxy: 'nodes',
  proxmox_get_lxc_vnc_proxy: 'nodes',
  proxmox_get_lxc_term_proxy: 'nodes',
  proxmox_get_node_services: 'nodes',
  proxmox_control_node_service: 'nodes',
  proxmox_get_node_syslog: 'nodes',
  proxmox_get_node_journal: 'nodes',
  proxmox_get_node_tasks: 'nodes',
  proxmox_get_node_task: 'nodes',
  proxmox_get_node_aplinfo: 'nodes',
  proxmox_get_node_netstat: 'nodes',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 2: proxmox-vm.md (25 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_get_vms: 'vm',
  proxmox_get_vm_status: 'vm',
  proxmox_get_vm_config: 'vm',
  proxmox_get_storage: 'vm',
  proxmox_create_vm: 'vm',
  proxmox_list_templates: 'vm',
  proxmox_start_vm: 'vm',
  proxmox_stop_vm: 'vm',
  proxmox_shutdown_vm: 'vm',
  proxmox_reboot_vm: 'vm',
  proxmox_pause_vm: 'vm',
  proxmox_resume_vm: 'vm',
  proxmox_delete_vm: 'vm',
  proxmox_clone_vm: 'vm',
  proxmox_resize_vm: 'vm',
  proxmox_add_disk_vm: 'vm',
  proxmox_resize_disk_vm: 'vm',
  proxmox_remove_disk_vm: 'vm',
  proxmox_move_disk_vm: 'vm',
  proxmox_add_network_vm: 'vm',
  proxmox_update_network_vm: 'vm',
  proxmox_remove_network_vm: 'vm',
  proxmox_execute_vm_command: 'vm',
  proxmox_create_template_vm: 'vm',
  proxmox_get_vm_rrddata: 'vm',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 3: proxmox-lxc.md (18 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_get_lxc_config: 'lxc',
  proxmox_create_lxc: 'lxc',
  proxmox_start_lxc: 'lxc',
  proxmox_stop_lxc: 'lxc',
  proxmox_shutdown_lxc: 'lxc',
  proxmox_reboot_lxc: 'lxc',
  proxmox_delete_lxc: 'lxc',
  proxmox_clone_lxc: 'lxc',
  proxmox_resize_lxc: 'lxc',
  proxmox_add_mountpoint_lxc: 'lxc',
  proxmox_resize_disk_lxc: 'lxc',
  proxmox_remove_mountpoint_lxc: 'lxc',
  proxmox_move_disk_lxc: 'lxc',
  proxmox_add_network_lxc: 'lxc',
  proxmox_update_network_lxc: 'lxc',
  proxmox_remove_network_lxc: 'lxc',
  proxmox_create_template_lxc: 'lxc',
  proxmox_get_lxc_rrddata: 'lxc',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 4: proxmox-vm-lxc-shared.md (22 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_migrate_vm: 'vm-lxc-shared',
  proxmox_migrate_lxc: 'vm-lxc-shared',
  proxmox_agent_ping: 'vm-lxc-shared',
  proxmox_agent_get_osinfo: 'vm-lxc-shared',
  proxmox_agent_get_fsinfo: 'vm-lxc-shared',
  proxmox_agent_get_memory_blocks: 'vm-lxc-shared',
  proxmox_agent_get_network_interfaces: 'vm-lxc-shared',
  proxmox_agent_get_time: 'vm-lxc-shared',
  proxmox_agent_get_timezone: 'vm-lxc-shared',
  proxmox_agent_get_vcpus: 'vm-lxc-shared',
  proxmox_agent_exec: 'vm-lxc-shared',
  proxmox_agent_exec_status: 'vm-lxc-shared',
  proxmox_list_vm_firewall_rules: 'vm-lxc-shared',
  proxmox_get_vm_firewall_rule: 'vm-lxc-shared',
  proxmox_create_vm_firewall_rule: 'vm-lxc-shared',
  proxmox_update_vm_firewall_rule: 'vm-lxc-shared',
  proxmox_delete_vm_firewall_rule: 'vm-lxc-shared',
  proxmox_list_lxc_firewall_rules: 'vm-lxc-shared',
  proxmox_get_lxc_firewall_rule: 'vm-lxc-shared',
  proxmox_create_lxc_firewall_rule: 'vm-lxc-shared',
  proxmox_update_lxc_firewall_rule: 'vm-lxc-shared',
  proxmox_delete_lxc_firewall_rule: 'vm-lxc-shared',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 5: proxmox-snapshots-backups.md (14 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_create_snapshot_vm: 'snapshots-backups',
  proxmox_create_snapshot_lxc: 'snapshots-backups',
  proxmox_list_snapshots_vm: 'snapshots-backups',
  proxmox_list_snapshots_lxc: 'snapshots-backups',
  proxmox_rollback_snapshot_vm: 'snapshots-backups',
  proxmox_rollback_snapshot_lxc: 'snapshots-backups',
  proxmox_delete_snapshot_vm: 'snapshots-backups',
  proxmox_delete_snapshot_lxc: 'snapshots-backups',
  proxmox_create_backup_vm: 'snapshots-backups',
  proxmox_create_backup_lxc: 'snapshots-backups',
  proxmox_list_backups: 'snapshots-backups',
  proxmox_restore_backup_vm: 'snapshots-backups',
  proxmox_restore_backup_lxc: 'snapshots-backups',
  proxmox_delete_backup: 'snapshots-backups',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 6: proxmox-storage.md (16 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_list_storage_config: 'storage',
  proxmox_get_storage_config: 'storage',
  proxmox_create_storage: 'storage',
  proxmox_update_storage: 'storage',
  proxmox_delete_storage: 'storage',
  proxmox_upload_to_storage: 'storage',
  proxmox_download_url_to_storage: 'storage',
  proxmox_list_storage_content: 'storage',
  proxmox_delete_storage_content: 'storage',
  proxmox_list_file_restore: 'storage',
  proxmox_download_file_restore: 'storage',
  proxmox_prune_backups: 'storage',
  proxmox_get_node_disks: 'storage',
  proxmox_get_disk_smart: 'storage',
  proxmox_get_node_lvm: 'storage',
  proxmox_get_node_zfs: 'storage',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 7: proxmox-networking.md (20 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_list_sdn_vnets: 'networking',
  proxmox_get_sdn_vnet: 'networking',
  proxmox_create_sdn_vnet: 'networking',
  proxmox_update_sdn_vnet: 'networking',
  proxmox_delete_sdn_vnet: 'networking',
  proxmox_list_sdn_zones: 'networking',
  proxmox_get_sdn_zone: 'networking',
  proxmox_create_sdn_zone: 'networking',
  proxmox_update_sdn_zone: 'networking',
  proxmox_delete_sdn_zone: 'networking',
  proxmox_list_sdn_controllers: 'networking',
  proxmox_get_sdn_controller: 'networking',
  proxmox_create_sdn_controller: 'networking',
  proxmox_update_sdn_controller: 'networking',
  proxmox_delete_sdn_controller: 'networking',
  proxmox_list_sdn_subnets: 'networking',
  proxmox_get_sdn_subnet: 'networking',
  proxmox_create_sdn_subnet: 'networking',
  proxmox_update_sdn_subnet: 'networking',
  proxmox_delete_sdn_subnet: 'networking',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 8: proxmox-cluster.md (33 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_get_ha_resources: 'cluster',
  proxmox_get_ha_resource: 'cluster',
  proxmox_create_ha_resource: 'cluster',
  proxmox_update_ha_resource: 'cluster',
  proxmox_delete_ha_resource: 'cluster',
  proxmox_get_ha_groups: 'cluster',
  proxmox_get_ha_group: 'cluster',
  proxmox_create_ha_group: 'cluster',
  proxmox_update_ha_group: 'cluster',
  proxmox_delete_ha_group: 'cluster',
  proxmox_get_ha_status: 'cluster',
  proxmox_list_cluster_firewall_rules: 'cluster',
  proxmox_get_cluster_firewall_rule: 'cluster',
  proxmox_create_cluster_firewall_rule: 'cluster',
  proxmox_update_cluster_firewall_rule: 'cluster',
  proxmox_delete_cluster_firewall_rule: 'cluster',
  proxmox_list_cluster_firewall_groups: 'cluster',
  proxmox_get_cluster_firewall_group: 'cluster',
  proxmox_create_cluster_firewall_group: 'cluster',
  proxmox_update_cluster_firewall_group: 'cluster',
  proxmox_delete_cluster_firewall_group: 'cluster',
  proxmox_list_cluster_backup_jobs: 'cluster',
  proxmox_get_cluster_backup_job: 'cluster',
  proxmox_create_cluster_backup_job: 'cluster',
  proxmox_update_cluster_backup_job: 'cluster',
  proxmox_delete_cluster_backup_job: 'cluster',
  proxmox_list_cluster_replication_jobs: 'cluster',
  proxmox_get_cluster_replication_job: 'cluster',
  proxmox_create_cluster_replication_job: 'cluster',
  proxmox_update_cluster_replication_job: 'cluster',
  proxmox_delete_cluster_replication_job: 'cluster',
  proxmox_get_cluster_options: 'cluster',
  proxmox_update_cluster_options: 'cluster',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 9: proxmox-access-control.md (20 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_list_users: 'access-control',
  proxmox_get_user: 'access-control',
  proxmox_create_user: 'access-control',
  proxmox_update_user: 'access-control',
  proxmox_delete_user: 'access-control',
  proxmox_list_groups: 'access-control',
  proxmox_create_group: 'access-control',
  proxmox_update_group: 'access-control',
  proxmox_delete_group: 'access-control',
  proxmox_list_roles: 'access-control',
  proxmox_create_role: 'access-control',
  proxmox_update_role: 'access-control',
  proxmox_delete_role: 'access-control',
  proxmox_get_acl: 'access-control',
  proxmox_update_acl: 'access-control',
  proxmox_list_domains: 'access-control',
  proxmox_get_domain: 'access-control',
  proxmox_create_domain: 'access-control',
  proxmox_update_domain: 'access-control',
  proxmox_delete_domain: 'access-control',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 10: proxmox-ceph.md (16 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_get_ceph_status: 'ceph',
  proxmox_list_ceph_osds: 'ceph',
  proxmox_create_ceph_osd: 'ceph',
  proxmox_delete_ceph_osd: 'ceph',
  proxmox_list_ceph_mons: 'ceph',
  proxmox_create_ceph_mon: 'ceph',
  proxmox_delete_ceph_mon: 'ceph',
  proxmox_list_ceph_mds: 'ceph',
  proxmox_create_ceph_mds: 'ceph',
  proxmox_delete_ceph_mds: 'ceph',
  proxmox_list_ceph_pools: 'ceph',
  proxmox_create_ceph_pool: 'ceph',
  proxmox_update_ceph_pool: 'ceph',
  proxmox_delete_ceph_pool: 'ceph',
  proxmox_list_ceph_fs: 'ceph',
  proxmox_create_ceph_fs: 'ceph',

  // ═══════════════════════════════════════════════════════════════════════════
  // File 11: proxmox-pools.md (5 tools)
  // ═══════════════════════════════════════════════════════════════════════════
  proxmox_list_pools: 'pools',
  proxmox_get_pool: 'pools',
  proxmox_create_pool: 'pools',
  proxmox_update_pool: 'pools',
  proxmox_delete_pool: 'pools',
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN METADATA - Title and description for each domain file
// ═══════════════════════════════════════════════════════════════════════════════

interface DomainMeta {
  title: string;
  description: string;
}

const DOMAIN_METADATA: Record<DomainFile, DomainMeta> = {
  nodes: {
    title: 'Proxmox Nodes & Cluster',
    description:
      'Node management, cluster status, network configuration, system operations, console access, and node services.',
  },
  vm: {
    title: 'Proxmox QEMU Virtual Machines',
    description:
      'QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring.',
  },
  lxc: {
    title: 'Proxmox LXC Containers',
    description:
      'LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring.',
  },
  'vm-lxc-shared': {
    title: 'Proxmox VM/LXC Shared Operations',
    description:
      'Operations common to both VMs and containers: migration, guest agent, and firewall rules.',
  },
  'snapshots-backups': {
    title: 'Proxmox Snapshots & Backups',
    description: 'Snapshot creation/rollback and backup creation/restoration for VMs and containers.',
  },
  storage: {
    title: 'Proxmox Storage',
    description:
      'Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools.',
  },
  networking: {
    title: 'Proxmox SDN Networking',
    description: 'Software-Defined Networking: VNets, zones, controllers, and subnets.',
  },
  cluster: {
    title: 'Proxmox Cluster Management',
    description:
      'High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options.',
  },
  'access-control': {
    title: 'Proxmox Access Control',
    description: 'Users, groups, roles, ACLs, and authentication domains.',
  },
  ceph: {
    title: 'Proxmox Ceph Integration',
    description: 'Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems.',
  },
  pools: {
    title: 'Proxmox Resource Pools',
    description: 'Resource pool management for organizing VMs and containers.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  proxmox_get_nodes: 'List all Proxmox cluster nodes with their status and resources',
  proxmox_get_node_status: 'Get detailed status information for a specific Proxmox node',
  proxmox_get_node_network: 'Get network interfaces for a specific Proxmox node',
  proxmox_get_node_dns: 'Get DNS configuration for a specific Proxmox node',
  proxmox_get_network_iface: 'Get details for a specific network interface on a Proxmox node',
  proxmox_get_cluster_status: 'Get overall cluster status including nodes and resource usage',
  proxmox_get_next_vmid: 'Get the next available VM/Container ID number',

  proxmox_create_network_iface: 'Create a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_update_network_iface: 'Update a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_delete_network_iface: 'Delete a network interface on a Proxmox node (requires elevated permissions)',
  proxmox_apply_network_config: 'Apply or revert pending network changes on a Proxmox node (requires elevated permissions)',

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

  proxmox_list_pools: 'List resource pools',
  proxmox_get_pool: 'Get a resource pool by ID',
  proxmox_create_pool: 'Create a resource pool (requires elevated permissions)',
  proxmox_update_pool: 'Update a resource pool (requires elevated permissions)',
  proxmox_delete_pool: 'Delete a resource pool (requires elevated permissions)',

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

  proxmox_get_vnc_proxy: 'Get a VNC proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_spice_proxy: 'Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_term_proxy: 'Get a terminal proxy ticket for a QEMU VM (requires elevated permissions)',
  proxmox_get_lxc_vnc_proxy: 'Get a VNC proxy ticket for an LXC container (requires elevated permissions)',
  proxmox_get_lxc_term_proxy: 'Get a terminal proxy ticket for an LXC container (requires elevated permissions)',

  proxmox_get_node_services: 'List system services on a Proxmox node',
  proxmox_control_node_service:
    'Start/stop/restart a system service on a Proxmox node (requires elevated permissions)',
  proxmox_get_node_syslog: 'Read syslog entries from a Proxmox node',
  proxmox_get_node_journal: 'Read systemd journal entries from a Proxmox node',
  proxmox_get_node_tasks: 'List recent tasks for a Proxmox node',
  proxmox_get_node_task: 'Get status details for a specific Proxmox node task',
  proxmox_get_node_aplinfo: 'List available appliance templates on a Proxmox node',
  proxmox_get_node_netstat: 'Get network connection statistics for a Proxmox node',

  proxmox_get_vms: 'List all virtual machines across the cluster with their status',
  proxmox_get_vm_status: 'Get detailed status information for a specific VM',
  proxmox_get_vm_config: 'Get hardware configuration for a QEMU VM (disks, network, CPU, memory)',
  proxmox_get_lxc_config: 'Get hardware configuration for an LXC container (mount points, network, CPU, memory)',
  proxmox_get_storage: 'List all storage pools and their usage across the cluster',

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

  proxmox_clone_lxc: 'Clone an LXC container (requires elevated permissions)',
  proxmox_clone_vm: 'Clone a QEMU virtual machine (requires elevated permissions)',
  proxmox_resize_lxc: 'Resize an LXC container CPU/memory (requires elevated permissions)',
  proxmox_resize_vm: 'Resize a QEMU VM CPU/memory (requires elevated permissions)',

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

  proxmox_create_snapshot_lxc: 'Create a snapshot of an LXC container (requires elevated permissions)',
  proxmox_create_snapshot_vm: 'Create a snapshot of a QEMU virtual machine (requires elevated permissions)',
  proxmox_list_snapshots_lxc: 'List all snapshots of an LXC container (requires elevated permissions)',
  proxmox_list_snapshots_vm: 'List all snapshots of a QEMU virtual machine (requires elevated permissions)',
  proxmox_rollback_snapshot_lxc: 'Rollback an LXC container to a snapshot (requires elevated permissions)',
  proxmox_rollback_snapshot_vm: 'Rollback a QEMU virtual machine to a snapshot (requires elevated permissions)',
  proxmox_delete_snapshot_lxc: 'Delete a snapshot of an LXC container (requires elevated permissions)',
  proxmox_delete_snapshot_vm: 'Delete a snapshot of a QEMU virtual machine (requires elevated permissions)',

  proxmox_create_backup_lxc: 'Create a backup of an LXC container (requires elevated permissions)',
  proxmox_create_backup_vm: 'Create a backup of a QEMU virtual machine (requires elevated permissions)',
  proxmox_list_backups: 'List all backups on a storage (requires elevated permissions)',
  proxmox_restore_backup_lxc: 'Restore an LXC container from backup (requires elevated permissions)',
  proxmox_restore_backup_vm: 'Restore a QEMU virtual machine from backup (requires elevated permissions)',
  proxmox_delete_backup: 'Delete a backup file from storage (requires elevated permissions)',

  proxmox_add_disk_vm: 'Add a new disk to a QEMU virtual machine (requires elevated permissions)',
  proxmox_add_mountpoint_lxc: 'Add a mount point to an LXC container (requires elevated permissions)',
  proxmox_resize_disk_vm: 'Resize a QEMU VM disk (requires elevated permissions)',
  proxmox_resize_disk_lxc: 'Resize an LXC container disk or mount point (requires elevated permissions)',
  proxmox_remove_disk_vm: 'Remove a disk from a QEMU virtual machine (requires elevated permissions)',
  proxmox_remove_mountpoint_lxc: 'Remove a mount point from an LXC container (requires elevated permissions)',
  proxmox_move_disk_vm: 'Move a QEMU VM disk to different storage (requires elevated permissions)',
  proxmox_move_disk_lxc: 'Move an LXC container disk to different storage (requires elevated permissions)',

  proxmox_add_network_vm: 'Add network interface to QEMU VM (requires elevated permissions)',
  proxmox_add_network_lxc: 'Add network interface to LXC container (requires elevated permissions)',
  proxmox_update_network_vm: 'Update/modify VM network interface configuration (requires elevated permissions)',
  proxmox_update_network_lxc: 'Update/modify LXC network interface configuration (requires elevated permissions)',
  proxmox_remove_network_vm: 'Remove network interface from QEMU VM (requires elevated permissions)',
  proxmox_remove_network_lxc: 'Remove network interface from LXC container (requires elevated permissions)',

  proxmox_execute_vm_command: 'Execute a shell command on a QEMU VM via guest agent (requires QEMU Guest Agent; LXC unsupported)',

  proxmox_list_templates: 'List available LXC container templates on a storage',
  proxmox_create_lxc: 'Create a new LXC container (requires elevated permissions)',
  proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)',

  proxmox_get_node_disks: 'List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status',
  proxmox_get_disk_smart: 'Get SMART health data for a specific disk on a Proxmox node',
  proxmox_get_node_lvm: 'List LVM volume groups and physical volumes on a Proxmox node',
  proxmox_get_node_zfs: 'List ZFS pools on a Proxmox node with health and capacity info',
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface ToolDoc {
  name: string;
  description: string;
  parameters: ToolParameter[];
  permission: string;
}

interface ToolDocsOutput {
  generated_at: string;
  tool_count: number;
  tools: ToolDoc[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARAMETER EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function extractParameters(schema: z.ZodSchema): ToolParameter[] {
  const parameters: ToolParameter[] = [];

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodSchema>;

    for (const [key, fieldSchema] of Object.entries(shape)) {
      const isRequired = !(fieldSchema instanceof z.ZodOptional);
      const baseSchema = isRequired ? fieldSchema : ((fieldSchema as z.ZodOptional<any>)._def as any).schema as z.ZodSchema;

      let type = 'unknown';
      let description: string | undefined;

      if (baseSchema instanceof z.ZodString) {
        type = 'string';
      } else if (baseSchema instanceof z.ZodNumber) {
        type = 'number';
      } else if (baseSchema instanceof z.ZodBoolean) {
        type = 'boolean';
      } else if (baseSchema instanceof z.ZodArray) {
        type = 'array';
      } else if (baseSchema instanceof z.ZodEnum) {
        type = 'enum';
      } else if (baseSchema instanceof z.ZodObject) {
        type = 'object';
      }

      if (baseSchema && typeof baseSchema === 'object' && '_def' in baseSchema && (baseSchema as any)._def.description) {
        description = (baseSchema as any)._def.description;
      }

      parameters.push({
        name: key,
        type,
        required: isRequired,
        description,
      });
    }
  }

  return parameters;
}

function getPermissionLevel(toolName: string, description: string): string {
  if (description.includes('requires elevated permissions')) {
    return 'elevated';
  }
  return 'basic';
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function extractToolDocs(): ToolDocsOutput {
  const tools: ToolDoc[] = [];

  const toolNames = Object.keys(toolRegistry) as ToolName[];

  for (const toolName of toolNames) {
    const entry = toolRegistry[toolName];
    const description = TOOL_DESCRIPTIONS[toolName] || 'No description available';
    const parameters = extractParameters(entry.schema);
    const permission = getPermissionLevel(toolName, description);

    tools.push({
      name: toolName,
      description,
      parameters,
      permission,
    });
  }

  tools.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generated_at: new Date().toISOString(),
    tool_count: tools.length,
    tools,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKDOWN GENERATION - Legacy (verb-based categories)
// ═══════════════════════════════════════════════════════════════════════════════

function generateMarkdown(docs: ToolDocsOutput): string {
  let markdown = `# Proxmox MCP Tools Documentation

Generated: ${docs.generated_at}
Total Tools: ${docs.tool_count}

## Tools by Category

`;

  const categories = new Map<string, ToolDoc[]>();

  for (const tool of docs.tools) {
    const parts = tool.name.split('_');
    const category = parts[1] || 'other';

    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(tool);
  }

  const sortedCategories = Array.from(categories.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [category, tools] of sortedCategories) {
    markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    for (const tool of tools) {
      markdown += `#### \`${tool.name}\`\n\n`;
      markdown += `**Description:** ${tool.description}\n\n`;
      markdown += `**Permission:** ${tool.permission}\n\n`;

      if (tool.parameters.length > 0) {
        markdown += `**Parameters:**\n\n`;
        markdown += `| Name | Type | Required | Description |\n`;
        markdown += `|------|------|----------|-------------|\n`;

        for (const param of tool.parameters) {
          const desc = param.description || '-';
          markdown += `| \`${param.name}\` | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${desc} |\n`;
        }
        markdown += `\n`;
      } else {
        markdown += `**Parameters:** None\n\n`;
      }
    }
  }

  return markdown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKDOWN GENERATION - Domain-based skill files
// ═══════════════════════════════════════════════════════════════════════════════

function generateDomainMarkdown(domain: DomainFile, tools: ToolDoc[], generatedAt: string): string {
  const meta = DOMAIN_METADATA[domain];
  const toolCount = tools.length;

  let markdown = `# ${meta.title}

> ${meta.description}

**Tools in this file:** ${toolCount}  
**Generated:** ${generatedAt}

---

## Tools

`;

  // Sort tools alphabetically within domain
  const sortedTools = [...tools].sort((a, b) => a.name.localeCompare(b.name));

  for (const tool of sortedTools) {
    markdown += `#### \`${tool.name}\`\n\n`;
    markdown += `**Description:** ${tool.description}\n\n`;
    markdown += `**Permission:** ${tool.permission}\n\n`;

    if (tool.parameters.length > 0) {
      markdown += `**Parameters:**\n\n`;
      markdown += `| Name | Type | Required | Description |\n`;
      markdown += `|------|------|----------|-------------|\n`;

      for (const param of tool.parameters) {
        const desc = param.description || '-';
        markdown += `| \`${param.name}\` | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${desc} |\n`;
      }
      markdown += `\n`;
    } else {
      markdown += `**Parameters:** None\n\n`;
    }

    markdown += `---\n\n`;
  }

  return markdown;
}

function generateIndexMarkdown(
  domainCounts: Map<DomainFile, number>,
  totalTools: number,
  generatedAt: string
): string {
  const domainOrder: DomainFile[] = [
    'nodes',
    'vm',
    'lxc',
    'vm-lxc-shared',
    'snapshots-backups',
    'storage',
    'networking',
    'cluster',
    'access-control',
    'ceph',
    'pools',
  ];

  let markdown = `# Proxmox MCP Server - Tool Reference

> Model Context Protocol server providing **${totalTools} tools** for Proxmox Virtual Environment management.

**Generated:** ${generatedAt}

---

## Quick Links

| Domain | Tools | Description |
|--------|-------|-------------|
`;

  for (const domain of domainOrder) {
    const meta = DOMAIN_METADATA[domain];
    const count = domainCounts.get(domain) || 0;
    markdown += `| [${meta.title}](proxmox-${domain}.md) | ${count} | ${meta.description} |\n`;
  }

  markdown += `

---

## Overview

This MCP server enables AI agents to manage Proxmox VE through the Model Context Protocol:

- **QEMU VMs**: Create, configure, lifecycle management, snapshots, backups
- **LXC Containers**: Create, configure, lifecycle management
- **Cluster**: HA, replication, migration, backup jobs
- **Storage**: Management, content listing, file operations
- **Networking**: Interfaces, bridges, VLANs, SDN
- **Access Control**: Users, groups, roles, ACLs, domains
- **Ceph**: Storage cluster management
- **Monitoring**: Nodes, services, tasks, logs

## Permission Model

- **Basic**: Read-only operations (list, get, status) - always allowed
- **Elevated**: Create, modify, delete operations - require \`PROXMOX_ALLOW_ELEVATED=true\`

## Domain Files

`;

  for (const domain of domainOrder) {
    const meta = DOMAIN_METADATA[domain];
    const count = domainCounts.get(domain) || 0;
    markdown += `### [${meta.title}](proxmox-${domain}.md)\n`;
    markdown += `${count} tools - ${meta.description}\n\n`;
  }

  markdown += `---

*See individual domain files for complete tool documentation with parameters.*
`;

  return markdown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  try {
    console.log('Extracting tool documentation...');

    const docs = extractToolDocs();
    const generatedAt = docs.generated_at;

    // ═══════════════════════════════════════════════════════════════════════════
    // Generate JSON (unchanged)
    // ═══════════════════════════════════════════════════════════════════════════
    const jsonPath = resolve('scripts/tool-docs.json');
    writeFileSync(jsonPath, JSON.stringify(docs, null, 2));
    console.log(`✓ Generated ${jsonPath} (${docs.tool_count} tools)`);

    // ═══════════════════════════════════════════════════════════════════════════
    // Generate legacy markdown (unchanged)
    // ═══════════════════════════════════════════════════════════════════════════
    const markdown = generateMarkdown(docs);
    const mdPath = resolve('scripts/tool-docs.md');
    writeFileSync(mdPath, markdown);
    console.log(`✓ Generated ${mdPath}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // Generate domain-based skill files
    // ═══════════════════════════════════════════════════════════════════════════
    const skillsDir = resolve('docs/skills');
    if (!existsSync(skillsDir)) {
      mkdirSync(skillsDir, { recursive: true });
    }

    // Group tools by domain
    const toolsByDomain = new Map<DomainFile, ToolDoc[]>();
    for (const tool of docs.tools) {
      const domain = DOMAIN_MAPPING[tool.name as ToolName];
      if (!toolsByDomain.has(domain)) {
        toolsByDomain.set(domain, []);
      }
      toolsByDomain.get(domain)!.push(tool);
    }

    // Generate each domain file
    const domainCounts = new Map<DomainFile, number>();
    for (const [domain, tools] of toolsByDomain) {
      const domainMarkdown = generateDomainMarkdown(domain, tools, generatedAt);
      const domainPath = resolve(`docs/skills/proxmox-${domain}.md`);
      writeFileSync(domainPath, domainMarkdown);
      domainCounts.set(domain, tools.length);
      console.log(`✓ Generated ${domainPath} (${tools.length} tools)`);
    }

    // Generate index file
    const indexMarkdown = generateIndexMarkdown(domainCounts, docs.tool_count, generatedAt);
    const indexPath = resolve('docs/skills/proxmox-mcp.md');
    writeFileSync(indexPath, indexMarkdown);
    console.log(`✓ Generated ${indexPath} (index)`);

    // Summary
    console.log(`\nExtraction complete:`);
    console.log(`  • ${docs.tool_count} tools documented`);
    console.log(`  • ${toolsByDomain.size} domain files generated`);
    console.log(`  • 1 index file generated`);

    process.exit(0);
  } catch (error) {
    console.error('Error extracting tool docs:', error);
    process.exit(1);
  }
}

main();
