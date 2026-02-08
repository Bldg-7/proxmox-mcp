---
"@bldg-7/proxmox-mcp": minor
---

Add notification target CRUD and test tools

- Add `proxmox_list_notification_targets` - List all notification targets
- Add `proxmox_get_notification_target` - Get notification target configuration
- Add `proxmox_create_notification_target` - Create notification target (elevated)
- Add `proxmox_delete_notification_target` - Delete notification target (elevated)
- Add `proxmox_test_notification_target` - Test notification target (elevated)

Supports SMTP, Gotify, and Sendmail notification types with type discriminator.

New domain files created:
- src/tools/notifications.ts
- src/schemas/notifications.ts
- src/tools/notifications.test.ts

Tool count: 302 → 307 (FINAL TARGET REACHED!)
Tests: 791 → 808 (+17)

This completes the remaining-api-endpoints implementation plan.
