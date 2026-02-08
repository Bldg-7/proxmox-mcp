# Proxmox Certificate Management

> Node certificate management, custom certificate upload, and ACME certificate ordering/renewal.

**Tools in this file:** 7  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_delete_custom_certificate`

**Description:** Delete the custom SSL certificate from a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_acme_config`

**Description:** Get ACME configuration for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_certificates`

**Description:** Get SSL certificate information for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_order_acme_certificate`

**Description:** Order a new ACME (Let's Encrypt) certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | unknown | No | - |

---

#### `proxmox_renew_acme_certificate`

**Description:** Renew the ACME certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | unknown | No | - |

---

#### `proxmox_revoke_acme_certificate`

**Description:** Revoke the ACME certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_upload_custom_certificate`

**Description:** Upload a custom SSL certificate to a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `certificates` | string | Yes | PEM encoded certificate(s) |
| `key` | unknown | No | - |
| `force` | unknown | No | - |
| `restart` | unknown | No | - |

---

