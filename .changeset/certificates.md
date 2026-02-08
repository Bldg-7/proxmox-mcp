---
"@bldg-7/proxmox-mcp": minor
---

Add node certificate and ACME certificate management tools

- Add `proxmox_get_node_certificates` - Get node SSL certificate information
- Add `proxmox_upload_custom_certificate` - Upload custom SSL certificate (elevated)
- Add `proxmox_delete_custom_certificate` - Delete custom SSL certificate (elevated)
- Add `proxmox_order_acme_certificate` - Order ACME/Let's Encrypt certificate (elevated)
- Add `proxmox_renew_acme_certificate` - Renew ACME certificate (elevated)
- Add `proxmox_revoke_acme_certificate` - Revoke ACME certificate (elevated)
- Add `proxmox_get_node_acme_config` - Get node ACME configuration

New domain files created:
- src/tools/certificate.ts
- src/schemas/certificate.ts
- src/tools/certificate.test.ts

Tool count: 287 → 294
Tests: 746 → 767 (+21)
