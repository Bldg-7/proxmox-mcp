---
"@bldg-7/proxmox-mcp": patch
---

Fix MCP tool schemas for discriminatedUnion-based tools (82 of 92 tools) so properties are exposed at root level instead of being hidden inside anyOf, enabling MCP clients (Claude, GPT, etc.) to correctly discover and pass parameters
