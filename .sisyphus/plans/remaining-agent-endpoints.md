# Remaining QEMU Agent Endpoints

## TL;DR

> **Quick Summary**: Implement the final 8 QEMU Guest Agent endpoints (fsfreeze, fstrim, suspend, memory-block-info) following the established patterns, plus create a changeset for npm versioning.
> 
> **Deliverables**:
> - 8 new MCP tools (236 → 244 total)
> - 8 Zod schemas
> - 14+ new tests
> - 1 changeset (minor bump)
> 
> **Estimated Effort**: Short (~1 hour)
> **Parallel Execution**: NO - sequential (shared files)
> **Critical Path**: Schemas → Handlers → Exports → Registry → Tests → Changeset

---

## Context

### Original Request
Complete all remaining QEMU Guest Agent endpoints and create a changeset.

### Interview Summary
**Key Discussions**:
- All 8 remaining endpoints, no subset
- Follow existing patterns exactly
- Changeset included at end

**Research Findings**:
- 16 agent tools already implemented with consistent patterns
- 7 files need modification (Metis caught 3 that were initially missed)
- All 8 new schemas can use `baseVmSchema` (node + vmid only, no extra params)
- HTTP method: All agent endpoints use POST except read-only GET endpoints

### Metis Review
**Identified Gaps** (addressed):
- Missing files: `src/tools/index.ts`, `src/types/tools.ts`, `src/server.ts` → Added to plan
- fstrim `minimum` param: Confirmed NOT needed per Proxmox API docs
- HTTP method verification: All agent calls are POST (even reads like fsfreeze-status)

---

## Work Objectives

### Core Objective
Add the final 8 QEMU Guest Agent endpoints to complete agent API coverage.

### Concrete Deliverables
- 8 new tools: fsfreeze-status, fsfreeze-freeze, fsfreeze-thaw, fstrim, get-memory-block-info, suspend-disk, suspend-ram, suspend-hybrid
- Tool count: 236 → 244
- Tests: 14+ new tests (8 success + 6 elevated permission)
- Changeset: `.changeset/remaining-agent-tools.md`

### Definition of Done
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (all existing + 14 new tests)
- [ ] Tool count assertion updated and passes (244)
- [ ] Changeset file exists

### Must Have
- All 8 endpoints implemented
- Consistent patterns with existing 16 agent tools
- Elevated permission checks on 6 destructive endpoints
- Tests for every tool

### Must NOT Have (Guardrails)
- ❌ No new utility functions — reuse existing
- ❌ No response type interfaces — use existing `as` patterns
- ❌ No API response validation — pass through and format
- ❌ No extra parameters on schemas — all use `baseVmSchema`
- ❌ No modifications to existing tools
- ❌ No doc file updates (TOOLS.md, skills/, README)
- ❌ No retry logic, logging, or middleware changes

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (bun test / vitest)
- **Automated tests**: YES (tests-after pattern, matching existing style)
- **Framework**: bun test

### Agent-Executed QA Scenarios

```
Scenario: Build succeeds with new tools
  Tool: Bash
  Steps:
    1. Run: pnpm build
    2. Assert: exit code 0
    3. Assert: no TypeScript errors in output
  Expected Result: Clean build

Scenario: All tests pass including new ones
  Tool: Bash
  Steps:
    1. Run: pnpm test
    2. Assert: exit code 0
    3. Assert: output contains "14" or more new test results
  Expected Result: All tests green

Scenario: Tool count is exactly 244
  Tool: Bash
  Steps:
    1. Run: pnpm build (triggers registry validation)
    2. Assert: no "Tool registry incomplete" error
  Expected Result: Registry validates 244 tools

Scenario: Changeset file exists and is valid
  Tool: Bash
  Steps:
    1. Check: .changeset/remaining-agent-tools.md exists
    2. Assert: contains "@bldg-7/proxmox-mcp"
    3. Assert: contains "minor"
  Expected Result: Valid changeset for minor bump
```

---

## Execution Strategy

### Sequential (single wave — shared files)

All tasks modify overlapping files, so execute sequentially:

```
Task 1: Add 8 schemas to vm-advanced schemas
    ↓
Task 2: Add 8 handlers to vm-advanced tools
    ↓
Task 3: Export handlers from tools/index.ts
    ↓
Task 4: Add tool names to types/tools.ts
    ↓
Task 5: Add descriptions to server.ts
    ↓
Task 6: Register in registry.ts + update count
    ↓
Task 7: Add tests to vm-advanced.test.ts
    ↓
Task 8: Build + test verification
    ↓
Task 9: Create changeset + commit
```

---

## TODOs

- [ ] 1. Add 8 Zod Schemas

  **What to do**:
  - Add 8 schema definitions to `src/schemas/vm-advanced.ts`
  - All use `baseVmSchema` (no extra parameters)
  - Export schemas AND types

  **Schemas to add** (append after existing agent schemas, ~line 158):
  ```typescript
  // Filesystem operations
  export const agentFsfreezeStatusSchema = baseVmSchema;
  export type AgentFsfreezeStatusInput = z.input<typeof agentFsfreezeStatusSchema>;

  export const agentFsfreezeFreezeSchema = baseVmSchema;
  export type AgentFsfreezeFreezeInput = z.input<typeof agentFsfreezeFreezeSchema>;

  export const agentFsfreezeThawSchema = baseVmSchema;
  export type AgentFsfreezeThawInput = z.input<typeof agentFsfreezeThawSchema>;

  export const agentFstrimSchema = baseVmSchema;
  export type AgentFstrimInput = z.input<typeof agentFstrimSchema>;

  // Hardware info
  export const agentGetMemoryBlockInfoSchema = baseVmSchema;
  export type AgentGetMemoryBlockInfoInput = z.input<typeof agentGetMemoryBlockInfoSchema>;

  // Power management
  export const agentSuspendDiskSchema = baseVmSchema;
  export type AgentSuspendDiskInput = z.input<typeof agentSuspendDiskSchema>;

  export const agentSuspendRamSchema = baseVmSchema;
  export type AgentSuspendRamInput = z.input<typeof agentSuspendRamSchema>;

  export const agentSuspendHybridSchema = baseVmSchema;
  export type AgentSuspendHybridInput = z.input<typeof agentSuspendHybridSchema>;
  ```

  **Must NOT do**:
  - Don't add any extra parameters (no `minimum` on fstrim)
  - Don't create new base schemas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (no special skills needed)

  **References**:
  - `src/schemas/vm-advanced.ts:62-158` — Existing agent schemas pattern (all use `baseVmSchema`)
  - `src/schemas/vm-advanced.ts:3-6` — `baseVmSchema` definition

  **Acceptance Criteria**:
  - [ ] 8 schemas exported from `src/schemas/vm-advanced.ts`
  - [ ] 8 corresponding TypeScript types exported
  - [ ] All schemas use `baseVmSchema` (node + vmid only)

  **Commit**: NO (groups with Task 9)

---

- [ ] 2. Add 8 Handler Functions

  **What to do**:
  - Add 8 handler functions to `src/tools/vm-advanced.ts`
  - Follow exact pattern of existing handlers (validate → sanitize → request → format → return)
  - Import new schemas and types at top of file
  - Add `requireElevated()` for 6 destructive endpoints
  - All endpoints use POST method

  **Handlers to add** (append after `agentShutdown`, ~line 879):

  **Handler details:**

  | Handler | Endpoint | Method | Elevated | Emoji | Description |
  |---------|----------|--------|----------|-------|-------------|
  | `agentFsfreezeStatus` | `agent/fsfreeze-status` | POST | NO | ❄️ | Get filesystem freeze status |
  | `agentFsfreezeFreeze` | `agent/fsfreeze-freeze` | POST | YES | ❄️ | Freeze guest filesystems |
  | `agentFsfreezeThaw` | `agent/fsfreeze-thaw` | POST | YES | ❄️ | Thaw frozen filesystems |
  | `agentFstrim` | `agent/fstrim` | POST | YES | 💾 | Discard unused blocks |
  | `agentGetMemoryBlockInfo` | `agent/get-memory-block-info` | GET | NO | 🧠 | Get memory block size |
  | `agentSuspendDisk` | `agent/suspend-disk` | POST | YES | 🔌 | Hibernate guest |
  | `agentSuspendRam` | `agent/suspend-ram` | POST | YES | 🔌 | Sleep guest |
  | `agentSuspendHybrid` | `agent/suspend-hybrid` | POST | YES | 🔌 | Hybrid suspend |

  **Pattern to follow** (from `agentShutdown`):
  ```typescript
  export async function agentFsfreezeStatus(
    client: ProxmoxApiClient,
    _config: Config,       // underscore prefix when config not used
    input: AgentFsfreezeStatusInput
  ): Promise<ToolResponse> {
    try {
      const validated = agentFsfreezeStatusSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      const safeVmid = validateVMID(validated.vmid);

      const status = await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/agent/fsfreeze-status`,
        'POST'
      );

      const output = `❄️ **Filesystem Freeze Status**\n\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Node**: ${safeNode}\n` +
        `• **Status**: ${status}`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent Fsfreeze Status');
    }
  }
  ```

  **For elevated endpoints** (fsfreeze-freeze, fsfreeze-thaw, fstrim, suspend-*), add before API call:
  ```typescript
  requireElevated(config, 'freeze guest filesystems');
  ```
  And use `config` instead of `_config` in function signature.

  **Response details per handler**:

  - **fsfreeze-status**: Returns number (frozen FS count) or status string. Format as `❄️ **Filesystem Freeze Status**`
  - **fsfreeze-freeze**: Returns number of frozen filesystems. Format as `❄️ **Filesystem Freeze**` with count
  - **fsfreeze-thaw**: Returns number of thawed filesystems. Format as `❄️ **Filesystem Thaw**` with count
  - **fstrim**: Returns JSON with trim results per filesystem. Use `formatJsonBlock()` or JSON.stringify for details. Format as `💾 **Filesystem Trim**`
  - **get-memory-block-info**: Returns `{ size: number }`. Format size in human-readable bytes. Format as `🧠 **Memory Block Info**`
  - **suspend-disk**: No meaningful return. Format as `🔌 **Guest Suspended to Disk**`
  - **suspend-ram**: No meaningful return. Format as `🔌 **Guest Suspended to RAM**`
  - **suspend-hybrid**: No meaningful return. Format as `🔌 **Guest Hybrid Suspended**`

  **Must NOT do**:
  - Don't create new utility/helper functions
  - Don't add response type interfaces
  - Don't modify any existing handler

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (no special skills needed)

  **References**:
  - `src/tools/vm-advanced.ts:852-879` — `agentShutdown` handler (closest pattern for simple POST+elevated)
  - `src/tools/vm-advanced.ts:325-350` — `agentPing` handler (simple POST, no elevated)
  - `src/tools/vm-advanced.ts:407-430` — `agentGetMemoryBlocks` handler (GET, read-only with JSON response)
  - `src/tools/vm-advanced.ts:1-30` — Import section (add new schema/type imports here)
  - `docs/proxmox-qemu-agent-endpoints.md` — Full API endpoint reference with response shapes

  **Acceptance Criteria**:
  - [ ] 8 handler functions exported from `src/tools/vm-advanced.ts`
  - [ ] 6 handlers call `requireElevated()` (freeze, thaw, fstrim, suspend-*)
  - [ ] 2 handlers do NOT call `requireElevated()` (fsfreeze-status, get-memory-block-info)
  - [ ] All handlers use `validateNodeName()` and `validateVMID()`
  - [ ] All handlers use `formatToolResponse()` and `formatErrorResponse()`

  **Commit**: NO (groups with Task 9)

---

- [ ] 3. Export Handlers from tools/index.ts

  **What to do**:
  - Add 8 new handler exports to `src/tools/index.ts`
  - Add in the appropriate section (agent tools are in vm-advanced exports)

  **Exports to add** (append to existing vm-advanced exports):
  ```typescript
  export {
    // ... existing exports ...
    agentFsfreezeStatus,
    agentFsfreezeFreeze,
    agentFsfreezeThaw,
    agentFstrim,
    agentGetMemoryBlockInfo,
    agentSuspendDisk,
    agentSuspendRam,
    agentSuspendHybrid,
  } from './vm-advanced.js';
  ```

  **Must NOT do**:
  - Don't reorganize existing exports
  - Don't change import paths

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/index.ts` — Find the existing vm-advanced export block with agent handlers. Add new exports alongside existing ones like `agentShutdown`, `agentFileRead`, etc.

  **Acceptance Criteria**:
  - [ ] All 8 new handlers exported from `src/tools/index.ts`

  **Commit**: NO (groups with Task 9)

---

- [ ] 4. Add Tool Names to types/tools.ts

  **What to do**:
  - Add 8 tool name strings to `TOOL_NAMES` array in `src/types/tools.ts`
  - Place them after existing agent tool names

  **Names to add**:
  ```typescript
  'proxmox_agent_fsfreeze_status',
  'proxmox_agent_fsfreeze_freeze',
  'proxmox_agent_fsfreeze_thaw',
  'proxmox_agent_fstrim',
  'proxmox_agent_get_memory_block_info',
  'proxmox_agent_suspend_disk',
  'proxmox_agent_suspend_ram',
  'proxmox_agent_suspend_hybrid',
  ```

  **Must NOT do**:
  - Don't change existing tool names
  - Don't reorder the array

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/types/tools.ts:1-239` — `TOOL_NAMES` array. Find where existing `proxmox_agent_*` names end and add after them.

  **Acceptance Criteria**:
  - [ ] 8 new tool names in `TOOL_NAMES` array
  - [ ] Array order: after existing agent tool names

  **Commit**: NO (groups with Task 9)

---

- [ ] 5. Add Tool Descriptions to server.ts

  **What to do**:
  - Add 8 description entries to `TOOL_DESCRIPTIONS` in `src/server.ts`
  - Place after existing agent tool descriptions
  - Add "(requires elevated permissions)" suffix for 6 elevated tools

  **Descriptions to add**:
  ```typescript
  proxmox_agent_fsfreeze_status: 'Get guest filesystem freeze status via QEMU agent',
  proxmox_agent_fsfreeze_freeze: 'Freeze guest filesystems for consistent backup via QEMU agent (requires elevated permissions)',
  proxmox_agent_fsfreeze_thaw: 'Thaw (unfreeze) guest filesystems via QEMU agent (requires elevated permissions)',
  proxmox_agent_fstrim: 'Discard unused blocks on guest filesystems via QEMU agent (requires elevated permissions)',
  proxmox_agent_get_memory_block_info: 'Get guest memory block size information via QEMU agent',
  proxmox_agent_suspend_disk: 'Suspend guest to disk (hibernate) via QEMU agent (requires elevated permissions)',
  proxmox_agent_suspend_ram: 'Suspend guest to RAM (sleep) via QEMU agent (requires elevated permissions)',
  proxmox_agent_suspend_hybrid: 'Hybrid suspend guest (RAM + disk) via QEMU agent (requires elevated permissions)',
  ```

  **Must NOT do**:
  - Don't change existing descriptions
  - Don't add trailing periods (existing descriptions don't have them)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/server.ts:16-312` — `TOOL_DESCRIPTIONS` record. Find existing `proxmox_agent_*` descriptions and add after them.

  **Acceptance Criteria**:
  - [ ] 8 new descriptions in `TOOL_DESCRIPTIONS`
  - [ ] 6 include "(requires elevated permissions)"
  - [ ] 2 do NOT include elevated text (fsfreeze-status, get-memory-block-info)

  **Commit**: NO (groups with Task 9)

---

- [ ] 6. Register in Registry + Update Count

  **What to do**:
  - Add 8 import lines for handlers (from `./index.js`) in `src/tools/registry.ts`
  - Add 8 import lines for schemas (from `../schemas/vm-advanced.js`)
  - Add 8 registry entries to `toolRegistry`
  - Update tool count assertion: 236 → 244

  **Registry entries to add** (after existing agent entries, ~line 877):
  ```typescript
  proxmox_agent_fsfreeze_status: { handler: agentFsfreezeStatus, schema: agentFsfreezeStatusSchema },
  proxmox_agent_fsfreeze_freeze: { handler: agentFsfreezeFreeze, schema: agentFsfreezeFreezeSchema },
  proxmox_agent_fsfreeze_thaw: { handler: agentFsfreezeThaw, schema: agentFsfreezeThawSchema },
  proxmox_agent_fstrim: { handler: agentFstrim, schema: agentFstrimSchema },
  proxmox_agent_get_memory_block_info: { handler: agentGetMemoryBlockInfo, schema: agentGetMemoryBlockInfoSchema },
  proxmox_agent_suspend_disk: { handler: agentSuspendDisk, schema: agentSuspendDiskSchema },
  proxmox_agent_suspend_ram: { handler: agentSuspendRam, schema: agentSuspendRamSchema },
  proxmox_agent_suspend_hybrid: { handler: agentSuspendHybrid, schema: agentSuspendHybridSchema },
  ```

  **Count update** (line 977):
  ```typescript
  // Change from:
  if (registeredCount !== 236) {
  // To:
  if (registeredCount !== 244) {
  ```

  **Must NOT do**:
  - Don't change existing registry entries
  - Don't restructure imports

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/registry.ts:856-877` — Existing agent registry entries (pattern to follow)
  - `src/tools/registry.ts:174-189` — Existing agent handler imports
  - `src/tools/registry.ts:975-981` — Tool count assertion to update

  **Acceptance Criteria**:
  - [ ] 8 new handler imports added
  - [ ] 8 new schema imports added
  - [ ] 8 new registry entries added
  - [ ] Count assertion: `registeredCount !== 244`

  **Commit**: NO (groups with Task 9)

---

- [ ] 7. Add Tests

  **What to do**:
  - Add tests to `src/tools/vm-advanced.test.ts`
  - 8 success case tests (one per tool)
  - 6 elevated permission denial tests (for destructive endpoints)
  - Total: 14 new tests minimum

  **Test structure per tool**:

  **For read-only tools (fsfreeze-status, get-memory-block-info):**
  ```typescript
  it('gets filesystem freeze status', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue('thawed');

    const result = await agentFsfreezeStatus(client, config, { node: 'pve1', vmid: 100 });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/agent/fsfreeze-status',
      'POST'
    );
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Freeze Status');
  });
  ```

  **For elevated tools (freeze, thaw, fstrim, suspend-*):**
  ```typescript
  it('freezes guest filesystems', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(3);

    const result = await agentFsfreezeFreeze(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Freeze');
  });

  it('requires elevated permissions for filesystem freeze', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await agentFsfreezeFreeze(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });
  ```

  **Mock return values by tool:**
  | Tool | Mock Value | Type |
  |------|-----------|------|
  | fsfreeze-status | `'thawed'` | string |
  | fsfreeze-freeze | `3` | number (frozen FS count) |
  | fsfreeze-thaw | `3` | number (thawed FS count) |
  | fstrim | `{ paths: [{ path: '/', trimmed: 1024, minimum: 0, error: '' }] }` | object |
  | get-memory-block-info | `{ size: 134217728 }` | object (128MB) |
  | suspend-disk | `undefined` | void |
  | suspend-ram | `undefined` | void |
  | suspend-hybrid | `undefined` | void |

  **Must NOT do**:
  - Don't modify existing tests
  - Don't add integration tests (only unit tests)
  - Don't add snapshot tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **References**:
  - `src/tools/vm-advanced.test.ts:144-152` — Simple agent test pattern (agentPing)
  - `src/tools/vm-advanced.test.ts:240-251` — Elevated permission denial test pattern
  - `src/tools/vm-advanced.test.ts:393-416` — Complex agent test with mock data (agentFileRead)
  - `src/tools/vm-advanced.test.ts:1-20` — Test file imports and setup

  **Acceptance Criteria**:
  - [ ] 8 success case tests (one per tool)
  - [ ] 6 elevated permission tests
  - [ ] All tests pass: `pnpm test`

  **Commit**: NO (groups with Task 9)

---

- [ ] 8. Build + Test Verification

  **What to do**:
  - Run full build and test suite
  - Fix any TypeScript errors or test failures

  **Commands:**
  ```bash
  pnpm build    # Must succeed with 0 errors
  pnpm test     # Must pass all tests (existing + 14 new)
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] `pnpm build` exits with code 0
  - [ ] `pnpm test` exits with code 0
  - [ ] No TypeScript errors
  - [ ] Tool registry validates 244 tools

  **Commit**: NO (groups with Task 9)

---

- [ ] 9. Create Changeset + Commit

  **What to do**:
  - Create changeset file `.changeset/remaining-agent-tools.md`
  - Stage all changes and commit

  **Changeset content:**
  ```markdown
  ---
  "@bldg-7/proxmox-mcp": minor
  ---

  Add remaining QEMU Guest Agent tools: filesystem freeze/thaw/trim, memory block info, and suspend operations (disk/RAM/hybrid). Total agent tools: 24. Total tools: 244.
  ```

  **Commit message:**
  ```
  feat(agent): add remaining qemu agent tools (fsfreeze, fstrim, suspend, memory-block-info)
  ```

  **Files to stage:**
  - `src/schemas/vm-advanced.ts`
  - `src/tools/vm-advanced.ts`
  - `src/tools/index.ts`
  - `src/types/tools.ts`
  - `src/server.ts`
  - `src/tools/registry.ts`
  - `src/tools/vm-advanced.test.ts`
  - `.changeset/remaining-agent-tools.md`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Acceptance Criteria**:
  - [ ] Changeset file exists at `.changeset/remaining-agent-tools.md`
  - [ ] Contains `"@bldg-7/proxmox-mcp": minor`
  - [ ] All files committed
  - [ ] Commit message follows conventional commits format

  **Commit**: YES
  - Message: `feat(agent): add remaining qemu agent tools (fsfreeze, fstrim, suspend, memory-block-info)`
  - Files: all 8 files listed above
  - Pre-commit: `pnpm build && pnpm test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 9 | `feat(agent): add remaining qemu agent tools (fsfreeze, fstrim, suspend, memory-block-info)` | 8 files | `pnpm build && pnpm test` |

---

## Success Criteria

### Verification Commands
```bash
pnpm build     # Expected: exit 0, no errors
pnpm test      # Expected: exit 0, all tests pass
```

### Final Checklist
- [ ] 8 new tools implemented (244 total)
- [ ] 6 tools require elevated permissions
- [ ] 2 tools are read-only
- [ ] 14+ new tests pass
- [ ] Build succeeds
- [ ] Changeset created
- [ ] Single commit with conventional message
