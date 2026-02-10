# Update Skill Docs for 309 Tools

## TL;DR

> **Quick Summary**: Update all skill/reference documentation to reflect 2 new tools (`proxmox_update_vm_config`, `proxmox_update_lxc_config`), changing tool count from 307→309 across SKILL.md, reference files, and their docs/skills/ mirrors.
>
> **Deliverables**:
> - SKILL.md updated (307→309, elevated 205→207, category counts, references section)
> - Tool entries added to proxmox-vm.md and proxmox-lxc.md
> - proxmox-mcp.md updated with new counts
> - docs/skills/ mirrors kept identical
>
> **Estimated Effort**: Quick (2 tasks, ~15 min execution)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2

---

## Context

### Original Request
After implementing `proxmox_update_vm_config` and `proxmox_update_lxc_config` (commit `e9cc1e7`), skill documentation was explicitly deferred. User now requests this update.

### Interview Summary
**Key Discussions**:
- Skill docs were explicitly excluded from the implementation plan: "Do NOT update SubAgent/skills docs — defer to separate task"
- User confirmed they want the update now

**Research Findings**:
- SKILL.md has 8 occurrences of "307" plus category table counts and references section counts
- `docs/skills/` is an exact mirror of `skills/proxmox-mcp-tools/references/`
- Pre-existing count discrepancy: SKILL.md table (QEMU=25, LXC=18) vs file headers (VM=30, LXC=20) — different counting methodologies, not a bug
- Line 64 has elevated split: `102 basic + 205 elevated = 307 total` → must become `102 basic + 207 elevated = 309 total`
- `scripts/extract-tool-docs.ts` already knows about both new tools (updated in Task 1)
- Tool entries should be inserted alphabetically after `proxmox_update_network_*`

### Metis Review
**Identified Gaps** (addressed):
- Elevated count on line 64 needs `205→207` (not just `307→309`) — both new tools are elevated
- SKILL.md References section (lines 231-232) has per-domain counts that also need incrementing
- `proxmox-mcp.md` has per-domain counts in Quick Links table
- Mirror identity between `docs/skills/` and `skills/.../references/` must be verified via `diff`
- `scripts/tool-docs.md` and `scripts/tool-docs.json` are stale but auto-generated — run script to fix

---

## Work Objectives

### Core Objective
Update all skill documentation to reflect 309 tools (was 307), including new tool entries for `proxmox_update_vm_config` and `proxmox_update_lxc_config`.

### Concrete Deliverables
- `skills/proxmox-mcp-tools/SKILL.md` — all counts updated
- `skills/proxmox-mcp-tools/references/proxmox-vm.md` — new tool entry + header count
- `skills/proxmox-mcp-tools/references/proxmox-lxc.md` — new tool entry + header count
- `skills/proxmox-mcp-tools/references/proxmox-mcp.md` — all counts updated
- `docs/skills/proxmox-vm.md` — mirror of proxmox-vm.md
- `docs/skills/proxmox-lxc.md` — mirror of proxmox-lxc.md
- `docs/skills/proxmox-mcp.md` — mirror of proxmox-mcp.md

### Definition of Done
- [ ] `grep -r "307" skills/proxmox-mcp-tools/ docs/skills/` → zero matches
- [ ] `grep "proxmox_update_vm_config" skills/proxmox-mcp-tools/references/proxmox-vm.md` → found
- [ ] `grep "proxmox_update_lxc_config" skills/proxmox-mcp-tools/references/proxmox-lxc.md` → found
- [ ] `diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md` → no diff
- [ ] `diff skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md` → no diff
- [ ] `diff skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md` → no diff
- [ ] `grep "207 elevated" skills/proxmox-mcp-tools/SKILL.md` → found

### Must Have
- All "307" → "309" in skill docs scope
- Elevated count `205→207` on SKILL.md line 64
- Category table counts updated (QEMU VMs 25→26, LXC 18→19)
- References section counts updated (25→26 tools, 18→19 tools)
- New tool entries with correct format (follow `proxmox_update_network_*` pattern)
- Mirror identity between docs/skills/ and references/

### Must NOT Have (Guardrails)
- ❌ Do NOT add workflow examples for new tools (e.g., cloud-init workflow in proxmox-workflows.md)
- ❌ Do NOT update `proxmox-admin` skill content
- ❌ Do NOT fix the pre-existing count discrepancy (SKILL.md 25/18 vs file 30/20) beyond +1 increment
- ❌ Do NOT update README.md, README_ko.md (already at 309)
- ❌ Do NOT update docs/TOOLS.md, docs/TOOLS_ko.md (already at 309)
- ❌ Do NOT update CHANGELOG.md
- ❌ Do NOT touch any source code files
- ❌ Do NOT touch SubAgent definition files

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: N/A (documentation only)
- **Automated tests**: None needed (no code changes)
- **Verification**: grep + diff commands only

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Update skill docs (SKILL.md, reference files, docs/skills mirrors)

Post-Docs:
└── Task 2: Verify + Commit + Push
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None |
| 2 | 1 | None | None (final) |

---

## TODOs

- [x] 1. Update Skill Documentation (SKILL.md, reference files, docs/skills mirrors)

  **What to do**:

  **1a. `skills/proxmox-mcp-tools/SKILL.md`** — Update all counts:

  | Line | Current | New |
  |------|---------|-----|
  | 3 | `...307 tools across...` | `...309 tools across...` |
  | 14 | `tool_count: 307` | `tool_count: 309` |
  | 21 | `reference for 307 Proxmox...` | `reference for 309 Proxmox...` |
  | 25 | `provides 307 comprehensive...` | `provides 309 comprehensive...` |
  | 29 | `307 tools organized...` | `309 tools organized...` |
  | 64 | `102 basic + 205 elevated = 307 total` | `102 basic + 207 elevated = 309 total` |
  | 79 | `QEMU VMs \| 25` | `QEMU VMs \| 26` |
  | 80 | `LXC Containers \| 18` | `LXC Containers \| 19` |
  | 93 | `**Total**: 307 tools` | `**Total**: 309 tools` |
  | 231 | `proxmox-vm.md — QEMU VM operations (25 tools)` | `(26 tools)` |
  | 232 | `proxmox-lxc.md — LXC container operations (18 tools)` | `(19 tools)` |

  **1b. `skills/proxmox-mcp-tools/references/proxmox-vm.md`** — Add tool entry + update header:

  - Update header: `**Tools in this file:** 30` → `**Tools in this file:** 31`
  - Add `proxmox_update_vm_config` entry AFTER `proxmox_update_network_vm` (alphabetical order)
  - Follow exact format of `proxmox_update_network_vm` entry (around lines 482-501):

  ```markdown
  #### `proxmox_update_vm_config`

  **Description:** Update QEMU VM configuration with arbitrary key-value pairs via PUT /config (requires elevated permissions). Supports cloud-init (ciuser, cipassword, ipconfig0), boot order, serial console, guest agent, and all other Proxmox config params. For resize (memory/cores) prefer proxmox_resize_vm. For disk/network prefer their specific tools. Use proxmox_get_vm_config to discover valid parameters.

  **Permission:** elevated

  **Parameters:**

  | Name | Type | Required | Description |
  |------|------|----------|-------------|
  | `node` | string | Yes | Node name where VM is located |
  | `vmid` | number | Yes | VM ID number |
  | `config` | object | No | Key-value pairs of VM configuration to set. Common keys: ciuser, cipassword, ipconfig0 (cloud-init), boot (boot order), agent (QEMU agent), serial0, vga, cpu, balloon, tags, description. Use proxmox_get_vm_config to discover valid keys. |
  | `delete` | string | No | Comma-separated list of config keys to REMOVE (e.g. "ciuser,cipassword"). Does NOT delete the VM. |

  ---
  ```

  **1c. `skills/proxmox-mcp-tools/references/proxmox-lxc.md`** — Add tool entry + update header:

  - Update header: `**Tools in this file:** 20` → `**Tools in this file:** 21`
  - Add `proxmox_update_lxc_config` entry AFTER `proxmox_update_network_lxc` (alphabetical order)
  - Follow exact format of `proxmox_update_network_lxc` entry:

  ```markdown
  #### `proxmox_update_lxc_config`

  **Description:** Update LXC container configuration with arbitrary key-value pairs via PUT /config (requires elevated permissions). Supports hostname, memory, cores, swap, mount points, network, and all other Proxmox LXC config params. For resize (memory/cores) prefer proxmox_resize_lxc. For network prefer proxmox_update_network_lxc. Use proxmox_get_lxc_config to discover valid parameters.

  **Permission:** elevated

  **Parameters:**

  | Name | Type | Required | Description |
  |------|------|----------|-------------|
  | `node` | string | Yes | Node name where container is located |
  | `vmid` | number | Yes | Container ID number |
  | `config` | object | No | Key-value pairs of container configuration to set. Common keys: hostname, memory, swap, cores, cpulimit, cpuunits, nameserver, searchdomain, tags, description, mp0-mpN (mount points). Use proxmox_get_lxc_config to discover valid keys. |
  | `delete` | string | No | Comma-separated list of config keys to REMOVE (e.g. "mp0,nameserver"). Does NOT delete the container. |

  ---
  ```

  **1d. `skills/proxmox-mcp-tools/references/proxmox-mcp.md`** — Update counts:

  - Line 3: `**307 tools**` → `**309 tools**`
  - Quick Links table: VM count `30` → `31`, LXC count `20` → `21`
  - Any other "307" references → "309"

  **1e. Mirror to `docs/skills/`** — Copy the 3 updated reference files:

  ```bash
  cp skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md
  cp skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md
  cp skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md
  ```

  **Must NOT do**:
  - Do NOT add workflows or examples beyond the tool entry itself
  - Do NOT update proxmox-admin skill
  - Do NOT fix pre-existing count discrepancies beyond +1 increment
  - Do NOT edit docs/skills/ files independently — always copy from references/

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward documentation update with clear patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (must be done before verification)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `skills/proxmox-mcp-tools/references/proxmox-vm.md:482-501` — `proxmox_update_network_vm` entry format (FOLLOW THIS EXACTLY)
  - `skills/proxmox-mcp-tools/references/proxmox-lxc.md:326-344` — `proxmox_update_network_lxc` entry format
  - `skills/proxmox-mcp-tools/SKILL.md:64` — Elevated count split line
  - `skills/proxmox-mcp-tools/SKILL.md:79-80` — Category table counts
  - `skills/proxmox-mcp-tools/SKILL.md:231-232` — References section per-domain counts

  **Source of Truth References**:
  - `src/server.ts:266-267` — Tool descriptions (copy verbatim)
  - `src/schemas/vm.ts:237-262` — Tool parameters (derive from Zod schema)

  **Acceptance Criteria**:
  - [ ] `grep -r "307" skills/proxmox-mcp-tools/ docs/skills/` → zero matches
  - [ ] `grep "proxmox_update_vm_config" skills/proxmox-mcp-tools/references/proxmox-vm.md` → found
  - [ ] `grep "proxmox_update_lxc_config" skills/proxmox-mcp-tools/references/proxmox-lxc.md` → found
  - [ ] `grep "207 elevated" skills/proxmox-mcp-tools/SKILL.md` → found
  - [ ] `grep "QEMU VMs.*26" skills/proxmox-mcp-tools/SKILL.md` → found
  - [ ] `grep "LXC Containers.*19" skills/proxmox-mcp-tools/SKILL.md` → found
  - [ ] `head -5 skills/proxmox-mcp-tools/references/proxmox-vm.md` → shows "31"
  - [ ] `head -5 skills/proxmox-mcp-tools/references/proxmox-lxc.md` → shows "21"
  - [ ] `diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md` → no output
  - [ ] `diff skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md` → no output
  - [ ] `diff skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md` → no output

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Zero "307" references remain in skill docs
    Tool: Bash
    Steps:
      1. Run: grep -r "307" skills/proxmox-mcp-tools/ docs/skills/
      2. Assert: exit code 1 (no matches)
    Expected Result: No output

  Scenario: New tool entries exist in reference files
    Tool: Bash
    Steps:
      1. Run: grep "proxmox_update_vm_config" skills/proxmox-mcp-tools/references/proxmox-vm.md
      2. Assert: match found
      3. Run: grep "proxmox_update_lxc_config" skills/proxmox-mcp-tools/references/proxmox-lxc.md
      4. Assert: match found
    Expected Result: Both tools documented

  Scenario: docs/skills mirrors are identical
    Tool: Bash
    Steps:
      1. Run: diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md
      2. Assert: no output (exit 0)
      3. Run: diff skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md
      4. Assert: no output (exit 0)
      5. Run: diff skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md
      6. Assert: no output (exit 0)
    Expected Result: Files are identical
  ```

  **Commit**: YES (groups with Task 2)

---

- [x] 2. Verify + Commit + Push

  **What to do**:
  - Run full verification suite
  - Create atomic commit
  - Push to origin/main

  **Verification commands**:
  ```bash
  grep -r "307" skills/proxmox-mcp-tools/ docs/skills/   # zero matches
  grep "309" skills/proxmox-mcp-tools/SKILL.md | wc -l    # should be 7+
  grep "207 elevated" skills/proxmox-mcp-tools/SKILL.md   # found
  grep "proxmox_update_vm_config" skills/proxmox-mcp-tools/references/proxmox-vm.md   # found
  grep "proxmox_update_lxc_config" skills/proxmox-mcp-tools/references/proxmox-lxc.md # found
  diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md    # no diff
  diff skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md  # no diff
  diff skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md  # no diff
  pnpm test --run   # all tests still pass
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (final)
  - **Blocked By**: Task 1

  **Acceptance Criteria**:
  - [ ] Commit created with message: `docs(skills): update skill docs for 309 tools (add proxmox_update_vm_config, proxmox_update_lxc_config)`
  - [ ] Push to origin/main successful
  - [ ] git status clean

  **Commit**: YES
  - Message: `docs(skills): update skill docs for 309 tools (add proxmox_update_vm_config, proxmox_update_lxc_config)`
  - Files: ~7 documentation files
  - Pre-commit: `pnpm test --run`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 (final) | `docs(skills): update skill docs for 309 tools (add proxmox_update_vm_config, proxmox_update_lxc_config)` | ~7 skill/docs files | grep + diff |

---

## Success Criteria

### Verification Commands
```bash
grep -r "307" skills/proxmox-mcp-tools/ docs/skills/     # Expected: zero matches
grep "207 elevated" skills/proxmox-mcp-tools/SKILL.md     # Expected: found
grep "QEMU VMs.*26" skills/proxmox-mcp-tools/SKILL.md     # Expected: found
grep "LXC Containers.*19" skills/proxmox-mcp-tools/SKILL.md # Expected: found
diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md   # Expected: no diff
diff skills/proxmox-mcp-tools/references/proxmox-lxc.md docs/skills/proxmox-lxc.md # Expected: no diff
diff skills/proxmox-mcp-tools/references/proxmox-mcp.md docs/skills/proxmox-mcp.md # Expected: no diff
```

### Final Checklist
- [ ] All "307" replaced with "309" in skill docs scope
- [ ] Elevated count updated: 205→207
- [ ] Category counts updated: QEMU VMs 25→26, LXC 18→19
- [ ] References section counts updated: 25→26, 18→19
- [ ] New tool entries follow exact format of existing entries
- [ ] docs/skills/ mirrors identical to references/
- [ ] Commit pushed to origin/main
