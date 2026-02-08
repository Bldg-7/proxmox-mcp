---
"@bldg-7/proxmox-mcp": minor
---

Add cluster firewall options, macros, and refs tools

Implements 4 new tools for cluster-level firewall management:
- `proxmox_get_cluster_firewall_options` - Get cluster firewall options
- `proxmox_update_cluster_firewall_options` - Update cluster firewall options (elevated)
- `proxmox_list_cluster_firewall_macros` - List available firewall macros
- `proxmox_list_cluster_firewall_refs` - List firewall references (aliases/ipsets)

Tool count: 244 → 248
