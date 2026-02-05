---
"@bldg-7/proxmox-mcp": patch
---

fix: only use pino-pretty in development mode

Changed condition from `NODE_ENV !== 'production'` to `NODE_ENV === 'development'` to prevent pino-pretty from being used when NODE_ENV is undefined.
