# Remaining Proxmox API Endpoints — Full Implementation

## TL;DR

> **Quick Summary**: Implement all ~62 remaining Proxmox VE API endpoints across 14 categories. Each category gets its own changeset + commit. Follow established 7-file pattern.
>
> **Deliverables**:
> - ~62 new MCP tools (244 → ~306 total)
> - 14 commits with changesets (minor bump each)
> - Tests for every tool
>
> **Estimated Effort**: Large (~4-6 hours)
> **Parallel Execution**: NO — sequential (shared files, incremental tool count)
> **Critical Path**: Firewall Options → Aliases → IP Sets → then independent categories

---

## Context

### Original Request
Implement all remaining unimplemented Proxmox API endpoints, organized by category, with changeset + commit per category.

### Metis Review — Key Findings
- **Reorder categories by shared file dependency** (not logical grouping)
- **Tool count**: Currently 244. Track incrementally per category.
- **New files needed**: `certificate.ts`, `acme.ts`, `notifications.ts` for categories with no existing domain file
- **Validators**: May need `validateTokenId()` and `validateMacAddress()` for new param types
- **Security**: ACME account credentials should be redacted in output
- **encodeURIComponent**: Required for userid, tokenid, alias names, ipset names in URL paths

---

## Work Objectives

### Core Objective
Complete Proxmox VE API coverage by implementing all remaining ~62 endpoints.

### Must Have
- All ~62 tools implemented and tested
- Each category = 1 commit with changeset
- Elevated permissions for all write/delete operations
- Tool count assertion updated per commit

### Must NOT Have (Guardrails)
- ❌ No README updates (do separately after all done)
- ❌ No new validator unless truly needed (reuse existing)
- ❌ No optional params not in Proxmox API docs
- ❌ No separate files for <3 tools (add to existing domain file)
- ❌ No complex output formatting (simple markdown first)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: YES (tests-after, matching existing style)
- **Per category**: pnpm build && pnpm test after each

---

## Execution Order (Metis-recommended)

Categories ordered by shared file dependency:

```
 1. Firewall Options/Refs        → cluster-management.ts (foundation)
 2. Firewall Aliases             → cluster-management.ts
 3. Firewall IP Sets             → cluster-management.ts
 4. API Tokens                   → access-control.ts
 5. Node Power Management        → system-operations.ts
 6. Node Metrics (RRD)           → node.ts (or new node-metrics.ts)
 7. Node Replication             → system-operations.ts (or new)
 8. Pending Changes              → vm-query.ts
 9. Feature Checks               → vm-query.ts
10. Advanced Disk Ops            → disk.ts
11. Cluster Config               → cluster-management.ts (or new)
12. Certificate Management       → NEW: certificate.ts
13. ACME Plugins                 → NEW: acme.ts
14. Notifications                → NEW: notifications.ts
```

---

## TODOs

### IMPORTANT — Per-Category Implementation Pattern

Every category follows the SAME 7-file pattern. The executor MUST:

1. Add Zod schemas to `src/schemas/{domain}.ts`
2. Add handler functions to `src/tools/{domain}.ts`
3. Export handlers from `src/tools/index.ts`
4. Add tool names to `src/types/tools.ts` TOOL_NAMES array
5. Add descriptions to `src/server.ts` TOOL_DESCRIPTIONS
6. Register in `src/tools/registry.ts` + update tool count
7. Add tests to `src/tools/{domain}.test.ts`
8. Run `pnpm build && pnpm test`
9. Create changeset `.changeset/{category-name}.md`
10. Commit: `feat({scope}): {description}`

**For NEW domain files** (categories 12-14): Also create the new .ts files and import them in registry.ts and index.ts.

---

- [ ] 1. Firewall Options, Macros & Refs (4 tools)

  **What to do**:
  Add 4 tools for cluster-level firewall options, macros, and references.

  **Domain file**: `src/tools/cluster-management.ts` + `src/schemas/cluster-management.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_cluster_firewall_options` | `getClusterFirewallOptions` | `/cluster/firewall/options` | GET | NO |
  | `proxmox_update_cluster_firewall_options` | `updateClusterFirewallOptions` | `/cluster/firewall/options` | PUT | YES |
  | `proxmox_list_cluster_firewall_macros` | `listClusterFirewallMacros` | `/cluster/firewall/macros` | GET | NO |
  | `proxmox_list_cluster_firewall_refs` | `listClusterFirewallRefs` | `/cluster/firewall/refs` | GET | NO |

  **Schemas**:
  - `getClusterFirewallOptionsSchema`: `z.object({})` (no params)
  - `updateClusterFirewallOptionsSchema`: `z.object({ enable?: z.number(), policy_in?: z.string(), policy_out?: z.string(), log_ratelimit?: z.string() })`
  - `listClusterFirewallMacrosSchema`: `z.object({})`
  - `listClusterFirewallRefsSchema`: `z.object({ type?: z.enum(['alias', 'ipset']) })`

  **Must NOT do**: Don't modify existing firewall rule/group handlers.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/cluster-management.ts` — Existing firewall rule CRUD pattern
  - `src/schemas/cluster-management.ts` — Existing firewall schemas

  **Acceptance Criteria**:
  - [ ] 4 tools registered, build passes
  - [ ] pnpm test passes (4 new tests: 2 success + 2 elevated)
  - [ ] Tool count: 244 → 248

  **Commit**: YES
  - Message: `feat(firewall): add cluster firewall options, macros, and refs tools`
  - Changeset: `.changeset/firewall-options-refs.md` (minor)

---

- [ ] 2. Firewall Aliases (5 tools)

  **What to do**:
  Add 5 tools for cluster firewall alias CRUD.

  **Domain file**: `src/tools/cluster-management.ts` + `src/schemas/cluster-management.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_list_cluster_firewall_aliases` | `listClusterFirewallAliases` | `/cluster/firewall/aliases` | GET | NO |
  | `proxmox_get_cluster_firewall_alias` | `getClusterFirewallAlias` | `/cluster/firewall/aliases/{name}` | GET | NO |
  | `proxmox_create_cluster_firewall_alias` | `createClusterFirewallAlias` | `/cluster/firewall/aliases` | POST | YES |
  | `proxmox_update_cluster_firewall_alias` | `updateClusterFirewallAlias` | `/cluster/firewall/aliases/{name}` | PUT | YES |
  | `proxmox_delete_cluster_firewall_alias` | `deleteClusterFirewallAlias` | `/cluster/firewall/aliases/{name}` | DELETE | YES |

  **Schemas**:
  - List: `z.object({})`
  - Get/Update/Delete: `z.object({ name: z.string().min(1) })`
  - Create: `z.object({ name: z.string().min(1), cidr: z.string().min(1), comment: z.string().optional() })`
  - Update: `z.object({ name: z.string().min(1), cidr: z.string().min(1), comment: z.string().optional(), rename: z.string().optional() })`

  **NOTE**: Use `encodeURIComponent(name)` in URL path for alias names.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/cluster-management.ts` — Firewall groups CRUD (closest pattern for named entities)

  **Acceptance Criteria**:
  - [ ] 5 tools registered, build passes
  - [ ] pnpm test passes (5 success + 3 elevated = 8 tests)
  - [ ] Tool count: 248 → 253

  **Commit**: YES
  - Message: `feat(firewall): add cluster firewall alias CRUD tools`
  - Changeset: `.changeset/firewall-aliases.md` (minor)

---

- [ ] 3. Firewall IP Sets (7 tools)

  **What to do**:
  Add 7 tools for cluster firewall IP set management including nested entry CRUD.

  **Domain file**: `src/tools/cluster-management.ts` + `src/schemas/cluster-management.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_list_cluster_firewall_ipsets` | `listClusterFirewallIpsets` | `/cluster/firewall/ipset` | GET | NO |
  | `proxmox_create_cluster_firewall_ipset` | `createClusterFirewallIpset` | `/cluster/firewall/ipset` | POST | YES |
  | `proxmox_delete_cluster_firewall_ipset` | `deleteClusterFirewallIpset` | `/cluster/firewall/ipset/{name}` | DELETE | YES |
  | `proxmox_list_cluster_firewall_ipset_entries` | `listClusterFirewallIpsetEntries` | `/cluster/firewall/ipset/{name}` | GET | NO |
  | `proxmox_add_cluster_firewall_ipset_entry` | `addClusterFirewallIpsetEntry` | `/cluster/firewall/ipset/{name}` | POST | YES |
  | `proxmox_update_cluster_firewall_ipset_entry` | `updateClusterFirewallIpsetEntry` | `/cluster/firewall/ipset/{name}/{cidr}` | PUT | YES |
  | `proxmox_delete_cluster_firewall_ipset_entry` | `deleteClusterFirewallIpsetEntry` | `/cluster/firewall/ipset/{name}/{cidr}` | DELETE | YES |

  **NOTE**: 2-level nesting: `/ipset/{name}/{cidr}`. Use `encodeURIComponent()` for both `name` and `cidr`.

  **Schemas**:
  - List ipsets: `z.object({})`
  - Create ipset: `z.object({ name: z.string(), comment: z.string().optional() })`
  - Delete ipset: `z.object({ name: z.string() })`
  - List entries: `z.object({ name: z.string() })`
  - Add entry: `z.object({ name: z.string(), cidr: z.string(), comment: z.string().optional(), nomatch: z.boolean().optional() })`
  - Update entry: `z.object({ name: z.string(), cidr: z.string(), comment: z.string().optional(), nomatch: z.boolean().optional() })`
  - Delete entry: `z.object({ name: z.string(), cidr: z.string() })`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **References**:
  - `src/tools/cluster-management.ts` — Firewall groups pattern (similar CRUD with names)

  **Acceptance Criteria**:
  - [ ] 7 tools registered, build passes
  - [ ] pnpm test passes (7 success + 5 elevated = 12 tests)
  - [ ] Tool count: 253 → 260

  **Commit**: YES
  - Message: `feat(firewall): add cluster firewall IP set and entry CRUD tools`
  - Changeset: `.changeset/firewall-ipsets.md` (minor)

---

- [ ] 4. API Tokens (5 tools)

  **What to do**:
  Add 5 tools for user API token management.

  **Domain file**: `src/tools/access-control.ts` + `src/schemas/access-control.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_list_user_tokens` | `listUserTokens` | `/access/users/{userid}/token` | GET | NO |
  | `proxmox_get_user_token` | `getUserToken` | `/access/users/{userid}/token/{tokenid}` | GET | NO |
  | `proxmox_create_user_token` | `createUserToken` | `/access/users/{userid}/token/{tokenid}` | POST | YES |
  | `proxmox_update_user_token` | `updateUserToken` | `/access/users/{userid}/token/{tokenid}` | PUT | YES |
  | `proxmox_delete_user_token` | `deleteUserToken` | `/access/users/{userid}/token/{tokenid}` | DELETE | YES |

  **NOTE**: 
  - `userid` format: `user@realm` — use `encodeURIComponent(userid)`
  - `tokenid` format: `[A-Za-z][A-Za-z0-9._-]+` (2-64 chars)
  - Create response includes one-time `value` (full token) — display it prominently
  - **Elevated** for create/update/delete

  **Schemas**:
  - List: `z.object({ userid: z.string().min(1) })`
  - Get/Delete: `z.object({ userid: z.string().min(1), tokenid: z.string().min(1) })`
  - Create: `z.object({ userid: z.string().min(1), tokenid: z.string().min(1), comment: z.string().optional(), expire: z.number().optional(), privsep: z.boolean().optional() })`
  - Update: `z.object({ userid: z.string().min(1), tokenid: z.string().min(1), comment: z.string().optional(), expire: z.number().optional() })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/access-control.ts` — User CRUD (similar nested param pattern)
  - `src/schemas/access-control.ts` — User schemas

  **Acceptance Criteria**:
  - [ ] 5 tools registered, build passes
  - [ ] pnpm test passes (5 success + 3 elevated = 8 tests)
  - [ ] Tool count: 260 → 265

  **Commit**: YES
  - Message: `feat(access): add user API token CRUD tools`
  - Changeset: `.changeset/api-tokens.md` (minor)

---

- [ ] 5. Node Power Management (3 tools)

  **What to do**:
  Add 3 tools for node power operations.

  **Domain file**: `src/tools/system-operations.ts` + `src/schemas/system-operations.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_node_shutdown` | `nodeShutdown` | `/nodes/{node}/status` | POST (command=shutdown) | YES |
  | `proxmox_node_reboot` | `nodeReboot` | `/nodes/{node}/status` | POST (command=reboot) | YES |
  | `proxmox_node_wakeonlan` | `nodeWakeonlan` | `/nodes/{node}/wakeonlan` | POST | YES |

  **NOTE**: All elevated — these are destructive power operations.
  - `nodeShutdown` and `nodeReboot` POST to same endpoint with `command` param
  - `nodeWakeonlan` just needs node name

  **Schemas**:
  - Shutdown/Reboot: `z.object({ node: z.string().min(1) })`
  - WakeOnLAN: `z.object({ node: z.string().min(1) })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/system-operations.ts` — `startAll`/`stopAll` (similar elevated node ops)

  **Acceptance Criteria**:
  - [ ] 3 tools registered, build passes
  - [ ] pnpm test passes (3 success + 3 elevated = 6 tests)
  - [ ] Tool count: 265 → 268

  **Commit**: YES
  - Message: `feat(node): add node power management tools (shutdown, reboot, wake-on-lan)`
  - Changeset: `.changeset/node-power.md` (minor)

---

- [ ] 6. Node Metrics / RRD (3 tools)

  **What to do**:
  Add 3 tools for node and storage RRD metrics + diagnostic report.

  **Domain file**: `src/tools/node.ts` + `src/schemas/node.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_node_rrddata` | `getNodeRrddata` | `/nodes/{node}/rrddata` | GET | NO |
  | `proxmox_get_storage_rrddata` | `getStorageRrddata` | `/nodes/{node}/storage/{storage}/rrddata` | GET | NO |
  | `proxmox_get_node_report` | `getNodeReport` | `/nodes/{node}/report` | GET | NO |

  **NOTE**: All read-only, no elevated needed.

  **Schemas**:
  - Node RRD: `z.object({ node: z.string(), timeframe: z.enum(['hour','day','week','month','year']).optional(), cf: z.enum(['AVERAGE','MAX']).optional() })`
  - Storage RRD: `z.object({ node: z.string(), storage: z.string(), timeframe: ..., cf: ... })`
  - Report: `z.object({ node: z.string() })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/vm-advanced.ts:269-322` — `getVmRrddata` handler (exact RRD pattern to follow)
  - `src/schemas/vm-advanced.ts` — `getVmRrddataSchema`

  **Acceptance Criteria**:
  - [ ] 3 tools registered, build passes
  - [ ] pnpm test passes (3 success tests)
  - [ ] Tool count: 268 → 271

  **Commit**: YES
  - Message: `feat(node): add node and storage RRD metrics tools`
  - Changeset: `.changeset/node-metrics.md` (minor)

---

- [ ] 7. Node Replication (3 tools)

  **What to do**:
  Add 3 tools for node-level replication monitoring and control.

  **Domain file**: `src/tools/system-operations.ts` + `src/schemas/system-operations.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_node_replication_status` | `getNodeReplicationStatus` | `/nodes/{node}/replication/{id}/status` | GET | NO |
  | `proxmox_get_node_replication_log` | `getNodeReplicationLog` | `/nodes/{node}/replication/{id}/log` | GET | NO |
  | `proxmox_schedule_node_replication` | `scheduleNodeReplication` | `/nodes/{node}/replication/{id}/schedule_now` | POST | YES |

  **Schemas**:
  - Status/Log: `z.object({ node: z.string(), id: z.string() })`
  - Schedule: `z.object({ node: z.string(), id: z.string() })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 3 tools registered, build passes
  - [ ] pnpm test passes (3 success + 1 elevated = 4 tests)
  - [ ] Tool count: 271 → 274

  **Commit**: YES
  - Message: `feat(replication): add node replication status, log, and schedule tools`
  - Changeset: `.changeset/node-replication.md` (minor)

---

- [ ] 8. Pending Changes (2 tools)

  **What to do**:
  Add 2 tools to view pending VM/LXC configuration changes.

  **Domain file**: `src/tools/vm-query.ts` + `src/schemas/vm-query.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_vm_pending` | `getVmPending` | `/nodes/{node}/qemu/{vmid}/pending` | GET | NO |
  | `proxmox_get_lxc_pending` | `getLxcPending` | `/nodes/{node}/lxc/{vmid}/pending` | GET | NO |

  **Schemas**: Both use baseVmSchema pattern: `z.object({ node: z.string(), vmid: z.number() })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/vm-query.ts` — `getVMConfig` pattern (same params, similar read-only approach)

  **Acceptance Criteria**:
  - [ ] 2 tools registered, build passes
  - [ ] pnpm test passes (2 success tests)
  - [ ] Tool count: 274 → 276

  **Commit**: YES
  - Message: `feat(vm): add VM and LXC pending changes tools`
  - Changeset: `.changeset/pending-changes.md` (minor)

---

- [ ] 9. Feature Checks (2 tools)

  **What to do**:
  Add 2 tools for VM/LXC feature availability checks.

  **Domain file**: `src/tools/vm-query.ts` + `src/schemas/vm-query.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_check_vm_feature` | `checkVmFeature` | `/nodes/{node}/qemu/{vmid}/feature` | GET | NO |
  | `proxmox_check_lxc_feature` | `checkLxcFeature` | `/nodes/{node}/lxc/{vmid}/feature` | GET | NO |

  **Schemas**: `z.object({ node: z.string(), vmid: z.number(), feature: z.enum(['snapshot', 'clone', 'copy']) })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 2 tools registered, build passes
  - [ ] pnpm test passes (2 success tests)
  - [ ] Tool count: 276 → 278

  **Commit**: YES
  - Message: `feat(vm): add VM and LXC feature check tools`
  - Changeset: `.changeset/feature-checks.md` (minor)

---

- [ ] 10. Advanced Disk Operations (4 tools)

  **What to do**:
  Add 4 tools for additional disk management operations.

  **Domain file**: `src/tools/disk.ts` + `src/schemas/disk.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_init_disk_gpt` | `initDiskGpt` | `/nodes/{node}/disks/initgpt` | POST | YES |
  | `proxmox_wipe_disk` | `wipeDisk` | `/nodes/{node}/disks/wipedisk` | PUT | YES |
  | `proxmox_get_node_lvmthin` | `getNodeLvmThin` | `/nodes/{node}/disks/lvmthin` | GET | NO |
  | `proxmox_get_node_directory` | `getNodeDirectory` | `/nodes/{node}/disks/directory` | GET | NO |

  **Schemas**:
  - GPT init: `z.object({ node: z.string(), disk: z.string(), uuid: z.string().optional() })`
  - Wipe: `z.object({ node: z.string(), disk: z.string() })`
  - LVM thin/Directory: `z.object({ node: z.string() })`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/disk.ts` — Existing disk tools (getNodeDisks, getDiskSmart patterns)

  **Acceptance Criteria**:
  - [ ] 4 tools registered, build passes
  - [ ] pnpm test passes (4 success + 2 elevated = 6 tests)
  - [ ] Tool count: 278 → 282

  **Commit**: YES
  - Message: `feat(disk): add disk GPT init, wipe, LVM thin, and directory tools`
  - Changeset: `.changeset/advanced-disk-ops.md` (minor)

---

- [ ] 11. Cluster Config (5 tools)

  **What to do**:
  Add 5 tools for cluster configuration management.

  **Domain file**: `src/tools/cluster-management.ts` + `src/schemas/cluster-management.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_cluster_config` | `getClusterConfig` | `/cluster/config` | GET | NO |
  | `proxmox_list_cluster_config_nodes` | `listClusterConfigNodes` | `/cluster/config/nodes` | GET | NO |
  | `proxmox_get_cluster_config_node` | `getClusterConfigNode` | `/cluster/config/nodes/{node}` | GET | NO |
  | `proxmox_join_cluster` | `joinCluster` | `/cluster/config/join` | POST | YES |
  | `proxmox_get_cluster_totem` | `getClusterTotem` | `/cluster/config/totem` | GET | NO |

  **Schemas**:
  - Config/Nodes/Totem: `z.object({})`
  - Get node: `z.object({ node: z.string() })`
  - Join: `z.object({ hostname: z.string(), password: z.string(), fingerprint: z.string().optional(), force: z.boolean().optional() })`

  **NOTE**: `joinCluster` is highly destructive — elevated required. Password should not appear in output.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 5 tools registered, build passes
  - [ ] pnpm test passes (5 success + 1 elevated = 6 tests)
  - [ ] Tool count: 282 → 287

  **Commit**: YES
  - Message: `feat(cluster): add cluster config, nodes, join, and totem tools`
  - Changeset: `.changeset/cluster-config.md` (minor)

---

- [ ] 12. Certificate Management (7 tools)

  **What to do**:
  Add 7 tools for node certificate and ACME certificate management.
  **Create NEW files**: `src/tools/certificate.ts`, `src/schemas/certificate.ts`, `src/tools/certificate.test.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_get_node_certificates` | `getNodeCertificates` | `/nodes/{node}/certificates/info` | GET | NO |
  | `proxmox_upload_custom_certificate` | `uploadCustomCertificate` | `/nodes/{node}/certificates/custom` | POST | YES |
  | `proxmox_delete_custom_certificate` | `deleteCustomCertificate` | `/nodes/{node}/certificates/custom` | DELETE | YES |
  | `proxmox_order_acme_certificate` | `orderAcmeCertificate` | `/nodes/{node}/certificates/acme/certificate` | POST | YES |
  | `proxmox_renew_acme_certificate` | `renewAcmeCertificate` | `/nodes/{node}/certificates/acme/certificate` | PUT | YES |
  | `proxmox_revoke_acme_certificate` | `revokeAcmeCertificate` | `/nodes/{node}/certificates/acme/certificate` | DELETE | YES |
  | `proxmox_get_node_acme_config` | `getNodeAcmeConfig` | `/nodes/{node}/certificates/acme` | GET | NO |

  **NOTE**: 
  - `uploadCustomCertificate`: PEM certificate content as string. Use `z.string()` without max length.
  - NEW domain files needed — follow existing file structure patterns.

  **Schemas**:
  - Get certs/ACME config: `z.object({ node: z.string() })`
  - Upload custom: `z.object({ node: z.string(), certificates: z.string(), key: z.string().optional(), force: z.boolean().optional(), restart: z.boolean().optional() })`
  - Delete custom: `z.object({ node: z.string() })`
  - Order/Renew/Revoke ACME: `z.object({ node: z.string(), force: z.boolean().optional() })`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 7 tools registered, build passes
  - [ ] NEW files created: certificate.ts, certificate schemas, certificate tests
  - [ ] pnpm test passes (7 success + 5 elevated = 12 tests)
  - [ ] Tool count: 287 → 294

  **Commit**: YES
  - Message: `feat(certificate): add node certificate and ACME certificate tools`
  - Changeset: `.changeset/certificates.md` (minor)

---

- [ ] 13. ACME Plugins & Accounts (8 tools)

  **What to do**:
  Add 8 tools for ACME account and plugin management.
  **Create NEW files**: `src/tools/acme.ts`, `src/schemas/acme.ts`, `src/tools/acme.test.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_list_acme_accounts` | `listAcmeAccounts` | `/cluster/acme/account` | GET | NO |
  | `proxmox_get_acme_account` | `getAcmeAccount` | `/cluster/acme/account/{name}` | GET | NO |
  | `proxmox_create_acme_account` | `createAcmeAccount` | `/cluster/acme/account` | POST | YES |
  | `proxmox_update_acme_account` | `updateAcmeAccount` | `/cluster/acme/account/{name}` | PUT | YES |
  | `proxmox_delete_acme_account` | `deleteAcmeAccount` | `/cluster/acme/account/{name}` | DELETE | YES |
  | `proxmox_list_acme_plugins` | `listAcmePlugins` | `/cluster/acme/plugins` | GET | NO |
  | `proxmox_get_acme_plugin` | `getAcmePlugin` | `/cluster/acme/plugins/{id}` | GET | NO |
  | `proxmox_get_acme_directories` | `getAcmeDirectories` | `/cluster/acme/directories` | GET | NO |

  **NOTE**: 
  - Account creation involves email, TOS URL — redact credentials in output
  - Use `encodeURIComponent()` for name and id params

  **Schemas**:
  - List: `z.object({})`
  - Get/Delete account: `z.object({ name: z.string() })`
  - Create account: `z.object({ name: z.string().optional(), contact: z.string(), tos_url: z.string().optional(), directory: z.string().optional() })`
  - Update account: `z.object({ name: z.string(), contact: z.string().optional() })`
  - Get plugin: `z.object({ id: z.string() })`
  - Directories: `z.object({})`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 8 tools registered, build passes
  - [ ] NEW files created: acme.ts, acme schemas, acme tests
  - [ ] pnpm test passes (8 success + 3 elevated = 11 tests)
  - [ ] Tool count: 294 → 302

  **Commit**: YES
  - Message: `feat(acme): add ACME account, plugin, and directory tools`
  - Changeset: `.changeset/acme.md` (minor)

---

- [ ] 14. Notifications (5 tools)

  **What to do**:
  Add 5 tools for notification target management.
  **Create NEW files**: `src/tools/notifications.ts`, `src/schemas/notifications.ts`, `src/tools/notifications.test.ts`

  **Tools**:

  | Tool Name | Handler | Endpoint | Method | Elevated |
  |-----------|---------|----------|--------|----------|
  | `proxmox_list_notification_targets` | `listNotificationTargets` | `/cluster/notifications/targets` | GET | NO |
  | `proxmox_get_notification_target` | `getNotificationTarget` | `/cluster/notifications/endpoints/{type}/{name}` | GET | NO |
  | `proxmox_create_notification_target` | `createNotificationTarget` | `/cluster/notifications/endpoints/{type}` | POST | YES |
  | `proxmox_delete_notification_target` | `deleteNotificationTarget` | `/cluster/notifications/endpoints/{type}/{name}` | DELETE | YES |
  | `proxmox_test_notification_target` | `testNotificationTarget` | `/cluster/notifications/targets/{name}/test` | POST | YES |

  **NOTE**: 
  - Notification types: `smtp`, `gotify`, `sendmail`
  - Use single tool with `type` discriminator — NOT separate per-type tools
  - Use `encodeURIComponent()` for name params

  **Schemas**:
  - List: `z.object({})`
  - Get/Delete: `z.object({ type: z.enum(['smtp', 'gotify', 'sendmail']), name: z.string() })`
  - Create: `z.object({ type: z.enum(['smtp', 'gotify', 'sendmail']), name: z.string(), ... })` (type-specific optional params)
  - Test: `z.object({ name: z.string() })`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] 5 tools registered, build passes
  - [ ] NEW files created: notifications.ts, schemas, tests
  - [ ] pnpm test passes (5 success + 3 elevated = 8 tests)
  - [ ] Tool count: 302 → 307

  **Commit**: YES
  - Message: `feat(notifications): add notification target CRUD and test tools`
  - Changeset: `.changeset/notifications.md` (minor)

---

## Commit Strategy

| # | Category | Message | Tool Count | Changeset |
|---|----------|---------|------------|-----------|
| 1 | Firewall Options/Refs | `feat(firewall): add cluster firewall options, macros, and refs tools` | 244→248 | firewall-options-refs.md |
| 2 | Firewall Aliases | `feat(firewall): add cluster firewall alias CRUD tools` | 248→253 | firewall-aliases.md |
| 3 | Firewall IP Sets | `feat(firewall): add cluster firewall IP set and entry CRUD tools` | 253→260 | firewall-ipsets.md |
| 4 | API Tokens | `feat(access): add user API token CRUD tools` | 260→265 | api-tokens.md |
| 5 | Node Power | `feat(node): add node power management tools (shutdown, reboot, wake-on-lan)` | 265→268 | node-power.md |
| 6 | Node Metrics | `feat(node): add node and storage RRD metrics tools` | 268→271 | node-metrics.md |
| 7 | Node Replication | `feat(replication): add node replication status, log, and schedule tools` | 271→274 | node-replication.md |
| 8 | Pending Changes | `feat(vm): add VM and LXC pending changes tools` | 274→276 | pending-changes.md |
| 9 | Feature Checks | `feat(vm): add VM and LXC feature check tools` | 276→278 | feature-checks.md |
| 10 | Advanced Disk Ops | `feat(disk): add disk GPT init, wipe, LVM thin, and directory tools` | 278→282 | advanced-disk-ops.md |
| 11 | Cluster Config | `feat(cluster): add cluster config, nodes, join, and totem tools` | 282→287 | cluster-config.md |
| 12 | Certificates | `feat(certificate): add node certificate and ACME certificate tools` | 287→294 | certificates.md |
| 13 | ACME | `feat(acme): add ACME account, plugin, and directory tools` | 294→302 | acme.md |
| 14 | Notifications | `feat(notifications): add notification target CRUD and test tools` | 302→307 | notifications.md |

---

## Success Criteria

### Verification Commands
```bash
pnpm build     # Expected: exit 0
pnpm test      # Expected: exit 0, all tests pass
```

### Final Checklist
- [ ] All ~63 new tools implemented (244 → ~307)
- [ ] 14 commits, each with changeset
- [ ] All builds pass
- [ ] All tests pass
- [ ] Elevated permissions on all write/delete operations
- [ ] encodeURIComponent used for all URL path parameters with special chars
