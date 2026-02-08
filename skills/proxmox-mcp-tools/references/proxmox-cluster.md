# Proxmox Cluster Management

> High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options.

**Tools in this file:** 54  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_add_cluster_firewall_ipset_entry`

**Description:** Add an entry to a cluster firewall IP set (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |
| `comment` | unknown | No | - |
| `nomatch` | unknown | No | - |

---

#### `proxmox_create_cluster_backup_job`

**Description:** Create a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `starttime` | string | Yes | Job start time (HH:MM) |
| `dow` | string | Yes | Day of week selection |
| `storage` | string | Yes | Storage identifier |
| `all` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `comment` | unknown | No | - |
| `compress` | unknown | No | - |
| `dumpdir` | unknown | No | - |
| `enabled` | unknown | No | - |
| `exclude` | unknown | No | - |
| `exclude-path` | unknown | No | - |
| `id` | unknown | No | - |
| `ionice` | unknown | No | - |
| `lockwait` | unknown | No | - |
| `mailnotification` | unknown | No | - |
| `mailto` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `mode` | unknown | No | - |
| `node` | unknown | No | - |
| `notes-template` | unknown | No | - |
| `performance` | unknown | No | - |
| `pigz` | unknown | No | - |
| `pool` | unknown | No | - |
| `protected` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `quiet` | unknown | No | - |
| `remove` | unknown | No | - |
| `repeat-missed` | unknown | No | - |
| `script` | unknown | No | - |
| `stdexcludes` | unknown | No | - |
| `stop` | unknown | No | - |
| `stopwait` | unknown | No | - |
| `tmpdir` | unknown | No | - |
| `vmid` | unknown | No | - |
| `zstd` | unknown | No | - |

---

#### `proxmox_create_cluster_firewall_alias`

**Description:** Create a cluster firewall alias (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |
| `cidr` | string | Yes | IP address or CIDR network |
| `comment` | unknown | No | - |

---

#### `proxmox_create_cluster_firewall_group`

**Description:** Create a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | unknown | No | - |
| `rename` | unknown | No | - |

---

#### `proxmox_create_cluster_firewall_ipset`

**Description:** Create a cluster firewall IP set (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `comment` | unknown | No | - |

---

#### `proxmox_create_cluster_firewall_rule`

**Description:** Create a cluster-wide firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | Rule action (ACCEPT, REJECT, DROP) |
| `type` | enum | Yes | Rule type |
| `comment` | unknown | No | - |
| `dest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `pos` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |

---

#### `proxmox_create_cluster_replication_job`

**Description:** Create a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID (<guest>-<jobnum>) |
| `target` | string | Yes | Target node name |
| `type` | enum | Yes | Replication type |
| `comment` | unknown | No | - |
| `disable` | unknown | No | - |
| `rate` | unknown | No | - |
| `remove_job` | unknown | No | - |
| `schedule` | unknown | No | - |
| `source` | unknown | No | - |

---

#### `proxmox_create_ha_group`

**Description:** Create a new HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `nodes` | string | Yes | Nodes list with optional priorities |
| `comment` | unknown | No | - |
| `nofailback` | unknown | No | - |
| `restricted` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_create_ha_resource`

**Description:** Create a new HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., vm:100, ct:100) |
| `type` | unknown | No | - |
| `comment` | unknown | No | - |
| `failback` | unknown | No | - |
| `group` | unknown | No | - |
| `max_relocate` | unknown | No | - |
| `max_restart` | unknown | No | - |
| `state` | unknown | No | - |

---

#### `proxmox_delete_cluster_backup_job`

**Description:** Delete a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

---

#### `proxmox_delete_cluster_firewall_alias`

**Description:** Delete a cluster firewall alias (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |

---

#### `proxmox_delete_cluster_firewall_group`

**Description:** Delete a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

---

#### `proxmox_delete_cluster_firewall_ipset`

**Description:** Delete a cluster firewall IP set (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |

---

#### `proxmox_delete_cluster_firewall_ipset_entry`

**Description:** Delete an entry from a cluster firewall IP set (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |

---

#### `proxmox_delete_cluster_firewall_rule`

**Description:** Delete a cluster firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

---

#### `proxmox_delete_cluster_replication_job`

**Description:** Delete a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `force` | unknown | No | - |
| `keep` | unknown | No | - |

---

#### `proxmox_delete_ha_group`

**Description:** Delete an HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

---

#### `proxmox_delete_ha_resource`

**Description:** Delete an HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |

---

#### `proxmox_get_cluster_backup_job`

**Description:** Get a scheduled cluster backup job

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

---

#### `proxmox_get_cluster_config`

**Description:** Get cluster configuration

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_cluster_config_node`

**Description:** Get cluster configuration for a specific node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_cluster_firewall_alias`

**Description:** Get a cluster firewall alias by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |

---

#### `proxmox_get_cluster_firewall_group`

**Description:** Get a cluster firewall group by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

---

#### `proxmox_get_cluster_firewall_options`

**Description:** Get cluster firewall options

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_cluster_firewall_rule`

**Description:** Get a cluster firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |

---

#### `proxmox_get_cluster_options`

**Description:** Get cluster-wide options

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_cluster_replication_job`

**Description:** Get a cluster replication job by ID

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_get_cluster_totem`

**Description:** Get cluster totem configuration

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_ha_group`

**Description:** Get details for a specific HA group

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

---

#### `proxmox_get_ha_groups`

**Description:** List High Availability groups in the cluster

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_ha_resource`

**Description:** Get details for a specific HA resource

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., vm:100, ct:100) |

---

#### `proxmox_get_ha_resources`

**Description:** List High Availability resources in the cluster

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | unknown | No | - |

---

#### `proxmox_get_ha_status`

**Description:** Get HA manager status information for the cluster

**Permission:** basic

**Parameters:** None

---

#### `proxmox_join_cluster`

**Description:** Join a cluster (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `hostname` | string | Yes | Hostname of cluster node to join |
| `password` | string | Yes | Cluster password |
| `fingerprint` | unknown | No | - |
| `force` | unknown | No | - |

---

#### `proxmox_list_cluster_backup_jobs`

**Description:** List scheduled cluster backup jobs

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_config_nodes`

**Description:** List cluster configuration nodes

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_firewall_aliases`

**Description:** List cluster firewall aliases

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_firewall_groups`

**Description:** List cluster firewall security groups

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_firewall_ipset_entries`

**Description:** List entries in a cluster firewall IP set

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |

---

#### `proxmox_list_cluster_firewall_ipsets`

**Description:** List cluster firewall IP sets

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_firewall_macros`

**Description:** List available firewall macros

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_firewall_refs`

**Description:** List firewall references (aliases/ipsets)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | unknown | No | - |

---

#### `proxmox_list_cluster_firewall_rules`

**Description:** List cluster-wide firewall rules

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_cluster_replication_jobs`

**Description:** List cluster replication jobs

**Permission:** basic

**Parameters:** None

---

#### `proxmox_update_cluster_backup_job`

**Description:** Update a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |
| `starttime` | unknown | No | - |
| `dow` | unknown | No | - |
| `storage` | unknown | No | - |
| `all` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `comment` | unknown | No | - |
| `compress` | unknown | No | - |
| `dumpdir` | unknown | No | - |
| `enabled` | unknown | No | - |
| `exclude` | unknown | No | - |
| `exclude-path` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `ionice` | unknown | No | - |
| `lockwait` | unknown | No | - |
| `mailnotification` | unknown | No | - |
| `mailto` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `mode` | unknown | No | - |
| `node` | unknown | No | - |
| `notes-template` | unknown | No | - |
| `performance` | unknown | No | - |
| `pigz` | unknown | No | - |
| `pool` | unknown | No | - |
| `protected` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `quiet` | unknown | No | - |
| `remove` | unknown | No | - |
| `repeat-missed` | unknown | No | - |
| `script` | unknown | No | - |
| `stdexcludes` | unknown | No | - |
| `stop` | unknown | No | - |
| `stopwait` | unknown | No | - |
| `tmpdir` | unknown | No | - |
| `vmid` | unknown | No | - |
| `zstd` | unknown | No | - |

---

#### `proxmox_update_cluster_firewall_alias`

**Description:** Update a cluster firewall alias (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Firewall alias name |
| `cidr` | string | Yes | IP address or CIDR network |
| `comment` | unknown | No | - |
| `rename` | unknown | No | - |

---

#### `proxmox_update_cluster_firewall_group`

**Description:** Update a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | unknown | No | - |
| `rename` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_cluster_firewall_ipset_entry`

**Description:** Update an entry in a cluster firewall IP set (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | IP set name |
| `cidr` | string | Yes | CIDR network address |
| `comment` | unknown | No | - |
| `nomatch` | unknown | No | - |

---

#### `proxmox_update_cluster_firewall_options`

**Description:** Update cluster firewall options (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `enable` | unknown | No | - |
| `policy_in` | unknown | No | - |
| `policy_out` | unknown | No | - |
| `log_ratelimit` | unknown | No | - |

---

#### `proxmox_update_cluster_firewall_rule`

**Description:** Update a cluster firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |
| `action` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `dest` | unknown | No | - |
| `digest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `moveto` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_update_cluster_options`

**Description:** Update cluster-wide options (requires elevated permissions)

**Permission:** elevated

**Parameters:** None

---

#### `proxmox_update_cluster_replication_job`

**Description:** Update a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `disable` | unknown | No | - |
| `rate` | unknown | No | - |
| `remove_job` | unknown | No | - |
| `schedule` | unknown | No | - |
| `source` | unknown | No | - |

---

#### `proxmox_update_ha_group`

**Description:** Update an HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `nodes` | unknown | No | - |
| `nofailback` | unknown | No | - |
| `restricted` | unknown | No | - |

---

#### `proxmox_update_ha_resource`

**Description:** Update an HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `failback` | unknown | No | - |
| `group` | unknown | No | - |
| `max_relocate` | unknown | No | - |
| `max_restart` | unknown | No | - |
| `state` | unknown | No | - |

---

