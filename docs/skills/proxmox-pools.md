# Proxmox Resource Pools

> Resource pool management for organizing VMs and containers.

**Tools in this file:** 5  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_pool`

**Description:** Create a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | unknown | No | - |

---

#### `proxmox_pool`

**Description:** Delete a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

#### `proxmox_pool`

**Description:** Get a resource pool by ID

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

---

#### `proxmox_pool`

**Description:** List resource pools

**Permission:** basic

**Parameters:** None

---

#### `proxmox_pool`

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

