---
'@bldg-7/proxmox-mcp': patch
---

Fix tools not visible in Claude Desktop due to missing `type: "object"` in inputSchema.

Tools using `z.discriminatedUnion()` (82 of 91) produced `{ anyOf: [...] }` schemas without a root-level `type: "object"`. The MCP SDK v1.25.3 requires `type: "object"` at the root (hardcoded in `types.ts:1229`), causing clients like Claude Desktop to silently drop these tools.

References:
- https://github.com/modelcontextprotocol/typescript-sdk/issues/685
- https://github.com/modelcontextprotocol/modelcontextprotocol/issues/834 (SEP to relax this constraint)
