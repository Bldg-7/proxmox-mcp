# Proxmox Storage

> Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools.

**Tools in this file:** 20  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_create_storage`

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

#### `proxmox_delete_storage`

**Description:** Delete a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

---

#### `proxmox_delete_storage_content`

**Description:** Delete content from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Volume identifier (volid) |

---

#### `proxmox_download_file_restore`

**Description:** Download a file from backup

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `filepath` | string | Yes | File path inside backup |

---

#### `proxmox_download_url_to_storage`

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

#### `proxmox_get_disk_smart`

**Description:** Get SMART health data for a specific disk on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sda) |
| `health_only` | unknown | No | - |

---

#### `proxmox_get_node_directory`

**Description:** List directory-based storage on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_disks`

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

#### `proxmox_get_node_lvm`

**Description:** List LVM volume groups and physical volumes on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_lvmthin`

**Description:** List LVM thin pools on a Proxmox node with capacity info

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_zfs`

**Description:** List ZFS pools on a Proxmox node with health and capacity info

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_storage_config`

**Description:** Get a storage configuration by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

---

#### `proxmox_init_disk_gpt`

**Description:** Initialize GPT partition table on a disk (requires elevated permissions, destructive)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sdb) |
| `uuid` | unknown | No | - |

---

#### `proxmox_list_file_restore`

**Description:** List files in a backup for restore

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `path` | unknown | No | - |

---

#### `proxmox_list_storage_config`

**Description:** List storage configurations available in Proxmox

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_storage_content`

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

#### `proxmox_prune_backups`

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

#### `proxmox_update_storage`

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

#### `proxmox_upload_to_storage`

**Description:** Upload ISO/template to storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | enum | Yes | Upload content type |
| `filename` | string | Yes | Filename to upload |
| `checksum` | unknown | No | - |
| `checksum-algorithm` | unknown | No | - |

---

#### `proxmox_wipe_disk`

**Description:** Wipe all data from a disk (requires elevated permissions, destructive)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sdb) |

---

