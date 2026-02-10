---
"@bldg-7/proxmox-mcp": major
---

BREAKING CHANGE: Consolidate 309 tools to 91 tools

- VM/LXC tool pairs merged with `type` parameter (vm|lxc)
- CRUD tool groups merged with `action` parameter
- Guest agent tools merged with `operation` parameter
- See MIGRATION.md for complete old→new tool mapping
