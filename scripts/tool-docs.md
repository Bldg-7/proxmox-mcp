# Proxmox MCP Tools Documentation

Generated: 2026-02-06T10:49:51.723Z
Total Tools: 227

## Tools by Category

### Add

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

### Agent

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

#### `proxmox_agent_exec_status`

**Description:** Get status for a QEMU guest agent command

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pid` | number | Yes | Process ID returned by agent exec |

#### `proxmox_agent_get_fsinfo`

**Description:** Get guest filesystem information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_memory_blocks`

**Description:** Get guest memory block information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_network_interfaces`

**Description:** Get guest network interfaces via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_osinfo`

**Description:** Get guest OS information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_time`

**Description:** Get guest time via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_timezone`

**Description:** Get guest timezone via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_get_vcpus`

**Description:** Get guest vCPU information via QEMU guest agent

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_agent_ping`

**Description:** Ping the QEMU guest agent to verify availability

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Apply

#### `proxmox_apply_network_config`

**Description:** Apply or revert pending network changes on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `revert` | unknown | No | - |

### Apt

#### `proxmox_apt_update`

**Description:** Update APT package lists (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_apt_upgrade`

**Description:** Upgrade packages via APT (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_apt_versions`

**Description:** List installed/upgradable APT package versions

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `package` | unknown | No | - |

### Clone

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

### Control

#### `proxmox_control_node_service`

**Description:** Start/stop/restart a system service on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `service` | string | Yes | Service name (e.g., pveproxy, ssh, pvedaemon) |
| `command` | enum | Yes | Service command |

### Create

#### `proxmox_create_backup_lxc`

**Description:** Create a backup of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `storage` | unknown | Yes | Storage location for backup |
| `mode` | unknown | Yes | Backup mode |
| `compress` | unknown | Yes | Compression algorithm |

#### `proxmox_create_backup_vm`

**Description:** Create a backup of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `storage` | unknown | Yes | Storage location for backup |
| `mode` | unknown | Yes | Backup mode |
| `compress` | unknown | Yes | Compression algorithm |

#### `proxmox_create_ceph_fs`

**Description:** Create a Ceph filesystem (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | CephFS name |
| `pool` | unknown | No | - |
| `data_pool` | unknown | No | - |
| `metadata_pool` | unknown | No | - |

#### `proxmox_create_ceph_mds`

**Description:** Create a Ceph MDS daemon (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

#### `proxmox_create_ceph_mon`

**Description:** Create a Ceph monitor (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

#### `proxmox_create_ceph_osd`

**Description:** Create a Ceph OSD (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `dev` | string | Yes | OSD device path (e.g., /dev/sdb) |
| `osdid` | unknown | No | - |
| `dbdev` | unknown | No | - |
| `waldev` | unknown | No | - |
| `crush-device-class` | unknown | No | - |
| `encrypted` | unknown | No | - |

#### `proxmox_create_ceph_pool`

**Description:** Create a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |
| `pg_num` | unknown | No | - |
| `size` | unknown | No | - |
| `min_size` | unknown | No | - |
| `crush_rule` | unknown | No | - |
| `pg_autoscale_mode` | unknown | No | - |

#### `proxmox_create_cluster_backup_job`

**Description:** Create a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `starttime` | string | Yes | Job start time (HH:MM) |
| `dow` | string | Yes | Day of week selection |
| `storage` | string | Yes | Storage identifier |
| `all` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `comment` | unknown | No | - |
| `compress` | unknown | No | - |
| `dumpdir` | unknown | No | - |
| `enabled` | unknown | No | - |
| `exclude` | unknown | No | - |
| `exclude-path` | unknown | No | - |
| `id` | unknown | No | - |
| `ionice` | unknown | No | - |
| `lockwait` | unknown | No | - |
| `mailnotification` | unknown | No | - |
| `mailto` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `mode` | unknown | No | - |
| `node` | unknown | No | - |
| `notes-template` | unknown | No | - |
| `performance` | unknown | No | - |
| `pigz` | unknown | No | - |
| `pool` | unknown | No | - |
| `protected` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `quiet` | unknown | No | - |
| `remove` | unknown | No | - |
| `repeat-missed` | unknown | No | - |
| `script` | unknown | No | - |
| `stdexcludes` | unknown | No | - |
| `stop` | unknown | No | - |
| `stopwait` | unknown | No | - |
| `tmpdir` | unknown | No | - |
| `vmid` | unknown | No | - |
| `zstd` | unknown | No | - |

#### `proxmox_create_cluster_firewall_group`

**Description:** Create a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | unknown | No | - |
| `rename` | unknown | No | - |

#### `proxmox_create_cluster_firewall_rule`

**Description:** Create a cluster-wide firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | Rule action (ACCEPT, REJECT, DROP) |
| `type` | enum | Yes | Rule type |
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

#### `proxmox_create_cluster_replication_job`

**Description:** Create a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID (<guest>-<jobnum>) |
| `target` | string | Yes | Target node name |
| `type` | enum | Yes | Replication type |
| `comment` | unknown | No | - |
| `disable` | unknown | No | - |
| `rate` | unknown | No | - |
| `remove_job` | unknown | No | - |
| `schedule` | unknown | No | - |
| `source` | unknown | No | - |

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

#### `proxmox_create_group`

**Description:** Create a Proxmox group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |
| `comment` | unknown | No | - |
| `users` | unknown | No | - |

#### `proxmox_create_ha_group`

**Description:** Create a new HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `nodes` | string | Yes | Nodes list with optional priorities |
| `comment` | unknown | No | - |
| `nofailback` | unknown | No | - |
| `restricted` | unknown | No | - |
| `type` | unknown | No | - |

#### `proxmox_create_ha_resource`

**Description:** Create a new HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., vm:100, ct:100) |
| `type` | unknown | No | - |
| `comment` | unknown | No | - |
| `failback` | unknown | No | - |
| `group` | unknown | No | - |
| `max_relocate` | unknown | No | - |
| `max_restart` | unknown | No | - |
| `state` | unknown | No | - |

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

#### `proxmox_create_lxc_firewall_rule`

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

#### `proxmox_create_pool`

**Description:** Create a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | unknown | No | - |

#### `proxmox_create_role`

**Description:** Create a Proxmox role (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |
| `privs` | string | Yes | Comma-separated privileges |
| `comment` | unknown | No | - |

#### `proxmox_create_sdn_controller`

**Description:** Create an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |
| `type` | unknown | No | - |
| `ip` | unknown | No | - |
| `port` | unknown | No | - |
| `token` | unknown | No | - |
| `secret` | unknown | No | - |
| `zone` | unknown | No | - |
| `comment` | unknown | No | - |

#### `proxmox_create_sdn_subnet`

**Description:** Create an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |
| `vnet` | unknown | No | - |
| `cidr` | unknown | No | - |
| `gateway` | unknown | No | - |
| `dhcp` | unknown | No | - |
| `snat` | unknown | No | - |
| `dns` | unknown | No | - |
| `mtu` | unknown | No | - |
| `ipam` | unknown | No | - |
| `comment` | unknown | No | - |

#### `proxmox_create_sdn_vnet`

**Description:** Create an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |
| `zone` | unknown | No | - |
| `alias` | unknown | No | - |
| `comment` | unknown | No | - |
| `tag` | unknown | No | - |
| `vlan` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `mtu` | unknown | No | - |
| `mac` | unknown | No | - |
| `ipam` | unknown | No | - |
| `type` | unknown | No | - |

#### `proxmox_create_sdn_zone`

**Description:** Create an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |
| `type` | unknown | No | - |
| `bridge` | unknown | No | - |
| `comment` | unknown | No | - |
| `nodes` | unknown | No | - |
| `mtu` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `tag` | unknown | No | - |
| `ipam` | unknown | No | - |

#### `proxmox_create_snapshot_lxc`

**Description:** Create a snapshot of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |
| `description` | unknown | No | - |

#### `proxmox_create_snapshot_vm`

**Description:** Create a snapshot of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |
| `description` | unknown | No | - |

#### `proxmox_create_storage`

**Description:** Create a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `type` | enum | Yes | Storage type |
| `content` | unknown | No | - |
| `path` | unknown | No | - |
| `server` | unknown | No | - |
| `export` | unknown | No | - |
| `share` | unknown | No | - |
| `username` | unknown | No | - |
| `password` | unknown | No | - |
| `domain` | unknown | No | - |
| `smbversion` | unknown | No | - |
| `nodes` | unknown | No | - |
| `shared` | unknown | No | - |
| `disable` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `pool` | unknown | No | - |
| `vgname` | unknown | No | - |
| `thinpool` | unknown | No | - |
| `monhost` | unknown | No | - |
| `fsname` | unknown | No | - |
| `keyring` | unknown | No | - |
| `portal` | unknown | No | - |
| `target` | unknown | No | - |
| `options` | unknown | No | - |

#### `proxmox_create_template_lxc`

**Description:** Convert an LXC container to a template (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_create_template_vm`

**Description:** Convert a QEMU VM to a template (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

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

#### `proxmox_create_vm_firewall_rule`

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

### Delete

#### `proxmox_delete_backup`

**Description:** Delete a backup file from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage name (e.g., local) |
| `volume` | string | Yes | Backup volume ID (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst) |

#### `proxmox_delete_ceph_mds`

**Description:** Delete a Ceph MDS daemon (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | MDS daemon name |

#### `proxmox_delete_ceph_mon`

**Description:** Delete a Ceph monitor (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `monid` | string | Yes | Monitor ID |

#### `proxmox_delete_ceph_osd`

**Description:** Delete a Ceph OSD (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `id` | number | Yes | OSD ID |

#### `proxmox_delete_ceph_pool`

**Description:** Delete a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |

#### `proxmox_delete_cluster_backup_job`

**Description:** Delete a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

#### `proxmox_delete_cluster_firewall_group`

**Description:** Delete a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

#### `proxmox_delete_cluster_firewall_rule`

**Description:** Delete a cluster firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

#### `proxmox_delete_cluster_replication_job`

**Description:** Delete a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `force` | unknown | No | - |
| `keep` | unknown | No | - |

#### `proxmox_delete_domain`

**Description:** Delete an authentication domain (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

#### `proxmox_delete_group`

**Description:** Delete a Proxmox group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupid` | string | Yes | Group identifier |

#### `proxmox_delete_ha_group`

**Description:** Delete an HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

#### `proxmox_delete_ha_resource`

**Description:** Delete an HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |

#### `proxmox_delete_lxc`

**Description:** Delete an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_delete_lxc_firewall_rule`

**Description:** Delete an LXC firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

#### `proxmox_delete_network_iface`

**Description:** Delete a network interface on a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name to configure |
| `iface` | string | Yes | Interface name to delete (e.g., vmbr0, bond0, eth0.100) |
| `digest` | unknown | No | - |

#### `proxmox_delete_node_subscription`

**Description:** Delete subscription information for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_delete_pool`

**Description:** Delete a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

#### `proxmox_delete_role`

**Description:** Delete a Proxmox role (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleid` | string | Yes | Role identifier |

#### `proxmox_delete_sdn_controller`

**Description:** Delete an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

#### `proxmox_delete_sdn_subnet`

**Description:** Delete an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

#### `proxmox_delete_sdn_vnet`

**Description:** Delete an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

#### `proxmox_delete_sdn_zone`

**Description:** Delete an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

#### `proxmox_delete_snapshot_lxc`

**Description:** Delete a snapshot of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

#### `proxmox_delete_snapshot_vm`

**Description:** Delete a snapshot of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

#### `proxmox_delete_storage`

**Description:** Delete a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

#### `proxmox_delete_storage_content`

**Description:** Delete content from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Volume identifier (volid) |

#### `proxmox_delete_user`

**Description:** Delete a Proxmox user (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., user@pve) |

#### `proxmox_delete_vm`

**Description:** Delete a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_delete_vm_firewall_rule`

**Description:** Delete a VM firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |
| `digest` | unknown | No | - |

### Download

#### `proxmox_download_file_restore`

**Description:** Download a file from backup

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `filepath` | string | Yes | File path inside backup |

#### `proxmox_download_url_to_storage`

**Description:** Download a file from URL to storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `url` | string | Yes | Source URL |
| `content` | enum | Yes | Content type |
| `filename` | unknown | No | - |
| `checksum` | unknown | No | - |
| `checksum-algorithm` | unknown | No | - |
| `verify-certificates` | unknown | No | - |

### Execute

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

### Get

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

#### `proxmox_get_ceph_status`

**Description:** Get Ceph cluster status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_cluster_backup_job`

**Description:** Get a scheduled cluster backup job

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |

#### `proxmox_get_cluster_firewall_group`

**Description:** Get a cluster firewall group by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |

#### `proxmox_get_cluster_firewall_rule`

**Description:** Get a cluster firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | Rule position |

#### `proxmox_get_cluster_options`

**Description:** Get cluster-wide options

**Permission:** basic

**Parameters:** None

#### `proxmox_get_cluster_replication_job`

**Description:** Get a cluster replication job by ID

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |

#### `proxmox_get_cluster_status`

**Description:** Get overall cluster status including nodes and resource usage

**Permission:** basic

**Parameters:** None

#### `proxmox_get_disk_smart`

**Description:** Get SMART health data for a specific disk on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `disk` | string | Yes | Block device path (e.g., /dev/sda) |
| `health_only` | unknown | No | - |

#### `proxmox_get_domain`

**Description:** Get authentication domain details

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `realm` | string | Yes | Auth domain (realm) name |

#### `proxmox_get_ha_group`

**Description:** Get details for a specific HA group

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |

#### `proxmox_get_ha_groups`

**Description:** List High Availability groups in the cluster

**Permission:** basic

**Parameters:** None

#### `proxmox_get_ha_resource`

**Description:** Get details for a specific HA resource

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID (e.g., vm:100, ct:100) |

#### `proxmox_get_ha_resources`

**Description:** List High Availability resources in the cluster

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | unknown | No | - |

#### `proxmox_get_ha_status`

**Description:** Get HA manager status information for the cluster

**Permission:** basic

**Parameters:** None

#### `proxmox_get_lxc_config`

**Description:** Get hardware configuration for an LXC container (mount points, network, CPU, memory)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

#### `proxmox_get_lxc_firewall_rule`

**Description:** Get an LXC firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |

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

#### `proxmox_get_lxc_term_proxy`

**Description:** Get a terminal proxy ticket for an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

#### `proxmox_get_lxc_vnc_proxy`

**Description:** Get a VNC proxy ticket for an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

#### `proxmox_get_network_iface`

**Description:** Get details for a specific network interface on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `iface` | string | Yes | Interface name (e.g., eth0, vmbr0, bond0) |

#### `proxmox_get_next_vmid`

**Description:** Get the next available VM/Container ID number

**Permission:** basic

**Parameters:** None

#### `proxmox_get_node_aplinfo`

**Description:** List available appliance templates on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_disks`

**Description:** List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `include_partitions` | unknown | No | - |
| `skip_smart` | unknown | No | - |
| `type` | unknown | No | - |

#### `proxmox_get_node_dns`

**Description:** Get DNS configuration for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_hosts`

**Description:** Get hosts file entries for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_journal`

**Description:** Read systemd journal entries from a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_lvm`

**Description:** List LVM volume groups and physical volumes on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_netstat`

**Description:** Get network connection statistics for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_network`

**Description:** Get network interfaces for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `type` | unknown | No | - |

#### `proxmox_get_node_services`

**Description:** List system services on a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_status`

**Description:** Get detailed status information for a specific Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name (e.g., pve1, proxmox-node2) |

#### `proxmox_get_node_subscription`

**Description:** Get subscription information for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_syslog`

**Description:** Read syslog entries from a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_task`

**Description:** Get status details for a specific Proxmox node task

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `upid` | string | Yes | Task UPID |

#### `proxmox_get_node_tasks`

**Description:** List recent tasks for a Proxmox node

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_time`

**Description:** Get node time and timezone information

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_node_zfs`

**Description:** List ZFS pools on a Proxmox node with health and capacity info

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_get_nodes`

**Description:** List all Proxmox cluster nodes with their status and resources

**Permission:** basic

**Parameters:** None

#### `proxmox_get_pool`

**Description:** Get a resource pool by ID

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |

#### `proxmox_get_sdn_controller`

**Description:** Get an SDN controller by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

#### `proxmox_get_sdn_subnet`

**Description:** Get an SDN subnet by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

#### `proxmox_get_sdn_vnet`

**Description:** Get an SDN virtual network by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

#### `proxmox_get_sdn_zone`

**Description:** Get an SDN zone by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

#### `proxmox_get_spice_proxy`

**Description:** Get a SPICE proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

#### `proxmox_get_storage`

**Description:** List all storage pools and their usage across the cluster

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | unknown | No | - |

#### `proxmox_get_storage_config`

**Description:** Get a storage configuration by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |

#### `proxmox_get_term_proxy`

**Description:** Get a terminal proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

#### `proxmox_get_user`

**Description:** Get details for a Proxmox user

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userid` | string | Yes | User ID with realm (e.g., root@pam) |

#### `proxmox_get_vm_config`

**Description:** Get hardware configuration for a QEMU VM (disks, network, CPU, memory)

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_get_vm_firewall_rule`

**Description:** Get a VM firewall rule by position

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `pos` | number | Yes | Rule position |

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

#### `proxmox_get_vm_status`

**Description:** Get detailed status information for a specific VM

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `type` | unknown | Yes | VM type |

#### `proxmox_get_vms`

**Description:** List all virtual machines across the cluster with their status

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | unknown | No | - |
| `type` | unknown | Yes | VM type filter |

#### `proxmox_get_vnc_proxy`

**Description:** Get a VNC proxy ticket for a QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where the guest is located |
| `vmid` | number | Yes | VM or container ID |

### List

#### `proxmox_list_backups`

**Description:** List all backups on a storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | unknown | Yes | Storage name |

#### `proxmox_list_ceph_fs`

**Description:** List Ceph filesystems

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_list_ceph_mds`

**Description:** List Ceph MDS daemons

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_list_ceph_mons`

**Description:** List Ceph monitors

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_list_ceph_osds`

**Description:** List Ceph OSDs

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_list_ceph_pools`

**Description:** List Ceph pools

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_list_cluster_backup_jobs`

**Description:** List scheduled cluster backup jobs

**Permission:** basic

**Parameters:** None

#### `proxmox_list_cluster_firewall_groups`

**Description:** List cluster firewall security groups

**Permission:** basic

**Parameters:** None

#### `proxmox_list_cluster_firewall_rules`

**Description:** List cluster-wide firewall rules

**Permission:** basic

**Parameters:** None

#### `proxmox_list_cluster_replication_jobs`

**Description:** List cluster replication jobs

**Permission:** basic

**Parameters:** None

#### `proxmox_list_domains`

**Description:** List authentication domains

**Permission:** basic

**Parameters:** None

#### `proxmox_list_file_restore`

**Description:** List files in a backup for restore

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `volume` | string | Yes | Backup volume identifier |
| `path` | unknown | No | - |

#### `proxmox_list_groups`

**Description:** List Proxmox groups

**Permission:** basic

**Parameters:** None

#### `proxmox_list_lxc_firewall_rules`

**Description:** List per-LXC firewall rules

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_list_pools`

**Description:** List resource pools

**Permission:** basic

**Parameters:** None

#### `proxmox_list_roles`

**Description:** List Proxmox roles

**Permission:** basic

**Parameters:** None

#### `proxmox_list_sdn_controllers`

**Description:** List SDN controllers

**Permission:** basic

**Parameters:** None

#### `proxmox_list_sdn_subnets`

**Description:** List SDN subnets

**Permission:** basic

**Parameters:** None

#### `proxmox_list_sdn_vnets`

**Description:** List SDN virtual networks

**Permission:** basic

**Parameters:** None

#### `proxmox_list_sdn_zones`

**Description:** List SDN zones

**Permission:** basic

**Parameters:** None

#### `proxmox_list_snapshots_lxc`

**Description:** List all snapshots of an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |

#### `proxmox_list_snapshots_vm`

**Description:** List all snapshots of a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_list_storage_config`

**Description:** List storage configurations available in Proxmox

**Permission:** basic

**Parameters:** None

#### `proxmox_list_storage_content`

**Description:** List content stored on a storage

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | unknown | No | - |
| `vmid` | unknown | No | - |

#### `proxmox_list_templates`

**Description:** List available LXC container templates on a storage

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | unknown | Yes | Storage name (e.g., local) |

#### `proxmox_list_users`

**Description:** List Proxmox users

**Permission:** basic

**Parameters:** None

#### `proxmox_list_vm_firewall_rules`

**Description:** List per-VM firewall rules

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Migrate

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

#### `proxmox_migrate_lxc`

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

#### `proxmox_migrate_vm`

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

### Move

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

### Pause

#### `proxmox_pause_vm`

**Description:** Pause a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Prune

#### `proxmox_prune_backups`

**Description:** Prune old backups from storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `keep-last` | unknown | No | - |
| `keep-hourly` | unknown | No | - |
| `keep-daily` | unknown | No | - |
| `keep-weekly` | unknown | No | - |
| `keep-monthly` | unknown | No | - |
| `keep-yearly` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `dry-run` | unknown | No | - |
| `vmid` | unknown | No | - |
| `type` | unknown | No | - |

### Reboot

#### `proxmox_reboot_lxc`

**Description:** Reboot an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_reboot_vm`

**Description:** Reboot a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Remove

#### `proxmox_remove_disk_vm`

**Description:** Remove a disk from a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `disk` | string | Yes | Disk name to remove (e.g., scsi1, virtio1, sata1, ide1) |

#### `proxmox_remove_mountpoint_lxc`

**Description:** Remove a mount point from an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `mp` | string | Yes | Mount point name to remove (e.g., mp0, mp1, mp2) |

#### `proxmox_remove_network_lxc`

**Description:** Remove network interface from LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container is located |
| `vmid` | number | Yes | Container ID number |
| `net` | string | Yes | Network interface name to remove (net0, net1, net2, etc.) |

#### `proxmox_remove_network_vm`

**Description:** Remove network interface from QEMU VM (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |
| `net` | string | Yes | Network interface name to remove (net0, net1, net2, etc.) |

### Resize

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

### Restore

#### `proxmox_restore_backup_lxc`

**Description:** Restore an LXC container from backup (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container will be restored |
| `vmid` | number | Yes | New container ID for restored container |
| `archive` | string | Yes | Backup archive path (e.g., local:backup/vzdump-lxc-100-2025_11_06-09_00_00.tar.zst) |
| `storage` | unknown | No | - |

#### `proxmox_restore_backup_vm`

**Description:** Restore a QEMU virtual machine from backup (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM will be restored |
| `vmid` | number | Yes | New VM ID for restored VM |
| `archive` | string | Yes | Backup archive path (e.g., local:backup/vzdump-qemu-100-2025_11_06-09_00_00.vma.zst) |
| `storage` | unknown | No | - |

### Resume

#### `proxmox_resume_vm`

**Description:** Resume a paused QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Rollback

#### `proxmox_rollback_snapshot_lxc`

**Description:** Rollback an LXC container to a snapshot (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

#### `proxmox_rollback_snapshot_vm`

**Description:** Rollback a QEMU virtual machine to a snapshot (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where container/VM is located |
| `vmid` | number | Yes | Container/VM ID number |
| `snapname` | string | Yes | Snapshot name |

### Set

#### `proxmox_set_node_subscription`

**Description:** Set subscription information for a Proxmox node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `key` | string | Yes | Subscription key |

### Shutdown

#### `proxmox_shutdown_lxc`

**Description:** Gracefully shutdown an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_shutdown_vm`

**Description:** Gracefully shutdown a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Start

#### `proxmox_start_all`

**Description:** Start all VMs/containers on a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_start_lxc`

**Description:** Start an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_start_vm`

**Description:** Start a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Stop

#### `proxmox_stop_all`

**Description:** Stop all VMs/containers on a node (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |

#### `proxmox_stop_lxc`

**Description:** Stop an LXC container (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

#### `proxmox_stop_vm`

**Description:** Stop a QEMU virtual machine (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name where VM is located |
| `vmid` | number | Yes | VM ID number |

### Update

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

#### `proxmox_update_ceph_pool`

**Description:** Update a Ceph pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `name` | string | Yes | Pool name |
| `pg_num` | unknown | No | - |
| `size` | unknown | No | - |
| `min_size` | unknown | No | - |
| `crush_rule` | unknown | No | - |
| `pg_autoscale_mode` | unknown | No | - |

#### `proxmox_update_cluster_backup_job`

**Description:** Update a scheduled cluster backup job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Backup job ID |
| `starttime` | unknown | No | - |
| `dow` | unknown | No | - |
| `storage` | unknown | No | - |
| `all` | unknown | No | - |
| `bwlimit` | unknown | No | - |
| `comment` | unknown | No | - |
| `compress` | unknown | No | - |
| `dumpdir` | unknown | No | - |
| `enabled` | unknown | No | - |
| `exclude` | unknown | No | - |
| `exclude-path` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `ionice` | unknown | No | - |
| `lockwait` | unknown | No | - |
| `mailnotification` | unknown | No | - |
| `mailto` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `mode` | unknown | No | - |
| `node` | unknown | No | - |
| `notes-template` | unknown | No | - |
| `performance` | unknown | No | - |
| `pigz` | unknown | No | - |
| `pool` | unknown | No | - |
| `protected` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `quiet` | unknown | No | - |
| `remove` | unknown | No | - |
| `repeat-missed` | unknown | No | - |
| `script` | unknown | No | - |
| `stdexcludes` | unknown | No | - |
| `stop` | unknown | No | - |
| `stopwait` | unknown | No | - |
| `tmpdir` | unknown | No | - |
| `vmid` | unknown | No | - |
| `zstd` | unknown | No | - |

#### `proxmox_update_cluster_firewall_group`

**Description:** Update a cluster firewall group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | Firewall group name |
| `comment` | unknown | No | - |
| `rename` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

#### `proxmox_update_cluster_firewall_rule`

**Description:** Update a cluster firewall rule (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
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

#### `proxmox_update_cluster_options`

**Description:** Update cluster-wide options (requires elevated permissions)

**Permission:** elevated

**Parameters:** None

#### `proxmox_update_cluster_replication_job`

**Description:** Update a cluster replication job (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Replication job ID |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `disable` | unknown | No | - |
| `rate` | unknown | No | - |
| `remove_job` | unknown | No | - |
| `schedule` | unknown | No | - |
| `source` | unknown | No | - |

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

#### `proxmox_update_ha_group`

**Description:** Update an HA group (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA group identifier |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `nodes` | unknown | No | - |
| `nofailback` | unknown | No | - |
| `restricted` | unknown | No | - |

#### `proxmox_update_ha_resource`

**Description:** Update an HA resource (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA resource ID |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |
| `failback` | unknown | No | - |
| `group` | unknown | No | - |
| `max_relocate` | unknown | No | - |
| `max_restart` | unknown | No | - |
| `state` | unknown | No | - |

#### `proxmox_update_lxc_firewall_rule`

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

#### `proxmox_update_node_time`

**Description:** Update node time or timezone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `time` | unknown | No | - |
| `timezone` | unknown | No | - |

#### `proxmox_update_pool`

**Description:** Update a resource pool (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `poolid` | string | Yes | Pool identifier |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

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

#### `proxmox_update_sdn_controller`

**Description:** Update an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |
| `type` | unknown | No | - |
| `ip` | unknown | No | - |
| `port` | unknown | No | - |
| `token` | unknown | No | - |
| `secret` | unknown | No | - |
| `zone` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

#### `proxmox_update_sdn_subnet`

**Description:** Update an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |
| `vnet` | unknown | No | - |
| `cidr` | unknown | No | - |
| `gateway` | unknown | No | - |
| `dhcp` | unknown | No | - |
| `snat` | unknown | No | - |
| `dns` | unknown | No | - |
| `mtu` | unknown | No | - |
| `ipam` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

#### `proxmox_update_sdn_vnet`

**Description:** Update an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |
| `zone` | unknown | No | - |
| `alias` | unknown | No | - |
| `comment` | unknown | No | - |
| `tag` | unknown | No | - |
| `vlan` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `mtu` | unknown | No | - |
| `mac` | unknown | No | - |
| `ipam` | unknown | No | - |
| `type` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

#### `proxmox_update_sdn_zone`

**Description:** Update an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |
| `type` | unknown | No | - |
| `bridge` | unknown | No | - |
| `comment` | unknown | No | - |
| `nodes` | unknown | No | - |
| `mtu` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `tag` | unknown | No | - |
| `ipam` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

#### `proxmox_update_storage`

**Description:** Update a storage configuration (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | Storage identifier |
| `content` | unknown | No | - |
| `path` | unknown | No | - |
| `server` | unknown | No | - |
| `export` | unknown | No | - |
| `share` | unknown | No | - |
| `username` | unknown | No | - |
| `password` | unknown | No | - |
| `domain` | unknown | No | - |
| `smbversion` | unknown | No | - |
| `nodes` | unknown | No | - |
| `shared` | unknown | No | - |
| `disable` | unknown | No | - |
| `maxfiles` | unknown | No | - |
| `prune-backups` | unknown | No | - |
| `pool` | unknown | No | - |
| `vgname` | unknown | No | - |
| `thinpool` | unknown | No | - |
| `monhost` | unknown | No | - |
| `fsname` | unknown | No | - |
| `keyring` | unknown | No | - |
| `portal` | unknown | No | - |
| `target` | unknown | No | - |
| `options` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

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

#### `proxmox_update_vm_firewall_rule`

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

### Upload

#### `proxmox_upload_to_storage`

**Description:** Upload ISO/template to storage (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | Node name |
| `storage` | string | Yes | Storage identifier |
| `content` | enum | Yes | Upload content type |
| `filename` | string | Yes | Filename to upload |
| `checksum` | unknown | No | - |
| `checksum-algorithm` | unknown | No | - |

