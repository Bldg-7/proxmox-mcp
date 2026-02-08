---
"@bldg-7/proxmox-mcp": minor
---

Add cluster firewall alias CRUD tools

Implements 5 new tools for cluster firewall alias management:
- `proxmox_list_cluster_firewall_aliases` - List all cluster firewall aliases
- `proxmox_get_cluster_firewall_alias` - Get specific alias by name
- `proxmox_create_cluster_firewall_alias` - Create new alias (elevated)
- `proxmox_update_cluster_firewall_alias` - Update alias CIDR/comment/rename (elevated)
- `proxmox_delete_cluster_firewall_alias` - Delete alias (elevated)

Tool count: 248 → 253
