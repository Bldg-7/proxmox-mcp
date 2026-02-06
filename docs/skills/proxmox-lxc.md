# Proxmox LXC Containers

> LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring.

**Tools in this file:** 18  
**Generated:** 2026-02-06T10:49:51.723Z

---

## Tools

#### `proxmox_add_mountpoint_lxc`

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

#### `proxmox_add_network_lxc`

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

#### `proxmox_clone_lxc`

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

#### `proxmox_create_template_lxc`

**Description:** Convert an LXC container to a template (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_delete_lxc`

**Description:** Delete an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_get_lxc_config`

**Description:** Get hardware configuration for an LXC container (mount points, network, CPU, memory)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

---

#### `proxmox_get_lxc_rrddata`

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

#### `proxmox_move_disk_lxc`

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

#### `proxmox_reboot_lxc`

**Description:** Reboot an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_remove_mountpoint_lxc`

**Description:** Remove a mount point from an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `mp` | string | Yes | Mount point name to remove (e.g., mp0, mp1, mp2) |

---

#### `proxmox_remove_network_lxc`

**Description:** Remove network interface from LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `net` | string | Yes | Network interface name to remove (net0, net1, net2, etc.) |

---

#### `proxmox_resize_disk_lxc`

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

#### `proxmox_resize_lxc`

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

#### `proxmox_shutdown_lxc`

**Description:** Gracefully shutdown an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_start_lxc`

**Description:** Start an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_stop_lxc`

**Description:** Stop an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_update_network_lxc`

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

