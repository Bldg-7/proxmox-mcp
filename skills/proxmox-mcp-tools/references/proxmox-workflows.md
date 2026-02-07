# Proxmox MCP Workflows

> Common multi-step workflows for managing Proxmox resources via MCP

---

## VM Lifecycle

### Complete VM Creation and Management

**Workflow**: Create → Configure → Start → Monitor → Backup → Stop → Delete

```
1. Get next available VMID
   proxmox_get_next_vmid()

2. Create VM
   proxmox_create_vm({
     node: "pve1",
     vmid: 100,
     name: "my-vm",
     memory: 2048,
     cores: 2,
     sockets: 1
   })

3. Add disk
   proxmox_add_disk_vm({
     node: "pve1",
     vmid: 100,
     disk: "scsi0",
     storage: "local-lvm",
     size: "32"
   })

4. Add network interface
   proxmox_add_network_vm({
     node: "pve1",
     vmid: 100,
     net: "net0",
     bridge: "vmbr0",
     model: "virtio"
   })

5. Start VM
   proxmox_start_vm({
     node: "pve1",
     vmid: 100
   })

6. Monitor status
   proxmox_get_vm_status({
     node: "pve1",
     vmid: 100
   })

7. Create backup
   proxmox_create_backup({
     node: "pve1",
     vmid: 100,
     storage: "local",
     mode: "snapshot",
     compress: "zstd"
   })

8. Stop VM (when done)
   proxmox_stop_vm({
     node: "pve1",
     vmid: 100
   })

9. Delete VM (if needed)
   proxmox_delete_vm({
     node: "pve1",
     vmid: 100
   })
```

---

## LXC Lifecycle

### Complete LXC Container Creation and Management

**Workflow**: Create (with networking) → Configure guest OS → Start → Monitor

**⚠️ Important**: The `net0` parameter creates a veth interface in Proxmox, but the guest OS must configure its own networking (DHCP client or static IP via netplan/interfaces).

```
1. Get next available VMID
   proxmox_get_next_vmid()

2. Create LXC container with network
   proxmox_create_lxc({
     node: "pve1",
     vmid: 200,
     ostemplate: "local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst",
     hostname: "my-container",
     memory: 1024,
     rootfs: "local-lvm:8",
     net0: "name=eth0,bridge=vmbr0,ip=dhcp"
   })

3. Start container
   proxmox_start_lxc({
     node: "pve1",
     vmid: 200
   })

4. Configure guest networking (via console or SSH)
   # For DHCP (most common):
   # Container should auto-configure via DHCP client
   
   # For static IP, edit /etc/netplan/01-netcfg.yaml or /etc/network/interfaces
   # inside the container

5. Monitor status
   proxmox_get_lxc_status({
     node: "pve1",
     vmid: 200
   })

6. Add mount point (if needed)
   proxmox_add_mountpoint_lxc({
     node: "pve1",
     vmid: 200,
     mp: "mp0",
     storage: "local-lvm",
     size: "10"
   })
```

**Note**: LXC command execution via API is not supported. Use `pct exec` via SSH for direct command execution inside containers.

---

## Cluster Operations

### High Availability (HA) Setup

**Workflow**: Create HA resource → Configure group → Monitor

```
1. Create HA resource for VM
   proxmox_create_ha_resource({
     sid: "vm:100",
     type: "vm",
     group: "production",
     state: "started"
   })

2. Get HA status
   proxmox_get_ha_resource({
     sid: "vm:100"
   })

3. Update HA state
   proxmox_update_ha_resource({
     sid: "vm:100",
     state: "started"
   })
```

### VM Migration

**Workflow**: Check target node → Migrate → Verify

```
1. Check target node resources
   proxmox_get_node_status({
     node: "pve2"
   })

2. Migrate VM (online migration)
   proxmox_migrate_vm({
     node: "pve1",
     vmid: 100,
     target: "pve2",
     online: true
   })

3. Monitor migration task
   proxmox_get_node_tasks({
     node: "pve1"
   })

4. Verify VM on new node
   proxmox_get_vm_status({
     node: "pve2",
     vmid: 100
   })
```

### Replication Setup

**Workflow**: Create replication job → Monitor

```
1. Create replication job
   proxmox_create_replication({
     id: "100-0",
     type: "local",
     target: "pve2",
     guest: 100,
     schedule: "*/15"
   })

2. Get replication status
   proxmox_get_replication({
     id: "100-0"
   })

3. List all replications
   proxmox_list_replications()
```

---

## Storage Management

### Storage Creation and ISO Upload

**Workflow**: Create storage → Upload ISO → Attach to VM

```
1. Create storage
   proxmox_create_storage({
     storage: "nfs-storage",
     type: "nfs",
     server: "192.168.1.100",
     export: "/mnt/pve",
     content: "images,iso"
   })

2. List available storage
   proxmox_list_storage()

3. Upload ISO (via external tool, then verify)
   proxmox_list_storage_content({
     node: "pve1",
     storage: "local",
     content: "iso"
   })

4. Create VM with ISO
   proxmox_create_vm({
     node: "pve1",
     vmid: 101,
     name: "vm-from-iso",
     cdrom: "local:iso/ubuntu-22.04-server.iso",
     boot: "order=scsi0;ide2"
   })
```

---

## Snapshot and Backup Patterns

### Snapshot Workflow

**Workflow**: Create snapshot → List snapshots → Rollback (if needed) → Delete

```
1. Create snapshot
   proxmox_create_snapshot({
     node: "pve1",
     vmid: 100,
     snapname: "before-upgrade",
     description: "Snapshot before system upgrade"
   })

2. List snapshots
   proxmox_list_snapshots({
     node: "pve1",
     vmid: 100
   })

3. Rollback to snapshot (if needed)
   proxmox_rollback_snapshot({
     node: "pve1",
     vmid: 100,
     snapname: "before-upgrade"
   })

4. Delete snapshot (when no longer needed)
   proxmox_delete_snapshot({
     node: "pve1",
     vmid: 100,
     snapname: "before-upgrade"
   })
```

### Backup Workflow

**Workflow**: Create backup → List backups → Restore (if needed)

```
1. Create backup
   proxmox_create_backup({
     node: "pve1",
     vmid: 100,
     storage: "local",
     mode: "snapshot",
     compress: "zstd"
   })

2. List backups
   proxmox_list_backups({
     node: "pve1",
     vmid: 100
   })

3. Restore from backup (if needed)
   proxmox_restore_backup({
     node: "pve1",
     vmid: 100,
     archive: "local:backup/vzdump-qemu-100-2024_02_06-12_00_00.vma.zst",
     storage: "local-lvm"
   })
```

---

## Network Configuration

### Bridge and VLAN Setup

**Workflow**: Get network interfaces → Configure bridge → Apply changes

```
1. List network interfaces
   proxmox_get_node_network({
     node: "pve1"
   })

2. Get specific interface details
   proxmox_get_network_iface({
     node: "pve1",
     iface: "vmbr0"
   })

3. Create VLAN interface
   proxmox_create_network_iface({
     node: "pve1",
     iface: "vmbr0.100",
     type: "vlan",
     vlan-id: 100,
     vlan-raw-device: "vmbr0"
   })

4. Apply network changes
   proxmox_apply_network_changes({
     node: "pve1"
   })
```

---

## Monitoring and Maintenance

### System Health Check

**Workflow**: Check nodes → Check VMs → Check storage → Check tasks

```
1. List all nodes
   proxmox_get_nodes()

2. Check node status
   proxmox_get_node_status({
     node: "pve1"
   })

3. List all VMs/containers
   proxmox_list_vms({
     type: "all"
   })

4. Check storage usage
   proxmox_list_storage()

5. Check recent tasks
   proxmox_get_node_tasks({
     node: "pve1"
   })

6. Check system logs
   proxmox_get_node_syslog({
     node: "pve1"
   })
```

---

## Key Workflow Patterns

### Error Handling Pattern

```
1. Attempt operation
2. Check task status via proxmox_get_node_task()
3. If failed, check logs via proxmox_get_node_syslog()
4. Retry or rollback as needed
```

### Resource Cleanup Pattern

```
1. Stop resource (VM/LXC)
2. Remove from HA (if configured)
3. Delete backups (if no longer needed)
4. Delete snapshots
5. Delete resource
```

### Pre-Migration Checklist

```
1. Check target node resources (CPU, memory, storage)
2. Verify network configuration on target
3. Check HA configuration
4. Create snapshot before migration
5. Perform migration
6. Verify on target
7. Delete snapshot if successful
```
