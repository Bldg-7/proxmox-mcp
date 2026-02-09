# Task 0 Mapping Table: 309 Old Tools to Consolidated Tools

- Source of truth: `src/types/tools.ts` (309 tools)
- Mappings generated: **309**
- Consolidated tool targets: **84**
- Guardrails applied: action count <= 6 per tool, VM/LXC split preserved when schema divergence is high

## Base Schema Patterns for Consolidated Tools

```ts
import { z } from 'zod';

export const actionSchema = z.string().min(1);
export const guestTypeSchema = z.enum(['vm', 'lxc']);

export const baseActionToolSchema = z.object({
  action: actionSchema,
});

export const baseTypedToolSchema = z.object({
  type: guestTypeSchema,
});

export const baseActionTypedToolSchema = z.object({
  action: actionSchema,
  type: guestTypeSchema,
});

export function requireActionParams<T extends z.ZodRawShape>(
  action: string,
  perActionParams: Record<string, z.ZodObject<T>>
): z.ZodObject<T> {
  return perActionParams[action] ?? z.object({} as T);
}
```

## Consolidation Exceptions

- `proxmox_create_vm` and `proxmox_create_lxc` remain separate (fundamentally different create payloads).
- `proxmox_vm_disk` and `proxmox_lxc_mountpoint` stay separate for add/remove operations (disk vs mountpoint semantics).
- VM-only operations keep `type` as `vm` in the table for explicitness (e.g., guest agent and SPICE proxy).

## Complete Old -> New Mapping

| Old Tool | New Tool | Action | Type | Notes |
| --- | --- | --- | --- | --- |
| `proxmox_get_nodes` | `proxmox_node` | `list` | `-` | - |
| `proxmox_get_node_status` | `proxmox_node` | `status` | `-` | - |
| `proxmox_get_node_network` | `proxmox_node` | `network` | `-` | - |
| `proxmox_get_node_dns` | `proxmox_node` | `dns` | `-` | - |
| `proxmox_get_network_iface` | `proxmox_node` | `iface` | `-` | - |
| `proxmox_get_node_services` | `proxmox_node_service` | `list` | `-` | - |
| `proxmox_control_node_service` | `proxmox_node_service` | `control` | `-` | - |
| `proxmox_get_node_syslog` | `proxmox_node_log` | `syslog` | `-` | - |
| `proxmox_get_node_journal` | `proxmox_node_log` | `journal` | `-` | - |
| `proxmox_get_node_tasks` | `proxmox_node_task` | `list` | `-` | - |
| `proxmox_get_node_task` | `proxmox_node_task` | `get` | `-` | - |
| `proxmox_get_node_aplinfo` | `proxmox_node_info` | `aplinfo` | `-` | - |
| `proxmox_get_node_netstat` | `proxmox_node_info` | `netstat` | `-` | - |
| `proxmox_get_node_rrddata` | `proxmox_node_info` | `rrddata` | `-` | - |
| `proxmox_get_storage_rrddata` | `proxmox_node_info` | `storage_rrddata` | `-` | - |
| `proxmox_get_node_report` | `proxmox_node_info` | `report` | `-` | - |
| `proxmox_create_network_iface` | `proxmox_node_network_iface` | `create` | `-` | - |
| `proxmox_update_network_iface` | `proxmox_node_network_iface` | `update` | `-` | - |
| `proxmox_delete_network_iface` | `proxmox_node_network_iface` | `delete` | `-` | - |
| `proxmox_apply_network_config` | `proxmox_node_network_iface` | `apply` | `-` | - |
| `proxmox_get_node_time` | `proxmox_node_config` | `get_time` | `-` | - |
| `proxmox_update_node_time` | `proxmox_node_config` | `set_time` | `-` | - |
| `proxmox_update_node_dns` | `proxmox_node_config` | `set_dns` | `-` | - |
| `proxmox_get_node_hosts` | `proxmox_node_config` | `get_hosts` | `-` | - |
| `proxmox_update_node_hosts` | `proxmox_node_config` | `set_hosts` | `-` | - |
| `proxmox_get_node_subscription` | `proxmox_node_subscription` | `get` | `-` | - |
| `proxmox_set_node_subscription` | `proxmox_node_subscription` | `set` | `-` | - |
| `proxmox_delete_node_subscription` | `proxmox_node_subscription` | `delete` | `-` | - |
| `proxmox_apt_update` | `proxmox_apt` | `update` | `-` | - |
| `proxmox_apt_upgrade` | `proxmox_apt` | `upgrade` | `-` | - |
| `proxmox_apt_versions` | `proxmox_apt` | `versions` | `-` | - |
| `proxmox_start_all` | `proxmox_node_bulk` | `start_all` | `-` | - |
| `proxmox_stop_all` | `proxmox_node_bulk` | `stop_all` | `-` | - |
| `proxmox_migrate_all` | `proxmox_node_bulk` | `migrate_all` | `-` | - |
| `proxmox_node_shutdown` | `proxmox_node_power` | `shutdown` | `-` | - |
| `proxmox_node_reboot` | `proxmox_node_power` | `reboot` | `-` | - |
| `proxmox_node_wakeonlan` | `proxmox_node_power` | `wakeonlan` | `-` | - |
| `proxmox_get_node_replication_status` | `proxmox_node_replication` | `status` | `-` | - |
| `proxmox_get_node_replication_log` | `proxmox_node_replication` | `log` | `-` | - |
| `proxmox_schedule_node_replication` | `proxmox_node_replication` | `schedule` | `-` | - |
| `proxmox_get_vms` | `proxmox_guest_list` | `list` | `-` | - |
| `proxmox_get_vm_status` | `proxmox_guest_status` | `get` | `vm` | - |
| `proxmox_get_vm_config` | `proxmox_guest_config` | `get` | `vm` | - |
| `proxmox_get_lxc_config` | `proxmox_guest_config` | `get` | `lxc` | - |
| `proxmox_get_vm_pending` | `proxmox_guest_pending` | `get` | `vm` | - |
| `proxmox_get_lxc_pending` | `proxmox_guest_pending` | `get` | `lxc` | - |
| `proxmox_check_vm_feature` | `proxmox_guest_feature` | `check` | `vm` | - |
| `proxmox_check_lxc_feature` | `proxmox_guest_feature` | `check` | `lxc` | - |
| `proxmox_execute_vm_command` | `proxmox_agent_exec` | `exec_shell` | `vm` | - |
| `proxmox_get_storage` | `proxmox_storage_config` | `cluster_usage` | `-` | - |
| `proxmox_get_cluster_status` | `proxmox_cluster` | `status` | `-` | - |
| `proxmox_list_templates` | `proxmox_storage_content` | `list_templates` | `-` | - |
| `proxmox_create_lxc` | `proxmox_create_lxc` | `create` | `lxc` | kept separate: create schema diverges from VM |
| `proxmox_create_vm` | `proxmox_create_vm` | `create` | `vm` | kept separate: create schema diverges from LXC |
| `proxmox_get_next_vmid` | `proxmox_cluster` | `next_vmid` | `-` | - |
| `proxmox_get_ha_resources` | `proxmox_ha_resource` | `list` | `-` | - |
| `proxmox_get_ha_resource` | `proxmox_ha_resource` | `get` | `-` | - |
| `proxmox_create_ha_resource` | `proxmox_ha_resource` | `create` | `-` | - |
| `proxmox_update_ha_resource` | `proxmox_ha_resource` | `update` | `-` | - |
| `proxmox_delete_ha_resource` | `proxmox_ha_resource` | `delete` | `-` | - |
| `proxmox_get_ha_groups` | `proxmox_ha_group` | `list` | `-` | - |
| `proxmox_get_ha_group` | `proxmox_ha_group` | `get` | `-` | - |
| `proxmox_create_ha_group` | `proxmox_ha_group` | `create` | `-` | - |
| `proxmox_update_ha_group` | `proxmox_ha_group` | `update` | `-` | - |
| `proxmox_delete_ha_group` | `proxmox_ha_group` | `delete` | `-` | - |
| `proxmox_get_ha_status` | `proxmox_ha_resource` | `status` | `-` | - |
| `proxmox_list_cluster_firewall_rules` | `proxmox_cluster_firewall_rule` | `list` | `-` | - |
| `proxmox_get_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `get` | `-` | - |
| `proxmox_create_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `create` | `-` | - |
| `proxmox_update_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `update` | `-` | - |
| `proxmox_delete_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `delete` | `-` | - |
| `proxmox_list_cluster_firewall_groups` | `proxmox_cluster_firewall_group` | `list` | `-` | - |
| `proxmox_get_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `get` | `-` | - |
| `proxmox_create_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `create` | `-` | - |
| `proxmox_update_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `update` | `-` | - |
| `proxmox_delete_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `delete` | `-` | - |
| `proxmox_list_cluster_backup_jobs` | `proxmox_cluster_backup_job` | `list` | `-` | - |
| `proxmox_get_cluster_backup_job` | `proxmox_cluster_backup_job` | `get` | `-` | - |
| `proxmox_create_cluster_backup_job` | `proxmox_cluster_backup_job` | `create` | `-` | - |
| `proxmox_update_cluster_backup_job` | `proxmox_cluster_backup_job` | `update` | `-` | - |
| `proxmox_delete_cluster_backup_job` | `proxmox_cluster_backup_job` | `delete` | `-` | - |
| `proxmox_list_cluster_replication_jobs` | `proxmox_cluster_replication_job` | `list` | `-` | - |
| `proxmox_get_cluster_replication_job` | `proxmox_cluster_replication_job` | `get` | `-` | - |
| `proxmox_create_cluster_replication_job` | `proxmox_cluster_replication_job` | `create` | `-` | - |
| `proxmox_update_cluster_replication_job` | `proxmox_cluster_replication_job` | `update` | `-` | - |
| `proxmox_delete_cluster_replication_job` | `proxmox_cluster_replication_job` | `delete` | `-` | - |
| `proxmox_get_cluster_options` | `proxmox_cluster` | `options` | `-` | - |
| `proxmox_update_cluster_options` | `proxmox_cluster` | `update_options` | `-` | - |
| `proxmox_get_cluster_firewall_options` | `proxmox_cluster_firewall` | `get_options` | `-` | - |
| `proxmox_update_cluster_firewall_options` | `proxmox_cluster_firewall` | `update_options` | `-` | - |
| `proxmox_list_cluster_firewall_macros` | `proxmox_cluster_firewall` | `list_macros` | `-` | - |
| `proxmox_list_cluster_firewall_refs` | `proxmox_cluster_firewall` | `list_refs` | `-` | - |
| `proxmox_list_cluster_firewall_aliases` | `proxmox_cluster_firewall_alias` | `list` | `-` | - |
| `proxmox_get_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `get` | `-` | - |
| `proxmox_create_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `create` | `-` | - |
| `proxmox_update_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `update` | `-` | - |
| `proxmox_delete_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `delete` | `-` | - |
| `proxmox_list_cluster_firewall_ipsets` | `proxmox_cluster_firewall_ipset` | `list` | `-` | - |
| `proxmox_create_cluster_firewall_ipset` | `proxmox_cluster_firewall_ipset` | `create` | `-` | - |
| `proxmox_delete_cluster_firewall_ipset` | `proxmox_cluster_firewall_ipset` | `delete` | `-` | - |
| `proxmox_list_cluster_firewall_ipset_entries` | `proxmox_cluster_firewall_ipset_entry` | `list` | `-` | - |
| `proxmox_add_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `add` | `-` | - |
| `proxmox_update_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `update` | `-` | - |
| `proxmox_delete_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `delete` | `-` | - |
| `proxmox_get_cluster_config` | `proxmox_cluster_config` | `get` | `-` | - |
| `proxmox_list_cluster_config_nodes` | `proxmox_cluster_config` | `list_nodes` | `-` | - |
| `proxmox_get_cluster_config_node` | `proxmox_cluster_config` | `get_node` | `-` | - |
| `proxmox_join_cluster` | `proxmox_cluster_config` | `join` | `-` | - |
| `proxmox_get_cluster_totem` | `proxmox_cluster_config` | `totem` | `-` | - |
| `proxmox_list_sdn_vnets` | `proxmox_sdn_vnet` | `list` | `-` | - |
| `proxmox_get_sdn_vnet` | `proxmox_sdn_vnet` | `get` | `-` | - |
| `proxmox_create_sdn_vnet` | `proxmox_sdn_vnet` | `create` | `-` | - |
| `proxmox_update_sdn_vnet` | `proxmox_sdn_vnet` | `update` | `-` | - |
| `proxmox_delete_sdn_vnet` | `proxmox_sdn_vnet` | `delete` | `-` | - |
| `proxmox_list_sdn_zones` | `proxmox_sdn_zone` | `list` | `-` | - |
| `proxmox_get_sdn_zone` | `proxmox_sdn_zone` | `get` | `-` | - |
| `proxmox_create_sdn_zone` | `proxmox_sdn_zone` | `create` | `-` | - |
| `proxmox_update_sdn_zone` | `proxmox_sdn_zone` | `update` | `-` | - |
| `proxmox_delete_sdn_zone` | `proxmox_sdn_zone` | `delete` | `-` | - |
| `proxmox_list_sdn_controllers` | `proxmox_sdn_controller` | `list` | `-` | - |
| `proxmox_get_sdn_controller` | `proxmox_sdn_controller` | `get` | `-` | - |
| `proxmox_create_sdn_controller` | `proxmox_sdn_controller` | `create` | `-` | - |
| `proxmox_update_sdn_controller` | `proxmox_sdn_controller` | `update` | `-` | - |
| `proxmox_delete_sdn_controller` | `proxmox_sdn_controller` | `delete` | `-` | - |
| `proxmox_list_sdn_subnets` | `proxmox_sdn_subnet` | `list` | `-` | - |
| `proxmox_get_sdn_subnet` | `proxmox_sdn_subnet` | `get` | `-` | - |
| `proxmox_create_sdn_subnet` | `proxmox_sdn_subnet` | `create` | `-` | - |
| `proxmox_update_sdn_subnet` | `proxmox_sdn_subnet` | `update` | `-` | - |
| `proxmox_delete_sdn_subnet` | `proxmox_sdn_subnet` | `delete` | `-` | - |
| `proxmox_list_users` | `proxmox_user` | `list` | `-` | - |
| `proxmox_get_user` | `proxmox_user` | `get` | `-` | - |
| `proxmox_create_user` | `proxmox_user` | `create` | `-` | - |
| `proxmox_update_user` | `proxmox_user` | `update` | `-` | - |
| `proxmox_delete_user` | `proxmox_user` | `delete` | `-` | - |
| `proxmox_list_groups` | `proxmox_group` | `list` | `-` | - |
| `proxmox_create_group` | `proxmox_group` | `create` | `-` | - |
| `proxmox_update_group` | `proxmox_group` | `update` | `-` | - |
| `proxmox_delete_group` | `proxmox_group` | `delete` | `-` | - |
| `proxmox_list_roles` | `proxmox_role` | `list` | `-` | - |
| `proxmox_create_role` | `proxmox_role` | `create` | `-` | - |
| `proxmox_update_role` | `proxmox_role` | `update` | `-` | - |
| `proxmox_delete_role` | `proxmox_role` | `delete` | `-` | - |
| `proxmox_get_acl` | `proxmox_acl` | `get` | `-` | - |
| `proxmox_update_acl` | `proxmox_acl` | `update` | `-` | - |
| `proxmox_list_domains` | `proxmox_domain` | `list` | `-` | - |
| `proxmox_get_domain` | `proxmox_domain` | `get` | `-` | - |
| `proxmox_create_domain` | `proxmox_domain` | `create` | `-` | - |
| `proxmox_update_domain` | `proxmox_domain` | `update` | `-` | - |
| `proxmox_delete_domain` | `proxmox_domain` | `delete` | `-` | - |
| `proxmox_list_user_tokens` | `proxmox_user_token` | `list` | `-` | - |
| `proxmox_get_user_token` | `proxmox_user_token` | `get` | `-` | - |
| `proxmox_create_user_token` | `proxmox_user_token` | `create` | `-` | - |
| `proxmox_update_user_token` | `proxmox_user_token` | `update` | `-` | - |
| `proxmox_delete_user_token` | `proxmox_user_token` | `delete` | `-` | - |
| `proxmox_list_pools` | `proxmox_pool` | `list` | `-` | - |
| `proxmox_get_pool` | `proxmox_pool` | `get` | `-` | - |
| `proxmox_create_pool` | `proxmox_pool` | `create` | `-` | - |
| `proxmox_update_pool` | `proxmox_pool` | `update` | `-` | - |
| `proxmox_delete_pool` | `proxmox_pool` | `delete` | `-` | - |
| `proxmox_list_storage_config` | `proxmox_storage_config` | `list` | `-` | - |
| `proxmox_get_storage_config` | `proxmox_storage_config` | `get` | `-` | - |
| `proxmox_create_storage` | `proxmox_storage_config` | `create` | `-` | - |
| `proxmox_update_storage` | `proxmox_storage_config` | `update` | `-` | - |
| `proxmox_delete_storage` | `proxmox_storage_config` | `delete` | `-` | - |
| `proxmox_upload_to_storage` | `proxmox_storage_content` | `upload` | `-` | - |
| `proxmox_download_url_to_storage` | `proxmox_storage_content` | `download_url` | `-` | - |
| `proxmox_list_storage_content` | `proxmox_storage_content` | `list` | `-` | - |
| `proxmox_delete_storage_content` | `proxmox_storage_content` | `delete` | `-` | - |
| `proxmox_list_file_restore` | `proxmox_file_restore` | `list` | `-` | - |
| `proxmox_download_file_restore` | `proxmox_file_restore` | `download` | `-` | - |
| `proxmox_prune_backups` | `proxmox_storage_content` | `prune` | `-` | - |
| `proxmox_get_ceph_status` | `proxmox_ceph` | `status` | `-` | - |
| `proxmox_list_ceph_osds` | `proxmox_ceph_osd` | `list` | `-` | - |
| `proxmox_create_ceph_osd` | `proxmox_ceph_osd` | `create` | `-` | - |
| `proxmox_delete_ceph_osd` | `proxmox_ceph_osd` | `delete` | `-` | - |
| `proxmox_list_ceph_mons` | `proxmox_ceph_mon` | `list` | `-` | - |
| `proxmox_create_ceph_mon` | `proxmox_ceph_mon` | `create` | `-` | - |
| `proxmox_delete_ceph_mon` | `proxmox_ceph_mon` | `delete` | `-` | - |
| `proxmox_list_ceph_mds` | `proxmox_ceph_mds` | `list` | `-` | - |
| `proxmox_create_ceph_mds` | `proxmox_ceph_mds` | `create` | `-` | - |
| `proxmox_delete_ceph_mds` | `proxmox_ceph_mds` | `delete` | `-` | - |
| `proxmox_list_ceph_pools` | `proxmox_ceph_pool` | `list` | `-` | - |
| `proxmox_create_ceph_pool` | `proxmox_ceph_pool` | `create` | `-` | - |
| `proxmox_update_ceph_pool` | `proxmox_ceph_pool` | `update` | `-` | - |
| `proxmox_delete_ceph_pool` | `proxmox_ceph_pool` | `delete` | `-` | - |
| `proxmox_list_ceph_fs` | `proxmox_ceph_fs` | `list` | `-` | - |
| `proxmox_create_ceph_fs` | `proxmox_ceph_fs` | `create` | `-` | - |
| `proxmox_start_lxc` | `proxmox_guest_power` | `start` | `lxc` | - |
| `proxmox_start_vm` | `proxmox_guest_power` | `start` | `vm` | - |
| `proxmox_stop_lxc` | `proxmox_guest_power` | `stop` | `lxc` | - |
| `proxmox_stop_vm` | `proxmox_guest_power` | `stop` | `vm` | - |
| `proxmox_delete_lxc` | `proxmox_guest_delete` | `delete` | `lxc` | - |
| `proxmox_delete_vm` | `proxmox_guest_delete` | `delete` | `vm` | - |
| `proxmox_reboot_lxc` | `proxmox_guest_power` | `reboot` | `lxc` | - |
| `proxmox_reboot_vm` | `proxmox_guest_power` | `reboot` | `vm` | - |
| `proxmox_shutdown_lxc` | `proxmox_guest_power` | `shutdown` | `lxc` | - |
| `proxmox_shutdown_vm` | `proxmox_guest_power` | `shutdown` | `vm` | - |
| `proxmox_pause_vm` | `proxmox_guest_power` | `pause` | `vm` | - |
| `proxmox_resume_vm` | `proxmox_guest_power` | `resume` | `vm` | - |
| `proxmox_clone_lxc` | `proxmox_guest_clone` | `clone` | `lxc` | - |
| `proxmox_clone_vm` | `proxmox_guest_clone` | `clone` | `vm` | - |
| `proxmox_resize_lxc` | `proxmox_guest_resize` | `resize` | `lxc` | - |
| `proxmox_resize_vm` | `proxmox_guest_resize` | `resize` | `vm` | - |
| `proxmox_update_vm_config` | `proxmox_guest_config_update` | `update` | `vm` | - |
| `proxmox_update_lxc_config` | `proxmox_guest_config_update` | `update` | `lxc` | - |
| `proxmox_migrate_vm` | `proxmox_guest_migrate` | `migrate` | `vm` | - |
| `proxmox_migrate_lxc` | `proxmox_guest_migrate` | `migrate` | `lxc` | - |
| `proxmox_create_template_vm` | `proxmox_guest_template` | `create` | `vm` | - |
| `proxmox_create_template_lxc` | `proxmox_guest_template` | `create` | `lxc` | - |
| `proxmox_get_vm_rrddata` | `proxmox_guest_rrddata` | `get` | `vm` | - |
| `proxmox_get_lxc_rrddata` | `proxmox_guest_rrddata` | `get` | `lxc` | - |
| `proxmox_agent_ping` | `proxmox_agent_info` | `ping` | `vm` | - |
| `proxmox_agent_get_osinfo` | `proxmox_agent_info` | `osinfo` | `vm` | - |
| `proxmox_agent_get_fsinfo` | `proxmox_agent_info` | `fsinfo` | `vm` | - |
| `proxmox_agent_get_memory_blocks` | `proxmox_agent_guest` | `memory_blocks` | `vm` | - |
| `proxmox_agent_get_network_interfaces` | `proxmox_agent_info` | `network_interfaces` | `vm` | - |
| `proxmox_agent_get_time` | `proxmox_agent_info` | `time` | `vm` | - |
| `proxmox_agent_get_timezone` | `proxmox_agent_info` | `timezone` | `vm` | - |
| `proxmox_agent_get_vcpus` | `proxmox_agent_guest` | `vcpus` | `vm` | - |
| `proxmox_agent_exec` | `proxmox_agent_exec` | `exec` | `vm` | - |
| `proxmox_agent_exec_status` | `proxmox_agent_exec` | `status` | `vm` | - |
| `proxmox_agent_file_read` | `proxmox_agent_file` | `read` | `vm` | - |
| `proxmox_agent_file_write` | `proxmox_agent_file` | `write` | `vm` | - |
| `proxmox_agent_get_hostname` | `proxmox_agent_guest` | `hostname` | `vm` | - |
| `proxmox_agent_get_users` | `proxmox_agent_guest` | `users` | `vm` | - |
| `proxmox_agent_set_user_password` | `proxmox_agent_guest` | `set_password` | `vm` | - |
| `proxmox_agent_shutdown` | `proxmox_agent_power` | `shutdown` | `vm` | - |
| `proxmox_agent_fsfreeze_status` | `proxmox_agent_freeze` | `status` | `vm` | - |
| `proxmox_agent_fsfreeze_freeze` | `proxmox_agent_freeze` | `freeze` | `vm` | - |
| `proxmox_agent_fsfreeze_thaw` | `proxmox_agent_freeze` | `thaw` | `vm` | - |
| `proxmox_agent_fstrim` | `proxmox_agent_freeze` | `fstrim` | `vm` | - |
| `proxmox_agent_get_memory_block_info` | `proxmox_agent_guest` | `memory_block_info` | `vm` | - |
| `proxmox_agent_suspend_disk` | `proxmox_agent_power` | `suspend_disk` | `vm` | - |
| `proxmox_agent_suspend_ram` | `proxmox_agent_power` | `suspend_ram` | `vm` | - |
| `proxmox_agent_suspend_hybrid` | `proxmox_agent_power` | `suspend_hybrid` | `vm` | - |
| `proxmox_list_vm_firewall_rules` | `proxmox_guest_firewall_rule` | `list` | `vm` | - |
| `proxmox_get_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `get` | `vm` | - |
| `proxmox_create_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `create` | `vm` | - |
| `proxmox_update_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `update` | `vm` | - |
| `proxmox_delete_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `delete` | `vm` | - |
| `proxmox_list_lxc_firewall_rules` | `proxmox_guest_firewall_rule` | `list` | `lxc` | - |
| `proxmox_get_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `get` | `lxc` | - |
| `proxmox_create_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `create` | `lxc` | - |
| `proxmox_update_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `update` | `lxc` | - |
| `proxmox_delete_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `delete` | `lxc` | - |
| `proxmox_get_vnc_proxy` | `proxmox_console_vnc` | `connect` | `vm` | - |
| `proxmox_get_spice_proxy` | `proxmox_console_spice` | `connect` | `vm` | - |
| `proxmox_get_term_proxy` | `proxmox_console_term` | `connect` | `vm` | - |
| `proxmox_get_lxc_vnc_proxy` | `proxmox_console_vnc` | `connect` | `lxc` | - |
| `proxmox_get_lxc_term_proxy` | `proxmox_console_term` | `connect` | `lxc` | - |
| `proxmox_create_snapshot_lxc` | `proxmox_guest_snapshot` | `create` | `lxc` | - |
| `proxmox_create_snapshot_vm` | `proxmox_guest_snapshot` | `create` | `vm` | - |
| `proxmox_list_snapshots_lxc` | `proxmox_guest_snapshot` | `list` | `lxc` | - |
| `proxmox_list_snapshots_vm` | `proxmox_guest_snapshot` | `list` | `vm` | - |
| `proxmox_rollback_snapshot_lxc` | `proxmox_guest_snapshot` | `rollback` | `lxc` | - |
| `proxmox_rollback_snapshot_vm` | `proxmox_guest_snapshot` | `rollback` | `vm` | - |
| `proxmox_delete_snapshot_lxc` | `proxmox_guest_snapshot` | `delete` | `lxc` | - |
| `proxmox_delete_snapshot_vm` | `proxmox_guest_snapshot` | `delete` | `vm` | - |
| `proxmox_create_backup_lxc` | `proxmox_backup` | `create` | `lxc` | - |
| `proxmox_create_backup_vm` | `proxmox_backup` | `create` | `vm` | - |
| `proxmox_list_backups` | `proxmox_backup` | `list` | `-` | - |
| `proxmox_restore_backup_lxc` | `proxmox_backup` | `restore` | `lxc` | - |
| `proxmox_restore_backup_vm` | `proxmox_backup` | `restore` | `vm` | - |
| `proxmox_delete_backup` | `proxmox_backup` | `delete` | `-` | - |
| `proxmox_add_disk_vm` | `proxmox_vm_disk` | `add` | `vm` | kept separate from LXC mountpoint semantics |
| `proxmox_add_mountpoint_lxc` | `proxmox_lxc_mountpoint` | `add` | `lxc` | kept separate from VM disk semantics |
| `proxmox_resize_disk_vm` | `proxmox_guest_disk_resize` | `resize` | `vm` | - |
| `proxmox_resize_disk_lxc` | `proxmox_guest_disk_resize` | `resize` | `lxc` | - |
| `proxmox_remove_disk_vm` | `proxmox_vm_disk` | `remove` | `vm` | kept separate from LXC mountpoint semantics |
| `proxmox_remove_mountpoint_lxc` | `proxmox_lxc_mountpoint` | `remove` | `lxc` | kept separate from VM disk semantics |
| `proxmox_move_disk_vm` | `proxmox_guest_disk_move` | `move` | `vm` | - |
| `proxmox_move_disk_lxc` | `proxmox_guest_disk_move` | `move` | `lxc` | - |
| `proxmox_add_network_vm` | `proxmox_guest_network` | `add` | `vm` | - |
| `proxmox_add_network_lxc` | `proxmox_guest_network` | `add` | `lxc` | - |
| `proxmox_update_network_vm` | `proxmox_guest_network` | `update` | `vm` | - |
| `proxmox_update_network_lxc` | `proxmox_guest_network` | `update` | `lxc` | - |
| `proxmox_remove_network_vm` | `proxmox_guest_network` | `remove` | `vm` | - |
| `proxmox_remove_network_lxc` | `proxmox_guest_network` | `remove` | `lxc` | - |
| `proxmox_get_node_disks` | `proxmox_node_disk` | `list` | `-` | - |
| `proxmox_get_disk_smart` | `proxmox_node_disk` | `smart` | `-` | - |
| `proxmox_get_node_lvm` | `proxmox_node_disk` | `lvm` | `-` | - |
| `proxmox_get_node_zfs` | `proxmox_node_disk` | `zfs` | `-` | - |
| `proxmox_init_disk_gpt` | `proxmox_node_disk_admin` | `init_gpt` | `-` | - |
| `proxmox_wipe_disk` | `proxmox_node_disk_admin` | `wipe` | `-` | - |
| `proxmox_get_node_lvmthin` | `proxmox_node_disk` | `lvmthin` | `-` | - |
| `proxmox_get_node_directory` | `proxmox_node_disk` | `directory` | `-` | - |
| `proxmox_get_cloudinit_config` | `proxmox_cloudinit` | `get` | `vm` | - |
| `proxmox_dump_cloudinit` | `proxmox_cloudinit` | `dump` | `vm` | - |
| `proxmox_regenerate_cloudinit` | `proxmox_cloudinit` | `regenerate` | `vm` | - |
| `proxmox_get_node_certificates` | `proxmox_certificate` | `list` | `-` | - |
| `proxmox_upload_custom_certificate` | `proxmox_certificate` | `upload` | `-` | - |
| `proxmox_delete_custom_certificate` | `proxmox_certificate` | `delete` | `-` | - |
| `proxmox_order_acme_certificate` | `proxmox_acme_certificate` | `order` | `-` | - |
| `proxmox_renew_acme_certificate` | `proxmox_acme_certificate` | `renew` | `-` | - |
| `proxmox_revoke_acme_certificate` | `proxmox_acme_certificate` | `revoke` | `-` | - |
| `proxmox_get_node_acme_config` | `proxmox_acme_certificate` | `config` | `-` | - |
| `proxmox_list_acme_accounts` | `proxmox_acme_account` | `list` | `-` | - |
| `proxmox_get_acme_account` | `proxmox_acme_account` | `get` | `-` | - |
| `proxmox_create_acme_account` | `proxmox_acme_account` | `create` | `-` | - |
| `proxmox_update_acme_account` | `proxmox_acme_account` | `update` | `-` | - |
| `proxmox_delete_acme_account` | `proxmox_acme_account` | `delete` | `-` | - |
| `proxmox_list_acme_plugins` | `proxmox_acme_info` | `list_plugins` | `-` | - |
| `proxmox_get_acme_plugin` | `proxmox_acme_info` | `get_plugin` | `-` | - |
| `proxmox_get_acme_directories` | `proxmox_acme_info` | `directories` | `-` | - |
| `proxmox_list_notification_targets` | `proxmox_notification` | `list` | `-` | - |
| `proxmox_get_notification_target` | `proxmox_notification` | `get` | `-` | - |
| `proxmox_create_notification_target` | `proxmox_notification` | `create` | `-` | - |
| `proxmox_delete_notification_target` | `proxmox_notification` | `delete` | `-` | - |
| `proxmox_test_notification_target` | `proxmox_notification` | `test` | `-` | - |
