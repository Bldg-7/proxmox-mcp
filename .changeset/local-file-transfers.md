---
"@bldg-7/proxmox-mcp": minor
---

Browse PBS backups and add opt-in local file transfers (93 tools)

- `proxmox_file_restore` `list` now works with PBS: pass `filepath=/` for the root, then the opaque `filepath` values that a listing returns. It now requires `PROXMOX_ALLOW_ELEVATED=true`. `path` is kept as a deprecated alias.
- Local file transfers are off by default. Enable them with `PROXMOX_FILE_TRANSFER_ENABLED=true`, `PROXMOX_ALLOW_ELEVATED=true`, `PROXMOX_TRANSFER_ROOT` and `PROXMOX_TRANSFER_JOURNAL_ROOT` (plus `PROXMOX_UPLOAD_ROOT` for uploads). The directories must be private (`0700`) and separate. Files stay on the MCP server host.
- `proxmox_storage_content` `upload` sends an ISO or container template from the upload directory. It now requires `request_id` and accepts `expected_sha256`; `backup` content, `checksum` and `checksum-algorithm` were removed.
- `proxmox_file_restore` `download` saves a PBS file or directory archive into the transfer directory. It requires `request_id`.
- New tool `proxmox_file_transfer` reports the status of a transfer or cancels it. Jobs are stored in a SQLite journal and are reconciled after a restart; an interrupted upload is reported as `remote_outcome_unknown` and is never retried automatically.
- `proxmox_file_restore` is no longer annotated as read-only, because `download` writes a local file.
