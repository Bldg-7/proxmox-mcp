# Proxmox Access Control

> Users, groups, roles, ACLs, and authentication domains.

**Tools in this file:** 25  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_create_domain`

**Description:** Create an authentication domain (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |
| `type` | enum | Yes | Authentication domain type |
| `comment` | unknown | No | - |
| `default` | unknown | No | - |
| `server1` | unknown | No | - |
| `server2` | unknown | No | - |
| `port` | unknown | No | - |
| `secure` | unknown | No | - |
| `base_dn` | unknown | No | - |
| `user_attr` | unknown | No | - |
| `bind_dn` | unknown | No | - |
| `bind_password` | unknown | No | - |
| `group_filter` | unknown | No | - |
| `capath` | unknown | No | - |
| `sslversion` | unknown | No | - |

---

#### `proxmox_create_group`

**Description:** Create a Proxmox group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |
| `comment` | unknown | No | - |
| `users` | unknown | No | - |

---

#### `proxmox_create_role`

**Description:** Create a Proxmox role (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |
| `privs` | string | Yes | Comma-separated privileges |
| `comment` | unknown | No | - |

---

#### `proxmox_create_user`

**Description:** Create a Proxmox user (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., user@pve) |
| `password` | unknown | No | - |
| `comment` | unknown | No | - |
| `email` | unknown | No | - |
| `firstname` | unknown | No | - |
| `lastname` | unknown | No | - |
| `groups` | unknown | No | - |
| `expire` | unknown | No | - |
| `enable` | unknown | No | - |

---

#### `proxmox_create_user_token`

**Description:** Create a new API token for a user (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |
| `tokenid` | string | Yes | Token ID |
| `comment` | unknown | No | - |
| `expire` | unknown | No | - |
| `privsep` | unknown | No | - |

---

#### `proxmox_delete_domain`

**Description:** Delete an authentication domain (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

---

#### `proxmox_delete_group`

**Description:** Delete a Proxmox group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |

---

#### `proxmox_delete_role`

**Description:** Delete a Proxmox role (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |

---

#### `proxmox_delete_user`

**Description:** Delete a Proxmox user (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., user@pve) |

---

#### `proxmox_delete_user_token`

**Description:** Delete a user API token (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |
| `tokenid` | string | Yes | Token ID |

---

#### `proxmox_get_acl`

**Description:** Get ACL entries

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | unknown | No | - |
| `userid` | unknown | No | - |
| `groupid` | unknown | No | - |
| `roleid` | unknown | No | - |

---

#### `proxmox_get_domain`

**Description:** Get authentication domain details

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

---

#### `proxmox_get_user`

**Description:** Get details for a Proxmox user

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |

---

#### `proxmox_get_user_token`

**Description:** Get details of a specific user API token

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |
| `tokenid` | string | Yes | Token ID |

---

#### `proxmox_list_domains`

**Description:** List authentication domains

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_groups`

**Description:** List Proxmox groups

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_roles`

**Description:** List Proxmox roles

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_user_tokens`

**Description:** List API tokens for a user

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |

---

#### `proxmox_list_users`

**Description:** List Proxmox users

**Permission:** basic

**Parameters:** None

---

#### `proxmox_update_acl`

**Description:** Update ACL entries (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | Yes | ACL path (e.g., /vms) |
| `roles` | string | Yes | Comma-separated roles |
| `users` | unknown | No | - |
| `groups` | unknown | No | - |
| `propagate` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_domain`

**Description:** Update an authentication domain (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |
| `type` | unknown | No | - |
| `comment` | unknown | No | - |
| `default` | unknown | No | - |
| `server1` | unknown | No | - |
| `server2` | unknown | No | - |
| `port` | unknown | No | - |
| `secure` | unknown | No | - |
| `base_dn` | unknown | No | - |
| `user_attr` | unknown | No | - |
| `bind_dn` | unknown | No | - |
| `bind_password` | unknown | No | - |
| `group_filter` | unknown | No | - |
| `capath` | unknown | No | - |
| `sslversion` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_group`

**Description:** Update a Proxmox group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |
| `comment` | unknown | No | - |
| `users` | unknown | No | - |
| `append` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_role`

**Description:** Update a Proxmox role (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |
| `privs` | unknown | No | - |
| `comment` | unknown | No | - |
| `append` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_user`

**Description:** Update a Proxmox user (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., user@pve) |
| `password` | unknown | No | - |
| `comment` | unknown | No | - |
| `email` | unknown | No | - |
| `firstname` | unknown | No | - |
| `lastname` | unknown | No | - |
| `groups` | unknown | No | - |
| `append` | unknown | No | - |
| `expire` | unknown | No | - |
| `enable` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_user_token`

**Description:** Update a user API token (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |
| `tokenid` | string | Yes | Token ID |
| `comment` | unknown | No | - |
| `expire` | unknown | No | - |

---

