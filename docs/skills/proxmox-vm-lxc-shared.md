# Proxmox VM/LXC Shared Operations

> Operations common to both VMs and containers: migration, guest agent, and firewall rules.

**Tools in this file:** 36  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_agent_exec`

**Description:** Execute a command via QEMU guest agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `command` | string | Yes | Command to execute |
| `args` | unknown | No | - |
| `input-data` | unknown | No | - |
| `capture-output` | unknown | No | - |
| `timeout` | unknown | No | - |

---

#### `proxmox_agent_exec`

**Description:** Get status for a QEMU guest agent command

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pid` | number | Yes | Process ID returned by agent exec |

---

#### `proxmox_agent_file`

**Description:** Read file content from guest via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `file` | string | Yes | Path to file in guest filesystem |

---

#### `proxmox_agent_file`

**Description:** Write content to file in guest via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `file` | string | Yes | Path to file in guest filesystem |
| `content` | string | Yes | Content to write to file |
| `encode` | unknown | No | - |

---

#### `proxmox_agent_freeze`

**Description:** Freeze guest filesystems for consistent backup via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_freeze`

**Description:** Get guest filesystem freeze status via QEMU agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_freeze`

**Description:** Thaw (unfreeze) guest filesystems via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_freeze`

**Description:** Discard unused blocks on guest filesystems via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Get guest filesystem information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_hw`

**Description:** Get hostname from guest via QEMU agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_hw`

**Description:** Get guest memory block size information via QEMU agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_hw`

**Description:** Get guest memory block information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Get guest network interfaces via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Get guest OS information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Get guest time via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Get guest timezone via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_user`

**Description:** Get list of logged-in users from guest via QEMU agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_hw`

**Description:** Get guest vCPU information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_info`

**Description:** Ping the QEMU guest agent to verify availability

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_user`

**Description:** Set user password in guest via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `username` | string | Yes | Username to set password for |
| `password` | string | Yes | New password (5-1024 characters) |
| `crypted` | unknown | No | - |

---

#### `proxmox_agent_power`

**Description:** Shutdown guest via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_power`

**Description:** Suspend guest to disk (hibernate) via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_power`

**Description:** Hybrid suspend guest (RAM + disk) via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_agent_power`

**Description:** Suspend guest to RAM (sleep) via QEMU agent (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_firewall_rule`

**Description:** Create an LXC firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `action` | string | Yes | Rule action (ACCEPT, REJECT, DROP) |
| `type` | enum | Yes | Rule direction |
| `comment` | unknown | No | - |
| `dest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `pos` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Create a VM firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `action` | string | Yes | Rule action (ACCEPT, REJECT, DROP) |
| `type` | enum | Yes | Rule direction |
| `comment` | unknown | No | - |
| `dest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `pos` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Delete an LXC firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Delete a VM firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Get an LXC firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |

---

#### `proxmox_guest_firewall_rule`

**Description:** Get a VM firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |

---

#### `proxmox_guest_firewall_rule`

**Description:** List per-LXC firewall rules

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_firewall_rule`

**Description:** List per-VM firewall rules

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_migrate`

**Description:** Migrate an LXC container to another node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Source node name |
| `vmid` | number | Yes | Container ID to migrate |
| `target` | string | Yes | Target node name |
| `online` | unknown | No | - |
| `force` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `with-local-disks` | unknown | No | - |
| `with-local-storage` | unknown | No | - |

---

#### `proxmox_guest_migrate`

**Description:** Migrate a QEMU VM to another node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Source node name |
| `vmid` | number | Yes | VM ID to migrate |
| `target` | string | Yes | Target node name |
| `online` | unknown | No | - |
| `force` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `with-local-disks` | unknown | No | - |
| `with-local-storage` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Update an LXC firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `action` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `dest` | unknown | No | - |
| `digest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `moveto` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_guest_firewall_rule`

**Description:** Update a VM firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `action` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `dest` | unknown | No | - |
| `digest` | unknown | No | - |
| `dport` | unknown | No | - |
| `enable` | unknown | No | - |
| `iface` | unknown | No | - |
| `log` | unknown | No | - |
| `macro` | unknown | No | - |
| `moveto` | unknown | No | - |
| `proto` | unknown | No | - |
| `source` | unknown | No | - |
| `sport` | unknown | No | - |
| `type` | unknown | No | - |

---

