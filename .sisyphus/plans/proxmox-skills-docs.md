# Proxmox MCP Skills Documentation

## TL;DR

> **Quick Summary**: Create AI-optimized skills documentation for the Proxmox MCP server (227 tools) with automated extraction from codebase, supporting both standalone skill deployment and bundled AGENTS.md plugin distribution.
> 
> **Deliverables**:
> - `scripts/extract-tool-docs.ts` - Automated documentation generator
> - `docs/skills/proxmox-mcp.md` - Main skill file (AI-consumable)
> - `docs/skills/proxmox-workflows.md` - Common workflow patterns
> - `docs/skills/proxmox-troubleshooting.md` - Error handling & quirks
> - `AGENTS.md` - Hierarchical codebase knowledge base
> - Updated `docs/TOOLS.md` - Sync to 227 tools
> 
> **Estimated Effort**: Medium (3-4 hours with automation)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (extract script) → Task 2 (main skill) → Tasks 3-6 (parallel)

---

## Context

### Original Request
Create comprehensive skills documentation for AI agents using Proxmox MCP server. Must support:
1. Individual skill files for standalone deployment
2. Bundled with AGENTS.md as a plugin package

### Interview Summary
**Key Discussions**:
- **Audience**: AI Agents (Claude, etc.) - structured, precise, example-heavy
- **Distribution**: Dual - standalone skills AND bundled plugin
- **Scope**: All 227 tools + essential workflows

**Research Findings**:
- `docs/TOOLS.md` exists but outdated (shows 143 tools, actual is 227)
- `src/tools/registry.ts` is single source of truth for all tools
- `src/schemas/*.ts` contain Zod schemas with parameter definitions
- 84 tools undocumented: SDN (20), Ceph (16), Access Control (19), System Ops (14), others
- Session discovered critical API quirks to document

### Metis Review
**Identified Gaps** (addressed in plan):
1. **Automated extraction needed** - Added Phase 0 with extraction script
2. **Tool count discrepancy** - Plan includes TOOLS.md sync task
3. **Undocumented categories** - SDN, Ceph, Access Control now in scope
4. **API quirks** - Dedicated troubleshooting doc created
5. **Korean version** - Deferred (not blocking, can add later)

---

## Work Objectives

### Core Objective
Create AI-optimized documentation that enables any AI agent to effectively use all 227 Proxmox MCP tools, with automated extraction to ensure accuracy and completeness.

### Concrete Deliverables
1. `scripts/extract-tool-docs.ts` - Extraction script
2. `docs/skills/proxmox-mcp.md` - Main AI skill file
3. `docs/skills/proxmox-workflows.md` - Workflow patterns
4. `docs/skills/proxmox-troubleshooting.md` - Errors & quirks
5. `AGENTS.md` - Codebase knowledge hierarchy
6. Updated `docs/TOOLS.md` - 227 tools synced

### Definition of Done
- [ ] Extraction script runs without errors: `bun run scripts/extract-tool-docs.ts`
- [ ] All 227 tools documented in main skill file
- [ ] Workflow examples tested against actual MCP
- [ ] AGENTS.md includes all source directories
- [ ] docs/TOOLS.md shows correct tool count (227)

### Must Have
- All 227 tools documented with: name, description, parameters, permission level
- API quirks section (POST encoding, 500 errors, LXC limitations)
- AGENTS.md with hierarchical codebase structure
- Machine-parseable format (consistent markdown structure)

### Must NOT Have (Guardrails)
- ❌ DO NOT manually document all 227 tools - use extraction script
- ❌ DO NOT include human tutorial content (README covers this)
- ❌ DO NOT create Korean version in this phase (separate task)
- ❌ DO NOT modify source code functionality
- ❌ DO NOT include verbose prose - keep AI-optimized density

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
> All tasks verified by agent-executed commands. No manual testing.

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: NO - Documentation task, not code
- **Agent-Executed QA**: YES - All verification via commands

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Create extraction script

Wave 2 (After Wave 1):
├── Task 2: Generate main skill file (uses extraction output)
└── Task 6: Update docs/TOOLS.md (uses extraction output)

Wave 3 (After Wave 2):
├── Task 3: Create workflows doc
├── Task 4: Create troubleshooting doc
└── Task 5: Create AGENTS.md

Critical Path: Task 1 → Task 2 → Complete
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 6 | None (first) |
| 2 | 1 | 3, 4, 5 | 6 |
| 3 | 2 | None | 4, 5 |
| 4 | 2 | None | 3, 5 |
| 5 | 2 | None | 3, 4 |
| 6 | 1 | None | 2 |

---

## TODOs

### - [x] 1. Create Tool Extraction Script

**What to do**:
- Create `scripts/extract-tool-docs.ts`
- Import tool registry from `src/tools/registry.ts`
- Extract for each tool: name, description, parameters (from Zod schema), permission level
- Output: JSON file `scripts/tool-docs.json` with structured data
- Output: Markdown template `scripts/tool-docs.md` for skill file

**Must NOT do**:
- Do not manually parse source files - use TypeScript imports
- Do not include implementation details - only API surface
- Do not modify registry.ts

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single file creation with clear input/output
- **Skills**: [`git-master`]
  - `git-master`: For committing the script after creation
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser interaction needed

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 1 (solo)
- **Blocks**: Tasks 2, 6
- **Blocked By**: None (can start immediately)

**References**:
- `src/tools/registry.ts` - Tool registry with all 227 tools, TOOL_DESCRIPTIONS map
- `src/schemas/` - Zod schemas defining parameters per tool
- `package.json` - bun/tsx execution context

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Extraction script executes successfully
  Tool: Bash
  Preconditions: Repository cloned, dependencies installed
  Steps:
    1. Run: bun run scripts/extract-tool-docs.ts
    2. Assert: Exit code 0
    3. Assert: File scripts/tool-docs.json exists
    4. Assert: File scripts/tool-docs.md exists
    5. Run: cat scripts/tool-docs.json | jq '.tools | length'
    6. Assert: Output equals 227 (or actual tool count)
  Expected Result: Both output files generated with all tools
  Evidence: Command output captured

Scenario: JSON output has required fields
  Tool: Bash
  Preconditions: scripts/tool-docs.json exists
  Steps:
    1. Run: cat scripts/tool-docs.json | jq '.tools[0] | keys'
    2. Assert: Contains "name", "description", "parameters", "permission"
    3. Run: cat scripts/tool-docs.json | jq '.tools[] | select(.name == "proxmox_get_nodes")'
    4. Assert: Output contains expected structure
  Expected Result: All tools have consistent structure
  Evidence: JSON validation output
```

**Commit**: YES
- Message: `feat(docs): add tool extraction script for skills documentation`
- Files: `scripts/extract-tool-docs.ts`, `scripts/tool-docs.json`, `scripts/tool-docs.md`
- Pre-commit: `bun run scripts/extract-tool-docs.ts`

---

### - [x] 2. Create Main Skill File

**What to do**:
- Create `docs/skills/proxmox-mcp.md`
- Use output from extraction script as foundation
- Structure for AI consumption:
  - Header with MCP connection info
  - Permission model explanation
  - Tool categories (grouped by function)
  - Each tool: name, when to use, parameters table, example
- Include environment variable requirements

**Must NOT do**:
- Do not duplicate README content
- Do not add verbose explanations - keep dense
- Do not skip any of the 227 tools

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Documentation creation with technical accuracy
- **Skills**: [`git-master`]
  - `git-master`: For committing the documentation
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser needed

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Task 6)
- **Blocks**: Tasks 3, 4, 5
- **Blocked By**: Task 1

**References**:
- `scripts/tool-docs.json` - Generated tool data (from Task 1)
- `scripts/tool-docs.md` - Generated markdown template (from Task 1)
- `README.md` - Environment variable documentation
- `docs/TOOLS.md:65-75` - Permission model explanation

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Skill file contains all tools
  Tool: Bash
  Preconditions: docs/skills/proxmox-mcp.md exists
  Steps:
    1. Run: grep -c "^### \`proxmox_" docs/skills/proxmox-mcp.md
    2. Assert: Count >= 227
    3. Run: grep -q "PROXMOX_HOST" docs/skills/proxmox-mcp.md
    4. Assert: Exit code 0 (env vars documented)
  Expected Result: All tools and config documented
  Evidence: grep output captured

Scenario: Skill file has required sections
  Tool: Bash
  Preconditions: docs/skills/proxmox-mcp.md exists
  Steps:
    1. Run: grep -E "^## " docs/skills/proxmox-mcp.md
    2. Assert: Contains "Configuration", "Permission Model", "Tools"
    3. Run: head -50 docs/skills/proxmox-mcp.md
    4. Assert: Contains MCP server identification
  Expected Result: Proper structure for AI parsing
  Evidence: Section headers captured
```

**Commit**: YES
- Message: `docs(skills): add main proxmox-mcp skill file with 227 tools`
- Files: `docs/skills/proxmox-mcp.md`
- Pre-commit: `test -f docs/skills/proxmox-mcp.md`

---

### - [x] 3. Create Workflows Documentation

**What to do**:
- Create `docs/skills/proxmox-workflows.md`
- Document common multi-step workflows:
  - VM Lifecycle: create → configure → start → backup → delete
  - LXC Lifecycle: create (with net0) → configure guest → start
  - Cluster Operations: HA, migration, replication
  - Storage Management: create → upload → attach
  - Snapshot/Backup patterns
- Each workflow: step sequence, tool calls, expected responses

**Must NOT do**:
- Do not include single-tool operations (main skill covers those)
- Do not add troubleshooting here (separate doc)
- Do not include untested workflows

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Pattern documentation with examples
- **Skills**: [`git-master`]
  - `git-master`: For committing
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser needed

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 4, 5)
- **Blocks**: None
- **Blocked By**: Task 2

**References**:
- `docs/skills/proxmox-mcp.md` - Main skill file (from Task 2)
- `src/tools/vm-lifecycle.ts` - VM lifecycle tool implementations
- `src/tools/lxc.ts` - LXC-specific tools
- `src/tools/cluster.ts` - Cluster management tools
- Previous session context - LXC net0 workflow discovery

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Workflow doc has required patterns
  Tool: Bash
  Preconditions: docs/skills/proxmox-workflows.md exists
  Steps:
    1. Run: grep -E "^## " docs/skills/proxmox-workflows.md
    2. Assert: Contains "VM Lifecycle", "LXC", "Cluster", "Storage"
    3. Run: grep -c "proxmox_" docs/skills/proxmox-workflows.md
    4. Assert: Count >= 20 (tool references in workflows)
  Expected Result: All major workflow categories present
  Evidence: Section headers and tool counts

Scenario: Workflows show step sequences
  Tool: Bash
  Preconditions: docs/skills/proxmox-workflows.md exists
  Steps:
    1. Run: grep -E "^[0-9]+\." docs/skills/proxmox-workflows.md | head -20
    2. Assert: Numbered steps present
    3. Run: grep -c "→" docs/skills/proxmox-workflows.md
    4. Assert: Count >= 5 (workflow arrows)
  Expected Result: Clear step-by-step patterns
  Evidence: Step format captured
```

**Commit**: YES (groups with 4, 5)
- Message: `docs(skills): add workflow patterns for common operations`
- Files: `docs/skills/proxmox-workflows.md`
- Pre-commit: `test -f docs/skills/proxmox-workflows.md`

---

### - [x] 4. Create Troubleshooting Documentation

**What to do**:
- Create `docs/skills/proxmox-troubleshooting.md`
- Document API quirks discovered in session:
  - POST/PUT requires `application/x-www-form-urlencoded` (not JSON)
  - DELETE params go in query string (not body)
  - Proxmox returns 500 (not 404) for missing resources
  - LXC exec not available via API (QEMU guest agent only)
  - `/nodes/{node}/execute` requires root@pam (API tokens fail)
  - `net0` creates veth but guest OS must configure networking
- Common error codes and meanings
- Permission-related issues

**Must NOT do**:
- Do not duplicate README troubleshooting
- Do not include general Proxmox issues (only MCP-specific)
- Do not include untested solutions

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Error documentation with solutions
- **Skills**: [`git-master`]
  - `git-master`: For committing
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser needed

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 3, 5)
- **Blocks**: None
- **Blocked By**: Task 2

**References**:
- `src/api/client.ts` - HTTP client implementation (encoding logic)
- `README.md:Troubleshooting` - Existing troubleshooting section
- Previous session context - API quirks discovered during testing
- `src/tools/lxc.ts` - LXC command execution limitations

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Troubleshooting doc covers known quirks
  Tool: Bash
  Preconditions: docs/skills/proxmox-troubleshooting.md exists
  Steps:
    1. Run: grep -i "500" docs/skills/proxmox-troubleshooting.md
    2. Assert: Exit code 0 (500 error documented)
    3. Run: grep -i "form-urlencoded" docs/skills/proxmox-troubleshooting.md
    4. Assert: Exit code 0 (encoding documented)
    5. Run: grep -i "lxc exec" docs/skills/proxmox-troubleshooting.md
    6. Assert: Exit code 0 (LXC limitation documented)
  Expected Result: All known quirks documented
  Evidence: grep matches captured

Scenario: Error codes section exists
  Tool: Bash
  Preconditions: docs/skills/proxmox-troubleshooting.md exists
  Steps:
    1. Run: grep -E "^## " docs/skills/proxmox-troubleshooting.md
    2. Assert: Contains "Error Codes" or "Common Errors"
    3. Run: grep -E "40[013]|50[01]" docs/skills/proxmox-troubleshooting.md | wc -l
    4. Assert: Count >= 4 (multiple error codes)
  Expected Result: Error reference section present
  Evidence: Error code count
```

**Commit**: YES (groups with 3, 5)
- Message: `docs(skills): add troubleshooting guide with API quirks`
- Files: `docs/skills/proxmox-troubleshooting.md`
- Pre-commit: `test -f docs/skills/proxmox-troubleshooting.md`

---

### - [x] 5. Create AGENTS.md

**What to do**:
- Create `AGENTS.md` at project root
- Document hierarchical codebase structure:
  - Project overview and purpose
  - Directory structure with descriptions
  - Key files and their roles
  - Architecture decisions
  - Development patterns
- Follow Sentry AGENTS.md format (AI-optimized)

**Must NOT do**:
- Do not duplicate README content extensively
- Do not include implementation details (code)
- Do not make it human-tutorial-focused

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Codebase documentation
- **Skills**: [`git-master`]
  - `git-master`: For committing
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser needed

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 3, 4)
- **Blocks**: None
- **Blocked By**: Task 2

**References**:
- `src/` - Source directory structure
- `src/tools/registry.ts` - Tool registration pattern
- `src/schemas/` - Schema organization
- `src/api/` - API client architecture
- `README.md` - Project overview
- Sentry AGENTS.md pattern (via Metis research)

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: AGENTS.md has required structure
  Tool: Bash
  Preconditions: AGENTS.md exists at project root
  Steps:
    1. Run: test -f AGENTS.md
    2. Assert: Exit code 0
    3. Run: grep -E "^## " AGENTS.md
    4. Assert: Contains "Overview", "Structure", "Architecture"
    5. Run: grep -c "src/" AGENTS.md
    6. Assert: Count >= 5 (directory references)
  Expected Result: Proper hierarchical structure
  Evidence: Section headers captured

Scenario: AGENTS.md covers key directories
  Tool: Bash
  Preconditions: AGENTS.md exists
  Steps:
    1. Run: grep -E "tools|schemas|api" AGENTS.md
    2. Assert: Exit code 0 (key directories mentioned)
    3. Run: grep -i "registry" AGENTS.md
    4. Assert: Exit code 0 (registry.ts mentioned)
  Expected Result: Core architecture documented
  Evidence: Directory mentions
```

**Commit**: YES (groups with 3, 4)
- Message: `docs: add AGENTS.md for AI agent codebase understanding`
- Files: `AGENTS.md`
- Pre-commit: `test -f AGENTS.md`

---

### - [x] 6. Update docs/TOOLS.md Tool Count

**What to do**:
- Update `docs/TOOLS.md` header to show 227 tools (not 143)
- Update the tool distribution table with correct counts
- Add missing tool categories: SDN (20), Ceph (16), Access Control (19)
- Ensure all 227 tools are listed

**Must NOT do**:
- Do not change tool documentation format
- Do not remove existing content
- Do not add verbose descriptions

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Simple update to existing file
- **Skills**: [`git-master`]
  - `git-master`: For committing
- **Skills Evaluated but Omitted**:
  - `playwright`: No browser needed

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Task 2)
- **Blocks**: None
- **Blocked By**: Task 1

**References**:
- `scripts/tool-docs.json` - Generated tool data (from Task 1)
- `docs/TOOLS.md` - Current file to update
- `src/tools/registry.ts` - Authoritative tool list

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Tool count updated in header
  Tool: Bash
  Preconditions: docs/TOOLS.md exists
  Steps:
    1. Run: head -10 docs/TOOLS.md
    2. Assert: Contains "227" (not "143")
    3. Run: grep -E "Total.*[0-9]+" docs/TOOLS.md
    4. Assert: Contains "227"
  Expected Result: Header shows correct count
  Evidence: Header content captured

Scenario: Missing categories added
  Tool: Bash
  Preconditions: docs/TOOLS.md exists
  Steps:
    1. Run: grep -i "SDN" docs/TOOLS.md
    2. Assert: Exit code 0 (SDN section exists)
    3. Run: grep -i "Ceph" docs/TOOLS.md
    4. Assert: Exit code 0 (Ceph section exists)
    5. Run: grep -i "Access Control" docs/TOOLS.md
    6. Assert: Exit code 0 (Access Control section exists)
  Expected Result: All categories present
  Evidence: Category grep results
```

**Commit**: YES
- Message: `docs: update TOOLS.md to 227 tools with missing categories`
- Files: `docs/TOOLS.md`
- Pre-commit: `grep -q "227" docs/TOOLS.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(docs): add tool extraction script` | scripts/* | bun run scripts/extract-tool-docs.ts |
| 2 | `docs(skills): add main proxmox-mcp skill file` | docs/skills/proxmox-mcp.md | file exists |
| 3, 4, 5 | `docs(skills): add workflows, troubleshooting, AGENTS.md` | docs/skills/*.md, AGENTS.md | files exist |
| 6 | `docs: update TOOLS.md to 227 tools` | docs/TOOLS.md | grep 227 |

---

## Success Criteria

### Verification Commands
```bash
# Extraction script works
bun run scripts/extract-tool-docs.ts  # Expected: exit 0, files created

# All skill files exist
ls docs/skills/  # Expected: proxmox-mcp.md, proxmox-workflows.md, proxmox-troubleshooting.md

# AGENTS.md exists
test -f AGENTS.md && echo "OK"  # Expected: OK

# Tool count correct
grep -o "227" docs/TOOLS.md | head -1  # Expected: 227

# Main skill has all tools
grep -c "^### \`proxmox_" docs/skills/proxmox-mcp.md  # Expected: >= 227
```

### Final Checklist
- [x] All 227 tools documented in main skill file
- [x] Workflow patterns cover VM, LXC, Cluster, Storage
- [x] API quirks documented (500 errors, encoding, LXC limitations)
- [x] AGENTS.md provides codebase overview
- [x] docs/TOOLS.md shows 227 tools
- [x] No manual documentation of individual tools (used extraction)
- [x] No Korean version (deferred)
- [x] No verbose prose (AI-optimized density)
