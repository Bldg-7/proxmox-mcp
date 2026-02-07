# Proxmox Resource Pools

> Resource pool management for organizing VMs and containers.

**Tools in this file:** 5  
**Generated:** 2026-02-06T10:53:57.669Z

---

## Tools

#### `proxmox_create_pool`

**Description:** Create a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | unknown | No | - |

---

#### `proxmox_delete_pool`

**Description:** Delete a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

#### `proxmox_get_pool`

**Description:** Get a resource pool by ID

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

#### `proxmox_list_pools`

**Description:** List resource pools

**Permission:** basic

**Parameters:** None

---

#### `proxmox_update_pool`

**Description:** Update a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

