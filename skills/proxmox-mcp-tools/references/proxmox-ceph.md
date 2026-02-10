# Proxmox Ceph Integration

> Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems.

**Tools in this file:** 16  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_ceph_fs`

**Description:** Create a Ceph filesystem (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | CephFS name |
| `pool` | unknown | No | - |
| `data_pool` | unknown | No | - |
| `metadata_pool` | unknown | No | - |

---

#### `proxmox_ceph_mds`

**Description:** Create a Ceph MDS daemon (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

---

#### `proxmox_ceph_mon`

**Description:** Create a Ceph monitor (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

---

#### `proxmox_ceph_osd`

**Description:** Create a Ceph OSD (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `dev` | string | Yes | OSD device path (e.g., /dev/sdb) |
| `osdid` | unknown | No | - |
| `dbdev` | unknown | No | - |
| `waldev` | unknown | No | - |
| `crush-device-class` | unknown | No | - |
| `encrypted` | unknown | No | - |

---

#### `proxmox_ceph_pool`

**Description:** Create a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |
| `pg_num` | unknown | No | - |
| `size` | unknown | No | - |
| `min_size` | unknown | No | - |
| `crush_rule` | unknown | No | - |
| `pg_autoscale_mode` | unknown | No | - |

---

#### `proxmox_ceph_mds`

**Description:** Delete a Ceph MDS daemon (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

---

#### `proxmox_ceph_mon`

**Description:** Delete a Ceph monitor (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

---

#### `proxmox_ceph_osd`

**Description:** Delete a Ceph OSD (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | number | Yes | OSD ID |

---

#### `proxmox_ceph_pool`

**Description:** Delete a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |

---

#### `proxmox_ceph`

**Description:** Get Ceph cluster status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_fs`

**Description:** List Ceph filesystems

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_mds`

**Description:** List Ceph MDS daemons

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_mon`

**Description:** List Ceph monitors

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_osd`

**Description:** List Ceph OSDs

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_pool`

**Description:** List Ceph pools

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_ceph_pool`

**Description:** Update a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |
| `pg_num` | unknown | No | - |
| `size` | unknown | No | - |
| `min_size` | unknown | No | - |
| `crush_rule` | unknown | No | - |
| `pg_autoscale_mode` | unknown | No | - |

---

