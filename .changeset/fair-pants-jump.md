---
'@bldg-7/proxmox-mcp': patch
---

Fix MCP startup metadata to report the package version from `package.json` instead of a stale hardcoded value.

Also update startup logging to report the current registered tool count dynamically and emit a clear warning when `NODE_TLS_REJECT_UNAUTHORIZED=0` is set.
