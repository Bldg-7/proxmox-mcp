# Proxmox Storage

> Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools.

**Tools in this file:** 20  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_storage_config`

**Description:** Create a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `type` | enum | Yes | Storage type |
| `content` | unknown | No | - |
| `path` | unknown | No | - |
| `server` | unknown | No | - |
| `export` | unknown | No | - |
| `share` | unknown | No | - |
| `username` | unknown | No | - |
| `password` | unknown | No | - |
| `domain` | unknown | No | - |
| `smbversion` | unknown | No | - |
| `nodes` | unknown | No | - |
| `shared` | unknown | No | - |
| `disable` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `pool` | unknown | No | - |
| `vgname` | unknown | No | - |
| `thinpool` | unknown | No | - |
| `monhost` | unknown | No | - |
| `fsname` | unknown | No | - |
| `keyring` | unknown | No | - |
| `portal` | unknown | No | - |
| `target` | unknown | No | - |
| `options` | unknown | No | - |

---

#### `proxmox_storage_config`

**Description:** Delete a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

---

#### `proxmox_storage_content`

**Description:** Delete content from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Volume identifier (volid) |

---

#### `proxmox_file_restore`

**Description:** `action=download` starts a PBS file transfer to the MCP server. Poll `proxmox_file_transfer` with the returned local ID.

**Permission:** elevated + operator file transfer opt-in

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `filepath` | string | Yes | Opaque base64 ID from a PBS listing |
| `request_id` | UUID | Yes | Reuse for retries of this request |
| `archive` | enum | No | Directory format: zip (default) or tar.zst |
| `expected_sha256` | string | No | Expected digest of received bytes |

---

#### `proxmox_storage_content`

**Description:** Download a file from URL to storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `url` | string | Yes | Source URL |
| `content` | enum | Yes | Content type |
| `filename` | unknown | No | - |
| `checksum` | unknown | No | - |
| `checksum-algorithm` | unknown | No | - |
| `verify-certificates` | unknown | No | - |

---

#### `proxmox_node_disk`

**Description:** Get SMART health data for a specific disk on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sda) |
| `health_only` | unknown | No | - |

---

#### `proxmox_node_disk`

**Description:** List directory-based storage on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_disk`

**Description:** List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `include_partitions` | unknown | No | - |
| `skip_smart` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_node_disk`

**Description:** List LVM volume groups and physical volumes on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_disk`

**Description:** List LVM thin pools on a Proxmox node with capacity info

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_disk`

**Description:** List ZFS pools on a Proxmox node with health and capacity info

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_storage_config`

**Description:** Get a storage configuration by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

---

#### `proxmox_node_disk_admin`

**Description:** Initialize GPT partition table on a disk (requires elevated permissions, destructive)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sdb) |
| `uuid` | unknown | No | - |

---

#### `proxmox_file_restore`

**Description:** `action=list` browses a PBS snapshot; local transfer opt-in not required

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | PBS snapshot identifier |
| `filepath` | string | No | `/` for root, otherwise pass the opaque ID unchanged |

---

#### `proxmox_storage_config`

**Description:** List storage configurations available in Proxmox

**Permission:** basic

**Parameters:** None

---

#### `proxmox_storage_content`

**Description:** List content stored on a storage

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | unknown | No | - |
| `vmid` | unknown | No | - |

---

#### `proxmox_storage_content`

**Description:** Prune old backups from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `keep-last` | unknown | No | - |
| `keep-hourly` | unknown | No | - |
| `keep-daily` | unknown | No | - |
| `keep-weekly` | unknown | No | - |
| `keep-monthly` | unknown | No | - |
| `keep-yearly` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `dry-run` | unknown | No | - |
| `vmid` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_storage_config`

**Description:** Update a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `content` | unknown | No | - |
| `path` | unknown | No | - |
| `server` | unknown | No | - |
| `export` | unknown | No | - |
| `share` | unknown | No | - |
| `username` | unknown | No | - |
| `password` | unknown | No | - |
| `domain` | unknown | No | - |
| `smbversion` | unknown | No | - |
| `nodes` | unknown | No | - |
| `shared` | unknown | No | - |
| `disable` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `pool` | unknown | No | - |
| `vgname` | unknown | No | - |
| `thinpool` | unknown | No | - |
| `monhost` | unknown | No | - |
| `fsname` | unknown | No | - |
| `keyring` | unknown | No | - |
| `portal` | unknown | No | - |
| `target` | unknown | No | - |
| `options` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_storage_content`

**Description:** `action=upload` starts a local ISO/template transfer (requires elevated permissions and operator opt-in)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | enum | Yes | iso or vztmpl |
| `filename` | string | Yes | Approved basename under the configured upload root |
| `request_id` | UUID | Yes | Client-generated ID; reuse for retries |
| `expected_sha256` | string | No | Expected SHA-256 of the upload snapshot |

#### `proxmox_file_transfer`

Elevated + operator opt-in. Call with `action=status` or `action=cancel` and `id` (local UUID, **not** UPID). For `submitted` uploads check the returned UPID with `proxmox_node_task get`. `received` downloads return artifact metadata, never file bytes. Do not automatically retry `remote_outcome_unknown` with a new request ID.

---

#### `proxmox_node_disk_admin`

**Description:** Wipe all data from a disk (requires elevated permissions, destructive)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sdb) |

---

