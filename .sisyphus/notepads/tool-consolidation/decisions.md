# Tool Consolidation - Decisions

## 2026-02-10

- Chosen target mapping shape: 309 old tools -> 84 consolidated targets (within the plan's ~75-85 range).
- Preserved schema-divergent pairs as separate tools: `create_vm` vs `create_lxc`, and VM disk add/remove vs LXC mountpoint add/remove.
- Consolidated lifecycle operations into `proxmox_guest_power` (6 actions) plus separate `proxmox_guest_delete` to respect action cap.
- Split guest-agent operations into functional groups (`info`, `guest`, `exec`, `file`, `freeze`, `power`) to keep each tool under 6 actions.
- Merged singleton-like queries where safe (`get_next_vmid` into `proxmox_cluster`, `get_storage` into `proxmox_storage_config`, `list_templates` into `proxmox_storage_content`).

## Task 1 - Node & Cluster Consolidation Decisions

- Kept `proxmox_get_next_vmid` as a singleton (no consolidation) per the plan.
- Used `z.discriminatedUnion` rather than `z.union` for action-based schemas — provides better Zod error messages and TypeScript narrowing.
- Added consolidated schemas (`nodeToolSchema`, `clusterToolSchema`) alongside legacy schemas in `src/schemas/node.ts` rather than creating separate files. Cluster schema is simple enough to colocate.
- Dispatcher functions (`handleNodeTool`, `handleClusterTool`) added at end of existing handler files, not in separate files. Keeps handler code cohesive.
## Task 2 - VM/LXC Guest Query Consolidation Decisions

- Created separate files `src/schemas/guest.ts` and `src/tools/guest-query.ts` rather than adding to existing vm.ts/vm-query.ts — the consolidated tools are a new conceptual layer that imports from both vm-query.ts and vm-advanced.ts.
- Used `z.discriminatedUnion('type', ...)` with 'vm'|'lxc' (not 'qemu'|'lxc') for the public API — 'vm' is more user-friendly; dispatcher maps 'vm' → 'qemu' internally where needed.
- `guest_list` uses a flat schema (no discriminatedUnion) since it already handles both types via its existing `type` filter parameter ('qemu'|'lxc'|'all').
- Updated user-facing help text in vm-create.ts and vm-modify.ts to reference new consolidated tool names — since these are shown to users who would try to use the suggested tools.

## Task 3 - Ceph Query Consolidation Decisions

- Added consolidated `cephToolSchema` and `handleCephTool` to existing `src/schemas/ceph.ts` and `src/tools/ceph.ts` rather than creating new files — this is a minimal change (single action) that belongs alongside the existing ceph code.
- Used `z.discriminatedUnion('action', [...])` with single `'status'` variant as the starting point. Task 7 will add more actions (list_osds, list_mons, list_mds, list_pools, list_fs, create_*, delete_*).
- Kept the test file as `src/tools/__tests__/ceph-query.test.ts` (not `ceph.test.ts`) to match the "query" naming convention used for consolidated query tools and distinguish from original handler tests.

## Task 4 - Cluster Management CRUD Consolidation Decisions

- Added consolidated cluster-management schemas directly to existing `src/schemas/cluster-management.ts` (instead of creating `cluster-consolidated.ts`) to keep legacy and consolidated definitions co-located during migration.
- Added dedicated consolidated tools for each cluster sub-resource (`ha_resource`, `ha_group`, `cluster_firewall_rule`, `cluster_firewall_group`, `cluster_firewall`, `cluster_firewall_alias`, `cluster_firewall_ipset`, `cluster_firewall_ipset_entry`, `cluster_backup_job`, `cluster_replication_job`, `cluster_config`) and merged cluster options into existing `proxmox_cluster` actions.
- Mapped legacy `proxmox_get_ha_status` into `proxmox_ha_resource(action='status')` to preserve functionality while staying within the <=6 action cap.
- For firewall rule create/update consolidated actions, used `rule_action` as payload field to avoid collision with dispatcher discriminator `action`.

## Task 9 - VM/LXC Modify Consolidation Decisions

- Kept `create_vm` and `create_lxc` separate per plan because schemas are fundamentally different and exceed the divergence guardrail.
- Consolidated `update_vm_config` and `update_lxc_config` into `proxmox_guest_config_update(type=...)` because both are structurally identical (`node`, `vmid`, `config`, `delete`).
- Migrate and template actions moved into the same guest-modify consolidated layer (`proxmox_guest_migrate`, `proxmox_guest_template`) to keep all VM/LXC modify operations behind a consistent `type` parameter API.
- Implemented consolidated handlers as direct delegates to existing legacy handlers to preserve response formats and validation behavior.
