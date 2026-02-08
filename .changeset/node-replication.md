---
"@bldg-7/proxmox-mcp": minor
---

Add node replication status, log, and schedule tools

Implements 3 new tools for node replication management:
- `proxmox_get_node_replication_status` - Get replication job status
- `proxmox_get_node_replication_log` - Get replication job log
- `proxmox_schedule_node_replication` - Trigger immediate replication (elevated)

Tool count: 271 → 274
