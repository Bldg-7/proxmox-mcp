---
'@bldg-7/proxmox-mcp': patch
---

Fix MCP tools capability advertisement to include `listChanged: true`.

This ensures MCP clients properly recognize and display the server's tool catalog during capability negotiation. Without this, some clients may not show tools even when the `tools/list` response contains them.
