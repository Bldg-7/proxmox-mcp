# Proxmox MCP Server - Tool Reference

> Model Context Protocol server providing **307 tools** for Proxmox Virtual Environment management.

**Generated:** 2026-02-08T04:04:42.008Z

---

## Quick Links

| Domain | Tools | Description |
|--------|-------|-------------|
| [Proxmox Nodes & Cluster](proxmox-nodes.md) | 47 | Node management, cluster status, network configuration, system operations, console access, and node services. |
| [Proxmox QEMU Virtual Machines](proxmox-vm.md) | 30 | QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring. |
| [Proxmox LXC Containers](proxmox-lxc.md) | 20 | LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring. |
| [Proxmox VM/LXC Shared Operations](proxmox-vm-lxc-shared.md) | 36 | Operations common to both VMs and containers: migration, guest agent, and firewall rules. |
| [Proxmox Snapshots & Backups](proxmox-snapshots-backups.md) | 14 | Snapshot creation/rollback and backup creation/restoration for VMs and containers. |
| [Proxmox Storage](proxmox-storage.md) | 20 | Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools. |
| [Proxmox SDN Networking](proxmox-networking.md) | 20 | Software-Defined Networking: VNets, zones, controllers, and subnets. |
| [Proxmox Cluster Management](proxmox-cluster.md) | 54 | High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options. |
| [Proxmox Access Control](proxmox-access-control.md) | 25 | Users, groups, roles, ACLs, and authentication domains. |
| [Proxmox Ceph Integration](proxmox-ceph.md) | 16 | Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems. |
| [Proxmox Resource Pools](proxmox-pools.md) | 5 | Resource pool management for organizing VMs and containers. |
| [Proxmox Certificate Management](proxmox-certificates.md) | 7 | Node certificate management, custom certificate upload, and ACME certificate ordering/renewal. |
| [Proxmox ACME Management](proxmox-acme.md) | 8 | ACME account and plugin management for automated Let's Encrypt certificates. |
| [Proxmox Notification Management](proxmox-notifications.md) | 5 | Notification target management for alerts and system notifications. |


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
47 tools - Node management, cluster status, network configuration, system operations, console access, and node services.

### [Proxmox QEMU Virtual Machines](proxmox-vm.md)
30 tools - QEMU VM creation, lifecycle management, disk operations, network configuration, and performance monitoring.

### [Proxmox LXC Containers](proxmox-lxc.md)
20 tools - LXC container creation, lifecycle management, mount points, network configuration, and performance monitoring.

### [Proxmox VM/LXC Shared Operations](proxmox-vm-lxc-shared.md)
36 tools - Operations common to both VMs and containers: migration, guest agent, and firewall rules.

### [Proxmox Snapshots & Backups](proxmox-snapshots-backups.md)
14 tools - Snapshot creation/rollback and backup creation/restoration for VMs and containers.

### [Proxmox Storage](proxmox-storage.md)
20 tools - Storage configuration, content management, file uploads, disk health monitoring, and LVM/ZFS pools.

### [Proxmox SDN Networking](proxmox-networking.md)
20 tools - Software-Defined Networking: VNets, zones, controllers, and subnets.

### [Proxmox Cluster Management](proxmox-cluster.md)
54 tools - High Availability, cluster firewall, backup jobs, replication jobs, and cluster-wide options.

### [Proxmox Access Control](proxmox-access-control.md)
25 tools - Users, groups, roles, ACLs, and authentication domains.

### [Proxmox Ceph Integration](proxmox-ceph.md)
16 tools - Ceph cluster status, OSDs, monitors, MDS daemons, pools, and filesystems.

### [Proxmox Resource Pools](proxmox-pools.md)
5 tools - Resource pool management for organizing VMs and containers.

### [Proxmox Certificate Management](proxmox-certificates.md)
7 tools - Node certificate management, custom certificate upload, and ACME certificate ordering/renewal.

### [Proxmox ACME Management](proxmox-acme.md)
8 tools - ACME account and plugin management for automated Let's Encrypt certificates.

### [Proxmox Notification Management](proxmox-notifications.md)
5 tools - Notification target management for alerts and system notifications.

---

*See individual domain files for complete tool documentation with parameters.*
