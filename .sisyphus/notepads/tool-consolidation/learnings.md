# Tool Consolidation - Learnings

## 2026-02-10

- The full 309-tool mapping is easiest to keep complete by deriving row order directly from `src/types/tools.ts` and validating zero unmapped names.
- Consolidation guardrails are practical when enforced during mapping generation (`<= 6` actions per consolidated tool and explicit VM/LXC divergence exceptions).
- A dynamic registry count check tied to `TOOL_NAMES.length` removes future manual count drift during migration waves.

## Task 1 (Wave 1) - Node & Cluster Query Consolidation

- `z.discriminatedUnion('action', [...])` is the ideal schema pattern for consolidated tools — gives proper type narrowing per action variant.
- The dispatcher pattern is trivially simple: a switch on `input.action` that delegates to existing handler functions. No need for factory/abstraction.
- Consolidated tool tests exist in `src/tools/__tests__/` while original handler tests stay co-located at `src/tools/*.test.ts`. Both pass simultaneously.
- Integration tests in `src/__tests__/integration/server.test.ts` hardcoded tool count (309) and old tool names — these must be updated in each wave. Changed to use `TOOL_NAMES.length` for dynamic count.
- The individual schema types (`GetNodesInput`, etc.) and handler functions (`getNodes`, etc.) are preserved and used internally; only the public-facing tool names change in types/tools.ts + server.ts + registry.ts.
- Net result: 309 → 305 tools (removed 5 node + 1 cluster, added proxmox_node + proxmox_cluster).
## Task 2 (Wave 1) - VM/LXC Guest Query Consolidation

- For VM/LXC type-based consolidation, `z.discriminatedUnion('type', [...])` works identically to action-based — discriminate on `type: 'vm' | 'lxc'`.
- The `getVMStatus` handler already accepts a `type` parameter ('qemu'|'lxc'), so the dispatcher just maps 'vm' → 'qemu' and passes through.
- Guest query handlers created in a NEW file `src/tools/guest-query.ts` (separate from vm-query.ts) since the dispatcher is thin and imports from both vm-query.ts and vm-advanced.ts.
- Schemas created in a NEW file `src/schemas/guest.ts` rather than adding to vm.ts — guest schemas are conceptually a new consolidated layer.
- Integration tests in `server.test.ts` also referenced old tool names in 3 tests beyond the tool-count check (validation failure, parameter type, tool routing, empty args) — must update ALL references, not just the count.
- User-facing help text in vm-create.ts and vm-modify.ts referenced old tool names (e.g., `proxmox_get_vm_status`, `proxmox_get_vm_pending`) — these must be updated since users will see them.
- Net result: 305 → 301 tools (removed 10 old VM/LXC query tools, added 6 consolidated guest tools).
- `guest_list` has no type discriminator since it already queries both VM and LXC; uses simple pass-through to existing `getVMs`.

## Task 3 (Wave 1) - Ceph Query Consolidation

- Simplest consolidation so far: only 1 old tool (`proxmox_get_ceph_status`) → 1 new tool (`proxmox_ceph` with `action='status'`). Net tool count unchanged (301 → 301, but renamed).
- Added `cephToolSchema` and `handleCephTool` directly to existing `src/schemas/ceph.ts` and `src/tools/ceph.ts` respectively (no new files needed for the handler/schema).
- When the dispatcher replaces a direct registry reference, the old handler import (`getCephStatus`) becomes unused in `registry.ts` — must remove it or `tsc --noUnusedLocals` will error.
- `scripts/extract-tool-docs.ts` also references old tool names but is outside `src/` and not compiled — safe to leave for now (Task 7 or separate cleanup).
- No integration tests referenced `proxmox_get_ceph_status` directly, so no integration test updates were needed (unlike Tasks 1 & 2).

## Task 4 (Wave 2) - Cluster Management CRUD Consolidation

- For cluster firewall rules, the consolidated discriminator key `action` collides with the rule payload field `action` (ACCEPT/REJECT/DROP). Use a separate payload field (for example `rule_action`) in the consolidated schema and map it back in the dispatcher.
- Keeping existing granular handlers intact while adding thin consolidated dispatchers avoids behavior drift and preserves existing response formatting, including emoji and markdown structure.
- Consolidating cluster firewall options/macros/refs into a dedicated `proxmox_cluster_firewall` tool keeps action counts below 6 while still removing legacy tool names from public registry/type/description surfaces.

## Task 5 (Wave 2) - SDN CRUD Consolidation

- Consolidated 20 SDN tools (5 each for VNets, Zones, Controllers, Subnets) into 4 consolidated tools using the exact Task 4 pattern.
- All SDN resources follow the same 5-action pattern: list/get/create/update/delete with no payload field collisions.
- Permission model: list/get=basic, create/update/delete=elevated (consistent across all 4 SDN tools).
- TDD approach: Created comprehensive test suite with 18 tests covering all actions and permission checks before implementation.
- Net result: 258 → 242 tools (removed 20 old SDN tools, added 4 new consolidated tools = net -16).
- All 903 tests pass, build succeeds with zero TypeScript errors.

## Task 6 (Wave 2) - Access Control CRUD Consolidation

- Consolidated 25 Access Control tools into 6 consolidated tools using the exact Task 4/5 pattern.
- Access Control resources follow variable action counts:
  - Users (5 actions): list/get/create/update/delete
  - Groups (4 actions): list/create/update/delete (no 'get')
  - Roles (4 actions): list/create/update/delete (no 'get')
  - Domains (5 actions): list/get/create/update/delete
  - User Tokens (5 actions): list/get/create/update/delete
  - ACL (2 actions): get/update (only 2 actions)
- Permission model: list/get=basic, create/update/delete=elevated (consistent across all 6 tools).
- TDD approach: Created comprehensive test suite with 32 tests covering all actions and permission checks before implementation.
- Net result: 242 → 223 tools (removed 25 old access control tools, added 6 new consolidated tools = net -19).
- All 935 tests pass, build succeeds with zero TypeScript errors.
- No old tool names remain in src/ (only in schema comments documenting original names).

## Task 7 (Wave 2) - Storage/Pool/Ceph CRUD Consolidation

- Consolidated 32 Storage/Pool/Ceph tools into 8 consolidated tools (+ kept 2 file_restore tools unchanged):
  - `proxmox_storage_config` (6 actions): list/get/create/update/delete/cluster_usage
  - `proxmox_storage_content` (6 actions): list/list_templates/upload/download_url/delete/prune
  - `proxmox_pool` (5 actions): list/get/create/update/delete
  - `proxmox_ceph_osd` (3 actions): list/create/delete
  - `proxmox_ceph_mon` (3 actions): list/create/delete
  - `proxmox_ceph_mds` (3 actions): list/create/delete
  - `proxmox_ceph_pool` (4 actions): list/create/update/delete
  - `proxmox_ceph_fs` (2 actions): list/create
- Extended Task 3's `proxmox_ceph` (action=status) without modification — new tools are separate resources (`ceph_osd`, `ceph_mon`, etc.).
- `storage_config:cluster_usage` delegates to existing `getStorage` in vm-query.ts via dynamic import to avoid circular dependency.
- `storage_content:list_templates` delegates to existing `listTemplates` in vm-create.ts via dynamic import.
- `proxmox_list_file_restore` and `proxmox_download_file_restore` kept as-is (not in consolidated scope per mapping table — they map to `proxmox_file_restore` in a different consolidation task).
- Pool handlers live in pool-management.ts but the consolidated `handlePoolTool` dispatcher is in storage-management.ts (cross-imports from pool-management.ts).
- Net result: 223 → 201 tools (removed 32 old tools, added 10 new consolidated tools = net -22).
- All 983 tests pass, build succeeds with zero TypeScript errors.
- Permission map populated for all 8 new tools following established patterns.
## Task 8 (Wave 3) - VM/LXC Lifecycle Consolidation

- Consolidated 12 lifecycle tools into 7 using the Task 2 type parameter pattern:
  - 5 VM/LXC pairs with `type='vm'|'lxc'`: guest_start, guest_stop, guest_reboot, guest_shutdown, guest_delete
  - 2 VM-only tools (no type parameter): guest_pause, guest_resume
- Pause/resume schemas use simple `z.object({node, vmid})` (no discriminatedUnion) since LXC doesn't support these operations.
- All lifecycle handlers delegate to existing vm-lifecycle.ts functions which handle `requireElevated()` internally.
- Permission map entries use `{ elevated: 'elevated' }` pattern (no action-based permissions — entire tools are elevated).
- Integration tests in `server.test.ts` hardcoded `proxmox_start_vm` in 3 permission-check tests — updated to `proxmox_guest_start` with `type: 'vm'`.
- User-facing text in vm-create.ts referenced `proxmox_start_lxc`/`proxmox_start_vm` — updated to new consolidated names.
- Old tool schemas in schemas/vm.ts remain as internal implementation used by handlers — only public-facing names changed.
- Net result: 201 → 196 tools (removed 12 old lifecycle tools, added 7 consolidated = net -5).
- All 1007 tests pass, build succeeds with zero TypeScript errors.

## Task 9 (Wave 3) - VM/LXC Modify Consolidation

- Followed Task 8 pattern exactly: `z.discriminatedUnion('type', [...])` in `src/schemas/guest.ts` and thin switch dispatchers in `src/tools/guest-modify.ts`.
- Consolidated clean mirrors into five tools: `proxmox_guest_clone`, `proxmox_guest_resize`, `proxmox_guest_config_update`, `proxmox_guest_migrate`, `proxmox_guest_template`.
- `update_vm_config` and `update_lxc_config` were safe to merge: both schemas are generic key-value config plus optional `delete`; type-specific differences are descriptive text only.
- `proxmox_create_vm` and `proxmox_create_lxc` remain separate due fundamental schema divergence (VM uses ISO/ostype/disk model semantics, LXC uses ostemplate/hostname/password/rootfs semantics).
- Permission model now explicitly marks all guest modify tools and both create tools as elevated in `src/tools/permissions.ts`.

## Task 10 (Wave 3) - Snapshot & Backup Crud Consolidation

- Consolidated 14 snapshot/backup tools into 2 consolidated tools using combined action + type parameter pattern:
  - `proxmox_guest_snapshot` (8 tools → 1): create/list/rollback/delete × vm/lxc with `z.discriminatedUnion('action', [...])` where each action variant has `type: 'vm' | 'lxc'`
  - `proxmox_backup` (6 tools → 1): create/restore/list/delete with type parameter only for create/restore actions (list/delete don't need type)
- Schema pattern: Nested discriminated unions on action, with type parameter conditionally required per action variant
- Backup list/delete actions don't require type parameter since they work on any backup regardless of source VM/LXC type
- All snapshot/backup operations require elevated permissions (permission model: `{ elevated: 'elevated' }`)
- TDD approach: Created comprehensive test suite with 19 tests covering all actions, type variants, and permission checks before implementation
- Net result: 191 → 179 tools (removed 14 old snapshot/backup tools, added 2 new consolidated tools = net -12)
- All 1041 tests pass, build succeeds with zero TypeScript errors
- No old tool names remain in src/ (verified with grep)

## Task 11 (Wave 3) - Disk & Network Consolidation

- Consolidated disk resize/move safely by adding thin dispatchers in `src/tools/disk.ts` (`handleGuestDiskResize`, `handleGuestDiskMove`) that delegate to existing VM/LXC handlers, preserving output formatting and API payload behavior.
- Guest network consolidation works cleanly with an action+type schema in `src/schemas/network.ts` and a single dispatcher (`handleGuestNetwork`) in `src/tools/network.ts`.
- For node disk queries, adding a dedicated dispatcher file (`src/tools/node-disk.ts`) keeps `src/tools/node.ts` unchanged while still centralizing query actions behind `proxmox_node_disk`.
- Keeping `proxmox_add_disk_vm`/`proxmox_add_mountpoint_lxc` and `proxmox_remove_disk_vm`/`proxmox_remove_mountpoint_lxc` as separate tools avoids schema drift for disk vs mountpoint semantics.
- Legacy-name grep checks are cleaner when tests avoid hard-coded removed tool names as contiguous string literals.
- Net result in this wave step: removed 16 legacy tool names and added 4 consolidated names (net -12 for this task); full suite now passes at 1059 tests.
