# Proxmox QEMU Virtual Machines

> QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring.

**Tools in this file:** 30  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_add_disk_vm`

**Description:** Add a new disk to a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `disk` | string | Yes | Disk name (e.g., scsi1, virtio1, sata1, ide1) |
| `storage` | string | Yes | Storage name (e.g., local-lvm) |
| `size` | string | Yes | Disk size in GB (e.g., 10) |

---

#### `proxmox_add_network_vm`

**Description:** Add network interface to QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `net` | string | Yes | Network interface name (net0, net1, net2, etc.) |
| `bridge` | string | Yes | Bridge name (e.g., vmbr0, vmbr1) |
| `model` | unknown | Yes | Network model (virtio, e1000, rtl8139, vmxnet3) |
| `macaddr` | unknown | No | - |
| `vlan` | unknown | No | - |
| `firewall` | unknown | No | - |

---

#### `proxmox_check_vm_feature`

**Description:** Check if a feature (snapshot, clone, copy) is available for a QEMU VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `feature` | enum | Yes | Feature to check (snapshot, clone, copy) |

---

#### `proxmox_clone_vm`

**Description:** Clone a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID to clone from |
| `newid` | number | Yes | New VM ID |
| `name` | unknown | No | - |

---

#### `proxmox_create_template_vm`

**Description:** Convert a QEMU VM to a template (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_create_vm`

**Description:** Create a new QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM will be created |
| `vmid` | number | Yes | VM ID number (must be unique, or use proxmox_get_next_vmid) |
| `name` | unknown | No | - |
| `memory` | unknown | Yes | RAM in MB |
| `cores` | unknown | Yes | Number of CPU cores |
| `sockets` | unknown | Yes | Number of CPU sockets |
| `disk_size` | unknown | Yes | Disk size (e.g., "8G", "10G") |
| `storage` | unknown | Yes | Storage location for disk |
| `iso` | unknown | No | - |
| `ostype` | unknown | Yes | OS type (l26=Linux 2.6+, win10, etc) |
| `net0` | unknown | Yes | Network interface config |

---

#### `proxmox_delete_vm`

**Description:** Delete a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_dump_cloudinit`

**Description:** Dump rendered cloud-init config (user-data, network-config, or meta-data) for a QEMU VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `type` | enum | Yes | Cloud-init config type to dump (user, network, or meta) |

---

#### `proxmox_execute_vm_command`

**Description:** Execute a shell command on a QEMU VM via guest agent (requires QEMU Guest Agent; LXC unsupported)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `command` | string | Yes | Shell command to execute |
| `type` | unknown | Yes | VM type |

---

#### `proxmox_get_cloudinit_config`

**Description:** Get cloud-init configuration items for a QEMU VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_get_storage`

**Description:** List all storage pools and their usage across the cluster

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | unknown | No | - |

---

#### `proxmox_get_vm_config`

**Description:** Get hardware configuration for a QEMU VM (disks, network, CPU, memory)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_get_vm_pending`

**Description:** Get pending configuration changes for a QEMU VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_get_vm_rrddata`

**Description:** Get performance metrics (RRD data) for a QEMU VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `timeframe` | unknown | No | - |
| `cf` | unknown | No | - |

---

#### `proxmox_get_vm_status`

**Description:** Get detailed status information for a specific VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `type` | unknown | Yes | VM type |

---

#### `proxmox_get_vms`

**Description:** List all virtual machines across the cluster with their status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | unknown | No | - |
| `type` | unknown | Yes | VM type filter |

---

#### `proxmox_list_templates`

**Description:** List available LXC container templates on a storage

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | unknown | Yes | Storage name (e.g., local) |

---

#### `proxmox_move_disk_vm`

**Description:** Move a QEMU VM disk to different storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `disk` | string | Yes | Disk name to move (e.g., scsi0, virtio0, sata0, ide0) |
| `storage` | string | Yes | Target storage name |
| `delete` | unknown | Yes | Delete source disk after move (default: true) |

---

#### `proxmox_pause_vm`

**Description:** Pause a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_reboot_vm`

**Description:** Reboot a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_regenerate_cloudinit`

**Description:** Regenerate the cloud-init drive for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_remove_disk_vm`

**Description:** Remove a disk from a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `disk` | string | Yes | Disk name to remove (e.g., scsi1, virtio1, sata1, ide1) |

---

#### `proxmox_remove_network_vm`

**Description:** Remove network interface from QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `net` | string | Yes | Network interface name to remove (net0, net1, net2, etc.) |

---

#### `proxmox_resize_disk_vm`

**Description:** Resize a QEMU VM disk (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `disk` | string | Yes | Disk name (e.g., scsi0, virtio0, sata0, ide0) |
| `size` | string | Yes | New size with + for relative or absolute (e.g., +10G or 50G) |

---

#### `proxmox_resize_vm`

**Description:** Resize a QEMU VM CPU/memory (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `memory` | unknown | No | - |
| `cores` | unknown | No | - |

---

#### `proxmox_resume_vm`

**Description:** Resume a paused QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_shutdown_vm`

**Description:** Gracefully shutdown a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_start_vm`

**Description:** Start a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_stop_vm`

**Description:** Stop a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

---

#### `proxmox_update_network_vm`

**Description:** Update/modify VM network interface configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `net` | string | Yes | Network interface name to update (net0, net1, net2, etc.) |
| `bridge` | unknown | No | - |
| `model` | unknown | No | - |
| `macaddr` | unknown | No | - |
| `vlan` | unknown | No | - |
| `firewall` | unknown | No | - |

---

