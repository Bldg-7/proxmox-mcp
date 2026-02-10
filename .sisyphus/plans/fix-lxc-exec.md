# Fix Broken LXC Command Execution & Misleading Description

## TL;DR

> **Quick Summary**: Remove the broken LXC code path from `proxmox_execute_vm_command` (which sends wrong format to Proxmox's batch API endpoint) and fix all related descriptions, tests, and docs to accurately reflect QEMU-only support.
> 
> **Deliverables**:
> - Fixed `command.ts` with LXC code path removed and dead code cleaned
> - Schema updated with helpful rejection message for LXC type
> - Tool description corrected in `server.ts`
> - Tests updated (LXC success test → LXC rejection test)
> - English and Korean docs updated
> - Agent skills docs updated with correct tool name references
> 
> **Estimated Effort**: Short (4 tasks, ~30 min execution)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 (source fix → verification)

---

## Context

### Original Request
User noticed that `/nodes/{node}/lxc/{vmid}/exec` might exist in the Proxmox API but the tool description says "LXC unsupported." Investigation revealed deeper problems: no such API endpoint exists, AND the current LXC code path is broken.

### Interview Summary
**Key Discussions**:
- Investigation confirmed `/nodes/{node}/lxc/{vmid}/exec` does NOT exist in Proxmox API (verified via pve-container.git source code, Nodes.pm, two background agents)
- The Proxmox `/nodes/{node}/execute` endpoint is a BATCH API call executor expecting JSON array of `{path, method, args}` objects — NOT a shell command executor
- Current `command.ts:31-37` sends a plain string to `commands` parameter — fails Proxmox-side validation
- QEMU has proper `/agent/exec` via QEMU Guest Agent; LXC has no equivalent REST API
- User chose "Create a work plan" for comprehensive fix

**Research Findings**:
- Proxmox VE API (all versions through 9.1.5) has NO LXC exec REST endpoint
- `pve-container.git/src/PVE/API2/LXC/` contains only: Config.pm, Snapshot.pm, Status.pm
- LXC vmdiridx lists 15 subdirs, none is "exec" or "agent"
- The `escapeShellArg` helper in command.ts is dead code — only used by the LXC branch
- `scripts/tool-docs.md` is auto-generated (line 1: "Generated: 2026-02-08") — excluded from scope
- `skills/` directory mirrors `docs/skills/` — both need updating
- Multiple docs reference nonexistent `proxmox_agent_exec` tool (should be `proxmox_execute_vm_command`)

### Metis Review
**Identified Gaps** (addressed):
- `escapeShellArg` is dead code after LXC removal — included in Task 1
- Schema strategy (remove enum vs refine with error) — using `.refine()` for better AI agent UX
- `skills/` mirrors `docs/skills/` — both updated in Task 2
- `scripts/tool-docs.md` is auto-generated — excluded from scope
- Troubleshooting docs reference nonexistent `proxmox_agent_exec` — fixed in Task 2
- Korean docs must be updated in parallel — included in Task 2
- Test count must stay at 808 — LXC test replaced, not deleted

---

## Work Objectives

### Core Objective
Remove the broken LXC command execution code path and align all descriptions, schemas, tests, and documentation to accurately reflect that `proxmox_execute_vm_command` is QEMU-only (via QEMU Guest Agent).

### Concrete Deliverables
- `src/tools/command.ts` — LXC branch removed, dead code cleaned
- `src/schemas/vm.ts` — type field updated with LXC rejection
- `src/server.ts` — tool description fixed
- `src/tools/command.test.ts` — LXC test replaced
- `docs/TOOLS.md` — execute_vm_command section updated
- `docs/TOOLS_ko.md` — Korean translation updated
- `docs/skills/proxmox-vm.md` — QEMU-only note
- `docs/skills/proxmox-vm-lxc-shared.md` — fix `proxmox_agent_exec` → correct tool name
- `docs/skills/proxmox-troubleshooting.md` — fix `proxmox_agent_exec` → correct tool name
- `skills/proxmox-mcp-tools/references/proxmox-vm.md` — mirror update
- `skills/proxmox-mcp-tools/references/proxmox-vm-lxc-shared.md` — mirror update  
- `skills/proxmox-admin/references/proxmox-troubleshooting.md` — mirror update

### Definition of Done
- [ ] `pnpm test --run` → 808 tests pass (0 failures)
- [ ] `pnpm typecheck` → exit code 0
- [ ] `pnpm lint` → exit code 0
- [ ] `grep -rn "escapeShellArg" src/` → no results
- [ ] `grep -rn "type.*lxc" src/tools/command.ts` → no results
- [ ] `grep -r "LXC exec capability" docs/ skills/` → no results
- [ ] `grep -r "proxmox_agent_exec[^_]" docs/ skills/` → no results (stale reference gone)

### Must Have
- LXC type rejected at schema level with a helpful error message (not cryptic Zod validation failure)
- QEMU code path (lines 50-64 of command.ts) remains **completely untouched**
- Test count stays at 808 (replace LXC test, don't just delete)
- Both English AND Korean docs updated

### Must NOT Have (Guardrails)
- ❌ Do NOT rename `proxmox_execute_vm_command` — breaking MCP API change
- ❌ Do NOT add new LXC execution features (SSH support, pct exec wrapper, etc.) — new feature, not a fix
- ❌ Do NOT modify `CHANGELOG.md` — historical record
- ❌ Do NOT touch `src/validators/index.ts` — `validateCommand` works correctly
- ❌ Do NOT touch the QEMU code path (lines 50-64 of `command.ts`)
- ❌ Do NOT reduce test count below 808
- ❌ Do NOT change tool count or README
- ❌ Do NOT update `scripts/tool-docs.md` — it's auto-generated
- ❌ Do NOT add emoji to code or docs (maintain existing style)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (modify existing tests)
- **Framework**: vitest (via `pnpm test`)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

Every task includes specific verification commands. The executing agent runs these directly.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Fix source files (command.ts, vm.ts, server.ts, command.test.ts)
└── Task 2: Fix documentation (TOOLS.md, TOOLS_ko.md, skills docs)

Wave 2 (After Wave 1):
└── Task 3: Full verification suite

Post-Verification:
└── Task 4: Commit all changes
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | 4 | None |
| 4 | 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | task(category="quick", ...) in parallel |
| 2 | 3, 4 | task(category="quick", ...) sequential |

---

## TODOs

- [x] 1. Fix Source Files (command.ts, vm.ts, server.ts, command.test.ts)

  **What to do**:
  
  **1a. `src/tools/command.ts`** — Remove LXC branch and dead code:
  - Remove lines 27-29 (`escapeShellArg` helper function — dead code, only used by LXC branch)
  - Remove lines 31-48 (entire `if (type === 'lxc') { ... }` block)
  - The QEMU path (current lines 50-64) becomes the only path. **Do NOT modify it.**
  - After removal, the `type` variable (line 25) becomes unused — remove it too since schema now rejects 'lxc' and only 'qemu' passes

  **1b. `src/schemas/vm.ts`** — Add helpful LXC rejection:
  - Change line 70 from:
    ```typescript
    type: z.enum(['qemu', 'lxc']).default('qemu').describe('VM type'),
    ```
    To:
    ```typescript
    type: z.enum(['qemu']).default('qemu').describe('VM type (QEMU only — LXC containers do not have an exec API)'),
    ```
  - This approach: Zod rejects 'lxc' at validation level with a clear error. The `.describe()` provides context in tool discovery.
  - Update the `ExecuteVmCommandInput` type export — no change needed, it derives from the schema automatically.

  **1c. `src/server.ts`** — Fix tool description:
  - Change line 346 from:
    ```
    proxmox_execute_vm_command: 'Execute a shell command on a QEMU VM via guest agent (requires QEMU Guest Agent; LXC unsupported)',
    ```
    To:
    ```
    proxmox_execute_vm_command: 'Execute a shell command on a QEMU VM via guest agent (requires QEMU Guest Agent running inside the VM)',
    ```

  **1d. `src/tools/command.test.ts`** — Replace LXC success test with rejection test:
  - Replace test at lines 41-59 ("executes command on LXC container") with:
    ```typescript
    it('rejects LXC type', async () => {
      const client = createMockProxmoxClient();
      const config = createTestConfig({ allowElevated: true });

      const result = await executeVMCommand(client, config, {
        node: 'pve1',
        vmid: 100,
        command: 'whoami',
        type: 'lxc' as any,
      });

      expect(result.isError).toBe(true);
    });
    ```
  - Note: `as any` is needed because TypeScript won't allow 'lxc' after schema change. The test validates runtime rejection.
  - Keep all other 7 tests unchanged (permission check, QEMU exec, 3 dangerous chars, node validation, VMID validation).

  **Must NOT do**:
  - Do NOT rename the tool function `executeVMCommand` or its export
  - Do NOT touch the QEMU request path (`/nodes/${safeNode}/${type}/${safeVmid}/agent/exec`)
  - Do NOT modify `src/validators/index.ts`
  - Do NOT modify `src/tools/registry.ts` or `src/tools/index.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, surgical changes to 4 files with exact line references
  - **Skills**: []
    - No specialized skills needed — standard TypeScript editing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3 (verification)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/tools/command.ts:31-48` — The LXC branch to REMOVE (sends wrong format to `/nodes/{node}/execute`)
  - `src/tools/command.ts:27-29` — The `escapeShellArg` dead code to REMOVE
  - `src/tools/command.ts:50-64` — The QEMU path to PRESERVE (do NOT touch)
  - `src/tools/command.ts:25` — `const type = validated.type || 'qemu';` — becomes unused after LXC removal

  **API/Type References**:
  - `src/schemas/vm.ts:66-73` — Schema definition for `executeVmCommandSchema`

  **Test References**:
  - `src/tools/command.test.ts:41-59` — LXC test to REPLACE with rejection test
  - `src/tools/command.test.ts:22-39` — QEMU test to PRESERVE (verify still passes)
  - `src/tools/command.test.ts:61-134` — Validation tests to PRESERVE

  **Acceptance Criteria**:

  - [ ] `escapeShellArg` removed: `grep -rn "escapeShellArg" src/` → no results
  - [ ] LXC code path removed: `grep -n "pct exec" src/tools/command.ts` → no results
  - [ ] Schema rejects LXC: `grep "enum.*qemu.*lxc" src/schemas/vm.ts` → no results
  - [ ] Description fixed: `grep "LXC unsupported" src/server.ts` → no results
  - [ ] LXC test replaced: `grep "rejects LXC type" src/tools/command.test.ts` → found
  - [ ] pnpm typecheck → exit 0
  - [ ] pnpm test --run src/tools/command.test.ts → 8 tests pass, 0 fail

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Source files compile after changes
    Tool: Bash
    Preconditions: All 4 source file edits complete
    Steps:
      1. Run: pnpm typecheck
      2. Assert: exit code 0, no errors in output
    Expected Result: Clean TypeScript compilation
    Evidence: Terminal output captured

  Scenario: Command tests all pass after LXC test replacement
    Tool: Bash
    Preconditions: command.test.ts updated with new rejection test
    Steps:
      1. Run: pnpm test --run src/tools/command.test.ts
      2. Assert: 8 tests pass, 0 failures
      3. Assert: Output contains "rejects LXC type" test name
    Expected Result: All 8 tests pass including new rejection test
    Evidence: Test output captured

  Scenario: Dead code fully removed
    Tool: Bash
    Preconditions: command.ts edited
    Steps:
      1. Run: grep -rn "escapeShellArg" src/
      2. Assert: no output (empty)
      3. Run: grep -n "pct exec" src/tools/command.ts
      4. Assert: no output (empty)
      5. Run: grep -n "type.*===.*lxc" src/tools/command.ts
      6. Assert: no output (empty)
    Expected Result: No remnants of LXC code path in source
    Evidence: grep outputs captured
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `fix(command): remove broken LXC exec path and fix QEMU-only description`
  - Files: `src/tools/command.ts`, `src/schemas/vm.ts`, `src/server.ts`, `src/tools/command.test.ts`
  - Pre-commit: `pnpm test --run src/tools/command.test.ts`

---

- [x] 2. Fix Documentation (English, Korean, Agent Skills)

  **What to do**:

  **2a. `docs/TOOLS.md`** — Fix execute_vm_command section:
  - Line 3682: Change `| \`type\` | string | Yes | \`qemu\` or \`lxc\` |` → `| \`type\` | string | No | VM type (default: \`qemu\`, QEMU only) |`
  - Line 3685: Change `**Note**: Requires QEMU Guest Agent or LXC exec capability.` → `**Note**: Requires QEMU Guest Agent running inside the VM. LXC containers are not supported (no exec API).`
  - Lines 2298, 2323 reference `proxmox_list_vms` and `proxmox_get_vm_status` type filters — these are CORRECT (they filter by VM type, not exec). Do NOT change them.

  **2b. `docs/TOOLS_ko.md`** — Same changes in Korean:
  - Line 2647: Change `| \`type\` | string | 예 | \`qemu\` 또는 \`lxc\` |` → `| \`type\` | string | 아니오 | VM 유형 (기본값: \`qemu\`, QEMU 전용) |`
  - Find the equivalent Note line and update to: `**참고**: VM 내부에 QEMU Guest Agent가 실행 중이어야 합니다. LXC 컨테이너는 지원되지 않습니다 (exec API 없음).`

  **2c. `docs/skills/proxmox-vm-lxc-shared.md`** — Fix stale tool name:
  - Line 12: `proxmox_agent_exec` → `proxmox_execute_vm_command`
  - Line 32: `proxmox_agent_exec_status` → `proxmox_agent_exec_status` (this one is a REAL tool in vm-advanced.ts, keep as-is)
  - Add note: QEMU VMs only, LXC containers not supported

  **2d. `docs/skills/proxmox-troubleshooting.md`** — Fix stale tool name:
  - Line 66: `proxmox_agent_exec` → `proxmox_execute_vm_command`
  - Line 77: `proxmox_agent_exec` → `proxmox_execute_vm_command`
  - Line 333: `proxmox_agent_exec` → `proxmox_execute_vm_command`

  **2e. Mirror updates to `skills/` directory** (same content as docs/skills/):
  - `skills/proxmox-mcp-tools/references/proxmox-vm-lxc-shared.md` — same as 2c
  - `skills/proxmox-admin/references/proxmox-troubleshooting.md` — same as 2d

  **Must NOT do**:
  - Do NOT update `scripts/tool-docs.md` — it's auto-generated
  - Do NOT update `CHANGELOG.md`
  - Do NOT change list_vms or get_vm_status type filter docs (those are correct)
  - Do NOT rename tool name in docs (keep `proxmox_execute_vm_command`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Text-only documentation changes with exact line references
  - **Skills**: []
    - No specialized skills needed — standard text editing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3 (verification)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Documentation References**:
  - `docs/TOOLS.md:3675-3690` — execute_vm_command section with wrong LXC references
  - `docs/TOOLS_ko.md:2640-2650` — Korean translation of same section
  - `docs/skills/proxmox-vm-lxc-shared.md:12,32` — Stale `proxmox_agent_exec` reference
  - `docs/skills/proxmox-troubleshooting.md:66,77,333` — Stale `proxmox_agent_exec` references
  - `skills/proxmox-mcp-tools/references/proxmox-vm-lxc-shared.md` — Mirror of docs/skills
  - `skills/proxmox-admin/references/proxmox-troubleshooting.md` — Mirror of docs/skills

  **Acceptance Criteria**:

  - [ ] No "LXC exec capability" in docs: `grep -r "LXC exec capability" docs/ skills/` → no results
  - [ ] No stale proxmox_agent_exec references (except the real tool `proxmox_agent_exec_status`):
        `grep -r "proxmox_agent_exec[^_]" docs/ skills/` → no results
  - [ ] Korean docs updated: `grep "qemu.*또는.*lxc" docs/TOOLS_ko.md` → only in list_vms/get_vm_status sections (lines ~1516, ~1541), NOT in execute section

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: No stale LXC exec references remain
    Tool: Bash
    Preconditions: All doc files edited
    Steps:
      1. Run: grep -r "LXC exec capability" docs/ skills/
      2. Assert: no output (empty)
      3. Run: grep -rn "proxmox_agent_exec[^_]" docs/ skills/
      4. Assert: no output (empty — all renamed to proxmox_execute_vm_command)
    Expected Result: All stale references cleaned up
    Evidence: grep outputs captured

  Scenario: Korean docs consistency
    Tool: Bash
    Preconditions: TOOLS_ko.md edited
    Steps:
      1. Run: grep -n "QEMU 전용" docs/TOOLS_ko.md
      2. Assert: at least 1 match in execute_vm_command section
    Expected Result: Korean docs have QEMU-only note
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `fix(command): remove broken LXC exec path and fix QEMU-only description`
  - Files: All doc files listed above
  - Pre-commit: N/A (docs only)

---

- [x] 3. Full Verification Suite

  **What to do**:
  - Run complete test suite: `pnpm test --run`
  - Run TypeScript check: `pnpm typecheck`
  - Run linter: `pnpm lint`
  - Verify Definition of Done checklist (7 items)

  **Must NOT do**:
  - Do NOT fix issues by modifying files outside the scope of Tasks 1-2
  - If any verification fails, report the failure — do not expand scope

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Only runs verification commands, no file changes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: Task 4 (commit)
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Test References**:
  - `package.json` — test/typecheck/lint scripts

  **Acceptance Criteria**:

  - [ ] `pnpm test --run` → 808 tests pass, 0 failures
  - [ ] `pnpm typecheck` → exit code 0
  - [ ] `pnpm lint` → exit code 0
  - [ ] `grep -rn "escapeShellArg" src/` → no results
  - [ ] `grep -rn "type.*lxc" src/tools/command.ts` → no results
  - [ ] `grep -r "LXC exec capability" docs/ skills/` → no results
  - [ ] `grep -r "proxmox_agent_exec[^_]" docs/ skills/` → no results

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full test suite passes with correct count
    Tool: Bash
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: pnpm test --run 2>&1
      2. Assert: output contains "808" (or close) and "passed"
      3. Assert: output contains "0 failed" or no "failed" line
      4. Assert: exit code 0
    Expected Result: All 808 tests pass
    Evidence: Full test output captured

  Scenario: Type checking and lint pass
    Tool: Bash
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: pnpm typecheck
      2. Assert: exit code 0
      3. Run: pnpm lint
      4. Assert: exit code 0
    Expected Result: Clean TypeScript compilation and lint
    Evidence: Terminal output captured

  Scenario: All Definition of Done grep checks pass
    Tool: Bash
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: grep -rn "escapeShellArg" src/
      2. Assert: empty output
      3. Run: grep -rn "type.*lxc" src/tools/command.ts
      4. Assert: empty output
      5. Run: grep -r "LXC exec capability" docs/ skills/
      6. Assert: empty output
      7. Run: grep -r "proxmox_agent_exec[^_]" docs/ skills/
      8. Assert: empty output
    Expected Result: All negative checks pass (no stale code/docs)
    Evidence: grep outputs captured
  ```

  **Commit**: NO (verification only)

---

- [x] 4. Commit and Push

  **What to do**:
  - Stage all changed files from Tasks 1 and 2
  - Create a single atomic commit with message: `fix(command): remove broken LXC exec path and fix QEMU-only description`
  - Push to `origin/main`

  **Must NOT do**:
  - Do NOT include `scripts/tool-docs.md` in the commit (auto-generated)
  - Do NOT amend existing commits

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single git commit + push
  - **Skills**: [`git-master`]
    - `git-master`: Needed for atomic commit best practices

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - Recent commits in repo follow `type(scope): description` format
  - Last commit: `f2c76ae chore: mark all sisyphus plans as complete`

  **Acceptance Criteria**:

  - [ ] Commit created with correct message format
  - [ ] All expected files included in commit (source + docs)
  - [ ] Push to `origin/main` successful
  - [ ] `git status` shows clean working directory

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Commit is clean and pushed
    Tool: Bash
    Preconditions: Task 3 verification passed
    Steps:
      1. Run: git add -A && git status
      2. Assert: All expected files staged
      3. Run: git commit -m "fix(command): remove broken LXC exec path and fix QEMU-only description"
      4. Assert: commit succeeds
      5. Run: git push origin main
      6. Assert: push succeeds
      7. Run: git status
      8. Assert: "nothing to commit, working tree clean"
    Expected Result: Changes committed and pushed
    Evidence: git output captured
  ```

  **Commit**: YES
  - Message: `fix(command): remove broken LXC exec path and fix QEMU-only description`
  - Files: `src/tools/command.ts`, `src/schemas/vm.ts`, `src/server.ts`, `src/tools/command.test.ts`, `docs/TOOLS.md`, `docs/TOOLS_ko.md`, `docs/skills/proxmox-vm-lxc-shared.md`, `docs/skills/proxmox-troubleshooting.md`, `skills/proxmox-mcp-tools/references/proxmox-vm-lxc-shared.md`, `skills/proxmox-admin/references/proxmox-troubleshooting.md`
  - Pre-commit: `pnpm test --run` (808 pass)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 4 (final) | `fix(command): remove broken LXC exec path and fix QEMU-only description` | 10 files (4 source + 6 docs) | pnpm test (808 pass) |

---

## Success Criteria

### Verification Commands
```bash
pnpm test --run              # Expected: 808 tests, 0 failures
pnpm typecheck               # Expected: exit 0
pnpm lint                    # Expected: exit 0
grep -rn "escapeShellArg" src/  # Expected: no results
grep -n "pct exec" src/tools/command.ts  # Expected: no results
grep "LXC unsupported" src/server.ts  # Expected: no results
grep -r "LXC exec capability" docs/ skills/  # Expected: no results
grep -r "proxmox_agent_exec[^_]" docs/ skills/  # Expected: no results
```

### Final Checklist
- [ ] All "Must Have" present (LXC rejection, QEMU path preserved, 808 tests, both language docs)
- [ ] All "Must NOT Have" absent (no rename, no new features, no changelog edit, no QEMU path changes)
- [ ] All tests pass
- [ ] All docs consistent (English + Korean + skills)
