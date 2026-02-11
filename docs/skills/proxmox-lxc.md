# Proxmox LXC Containers

> LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring.

**Tools in this file:** 22  
**Generated:** 2026-02-12

---

## Tools

#### `proxmox_lxc_mountpoint`

**Description:** Add a mount point to an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `mp` | string | Yes | Mount point name (e.g., mp0, mp1, mp2) |
| `storage` | string | Yes | Storage name (e.g., local-lvm) |
| `size` | string | Yes | Mount point size in GB (e.g., 10) |

---

#### `proxmox_guest_network`

**Description:** Add network interface to LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `net` | string | Yes | Network interface name (net0, net1, net2, etc.) |
| `bridge` | string | Yes | Bridge name (e.g., vmbr0, vmbr1) |
| `ip` | unknown | No | - |
| `gw` | unknown | No | - |
| `firewall` | unknown | No | - |

---

#### `proxmox_guest_feature`

**Description:** Check if a feature (snapshot, clone, copy) is available for an LXC container

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `feature` | enum | Yes | Feature to check (snapshot, clone, copy) |

---

#### `proxmox_guest_clone`

**Description:** Clone an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID to clone from |
| `newid` | number | Yes | New container ID |
| `hostname` | unknown | No | - |

---

#### `proxmox_create_lxc`

**Description:** Create a new LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container will be created |
| `vmid` | number | Yes | Container ID number (must be unique, or use proxmox_get_next_vmid) |
| `ostemplate` | string | Yes | OS template (e.g., local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz) |
| `hostname` | unknown | No | - |
| `password` | unknown | No | - |
| `memory` | unknown | Yes | RAM in MB |
| `storage` | unknown | Yes | Storage location |
| `rootfs` | unknown | Yes | Root filesystem size in GB |
| `net0` | unknown | No | - |

---

#### `proxmox_guest_template`

**Description:** Convert an LXC container to a template (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_delete`

**Description:** Delete an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_config`

**Description:** Get hardware configuration for an LXC container (mount points, network, CPU, memory)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

---

#### `proxmox_guest_pending`

**Description:** Get pending configuration changes for an LXC container

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

---

#### `proxmox_guest_rrddata`

**Description:** Get performance metrics (RRD data) for an LXC container

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `timeframe` | unknown | No | - |
| `cf` | unknown | No | - |

---

#### `proxmox_guest_disk_move`

**Description:** Move an LXC container disk to different storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `disk` | string | Yes | Disk/volume name to move (rootfs, mp0, mp1, etc.) |
| `storage` | string | Yes | Target storage name |
| `delete` | unknown | Yes | Delete source disk after move (default: true) |

---

#### `proxmox_guest_reboot`

**Description:** Reboot an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_lxc_mountpoint`

**Description:** Remove a mount point from an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `mp` | string | Yes | Mount point name to remove (e.g., mp0, mp1, mp2) |

---

#### `proxmox_guest_network`

**Description:** Remove network interface from LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `net` | string | Yes | Network interface name to remove (net0, net1, net2, etc.) |

---

#### `proxmox_guest_disk_resize`

**Description:** Resize an LXC container disk or mount point (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `disk` | string | Yes | Disk name (rootfs, mp0, mp1, etc.) |
| `size` | string | Yes | New size with + for relative or absolute (e.g., +10G or 50G) |

---

#### `proxmox_guest_resize`

**Description:** Resize an LXC container CPU/memory (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `memory` | unknown | No | - |
| `cores` | unknown | No | - |

---

#### `proxmox_guest_shutdown`

**Description:** Gracefully shutdown an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_start`

**Description:** Start an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_stop`

**Description:** Stop an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_guest_config_update`

**Description:** Update LXC container configuration with arbitrary key-value pairs via PUT /config (requires elevated permissions). Supports hostname, memory, cores, swap, mount points, network, and all other Proxmox LXC config params. For resize (memory/cores) prefer proxmox_guest_resize. For network prefer proxmox_guest_network. Use proxmox_guest_config to discover valid parameters.

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `config` | object | No | Key-value pairs of container configuration to set. Common keys: hostname, memory, swap, cores, cpulimit, cpuunits, nameserver, searchdomain, tags, description, mp0-mpN (mount points). Use proxmox_guest_config to discover valid keys. |
| `delete` | string | No | Comma-separated list of config keys to REMOVE (e.g. "mp0,nameserver"). Does NOT delete the container. |

---

#### `proxmox_guest_network`

**Description:** Update/modify LXC network interface configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `net` | string | Yes | Network interface name to update (net0, net1, net2, etc.) |
| `bridge` | unknown | No | - |
| `ip` | unknown | No | - |
| `gw` | unknown | No | - |
| `firewall` | unknown | No | - |

---

#### `proxmox_lxc_exec`

**Description:** Execute a command inside an LXC container via SSH to Proxmox host using `pct exec`. Requires double opt-in: `PROXMOX_ALLOW_ELEVATED=true` and `PROXMOX_SSH_ENABLED=true`.

**Permission:** elevated (double opt-in)

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Proxmox node name (must match `PROXMOX_SSH_NODE`) |
| `vmid` | number | Yes | LXC container ID (100-999999999) |
| `command` | string | Yes | Command to execute inside the container |
| `timeout` | number | No | Timeout in seconds (default: 30, max: 120) |

**Security**: SSH key auth only, command validation blocks dangerous characters, shell-quoted execution via `pct exec`, node name enforcement, 64KB output limit.

**Required Environment Variables**: `PROXMOX_SSH_ENABLED=true`, `PROXMOX_SSH_KEY_PATH`, `PROXMOX_SSH_NODE`

---

