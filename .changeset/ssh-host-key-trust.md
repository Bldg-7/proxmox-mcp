---
"@bldg-7/proxmox-mcp": minor
---

Check the SSH host key for `proxmox_lxc_exec` against `~/.ssh/known_hosts`, and redact secrets from diagnostics

**Action may be required if you use `PROXMOX_SSH_ENABLED=true`.** The server now checks the node's SSH host key against `~/.ssh/known_hosts` of the user that runs it, the same file the `ssh` command uses. If that user already connects to the node with `ssh`, nothing changes. Otherwise, connect once with `ssh` as that user and accept the key after you compare it with the node console. With SSH enabled, the server does not start when the file has no entry for the node.

`PROXMOX_SSH_HOST_KEY_FINGERPRINT` is removed. It never worked: it was compared against the wrong value and rejected every connection. Without it, the host key was not checked at all.

Other changes:

- `proxmox_node_info` `report` now requires `PROXMOX_ALLOW_ELEVATED=true`. The report is redacted and limited to 16,000 characters.
- Error responses and logs redact API tokens, passwords, private keys and similar fields, and error text is limited to 4,096 characters. Redaction is best effort.
