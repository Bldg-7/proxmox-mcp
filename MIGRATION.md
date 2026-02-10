# Migration Guide: Tool Consolidation (309 → 91 Tools)

This guide helps you transition from the original 309-tool API to the new consolidated 91-tool API. Every original tool has a direct equivalent — no functionality was removed.

## Breaking Changes

The consolidation applies four strategies to reduce 309 tools to 91:

### 1. VM/LXC Pairs → `type: 'vm' | 'lxc'` Parameter

Tools that had separate VM and LXC variants are now unified with a `type` parameter.

**Before**: `proxmox_start_vm`, `proxmox_start_lxc` (2 tools)
**After**: `proxmox_guest_start` with `type: 'vm'` or `type: 'lxc'` (1 tool)

### 2. CRUD Groups → `action` Parameter

Tools that had separate list/get/create/update/delete variants are now unified with an `action` parameter.

**Before**: `proxmox_list_ha_resources`, `proxmox_get_ha_resource`, `proxmox_create_ha_resource`, `proxmox_update_ha_resource`, `proxmox_delete_ha_resource` (5 tools)
**After**: `proxmox_ha_resource` with `action: 'list' | 'get' | 'create' | 'update' | 'delete'` (1 tool)

### 3. Guest Agent Tools → `operation` Parameter

QEMU guest agent tools are grouped by domain with an `operation` parameter.

**Before**: `proxmox_agent_ping`, `proxmox_agent_get_osinfo`, `proxmox_agent_get_fsinfo` (3 tools)
**After**: `proxmox_agent_info` with `operation: 'ping' | 'osinfo' | 'fsinfo' | ...` (1 tool)

### 4. `action` Field Renamed to `rule_action` in Firewall Rules

Firewall rules previously used `action: 'ACCEPT' | 'DROP' | 'REJECT'` to describe the rule behavior. Since `action` is now used for CRUD operations, the firewall rule action field is renamed to `rule_action`.

**Before**: `proxmox_create_vm_firewall_rule({node, vmid, action: 'ACCEPT', ...})`
**After**: `proxmox_guest_firewall_rule({action: 'create', type: 'vm', node, vmid, rule_action: 'ACCEPT', ...})`

### All 309 Tool Functionalities Preserved

Every old tool maps exactly to a new tool + parameters. No capabilities were removed.

## Why This Change

- **MCP client tool limits**: Cursor supports ~40 tools, GitHub Copilot supports 128 tools. 309 tools exceeded every client's limit.
- **Anthropic recommendation**: ["Fewer, more thoughtful tools"](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/best-practices) — having too many tools degrades model performance.
- **Better discoverability**: 91 well-organized tools are easier for both humans and AI to navigate than 309 scattered ones.
- **Consistent patterns**: All CRUD operations follow the same `action` parameter pattern.

## Quick Migration Examples

### VM/LXC Type Parameter

```diff
- proxmox_start_vm({ node: 'pve1', vmid: 100 })
+ proxmox_guest_start({ node: 'pve1', vmid: 100, type: 'vm' })

- proxmox_start_lxc({ node: 'pve1', vmid: 200 })
+ proxmox_guest_start({ node: 'pve1', vmid: 200, type: 'lxc' })
```

### CRUD Action Parameter

```diff
- proxmox_list_ha_resources({})
+ proxmox_ha_resource({ action: 'list' })

- proxmox_create_ha_resource({ sid: 'vm:100', group: 'ha-group1' })
+ proxmox_ha_resource({ action: 'create', sid: 'vm:100', group: 'ha-group1' })
```

### Guest Agent Operation Parameter

```diff
- proxmox_execute_vm_command({ node: 'pve1', vmid: 100, command: 'ls /' })
+ proxmox_agent_exec({ node: 'pve1', vmid: 100, operation: 'exec_shell', command: 'ls /' })

- proxmox_agent_get_osinfo({ node: 'pve1', vmid: 100 })
+ proxmox_agent_info({ node: 'pve1', vmid: 100, operation: 'osinfo' })
```

### Firewall Rule (rule_action field)

```diff
- proxmox_create_vm_firewall_rule({ node: 'pve1', vmid: 100, action: 'ACCEPT', type: 'in', ... })
+ proxmox_guest_firewall_rule({ action: 'create', type: 'vm', node: 'pve1', vmid: 100, rule_action: 'ACCEPT', direction: 'in', ... })
```

## Complete Old → New Mapping Table

### Node Management

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_nodes` | `proxmox_node` | `action: 'list'` |
| `proxmox_get_node_status` | `proxmox_node` | `action: 'status'` |
| `proxmox_get_node_network` | `proxmox_node` | `action: 'network'` |
| `proxmox_get_node_dns` | `proxmox_node` | `action: 'dns'` |
| `proxmox_get_network_iface` | `proxmox_node` | `action: 'iface'` |
| `proxmox_get_node_services` | `proxmox_node_service` | `action: 'list'` |
| `proxmox_control_node_service` | `proxmox_node_service` | `action: 'control'` |
| `proxmox_get_node_syslog` | `proxmox_node_log` | `action: 'syslog'` |
| `proxmox_get_node_journal` | `proxmox_node_log` | `action: 'journal'` |
| `proxmox_get_node_tasks` | `proxmox_node_task` | `action: 'list'` |
| `proxmox_get_node_task` | `proxmox_node_task` | `action: 'get'` |
| `proxmox_get_node_aplinfo` | `proxmox_node_info` | `action: 'aplinfo'` |
| `proxmox_get_node_netstat` | `proxmox_node_info` | `action: 'netstat'` |
| `proxmox_get_node_rrddata` | `proxmox_node_info` | `action: 'rrddata'` |
| `proxmox_get_storage_rrddata` | `proxmox_node_info` | `action: 'storage_rrddata'` |
| `proxmox_get_node_report` | `proxmox_node_info` | `action: 'report'` |
| `proxmox_create_network_iface` | `proxmox_node_network_iface` | `action: 'create'` |
| `proxmox_update_network_iface` | `proxmox_node_network_iface` | `action: 'update'` |
| `proxmox_delete_network_iface` | `proxmox_node_network_iface` | `action: 'delete'` |
| `proxmox_apply_network_config` | `proxmox_node_network_iface` | `action: 'apply'` |
| `proxmox_get_node_time` | `proxmox_node_config` | `action: 'get_time'` |
| `proxmox_update_node_time` | `proxmox_node_config` | `action: 'set_time'` |
| `proxmox_update_node_dns` | `proxmox_node_config` | `action: 'set_dns'` |
| `proxmox_get_node_hosts` | `proxmox_node_config` | `action: 'get_hosts'` |
| `proxmox_update_node_hosts` | `proxmox_node_config` | `action: 'set_hosts'` |
| `proxmox_get_node_subscription` | `proxmox_node_subscription` | `action: 'get'` |
| `proxmox_set_node_subscription` | `proxmox_node_subscription` | `action: 'set'` |
| `proxmox_delete_node_subscription` | `proxmox_node_subscription` | `action: 'delete'` |
| `proxmox_apt_update` | `proxmox_apt` | `action: 'update'` |
| `proxmox_apt_upgrade` | `proxmox_apt` | `action: 'upgrade'` |
| `proxmox_apt_versions` | `proxmox_apt` | `action: 'versions'` |
| `proxmox_start_all` | `proxmox_node_bulk` | `action: 'start_all'` |
| `proxmox_stop_all` | `proxmox_node_bulk` | `action: 'stop_all'` |
| `proxmox_migrate_all` | `proxmox_node_bulk` | `action: 'migrate_all'` |
| `proxmox_node_shutdown` | `proxmox_node_power` | `action: 'shutdown'` |
| `proxmox_node_reboot` | `proxmox_node_power` | `action: 'reboot'` |
| `proxmox_node_wakeonlan` | `proxmox_node_power` | `action: 'wakeonlan'` |
| `proxmox_get_node_replication_status` | `proxmox_node_replication` | `action: 'status'` |
| `proxmox_get_node_replication_log` | `proxmox_node_replication` | `action: 'log'` |
| `proxmox_schedule_node_replication` | `proxmox_node_replication` | `action: 'schedule'` |
| `proxmox_get_node_disks` | `proxmox_node_disk` | `action: 'list'` |
| `proxmox_get_disk_smart` | `proxmox_node_disk` | `action: 'smart'` |
| `proxmox_get_node_lvm` | `proxmox_node_disk` | `action: 'lvm'` |
| `proxmox_get_node_zfs` | `proxmox_node_disk` | `action: 'zfs'` |
| `proxmox_get_node_lvmthin` | `proxmox_node_disk` | `action: 'lvmthin'` |
| `proxmox_get_node_directory` | `proxmox_node_disk` | `action: 'directory'` |
| `proxmox_init_disk_gpt` | `proxmox_node_disk_admin` | `action: 'init_gpt'` |
| `proxmox_wipe_disk` | `proxmox_node_disk_admin` | `action: 'wipe'` |

### Guest (VM/LXC) Lifecycle

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_vms` | `proxmox_guest_list` | `action: 'list'` |
| `proxmox_get_vm_status` | `proxmox_guest_status` | `action: 'get', type: 'vm'` |
| `proxmox_get_vm_config` | `proxmox_guest_config` | `action: 'get', type: 'vm'` |
| `proxmox_get_lxc_config` | `proxmox_guest_config` | `action: 'get', type: 'lxc'` |
| `proxmox_get_vm_pending` | `proxmox_guest_pending` | `action: 'get', type: 'vm'` |
| `proxmox_get_lxc_pending` | `proxmox_guest_pending` | `action: 'get', type: 'lxc'` |
| `proxmox_check_vm_feature` | `proxmox_guest_feature` | `action: 'check', type: 'vm'` |
| `proxmox_check_lxc_feature` | `proxmox_guest_feature` | `action: 'check', type: 'lxc'` |
| `proxmox_get_vm_rrddata` | `proxmox_guest_rrddata` | `action: 'get', type: 'vm'` |
| `proxmox_get_lxc_rrddata` | `proxmox_guest_rrddata` | `action: 'get', type: 'lxc'` |
| `proxmox_create_vm` | `proxmox_create_vm` | *(unchanged — kept separate)* |
| `proxmox_create_lxc` | `proxmox_create_lxc` | *(unchanged — kept separate)* |
| `proxmox_get_next_vmid` | `proxmox_get_next_vmid` | *(unchanged — kept separate)* |
| `proxmox_start_vm` | `proxmox_guest_start` | `type: 'vm'` |
| `proxmox_start_lxc` | `proxmox_guest_start` | `type: 'lxc'` |
| `proxmox_stop_vm` | `proxmox_guest_stop` | `type: 'vm'` |
| `proxmox_stop_lxc` | `proxmox_guest_stop` | `type: 'lxc'` |
| `proxmox_reboot_vm` | `proxmox_guest_reboot` | `type: 'vm'` |
| `proxmox_reboot_lxc` | `proxmox_guest_reboot` | `type: 'lxc'` |
| `proxmox_shutdown_vm` | `proxmox_guest_shutdown` | `type: 'vm'` |
| `proxmox_shutdown_lxc` | `proxmox_guest_shutdown` | `type: 'lxc'` |
| `proxmox_pause_vm` | `proxmox_guest_pause` | `type: 'vm'` |
| `proxmox_resume_vm` | `proxmox_guest_resume` | `type: 'vm'` |
| `proxmox_delete_vm` | `proxmox_guest_delete` | `type: 'vm'` |
| `proxmox_delete_lxc` | `proxmox_guest_delete` | `type: 'lxc'` |
| `proxmox_clone_vm` | `proxmox_guest_clone` | `type: 'vm'` |
| `proxmox_clone_lxc` | `proxmox_guest_clone` | `type: 'lxc'` |
| `proxmox_resize_vm` | `proxmox_guest_resize` | `type: 'vm'` |
| `proxmox_resize_lxc` | `proxmox_guest_resize` | `type: 'lxc'` |
| `proxmox_update_vm_config` | `proxmox_guest_config_update` | `type: 'vm'` |
| `proxmox_update_lxc_config` | `proxmox_guest_config_update` | `type: 'lxc'` |
| `proxmox_migrate_vm` | `proxmox_guest_migrate` | `type: 'vm'` |
| `proxmox_migrate_lxc` | `proxmox_guest_migrate` | `type: 'lxc'` |
| `proxmox_create_template_vm` | `proxmox_guest_template` | `type: 'vm'` |
| `proxmox_create_template_lxc` | `proxmox_guest_template` | `type: 'lxc'` |

### Guest Snapshots

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_create_snapshot_vm` | `proxmox_guest_snapshot` | `action: 'create', type: 'vm'` |
| `proxmox_create_snapshot_lxc` | `proxmox_guest_snapshot` | `action: 'create', type: 'lxc'` |
| `proxmox_list_snapshots_vm` | `proxmox_guest_snapshot` | `action: 'list', type: 'vm'` |
| `proxmox_list_snapshots_lxc` | `proxmox_guest_snapshot` | `action: 'list', type: 'lxc'` |
| `proxmox_rollback_snapshot_vm` | `proxmox_guest_snapshot` | `action: 'rollback', type: 'vm'` |
| `proxmox_rollback_snapshot_lxc` | `proxmox_guest_snapshot` | `action: 'rollback', type: 'lxc'` |
| `proxmox_delete_snapshot_vm` | `proxmox_guest_snapshot` | `action: 'delete', type: 'vm'` |
| `proxmox_delete_snapshot_lxc` | `proxmox_guest_snapshot` | `action: 'delete', type: 'lxc'` |

### Guest Disks & Networking

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_add_disk_vm` | `proxmox_vm_disk` | `action: 'add'` |
| `proxmox_remove_disk_vm` | `proxmox_vm_disk` | `action: 'remove'` |
| `proxmox_add_mountpoint_lxc` | `proxmox_lxc_mountpoint` | `action: 'add'` |
| `proxmox_remove_mountpoint_lxc` | `proxmox_lxc_mountpoint` | `action: 'remove'` |
| `proxmox_resize_disk_vm` | `proxmox_guest_disk_resize` | `type: 'vm'` |
| `proxmox_resize_disk_lxc` | `proxmox_guest_disk_resize` | `type: 'lxc'` |
| `proxmox_move_disk_vm` | `proxmox_guest_disk_move` | `type: 'vm'` |
| `proxmox_move_disk_lxc` | `proxmox_guest_disk_move` | `type: 'lxc'` |
| `proxmox_add_network_vm` | `proxmox_guest_network` | `action: 'add', type: 'vm'` |
| `proxmox_add_network_lxc` | `proxmox_guest_network` | `action: 'add', type: 'lxc'` |
| `proxmox_update_network_vm` | `proxmox_guest_network` | `action: 'update', type: 'vm'` |
| `proxmox_update_network_lxc` | `proxmox_guest_network` | `action: 'update', type: 'lxc'` |
| `proxmox_remove_network_vm` | `proxmox_guest_network` | `action: 'remove', type: 'vm'` |
| `proxmox_remove_network_lxc` | `proxmox_guest_network` | `action: 'remove', type: 'lxc'` |

### Guest Firewall

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_vm_firewall_rules` | `proxmox_guest_firewall_rule` | `action: 'list', type: 'vm'` |
| `proxmox_get_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'get', type: 'vm'` |
| `proxmox_create_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'create', type: 'vm'` |
| `proxmox_update_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'update', type: 'vm'` |
| `proxmox_delete_vm_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'delete', type: 'vm'` |
| `proxmox_list_lxc_firewall_rules` | `proxmox_guest_firewall_rule` | `action: 'list', type: 'lxc'` |
| `proxmox_get_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'get', type: 'lxc'` |
| `proxmox_create_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'create', type: 'lxc'` |
| `proxmox_update_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'update', type: 'lxc'` |
| `proxmox_delete_lxc_firewall_rule` | `proxmox_guest_firewall_rule` | `action: 'delete', type: 'lxc'` |

### Console Access

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_vnc_proxy` | `proxmox_console_vnc` | `type: 'vm'` |
| `proxmox_get_lxc_vnc_proxy` | `proxmox_console_vnc` | `type: 'lxc'` |
| `proxmox_get_spice_proxy` | `proxmox_console_spice` | `type: 'vm'` |
| `proxmox_get_term_proxy` | `proxmox_console_term` | `type: 'vm'` |
| `proxmox_get_lxc_term_proxy` | `proxmox_console_term` | `type: 'lxc'` |

### QEMU Guest Agent

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_agent_ping` | `proxmox_agent_info` | `operation: 'ping'` |
| `proxmox_agent_get_osinfo` | `proxmox_agent_info` | `operation: 'osinfo'` |
| `proxmox_agent_get_fsinfo` | `proxmox_agent_info` | `operation: 'fsinfo'` |
| `proxmox_agent_get_network_interfaces` | `proxmox_agent_info` | `operation: 'network_interfaces'` |
| `proxmox_agent_get_time` | `proxmox_agent_info` | `operation: 'time'` |
| `proxmox_agent_get_timezone` | `proxmox_agent_info` | `operation: 'timezone'` |
| `proxmox_agent_get_memory_blocks` | `proxmox_agent_hw` | `operation: 'memory_blocks'` |
| `proxmox_agent_get_vcpus` | `proxmox_agent_hw` | `operation: 'vcpus'` |
| `proxmox_agent_get_memory_block_info` | `proxmox_agent_hw` | `operation: 'memory_block_info'` |
| `proxmox_agent_get_hostname` | `proxmox_agent_user` | `operation: 'hostname'` |
| `proxmox_agent_get_users` | `proxmox_agent_user` | `operation: 'users'` |
| `proxmox_agent_set_user_password` | `proxmox_agent_user` | `operation: 'set_password'` |
| `proxmox_execute_vm_command` | `proxmox_agent_exec` | `operation: 'exec_shell'` |
| `proxmox_agent_exec` | `proxmox_agent_exec` | `operation: 'exec'` |
| `proxmox_agent_exec_status` | `proxmox_agent_exec` | `operation: 'status'` |
| `proxmox_agent_file_read` | `proxmox_agent_file` | `operation: 'read'` |
| `proxmox_agent_file_write` | `proxmox_agent_file` | `operation: 'write'` |
| `proxmox_agent_fsfreeze_status` | `proxmox_agent_freeze` | `operation: 'status'` |
| `proxmox_agent_fsfreeze_freeze` | `proxmox_agent_freeze` | `operation: 'freeze'` |
| `proxmox_agent_fsfreeze_thaw` | `proxmox_agent_freeze` | `operation: 'thaw'` |
| `proxmox_agent_fstrim` | `proxmox_agent_freeze` | `operation: 'fstrim'` |
| `proxmox_agent_shutdown` | `proxmox_agent_power` | `operation: 'shutdown'` |
| `proxmox_agent_suspend_disk` | `proxmox_agent_power` | `operation: 'suspend_disk'` |
| `proxmox_agent_suspend_ram` | `proxmox_agent_power` | `operation: 'suspend_ram'` |
| `proxmox_agent_suspend_hybrid` | `proxmox_agent_power` | `operation: 'suspend_hybrid'` |

### Backup & Restore

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_create_backup_vm` | `proxmox_backup` | `action: 'create', type: 'vm'` |
| `proxmox_create_backup_lxc` | `proxmox_backup` | `action: 'create', type: 'lxc'` |
| `proxmox_list_backups` | `proxmox_backup` | `action: 'list'` |
| `proxmox_restore_backup_vm` | `proxmox_backup` | `action: 'restore', type: 'vm'` |
| `proxmox_restore_backup_lxc` | `proxmox_backup` | `action: 'restore', type: 'lxc'` |
| `proxmox_delete_backup` | `proxmox_backup` | `action: 'delete'` |

### Cloud-Init

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_cloudinit_config` | `proxmox_cloudinit` | `action: 'get'` |
| `proxmox_dump_cloudinit` | `proxmox_cloudinit` | `action: 'dump'` |
| `proxmox_regenerate_cloudinit` | `proxmox_cloudinit` | `action: 'regenerate'` |

### Cluster Operations

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_cluster_status` | `proxmox_cluster` | `action: 'status'` |
| `proxmox_get_cluster_options` | `proxmox_cluster` | `action: 'options'` |
| `proxmox_update_cluster_options` | `proxmox_cluster` | `action: 'update_options'` |
| `proxmox_get_cluster_config` | `proxmox_cluster_config` | `action: 'get'` |
| `proxmox_list_cluster_config_nodes` | `proxmox_cluster_config` | `action: 'list_nodes'` |
| `proxmox_get_cluster_config_node` | `proxmox_cluster_config` | `action: 'get_node'` |
| `proxmox_join_cluster` | `proxmox_cluster_config` | `action: 'join'` |
| `proxmox_get_cluster_totem` | `proxmox_cluster_config` | `action: 'totem'` |

### High Availability

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_ha_resources` | `proxmox_ha_resource` | `action: 'list'` |
| `proxmox_get_ha_resource` | `proxmox_ha_resource` | `action: 'get'` |
| `proxmox_create_ha_resource` | `proxmox_ha_resource` | `action: 'create'` |
| `proxmox_update_ha_resource` | `proxmox_ha_resource` | `action: 'update'` |
| `proxmox_delete_ha_resource` | `proxmox_ha_resource` | `action: 'delete'` |
| `proxmox_get_ha_status` | `proxmox_ha_resource` | `action: 'status'` |
| `proxmox_get_ha_groups` | `proxmox_ha_group` | `action: 'list'` |
| `proxmox_get_ha_group` | `proxmox_ha_group` | `action: 'get'` |
| `proxmox_create_ha_group` | `proxmox_ha_group` | `action: 'create'` |
| `proxmox_update_ha_group` | `proxmox_ha_group` | `action: 'update'` |
| `proxmox_delete_ha_group` | `proxmox_ha_group` | `action: 'delete'` |

### Cluster Firewall

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_cluster_firewall_rules` | `proxmox_cluster_firewall_rule` | `action: 'list'` |
| `proxmox_get_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `action: 'get'` |
| `proxmox_create_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `action: 'create'` |
| `proxmox_update_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `action: 'update'` |
| `proxmox_delete_cluster_firewall_rule` | `proxmox_cluster_firewall_rule` | `action: 'delete'` |
| `proxmox_list_cluster_firewall_groups` | `proxmox_cluster_firewall_group` | `action: 'list'` |
| `proxmox_get_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `action: 'get'` |
| `proxmox_create_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `action: 'create'` |
| `proxmox_update_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `action: 'update'` |
| `proxmox_delete_cluster_firewall_group` | `proxmox_cluster_firewall_group` | `action: 'delete'` |
| `proxmox_get_cluster_firewall_options` | `proxmox_cluster_firewall` | `action: 'get_options'` |
| `proxmox_update_cluster_firewall_options` | `proxmox_cluster_firewall` | `action: 'update_options'` |
| `proxmox_list_cluster_firewall_macros` | `proxmox_cluster_firewall` | `action: 'list_macros'` |
| `proxmox_list_cluster_firewall_refs` | `proxmox_cluster_firewall` | `action: 'list_refs'` |
| `proxmox_list_cluster_firewall_aliases` | `proxmox_cluster_firewall_alias` | `action: 'list'` |
| `proxmox_get_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `action: 'get'` |
| `proxmox_create_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `action: 'create'` |
| `proxmox_update_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `action: 'update'` |
| `proxmox_delete_cluster_firewall_alias` | `proxmox_cluster_firewall_alias` | `action: 'delete'` |
| `proxmox_list_cluster_firewall_ipsets` | `proxmox_cluster_firewall_ipset` | `action: 'list'` |
| `proxmox_create_cluster_firewall_ipset` | `proxmox_cluster_firewall_ipset` | `action: 'create'` |
| `proxmox_delete_cluster_firewall_ipset` | `proxmox_cluster_firewall_ipset` | `action: 'delete'` |
| `proxmox_list_cluster_firewall_ipset_entries` | `proxmox_cluster_firewall_ipset_entry` | `action: 'list'` |
| `proxmox_add_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `action: 'add'` |
| `proxmox_update_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `action: 'update'` |
| `proxmox_delete_cluster_firewall_ipset_entry` | `proxmox_cluster_firewall_ipset_entry` | `action: 'delete'` |

### Cluster Backup & Replication Jobs

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_cluster_backup_jobs` | `proxmox_cluster_backup_job` | `action: 'list'` |
| `proxmox_get_cluster_backup_job` | `proxmox_cluster_backup_job` | `action: 'get'` |
| `proxmox_create_cluster_backup_job` | `proxmox_cluster_backup_job` | `action: 'create'` |
| `proxmox_update_cluster_backup_job` | `proxmox_cluster_backup_job` | `action: 'update'` |
| `proxmox_delete_cluster_backup_job` | `proxmox_cluster_backup_job` | `action: 'delete'` |
| `proxmox_list_cluster_replication_jobs` | `proxmox_cluster_replication_job` | `action: 'list'` |
| `proxmox_get_cluster_replication_job` | `proxmox_cluster_replication_job` | `action: 'get'` |
| `proxmox_create_cluster_replication_job` | `proxmox_cluster_replication_job` | `action: 'create'` |
| `proxmox_update_cluster_replication_job` | `proxmox_cluster_replication_job` | `action: 'update'` |
| `proxmox_delete_cluster_replication_job` | `proxmox_cluster_replication_job` | `action: 'delete'` |

### Storage

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_storage` | `proxmox_storage_config` | `action: 'cluster_usage'` |
| `proxmox_list_storage_config` | `proxmox_storage_config` | `action: 'list'` |
| `proxmox_get_storage_config` | `proxmox_storage_config` | `action: 'get'` |
| `proxmox_create_storage` | `proxmox_storage_config` | `action: 'create'` |
| `proxmox_update_storage` | `proxmox_storage_config` | `action: 'update'` |
| `proxmox_delete_storage` | `proxmox_storage_config` | `action: 'delete'` |
| `proxmox_upload_to_storage` | `proxmox_storage_content` | `action: 'upload'` |
| `proxmox_download_url_to_storage` | `proxmox_storage_content` | `action: 'download_url'` |
| `proxmox_list_storage_content` | `proxmox_storage_content` | `action: 'list'` |
| `proxmox_delete_storage_content` | `proxmox_storage_content` | `action: 'delete'` |
| `proxmox_list_templates` | `proxmox_storage_content` | `action: 'list_templates'` |
| `proxmox_prune_backups` | `proxmox_storage_content` | `action: 'prune'` |
| `proxmox_list_file_restore` | `proxmox_file_restore` | `action: 'list'` |
| `proxmox_download_file_restore` | `proxmox_file_restore` | `action: 'download'` |

### SDN Networking

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_sdn_vnets` | `proxmox_sdn_vnet` | `action: 'list'` |
| `proxmox_get_sdn_vnet` | `proxmox_sdn_vnet` | `action: 'get'` |
| `proxmox_create_sdn_vnet` | `proxmox_sdn_vnet` | `action: 'create'` |
| `proxmox_update_sdn_vnet` | `proxmox_sdn_vnet` | `action: 'update'` |
| `proxmox_delete_sdn_vnet` | `proxmox_sdn_vnet` | `action: 'delete'` |
| `proxmox_list_sdn_zones` | `proxmox_sdn_zone` | `action: 'list'` |
| `proxmox_get_sdn_zone` | `proxmox_sdn_zone` | `action: 'get'` |
| `proxmox_create_sdn_zone` | `proxmox_sdn_zone` | `action: 'create'` |
| `proxmox_update_sdn_zone` | `proxmox_sdn_zone` | `action: 'update'` |
| `proxmox_delete_sdn_zone` | `proxmox_sdn_zone` | `action: 'delete'` |
| `proxmox_list_sdn_controllers` | `proxmox_sdn_controller` | `action: 'list'` |
| `proxmox_get_sdn_controller` | `proxmox_sdn_controller` | `action: 'get'` |
| `proxmox_create_sdn_controller` | `proxmox_sdn_controller` | `action: 'create'` |
| `proxmox_update_sdn_controller` | `proxmox_sdn_controller` | `action: 'update'` |
| `proxmox_delete_sdn_controller` | `proxmox_sdn_controller` | `action: 'delete'` |
| `proxmox_list_sdn_subnets` | `proxmox_sdn_subnet` | `action: 'list'` |
| `proxmox_get_sdn_subnet` | `proxmox_sdn_subnet` | `action: 'get'` |
| `proxmox_create_sdn_subnet` | `proxmox_sdn_subnet` | `action: 'create'` |
| `proxmox_update_sdn_subnet` | `proxmox_sdn_subnet` | `action: 'update'` |
| `proxmox_delete_sdn_subnet` | `proxmox_sdn_subnet` | `action: 'delete'` |

### Access Control

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_users` | `proxmox_user` | `action: 'list'` |
| `proxmox_get_user` | `proxmox_user` | `action: 'get'` |
| `proxmox_create_user` | `proxmox_user` | `action: 'create'` |
| `proxmox_update_user` | `proxmox_user` | `action: 'update'` |
| `proxmox_delete_user` | `proxmox_user` | `action: 'delete'` |
| `proxmox_list_groups` | `proxmox_group` | `action: 'list'` |
| `proxmox_create_group` | `proxmox_group` | `action: 'create'` |
| `proxmox_update_group` | `proxmox_group` | `action: 'update'` |
| `proxmox_delete_group` | `proxmox_group` | `action: 'delete'` |
| `proxmox_list_roles` | `proxmox_role` | `action: 'list'` |
| `proxmox_create_role` | `proxmox_role` | `action: 'create'` |
| `proxmox_update_role` | `proxmox_role` | `action: 'update'` |
| `proxmox_delete_role` | `proxmox_role` | `action: 'delete'` |
| `proxmox_get_acl` | `proxmox_acl` | `action: 'get'` |
| `proxmox_update_acl` | `proxmox_acl` | `action: 'update'` |
| `proxmox_list_domains` | `proxmox_domain` | `action: 'list'` |
| `proxmox_get_domain` | `proxmox_domain` | `action: 'get'` |
| `proxmox_create_domain` | `proxmox_domain` | `action: 'create'` |
| `proxmox_update_domain` | `proxmox_domain` | `action: 'update'` |
| `proxmox_delete_domain` | `proxmox_domain` | `action: 'delete'` |
| `proxmox_list_user_tokens` | `proxmox_user_token` | `action: 'list'` |
| `proxmox_get_user_token` | `proxmox_user_token` | `action: 'get'` |
| `proxmox_create_user_token` | `proxmox_user_token` | `action: 'create'` |
| `proxmox_update_user_token` | `proxmox_user_token` | `action: 'update'` |
| `proxmox_delete_user_token` | `proxmox_user_token` | `action: 'delete'` |
| `proxmox_list_pools` | `proxmox_pool` | `action: 'list'` |
| `proxmox_get_pool` | `proxmox_pool` | `action: 'get'` |
| `proxmox_create_pool` | `proxmox_pool` | `action: 'create'` |
| `proxmox_update_pool` | `proxmox_pool` | `action: 'update'` |
| `proxmox_delete_pool` | `proxmox_pool` | `action: 'delete'` |

### Ceph

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_ceph_status` | `proxmox_ceph` | `action: 'status'` |
| `proxmox_list_ceph_osds` | `proxmox_ceph_osd` | `action: 'list'` |
| `proxmox_create_ceph_osd` | `proxmox_ceph_osd` | `action: 'create'` |
| `proxmox_delete_ceph_osd` | `proxmox_ceph_osd` | `action: 'delete'` |
| `proxmox_list_ceph_mons` | `proxmox_ceph_mon` | `action: 'list'` |
| `proxmox_create_ceph_mon` | `proxmox_ceph_mon` | `action: 'create'` |
| `proxmox_delete_ceph_mon` | `proxmox_ceph_mon` | `action: 'delete'` |
| `proxmox_list_ceph_mds` | `proxmox_ceph_mds` | `action: 'list'` |
| `proxmox_create_ceph_mds` | `proxmox_ceph_mds` | `action: 'create'` |
| `proxmox_delete_ceph_mds` | `proxmox_ceph_mds` | `action: 'delete'` |
| `proxmox_list_ceph_pools` | `proxmox_ceph_pool` | `action: 'list'` |
| `proxmox_create_ceph_pool` | `proxmox_ceph_pool` | `action: 'create'` |
| `proxmox_update_ceph_pool` | `proxmox_ceph_pool` | `action: 'update'` |
| `proxmox_delete_ceph_pool` | `proxmox_ceph_pool` | `action: 'delete'` |
| `proxmox_list_ceph_fs` | `proxmox_ceph_fs` | `action: 'list'` |
| `proxmox_create_ceph_fs` | `proxmox_ceph_fs` | `action: 'create'` |

### Certificates & ACME

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_get_node_certificates` | `proxmox_certificate` | `action: 'list'` |
| `proxmox_upload_custom_certificate` | `proxmox_certificate` | `action: 'upload'` |
| `proxmox_delete_custom_certificate` | `proxmox_certificate` | `action: 'delete'` |
| `proxmox_order_acme_certificate` | `proxmox_acme_cert` | `action: 'order'` |
| `proxmox_renew_acme_certificate` | `proxmox_acme_cert` | `action: 'renew'` |
| `proxmox_revoke_acme_certificate` | `proxmox_acme_cert` | `action: 'revoke'` |
| `proxmox_get_node_acme_config` | `proxmox_acme_cert` | `action: 'config'` |
| `proxmox_list_acme_accounts` | `proxmox_acme_account` | `action: 'list'` |
| `proxmox_get_acme_account` | `proxmox_acme_account` | `action: 'get'` |
| `proxmox_create_acme_account` | `proxmox_acme_account` | `action: 'create'` |
| `proxmox_update_acme_account` | `proxmox_acme_account` | `action: 'update'` |
| `proxmox_delete_acme_account` | `proxmox_acme_account` | `action: 'delete'` |
| `proxmox_list_acme_plugins` | `proxmox_acme_info` | `action: 'list_plugins'` |
| `proxmox_get_acme_plugin` | `proxmox_acme_info` | `action: 'get_plugin'` |
| `proxmox_get_acme_directories` | `proxmox_acme_info` | `action: 'directories'` |

### Notifications

| Old Tool | New Tool | Parameters |
|----------|----------|------------|
| `proxmox_list_notification_targets` | `proxmox_notification` | `action: 'list'` |
| `proxmox_get_notification_target` | `proxmox_notification` | `action: 'get'` |
| `proxmox_create_notification_target` | `proxmox_notification` | `action: 'create'` |
| `proxmox_delete_notification_target` | `proxmox_notification` | `action: 'delete'` |
| `proxmox_test_notification_target` | `proxmox_notification` | `action: 'test'` |

## Tools That Stayed Separate

These tools were **not** consolidated because their schemas are fundamentally different:

| Tool | Reason |
|------|--------|
| `proxmox_create_vm` | VM creation has ~50 unique parameters (CPU type, BIOS, machine type, VGA, etc.) that don't apply to LXC |
| `proxmox_create_lxc` | LXC creation has unique parameters (ostemplate, rootfs, unprivileged, etc.) that don't apply to VMs |
| `proxmox_get_next_vmid` | Simple singleton utility — widely referenced, no benefit from merging into `proxmox_cluster` |
| `proxmox_vm_disk` | VM disk operations (virtio, scsi, ide, sata buses) differ fundamentally from LXC mount points |
| `proxmox_lxc_mountpoint` | LXC mount points (mp0, mp1, rootfs) differ fundamentally from VM disk operations |

## AI Agent Migration

If you have AI agents or skills that reference the old 309-tool names, update them:

### Automated Update

```bash
# If using the Agent Skills standard:
npx skills update Bldg-7/proxmox-mcp

# If using Claude Code Plugin:
/plugin marketplace update Bldg-7/proxmox-mcp
```

### Manual Update

Search your skill files for old tool names and replace them using the mapping table above. The most common patterns:

```
# Power operations (most commonly referenced)
proxmox_start_vm        → proxmox_guest_start  (type: 'vm')
proxmox_stop_vm         → proxmox_guest_stop   (type: 'vm')
proxmox_shutdown_vm     → proxmox_guest_shutdown (type: 'vm')
proxmox_reboot_vm       → proxmox_guest_reboot  (type: 'vm')

# Status/config (most commonly referenced)
proxmox_get_vm_status   → proxmox_guest_status  (action: 'get', type: 'vm')
proxmox_get_vm_config   → proxmox_guest_config  (action: 'get', type: 'vm')

# These three are UNCHANGED
proxmox_create_vm       → proxmox_create_vm     (no change)
proxmox_create_lxc      → proxmox_create_lxc    (no change)
proxmox_get_next_vmid   → proxmox_get_next_vmid (no change)
```

## New 91-Tool List (Complete)

For reference, here are all 91 tool names in the new API:

```
proxmox_node                       proxmox_cluster
proxmox_node_service               proxmox_node_log
proxmox_node_task                  proxmox_node_info
proxmox_node_config                proxmox_node_subscription
proxmox_apt                        proxmox_node_bulk
proxmox_node_power                 proxmox_node_replication
proxmox_node_network_iface         proxmox_guest_list
proxmox_guest_status               proxmox_guest_config
proxmox_guest_pending              proxmox_guest_feature
proxmox_guest_rrddata              proxmox_create_lxc
proxmox_create_vm                  proxmox_get_next_vmid
proxmox_ha_resource                proxmox_ha_group
proxmox_cluster_firewall_rule      proxmox_cluster_firewall_group
proxmox_cluster_firewall           proxmox_cluster_firewall_alias
proxmox_cluster_firewall_ipset     proxmox_cluster_firewall_ipset_entry
proxmox_cluster_backup_job         proxmox_cluster_replication_job
proxmox_cluster_config             proxmox_sdn_vnet
proxmox_sdn_zone                   proxmox_sdn_controller
proxmox_sdn_subnet                 proxmox_user
proxmox_group                      proxmox_role
proxmox_acl                        proxmox_domain
proxmox_user_token                 proxmox_pool
proxmox_storage_config             proxmox_storage_content
proxmox_file_restore               proxmox_ceph
proxmox_ceph_osd                   proxmox_ceph_mon
proxmox_ceph_mds                   proxmox_ceph_pool
proxmox_ceph_fs                    proxmox_guest_start
proxmox_guest_stop                 proxmox_guest_reboot
proxmox_guest_shutdown             proxmox_guest_delete
proxmox_guest_pause                proxmox_guest_resume
proxmox_guest_clone                proxmox_guest_resize
proxmox_guest_config_update        proxmox_guest_migrate
proxmox_guest_template             proxmox_agent_info
proxmox_agent_hw                   proxmox_agent_exec
proxmox_agent_file                 proxmox_agent_freeze
proxmox_agent_power                proxmox_agent_user
proxmox_guest_firewall_rule        proxmox_console_vnc
proxmox_console_term               proxmox_console_spice
proxmox_guest_snapshot             proxmox_backup
proxmox_vm_disk                    proxmox_lxc_mountpoint
proxmox_guest_disk_resize          proxmox_guest_disk_move
proxmox_guest_network              proxmox_node_disk
proxmox_node_disk_admin            proxmox_cloudinit
proxmox_certificate                proxmox_acme_cert
proxmox_acme_account               proxmox_acme_info
proxmox_notification
```
