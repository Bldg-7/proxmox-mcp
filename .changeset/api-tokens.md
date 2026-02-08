---
"@bldg-7/proxmox-mcp": minor
---

Add user API token CRUD tools

Implements 5 new tools for user API token management:
- `proxmox_list_user_tokens` - List all API tokens for a user
- `proxmox_get_user_token` - Get specific token info
- `proxmox_create_user_token` - Create new API token (elevated, displays one-time value)
- `proxmox_update_user_token` - Update token metadata (elevated)
- `proxmox_delete_user_token` - Delete API token (elevated)

Tool count: 260 → 265
