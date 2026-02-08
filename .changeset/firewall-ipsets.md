---
"@bldg-7/proxmox-mcp": minor
---

Add cluster firewall IP set and entry CRUD tools

Implements 7 new tools for cluster firewall IP set management:
- `proxmox_list_cluster_firewall_ipsets` - List all IP sets
- `proxmox_create_cluster_firewall_ipset` - Create IP set (elevated)
- `proxmox_delete_cluster_firewall_ipset` - Delete IP set (elevated)
- `proxmox_list_cluster_firewall_ipset_entries` - List entries in an IP set
- `proxmox_add_cluster_firewall_ipset_entry` - Add entry to IP set (elevated)
- `proxmox_update_cluster_firewall_ipset_entry` - Update entry (elevated)
- `proxmox_delete_cluster_firewall_ipset_entry` - Delete entry (elevated)

Tool count: 253 → 260
