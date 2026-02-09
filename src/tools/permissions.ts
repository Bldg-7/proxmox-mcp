import { TOOL_NAMES, type PermissionLevel, type ToolName } from '../types/tools.js';

export type Action = string;

export type ToolPermissions = Record<ToolName, Record<Action, PermissionLevel>>;

const defaultToolPermissions: ToolPermissions = Object.fromEntries(
  TOOL_NAMES.map((toolName) => [toolName, {}])
) as ToolPermissions;

export const toolPermissions: ToolPermissions = {
  ...defaultToolPermissions,
  proxmox_cluster: {
    status: 'basic',
    options: 'basic',
    update_options: 'elevated',
  },
  proxmox_ha_resource: {
    list: 'basic',
    get: 'basic',
    status: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_ha_group: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_rule: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_group: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall: {
    get_options: 'basic',
    list_macros: 'basic',
    list_refs: 'basic',
    update_options: 'elevated',
  },
  proxmox_cluster_firewall_alias: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_ipset: {
    list: 'basic',
    create: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_ipset_entry: {
    list: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_backup_job: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_replication_job: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_config: {
    get: 'basic',
    list_nodes: 'basic',
    get_node: 'basic',
    totem: 'basic',
    join: 'elevated',
  },
  proxmox_sdn_vnet: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_zone: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_controller: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_subnet: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_user: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_group: {
    list: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_role: {
    list: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_acl: {
    get: 'basic',
    update: 'elevated',
  },
  proxmox_domain: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_user_token: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_storage_config: {
    list: 'basic',
    get: 'basic',
    cluster_usage: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_storage_content: {
    list: 'basic',
    list_templates: 'basic',
    upload: 'elevated',
    download_url: 'elevated',
    delete: 'elevated',
    prune: 'elevated',
  },
  proxmox_pool: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_ceph_osd: {
    list: 'basic',
    create: 'elevated',
    delete: 'elevated',
  },
  proxmox_ceph_mon: {
    list: 'basic',
    create: 'elevated',
    delete: 'elevated',
  },
  proxmox_ceph_mds: {
    list: 'basic',
    create: 'elevated',
    delete: 'elevated',
  },
  proxmox_ceph_pool: {
    list: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_ceph_fs: {
    list: 'basic',
    create: 'elevated',
  },
  proxmox_guest_start: {
    elevated: 'elevated',
  },
  proxmox_guest_stop: {
    elevated: 'elevated',
  },
  proxmox_guest_reboot: {
    elevated: 'elevated',
  },
  proxmox_guest_shutdown: {
    elevated: 'elevated',
  },
  proxmox_guest_delete: {
    elevated: 'elevated',
  },
  proxmox_guest_pause: {
    elevated: 'elevated',
  },
  proxmox_guest_resume: {
    elevated: 'elevated',
  },
  proxmox_guest_clone: {
    elevated: 'elevated',
  },
  proxmox_guest_resize: {
    elevated: 'elevated',
  },
  proxmox_guest_config_update: {
    elevated: 'elevated',
  },
  proxmox_guest_migrate: {
    elevated: 'elevated',
  },
  proxmox_guest_template: {
    elevated: 'elevated',
  },
  proxmox_guest_snapshot: {
    elevated: 'elevated',
  },
  proxmox_backup: {
    elevated: 'elevated',
  },
  proxmox_create_vm: {
    elevated: 'elevated',
  },
  proxmox_create_lxc: {
    elevated: 'elevated',
  },
  proxmox_add_disk_vm: {
    elevated: 'elevated',
  },
  proxmox_add_mountpoint_lxc: {
    elevated: 'elevated',
  },
  proxmox_guest_disk_resize: {
    elevated: 'elevated',
  },
  proxmox_remove_disk_vm: {
    elevated: 'elevated',
  },
  proxmox_remove_mountpoint_lxc: {
    elevated: 'elevated',
  },
  proxmox_guest_disk_move: {
    elevated: 'elevated',
  },
  proxmox_guest_network: {
    elevated: 'elevated',
  },
  proxmox_agent_info: {
    elevated: 'elevated',
  },
  proxmox_agent_hw: {
    elevated: 'elevated',
  },
  proxmox_agent_exec: {
    elevated: 'elevated',
  },
  proxmox_agent_file: {
    elevated: 'elevated',
  },
  proxmox_agent_freeze: {
    elevated: 'elevated',
  },
  proxmox_agent_power: {
    elevated: 'elevated',
  },
  proxmox_agent_user: {
    elevated: 'elevated',
  },
  proxmox_node_service: {
    list: 'basic',
    control: 'elevated',
  },
  proxmox_node_log: {
    syslog: 'basic',
    journal: 'basic',
  },
  proxmox_node_task: {
    list: 'basic',
    get: 'basic',
  },
  proxmox_node_info: {
    aplinfo: 'basic',
    netstat: 'basic',
    rrddata: 'basic',
    storage_rrddata: 'basic',
    report: 'basic',
  },
  proxmox_node_config: {
    get_time: 'basic',
    set_time: 'elevated',
    set_dns: 'elevated',
    get_hosts: 'basic',
    set_hosts: 'elevated',
  },
  proxmox_node_subscription: {
    get: 'basic',
    set: 'elevated',
    delete: 'elevated',
  },
  proxmox_apt: {
    update: 'elevated',
    upgrade: 'elevated',
    versions: 'basic',
  },
  proxmox_node_bulk: {
    start_all: 'elevated',
    stop_all: 'elevated',
    migrate_all: 'elevated',
  },
  proxmox_node_power: {
    shutdown: 'elevated',
    reboot: 'elevated',
    wakeonlan: 'elevated',
  },
  proxmox_node_replication: {
    status: 'basic',
    log: 'basic',
    schedule: 'elevated',
  },
  proxmox_node_network_iface: {
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
    apply: 'elevated',
  },
  proxmox_node_disk: {
    list: 'basic',
    smart: 'basic',
    lvm: 'basic',
    zfs: 'basic',
    lvmthin: 'basic',
    directory: 'basic',
  },
  proxmox_init_disk_gpt: {
    elevated: 'elevated',
  },
  proxmox_wipe_disk: {
    elevated: 'elevated',
  },
  proxmox_console_vnc: {
    elevated: 'elevated',
  },
  proxmox_console_term: {
    elevated: 'elevated',
  },
  proxmox_get_spice_proxy: {
    elevated: 'elevated',
  },
  proxmox_cloudinit: {
    get: 'basic',
    dump: 'basic',
    regenerate: 'elevated',
  },
  proxmox_certificate: {
    list: 'basic',
    upload: 'elevated',
    delete: 'elevated',
  },
  proxmox_acme_cert: {
    order: 'elevated',
    renew: 'elevated',
    revoke: 'elevated',
    config: 'basic',
  },
  proxmox_acme_account: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_acme_info: {
    list_plugins: 'basic',
    get_plugin: 'basic',
    directories: 'basic',
  },
  proxmox_notification: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    delete: 'elevated',
    test: 'elevated',
  },
};
