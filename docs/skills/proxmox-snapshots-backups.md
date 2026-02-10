# Proxmox Snapshots & Backups

> Snapshot creation/rollback and backup creation/restoration for VMs and containers.

**Tools in this file:** 14  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_backup`

**Description:** Create a backup of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `storage` | unknown | Yes | Storage location for backup |
| `mode` | unknown | Yes | Backup mode |
| `compress` | unknown | Yes | Compression algorithm |

---

#### `proxmox_backup`

**Description:** Create a backup of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `storage` | unknown | Yes | Storage location for backup |
| `mode` | unknown | Yes | Backup mode |
| `compress` | unknown | Yes | Compression algorithm |

---

#### `proxmox_guest_snapshot`

**Description:** Create a snapshot of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |
| `description` | unknown | No | - |

---

#### `proxmox_guest_snapshot`

**Description:** Create a snapshot of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |
| `description` | unknown | No | - |

---

#### `proxmox_backup`

**Description:** Delete a backup file from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name (e.g., local) |
| `volume` | string | Yes | Backup volume ID (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst) |

---

#### `proxmox_guest_snapshot`

**Description:** Delete a snapshot of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

---

#### `proxmox_guest_snapshot`

**Description:** Delete a snapshot of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

---

#### `proxmox_backup`

**Description:** List all backups on a storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | unknown | Yes | Storage name |

---

#### `proxmox_guest_snapshot`

**Description:** List all snapshots of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

---

#### `proxmox_guest_snapshot`

**Description:** List all snapshots of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_backup`

**Description:** Restore an LXC container from backup (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container will be restored |
| `vmid` | number | Yes | New container ID for restored container |
| `archive` | string | Yes | Backup archive path (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst) |
| `storage` | unknown | No | - |

---

#### `proxmox_backup`

**Description:** Restore a QEMU virtual machine from backup (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM will be restored |
| `vmid` | number | Yes | New VM ID for restored VM |
| `archive` | string | Yes | Backup archive path (e.g., local:backup/vzdump-qemu-100-2025_11_06-09_00_00.vma.zst) |
| `storage` | unknown | No | - |

---

#### `proxmox_guest_snapshot`

**Description:** Rollback an LXC container to a snapshot (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

---

#### `proxmox_guest_snapshot`

**Description:** Rollback a QEMU virtual machine to a snapshot (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

---

