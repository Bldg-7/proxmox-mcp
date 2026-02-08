# Documentation Update: 307 Tools

## TL;DR

> **Quick Summary**: Update all documentation files (skills, agents, docs, READMEs) to reflect the current 307 tools (up from stale counts of 143/227). Includes updating the doc generation script's domain mapping, re-running it, manually updating non-generated files, and fixing stale numbers/phantom tool names throughout.
> 
> **Deliverables**:
> - Updated `scripts/extract-tool-docs.ts` with domain mapping for all 307 tools
> - Regenerated `docs/skills/*.md` and `skills/proxmox-mcp-tools/references/*.md` (auto-generated from script)
> - Updated `docs/TOOLS.md` with all 63 new tool entries + fixed "Unimplemented" section
> - Updated `skills/proxmox-mcp-tools/SKILL.md` metadata and domain table
> - Updated all 7 `agents/*.md` files with new tools and fixed phantom tool names
> - Updated `README.md` and `README_ko.md` with correct counts (307 tools, 808 tests)
> - Updated `docs/TOOLS_ko.md` with correct counts (number-only, not full Korean tool docs)
> - Updated `skills/proxmox-admin/SKILL.md` and references if needed
> - Zero stale "143" or "227" occurrences in any `.md` file
> 
> **Estimated Effort**: Large (40+ files, ~8-10 tasks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (script) → Task 2 (run script) → Tasks 3-8 (parallel manual updates) → Task 9 (validation)

---

## Context

### Original Request
"추가된 도구들을 skill과 agent 문서에 모두 반영해" (Reflect all added tools in skill and agent documentation)

### Interview Summary
**Key Discussions**:
- All 14 tool implementation tasks complete (244→307 tools, 808 tests)
- 63 new tools across 14 categories implemented and committed
- Documentation has THREE different stale levels: README at 143, TOOLS.md/SKILL.md at 227, actual is 307

**Research Findings (Metis)**:
- `scripts/extract-tool-docs.ts` DOMAIN_MAPPING only covers 11 domains / 227 tools — must be updated first
- 27 occurrences of stale numbers across 8 files (143 ×11, 227 ×10, etc.)
- **39 phantom/wrong tool names** found across ALL 7 agent files (detailed audit in Task 7):
  - access-admin (7), cluster-admin (9), storage-admin (10), lxc-manager (5), vm-manager (2), monitor (1), network-admin (5)
  - Patterns: `get_` should be `list_`, removed suffixes (`_job` missing), nonexistent tools referenced
- `docs/TOOLS.md` "Unimplemented" section lists Certificates & SSL and Disk Operations — these are now implemented
- Version numbers stale: SKILL.md says `0.4.2`, TOOLS.md says `0.1.5` (should be `0.6.0` — next release version)
- Test count stale: README says "405 tests" (actual: 808)

### Metis Review
**Identified Gaps** (addressed):
- Script domain mapping blocker → Task 1 addresses this
- Korean docs scope → Decided: number-only updates (not full translation)
- 39 phantom tool names (expanded from initial 7) → Task 7 addresses systematic audit
- Stale version/test numbers → Included in relevant tasks
- "Unimplemented" section cleanup → Task 4 addresses this

---

## Work Objectives

### Core Objective
Update ALL documentation to accurately reflect 307 tools across 14 domains, fixing stale numbers, phantom tool names, and version references throughout.

### Concrete Deliverables
- `scripts/extract-tool-docs.ts` with complete 307-tool DOMAIN_MAPPING
- 14 regenerated reference docs in `docs/skills/` and `skills/proxmox-mcp-tools/references/`
- `docs/TOOLS.md` with 63 new tool entries
- `skills/proxmox-mcp-tools/SKILL.md` with updated metadata
- 7 updated agent files
- 2 updated READMEs (EN + KO)
- `docs/TOOLS_ko.md` with updated counts
- `skills/proxmox-admin/SKILL.md` and references updated if needed

### Definition of Done
- [x] `grep -rn "143 tools\|143개\|143 comprehensive\|**143**" --include="*.md" .` returns 0 results ✅
- [x] `grep -rn "227 tools\|227 comprehensive\|**227**\|tool_count: 227\|across 11 domains" --include="*.md" .` returns 0 results ✅
- [x] All tool names in `agents/*.md` exist in `src/types/tools.ts` TOOL_NAMES array ✅
- [x] `pnpm build` succeeds (script changes don't break build) ✅
- [x] README.md and README_ko.md show matching tool counts (307) ✅

### Must Have
- All 63 new tools documented in appropriate reference files
- Correct tool count (307) in all canonical locations
- Correct test count (808) in READMEs
- Version `0.6.0` in doc metadata (next release version)
- New domain categories for certificates, ACME, notifications
- Fixed phantom tool names in agent files
- "Unimplemented" section cleaned up in TOOLS.md

### Must NOT Have (Guardrails)
- ❌ NO changes to any `.ts` files EXCEPT `scripts/extract-tool-docs.ts` domain mapping
- ❌ NO format invention — match existing format exactly in each file
- ❌ NO content rewriting of existing correct tool descriptions
- ❌ NO new agent files — add tools to existing agent boundaries
- ❌ NO full Korean translation of 63 new tools in TOOLS_ko.md (number-only update)
- ❌ NO restructuring of existing domain categories
- ❌ NO script refactoring beyond adding DOMAIN_MAPPING entries and DomainFile types

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks verifiable by running commands. No human review needed.

### Test Decision
- **Infrastructure exists**: N/A (documentation task)
- **Automated tests**: None needed (docs)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool**: Bash (grep, wc, diff)

Every task ends with grep validation to catch stale numbers and phantom names.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Update scripts/extract-tool-docs.ts DOMAIN_MAPPING

Wave 2 (After Wave 1):
├── Task 2: Run extract script → auto-generate reference docs
└── Task 3: Update docs/TOOLS.md (manual, can start while script runs for non-generated sections)

Wave 3 (After Wave 2):
├── Task 4: Update skills/proxmox-mcp-tools/SKILL.md
├── Task 5: Update README.md
├── Task 6: Update README_ko.md + TOOLS_ko.md
├── Task 7: Update all 7 agents/*.md files
└── Task 8: Update skills/proxmox-admin/ files

Wave 4 (After Wave 3):
└── Task 9: Full validation sweep
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None (foundation) |
| 2 | 1 | 3, 4, 5, 6, 7, 8 | None |
| 3 | 2 | 9 | 4, 5, 6, 7, 8 |
| 4 | 2 | 9 | 3, 5, 6, 7, 8 |
| 5 | 2 | 9 | 3, 4, 6, 7, 8 |
| 6 | 5 | 9 | 3, 4, 7, 8 |
| 7 | 2 | 9 | 3, 4, 5, 6, 8 |
| 8 | 2 | 9 | 3, 4, 5, 6, 7 |
| 9 | 3-8 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended |
|------|-------|-------------|
| 1 | 1 | task(category="unspecified-low") — script mapping update |
| 2 | 2, 3 | task(category="unspecified-high") — run script + TOOLS.md |
| 3 | 4-8 | task(category="quick") per file group — parallel |
| 4 | 9 | task(category="quick") — grep validation |

---

## TODOs

- [x] 1. Update `scripts/extract-tool-docs.ts` Domain Mapping ✅ (committed as 7ce8137)

- [x] 2. Run Extract Script & Verify Generated Reference Docs ✅ (committed as 7ce8137)

- [x] 3. Update `docs/TOOLS.md` — Add New Tools & Fix Unimplemented Section ✅ (committed as 161dff1)

- [x] 4. Update `skills/proxmox-mcp-tools/SKILL.md` ✅ (committed as 3ed241f)

- [x] 5. Update `README.md` ✅ (committed as 3ed241f)

- [x] 6. Update `README_ko.md` and `docs/TOOLS_ko.md` ✅ (committed as 3ed241f)

- [x] 7. Update All 7 `agents/*.md` Files ✅ (committed as 83b310d)

- [x] 8. Update `skills/proxmox-admin/` Files ✅ (committed as 83b310d)

- [x] 9. Full Validation Sweep ✅ (all checks pass, version fix committed as 046f27f)

  **What to do**:
  - Run comprehensive grep validation to catch ANY remaining stale numbers or phantom tool names
  - Verify build still passes
  - Verify all file counts are consistent

  **Must NOT do**:
  - Do NOT make changes in this task — only validate. If issues found, go back to the relevant task.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Just running grep commands and asserting results
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, alone)
  - **Blocks**: None
  - **Blocked By**: Tasks 3-8

  **References**:
  - `src/types/tools.ts` — TOOL_NAMES canonical list for phantom name validation

  **Acceptance Criteria**:
  - ALL checks below pass

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Zero stale "143" in any markdown file
    Tool: Bash
    Steps:
      1. Run: grep -rn "143 tools\|143개\|143 comprehensive\|**143**" --include="*.md" .
      2. Assert: 0 results
    Expected Result: No stale 143 references
    Evidence: Empty grep output

  Scenario: Zero stale "227" in any markdown file
    Tool: Bash
    Steps:
      1. Run: grep -rn "227 tools\|227 comprehensive\|**227**\|tool_count: 227\|Total Tools: 227\|across 11 domains" --include="*.md" .
      2. Assert: 0 results
    Expected Result: No stale 227 references
    Evidence: Empty grep output

  Scenario: Zero stale version numbers
    Tool: Bash
    Steps:
      1. Run: grep -rn "version: 0.4.2\|version: 0.1.5\|0.1.5" --include="*.md" docs/ skills/
      2. Assert: 0 results
    Expected Result: No stale versions
    Evidence: Empty grep output

  Scenario: Zero phantom tool names in agent files
    Tool: Bash
    Steps:
      1. Run: grep -hoE "proxmox_[a-z_]+" agents/*.md | sort -u > /tmp/agent_tools.txt
      2. Run: grep -oE "'proxmox_[a-z_]+'" src/types/tools.ts | tr -d "'" | sort -u > /tmp/registry_tools.txt
      3. Run: comm -23 /tmp/agent_tools.txt /tmp/registry_tools.txt
      4. Assert: empty output
    Expected Result: All agent tool references are valid
    Evidence: Empty comm output

  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run: pnpm build
      2. Assert: exit code 0
    Expected Result: No build breakage from script changes
    Evidence: Build output

  Scenario: README parity between EN and KO
    Tool: Bash
    Steps:
      1. Run: grep -c "307" README.md
      2. Run: grep -c "307" README_ko.md
      3. Assert: counts are within ±1 of each other
    Expected Result: Korean README matches English
    Evidence: Count comparison

  Scenario: "Unimplemented" section is clean
    Tool: Bash
    Steps:
      1. Run: grep -B2 -A5 "Certificates & SSL\|ACME\|Notification\|API Tokens\|Node Power" docs/TOOLS.md | grep -i "unimplemented\|not yet\|planned\|low priority\|medium priority"
      2. Assert: 0 matches for the now-implemented categories
    Expected Result: Implemented APIs not listed as unimplemented
    Evidence: Grep output
  ```

  **Commit**: NO (validation only — if issues found, fix in prior tasks then re-validate)

---

## Commit Strategy

| After Task(s) | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 + 2 | `docs: update extract-tool-docs script and regenerate reference docs for 307 tools` | `scripts/extract-tool-docs.ts`, `docs/skills/*.md`, `skills/proxmox-mcp-tools/references/*.md` | `pnpm build` |
| 3 | `docs: add 63 new tools to TOOLS.md and clean up unimplemented section` | `docs/TOOLS.md` | grep validation |
| 4 + 5 + 6 + 7 + 8 | `docs: update SKILL.md, READMEs, agents, and admin skill for 307 tools` | `skills/proxmox-mcp-tools/SKILL.md`, `README.md`, `README_ko.md`, `docs/TOOLS_ko.md`, `agents/*.md`, `skills/proxmox-admin/**/*.md` | grep validation |
| 9 | (no commit — validation only) | — | all checks pass |

---

## Success Criteria

### Verification Commands
```bash
# Stale number check
grep -rn "143 tools\|143개\|143 comprehensive\|**143**" --include="*.md" .  # Expected: 0
grep -rn "227 tools\|227 comprehensive\|**227**\|tool_count: 227" --include="*.md" .  # Expected: 0

# Correct count check
grep -c "307" README.md  # Expected: ≥ 5
grep -c "307" README_ko.md  # Expected: ≥ 5
grep "tool_count: 307" skills/proxmox-mcp-tools/SKILL.md  # Expected: 1 match

# Build check
pnpm build  # Expected: exit 0

# Phantom tool name check
comm -23 <(grep -hoE "proxmox_[a-z_]+" agents/*.md | sort -u) <(grep -oE "'proxmox_[a-z_]+'" src/types/tools.ts | tr -d "'" | sort -u)  # Expected: empty
```

### Final Checklist
- [x] All "Must Have" present (307 in all locations, new domains documented, phantom names fixed)
- [x] All "Must NOT Have" absent (no 143, no 227, no phantom names, no stale versions)
- [x] Build passes
- [x] Korean docs in parity
