# Add Generic VM/LXC Config Update Tools

## TL;DR

> **Quick Summary**: Add `proxmox_update_vm_config` and `proxmox_update_lxc_config` — generic tools that pass arbitrary key-value config to Proxmox's `PUT /config` endpoint, filling the gap for cloud-init, boot order, serial console, agent, and 100+ other config params currently inaccessible.
>
> **Deliverables**:
> - 2 new tools: `proxmox_update_vm_config`, `proxmox_update_lxc_config`
> - Schema, handler, registry, types, descriptions, tests, docs
> - Tool count updated from 307 → 309 (registry check + README)
>
> **Estimated Effort**: Medium (3 tasks, ~45 min execution)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3

---

## Context

### Original Request
MCP client correctly identified that no generic VM config update tool exists. `PUT /nodes/{node}/qemu/{vmid}/config` supports 100+ params but only 3 specific tools expose it (resize, network, disk). Cloud-init settings (`ciuser`, `cipassword`, `ipconfig0`), boot order, serial console, guest agent, and many other params are completely inaccessible.

### Interview Summary
**Key Discussions**:
- User asked: "should we split into purpose-specific tools or consolidate into one generic tool?"
- Analysis showed: purpose-specific tools cause combinatorial explosion (100+ params), generic tool provides complete coverage
- Decision: **add generic tool**, keep existing specific tools for backward compat
- Codebase pattern requires vm + lxc pairs → adding both `update_vm_config` and `update_lxc_config`

**Research Findings**:
- Proxmox `PUT /config` is merge-by-default (only changes sent params)
- Proxmox supports `delete` param to remove config keys
- 6-file registration pattern: types → schemas → tools → index → registry → server
- `registry.ts:1269` has hardcoded count `307` — MUST update to 309 or server crashes
- `z.record()` in Zod produces valid JSON Schema with `additionalProperties` — works with MCP SDK

### Metis Review
**Identified Gaps** (addressed):
- Registry count hardcoded at 307 → included in Task 1 as critical change
- README tool count "307" appears 7 times in README.md, 5 times in README_ko.md → included in Task 2
- Tool description must guide AI agents to prefer specific tools for resize/disk/network
- `delete` field needs clear description ("does NOT delete the VM")
- Handler must reject empty calls (no config AND no delete)
- `digest` param support — naturally handled by generic config pass-through

---

## Work Objectives

### Core Objective
Add two generic config update tools (`proxmox_update_vm_config`, `proxmox_update_lxc_config`) that accept arbitrary key-value configuration pairs and pass them to Proxmox's `PUT /config` endpoint, enabling immediate access to all VM/LXC config params.

### Concrete Deliverables
- `src/schemas/vm.ts` — 2 new schemas + types
- `src/tools/vm-modify.ts` — 2 new handler functions
- `src/tools/index.ts` — 2 new exports
- `src/tools/registry.ts` — 2 new registrations + count update 307→309
- `src/types/tools.ts` — 2 new tool names
- `src/server.ts` — 2 new descriptions
- `src/tools/vm-modify.test.ts` — new tests (5+ per tool)
- `docs/TOOLS.md` — document both tools
- `docs/TOOLS_ko.md` — Korean translation
- `README.md` — update tool count 307→309
- `README_ko.md` — update tool count 307→309

### Definition of Done
- [ ] `pnpm typecheck` → exit code 0
- [ ] `pnpm test --run` → all tests pass (including new ones)
- [ ] `pnpm lint` → exit code 0
- [ ] Registry count check passes (309)
- [ ] Both tools registered and accessible via MCP ListTools
- [ ] Cloud-init params (ciuser, boot, agent etc.) settable via new tool

### Must Have
- Generic config pass-through via `z.record(z.string(), z.any())`
- `delete` param support (remove config keys)
- Elevated permissions required
- Handler rejects empty calls (no config AND no delete)
- Tool description guides AI to prefer specific tools for resize/disk/network
- Both VM and LXC versions

### Must NOT Have (Guardrails)
- ❌ Do NOT add explicit named fields for specific Proxmox params (ciuser, boot etc.) — keep schema generic
- ❌ Do NOT touch existing tools (resize_vm, update_network_vm, add_disk_vm, cloud-init tools)
- ❌ Do NOT add POST /config support (only PUT — sync updates)
- ❌ Do NOT add input validation beyond node/vmid — Proxmox validates config params server-side
- ❌ Do NOT update SubAgent/skills docs — defer to separate task
- ❌ Do NOT add preview/diff mode

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: Tests-after
- **Framework**: vitest via `pnpm test`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Implement tools (schemas, handlers, registry, types, server, index, tests)

Wave 2 (After Wave 1):
└── Task 2: Update documentation (TOOLS.md, TOOLS_ko.md, README.md, README_ko.md)

Post-Docs:
└── Task 3: Verification + Commit + Push
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 3 | None |
| 3 | 1, 2 | None | None (final) |

---

## TODOs

- [x] 1. Implement Tools (schemas, handlers, registry, types, server, index, tests)

  **What to do**:

  **1a. `src/schemas/vm.ts`** — Add 2 new schemas at end of file (before last type export):

  ```typescript
  // proxmox_update_vm_config - Update QEMU VM configuration
  export const updateVmConfigSchema = z.object({
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
    config: z.record(z.string(), z.any()).optional().describe(
      'Key-value pairs of VM configuration to set. Common keys: ciuser, cipassword, ipconfig0 (cloud-init), boot (boot order), agent (QEMU agent), serial0, vga, cpu, balloon, tags, description. Use proxmox_get_vm_config to discover valid keys.'
    ),
    delete: z.string().optional().describe(
      'Comma-separated list of config keys to REMOVE (e.g. "ciuser,cipassword"). Does NOT delete the VM.'
    ),
  });
  export type UpdateVmConfigInput = z.input<typeof updateVmConfigSchema>;

  // proxmox_update_lxc_config - Update LXC container configuration
  export const updateLxcConfigSchema = z.object({
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
    config: z.record(z.string(), z.any()).optional().describe(
      'Key-value pairs of container configuration to set. Common keys: hostname, memory, cores, swap, nameserver, searchdomain, net0-31, mp0-255, rootfs, tags, description. Use proxmox_get_lxc_config to discover valid keys.'
    ),
    delete: z.string().optional().describe(
      'Comma-separated list of config keys to REMOVE (e.g. "mp1,nameserver"). Does NOT delete the container.'
    ),
  });
  export type UpdateLxcConfigInput = z.input<typeof updateLxcConfigSchema>;
  ```

  **1b. `src/tools/vm-modify.ts`** — Add 2 new handler functions after `resizeVM()`:

  Follow the exact pattern of `resizeVM` (lines 177-233):
  - `requireElevated` → `schema.parse` → `validateNodeName` → `validateVMID`
  - Build request body from `validated.config` (spread) + `validated.delete` (if present)
  - Reject if both `config` and `delete` are empty/undefined (like resizeVM's "at least one" check)
  - `client.request(PUT /nodes/{node}/qemu|lxc/{vmid}/config, 'PUT', body)`
  - Format response listing what was set/deleted
  - Import new schemas and types from `../schemas/vm.js`

  Handler for `updateVmConfig`:
  ```typescript
  export async function updateVmConfig(
    client: ProxmoxApiClient,
    config: Config,
    input: UpdateVmConfigInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'update VM configuration');
      const validated = updateVmConfigSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      const safeVmid = validateVMID(validated.vmid);

      const body: Record<string, unknown> = {};
      if (validated.config) {
        Object.assign(body, validated.config);
      }
      if (validated.delete) {
        body.delete = validated.delete;
      }

      if (Object.keys(body).length === 0) {
        return formatErrorResponse(
          new Error('At least one config parameter or delete must be provided'),
          'Update VM Config'
        );
      }

      await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/config`,
        'PUT',
        body
      );

      let output = `🔧 **VM Configuration Updated**\n\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Node**: ${safeNode}\n\n`;

      if (validated.config && Object.keys(validated.config).length > 0) {
        output += `**Parameters Set**:\n`;
        for (const [key, value] of Object.entries(validated.config)) {
          const displayValue = key.toLowerCase().includes('password') ? '***' : String(value);
          output += `- \`${key}\`: ${displayValue}\n`;
        }
      }

      if (validated.delete) {
        output += `\n**Parameters Removed**: ${validated.delete}\n`;
      }

      output += `\n**Note**: Some changes may require a VM restart. Use \`proxmox_get_vm_pending\` to check pending changes.`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Update VM Config');
    }
  }
  ```

  Same pattern for `updateLxcConfig` but using `/nodes/${safeNode}/lxc/${safeVmid}/config` and "Container" in messages.

  **1c. `src/tools/index.ts`** — Add exports:
  ```typescript
  export { updateVmConfig, updateLxcConfig } from './vm-modify.js';
  ```

  **1d. `src/types/tools.ts`** — Add to TOOL_NAMES array (find appropriate position near other VM tools):
  ```typescript
  'proxmox_update_vm_config',
  'proxmox_update_lxc_config',
  ```

  **1e. `src/server.ts`** — Add to TOOL_DESCRIPTIONS:
  ```typescript
  proxmox_update_vm_config: 'Update QEMU VM configuration with arbitrary key-value pairs via PUT /config (requires elevated permissions). Supports cloud-init (ciuser, cipassword, ipconfig0), boot order, serial console, guest agent, and all other Proxmox config params. For resize (memory/cores) prefer proxmox_resize_vm. For disk/network prefer their specific tools. Use proxmox_get_vm_config to discover valid parameters.',
  proxmox_update_lxc_config: 'Update LXC container configuration with arbitrary key-value pairs via PUT /config (requires elevated permissions). Supports hostname, memory, cores, swap, mount points, network, and all other Proxmox LXC config params. For resize (memory/cores) prefer proxmox_resize_lxc. For network prefer proxmox_update_network_lxc. Use proxmox_get_lxc_config to discover valid parameters.',
  ```

  **1f. `src/tools/registry.ts`** — Register tools and update count:
  - Import `updateVmConfig`, `updateLxcConfig` from tools
  - Import `updateVmConfigSchema`, `updateLxcConfigSchema` from schemas
  - Add to `toolRegistry` object near the VM Modify section:
    ```typescript
    proxmox_update_vm_config: { handler: updateVmConfig, schema: updateVmConfigSchema },
    proxmox_update_lxc_config: { handler: updateLxcConfig, schema: updateLxcConfigSchema },
    ```
  - **CRITICAL**: Update line 1269 from `registeredCount !== 307` to `registeredCount !== 309`

  **1g. Tests** — Add to `src/tools/vm-modify.test.ts`:

  Add tests for both `updateVmConfig` and `updateLxcConfig`:
  1. "requires elevated permissions" — config `allowElevated: false` → isError true
  2. "updates VM config with params" — mock success → verify request called with correct body
  3. "supports delete parameter" — send only `delete: "ciuser"` → verify request body includes delete
  4. "rejects when no config or delete provided" — send only node/vmid → isError true, "at least one"
  5. "masks password values in output" — send `cipassword: "secret"` → output contains `***` not `secret`

  **Must NOT do**:
  - Do NOT touch existing functions in vm-modify.ts (cloneLxc, cloneVM, resizeLxc, resizeVM)
  - Do NOT touch cloud-init.ts, network.ts, or disk.ts
  - Do NOT add named fields for specific Proxmox params (keep generic)
  - Do NOT add POST /config support

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple files (7+) to modify with precise patterns to follow
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (must be done before docs)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/tools/vm-modify.ts:177-233` — `resizeVM` handler pattern (FOLLOW THIS EXACTLY)
  - `src/tools/vm-modify.ts:200-205` — "at least one param" rejection pattern
  - `src/schemas/vm.ts:208-216` — `resizeVmSchema` pattern
  - `src/tools/registry.ts:1260` — import pattern for new tools
  - `src/tools/registry.ts:1269` — **CRITICAL** hardcoded count to update
  - `src/server.ts:340` — TOOL_DESCRIPTIONS placement near VM tools

  **API/Type References**:
  - `src/types/tools.ts:42-55` — TOOL_NAMES array, VM section
  - `src/tools/index.ts:318-330` — export pattern

  **Test References**:
  - `src/tools/vm-modify.test.ts` — existing test structure (if exists, extend; if not, create)
  - `src/__test-utils__/index.ts` — `createMockProxmoxClient`, `createTestConfig`

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` → exit 0
  - [ ] `pnpm test --run` → all pass (including 10+ new tests)
  - [ ] Registry count check passes (grep "309" registry.ts)
  - [ ] Both tool names in TOOL_NAMES array
  - [ ] Both tools in toolRegistry object
  - [ ] Both descriptions in TOOL_DESCRIPTIONS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: TypeScript compiles with new tools
    Tool: Bash
    Steps:
      1. Run: pnpm typecheck
      2. Assert: exit code 0
    Expected Result: Clean compilation

  Scenario: All tests pass including new ones
    Tool: Bash
    Steps:
      1. Run: pnpm test --run
      2. Assert: all tests pass, 0 failures
      3. Assert: output includes "updateVmConfig" or "update VM config" test names
    Expected Result: All tests pass

  Scenario: Registry count is correct
    Tool: Bash
    Steps:
      1. Run: grep "registeredCount !== 309" src/tools/registry.ts
      2. Assert: match found
    Expected Result: Count updated to 309

  Scenario: Both tools registered
    Tool: Bash
    Steps:
      1. Run: grep "proxmox_update_vm_config" src/tools/registry.ts
      2. Assert: match found
      3. Run: grep "proxmox_update_lxc_config" src/tools/registry.ts
      4. Assert: match found
    Expected Result: Both tools in registry
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(tools): add generic proxmox_update_vm_config and proxmox_update_lxc_config`
  - Pre-commit: `pnpm test --run`

---

- [x] 2. Update Documentation (TOOLS.md, TOOLS_ko.md, README, README_ko)

  **What to do**:

  **2a. `docs/TOOLS.md`** — Add both tools to VM Modify section:
  - Find the section near `proxmox_resize_vm` / `proxmox_resize_lxc`
  - Add documentation for `proxmox_update_vm_config` with params table (node, vmid, config, delete)
  - Add documentation for `proxmox_update_lxc_config` with params table
  - Include usage examples for cloud-init setup

  **2b. `docs/TOOLS_ko.md`** — Same changes in Korean

  **2c. `README.md`** — Update tool count:
  - Replace all `307` references with `309` (7 occurrences)
  - Update the tool count table if it has a VM Modify row

  **2d. `README_ko.md`** — Same count updates (5 occurrences)

  **Must NOT do**:
  - Do NOT update skills/ or docs/skills/ docs (separate task)
  - Do NOT update scripts/tool-docs.md (auto-generated)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `docs/TOOLS.md` — Find `proxmox_resize_vm` section, add nearby
  - `docs/TOOLS_ko.md` — Mirror
  - `README.md` — 7 occurrences of "307"
  - `README_ko.md` — 5 occurrences of "307"

  **Acceptance Criteria**:
  - [ ] `grep "proxmox_update_vm_config" docs/TOOLS.md` → found
  - [ ] `grep "proxmox_update_lxc_config" docs/TOOLS.md` → found
  - [ ] `grep -c "307" README.md` → 0 (all replaced with 309)
  - [ ] `grep -c "307" README_ko.md` → 0 (all replaced with 309)

  **Commit**: YES (groups with Task 1)

---

- [x] 3. Verification + Commit + Push

  **What to do**:
  - Run full verification suite
  - Create atomic commit
  - Push to origin/main

  **Verification commands**:
  ```bash
  pnpm typecheck            # exit 0
  pnpm test --run           # all pass
  pnpm lint                 # exit 0 (pre-existing errors OK)
  grep "309" src/tools/registry.ts  # count updated
  grep -c "307" README.md   # should be 0
  grep "proxmox_update_vm_config" src/types/tools.ts  # found
  grep "proxmox_update_lxc_config" src/types/tools.ts # found
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (final)
  - **Blocked By**: Tasks 1, 2

  **Acceptance Criteria**:
  - [ ] Commit created with message: `feat(tools): add generic proxmox_update_vm_config and proxmox_update_lxc_config`
  - [ ] Push to origin/main successful
  - [ ] git status clean

  **Commit**: YES
  - Message: `feat(tools): add generic proxmox_update_vm_config and proxmox_update_lxc_config`
  - Files: All modified files from Tasks 1-2
  - Pre-commit: `pnpm test --run`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 (final) | `feat(tools): add generic proxmox_update_vm_config and proxmox_update_lxc_config` | ~11 files (7 source + 4 docs) | pnpm test + typecheck |

---

## Success Criteria

### Verification Commands
```bash
pnpm typecheck                    # Expected: exit 0
pnpm test --run                   # Expected: all pass
pnpm lint                         # Expected: exit 0 (pre-existing OK)
grep "309" src/tools/registry.ts  # Expected: found
grep -c "307" README.md           # Expected: 0
grep "proxmox_update_vm_config" src/types/tools.ts    # Expected: found
grep "proxmox_update_lxc_config" src/types/tools.ts   # Expected: found
```

### Final Checklist
- [ ] Both tools work end-to-end (schema → handler → registry → server)
- [ ] Cloud-init params settable via `proxmox_update_vm_config`
- [ ] Delete param works (remove config keys)
- [ ] Empty call rejected with clear error
- [ ] Password values masked in output
- [ ] Tool count 309 everywhere
- [ ] All existing tests still pass
