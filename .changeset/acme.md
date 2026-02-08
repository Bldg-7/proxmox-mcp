---
"@bldg-7/proxmox-mcp": minor
---

Add ACME account, plugin, and directory management tools

- Add `proxmox_list_acme_accounts` - List ACME accounts
- Add `proxmox_get_acme_account` - Get ACME account details
- Add `proxmox_create_acme_account` - Create ACME account (elevated, contact redacted)
- Add `proxmox_update_acme_account` - Update ACME account (elevated, contact redacted)
- Add `proxmox_delete_acme_account` - Delete ACME account (elevated)
- Add `proxmox_list_acme_plugins` - List ACME DNS plugins
- Add `proxmox_get_acme_plugin` - Get ACME plugin details
- Add `proxmox_get_acme_directories` - Get ACME CA directories

New domain files created:
- src/tools/acme.ts
- src/schemas/acme.ts
- src/tools/acme.test.ts

Tool count: 294 → 302
Tests: 767 → 791 (+24)
