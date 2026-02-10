# Proxmox MCP Tools Reference

> Complete reference for all 91 consolidated tools in the Proxmox MCP server

**Current Version**: 0.6.1  
**Total Tools**: 91  
**Last Updated**: 2026-02-10

---

## Table of Contents

- [Overview](#overview)
- [Permission Model](#permission-model)
- [Tools Reference](#tools-reference)
  - [Node & Cluster (13 tools)](#node--cluster-13-tools)
  - [Guest Management (20 tools)](#guest-management-20-tools)
  - [Guest Agent (7 tools)](#guest-agent-7-tools)
  - [Storage & Ceph (9 tools)](#storage--ceph-9-tools)
  - [Cluster Services (12 tools)](#cluster-services-12-tools)
  - [SDN Networking (4 tools)](#sdn-networking-4-tools)
  - [Access Control (6 tools)](#access-control-6-tools)
  - [Pool Management (1 tool)](#pool-management-1-tool)
  - [Guest Firewall (1 tool)](#guest-firewall-1-tool)
  - [Snapshots & Backups (2 tools)](#snapshots--backups-2-tools)
  - [Disks & Network (7 tools)](#disks--network-7-tools)
  - [Console Access (3 tools)](#console-access-3-tools)
  - [Cloud-Init, Certificates & ACME (5 tools)](#cloud-init-certificates--acme-5-tools)
  - [Notifications (1 tool)](#notifications-1-tool)

---

## Overview

This document provides a complete reference for all 91 consolidated tools available in the Proxmox MCP server. Each tool uses an `action`, `type`, or `operation` parameter to multiplex related operations into a single tool, reducing tool count while maintaining full API coverage.

### Tool Distribution

| Category | Count | Permission |
|----------|-------|------------|
| Node & Cluster | 13 | Mixed |
| Guest Management | 20 | Mixed |
| Guest Agent | 7 | Elevated |
| Storage & Ceph | 9 | Mixed |
| Cluster Services | 12 | Mixed |
| SDN Networking | 4 | Mixed |
| Access Control | 6 | Mixed |
| Pool Management | 1 | Mixed |
| Guest Firewall | 1 | Mixed |
| Snapshots & Backups | 2 | Elevated |
| Disks & Network | 7 | Mixed |
| Console Access | 3 | Elevated |
| Cloud-Init, Certificates & ACME | 5 | Mixed |
| Notifications | 1 | Mixed |
| **Total** | **91** | |

---

## Permission Model

Tools are classified into two permission levels:

| Level | Symbol | Description | Environment Variable |
|-------|--------|-------------|---------------------|
| **Basic** | - | Read-only operations, always allowed | (none required) |
| **Elevated** | 🔒 | Create/modify/delete operations | `PROXMOX_ALLOW_ELEVATED=true` |

Many consolidated tools contain both basic and elevated actions. The permission level depends on the specific `action`/`operation` used.

---

## Tools Reference

### Node & Cluster (13 tools)

#### `proxmox_node`
Query Proxmox node info. action=list: list all nodes | action=status: node status (elevated) | action=network: network interfaces | action=dns: DNS config | action=iface: specific interface details

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List all cluster nodes |
| `status` | Elevated 🔒 | Get detailed node status |
| `network` | Basic | List network interfaces |
| `dns` | Basic | Get DNS configuration |
| `iface` | Basic | Get specific interface details |

---

#### `proxmox_cluster`
Query Proxmox cluster info. action=status: overall cluster status with nodes and resource usage | action=options: get cluster-wide options | action=update_options: update cluster-wide options (requires elevated permissions)

| Action | Permission | Description |
|--------|------------|-------------|
| `status` | Basic | Get cluster status |
| `options` | Basic | Get cluster-wide options |
| `update_options` | Elevated 🔒 | Update cluster-wide options |

---

#### `proxmox_node_service`
Manage node services. action=list: list services | action=control: start/stop/restart a service (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List services |
| `control` | Elevated 🔒 | Start/stop/restart a service |

---

#### `proxmox_node_log`
Read node logs. action=syslog: read syslog | action=journal: read systemd journal

| Action | Permission | Description |
|--------|------------|-------------|
| `syslog` | Basic | Read syslog |
| `journal` | Basic | Read systemd journal |

---

#### `proxmox_node_task`
Query node tasks. action=list: list recent tasks | action=get: get task details by UPID

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List recent tasks |
| `get` | Basic | Get task details by UPID |

---

#### `proxmox_node_info`
Query node information. action=aplinfo: appliance templates | action=netstat: network stats | action=rrddata: performance metrics | action=storage_rrddata: storage metrics | action=report: diagnostic report

| Action | Permission | Description |
|--------|------------|-------------|
| `aplinfo` | Basic | List appliance templates |
| `netstat` | Basic | Network connection stats |
| `rrddata` | Basic | Node performance metrics |
| `storage_rrddata` | Basic | Storage performance metrics |
| `report` | Basic | Diagnostic report |

---

#### `proxmox_node_config`
Manage node configuration. action=get_time|set_time(elevated)|set_dns(elevated)|get_hosts|set_hosts(elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `get_time` | Basic | Get time and timezone |
| `set_time` | Elevated 🔒 | Set timezone |
| `set_dns` | Elevated 🔒 | Update DNS configuration |
| `get_hosts` | Basic | Get hosts file entries |
| `set_hosts` | Elevated 🔒 | Update hosts file |

---

#### `proxmox_node_subscription`
Manage node subscription. action=get: get info | action=set: set key (elevated) | action=delete: remove (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `get` | Basic | Get subscription info |
| `set` | Elevated 🔒 | Set subscription key |
| `delete` | Elevated 🔒 | Remove subscription |

---

#### `proxmox_apt`
Manage APT packages. action=update(elevated)|upgrade(elevated): package ops | action=versions: list versions

| Action | Permission | Description |
|--------|------------|-------------|
| `update` | Elevated 🔒 | Update package lists |
| `upgrade` | Elevated 🔒 | Upgrade packages |
| `versions` | Basic | List package versions |

---

#### `proxmox_node_bulk`
Bulk guest operations. action=start_all|stop_all|migrate_all (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `start_all` | Elevated 🔒 | Start all guests |
| `stop_all` | Elevated 🔒 | Stop all guests |
| `migrate_all` | Elevated 🔒 | Migrate all guests |

---

#### `proxmox_node_power`
Node power control. action=shutdown|reboot|wakeonlan (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `shutdown` | Elevated 🔒 | Shutdown node |
| `reboot` | Elevated 🔒 | Reboot node |
| `wakeonlan` | Elevated 🔒 | Wake node via WOL |

---

#### `proxmox_node_replication`
Manage node replication. action=status|log: query | action=schedule: trigger now (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `status` | Basic | Get replication status |
| `log` | Basic | Get replication log |
| `schedule` | Elevated 🔒 | Trigger replication now |

---

#### `proxmox_node_network_iface`
Manage node network interfaces. action=create|update|delete|apply (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `create` | Elevated 🔒 | Create network interface |
| `update` | Elevated 🔒 | Update network interface |
| `delete` | Elevated 🔒 | Delete network interface |
| `apply` | Elevated 🔒 | Apply pending network changes |

---

### Guest Management (20 tools)

#### `proxmox_guest_list`
List all virtual machines and containers across the cluster with their status

**Permission**: Basic

---

#### `proxmox_guest_status`
Get detailed status for a VM (type=vm) or LXC container (type=lxc)

| Type | Description |
|------|-------------|
| `vm` | QEMU virtual machine |
| `lxc` | LXC container |

**Permission**: Basic

---

#### `proxmox_guest_config`
Get hardware configuration for a VM (type=vm) or LXC container (type=lxc)

**Permission**: Basic

---

#### `proxmox_guest_pending`
Get pending configuration changes for a VM (type=vm) or LXC container (type=lxc)

**Permission**: Basic

---

#### `proxmox_guest_feature`
Check if a feature (snapshot, clone, copy) is available for a VM (type=vm) or LXC container (type=lxc)

**Permission**: Basic

---

#### `proxmox_guest_rrddata`
Get performance metrics (RRD data) for a VM (type=vm) or LXC container (type=lxc)

**Permission**: Basic

---

#### `proxmox_guest_start` 🔒
Start a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_stop` 🔒
Forcefully stop a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_reboot` 🔒
Reboot a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_shutdown` 🔒
Gracefully shutdown a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_delete` 🔒
Delete a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_pause` 🔒
Pause a QEMU virtual machine -- VM only (requires elevated permissions)

---

#### `proxmox_guest_resume` 🔒
Resume a paused QEMU virtual machine -- VM only (requires elevated permissions)

---

#### `proxmox_guest_clone` 🔒
Clone a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_resize` 🔒
Resize VM/LXC CPU or memory (type=vm|lxc) (requires elevated permissions)

---

#### `proxmox_guest_config_update` 🔒
Update VM/LXC config key-value pairs (type=vm|lxc) (requires elevated permissions)

---

#### `proxmox_guest_migrate` 🔒
Migrate a VM or LXC container to another node (type=vm|lxc) (requires elevated permissions)

---

#### `proxmox_guest_template` 🔒
Convert a VM or LXC container to a template (type=vm|lxc) (requires elevated permissions)

---

#### `proxmox_create_lxc` 🔒
Create a new LXC container (requires elevated permissions)

---

#### `proxmox_create_vm` 🔒
Create a new QEMU virtual machine (requires elevated permissions)

---

#### `proxmox_get_next_vmid`
Get the next available VM/Container ID number

**Permission**: Basic

---

### Guest Agent (7 tools)

All guest agent tools require **elevated permissions** and work via the QEMU guest agent.

#### `proxmox_agent_info` 🔒
Query guest info via QEMU agent. operation=ping|osinfo|fsinfo|network_interfaces|time|timezone (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `ping` | Ping guest agent |
| `osinfo` | Get OS information |
| `fsinfo` | Get filesystem information |
| `network_interfaces` | Get network interfaces |
| `time` | Get guest time |
| `timezone` | Get guest timezone |

---

#### `proxmox_agent_hw` 🔒
Query guest hardware via QEMU agent. operation=memory_blocks|vcpus|memory_block_info|hostname|users (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `memory_blocks` | List memory blocks |
| `vcpus` | List virtual CPUs |
| `memory_block_info` | Get memory block info |
| `hostname` | Get hostname |
| `users` | List logged-in users |

---

#### `proxmox_agent_exec` 🔒
Execute commands via QEMU agent. operation=exec: run command | operation=status: check execution status (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `exec` | Run command in guest |
| `status` | Check execution status |

---

#### `proxmox_agent_file` 🔒
Read/write files via QEMU agent. operation=read|write (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `read` | Read file from guest |
| `write` | Write file to guest |

---

#### `proxmox_agent_freeze` 🔒
Manage filesystem freeze via QEMU agent. operation=status|freeze|thaw|fstrim (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `status` | Get freeze status |
| `freeze` | Freeze filesystems |
| `thaw` | Thaw filesystems |
| `fstrim` | Trim filesystems |

---

#### `proxmox_agent_power` 🔒
Guest power control via QEMU agent. operation=shutdown|suspend_disk|suspend_ram|suspend_hybrid (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `shutdown` | Shutdown via agent |
| `suspend_disk` | Suspend to disk |
| `suspend_ram` | Suspend to RAM |
| `suspend_hybrid` | Hybrid suspend |

---

#### `proxmox_agent_user` 🔒
Manage guest users via QEMU agent. operation=set_password (requires elevated permissions)

| Operation | Description |
|-----------|-------------|
| `set_password` | Set user password |

---

### Storage & Ceph (9 tools)

#### `proxmox_storage_config`
Manage storage configurations (list, get, create, update, delete, cluster_usage)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List storage configurations |
| `get` | Basic | Get storage config by name |
| `create` | Elevated 🔒 | Create storage configuration |
| `update` | Elevated 🔒 | Update storage configuration |
| `delete` | Elevated 🔒 | Delete storage configuration |
| `cluster_usage` | Basic | Get cluster-wide storage usage |

---

#### `proxmox_storage_content`
Manage storage content (list, list_templates, upload, download_url, delete, prune)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List storage content |
| `list_templates` | Basic | List available templates |
| `upload` | Elevated 🔒 | Upload file to storage |
| `download_url` | Elevated 🔒 | Download from URL to storage |
| `delete` | Elevated 🔒 | Delete storage content |
| `prune` | Elevated 🔒 | Prune old backups |

---

#### `proxmox_file_restore`
Restore files from backup. action=list: list files in backup | action=download: download file from backup

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List files in backup |
| `download` | Basic | Download file from backup |

---

#### `proxmox_ceph`
Query Ceph cluster. action=status: get Ceph cluster health, FSID, monitors, OSDs, and placement groups

| Action | Permission | Description |
|--------|------------|-------------|
| `status` | Basic | Get Ceph cluster status |

---

#### `proxmox_ceph_osd`
Manage Ceph OSDs (list, create, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List OSDs |
| `create` | Elevated 🔒 | Create OSD |
| `delete` | Elevated 🔒 | Delete OSD |

---

#### `proxmox_ceph_mon`
Manage Ceph monitors (list, create, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List monitors |
| `create` | Elevated 🔒 | Create monitor |
| `delete` | Elevated 🔒 | Delete monitor |

---

#### `proxmox_ceph_mds`
Manage Ceph MDS daemons (list, create, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List MDS daemons |
| `create` | Elevated 🔒 | Create MDS daemon |
| `delete` | Elevated 🔒 | Delete MDS daemon |

---

#### `proxmox_ceph_pool`
Manage Ceph pools (list, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List Ceph pools |
| `create` | Elevated 🔒 | Create pool |
| `update` | Elevated 🔒 | Update pool |
| `delete` | Elevated 🔒 | Delete pool |

---

#### `proxmox_ceph_fs`
Manage Ceph filesystems (list, create)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List Ceph filesystems |
| `create` | Elevated 🔒 | Create filesystem |

---

### Cluster Services (12 tools)

#### `proxmox_ha_resource`
Manage HA resources. action=list: list resources | action=get: get resource details | action=status: get HA manager status | action=create: create resource (elevated) | action=update: update resource (elevated) | action=delete: delete resource (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List HA resources |
| `get` | Basic | Get resource details |
| `status` | Basic | Get HA manager status |
| `create` | Elevated 🔒 | Create HA resource |
| `update` | Elevated 🔒 | Update HA resource |
| `delete` | Elevated 🔒 | Delete HA resource |

---

#### `proxmox_ha_group`
Manage HA groups. action=list: list groups | action=get: get group details | action=create: create group (elevated) | action=update: update group (elevated) | action=delete: delete group (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List HA groups |
| `get` | Basic | Get group details |
| `create` | Elevated 🔒 | Create HA group |
| `update` | Elevated 🔒 | Update HA group |
| `delete` | Elevated 🔒 | Delete HA group |

---

#### `proxmox_cluster_firewall_rule`
Manage cluster firewall rules. action=list: list rules | action=get: get rule by position | action=create: create rule (elevated) | action=update: update rule (elevated) | action=delete: delete rule (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List firewall rules |
| `get` | Basic | Get rule by position |
| `create` | Elevated 🔒 | Create firewall rule |
| `update` | Elevated 🔒 | Update firewall rule |
| `delete` | Elevated 🔒 | Delete firewall rule |

---

#### `proxmox_cluster_firewall_group`
Manage cluster firewall groups. action=list: list groups | action=get: get group by name | action=create: create group (elevated) | action=update: update group (elevated) | action=delete: delete group (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List firewall groups |
| `get` | Basic | Get group by name |
| `create` | Elevated 🔒 | Create firewall group |
| `update` | Elevated 🔒 | Update firewall group |
| `delete` | Elevated 🔒 | Delete firewall group |

---

#### `proxmox_cluster_firewall`
Query/manage cluster firewall metadata. action=get_options: get firewall options | action=update_options: update firewall options (elevated) | action=list_macros: list firewall macros | action=list_refs: list firewall refs

| Action | Permission | Description |
|--------|------------|-------------|
| `get_options` | Basic | Get firewall options |
| `update_options` | Elevated 🔒 | Update firewall options |
| `list_macros` | Basic | List firewall macros |
| `list_refs` | Basic | List firewall refs |

---

#### `proxmox_cluster_firewall_alias`
Manage cluster firewall aliases. action=list: list aliases | action=get: get alias by name | action=create: create alias (elevated) | action=update: update alias (elevated) | action=delete: delete alias (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List aliases |
| `get` | Basic | Get alias by name |
| `create` | Elevated 🔒 | Create alias |
| `update` | Elevated 🔒 | Update alias |
| `delete` | Elevated 🔒 | Delete alias |

---

#### `proxmox_cluster_firewall_ipset`
Manage cluster firewall IP sets. action=list: list IP sets | action=create: create IP set (elevated) | action=delete: delete IP set (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List IP sets |
| `create` | Elevated 🔒 | Create IP set |
| `delete` | Elevated 🔒 | Delete IP set |

---

#### `proxmox_cluster_firewall_ipset_entry`
Manage cluster firewall IP set entries. action=list: list entries | action=create: add entry (elevated) | action=update: update entry (elevated) | action=delete: delete entry (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List entries |
| `create` | Elevated 🔒 | Add entry |
| `update` | Elevated 🔒 | Update entry |
| `delete` | Elevated 🔒 | Delete entry |

---

#### `proxmox_cluster_backup_job`
Manage cluster backup jobs. action=list: list jobs | action=get: get job by ID | action=create: create job (elevated) | action=update: update job (elevated) | action=delete: delete job (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List backup jobs |
| `get` | Basic | Get job by ID |
| `create` | Elevated 🔒 | Create backup job |
| `update` | Elevated 🔒 | Update backup job |
| `delete` | Elevated 🔒 | Delete backup job |

---

#### `proxmox_cluster_replication_job`
Manage cluster replication jobs. action=list: list jobs | action=get: get job by ID | action=create: create job (elevated) | action=update: update job (elevated) | action=delete: delete job (elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List replication jobs |
| `get` | Basic | Get job by ID |
| `create` | Elevated 🔒 | Create replication job |
| `update` | Elevated 🔒 | Update replication job |
| `delete` | Elevated 🔒 | Delete replication job |

---

#### `proxmox_cluster_config`
Manage cluster config. action=get: get config | action=list_nodes: list config nodes | action=get_node: get node config | action=join: join cluster (elevated) | action=totem: get totem config

| Action | Permission | Description |
|--------|------------|-------------|
| `get` | Basic | Get cluster config |
| `list_nodes` | Basic | List config nodes |
| `get_node` | Basic | Get node config |
| `join` | Elevated 🔒 | Join cluster |
| `totem` | Basic | Get totem config |

---

### SDN Networking (4 tools)

#### `proxmox_sdn_vnet`
Manage SDN virtual networks (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List VNets |
| `get` | Basic | Get VNet details |
| `create` | Elevated 🔒 | Create VNet |
| `update` | Elevated 🔒 | Update VNet |
| `delete` | Elevated 🔒 | Delete VNet |

---

#### `proxmox_sdn_zone`
Manage SDN zones (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List zones |
| `get` | Basic | Get zone details |
| `create` | Elevated 🔒 | Create zone |
| `update` | Elevated 🔒 | Update zone |
| `delete` | Elevated 🔒 | Delete zone |

---

#### `proxmox_sdn_controller`
Manage SDN controllers (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List controllers |
| `get` | Basic | Get controller details |
| `create` | Elevated 🔒 | Create controller |
| `update` | Elevated 🔒 | Update controller |
| `delete` | Elevated 🔒 | Delete controller |

---

#### `proxmox_sdn_subnet`
Manage SDN subnets (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List subnets |
| `get` | Basic | Get subnet details |
| `create` | Elevated 🔒 | Create subnet |
| `update` | Elevated 🔒 | Update subnet |
| `delete` | Elevated 🔒 | Delete subnet |

---

### Access Control (6 tools)

#### `proxmox_user`
Manage Proxmox users (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List users |
| `get` | Basic | Get user details |
| `create` | Elevated 🔒 | Create user |
| `update` | Elevated 🔒 | Update user |
| `delete` | Elevated 🔒 | Delete user |

---

#### `proxmox_group`
Manage Proxmox groups (list, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List groups |
| `create` | Elevated 🔒 | Create group |
| `update` | Elevated 🔒 | Update group |
| `delete` | Elevated 🔒 | Delete group |

---

#### `proxmox_role`
Manage Proxmox roles (list, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List roles |
| `create` | Elevated 🔒 | Create role |
| `update` | Elevated 🔒 | Update role |
| `delete` | Elevated 🔒 | Delete role |

---

#### `proxmox_acl`
Manage ACL entries (get, update)

| Action | Permission | Description |
|--------|------------|-------------|
| `get` | Basic | Get ACL entries |
| `update` | Elevated 🔒 | Update ACL entries |

---

#### `proxmox_domain`
Manage authentication domains (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List domains |
| `get` | Basic | Get domain details |
| `create` | Elevated 🔒 | Create domain |
| `update` | Elevated 🔒 | Update domain |
| `delete` | Elevated 🔒 | Delete domain |

---

#### `proxmox_user_token`
Manage user API tokens (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List tokens |
| `get` | Basic | Get token details |
| `create` | Elevated 🔒 | Create token |
| `update` | Elevated 🔒 | Update token |
| `delete` | Elevated 🔒 | Delete token |

---

### Pool Management (1 tool)

#### `proxmox_pool`
Manage resource pools (list, get, create, update, delete)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List pools |
| `get` | Basic | Get pool details |
| `create` | Elevated 🔒 | Create pool |
| `update` | Elevated 🔒 | Update pool |
| `delete` | Elevated 🔒 | Delete pool |

---

### Guest Firewall (1 tool)

#### `proxmox_guest_firewall_rule`
Manage per-guest firewall rules. action=list|get: query rules | action=create|update|delete: manage rules (elevated). type=vm|lxc. Uses rule_action for firewall action (ACCEPT/REJECT/DROP), rule_type for direction (in/out/group).

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List guest firewall rules |
| `get` | Basic | Get rule by position |
| `create` | Elevated 🔒 | Create firewall rule |
| `update` | Elevated 🔒 | Update firewall rule |
| `delete` | Elevated 🔒 | Delete firewall rule |

---

### Snapshots & Backups (2 tools)

#### `proxmox_guest_snapshot` 🔒
Manage guest snapshots (create, list, rollback, delete) for VMs and LXC containers (requires elevated permissions)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Elevated 🔒 | List snapshots |
| `create` | Elevated 🔒 | Create snapshot |
| `rollback` | Elevated 🔒 | Rollback to snapshot |
| `delete` | Elevated 🔒 | Delete snapshot |

---

#### `proxmox_backup` 🔒
Manage guest backups (create, list, restore, delete) for VMs and LXC containers (requires elevated permissions)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Elevated 🔒 | List backups |
| `create` | Elevated 🔒 | Create backup |
| `restore` | Elevated 🔒 | Restore from backup |
| `delete` | Elevated 🔒 | Delete backup |

---

### Disks & Network (7 tools)

#### `proxmox_vm_disk`
Manage VM disks. action=add: add disk | action=remove: remove disk (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `add` | Elevated 🔒 | Add disk to VM |
| `remove` | Elevated 🔒 | Remove disk from VM |

---

#### `proxmox_lxc_mountpoint`
Manage LXC mount points. action=add: add mountpoint | action=remove: remove mountpoint (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `add` | Elevated 🔒 | Add mount point |
| `remove` | Elevated 🔒 | Remove mount point |

---

#### `proxmox_guest_disk_resize` 🔒
Resize guest storage for VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_disk_move` 🔒
Move guest storage for VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_guest_network` 🔒
Manage guest network interfaces. action=add|update|remove with type=vm|lxc (requires elevated permissions)

| Action | Permission | Description |
|--------|------------|-------------|
| `add` | Elevated 🔒 | Add network interface |
| `update` | Elevated 🔒 | Update network interface |
| `remove` | Elevated 🔒 | Remove network interface |

---

#### `proxmox_node_disk`
Query node disk information. action=list|smart|lvm|zfs|lvmthin|directory

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List node disks |
| `smart` | Basic | Get SMART data |
| `lvm` | Basic | List LVM volumes |
| `zfs` | Basic | List ZFS pools |
| `lvmthin` | Basic | List LVM-thin pools |
| `directory` | Basic | List directory storage |

---

#### `proxmox_node_disk_admin` 🔒
Destructive disk operations. action=init_gpt: initialize GPT | action=wipe: wipe disk (all elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `init_gpt` | Elevated 🔒 | Initialize GPT on disk |
| `wipe` | Elevated 🔒 | Wipe disk |

---

### Console Access (3 tools)

#### `proxmox_console_vnc` 🔒
Get a VNC proxy ticket for a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_console_term` 🔒
Get a terminal proxy ticket for a VM (type=vm) or LXC container (type=lxc) (requires elevated permissions)

---

#### `proxmox_console_spice` 🔒
Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)

---

### Cloud-Init, Certificates & ACME (5 tools)

#### `proxmox_cloudinit`
Manage cloud-init for a QEMU VM. action=get: list config | action=dump: dump rendered config (dump_type=user|network|meta) | action=regenerate: regenerate drive (requires elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `get` | Basic | List cloud-init config |
| `dump` | Basic | Dump rendered config |
| `regenerate` | Elevated 🔒 | Regenerate cloud-init drive |

---

#### `proxmox_certificate`
Manage node SSL certificates. action=list: view certs | action=upload: upload custom cert (requires elevated) | action=delete: remove custom cert (requires elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | View certificates |
| `upload` | Elevated 🔒 | Upload custom certificate |
| `delete` | Elevated 🔒 | Remove custom certificate |

---

#### `proxmox_acme_cert`
Manage ACME certificates. action=order|renew|revoke: certificate ops (requires elevated) | action=config: get ACME config

| Action | Permission | Description |
|--------|------------|-------------|
| `config` | Basic | Get ACME config |
| `order` | Elevated 🔒 | Order ACME certificate |
| `renew` | Elevated 🔒 | Renew ACME certificate |
| `revoke` | Elevated 🔒 | Revoke ACME certificate |

---

#### `proxmox_acme_account`
Manage ACME accounts. action=list|get: query accounts | action=create|update|delete: manage accounts (requires elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List ACME accounts |
| `get` | Basic | Get account details |
| `create` | Elevated 🔒 | Create ACME account |
| `update` | Elevated 🔒 | Update ACME account |
| `delete` | Elevated 🔒 | Delete ACME account |

---

#### `proxmox_acme_info`
Query ACME information. action=list_plugins|get_plugin|directories

| Action | Permission | Description |
|--------|------------|-------------|
| `list_plugins` | Basic | List ACME plugins |
| `get_plugin` | Basic | Get plugin details |
| `directories` | Basic | List ACME directories |

---

### Notifications (1 tool)

#### `proxmox_notification`
Manage notification targets. action=list|get: query targets | action=create|delete|test: manage targets (requires elevated)

| Action | Permission | Description |
|--------|------------|-------------|
| `list` | Basic | List notification targets |
| `get` | Basic | Get target details |
| `create` | Elevated 🔒 | Create notification target |
| `delete` | Elevated 🔒 | Delete notification target |
| `test` | Elevated 🔒 | Test notification target |

---

**Legend**: 🔒 = Requires elevated permissions (`PROXMOX_ALLOW_ELEVATED=true`)
