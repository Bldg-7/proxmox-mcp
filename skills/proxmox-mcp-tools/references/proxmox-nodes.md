# Proxmox Nodes & Cluster

> Node management, cluster status, network configuration, system operations, console access, and node services.

**Tools in this file:** 47  
**Generated:** 2026-02-08T04:04:42.008Z

---

## Tools

#### `proxmox_apply_network_config`

**Description:** Apply or revert pending network changes on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `revert` | unknown | No | - |

---

#### `proxmox_apt_update`

**Description:** Update APT package lists (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_apt_upgrade`

**Description:** Upgrade packages via APT (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_apt_versions`

**Description:** List installed/upgradable APT package versions

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `package` | unknown | No | - |

---

#### `proxmox_control_node_service`

**Description:** Start/stop/restart a system service on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `service` | string | Yes | Service name (e.g., pveproxy, ssh, pvedaemon) |
| `command` | enum | Yes | Service command |

---

#### `proxmox_create_network_iface`

**Description:** Create a network interface on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `iface` | string | Yes | Interface name (e.g., vmbr0, bond0, eth0.100) |
| `type` | string | Yes | Interface type (bridge, bond, vlan, eth, OVSBridge, OVSBond, OVSIntPort, OVSPort) |
| `autostart` | unknown | No | - |
| `method` | unknown | No | - |
| `address` | unknown | No | - |
| `netmask` | unknown | No | - |
| `gateway` | unknown | No | - |
| `cidr` | unknown | No | - |
| `mtu` | unknown | No | - |
| `comment` | unknown | No | - |
| `bridge_ports` | unknown | No | - |
| `bridge_stp` | unknown | No | - |
| `bridge_fd` | unknown | No | - |
| `bond_mode` | unknown | No | - |
| `bond_xmit_hash_policy` | unknown | No | - |
| `bond_miimon` | unknown | No | - |
| `bond_primary` | unknown | No | - |
| `bond_slaves` | unknown | No | - |
| `vlan-id` | unknown | No | - |
| `vlan-raw-device` | unknown | No | - |

---

#### `proxmox_delete_network_iface`

**Description:** Delete a network interface on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `iface` | string | Yes | Interface name to delete (e.g., vmbr0, bond0, eth0.100) |
| `digest` | unknown | No | - |

---

#### `proxmox_delete_node_subscription`

**Description:** Delete subscription information for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_cluster_status`

**Description:** Get overall cluster status including nodes and resource usage

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_lxc_term_proxy`

**Description:** Get a terminal proxy ticket for an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

---

#### `proxmox_get_lxc_vnc_proxy`

**Description:** Get a VNC proxy ticket for an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

---

#### `proxmox_get_network_iface`

**Description:** Get details for a specific network interface on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name (e.g., eth0, vmbr0, bond0) |

---

#### `proxmox_get_next_vmid`

**Description:** Get the next available VM/Container ID number

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_node_aplinfo`

**Description:** List available appliance templates on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_dns`

**Description:** Get DNS configuration for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_hosts`

**Description:** Get hosts file entries for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_journal`

**Description:** Read systemd journal entries from a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_netstat`

**Description:** Get network connection statistics for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_network`

**Description:** Get network interfaces for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `type` | unknown | No | - |

---

#### `proxmox_get_node_replication_log`

**Description:** Get node replication job log

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_get_node_replication_status`

**Description:** Get node replication job status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_get_node_report`

**Description:** Get node diagnostic report with system information

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_rrddata`

**Description:** Get node RRD performance metrics (CPU, memory, disk I/O)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `timeframe` | unknown | No | - |
| `cf` | unknown | No | - |

---

#### `proxmox_get_node_services`

**Description:** List system services on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_status`

**Description:** Get detailed status information for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name (e.g., pve1, proxmox-node2) |

---

#### `proxmox_get_node_subscription`

**Description:** Get subscription information for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_syslog`

**Description:** Read syslog entries from a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_task`

**Description:** Get status details for a specific Proxmox node task

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `upid` | string | Yes | Task UPID |

---

#### `proxmox_get_node_tasks`

**Description:** List recent tasks for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_node_time`

**Description:** Get node time and timezone information

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_get_nodes`

**Description:** List all Proxmox cluster nodes with their status and resources

**Permission:** basic

**Parameters:** None

---

#### `proxmox_get_spice_proxy`

**Description:** Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

---

#### `proxmox_get_storage_rrddata`

**Description:** Get storage RRD performance metrics (read/write throughput, usage)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name |
| `timeframe` | unknown | No | - |
| `cf` | unknown | No | - |

---

#### `proxmox_get_term_proxy`

**Description:** Get a terminal proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

---

#### `proxmox_get_vnc_proxy`

**Description:** Get a VNC proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

---

#### `proxmox_migrate_all`

**Description:** Migrate all VMs/containers to another node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `target` | string | Yes | Target node name |
| `maxworkers` | unknown | No | - |
| `with-local-disks` | unknown | No | - |

---

#### `proxmox_node_reboot`

**Description:** Reboot a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_shutdown`

**Description:** Shutdown a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_node_wakeonlan`

**Description:** Wake a node via Wake-on-LAN (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_schedule_node_replication`

**Description:** Schedule immediate node replication (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | string | Yes | Replication job ID |

---

#### `proxmox_set_node_subscription`

**Description:** Set subscription information for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `key` | string | Yes | Subscription key |

---

#### `proxmox_start_all`

**Description:** Start all VMs/containers on a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_stop_all`

**Description:** Stop all VMs/containers on a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

---

#### `proxmox_update_network_iface`

**Description:** Update a network interface on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `iface` | string | Yes | Interface name to update (e.g., vmbr0, bond0, eth0.100) |
| `type` | unknown | No | - |
| `autostart` | unknown | No | - |
| `method` | unknown | No | - |
| `address` | unknown | No | - |
| `netmask` | unknown | No | - |
| `gateway` | unknown | No | - |
| `cidr` | unknown | No | - |
| `mtu` | unknown | No | - |
| `comment` | unknown | No | - |
| `bridge_ports` | unknown | No | - |
| `bridge_stp` | unknown | No | - |
| `bridge_fd` | unknown | No | - |
| `bond_mode` | unknown | No | - |
| `bond_xmit_hash_policy` | unknown | No | - |
| `bond_miimon` | unknown | No | - |
| `bond_primary` | unknown | No | - |
| `bond_slaves` | unknown | No | - |
| `vlan-id` | unknown | No | - |
| `vlan-raw-device` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_node_dns`

**Description:** Update DNS configuration on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `search` | unknown | No | - |
| `dns1` | unknown | No | - |
| `dns2` | unknown | No | - |
| `dns3` | unknown | No | - |
| `delete` | unknown | No | - |

---

#### `proxmox_update_node_hosts`

**Description:** Add/update a hosts entry on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `ip` | string | Yes | IP address |
| `name` | string | Yes | Hostname or alias |
| `comment` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_node_time`

**Description:** Update node time or timezone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `time` | unknown | No | - |
| `timezone` | unknown | No | - |

---

