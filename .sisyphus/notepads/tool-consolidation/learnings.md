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
