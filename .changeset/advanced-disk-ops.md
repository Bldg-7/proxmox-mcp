---
"@bldg-7/proxmox-mcp": minor
---

Add advanced disk operation tools for GPT initialization, disk wiping, LVM thin pools, and directory management

- Add `proxmox_init_disk_gpt` - Initialize disk with GPT partition table
- Add `proxmox_wipe_disk` - Wipe disk signatures
- Add `proxmox_get_node_lvmthin` - List LVM thin pools on node
- Add `proxmox_get_node_directory` - List directory storage on node

Tool count: 278 → 282
Tests: 734 → 740 (+6)
