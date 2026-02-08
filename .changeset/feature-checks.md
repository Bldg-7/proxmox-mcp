---
"@bldg-7/proxmox-mcp": minor
---

Add VM and LXC feature check tools

Implements 2 new tools for checking feature availability:
- `proxmox_check_vm_feature` - Check if feature is available for QEMU VMs
- `proxmox_check_lxc_feature` - Check if feature is available for LXC containers

Features: snapshot, clone, copy

Tool count: 276 → 278
