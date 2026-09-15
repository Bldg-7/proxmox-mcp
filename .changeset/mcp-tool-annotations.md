---
'@bldg-7/proxmox-mcp': minor
---

Advertise MCP tool annotations, titles, and the correct JSON Schema dialect

All 92 tools now ship `annotations` (`readOnlyHint`, `destructiveHint`,
`idempotentHint`, `openWorldHint`) and a human-readable `title` on
`tools/list`. Clients use these hints to decide which calls can run
unattended and which need confirmation — previously every tool looked
alike, so `proxmox_guest_delete` was indistinguishable from
`proxmox_guest_list`. 17 tools are marked read-only, 65 destructive, and
8 open-world (arbitrary in-guest execution, ACME CAs, notification
targets, and remote download sources).

Tool `inputSchema` now keeps its `$schema` declaration. MCP assumes JSON
Schema 2020-12 when `$schema` is absent, but the schemas are generated as
draft-07, so stripping it advertised the wrong dialect. `Tool.inputSchema`
explicitly permits `$schema`.

Also bumps `@modelcontextprotocol/sdk` from 1.25.3 to 1.30.0.
