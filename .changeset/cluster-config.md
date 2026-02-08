---
"@bldg-7/proxmox-mcp": minor
---

Add cluster configuration management tools

- Add `proxmox_get_cluster_config` - Get cluster configuration
- Add `proxmox_list_cluster_config_nodes` - List cluster nodes
- Add `proxmox_get_cluster_config_node` - Get specific node configuration
- Add `proxmox_join_cluster` - Join node to cluster (elevated, password redacted)
- Add `proxmox_get_cluster_totem` - Get totem configuration

Tool count: 282 → 287
Tests: 740 → 746 (+6)
