# Proxmox MCP Tools Reference

> Complete reference for all available tools and planned Proxmox API integrations

**Current Version**: 0.6.0  
**Total Tools**: 309  
**Last Updated**: 2026-02-08

---

## Table of Contents

- [Overview](#overview)
- [Permission Model](#permission-model)
- [Implemented Tools](#implemented-tools)
  - [Node & Cluster (7 tools)](#node--cluster-7-tools)
  - [Node Management (11 tools)](#node-management-11-tools)
  - [Node Network Configuration (4 tools)](#node-network-configuration-4-tools)
  - [System Operations (20 tools)](#system-operations-20-tools)
  - [Cluster Management (54 tools)](#cluster-management-54-tools)
  - [Storage Management (12 tools)](#storage-management-12-tools)
  - [VM Query (9 tools)](#vm-query-9-tools)
  - [VM Lifecycle (12 tools)](#vm-lifecycle-12-tools)
  - [VM Modify (6 tools)](#vm-modify-6-tools)
  - [VM/LXC Advanced (40 tools)](#vmlxc-advanced-40-tools)
  - [Snapshots (8 tools)](#snapshots-8-tools)
  - [Backups (6 tools)](#backups-6-tools)
  - [Disks (16 tools)](#disks-16-tools)
  - [Network (6 tools)](#network-6-tools)
  - [Command (1 tool)](#command-1-tool)
  - [Creation (3 tools)](#creation-3-tools)
  - [Cloud-Init (3 tools)](#cloud-init-3-tools)
  - [Console Access (5 tools)](#console-access-5-tools)
  - [Pool Management (5 tools)](#pool-management-5-tools)
  - [Access Control (25 tools)](#access-control-25-tools)
  - [SDN (20 tools)](#sdn-20-tools)
  - [Ceph Integration (16 tools)](#ceph-integration-16-tools)
  - [Certificate Management (7 tools)](#certificate-management-7-tools)
  - [ACME Management (8 tools)](#acme-management-8-tools)
  - [Notification Management (5 tools)](#notification-management-5-tools)
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
| Node Management | 11 | Mixed |
| Node Network Configuration | 4 | Mixed |
| System Operations | 20 | Mixed |
| Cluster Management | 54 | Mixed |
| Storage Management | 12 | Mixed |
| VM Query | 9 | Basic |
| VM Lifecycle | 12 | Elevated |
| VM Modify | 6 | Elevated |
| VM/LXC Advanced | 40 | Mixed |
| Snapshots | 8 | Mixed |
| Backups | 6 | Elevated |
| Disks | 16 | Mixed |
| Network | 6 | Elevated |
| Command | 1 | Elevated |
| Creation | 3 | Mixed |
| Cloud-Init | 3 | Mixed |
| Console Access | 5 | Mixed |
| Pool Management | 5 | Mixed |
| Access Control | 25 | Mixed |
| SDN | 20 | Mixed |
| Ceph Integration | 16 | Mixed |
| Certificate Management | 7 | Mixed |
| ACME Management | 8 | Mixed |
| Notification Management | 5 | Mixed |
| **Total** | **309** | |

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

### Node Management (11 tools)

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

#### `proxmox_get_node_rrddata`
Get node RRD performance metrics (CPU, memory, disk I/O).

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/rrddata` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `timeframe` | string | No | Timeframe: `hour`, `day`, `week`, `month`, `year` |
| `cf` | string | No | Consolidation function: `AVERAGE`, `MAX` |

**Example**:
```json
{
  "node": "pve1",
  "timeframe": "hour"
}
```

---

#### `proxmox_get_storage_rrddata`
Get storage RRD performance metrics (read/write throughput, usage).

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/rrddata` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name |
| `timeframe` | string | No | Timeframe: `hour`, `day`, `week`, `month`, `year` |
| `cf` | string | No | Consolidation function: `AVERAGE`, `MAX` |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local-lvm",
  "timeframe": "day"
}
```

---

#### `proxmox_get_node_report`
Get node diagnostic report with system information.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/report` |

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

### Node Network Configuration (4 tools)

#### `proxmox_create_network_iface` 🔒
Create a network interface on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/network` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name |
| `type` | string | Yes | Interface type (`bridge`, `bond`, `eth`, `alias`, `vlan`, `OVSBridge`, `OVSBond`, `OVSPort`, `OVSIntPort`) |
| `address` | string | No | IPv4 address |
| `netmask` | string | No | Network mask |
| `gateway` | string | No | Default gateway |
| `bridge_ports` | string | No | Bridge ports |
| `autostart` | boolean | No | Start at boot |

---

#### `proxmox_update_network_iface` 🔒
Update a network interface on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/network/{iface}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name |
| `type` | string | Yes | Interface type |
| `address` | string | No | IPv4 address |
| `netmask` | string | No | Network mask |
| `gateway` | string | No | Default gateway |
| `delete` | string | No | Settings to delete |

---

#### `proxmox_delete_network_iface` 🔒
Delete a network interface on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/network/{iface}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name |

---

#### `proxmox_apply_network_config` 🔒
Apply or revert pending network changes on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/network` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

### System Operations (20 tools)

#### `proxmox_get_node_time`
Get node time and timezone information.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/time` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_update_node_time` 🔒
Update node time or timezone.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/time` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `timezone` | string | Yes | Timezone (e.g., `UTC`, `America/New_York`) |

---

#### `proxmox_update_node_dns` 🔒
Update DNS configuration on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/dns` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `search` | string | Yes | Search domain |
| `dns1` | string | No | Primary DNS server |
| `dns2` | string | No | Secondary DNS server |
| `dns3` | string | No | Tertiary DNS server |

---

#### `proxmox_get_node_hosts`
Get hosts file entries for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/hosts` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_update_node_hosts` 🔒
Add/update a hosts entry on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/hosts` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `data` | string | Yes | Hosts file content |
| `digest` | string | No | Config digest |

---

#### `proxmox_get_node_subscription`
Get subscription information for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/subscription` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_set_node_subscription` 🔒
Set subscription information for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/subscription` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `key` | string | Yes | Subscription key |

---

#### `proxmox_delete_node_subscription` 🔒
Delete subscription information for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/subscription` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_apt_update` 🔒
Update APT package lists.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/apt/update` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_apt_upgrade` 🔒
Upgrade packages via APT.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/apt/upgrade` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_apt_versions`
List installed/upgradable APT package versions.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/apt/versions` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `package` | string | No | Filter by package name |

---

#### `proxmox_start_all` 🔒
Start all VMs/containers on a node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/startall` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_stop_all` 🔒
Stop all VMs/containers on a node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/stopall` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_migrate_all` 🔒
Migrate all VMs/containers to another node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/migrateall` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `target` | string | Yes | Target node name |
| `maxworkers` | number | No | Maximum parallel migrations |
| `with-local-disks` | boolean | No | Include local disks in migration |

---

#### `proxmox_node_shutdown` 🔒
Shutdown a node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_reboot` 🔒
Reboot a node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_wakeonlan` 🔒
Wake a node via Wake-on-LAN.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/wakeonlan` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_replication_status`
Get node replication job status.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/replication/{id}/status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_get_node_replication_log`
Get node replication job log.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/replication/{id}/log` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_schedule_node_replication` 🔒
Schedule immediate node replication.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/replication/{id}/schedule_now` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

### Cluster Management (54 tools)

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

#### `proxmox_get_cluster_firewall_options`
Get cluster firewall options.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/options` |
| Parameters | None |

---

#### `proxmox_update_cluster_firewall_options` 🔒
Update cluster firewall options.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/options` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `enable` | number | No | Enable firewall (0/1) |
| `policy_in` | string | No | Inbound policy (`ACCEPT`, `REJECT`, `DROP`) |
| `policy_out` | string | No | Outbound policy (`ACCEPT`, `REJECT`, `DROP`) |
| `log_ratelimit` | string | No | Log rate limit |

---

#### `proxmox_list_cluster_firewall_macros`
List available firewall macros.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/macros` |
| Parameters | None |

---

#### `proxmox_list_cluster_firewall_refs`
List firewall references (aliases/ipsets).

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/refs` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | Filter: `alias`, `ipset` |

---

#### `proxmox_list_cluster_firewall_aliases`
List cluster firewall aliases.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/aliases` |
| Parameters | None |

---

#### `proxmox_get_cluster_firewall_alias`
Get a cluster firewall alias by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/aliases/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |

---

#### `proxmox_create_cluster_firewall_alias` 🔒
Create a cluster firewall alias.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/aliases` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |
| `cidr` | string | Yes | IP address or CIDR network |
| `comment` | string | No | Description |

---

#### `proxmox_update_cluster_firewall_alias` 🔒
Update a cluster firewall alias.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/aliases/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |
| `cidr` | string | Yes | IP address or CIDR network |
| `comment` | string | No | Description |
| `rename` | string | No | New alias name |

---

#### `proxmox_delete_cluster_firewall_alias` 🔒
Delete a cluster firewall alias.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/aliases/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |

---

#### `proxmox_list_cluster_firewall_ipsets`
List cluster firewall IP sets.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/ipset` |
| Parameters | None |

---

#### `proxmox_create_cluster_firewall_ipset` 🔒
Create a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/ipset` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `comment` | string | No | Description |

---

#### `proxmox_delete_cluster_firewall_ipset` 🔒
Delete a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/ipset/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |

---

#### `proxmox_list_cluster_firewall_ipset_entries`
List entries in a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/ipset/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |

---

#### `proxmox_add_cluster_firewall_ipset_entry` 🔒
Add an entry to a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/ipset/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |
| `comment` | string | No | Description |
| `nomatch` | boolean | No | Invert match (exclude this entry) |

---

#### `proxmox_update_cluster_firewall_ipset_entry` 🔒
Update an entry in a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/ipset/{name}/{cidr}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |
| `comment` | string | No | Description |
| `nomatch` | boolean | No | Invert match (exclude this entry) |

---

#### `proxmox_delete_cluster_firewall_ipset_entry` 🔒
Delete an entry from a cluster firewall IP set.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/ipset/{name}/{cidr}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |

---

#### `proxmox_get_cluster_config`
Get cluster configuration.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/config` |
| Parameters | None |

---

#### `proxmox_list_cluster_config_nodes`
List cluster configuration nodes.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/config/nodes` |
| Parameters | None |

---

#### `proxmox_get_cluster_config_node`
Get cluster configuration for a specific node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/config/nodes/{node}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_join_cluster` 🔒
Join a cluster.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/config/join` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `hostname` | string | Yes | Hostname of cluster node to join |
| `password` | string | Yes | Cluster password |
| `fingerprint` | string | No | SSL certificate fingerprint |
| `force` | boolean | No | Force join even if node exists |

---

#### `proxmox_get_cluster_totem`
Get cluster totem configuration.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/config/totem` |
| Parameters | None |

---

### Storage Management (12 tools)

#### `proxmox_list_storage_config`
List storage configurations.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/storage` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_storage_config`
Get a storage configuration by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

**Example**:
```json
{
  "storage": "backup-nfs"
}
```

---

#### `proxmox_create_storage` 🔒
Create a storage configuration.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/storage` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `type` | string | Yes | Storage type (e.g., `dir`, `nfs`, `lvmthin`) |
| `content` | string | No | Content types (comma-separated) |
| `path` | string | No | Filesystem path for dir storage |
| `server` | string | No | Remote server hostname/IP |
| `export` | string | No | NFS export path |

**Example**:
```json
{
  "storage": "backup-nfs",
  "type": "nfs",
  "server": "10.0.0.10",
  "export": "/exports/backups",
  "content": "backup"
}
```

---

#### `proxmox_update_storage` 🔒
Update a storage configuration.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `content` | string | No | Content types (comma-separated) |
| `nodes` | string | No | Restrict storage to nodes |
| `delete` | string | No | List of settings to delete |
| `digest` | string | No | Config digest |

**Example**:
```json
{
  "storage": "backup-nfs",
  "content": "backup,iso"
}
```

---

#### `proxmox_delete_storage` 🔒
Delete a storage configuration.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

**Example**:
```json
{
  "storage": "backup-nfs"
}
```

---

#### `proxmox_upload_to_storage` 🔒
Upload an ISO or template to storage.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/storage/{storage}/upload` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | string | Yes | `iso`, `vztmpl`, or `backup` |
| `filename` | string | Yes | Target filename |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "content": "iso",
  "filename": "ubuntu.iso"
}
```

---

#### `proxmox_download_url_to_storage` 🔒
Download a file from URL to storage.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/storage/{storage}/download-url` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `url` | string | Yes | Source URL |
| `content` | string | Yes | `iso`, `vztmpl`, or `backup` |
| `filename` | string | No | Target filename |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "url": "https://example.com/ubuntu.iso",
  "content": "iso",
  "filename": "ubuntu.iso"
}
```

---

#### `proxmox_list_storage_content`
List content stored on a storage.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | string | No | Filter by content type |
| `vmid` | number | No | Filter by VMID |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "content": "iso"
}
```

---

#### `proxmox_delete_storage_content` 🔒
Delete content from storage.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/storage/{storage}/content/{volume}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Volume identifier (volid) |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "volume": "local:iso/ubuntu.iso"
}
```

---

#### `proxmox_list_file_restore`
List files inside a backup archive for restore.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/file-restore/list` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `path` | string | No | Directory path inside backup |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "volume": "backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst"
}
```

---

#### `proxmox_download_file_restore`
Download a file from a backup archive.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/file-restore/download` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `filepath` | string | Yes | File path inside backup |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "volume": "backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst",
  "filepath": "/etc/hosts"
}
```

---

#### `proxmox_prune_backups` 🔒
Prune old backups on a storage.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/storage/{storage}/prunebackups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `keep-last` | number | No | Keep last N backups |
| `keep-daily` | number | No | Keep daily backups |
| `keep-weekly` | number | No | Keep weekly backups |
| `keep-monthly` | number | No | Keep monthly backups |
| `keep-yearly` | number | No | Keep yearly backups |
| `dry-run` | boolean | No | Only simulate pruning |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "keep-last": 3
}
```

---

### VM Query (9 tools)

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

#### `proxmox_get_vm_pending`
Get pending configuration changes for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/pending` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_get_lxc_pending`
Get pending configuration changes for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/pending` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

---

#### `proxmox_check_vm_feature`
Check if a feature (snapshot, clone, copy) is available for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/feature` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `feature` | string | Yes | Feature to check: `snapshot`, `clone`, `copy` |

---

#### `proxmox_check_lxc_feature`
Check if a feature (snapshot, clone, copy) is available for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/feature` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `feature` | string | Yes | Feature to check: `snapshot`, `clone`, `copy` |

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

### VM Modify (6 tools)

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

#### `proxmox_update_vm_config` 🔒
Update QEMU VM configuration with arbitrary key-value pairs.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `config` | object | No | Key-value pairs of VM configuration to set (ciuser, cipassword, ipconfig0 for cloud-init, boot, agent, serial0, vga, cpu, balloon, tags, description) |
| `delete` | string | No | Comma-separated list of config keys to REMOVE (e.g. "ciuser,cipassword") |

**Example:**
```json
{
  "node": "pve1",
  "vmid": 100,
  "config": {
    "ciuser": "ubuntu",
    "cipassword": "secret",
    "ipconfig0": "ip=192.168.1.100/24,gw=192.168.1.1"
  }
}
```

**Note:** Use `proxmox_get_vm_config` to discover valid parameters.

---

#### `proxmox_update_lxc_config` 🔒
Update LXC container configuration with arbitrary key-value pairs.

| Property | Value |
|----------|-------|
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `config` | object | No | Key-value pairs of container configuration to set (hostname, memory, swap, cores, cpulimit, cpuunits, nameserver, searchdomain, tags, description, mp0-mpN for mount points) |
| `delete` | string | No | Comma-separated list of config keys to REMOVE (e.g. "mp0,nameserver") |

**Example:**
```json
{
  "node": "pve1",
  "vmid": 200,
  "config": {
    "hostname": "mycontainer",
    "memory": 2048,
    "cores": 2
  }
}
```

**Note:** Use `proxmox_get_lxc_config` to discover valid parameters.

---

### VM/LXC Advanced (40 tools)

Advanced VM/LXC operations including migrations, templates, guest agent commands, firewall rules, and performance metrics.

#### `proxmox_migrate_vm` 🔒
Migrate a QEMU VM to another node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/migrate` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Source node name |
| `vmid` | number | Yes | VM ID |
| `target` | string | Yes | Target node name |
| `online` | boolean | No | Live migration |
| `force` | boolean | No | Force migration |
| `bwlimit` | number | No | Bandwidth limit (MB/s) |
| `with-local-disks` | boolean | No | Migrate local disks |
| `with-local-storage` | boolean | No | Migrate local storage |

---

#### `proxmox_migrate_lxc` 🔒
Migrate an LXC container to another node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/migrate` |

**Parameters**: Same as `proxmox_migrate_vm`.

---

#### `proxmox_create_template_vm` 🔒
Convert a QEMU VM to a template.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/template` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_create_template_lxc` 🔒
Convert an LXC container to a template.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/template` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_get_vm_rrddata`
Get performance metrics (RRD data) for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/rrddata` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `timeframe` | string | No | Timeframe (hour/day/week/month/year) |
| `cf` | string | No | Consolidation function (AVERAGE, MAX) |

---

#### `proxmox_get_lxc_rrddata`
Get performance metrics (RRD data) for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/rrddata` |

**Parameters**: Same as `proxmox_get_vm_rrddata`.

---

#### `proxmox_agent_ping`
Ping the QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/ping` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_osinfo`
Get guest OS information via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-osinfo` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_fsinfo`
Get guest filesystem information via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-fsinfo` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_memory_blocks`
Get guest memory block info via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-memory-blocks` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_network_interfaces`
Get guest network interfaces via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/network-get-interfaces` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_time`
Get guest time via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-time` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_timezone`
Get guest timezone via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-timezone` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_vcpus`
Get guest vCPU info via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-vcpus` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_exec` 🔒
Execute a command via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/exec` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `command` | string | Yes | Command to execute |
| `args` | string[] | No | Command arguments |
| `input-data` | string | No | stdin content |
| `capture-output` | boolean | No | Capture stdout/stderr |
| `timeout` | number | No | Timeout in seconds |

---

#### `proxmox_agent_exec_status`
Get command status via QEMU guest agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/exec-status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `pid` | number | Yes | PID from exec |

---

#### `proxmox_agent_file_read` 🔒
Read file content from guest via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/file-read` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `file` | string | Yes | Path to file in guest filesystem |

---

#### `proxmox_agent_file_write` 🔒
Write content to file in guest via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/file-write` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `file` | string | Yes | Path to file in guest filesystem |
| `content` | string | Yes | Content to write to file |
| `encode` | boolean | No | Base64 encode content (default: true) |

---

#### `proxmox_agent_get_hostname`
Get hostname from guest via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-host-name` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_users`
Get list of logged-in users from guest via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-users` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_set_user_password` 🔒
Set user password in guest via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/set-user-password` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `username` | string | Yes | Username to set password for |
| `password` | string | Yes | New password (5-1024 characters) |
| `crypted` | boolean | No | Whether password is already crypted |

---

#### `proxmox_agent_shutdown` 🔒
Shutdown guest via QEMU agent (graceful shutdown from inside guest).

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/shutdown` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_fsfreeze_status`
Get guest filesystem freeze status via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/fsfreeze-status` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_fsfreeze_freeze` 🔒
Freeze guest filesystems for consistent backup via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/fsfreeze-freeze` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_fsfreeze_thaw` 🔒
Thaw (unfreeze) guest filesystems via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/fsfreeze-thaw` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_fstrim` 🔒
Discard unused blocks on guest filesystems via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/fstrim` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_get_memory_block_info`
Get guest memory block size information via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-memory-block-info` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_suspend_disk` 🔒
Suspend guest to disk (hibernate) via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/suspend-disk` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_suspend_ram` 🔒
Suspend guest to RAM (sleep) via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/suspend-ram` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_agent_suspend_hybrid` 🔒
Hybrid suspend guest (RAM + disk) via QEMU agent.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/suspend-hybrid` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_list_vm_firewall_rules`
List per-VM firewall rules.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_get_vm_firewall_rule`
Get a VM firewall rule by position.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `pos` | number | Yes | Rule position |

---

#### `proxmox_create_vm_firewall_rule` 🔒
Create a VM firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `action` | string | Yes | `ACCEPT`, `REJECT`, `DROP` |
| `type` | string | Yes | `in`, `out`, `group` |
| `proto` | string | No | Protocol |
| `dport` | string | No | Destination port |
| `source` | string | No | Source CIDR |
| `dest` | string | No | Destination CIDR |

---

#### `proxmox_update_vm_firewall_rule` 🔒
Update a VM firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `pos` | number | Yes | Rule position |
| `comment` | string | No | Description |
| `delete` | string | No | List of settings to delete |

---

#### `proxmox_delete_vm_firewall_rule` 🔒
Delete a VM firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `pos` | number | Yes | Rule position |
| `digest` | string | No | Config digest |

---

#### `proxmox_list_lxc_firewall_rules`
List per-LXC firewall rules.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules` |

**Parameters**: Same as `proxmox_create_template_vm`.

---

#### `proxmox_get_lxc_firewall_rule`
Get an LXC firewall rule by position.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |
| `pos` | number | Yes | Rule position |

---

#### `proxmox_create_lxc_firewall_rule` 🔒
Create an LXC firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules` |

**Parameters**: Same as `proxmox_create_vm_firewall_rule` (with container ID).

---

#### `proxmox_update_lxc_firewall_rule` 🔒
Update an LXC firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**Parameters**: Same as `proxmox_update_vm_firewall_rule` (with container ID).

---

#### `proxmox_delete_lxc_firewall_rule` 🔒
Delete an LXC firewall rule.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**Parameters**: Same as `proxmox_delete_vm_firewall_rule` (with container ID).

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

### Disks (16 tools)

Disk management and query tools.

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
| `type` | string | No | VM type (default: `qemu`, QEMU only) |
| `command` | string | Yes | Shell command to execute |

**Note**: Requires QEMU Guest Agent running inside the VM. LXC containers are not supported (no exec API).

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
| `net0` | string | No | Network interface config (e.g., `name=eth0,bridge=vmbr0,ip=dhcp`) |

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

#### `proxmox_init_disk_gpt` 🔒
Initialize GPT partition table on a disk.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/disks/initgpt` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., `/dev/sdb`) |
| `uuid` | string | No | Optional UUID for the disk |

---

#### `proxmox_wipe_disk` 🔒
Wipe all data from a disk.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/disks/wipedisk` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., `/dev/sdb`) |

---

#### `proxmox_get_node_lvmthin`
List LVM thin pools on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/lvmthin` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Returns**: LVM thin pools with capacity, usage, and metadata information.

---

#### `proxmox_get_node_directory`
List directory-based storage on a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/disks/directory` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

**Returns**: Directory storage entries with path, device, and filesystem type.

---

### Cloud-Init (3 tools)

Cloud-init configuration management for QEMU VMs.

#### `proxmox_get_cloudinit_config`
Get cloud-init configuration items for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/cloudinit` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_dump_cloudinit`
Dump rendered cloud-init config (user-data, network-config, or meta-data) for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/qemu/{vmid}/cloudinit/dump` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |
| `type` | string | Yes | Config type: `user`, `network`, or `meta` |

---

#### `proxmox_regenerate_cloudinit` 🔒
Regenerate the cloud-init drive for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/qemu/{vmid}/cloudinit` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

### Console Access (5 tools)

Console proxy ticket generation for VMs and containers. All require **elevated permissions**.

#### `proxmox_get_vnc_proxy` 🔒
Get a VNC proxy ticket for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/vncproxy` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_get_spice_proxy` 🔒
Get a SPICE proxy ticket for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/spiceproxy` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_get_term_proxy` 🔒
Get a terminal proxy ticket for a QEMU VM.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/qemu/{vmid}/termproxy` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | VM ID |

---

#### `proxmox_get_lxc_vnc_proxy` 🔒
Get a VNC proxy ticket for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/vncproxy` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

---

#### `proxmox_get_lxc_term_proxy` 🔒
Get a terminal proxy ticket for an LXC container.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/lxc/{vmid}/termproxy` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `vmid` | number | Yes | Container ID |

---

### Pool Management (5 tools)

Resource pool management for organizing VMs, containers, and storage.

#### `proxmox_list_pools`
List resource pools.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/pools` |

**Parameters**: None.

---

#### `proxmox_get_pool`
Get a resource pool by ID.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/pools/{poolid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

#### `proxmox_create_pool` 🔒
Create a resource pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/pools` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | string | No | Pool description |

---

#### `proxmox_update_pool` 🔒
Update a resource pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/pools/{poolid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | string | No | Updated pool description |
| `delete` | string | No | List of settings to delete |
| `digest` | string | No | Config digest |

---

#### `proxmox_delete_pool` 🔒
Delete a resource pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/pools/{poolid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

### Access Control (25 tools)

User, group, role, ACL, authentication domain, and API token management.

#### `proxmox_list_users`
List Proxmox users.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/users` |

**Parameters**: None.

---

#### `proxmox_get_user`
Get details for a Proxmox user.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/users/{userid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., `root@pam`) |

---

#### `proxmox_create_user` 🔒
Create a Proxmox user.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/access/users` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., `user@pve`) |
| `password` | string | No | User password |
| `comment` | string | No | User comment |
| `email` | string | No | Email address |
| `firstname` | string | No | First name |
| `lastname` | string | No | Last name |
| `groups` | string | No | Comma-separated group IDs |
| `expire` | number | No | Account expiration (epoch seconds) |
| `enable` | boolean | No | Enable user account |

---

#### `proxmox_update_user` 🔒
Update a Proxmox user.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/users/{userid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |
| `password` | string | No | New password |
| `comment` | string | No | User comment |
| `email` | string | No | Email address |
| `firstname` | string | No | First name |
| `lastname` | string | No | Last name |
| `groups` | string | No | Comma-separated group IDs |
| `append` | boolean | No | Append groups instead of replacing |
| `expire` | number | No | Account expiration (epoch seconds) |
| `enable` | boolean | No | Enable user account |

---

#### `proxmox_delete_user` 🔒
Delete a Proxmox user.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/access/users/{userid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |

---

#### `proxmox_list_groups`
List Proxmox groups.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/groups` |

**Parameters**: None.

---

#### `proxmox_create_group` 🔒
Create a Proxmox group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/access/groups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |
| `comment` | string | No | Group comment |
| `users` | string | No | Comma-separated user IDs |

---

#### `proxmox_update_group` 🔒
Update a Proxmox group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/groups/{groupid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |
| `comment` | string | No | Group comment |
| `users` | string | No | Comma-separated user IDs |
| `append` | boolean | No | Append users instead of replacing |

---

#### `proxmox_delete_group` 🔒
Delete a Proxmox group.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/access/groups/{groupid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |

---

#### `proxmox_list_roles`
List Proxmox roles.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/roles` |

**Parameters**: None.

---

#### `proxmox_create_role` 🔒
Create a Proxmox role.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/access/roles` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |
| `privs` | string | Yes | Comma-separated privileges |
| `comment` | string | No | Role comment |

---

#### `proxmox_update_role` 🔒
Update a Proxmox role.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/roles/{roleid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |
| `privs` | string | No | Comma-separated privileges |
| `comment` | string | No | Role comment |
| `append` | boolean | No | Append privileges instead of replacing |

---

#### `proxmox_delete_role` 🔒
Delete a Proxmox role.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/access/roles/{roleid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |

---

#### `proxmox_get_acl`
Get ACL entries.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/acl` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | No | Filter by path (e.g., `/vms`) |
| `userid` | string | No | Filter by user ID |
| `groupid` | string | No | Filter by group ID |
| `roleid` | string | No | Filter by role ID |

---

#### `proxmox_update_acl` 🔒
Update ACL entries.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/acl` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | Yes | ACL path (e.g., `/vms`) |
| `roles` | string | Yes | Comma-separated roles |
| `users` | string | No | Comma-separated user IDs |
| `groups` | string | No | Comma-separated group IDs |
| `propagate` | boolean | No | Propagate to sub-paths |
| `delete` | boolean | No | Delete ACL entry |

---

#### `proxmox_list_domains`
List authentication domains.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/domains` |

**Parameters**: None.

---

#### `proxmox_get_domain`
Get authentication domain details.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/domains/{realm}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

---

#### `proxmox_create_domain` 🔒
Create an authentication domain.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/access/domains` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |
| `type` | string | Yes | Domain type: `pam`, `pve`, `ldap`, `ad`, `openid` |
| `comment` | string | No | Domain comment |
| `default` | boolean | No | Set as default realm |
| `server1` | string | No | Primary server |
| `server2` | string | No | Secondary server |
| `port` | number | No | Port (1-65535) |
| `secure` | boolean | No | Enable TLS |
| `base_dn` | string | No | Base DN |
| `user_attr` | string | No | User attribute |

---

#### `proxmox_update_domain` 🔒
Update an authentication domain.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/domains/{realm}` |

**Parameters**: Same as `proxmox_create_domain` (all fields optional except `realm`).

---

#### `proxmox_delete_domain` 🔒
Delete an authentication domain.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/access/domains/{realm}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

---

#### `proxmox_list_user_tokens`
List API tokens for a user.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/users/{userid}/token` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., `root@pam`) |

---

#### `proxmox_get_user_token`
Get details of a specific user API token.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/access/users/{userid}/token/{tokenid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |
| `tokenid` | string | Yes | Token ID |

---

#### `proxmox_create_user_token` 🔒
Create a new API token for a user.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/access/users/{userid}/token/{tokenid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |
| `tokenid` | string | Yes | Token ID |
| `comment` | string | No | Token comment |
| `expire` | number | No | Token expiration (epoch seconds) |
| `privsep` | boolean | No | Privilege separation |

---

#### `proxmox_update_user_token` 🔒
Update a user API token.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/access/users/{userid}/token/{tokenid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |
| `tokenid` | string | Yes | Token ID |
| `comment` | string | No | Token comment |
| `expire` | number | No | Token expiration (epoch seconds) |

---

#### `proxmox_delete_user_token` 🔒
Delete a user API token.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/access/users/{userid}/token/{tokenid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm |
| `tokenid` | string | Yes | Token ID |

---

### SDN (20 tools)

Software Defined Networking management for virtual networks, zones, controllers, and subnets.

#### `proxmox_list_sdn_vnets`
List SDN virtual networks.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/vnets` |

**Parameters**: None.

---

#### `proxmox_get_sdn_vnet`
Get an SDN virtual network by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/vnets/{vnet}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

---

#### `proxmox_create_sdn_vnet` 🔒
Create an SDN virtual network.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/sdn/vnets` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |
| `zone` | string | No | SDN zone identifier |
| `alias` | string | No | Alias/description |
| `tag` | number | No | VLAN tag |
| `mtu` | number | No | MTU value |

---

#### `proxmox_update_sdn_vnet` 🔒
Update an SDN virtual network.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/sdn/vnets/{vnet}` |

**Parameters**: Same as `proxmox_create_sdn_vnet` (with `delete` and `digest` options).

---

#### `proxmox_delete_sdn_vnet` 🔒
Delete an SDN virtual network.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/sdn/vnets/{vnet}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

---

#### `proxmox_list_sdn_zones`
List SDN zones.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/zones` |

**Parameters**: None.

---

#### `proxmox_get_sdn_zone`
Get an SDN zone by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/zones/{zone}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

---

#### `proxmox_create_sdn_zone` 🔒
Create an SDN zone.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/sdn/zones` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |
| `type` | string | No | Zone type (simple, evpn, vxlan, etc.) |
| `bridge` | string | No | Bridge name |
| `nodes` | string | No | Nodes list (comma-separated) |
| `mtu` | number | No | MTU value |

---

#### `proxmox_update_sdn_zone` 🔒
Update an SDN zone.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/sdn/zones/{zone}` |

**Parameters**: Same as `proxmox_create_sdn_zone` (with `delete` and `digest` options).

---

#### `proxmox_delete_sdn_zone` 🔒
Delete an SDN zone.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/sdn/zones/{zone}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

---

#### `proxmox_list_sdn_controllers`
List SDN controllers.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/controllers` |

**Parameters**: None.

---

#### `proxmox_get_sdn_controller`
Get an SDN controller by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/controllers/{controller}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

---

#### `proxmox_create_sdn_controller` 🔒
Create an SDN controller.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/sdn/controllers` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |
| `type` | string | No | Controller type |
| `ip` | string | No | Controller IP address |
| `port` | number | No | Controller port |
| `zone` | string | No | Associated SDN zone |

---

#### `proxmox_update_sdn_controller` 🔒
Update an SDN controller.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/sdn/controllers/{controller}` |

**Parameters**: Same as `proxmox_create_sdn_controller` (with `delete` and `digest` options).

---

#### `proxmox_delete_sdn_controller` 🔒
Delete an SDN controller.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/sdn/controllers/{controller}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

---

#### `proxmox_list_sdn_subnets`
List SDN subnets.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/subnets` |

**Parameters**: None.

---

#### `proxmox_get_sdn_subnet`
Get an SDN subnet by name.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/sdn/subnets/{subnet}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

---

#### `proxmox_create_sdn_subnet` 🔒
Create an SDN subnet.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/sdn/subnets` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |
| `vnet` | string | No | Associated SDN VNet |
| `cidr` | string | No | CIDR range (e.g., `10.0.0.0/24`) |
| `gateway` | string | No | Gateway IP address |
| `dhcp` | boolean | No | Enable DHCP |
| `snat` | boolean | No | Enable source NAT |
| `dns` | string | No | DNS servers list |

---

#### `proxmox_update_sdn_subnet` 🔒
Update an SDN subnet.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/sdn/subnets/{subnet}` |

**Parameters**: Same as `proxmox_create_sdn_subnet` (with `delete` and `digest` options).

---

#### `proxmox_delete_sdn_subnet` 🔒
Delete an SDN subnet.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/sdn/subnets/{subnet}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

---

### Ceph Integration (16 tools)

Ceph distributed storage management including OSDs, monitors, MDS daemons, pools, and filesystems.

#### `proxmox_get_ceph_status`
Get Ceph cluster status.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/status` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_list_ceph_osds`
List Ceph OSDs.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/osd` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_create_ceph_osd` 🔒
Create a Ceph OSD.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/ceph/osd` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `dev` | string | Yes | OSD device path (e.g., `/dev/sdb`) |
| `osdid` | number | No | Optional OSD ID |
| `dbdev` | string | No | Optional DB device path |
| `waldev` | string | No | Optional WAL device path |
| `crush-device-class` | string | No | CRUSH device class (e.g., `hdd`, `ssd`) |
| `encrypted` | boolean | No | Enable dm-crypt encryption |

---

#### `proxmox_delete_ceph_osd` 🔒
Delete a Ceph OSD.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/ceph/osd/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | number | Yes | OSD ID |

---

#### `proxmox_list_ceph_mons`
List Ceph monitors.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/mon` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_create_ceph_mon` 🔒
Create a Ceph monitor.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/ceph/mon/{monid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

---

#### `proxmox_delete_ceph_mon` 🔒
Delete a Ceph monitor.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/ceph/mon/{monid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

---

#### `proxmox_list_ceph_mds`
List Ceph MDS daemons.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/mds` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_create_ceph_mds` 🔒
Create a Ceph MDS daemon.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/ceph/mds/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

---

#### `proxmox_delete_ceph_mds` 🔒
Delete a Ceph MDS daemon.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/ceph/mds/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

---

#### `proxmox_list_ceph_pools`
List Ceph pools.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/pool` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_create_ceph_pool` 🔒
Create a Ceph pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/ceph/pool` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |
| `pg_num` | number | No | Placement group count |
| `size` | number | No | Replication size |
| `min_size` | number | No | Minimum replication size |
| `crush_rule` | string | No | CRUSH rule name |
| `pg_autoscale_mode` | string | No | PG autoscale mode (`on`, `off`, `warn`) |

---

#### `proxmox_update_ceph_pool` 🔒
Update a Ceph pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/ceph/pool/{name}` |

**Parameters**: Same as `proxmox_create_ceph_pool`.

---

#### `proxmox_delete_ceph_pool` 🔒
Delete a Ceph pool.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/ceph/pool/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |

---

#### `proxmox_list_ceph_fs`
List Ceph filesystems.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/ceph/fs` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_create_ceph_fs` 🔒
Create a Ceph filesystem.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/ceph/fs/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | CephFS name |
| `pool` | string | No | Primary data pool name |
| `data_pool` | string | No | Data pool name |
| `metadata_pool` | string | No | Metadata pool name |

---

### Certificate Management (7 tools)

SSL certificate management for Proxmox nodes including custom certificates and ACME/Let's Encrypt.

#### `proxmox_get_node_certificates`
Get SSL certificate information for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/certificates/info` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_upload_custom_certificate` 🔒
Upload a custom SSL certificate to a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/certificates/custom` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `certificates` | string | Yes | PEM encoded certificate(s) |
| `key` | string | No | PEM encoded private key |
| `force` | boolean | No | Overwrite existing custom certificate |
| `restart` | boolean | No | Restart pveproxy service |

---

#### `proxmox_delete_custom_certificate` 🔒
Delete the custom SSL certificate from a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/certificates/custom` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_order_acme_certificate` 🔒
Order a new ACME (Let's Encrypt) certificate for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/certificates/acme/certificate` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | boolean | No | Force renewal even if certificate is still valid |

---

#### `proxmox_renew_acme_certificate` 🔒
Renew the ACME certificate for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/nodes/{node}/certificates/acme/certificate` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | boolean | No | Force renewal even if certificate is still valid |

---

#### `proxmox_revoke_acme_certificate` 🔒
Revoke the ACME certificate for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/certificates/acme/certificate` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_acme_config`
Get ACME configuration for a Proxmox node.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/config` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

### ACME Management (8 tools)

Cluster-wide ACME account and plugin management for automated certificate provisioning.

#### `proxmox_list_acme_accounts`
List all ACME accounts configured in the cluster.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/acme/account` |

**Parameters**: None.

---

#### `proxmox_get_acme_account`
Get detailed information about a specific ACME account.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/acme/account/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |

---

#### `proxmox_create_acme_account` 🔒
Create a new ACME account.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/acme/account` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contact` | string | Yes | Contact email address |
| `name` | string | No | ACME account name |
| `tos_url` | string | No | URL of CA Terms of Service (setting indicates agreement) |
| `directory` | string | No | URL of ACME CA directory endpoint |

---

#### `proxmox_update_acme_account` 🔒
Update an existing ACME account.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/acme/account/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |
| `contact` | string | No | Contact email address |

---

#### `proxmox_delete_acme_account` 🔒
Delete an ACME account.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/acme/account/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |

---

#### `proxmox_list_acme_plugins`
List all ACME challenge plugins configured in the cluster.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/acme/plugins` |

**Parameters**: None.

---

#### `proxmox_get_acme_plugin`
Get detailed configuration for a specific ACME plugin.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/acme/plugins/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | ACME plugin ID |

---

#### `proxmox_get_acme_directories`
Get available ACME directory endpoints (Let's Encrypt, etc.).

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/acme/directories` |

**Parameters**: None.

---

### Notification Management (5 tools)

Notification target management for SMTP, Gotify, and Sendmail integrations.

#### `proxmox_list_notification_targets`
List all notification targets (SMTP, Gotify, Sendmail).

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/notifications/targets` |

**Parameters**: None.

---

#### `proxmox_get_notification_target`
Get detailed configuration for a specific notification target.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/notifications/endpoints/{type}/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Target type: `smtp`, `gotify`, `sendmail` |
| `name` | string | Yes | Notification target name |

---

#### `proxmox_create_notification_target` 🔒
Create a new notification target.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/notifications/endpoints/{type}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Target type: `smtp`, `gotify`, `sendmail` |
| `name` | string | Yes | Notification target name |
| `comment` | string | No | Comment |
| `disable` | boolean | No | Disable this target |
| `server` | string | No | SMTP server address (for smtp type) |
| `port` | number | No | SMTP server port (for smtp type) |
| `username` | string | No | SMTP username (for smtp type) |
| `mode` | string | No | SMTP encryption: `insecure`, `starttls`, `tls` |
| `token` | string | No | Gotify API token (for gotify type) |
| `mailto` | string | No | Recipient email address |
| `from` | string | No | Sender email address |

---

#### `proxmox_delete_notification_target` 🔒
Delete a notification target.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/notifications/endpoints/{type}/{name}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Target type: `smtp`, `gotify`, `sendmail` |
| `name` | string | Yes | Notification target name |

---

#### `proxmox_test_notification_target` 🔒
Send a test notification to a target.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/notifications/targets/{name}/test` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Notification target name |

---

## Unimplemented Proxmox APIs

This section lists Proxmox VE API endpoints that are not yet implemented in this MCP server, organized by priority.

### High Priority

APIs that would significantly enhance functionality:

_(No high-priority APIs remaining — all have been implemented.)_

### Medium Priority

APIs for specialized use cases:

#### Two-Factor Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/access/tfa` | GET/POST/PUT/DELETE | Two-factor authentication management |
| `/access/password` | PUT | Change user password |

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
