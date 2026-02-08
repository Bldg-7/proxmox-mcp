# Proxmox ACME Management

> ACME account and plugin management for automated Let's Encrypt certificates.

**Tools in this file:** 8  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_create_acme_account`

**Description:** Create a new ACME account (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | unknown | No | - |
| `contact` | string | Yes | Contact email address |
| `tos_url` | unknown | No | - |
| `directory` | unknown | No | - |

---

#### `proxmox_delete_acme_account`

**Description:** Delete an ACME account (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |

---

#### `proxmox_get_acme_account`

**Description:** Get detailed information about a specific ACME account

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |

---

#### `proxmox_get_acme_directories`

**Description:** Get available ACME directory endpoints (Let's Encrypt, etc.)

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_acme_plugin`

**Description:** Get detailed configuration for a specific ACME plugin

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | ACME plugin ID |

---

#### `proxmox_list_acme_accounts`

**Description:** List all ACME accounts configured in the cluster

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_acme_plugins`

**Description:** List all ACME challenge plugins configured in the cluster

**Permission:** basic

**Parameters:** None

---

#### `proxmox_update_acme_account`

**Description:** Update an existing ACME account (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | ACME account name |
| `contact` | unknown | No | - |

---

