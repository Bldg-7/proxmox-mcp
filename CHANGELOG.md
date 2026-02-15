# @bldg-7/proxmox-mcp

## 1.2.1

### Patch Changes

- 18aeff2: Fix MCP tool schemas for discriminatedUnion-based tools (82 of 92 tools) so properties are exposed at root level instead of being hidden inside anyOf, enabling MCP clients (Claude, GPT, etc.) to correctly discover and pass parameters

## 1.2.0

### Minor Changes

- 3a7f020: Add PROXMOX_ALLOW_UNSAFE_COMMANDS env var to bypass shell special character restrictions in exec commands (proxmox_lxc_exec and QEMU agent exec)

## 1.1.0

### Minor Changes

- 938fa8e: Add proxmox_lxc_exec tool for executing commands inside LXC containers via SSH + pct exec

## 1.0.4

### Patch Changes

- b4fe413: fix: add z.preprocess() to config parameters to handle Claude MCP client serialization bug

  Claude Code and Claude Desktop have a known bug (anthropics/claude-code#18260) where nested
  object parameters in MCP tool calls are serialized as JSON strings instead of native objects.
  This causes `Expected object, received string` validation errors on `config` fields.

  This patch adds defensive `z.preprocess()` wrappers to all 4 `config` record fields
  (guestConfigUpdateSchema, updateVmConfigSchema, updateLxcConfigSchema) that auto-parse
  JSON strings back to objects before Zod validation.

## 1.0.3

### Patch Changes

- 275d76e: Fix tools not visible in Claude Desktop due to missing `type: "object"` in inputSchema.

  Tools using `z.discriminatedUnion()` (82 of 91) produced `{ anyOf: [...] }` schemas without a root-level `type: "object"`. The MCP SDK v1.25.3 requires `type: "object"` at the root (hardcoded in `types.ts:1229`), causing clients like Claude Desktop to silently drop these tools.

  References:

  - https://github.com/modelcontextprotocol/typescript-sdk/issues/685
  - https://github.com/modelcontextprotocol/modelcontextprotocol/issues/834 (SEP to relax this constraint)

- 275d76e: fix: add root type:'object' to discriminatedUnion tool schemas

## 1.0.2

### Patch Changes

- 9b0caf3: Fix MCP tools capability advertisement to include `listChanged: true`.

  This ensures MCP clients properly recognize and display the server's tool catalog during capability negotiation. Without this, some clients may not show tools even when the `tools/list` response contains them.

## 1.0.1

### Patch Changes

- 60c714d: Fix MCP startup metadata to report the package version from `package.json` instead of a stale hardcoded value.

  Also update startup logging to report the current registered tool count dynamically and emit a clear warning when `NODE_TLS_REJECT_UNAUTHORIZED=0` is set.

## 1.0.0

### Major Changes

- 75978bd: BREAKING CHANGE: Consolidate 309 tools to 91 tools

  - VM/LXC tool pairs merged with `type` parameter (vm|lxc)
  - CRUD tool groups merged with `action` parameter
  - Guest agent tools merged with `operation` parameter
  - See MIGRATION.md for complete old→new tool mapping

## 0.6.0

### Minor Changes

- 7f326b3: Add ACME account, plugin, and directory management tools

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

- 2bcc06e: Add advanced disk operation tools for GPT initialization, disk wiping, LVM thin pools, and directory management

  - Add `proxmox_init_disk_gpt` - Initialize disk with GPT partition table
  - Add `proxmox_wipe_disk` - Wipe disk signatures
  - Add `proxmox_get_node_lvmthin` - List LVM thin pools on node
  - Add `proxmox_get_node_directory` - List directory storage on node

  Tool count: 278 → 282
  Tests: 734 → 740 (+6)

- d754430: Add user API token CRUD tools

  Implements 5 new tools for user API token management:

  - `proxmox_list_user_tokens` - List all API tokens for a user
  - `proxmox_get_user_token` - Get specific token info
  - `proxmox_create_user_token` - Create new API token (elevated, displays one-time value)
  - `proxmox_update_user_token` - Update token metadata (elevated)
  - `proxmox_delete_user_token` - Delete API token (elevated)

  Tool count: 260 → 265

- ab46a2f: Add node certificate and ACME certificate management tools

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

- 42be7a3: Add cluster configuration management tools

  - Add `proxmox_get_cluster_config` - Get cluster configuration
  - Add `proxmox_list_cluster_config_nodes` - List cluster nodes
  - Add `proxmox_get_cluster_config_node` - Get specific node configuration
  - Add `proxmox_join_cluster` - Join node to cluster (elevated, password redacted)
  - Add `proxmox_get_cluster_totem` - Get totem configuration

  Tool count: 282 → 287
  Tests: 740 → 746 (+6)

- 120c9a7: Add VM and LXC feature check tools

  Implements 2 new tools for checking feature availability:

  - `proxmox_check_vm_feature` - Check if feature is available for QEMU VMs
  - `proxmox_check_lxc_feature` - Check if feature is available for LXC containers

  Features: snapshot, clone, copy

  Tool count: 276 → 278

- 61ea8eb: Add cluster firewall alias CRUD tools

  Implements 5 new tools for cluster firewall alias management:

  - `proxmox_list_cluster_firewall_aliases` - List all cluster firewall aliases
  - `proxmox_get_cluster_firewall_alias` - Get specific alias by name
  - `proxmox_create_cluster_firewall_alias` - Create new alias (elevated)
  - `proxmox_update_cluster_firewall_alias` - Update alias CIDR/comment/rename (elevated)
  - `proxmox_delete_cluster_firewall_alias` - Delete alias (elevated)

  Tool count: 248 → 253

- bec651a: Add cluster firewall IP set and entry CRUD tools

  Implements 7 new tools for cluster firewall IP set management:

  - `proxmox_list_cluster_firewall_ipsets` - List all IP sets
  - `proxmox_create_cluster_firewall_ipset` - Create IP set (elevated)
  - `proxmox_delete_cluster_firewall_ipset` - Delete IP set (elevated)
  - `proxmox_list_cluster_firewall_ipset_entries` - List entries in an IP set
  - `proxmox_add_cluster_firewall_ipset_entry` - Add entry to IP set (elevated)
  - `proxmox_update_cluster_firewall_ipset_entry` - Update entry (elevated)
  - `proxmox_delete_cluster_firewall_ipset_entry` - Delete entry (elevated)

  Tool count: 253 → 260

- eb6dc8f: Add cluster firewall options, macros, and refs tools

  Implements 4 new tools for cluster-level firewall management:

  - `proxmox_get_cluster_firewall_options` - Get cluster firewall options
  - `proxmox_update_cluster_firewall_options` - Update cluster firewall options (elevated)
  - `proxmox_list_cluster_firewall_macros` - List available firewall macros
  - `proxmox_list_cluster_firewall_refs` - List firewall references (aliases/ipsets)

  Tool count: 244 → 248

- a9e7d6b: Add node and storage RRD metrics tools

  Implements 3 new tools for node metrics and diagnostics:

  - `proxmox_get_node_rrddata` - Get node RRD performance metrics
  - `proxmox_get_storage_rrddata` - Get storage RRD performance metrics
  - `proxmox_get_node_report` - Get node diagnostic report

  Tool count: 268 → 271

- 85ccf97: Add node power management tools (shutdown, reboot, wake-on-lan)

  Implements 3 new tools for node power management:

  - `proxmox_node_shutdown` - Shut down a node (elevated)
  - `proxmox_node_reboot` - Reboot a node (elevated)
  - `proxmox_node_wakeonlan` - Wake a node via WOL (elevated)

  Tool count: 265 → 268

- 5da79b8: Add node replication status, log, and schedule tools

  Implements 3 new tools for node replication management:

  - `proxmox_get_node_replication_status` - Get replication job status
  - `proxmox_get_node_replication_log` - Get replication job log
  - `proxmox_schedule_node_replication` - Trigger immediate replication (elevated)

  Tool count: 271 → 274

- c4a2889: Add notification target CRUD and test tools

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

- bc156b1: Add VM and LXC pending changes tools

  Implements 2 new tools for viewing pending configuration changes:

  - `proxmox_get_vm_pending` - Get pending changes for QEMU VMs
  - `proxmox_get_lxc_pending` - Get pending changes for LXC containers

  Tool count: 274 → 276

## 0.5.0

### Minor Changes

- a5f2b79: Add cloud-init tools: get config, dump rendered config, and regenerate cloud-init drive for QEMU VMs (3 new tools).
- a5f2b79: Add QEMU agent tools: file read/write, get hostname, get users, set user password, and guest shutdown via QEMU guest agent (6 new tools). Includes new validateFilePath and validateUsername validators.
- f423758: Add remaining QEMU Guest Agent tools: filesystem freeze/thaw/trim, memory block info, and suspend operations (disk/RAM/hybrid). Total agent tools: 24. Total tools: 244.

## 0.4.3

### Patch Changes

- 53479be: Add net0 parameter support to proxmox_create_lxc.

## 0.4.2

### Patch Changes

- 066eed6: Clarify guest agent requirement in execute_vm_command tool description.

## 0.4.1

### Patch Changes

- 14947a7: Send Proxmox POST/PUT as form-encoded and move DELETE params into query string.

## 0.4.0

### Minor Changes

- 3aee411: Add access control tools for users, groups, roles, ACLs, and authentication domains.
- e598767: Add Ceph integration tools for status, OSDs, monitors, MDS, pools, and CephFS management.
- 42538d3: Add cluster management tools for HA resources/groups, cluster firewall rules/groups, backup jobs, replication jobs, and cluster options.
- 17b25da: Add console access tools for VM and LXC proxy tickets (VNC, SPICE, and terminal).
- 07d591f: Add node management tools for services, logs, tasks, appliance templates, and netstat, and make ESLint v9 configuration compatible.
- 998cafe: Add node network configuration tools for creating, updating, deleting, and applying node interface changes.
- 063e253: Add pool management tools for listing, creating, updating, and deleting resource pools.
- b742af2: Add SDN tools for managing vnets, zones, controllers, and subnets.
- 2ec70e7: Add storage management tools for configuration CRUD, content operations, and backup restore/pruning.
- 653d097: Add system operations tools for node time, DNS, hosts, subscriptions, APT operations, and bulk guest actions.
- ae6b6b5: Add VM/LXC advanced tools for migrations, templates, guest agent commands, firewall rules, and RRD performance metrics.

### Patch Changes

- 6ba344a: Fix LXC command execution by routing through host execute API with pct exec.

## 0.3.0

### Minor Changes

- 5ea207f: Add node-level network and DNS query tools

  - `proxmox_get_node_network`: List network interfaces on a node with optional type filtering (bridge, bond, eth, alias, vlan, OVS, unknown)
  - `proxmox_get_node_dns`: Get DNS configuration for a specific node (nameservers, search domain)
  - `proxmox_get_network_iface`: Get detailed configuration for a specific network interface
  - All tools are read-only and do not require elevated permissions
  - Tool count: 61 → 64

## 0.2.0

### Minor Changes

- 37e4452: Add VM/LXC configuration read tools

  - `proxmox_get_vm_config`: Read QEMU VM hardware configuration (disks, network, CPU, memory)
  - `proxmox_get_lxc_config`: Read LXC container hardware configuration (mount points, network, CPU, memory)
  - Both tools are read-only and do not require elevated permissions
  - Tool count: 55 → 57

- 3bd7d98: Add node-level disk query tools

  - `proxmox_get_node_disks`: List physical disks (SSD, HDD, NVMe) with health status
  - `proxmox_get_disk_smart`: Get SMART health data for a specific disk
  - `proxmox_get_node_lvm`: List LVM volume groups and physical volumes
  - `proxmox_get_node_zfs`: List ZFS pools with health and capacity
  - All tools are read-only and do not require elevated permissions
  - Tool count: 57 → 61

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
