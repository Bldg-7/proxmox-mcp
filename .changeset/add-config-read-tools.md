---
"@bldg-7/proxmox-mcp": minor
---

Add VM/LXC configuration read tools

- `proxmox_get_vm_config`: Read QEMU VM hardware configuration (disks, network, CPU, memory)
- `proxmox_get_lxc_config`: Read LXC container hardware configuration (mount points, network, CPU, memory)
- Both tools are read-only and do not require elevated permissions
- Tool count: 55 → 57
