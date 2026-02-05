# @bldg-7/proxmox-mcp

## 0.1.5

### Patch Changes

- 5527195: Fix SSL/TLS connection for self-signed certificates

  - Replace `https.Agent` with `undici.Agent` for proper SSL handling with native `fetch()`
  - Node.js native `fetch()` ignores the `agent` option; must use `dispatcher` with undici
  - Change env var from `PROXMOX_SSL_VERIFY` to `PROXMOX_SSL_MODE` (values: strict, verify, insecure)
  - Default SSL mode is now `strict` (validates certificates)
  - Use `PROXMOX_SSL_MODE=insecure` for self-signed certificates

## 0.1.4

### Patch Changes

- Fix pino logger writing to stdout instead of stderr, which broke MCP JSON-RPC communication

## 0.1.3

### Patch Changes

- 97c47c3: fix: only use pino-pretty in development mode

  Changed condition from `NODE_ENV !== 'production'` to `NODE_ENV === 'development'` to prevent pino-pretty from being used when NODE_ENV is undefined.

## 0.1.2

### Patch Changes

- e056ec9: chore: upgrade Node.js requirement to v24 for npm provenance support

## 0.1.1

### Patch Changes

- 55bbea7: init
- 34f9304: docs: remove unused PROXMOX_PASSWORD from documentation

  The codebase only uses API token authentication (PROXMOX_TOKEN_NAME and PROXMOX_TOKEN_VALUE), not password authentication. Updated README.md and README_ko.md to reflect the actual required environment variables.
