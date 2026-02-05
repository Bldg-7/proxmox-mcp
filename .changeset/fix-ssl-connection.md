---
"@bldg-7/proxmox-mcp": patch
---

Fix SSL/TLS connection for self-signed certificates

- Replace `https.Agent` with `undici.Agent` for proper SSL handling with native `fetch()`
- Node.js native `fetch()` ignores the `agent` option; must use `dispatcher` with undici
- Change env var from `PROXMOX_SSL_VERIFY` to `PROXMOX_SSL_MODE` (values: strict, verify, insecure)
- Default SSL mode is now `strict` (validates certificates)
- Use `PROXMOX_SSL_MODE=insecure` for self-signed certificates
