# Proxmox Notification Management

> Notification target management for alerts and system notifications.

**Tools in this file:** 5  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_notification`

**Description:** Create a new notification target (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | enum | Yes | Notification target type |
| `name` | string | Yes | Notification target name |
| `comment` | unknown | No | - |
| `disable` | unknown | No | - |
| `server` | unknown | No | - |
| `port` | unknown | No | - |
| `username` | unknown | No | - |
| `password` | unknown | No | - |
| `mode` | unknown | No | - |
| `token` | unknown | No | - |
| `mailto` | unknown | No | - |
| `mailto-user` | unknown | No | - |
| `from` | unknown | No | - |
| `author` | unknown | No | - |

---

#### `proxmox_notification`

**Description:** Delete a notification target (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | enum | Yes | Notification target type |
| `name` | string | Yes | Notification target name |

---

#### `proxmox_notification`

**Description:** Get detailed configuration for a specific notification target

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | enum | Yes | Notification target type |
| `name` | string | Yes | Notification target name |

---

#### `proxmox_notification`

**Description:** List all notification targets (SMTP, Gotify, Sendmail)

**Permission:** basic

**Parameters:** None

---

#### `proxmox_notification`

**Description:** Send a test notification to a target (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Notification target name |

---

