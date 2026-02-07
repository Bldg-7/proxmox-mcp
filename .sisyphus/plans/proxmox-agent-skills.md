# Create Proxmox Agent Skills Package

## TL;DR

> **Quick Summary**: Create 2 Agent Skills following the agentskills.io open standard, packaged inside the existing proxmox-mcp repo. One skill teaches agents how to use the 227 MCP tools, the other teaches Proxmox operational expertise.
> 
> **Deliverables**:
> - `skills/proxmox-mcp-tools/` — MCP tool reference skill (227 tools, params, workflows)
> - `skills/proxmox-admin/` — Proxmox operations expertise skill (best practices, troubleshooting, architecture)
> - `.claude-plugin/` — Claude Code plugin configuration bundling both skills
> - Updated README.md with skills installation instructions
> 
> **Estimated Effort**: Medium (2-3 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (scaffold) → Tasks 2-3 (parallel skill creation) → Task 4 (claude-plugin) → Tasks 5-6 (parallel: README + verify)

---

## Context

### Original Request
User asked (in Korean): "AGENT도 만들어야하는데 어떻게 작성해야 할까?"
(I also need to create an agent, how should I write it?)

Clarified through interview:
- "Claude Code 스타일" = OpenCode plugin directory with skill packaging
- Domain: Proxmox infrastructure management (운영 자동화 + 상태 분석 + 프로비저닝)
- Want both Agent Skills Standard + Claude Plugin format

### Current State
- Proxmox MCP server with 227 tools across 21 categories
- Rich documentation already exists in `docs/skills/` (11 domain files + workflows + troubleshooting)
- No Agent Skills packaging exists yet
- No `.claude-plugin/` configuration exists

### Research Findings
- **Agent Skills Standard** (agentskills.io): Open format supported by 18+ agents (Claude Code, OpenCode, Cursor, Codex, Gemini CLI, VS Code, etc.)
- **Format**: Folder with `SKILL.md` (YAML frontmatter + markdown) + optional `scripts/`, `references/`, `assets/`
- **Progressive disclosure**: metadata (~100 tokens) → instructions (<5000 tokens) → resources (on demand)
- **Distribution**: `npx skills add <owner/repo>` — auto-discovers `skills/` directory
- **Claude Plugin**: `.claude-plugin/` directory with plugin.json for `/plugin install` support

### Metis Review
**Identified Gaps** (addressed):
1. **README tool count mismatch**: README says 143, actual is 227 → Include README skills section update
2. **Directory path**: `skills/` at repo root is the standard location → Confirmed
3. **Symlink vs Copy for references**: Copy for portability (Windows compat) → Decided
4. **Cross-skill dependency**: Make each skill standalone → Each skill self-contained
5. **Tool count sync**: Add generation timestamp to skills → Implemented
6. **Validation**: Use `npx skills validate` if available, else manual checks → Planned

---

## Work Objectives

### Core Objective
Package existing Proxmox MCP documentation into 2 Agent Skills following the agentskills.io open standard, enabling AI agents to load Proxmox expertise on demand across any compatible agent platform.

### Concrete Deliverables
- `skills/proxmox-mcp-tools/SKILL.md` — Tool reference skill (~400 lines)
- `skills/proxmox-mcp-tools/references/` — 11 domain files + workflows doc
- `skills/proxmox-admin/SKILL.md` — Operations expertise skill (~300 lines)
- `skills/proxmox-admin/references/` — Troubleshooting guide + architecture doc
- `.claude-plugin/plugin.json` — Claude Code plugin manifest
- Updated README.md section on skills installation

### Definition of Done
- [x] Both skills follow agentskills.io specification
- [x] `SKILL.md` files have valid YAML frontmatter (`name`, `description`, `license`, `metadata`)
- [x] `SKILL.md` name matches directory name
- [x] Each `SKILL.md` is under 500 lines
- [x] References directory populated with domain documentation
- [x] `.claude-plugin/plugin.json` is valid JSON
- [x] README has skills installation section

### Must Have
- Valid Agent Skills format (SKILL.md + references/)
- All 227 tools referenceable from proxmox-mcp-tools skill
- Operational best practices in proxmox-admin skill
- Claude Plugin configuration
- Installation instructions in README

### Must NOT Have (Guardrails)
- ❌ DO NOT modify `src/` directory or MCP server code
- ❌ DO NOT modify existing `docs/skills/*.md` files (these are auto-generated)
- ❌ DO NOT add new tools to registry
- ❌ DO NOT create `scripts/` directory (no executable code in v1)
- ❌ DO NOT rewrite existing documentation content — copy verbatim or summarize
- ❌ DO NOT use symlinks for references (portability concern)
- ❌ DO NOT change `docs/TOOLS.md`

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: NO — Documentation/packaging task
- **Agent-Executed QA**: YES — All verification via commands

### Agent-Executed QA Scenarios

```
Scenario: SKILL.md frontmatter validation
  Tool: Bash
  Steps:
    1. head -10 skills/proxmox-mcp-tools/SKILL.md
    2. Assert: First line is "---"
    3. Assert: Contains "name: proxmox-mcp-tools"
    4. Assert: Contains "description:" with non-empty value
    5. head -10 skills/proxmox-admin/SKILL.md
    6. Assert: Contains "name: proxmox-admin"
  Expected Result: Both skills have valid frontmatter

Scenario: SKILL.md line count under 500
  Tool: Bash
  Steps:
    1. wc -l skills/proxmox-mcp-tools/SKILL.md
    2. Assert: Output < 500
    3. wc -l skills/proxmox-admin/SKILL.md
    4. Assert: Output < 500
  Expected Result: Both under limit

Scenario: References populated
  Tool: Bash
  Steps:
    1. ls skills/proxmox-mcp-tools/references/*.md | wc -l
    2. Assert: Output >= 11 (domain files + workflows)
    3. ls skills/proxmox-admin/references/*.md | wc -l
    4. Assert: Output >= 2 (troubleshooting + architecture)
  Expected Result: References present

Scenario: Name matches directory
  Tool: Bash
  Steps:
    1. grep "^name:" skills/proxmox-mcp-tools/SKILL.md | awk '{print $2}'
    2. Assert: Output equals "proxmox-mcp-tools"
    3. grep "^name:" skills/proxmox-admin/SKILL.md | awk '{print $2}'
    4. Assert: Output equals "proxmox-admin"
  Expected Result: Names match directories

Scenario: Claude plugin manifest valid JSON
  Tool: Bash
  Steps:
    1. cat .claude-plugin/plugin.json | python3 -m json.tool
    2. Assert: Exit code 0 (valid JSON)
    3. Assert: Contains "proxmox-mcp-tools"
    4. Assert: Contains "proxmox-admin"
  Expected Result: Valid plugin configuration

Scenario: No existing docs modified
  Tool: Bash
  Steps:
    1. git diff --name-only docs/skills/
    2. Assert: Empty output (no changes)
  Expected Result: Existing docs untouched
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Scaffold directory structure

Wave 2 (After Wave 1 - PARALLEL):
├── Task 2: Create proxmox-mcp-tools skill
└── Task 3: Create proxmox-admin skill

Wave 3 (After Wave 2):
└── Task 4: Create .claude-plugin configuration

Wave 4 (After Wave 3 - PARALLEL):
├── Task 5: Update README with installation instructions
└── Task 6: Full verification and commit

Critical Path: Task 1 → Task 2 → Task 4 → Task 6
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 4 | 3 |
| 3 | 1 | 4 | 2 |
| 4 | 2, 3 | 5, 6 | None |
| 5 | 4 | 6 | 6 |
| 6 | 4, 5 | None | None |

---

## TODOs

- [x] 1. Scaffold directory structure

  **What to do**:
  - Create `skills/proxmox-mcp-tools/references/` directory
  - Create `skills/proxmox-admin/references/` directory
  - Create `.claude-plugin/` directory

  **Must NOT do**:
  - Don't create any SKILL.md files yet (those are tasks 2-3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - agentskills.io spec: `skills/` at repo root is standard location

  **Acceptance Criteria**:
  - [x] Directory `skills/proxmox-mcp-tools/references/` exists
  - [x] Directory `skills/proxmox-admin/references/` exists
  - [x] Directory `.claude-plugin/` exists

  **Commit**: NO

---

- [x] 2. Create proxmox-mcp-tools skill

  **What to do**:
  - Create `skills/proxmox-mcp-tools/SKILL.md` with:
    - Frontmatter: name, description, license, compatibility, metadata
    - Overview: What this skill teaches (MCP tool reference for Proxmox VE)
    - Quick Start: How to connect to Proxmox, permission model, SSL modes
    - Tool Categories: Summary table of 11 domains with tool counts and key tools
    - Common Workflows: Top 5-7 most useful workflows (condensed from workflows doc)
    - Troubleshooting Quick Reference: Top 5 most common issues
    - References: Links to all domain-specific reference files
  - Copy domain files to `references/`:
    - Copy `docs/skills/proxmox-nodes.md` → `skills/proxmox-mcp-tools/references/proxmox-nodes.md`
    - Copy `docs/skills/proxmox-vm.md` → `references/proxmox-vm.md`
    - Copy `docs/skills/proxmox-lxc.md` → `references/proxmox-lxc.md`
    - Copy `docs/skills/proxmox-vm-lxc-shared.md` → `references/proxmox-vm-lxc-shared.md`
    - Copy `docs/skills/proxmox-snapshots-backups.md` → `references/proxmox-snapshots-backups.md`
    - Copy `docs/skills/proxmox-storage.md` → `references/proxmox-storage.md`
    - Copy `docs/skills/proxmox-networking.md` → `references/proxmox-networking.md`
    - Copy `docs/skills/proxmox-cluster.md` → `references/proxmox-cluster.md`
    - Copy `docs/skills/proxmox-access-control.md` → `references/proxmox-access-control.md`
    - Copy `docs/skills/proxmox-ceph.md` → `references/proxmox-ceph.md`
    - Copy `docs/skills/proxmox-pools.md` → `references/proxmox-pools.md`
    - Copy `docs/skills/proxmox-workflows.md` → `references/proxmox-workflows.md`

  **Must NOT do**:
  - Don't modify existing `docs/skills/` files
  - Don't rewrite tool descriptions — reference existing content
  - Don't include all 227 tool details in SKILL.md — those go in references/
  - Don't exceed 500 lines in SKILL.md

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`
    - Reason: Documentation writing task with clear structure

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  - `docs/skills/proxmox-mcp.md` — Current index file structure
  - `docs/skills/proxmox-workflows.md` — Workflow patterns to summarize
  - `docs/skills/proxmox-troubleshooting.md` — Quick reference source
  - agentskills.io/specification — Format requirements
  - `package.json` — Version number for metadata

  **Acceptance Criteria**:
  - [x] `skills/proxmox-mcp-tools/SKILL.md` exists with valid frontmatter
  - [x] SKILL.md name = "proxmox-mcp-tools"
  - [x] SKILL.md has description covering 227 tools + MCP + Proxmox
  - [x] SKILL.md line count < 500
  - [x] 12 reference files copied to `references/`
  - [x] SKILL.md references all domain files via relative paths
  - [x] License field = "MIT"

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Frontmatter validity
    Tool: Bash
    Steps:
      1. head -20 skills/proxmox-mcp-tools/SKILL.md
      2. Assert: First line is "---"
      3. Assert: Contains "name: proxmox-mcp-tools"
      4. Assert: Contains "description:" with non-empty value
      5. Assert: Contains "license: MIT"
      6. Assert: Contains closing "---"
    Expected Result: Valid YAML frontmatter
    Evidence: Terminal output captured

  Scenario: Line count under limit
    Tool: Bash
    Steps:
      1. wc -l skills/proxmox-mcp-tools/SKILL.md
      2. Assert: Line count < 500
    Expected Result: Under 500 lines
    Evidence: wc -l output

  Scenario: References populated
    Tool: Bash
    Steps:
      1. ls skills/proxmox-mcp-tools/references/ | wc -l
      2. Assert: Output = 12 (11 domain + 1 workflows)
      3. diff docs/skills/proxmox-vm.md skills/proxmox-mcp-tools/references/proxmox-vm.md
      4. Assert: No differences (verbatim copy)
    Expected Result: All references copied correctly
    Evidence: diff output
  ```

  **Commit**: YES
  - Message: `feat(skills): add proxmox-mcp-tools agent skill (227 tools reference)`
  - Files: `skills/proxmox-mcp-tools/**`

---

- [x] 3. Create proxmox-admin skill

  **What to do**:
  - Create `skills/proxmox-admin/SKILL.md` with:
    - Frontmatter: name, description, license, compatibility, metadata
    - Overview: Proxmox VE operational expertise for AI agents
    - Architecture: Proxmox cluster concepts (nodes, storage, networking)
    - Operations Playbook:
      - VM lifecycle management (create → configure → monitor → backup → delete)
      - LXC container management
      - Storage management patterns
      - Backup strategy and scheduling
      - HA and migration workflows
    - Troubleshooting Guide: Common issues and resolutions (condensed)
    - Security: Permission model, API token best practices
    - Performance: Monitoring approach, resource optimization
    - References: Links to detailed reference files
  - Copy relevant files to `references/`:
    - Copy `docs/skills/proxmox-troubleshooting.md` → `references/proxmox-troubleshooting.md`
    - Copy `docs/skills/proxmox-workflows.md` → `references/proxmox-workflows.md`

  **Must NOT do**:
  - Don't modify existing docs
  - Don't include tool parameter details (that's proxmox-mcp-tools' job)
  - Don't exceed 500 lines
  - Don't create scripts/ directory

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  - `docs/skills/proxmox-workflows.md` — Workflow patterns source
  - `docs/skills/proxmox-troubleshooting.md` — Troubleshooting content source
  - `AGENTS.md` — Architecture overview source

  **Acceptance Criteria**:
  - [x] `skills/proxmox-admin/SKILL.md` exists with valid frontmatter
  - [x] SKILL.md name = "proxmox-admin"
  - [x] SKILL.md line count < 500
  - [x] 2 reference files copied to `references/`
  - [x] Content covers: VM lifecycle, LXC, storage, backups, HA, troubleshooting
  - [x] License field = "MIT"

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Frontmatter validity
    Tool: Bash
    Steps:
      1. head -20 skills/proxmox-admin/SKILL.md
      2. Assert: Contains "name: proxmox-admin"
      3. Assert: Contains "description:" with non-empty value
    Expected Result: Valid frontmatter

  Scenario: Content completeness
    Tool: Bash
    Steps:
      1. grep -ci "VM\|virtual machine" skills/proxmox-admin/SKILL.md
      2. Assert: Count > 0
      3. grep -ci "backup\|snapshot" skills/proxmox-admin/SKILL.md
      4. Assert: Count > 0
      5. grep -ci "troubleshoot\|error\|debug" skills/proxmox-admin/SKILL.md
      6. Assert: Count > 0
    Expected Result: Key topics covered
  ```

  **Commit**: YES
  - Message: `feat(skills): add proxmox-admin agent skill (operations expertise)`
  - Files: `skills/proxmox-admin/**`

---

- [x] 4. Create .claude-plugin configuration

  **What to do**:
  - Research `.claude-plugin/` format from `anthropics/skills` repo
  - Create `.claude-plugin/plugin.json` with:
    - Plugin name and description
    - References to both skills
    - Installation metadata
  - This enables `/plugin install` in Claude Code

  **Must NOT do**:
  - Don't over-engineer the plugin config
  - Don't add features beyond basic plugin discovery

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Tasks 2, 3

  **References**:
  - `https://github.com/anthropics/skills/tree/main/.claude-plugin` — Reference implementation
  - `.claude-plugin/` format documentation

  **Acceptance Criteria**:
  - [x] `.claude-plugin/plugin.json` exists
  - [x] Valid JSON (parseable by `python3 -m json.tool`)
  - [x] References both skills

  **Commit**: YES
  - Message: `feat(plugin): add Claude Code plugin configuration`
  - Files: `.claude-plugin/**`

---

- [x] 5. Update README with skills installation section

  **What to do**:
  - Add "Agent Skills" section to README.md after "Available Tools" section
  - Include:
    - What Agent Skills are (one paragraph)
    - Installation command: `npx skills add Bldg-7/proxmox-mcp`
    - List of available skills with descriptions
    - Claude Code plugin installation: `/plugin marketplace add Bldg-7/proxmox-mcp`
    - Supported agents list

  **Must NOT do**:
  - Don't fix the 143→227 tool count (separate task)
  - Don't rewrite other README sections
  - Don't remove existing content

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 6)
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:
  - `README.md` — Current file
  - Agent Skills installation patterns from skills.sh

  **Acceptance Criteria**:
  - [x] README.md has "Agent Skills" section
  - [x] Contains `npx skills add` command
  - [x] Lists both skills with descriptions

  **Commit**: NO (groups with Task 6)

---

- [x] 6. Full verification and commit

  **What to do**:
  - Run ALL verification scenarios from Verification Strategy section
  - Verify both SKILL.md files have valid frontmatter
  - Verify both are under 500 lines
  - Verify references populated correctly
  - Verify .claude-plugin/plugin.json is valid JSON
  - Verify no existing docs modified: `git diff --name-only docs/skills/`
  - Verify no src/ changes: `git diff --name-only src/`
  - Final commit

  **Must NOT do**:
  - Don't skip any verification step
  - Don't modify existing files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 5

  **References**:
  - Verification Strategy section above

  **Acceptance Criteria**:
  - [ ] All QA scenarios pass
  - [ ] No existing docs modified
  - [ ] No src/ changes
  - [ ] Git commit created
  - [ ] Working tree clean after commit

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Complete verification suite
    Tool: Bash
    Steps:
      1. Verify frontmatter for both skills
      2. wc -l skills/*/SKILL.md — both under 500
      3. ls skills/proxmox-mcp-tools/references/ — 12 files
      4. ls skills/proxmox-admin/references/ — 2 files
      5. python3 -m json.tool .claude-plugin/plugin.json — valid JSON
      6. git diff --name-only docs/skills/ — empty (no changes)
      7. git diff --name-only src/ — empty (no changes)
      8. grep "Agent Skills" README.md — found
    Expected Result: All verifications pass
    Evidence: Command outputs captured
  ```

  **Commit**: YES
  - Message: `feat(skills): complete Proxmox agent skills package (tools + admin + plugin)`
  - Files: `README.md`, `.claude-plugin/**`, any remaining changes

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 2 | `feat(skills): add proxmox-mcp-tools agent skill (227 tools reference)` | `skills/proxmox-mcp-tools/**` |
| 3 | `feat(skills): add proxmox-admin agent skill (operations expertise)` | `skills/proxmox-admin/**` |
| 4 | `feat(plugin): add Claude Code plugin configuration` | `.claude-plugin/**` |
| 6 | `feat(skills): complete Proxmox agent skills package (tools + admin + plugin)` | `README.md`, remaining |

---

## Success Criteria

### Verification Commands
```bash
# SKILL.md frontmatter
grep "^name:" skills/proxmox-mcp-tools/SKILL.md  # Expected: name: proxmox-mcp-tools
grep "^name:" skills/proxmox-admin/SKILL.md       # Expected: name: proxmox-admin

# Line counts
wc -l skills/*/SKILL.md                           # Expected: both < 500

# References
ls skills/proxmox-mcp-tools/references/ | wc -l   # Expected: 12
ls skills/proxmox-admin/references/ | wc -l        # Expected: 2

# Plugin JSON
python3 -m json.tool .claude-plugin/plugin.json    # Expected: exit 0

# No existing docs modified
git diff --name-only docs/skills/                  # Expected: empty
git diff --name-only src/                          # Expected: empty

# README updated
grep -c "Agent Skills" README.md                   # Expected: >= 1
```

### Final Checklist
- [x] Both skills follow agentskills.io specification
- [x] Both SKILL.md under 500 lines
- [x] References populated with domain documentation
- [x] .claude-plugin/plugin.json valid
- [x] README has installation instructions
- [x] No existing docs or source code modified
- [x] All commits clean
