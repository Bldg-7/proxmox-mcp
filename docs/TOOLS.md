# Proxmox MCP Tools Reference

> Complete reference for all available tools and planned Proxmox API integrations

**Current Version**: 0.1.5  
**Total Tools**: 105  
**Last Updated**: 2026-02-05

---

## Table of Contents

- [Overview](#overview)
- [Permission Model](#permission-model)
- [Implemented Tools](#implemented-tools)
  - [Node & Cluster (7 tools)](#node--cluster-7-tools)
  - [Node Management (8 tools)](#node-management-8-tools)
  - [Cluster Management (33 tools)](#cluster-management-33-tools)
  - [VM Query (5 tools)](#vm-query-5-tools)
  - [VM Lifecycle (12 tools)](#vm-lifecycle-12-tools)
  - [VM Modify (4 tools)](#vm-modify-4-tools)
  - [Snapshots (8 tools)](#snapshots-8-tools)
  - [Backups (6 tools)](#backups-6-tools)
  - [Disks (8 tools)](#disks-8-tools)
  - [VM/LXC Network (6 tools)](#vmlxc-network-6-tools)
  - [Command Execution (1 tool)](#command-execution-1-tool)
  - [VM Creation (3 tools)](#vm-creation-3-tools)
  - [Node Disk Query (4 tools)](#node-disk-query-4-tools)
- [Unimplemented Proxmox APIs](#unimplemented-proxmox-apis)
  - [High Priority](#high-priority)
  - [Medium Priority](#medium-priority)
  - [Low Priority](#low-priority)

---

## Overview

This document provides a complete reference for all tools available in the Proxmox MCP server, organized by functional category. It also documents Proxmox VE API endpoints that are not yet implemented, categorized by priority.

### Tool Distribution

| Category | Count | Permission |
|----------|-------|------------|
| Node & Cluster | 7 | Mixed |
| Node Management | 8 | Mixed |
| Cluster Management | 33 | Mixed |
| VM Query | 5 | Basic |
| VM Lifecycle | 12 | Elevated |
| VM Modify | 4 | Elevated |
| Snapshots | 8 | Mixed |
| Backups | 6 | Elevated |
| Disks | 8 | Elevated |
| VM/LXC Network | 6 | Elevated |
| Command Execution | 1 | Elevated |
| VM Creation | 3 | Mixed |
| Node Disk Query | 4 | Basic |
| **Total** | **105** | |

---

## Permission Model

Tools are classified into two permission levels:

| Level | Symbol | Description | Environment Variable |
|-------|--------|-------------|---------------------|
| **Basic** | - | Read-only operations, always allowed | (none required) |
| **Elevated** | 🔒 | Create/modify/delete operations | `PROXMOX_ALLOW_ELEVATED=true` |

---

## Implemented Tools

### Node & Cluster (7 tools)

#### `proxmox_get_nodes`
List all Proxmox cluster nodes with their status and resources.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes` |
| Parameters | None |

**Example**:
```json
{}
```

**Returns**: Array of nodes with `node`, `status`, `cpu`, `maxcpu`, `mem`, `maxmem`, `disk`, `maxdisk`, `uptime`.

---

#### `proxmox_get_node_status` 🔒
Get detailed status information for a specific Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `GET /api2/json/nodes/{node}/status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_network`
List network interfaces on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/network` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `type` | string | No | Filter: `bridge`, `bond`, `eth`, `alias`, `vlan`, `OVSBridge`, `OVSBond`, `OVSPort`, `OVSIntPort`, `any_bridge`, `any_local_bridge` |

**Example**:
```json
{
  "node": "pve1",
  "type": "bridge"
}
```

---

#### `proxmox_get_node_dns`
Get DNS configuration for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/dns` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

**Returns**: `dns1`, `dns2`, `dns3`, `search` (search domain).

---

#### `proxmox_get_network_iface`
Get detailed configuration for a specific network interface.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/network/{iface}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name (e.g., `vmbr0`, `eth0`) |

**Example**:
```json
{
  "node": "pve1",
  "iface": "vmbr0"
}
```

---

#### `proxmox_get_cluster_status`
Get overall cluster status including nodes and resource usage.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/status` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_next_vmid`
Get the next available VM/Container ID number.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/nextid` |
| Parameters | None |

**Example**:
```json
{}
```

**Returns**: Next available VMID as integer.

---

### Node Management (8 tools)

#### `proxmox_get_node_services`
List system services on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/services` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

**Returns**: Service list including `name`, `state`, `enabled`, and description fields.

---

#### `proxmox_control_node_service` 🔒
Start, stop, or restart a service on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/services/{service}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `service` | string | Yes | Service name (e.g., `pveproxy`, `ssh`, `pvedaemon`) |
| `command` | string | Yes | `start`, `stop`, or `restart` |

**Example**:
```json
{
  "node": "pve1",
  "service": "pveproxy",
  "command": "restart"
}
```

---

#### `proxmox_get_node_syslog`
Read syslog entries on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/syslog` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_journal`
Read systemd journal entries on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/journal` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_tasks`
List recent tasks for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/tasks` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_task`
Get status details for a specific node task.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/tasks/{upid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `upid` | string | Yes | Task UPID |

**Example**:
```json
{
  "node": "pve1",
  "upid": "UPID:pve1:0002E0B4:0000001D:64A539CB:qmstart:100:root@pam:"
}
```

---

#### `proxmox_get_node_aplinfo`
List available appliance templates on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/aplinfo` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_netstat`
Get network connection statistics for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/netstat` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Example**:
```json
{
  "node": "pve1"
}
```

---

### Cluster Management (33 tools)

#### `proxmox_get_ha_resources`
List High Availability resources in the cluster.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/resources` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | Filter: `vm`, `ct` |

**Example**:
```json
{
  "type": "vm"
}
```

---

#### `proxmox_get_ha_resource`
Get a specific HA resource by ID.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., `vm:100`) |

**Example**:
```json
{
  "sid": "vm:100"
}
```

---

#### `proxmox_create_ha_resource` 🔒
Create a new HA resource.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/ha/resources` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., `vm:100`) |
| `type` | string | No | Resource type (`vm`, `ct`) |
| `group` | string | No | HA group identifier |
| `state` | string | No | `started`, `stopped`, `enabled`, `disabled`, `ignored` |
| `comment` | string | No | Description |

**Example**:
```json
{
  "sid": "vm:100",
  "type": "vm",
  "group": "prod",
  "state": "started"
}
```

---

#### `proxmox_update_ha_resource` 🔒
Update an HA resource.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |
| `state` | string | No | `started`, `stopped`, `enabled`, `disabled`, `ignored` |
| `group` | string | No | HA group identifier |
| `comment` | string | No | Description |
| `delete` | string | No | List of settings to delete |

**Example**:
```json
{
  "sid": "vm:100",
  "state": "enabled"
}
```

---

#### `proxmox_delete_ha_resource` 🔒
Delete an HA resource.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |

**Example**:
```json
{
  "sid": "vm:100"
}
```

---

#### `proxmox_get_ha_groups`
List HA groups.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/groups` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_ha_group`
Get HA group details.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

**Example**:
```json
{
  "group": "prod"
}
```

---

#### `proxmox_create_ha_group` 🔒
Create a new HA group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/ha/groups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `nodes` | string | Yes | Node list with priorities (e.g., `pve1:1,pve2:2`) |
| `comment` | string | No | Description |
| `restricted` | boolean | No | Restrict to listed nodes |
| `nofailback` | boolean | No | Prevent failback |

**Example**:
```json
{
  "group": "prod",
  "nodes": "pve1:1,pve2:2",
  "restricted": true
}
```

---

#### `proxmox_update_ha_group` 🔒
Update an HA group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `nodes` | string | No | Node list with priorities |
| `comment` | string | No | Description |
| `restricted` | boolean | No | Restrict to listed nodes |
| `nofailback` | boolean | No | Prevent failback |
| `delete` | string | No | List of settings to delete |

**Example**:
```json
{
  "group": "prod",
  "nodes": "pve1:1,pve3:2"
}
```

---

#### `proxmox_delete_ha_group` 🔒
Delete an HA group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

**Example**:
```json
{
  "group": "prod"
}
```

---

#### `proxmox_get_ha_status`
Get HA manager status.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/status` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_list_cluster_firewall_rules`
List cluster-wide firewall rules.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/rules` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_firewall_rule`
Get a cluster firewall rule by position.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |

**Example**:
```json
{
  "pos": 0
}
```

---

#### `proxmox_create_cluster_firewall_rule` 🔒
Create a cluster firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/rules` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `ACCEPT`, `REJECT`, `DROP` |
| `type` | string | Yes | `in`, `out`, `group` |
| `proto` | string | No | Protocol (e.g., `tcp`) |
| `dport` | string | No | Destination port(s) |
| `source` | string | No | Source CIDR |
| `dest` | string | No | Destination CIDR |

**Example**:
```json
{
  "action": "ACCEPT",
  "type": "in",
  "proto": "tcp",
  "dport": "22"
}
```

---

#### `proxmox_update_cluster_firewall_rule` 🔒
Update a cluster firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |
| `action` | string | No | Rule action |
| `type` | string | No | `in`, `out`, `group` |
| `comment` | string | No | Description |
| `delete` | string | No | List of settings to delete |

**Example**:
```json
{
  "pos": 0,
  "comment": "Allow SSH"
}
```

---

#### `proxmox_delete_cluster_firewall_rule` 🔒
Delete a cluster firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |
| `digest` | string | No | Config digest |

**Example**:
```json
{
  "pos": 0
}
```

---

#### `proxmox_list_cluster_firewall_groups`
List cluster firewall groups.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/groups` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_firewall_group`
Get a cluster firewall group by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

**Example**:
```json
{
  "group": "web-servers"
}
```

---

#### `proxmox_create_cluster_firewall_group` 🔒
Create a cluster firewall group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/groups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | string | No | Description |
| `rename` | string | No | Rename group to new name |

**Example**:
```json
{
  "group": "web-servers",
  "comment": "Web tier rules"
}
```

---

#### `proxmox_update_cluster_firewall_group` 🔒
Update a cluster firewall group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | string | No | Description |
| `rename` | string | No | Rename group to new name |
| `delete` | string | No | List of settings to delete |
| `digest` | string | No | Config digest |

**Example**:
```json
{
  "group": "web-servers",
  "comment": "Updated description"
}
```

---

#### `proxmox_delete_cluster_firewall_group` 🔒
Delete a cluster firewall group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

**Example**:
```json
{
  "group": "web-servers"
}
```

---

#### `proxmox_list_cluster_backup_jobs`
List cluster backup jobs.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/backup` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_backup_job`
Get a cluster backup job by ID.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

**Example**:
```json
{
  "id": "daily-backup"
}
```

---

#### `proxmox_create_cluster_backup_job` 🔒
Create a cluster backup job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/backup` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `starttime` | string | Yes | Start time (`HH:MM`) |
| `dow` | string | Yes | Days of week (e.g., `mon,tue`) |
| `storage` | string | Yes | Storage identifier |
| `all` | boolean | No | Backup all VMs |
| `compress` | string | No | `gzip`, `lzo`, `zstd` |
| `mode` | string | No | `snapshot`, `suspend`, `stop` |

**Example**:
```json
{
  "starttime": "02:00",
  "dow": "mon,tue,wed,thu,fri",
  "storage": "backup-nfs",
  "mode": "snapshot"
}
```

---

#### `proxmox_update_cluster_backup_job` 🔒
Update a cluster backup job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |
| `starttime` | string | No | Start time (`HH:MM`) |
| `dow` | string | No | Days of week |
| `storage` | string | No | Storage identifier |
| `enabled` | boolean | No | Enable/disable job |
| `delete` | string | No | List of settings to delete |

**Example**:
```json
{
  "id": "daily-backup",
  "enabled": false
}
```

---

#### `proxmox_delete_cluster_backup_job` 🔒
Delete a cluster backup job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

**Example**:
```json
{
  "id": "daily-backup"
}
```

---

#### `proxmox_list_cluster_replication_jobs`
List cluster replication jobs.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/replication` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_replication_job`
Get a cluster replication job by ID.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID (`<guest>-<jobnum>`) |

**Example**:
```json
{
  "id": "101-0"
}
```

---

#### `proxmox_create_cluster_replication_job` 🔒
Create a cluster replication job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/replication` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID (`<guest>-<jobnum>`) |
| `target` | string | Yes | Target node name |
| `type` | string | Yes | Replication type (`local`) |
| `schedule` | string | No | Replication schedule |

**Example**:
```json
{
  "id": "101-0",
  "target": "pve2",
  "type": "local",
  "schedule": "*/15"
}
```

---

#### `proxmox_update_cluster_replication_job` 🔒
Update a cluster replication job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `disable` | boolean | No | Disable replication |
| `schedule` | string | No | Replication schedule |
| `delete` | string | No | List of settings to delete |

**Example**:
```json
{
  "id": "101-0",
  "disable": true
}
```

---

#### `proxmox_delete_cluster_replication_job` 🔒
Delete a cluster replication job.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `force` | boolean | No | Force deletion |
| `keep` | boolean | No | Keep replicated data |

**Example**:
```json
{
  "id": "101-0",
  "keep": true
}
```

---

#### `proxmox_get_cluster_options`
Get cluster-wide options.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/options` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_update_cluster_options` 🔒
Update cluster-wide options.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/options` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `console` | string | No | Console type (e.g., `xtermjs`) |
| `language` | string | No | UI language |
| `keyboard` | string | No | Keyboard layout |

**Example**:
```json
{
  "console": "xtermjs",
  "language": "en"
}
```

---

### VM Query (5 tools)

#### `proxmox_get_vms`
List all virtual machines across the cluster with their status.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/resources?type=vm` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | No | Filter by specific node |
| `type` | string | No | Filter: `qemu` or `lxc` |

**Example**:
```json
{
  "node": "pve1",
  "type": "qemu"
}
```

---

#### `proxmox_get_vm_status`
Get detailed status information for a specific VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/{type}/{vmid}/status/current` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM/Container ID |
| `type` | string | Yes | `qemu` or `lxc` |

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "type": "qemu"
}
```

---

#### `proxmox_get_vm_config`
Get hardware configuration for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101
}
```

**Returns**: CPU, memory, disks, network interfaces, boot order, and other VM settings.

---

#### `proxmox_get_lxc_config`
Get hardware configuration for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100
}
```

**Returns**: CPU, memory, mount points, network interfaces, and other container settings.

---

#### `proxmox_get_storage`
List all storage pools and their usage across the cluster.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/storage` or `GET /api2/json/nodes/{node}/storage` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | No | Filter by specific node |

**Example**:
```json
{
  "node": "pve1"
}
```

---

### VM Lifecycle (12 tools)

All lifecycle tools require **elevated permissions** (`PROXMOX_ALLOW_ELEVATED=true`).

#### `proxmox_start_lxc` 🔒
Start an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/start` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

---

#### `proxmox_start_vm` 🔒
Start a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/start` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_stop_lxc` 🔒
Stop an LXC container (forceful).

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/stop` |

**Parameters**: Same as `proxmox_start_lxc`

---

#### `proxmox_stop_vm` 🔒
Stop a QEMU virtual machine (forceful).

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/stop` |

**Parameters**: Same as `proxmox_start_vm`

---

#### `proxmox_shutdown_lxc` 🔒
Gracefully shutdown an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/shutdown` |

**Parameters**: Same as `proxmox_start_lxc`

---

#### `proxmox_shutdown_vm` 🔒
Gracefully shutdown a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/shutdown` |

**Parameters**: Same as `proxmox_start_vm`

---

#### `proxmox_reboot_lxc` 🔒
Reboot an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/reboot` |

**Parameters**: Same as `proxmox_start_lxc`

---

#### `proxmox_reboot_vm` 🔒
Reboot a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/reboot` |

**Parameters**: Same as `proxmox_start_vm`

---

#### `proxmox_pause_vm` 🔒
Pause a QEMU virtual machine (suspend to RAM).

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/suspend` |

**Parameters**: Same as `proxmox_start_vm`

---

#### `proxmox_resume_vm` 🔒
Resume a paused QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/resume` |

**Parameters**: Same as `proxmox_start_vm`

---

#### `proxmox_delete_lxc` 🔒
Delete an LXC container permanently.

| Property | Value |
|----------|-------|
| API Endpoint | `DELETE /api2/json/nodes/{node}/lxc/{vmid}` |

**Parameters**: Same as `proxmox_start_lxc`

---

#### `proxmox_delete_vm` 🔒
Delete a QEMU virtual machine permanently.

| Property | Value |
|----------|-------|
| API Endpoint | `DELETE /api2/json/nodes/{node}/qemu/{vmid}` |

**Parameters**: Same as `proxmox_start_vm`

---

### VM Modify (4 tools)

All modify tools require **elevated permissions**.

#### `proxmox_clone_lxc` 🔒
Clone an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/clone` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Source container ID |
| `newid` | number | Yes | New container ID |
| `hostname` | string | No | New hostname |

---

#### `proxmox_clone_vm` 🔒
Clone a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/clone` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Source VM ID |
| `newid` | number | Yes | New VM ID |
| `name` | string | No | New VM name |

---

#### `proxmox_resize_lxc` 🔒
Resize an LXC container CPU/memory.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `memory` | number | No | Memory in MB |
| `cores` | number | No | Number of CPU cores |

---

#### `proxmox_resize_vm` 🔒
Resize a QEMU VM CPU/memory.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `memory` | number | No | Memory in MB |
| `cores` | number | No | Number of CPU cores |

---

### Snapshots (8 tools)

#### `proxmox_create_snapshot_lxc` 🔒
Create a snapshot of an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/snapshot` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `snapname` | string | Yes | Snapshot name |
| `description` | string | No | Snapshot description |

---

#### `proxmox_create_snapshot_vm` 🔒
Create a snapshot of a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/snapshot` |

**Parameters**: Same as `proxmox_create_snapshot_lxc`

---

#### `proxmox_list_snapshots_lxc`
List all snapshots of an LXC container.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/snapshot` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

---

#### `proxmox_list_snapshots_vm`
List all snapshots of a QEMU virtual machine.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/snapshot` |

**Parameters**: Same as `proxmox_list_snapshots_lxc` (with VM ID)

---

#### `proxmox_rollback_snapshot_lxc` 🔒
Rollback an LXC container to a snapshot.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/snapshot/{snapname}/rollback` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `snapname` | string | Yes | Snapshot name |

---

#### `proxmox_rollback_snapshot_vm` 🔒
Rollback a QEMU virtual machine to a snapshot.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/snapshot/{snapname}/rollback` |

**Parameters**: Same as `proxmox_rollback_snapshot_lxc`

---

#### `proxmox_delete_snapshot_lxc` 🔒
Delete a snapshot of an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `DELETE /api2/json/nodes/{node}/lxc/{vmid}/snapshot/{snapname}` |

**Parameters**: Same as `proxmox_rollback_snapshot_lxc`

---

#### `proxmox_delete_snapshot_vm` 🔒
Delete a snapshot of a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `DELETE /api2/json/nodes/{node}/qemu/{vmid}/snapshot/{snapname}` |

**Parameters**: Same as `proxmox_rollback_snapshot_vm`

---

### Backups (6 tools)

All backup tools require **elevated permissions**.

#### `proxmox_create_backup_lxc` 🔒
Create a backup of an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/vzdump` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `storage` | string | No | Storage name (default: `local`) |
| `mode` | string | No | `snapshot`, `suspend`, `stop` (default: `snapshot`) |
| `compress` | string | No | `none`, `lzo`, `gzip`, `zstd` (default: `zstd`) |

---

#### `proxmox_create_backup_vm` 🔒
Create a backup of a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/vzdump` |

**Parameters**: Same as `proxmox_create_backup_lxc`

---

#### `proxmox_list_backups` 🔒
List all backups on a storage.

| Property | Value |
|----------|-------|
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name |

---

#### `proxmox_restore_backup_lxc` 🔒
Restore an LXC container from backup.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | New container ID |
| `archive` | string | Yes | Backup archive path |
| `storage` | string | No | Target storage |

---

#### `proxmox_restore_backup_vm` 🔒
Restore a QEMU virtual machine from backup.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu` |

**Parameters**: Same as `proxmox_restore_backup_lxc`

---

#### `proxmox_delete_backup` 🔒
Delete a backup file from storage.

| Property | Value |
|----------|-------|
| API Endpoint | `DELETE /api2/json/nodes/{node}/storage/{storage}/content/{volume}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name |
| `volume` | string | Yes | Volume ID |

---

### Disks (8 tools)

All disk tools require **elevated permissions**.

#### `proxmox_add_disk_vm` 🔒
Add a new disk to a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `disk` | string | Yes | Disk ID (`scsi0`, `virtio0`, `sata0`, `ide0`) |
| `storage` | string | Yes | Storage name |
| `size` | string | Yes | Disk size (e.g., `10` for 10GB) |

---

#### `proxmox_add_mountpoint_lxc` 🔒
Add a mount point to an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `mp` | string | Yes | Mount point ID (`mp0`, `mp1`) |
| `storage` | string | Yes | Storage name |
| `size` | string | Yes | Size (e.g., `10` for 10GB) |

---

#### `proxmox_resize_disk_vm` 🔒
Resize a QEMU VM disk (expansion only).

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/resize` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `disk` | string | Yes | Disk ID |
| `size` | string | Yes | New size (`+10G` or `50G`) |

---

#### `proxmox_resize_disk_lxc` 🔒
Resize an LXC container disk or mount point.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/resize` |

**Parameters**: Same as `proxmox_resize_disk_vm`

---

#### `proxmox_remove_disk_vm` 🔒
Remove a disk from a QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `disk` | string | Yes | Disk ID |

---

#### `proxmox_remove_mountpoint_lxc` 🔒
Remove a mount point from an LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**: Same as `proxmox_remove_disk_vm` (with `mp` instead of `disk`)

---

#### `proxmox_move_disk_vm` 🔒
Move a QEMU VM disk to different storage.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/move_disk` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `disk` | string | Yes | Disk ID |
| `storage` | string | Yes | Target storage |
| `delete` | boolean | No | Delete source after move (default: `true`) |

---

#### `proxmox_move_disk_lxc` 🔒
Move an LXC container disk to different storage.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/move_volume` |

**Parameters**: Same as `proxmox_move_disk_vm`

---

### VM/LXC Network (6 tools)

All network tools require **elevated permissions**.

#### `proxmox_add_network_vm` 🔒
Add network interface to QEMU VM.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `net` | string | Yes | Network interface ID (`net0`, `net1`) |
| `bridge` | string | Yes | Bridge name (`vmbr0`) |
| `model` | string | No | `virtio`, `e1000`, `rtl8139`, `vmxnet3` |
| `macaddr` | string | No | MAC address |
| `tag` | number | No | VLAN tag |
| `firewall` | boolean | No | Enable firewall |

---

#### `proxmox_add_network_lxc` 🔒
Add network interface to LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `net` | string | Yes | Network interface ID |
| `bridge` | string | Yes | Bridge name |
| `ip` | string | No | IP address with CIDR or `dhcp` |
| `gw` | string | No | Gateway IP |
| `firewall` | boolean | No | Enable firewall |

---

#### `proxmox_update_network_vm` 🔒
Update VM network interface configuration.

**Parameters**: Same as `proxmox_add_network_vm`

---

#### `proxmox_update_network_lxc` 🔒
Update LXC network interface configuration.

**Parameters**: Same as `proxmox_add_network_lxc`

---

#### `proxmox_remove_network_vm` 🔒
Remove network interface from QEMU VM.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `net` | string | Yes | Network interface ID |

---

#### `proxmox_remove_network_lxc` 🔒
Remove network interface from LXC container.

**Parameters**: Same as `proxmox_remove_network_vm`

---

### Command Execution (1 tool)

#### `proxmox_execute_vm_command` 🔒
Execute a shell command on a virtual machine via Proxmox API.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/{type}/{vmid}/agent/exec` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM/Container ID |
| `type` | string | Yes | `qemu` or `lxc` |
| `command` | string | Yes | Shell command to execute |

**Note**: Requires QEMU Guest Agent or LXC exec capability. Command validation blocks potentially dangerous characters.

---

### VM Creation (3 tools)

#### `proxmox_list_templates`
List available LXC container templates on a storage.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name |

---

#### `proxmox_create_lxc` 🔒
Create a new LXC container.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/lxc` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `ostemplate` | string | Yes | Template path |
| `hostname` | string | Yes | Container hostname |
| `password` | string | No | Root password (auto-generated if not provided) |
| `memory` | number | No | Memory in MB (default: 512) |
| `storage` | string | No | Storage name (default: `local-lvm`) |
| `rootfs_size` | string | No | Root filesystem size in GB (default: `8`) |

---

#### `proxmox_create_vm` 🔒
Create a new QEMU virtual machine.

| Property | Value |
|----------|-------|
| API Endpoint | `POST /api2/json/nodes/{node}/qemu` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `name` | string | Yes | VM name |
| `memory` | number | No | Memory in MB (default: 512) |
| `cores` | number | No | CPU cores (default: 1) |
| `sockets` | number | No | CPU sockets (default: 1) |
| `disk_size` | string | No | Disk size (default: `8G`) |
| `storage` | string | No | Storage name (default: `local-lvm`) |
| `iso` | string | No | ISO image path |
| `ostype` | string | No | OS type (default: `l26`) |
| `bridge` | string | No | Network bridge (default: `vmbr0`) |

---

### Node Disk Query (4 tools)

#### `proxmox_get_node_disks`
List physical disks on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/list` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `type` | string | No | Filter: `unused`, `journal_disks` |

**Returns**: List of physical disks with device path, size, model, serial, and usage status.

---

#### `proxmox_get_disk_smart`
Get SMART health data for a specific disk.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/smart` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Disk device path (e.g., `/dev/sda`) |

**Returns**: SMART health status, attributes, and disk diagnostics.

---

#### `proxmox_get_node_lvm`
List LVM volume groups and logical volumes on a node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/lvm` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Returns**: Volume groups with their logical volumes, sizes, and free space.

---

#### `proxmox_get_node_zfs`
List ZFS pools on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/zfs` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Returns**: ZFS pools with health status, size, allocated/free space, and fragmentation.

---

## Unimplemented Proxmox APIs

This section lists Proxmox VE API endpoints that are not yet implemented in this MCP server, organized by priority.

### High Priority

APIs that would significantly enhance functionality:

#### VM/LXC Advanced

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/qemu/{vmid}/migrate` | POST | Migrate VM to another node |
| `/nodes/{node}/lxc/{vmid}/migrate` | POST | Migrate container to another node |
| `/nodes/{node}/qemu/{vmid}/template` | POST | Convert VM to template |
| `/nodes/{node}/lxc/{vmid}/template` | POST | Convert container to template |
| `/nodes/{node}/qemu/{vmid}/agent/*` | Various | QEMU Guest Agent commands |
| `/nodes/{node}/qemu/{vmid}/firewall/*` | Various | Per-VM firewall rules |
| `/nodes/{node}/lxc/{vmid}/firewall/*` | Various | Per-container firewall rules |
| `/nodes/{node}/qemu/{vmid}/rrddata` | GET | VM performance metrics (RRD) |
| `/nodes/{node}/lxc/{vmid}/rrddata` | GET | Container performance metrics |

---

### Medium Priority

APIs for specialized use cases:

#### Storage Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/storage` | POST/PUT/DELETE | Storage configuration CRUD |
| `/nodes/{node}/storage/{storage}/upload` | POST | Upload ISO/template files |
| `/nodes/{node}/storage/{storage}/download-url` | POST | Download from URL |
| `/nodes/{node}/storage/{storage}/file-restore` | GET/POST | File-level backup restore |
| `/nodes/{node}/storage/{storage}/prunebackups` | DELETE | Prune old backups |

#### Access Control

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/access/users` | GET/POST/PUT/DELETE | User management |
| `/access/groups` | GET/POST/PUT/DELETE | Group management |
| `/access/roles` | GET/POST/PUT/DELETE | Role management |
| `/access/acl` | GET/PUT | ACL management |
| `/access/domains` | GET/POST/PUT/DELETE | Authentication domains |
| `/access/tfa` | GET/POST/PUT/DELETE | Two-factor authentication |
| `/access/password` | PUT | Change password |

#### Pool Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pools` | GET/POST | List/create resource pools |
| `/pools/{poolid}` | GET/PUT/DELETE | Pool management |

#### Ceph Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/ceph/status` | GET | Ceph cluster status |
| `/nodes/{node}/ceph/osd` | GET/POST/DELETE | OSD management |
| `/nodes/{node}/ceph/mon` | GET/POST/DELETE | Monitor management |
| `/nodes/{node}/ceph/mds` | GET/POST/DELETE | MDS management |
| `/nodes/{node}/ceph/pools` | GET/POST/PUT/DELETE | Ceph pool management |
| `/nodes/{node}/ceph/fs` | GET/POST | CephFS management |

---

### Low Priority

APIs for edge cases or advanced administration:

#### Node Hardware

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/hardware/pci` | GET | List PCI devices |
| `/nodes/{node}/hardware/usb` | GET | List USB devices |
| `/nodes/{node}/capabilities/qemu/cpu` | GET | List available CPU types |
| `/nodes/{node}/capabilities/qemu/machines` | GET | List machine types |

#### Certificates & SSL

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/certificates/info` | GET | Certificate info |
| `/nodes/{node}/certificates/custom` | POST/DELETE | Custom certificates |
| `/nodes/{node}/certificates/acme/*` | Various | ACME/Let's Encrypt |

#### Disk Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/disks/initgpt` | POST | Initialize disk with GPT |
| `/nodes/{node}/disks/wipedisk` | PUT | Wipe disk |
| `/nodes/{node}/disks/lvmthin` | GET/POST/DELETE | LVM thin pools |
| `/nodes/{node}/disks/directory` | GET/POST/DELETE | Directory storage |

#### Node Network Configuration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/network` | POST | Create network interface |
| `/nodes/{node}/network/{iface}` | PUT/DELETE | Update/delete interface |
| `/nodes/{node}/network` | PUT | Apply network changes (revert pending) |

#### System Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/time` | GET/PUT | Node time/timezone |
| `/nodes/{node}/dns` | PUT | Update DNS configuration |
| `/nodes/{node}/hosts` | GET/POST | Hosts file management |
| `/nodes/{node}/subscription` | GET/POST/DELETE | Subscription management |
| `/nodes/{node}/apt/*` | Various | Package management |
| `/nodes/{node}/startall` | POST | Start all VMs/containers |
| `/nodes/{node}/stopall` | POST | Stop all VMs/containers |
| `/nodes/{node}/migrateall` | POST | Migrate all to another node |

#### Console Access

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/qemu/{vmid}/vncproxy` | POST | Get VNC ticket |
| `/nodes/{node}/qemu/{vmid}/spiceproxy` | POST | Get SPICE ticket |
| `/nodes/{node}/qemu/{vmid}/termproxy` | POST | Get terminal proxy ticket |
| `/nodes/{node}/lxc/{vmid}/vncproxy` | POST | Container VNC access |
| `/nodes/{node}/lxc/{vmid}/termproxy` | POST | Container terminal access |

#### SDN (Software Defined Networking)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cluster/sdn/vnets` | GET/POST/PUT/DELETE | Virtual networks |
| `/cluster/sdn/zones` | GET/POST/PUT/DELETE | SDN zones |
| `/cluster/sdn/controllers` | GET/POST/PUT/DELETE | SDN controllers |
| `/cluster/sdn/subnets` | GET/POST/PUT/DELETE | Subnets |

---

## API Reference

### Base URL
```
https://{proxmox-host}:8006/api2/json
```

### Authentication
All API requests require authentication via API token:
```
Authorization: PVEAPIToken={user}@{realm}!{tokenname}={token-value}
```

### Official Documentation
- [Proxmox VE API Viewer](https://pve.proxmox.com/pve-docs/api-viewer/)
- [Proxmox VE Administration Guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.html)

---

## Contributing

To add a new tool:

1. Add tool name to `src/types/tools.ts`
2. Create Zod schema in `src/schemas/`
3. Implement handler in `src/tools/`
4. Register in `src/tools/registry.ts`
5. Add description in `src/server.ts`
6. Write tests in `src/tools/*.test.ts`
7. Update this documentation

---

**Legend**: 🔒 = Requires elevated permissions (`PROXMOX_ALLOW_ELEVATED=true`)
