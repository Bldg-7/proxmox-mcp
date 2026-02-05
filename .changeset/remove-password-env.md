---
"@bldg-7/proxmox-mcp": patch
---

docs: remove unused PROXMOX_PASSWORD from documentation

The codebase only uses API token authentication (PROXMOX_TOKEN_NAME and PROXMOX_TOKEN_VALUE), not password authentication. Updated README.md and README_ko.md to reflect the actual required environment variables.
