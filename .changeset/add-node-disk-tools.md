---
"@bldg-7/proxmox-mcp": minor
---

Add node-level disk query tools

- `proxmox_get_node_disks`: List physical disks (SSD, HDD, NVMe) with health status
- `proxmox_get_disk_smart`: Get SMART health data for a specific disk
- `proxmox_get_node_lvm`: List LVM volume groups and physical volumes
- `proxmox_get_node_zfs`: List ZFS pools with health and capacity
- All tools are read-only and do not require elevated permissions
- Tool count: 57 → 61
