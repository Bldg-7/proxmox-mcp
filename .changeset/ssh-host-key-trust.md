---
"@bldg-7/proxmox-mcp": minor
---

Verify the SSH host key for `proxmox_lxc_exec`, and redact secrets from diagnostics

**Action may be required if you use `PROXMOX_SSH_ENABLED=true`.** The server now refuses to start unless it can trust the node's SSH host key. It uses the first source that applies:

1. `PROXMOX_SSH_HOST_KEY_FINGERPRINT`
2. `PROXMOX_SSH_KNOWN_HOSTS` (new; checked even in insecure mode)
3. `PROXMOX_SSH_ALLOW_INSECURE=true` (new; no verification, test networks only)
4. `~/.ssh/known_hosts` of the user that runs the server

If that user already connects to the node with OpenSSH, no change is needed. The known_hosts support covers hashed names, `[host]:port`, wildcards, negation and `@revoked`, and it negotiates only the key types listed for the node, so RSA-only entries work.

Before this release, a configured fingerprint was compared against the wrong value, so it rejected every connection, and without one the host key was not checked at all.

Other changes:

- `proxmox_node_info` `report` now requires `PROXMOX_ALLOW_ELEVATED=true`. The report is redacted and limited to 16,000 characters.
- Error responses and logs redact API tokens, passwords, private keys and similar fields, and error text is limited to 4,096 characters. Redaction is best effort.
