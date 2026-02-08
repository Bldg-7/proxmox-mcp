---
"@bldg-7/proxmox-mcp": minor
---

Add node power management tools (shutdown, reboot, wake-on-lan)

Implements 3 new tools for node power management:
- `proxmox_node_shutdown` - Shut down a node (elevated)
- `proxmox_node_reboot` - Reboot a node (elevated)
- `proxmox_node_wakeonlan` - Wake a node via WOL (elevated)

Tool count: 265 → 268
