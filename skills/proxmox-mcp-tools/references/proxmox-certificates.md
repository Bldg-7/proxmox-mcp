# Proxmox Certificate Management

> Node certificate management, custom certificate upload, and ACME certificate ordering/renewal.

**Tools in this file:** 7  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_certificate`

**Description:** Delete the custom SSL certificate from a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_acme_cert`

**Description:** Get ACME configuration for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_certificate`

**Description:** Get SSL certificate information for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_acme_cert`

**Description:** Order a new ACME (Let's Encrypt) certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | unknown | No | - |

---

#### `proxmox_acme_cert`

**Description:** Renew the ACME certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `force` | unknown | No | - |

---

#### `proxmox_acme_cert`

**Description:** Revoke the ACME certificate for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_certificate`

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

