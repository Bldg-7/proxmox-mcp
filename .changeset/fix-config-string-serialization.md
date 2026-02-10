---
"@bldg-7/proxmox-mcp": patch
---

fix: add z.preprocess() to config parameters to handle Claude MCP client serialization bug

Claude Code and Claude Desktop have a known bug (anthropics/claude-code#18260) where nested
object parameters in MCP tool calls are serialized as JSON strings instead of native objects.
This causes `Expected object, received string` validation errors on `config` fields.

This patch adds defensive `z.preprocess()` wrappers to all 4 `config` record fields
(guestConfigUpdateSchema, updateVmConfigSchema, updateLxcConfigSchema) that auto-parse
JSON strings back to objects before Zod validation.
