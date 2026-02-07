# Proxmox MCP Server - Tool Reference

> Model Context Protocol server providing **227 tools** for Proxmox Virtual Environment management.

**Generated:** 2026-02-06T10:53:57.669Z

---

## Quick Links

| Domain | Tools | Description |
|--------|-------|-------------|
| [Proxmox Nodes & Cluster](proxmox-nodes.md) | 38 | Node management, cluster status, network configuration, system operations, console access, and node services. |
| [Proxmox QEMU Virtual Machines](proxmox-vm.md) | 25 | QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring. |
| [Proxmox LXC Containers](proxmox-lxc.md) | 18 | LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring. |
| [Proxmox VM/LXC Shared Operations](proxmox-vm-lxc-shared.md) | 22 | Operations common to both VMs and containers: migration, guest agent, and firewall rules. |
| [Proxmox Snapshots & Backups](proxmox-snapshots-backups.md) | 14 | Snapshot creation/rollback and backup creation/restoration for VMs and containers. |
| [Proxmox Storage](proxmox-storage.md) | 16 | Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools. |
| [Proxmox SDN Networking](proxmox-networking.md) | 20 | Software-Defined Networking: VNets, zones, controllers, and subnets. |
| [Proxmox Cluster Management](proxmox-cluster.md) | 33 | High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options. |
| [Proxmox Access Control](proxmox-access-control.md) | 20 | Users, groups, roles, ACLs, and authentication domains. |
| [Proxmox Ceph Integration](proxmox-ceph.md) | 16 | Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems. |
| [Proxmox Resource Pools](proxmox-pools.md) | 5 | Resource pool management for organizing VMs and containers. |


---

## Overview

This MCP server enables AI agents to manage Proxmox VE through the Model Context Protocol:

- **QEMU VMs**: Create, configure, lifecycle management, snapshots, backups
- **LXC Containers**: Create, configure, lifecycle management
- **Cluster**: HA, replication, migration, backup jobs
- **Storage**: Management, content listing, file operations
- **Networking**: Interfaces, bridges, VLANs, SDN
- **Access Control**: Users, groups, roles, ACLs, domains
- **Ceph**: Storage cluster management
- **Monitoring**: Nodes, services, tasks, logs

## Permission Model

- **Basic**: Read-only operations (list, get, status) - always allowed
- **Elevated**: Create, modify, delete operations - require `PROXMOX_ALLOW_ELEVATED=true`

## Domain Files

### [Proxmox Nodes & Cluster](proxmox-nodes.md)
38 tools - Node management, cluster status, network configuration, system operations, console access, and node services.

### [Proxmox QEMU Virtual Machines](proxmox-vm.md)
25 tools - QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring.

### [Proxmox LXC Containers](proxmox-lxc.md)
18 tools - LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring.

### [Proxmox VM/LXC Shared Operations](proxmox-vm-lxc-shared.md)
22 tools - Operations common to both VMs and containers: migration, guest agent, and firewall rules.

### [Proxmox Snapshots & Backups](proxmox-snapshots-backups.md)
14 tools - Snapshot creation/rollback and backup creation/restoration for VMs and containers.

### [Proxmox Storage](proxmox-storage.md)
16 tools - Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools.

### [Proxmox SDN Networking](proxmox-networking.md)
20 tools - Software-Defined Networking: VNets, zones, controllers, and subnets.

### [Proxmox Cluster Management](proxmox-cluster.md)
33 tools - High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options.

### [Proxmox Access Control](proxmox-access-control.md)
20 tools - Users, groups, roles, ACLs, and authentication domains.

### [Proxmox Ceph Integration](proxmox-ceph.md)
16 tools - Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems.

### [Proxmox Resource Pools](proxmox-pools.md)
5 tools - Resource pool management for organizing VMs and containers.

---

*See individual domain files for complete tool documentation with parameters.*
