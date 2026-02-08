# Skill Release Automation + AGENTS.md Cleanup

## TL;DR

> **Quick Summary**: Delete `AGENTS.md` from project root, and create a GitHub Actions workflow that automatically packages skills as `.zip` files and attaches them to a GitHub Release whenever `skills/` changes on main.
> 
> **Deliverables**:
> - `AGENTS.md` removed from repo
> - `.github/workflows/release-skills.yml` — new workflow for skill zip releases
> 
> **Estimated Effort**: Short (~20 min)
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 (independent) | Task 2 → Task 3

---

## Context

### Original Request
User wants to:
1. Remove `AGENTS.md` from project root
2. Automate skill distribution via GitHub Releases as `.zip` files when skills are added or changed

### Interview Summary
**Key Discussions**:
- `.skill` file format does NOT exist in agentskills.io standard — skills are directories
- Claude Desktop supports `.zip` upload (Settings > Capabilities)
- User confirmed `.zip` extension (not `.skill`)
- User wants **separate workflow** from existing Changesets npm release
- `AGENTS.md` deletion only (no .gitignore addition needed)

**Research Findings**:
- Current CI: `.github/workflows/release.yml` uses Changesets + npm publish
- Skills: 2 skill directories (proxmox-mcp-tools: 13 files, proxmox-admin: 3 files)
- ZIP structure for Claude Desktop: `{skill-name}/SKILL.md` at root of zip
- `softprops/action-gh-release` is the standard GitHub Action for creating releases with assets

### Metis Review
**Identified Gaps** (addressed):
- **Versioning**: Using `package.json` version (shared with npm) — skills version when package versions
- **Release scope**: Single release with all skill zips attached
- **Tag format**: `skills-v{version}` to avoid conflict with npm tags (`v{version}`)
- **Manual testing**: Adding `workflow_dispatch` trigger
- **Duplicate handling**: `softprops/action-gh-release` updates existing releases by default

---

## Work Objectives

### Core Objective
Clean up AGENTS.md and enable automated skill distribution via GitHub Releases.

### Concrete Deliverables
- `AGENTS.md` deleted from repository
- `.github/workflows/release-skills.yml` created and committed

### Definition of Done
- [x] `AGENTS.md` does not exist in repository
- [x] `release-skills.yml` exists and has valid YAML syntax
- [x] Workflow triggers on `skills/**` changes to main AND `workflow_dispatch`
- [x] Workflow creates zip files with correct structure (`{name}/SKILL.md` at root)
- [x] Workflow creates GitHub Release tagged `skills-v{version}` with zip assets

### Must Have
- Workflow detects `skills/**` file changes on push to main
- Each skill directory packaged as individual `.zip` file
- ZIP structure: `{skill-name}/` folder at root of zip (Claude Desktop compatible)
- GitHub Release created with all zip files attached
- `workflow_dispatch` trigger for manual testing
- Version read from `package.json`

### Must NOT Have (Guardrails)
- ❌ DO NOT modify existing `.github/workflows/release.yml`
- ❌ DO NOT modify Changesets configuration
- ❌ DO NOT add version auto-increment logic
- ❌ DO NOT add changelog generation
- ❌ DO NOT add skill validation or linting steps
- ❌ DO NOT modify skills content or README
- ❌ DO NOT create tags that conflict with npm release tags (`v{version}`)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verified by agent-executed commands. No manual testing.

### Test Decision
- **Infrastructure exists**: N/A (CI workflow, not code)
- **Automated tests**: None (workflow tested via `workflow_dispatch`)
- **Agent-Executed QA**: MANDATORY for all tasks

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Delete AGENTS.md [no dependencies]
└── Task 2: Create release-skills.yml [no dependencies]

Wave 2 (After Wave 1):
└── Task 3: Commit all changes [depends: 1, 2]
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 3 | delegate_task(category="quick", load_skills=["git-master"], run_in_background=false) |

---

## TODOs

- [x] 1. Delete AGENTS.md

  **What to do**:
  - Delete `AGENTS.md` from project root using `git rm AGENTS.md`
  - Do NOT add to .gitignore
  - Do NOT delete any other files

  **Must NOT do**:
  - Don't modify any other files
  - Don't touch `.sisyphus/` directory

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - No skills needed for simple file deletion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `AGENTS.md` — File to delete (AI agent knowledge base, ~350 lines)

  **Acceptance Criteria**:
  - [x] `AGENTS.md` does not exist: `test ! -f AGENTS.md`
  - [x] Git tracks the deletion: committed in `b84191c`

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: AGENTS.md removed from working tree
    Tool: Bash
    Preconditions: AGENTS.md exists in repo
    Steps:
      1. Run: git rm AGENTS.md
      2. Run: test ! -f AGENTS.md && echo "DELETED" || echo "STILL EXISTS"
      3. Assert: output is "DELETED"
      4. Run: git status --short
      5. Assert: output contains "D  AGENTS.md" or "D AGENTS.md"
    Expected Result: File deleted and git-tracked
    Evidence: git status output captured
  ```

  **Commit**: NO (grouped with Task 3)

---

- [x] 2. Create GitHub Actions workflow for skill releases

  **What to do**:
  Create `.github/workflows/release-skills.yml` with the following behavior:
  
  1. **Triggers**:
     - `push` to `main` when `skills/**` files change
     - `workflow_dispatch` for manual testing
  
  2. **Steps**:
     a. Checkout repository
     b. Read version from `package.json` using `jq` or node
     c. For each directory in `skills/` that contains `SKILL.md`:
        - Create zip file named `{skill-name}.zip`
        - ZIP must contain `{skill-name}/` as root folder (Claude Desktop compatible)
        - Example: `cd skills && zip -r ../proxmox-mcp-tools.zip proxmox-mcp-tools/`
     d. Create/update GitHub Release:
        - Tag: `skills-v{version}` (e.g., `skills-v0.4.2`)
        - Name: `Skills v{version}`
        - Body: List included skills and their descriptions
        - Attach all `.zip` files as release assets
  
  3. **GitHub Action to use**: `softprops/action-gh-release@v2`
     - Supports creating tag + release + uploading assets in one step
     - Supports updating existing releases

  **Exact workflow content**:

  ```yaml
  name: Release Skills

  on:
    push:
      branches: [main]
      paths: ['skills/**']
    workflow_dispatch:

  permissions:
    contents: write

  jobs:
    release-skills:
      name: Package and Release Skills
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4

        - name: Get version from package.json
          id: version
          run: echo "version=$(jq -r .version package.json)" >> "$GITHUB_OUTPUT"

        - name: Package skills as zip files
          run: |
            mkdir -p dist-skills
            cd skills
            for skill_dir in */; do
              skill_name="${skill_dir%/}"
              if [ -f "${skill_name}/SKILL.md" ]; then
                echo "Packaging ${skill_name}..."
                zip -r "../dist-skills/${skill_name}.zip" "${skill_name}/"
                echo "  Created ${skill_name}.zip"
              fi
            done
            cd ..
            echo "--- Packaged skills ---"
            ls -la dist-skills/

        - name: Generate release notes
          id: notes
          run: |
            {
              echo "body<<NOTES_EOF"
              echo "## Agent Skills v${{ steps.version.outputs.version }}"
              echo ""
              echo "Download \`.zip\` files below and upload to Claude Desktop via **Settings → Capabilities → Upload skill**."
              echo ""
              echo "Or install via CLI:"
              echo "\`\`\`bash"
              echo "npx skills add Bldg-7/proxmox-mcp"
              echo "\`\`\`"
              echo ""
              echo "### Included Skills"
              echo ""
              for skill_dir in skills/*/; do
                skill_name="$(basename "$skill_dir")"
                if [ -f "${skill_dir}SKILL.md" ]; then
                  description=$(grep -A1 '^description:' "${skill_dir}SKILL.md" | head -1 | sed 's/^description: *//')
                  echo "- **${skill_name}** — ${description}"
                fi
              done
              echo "NOTES_EOF"
            } >> "$GITHUB_OUTPUT"

        - name: Create GitHub Release
          uses: softprops/action-gh-release@v2
          with:
            tag_name: skills-v${{ steps.version.outputs.version }}
            name: Skills v${{ steps.version.outputs.version }}
            body: ${{ steps.notes.outputs.body }}
            files: dist-skills/*.zip
            make_latest: false
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ```

  **Must NOT do**:
  - Don't modify existing `release.yml`
  - Don't modify Changesets config
  - Don't add version auto-increment logic
  - Don't add complex conditional logic — keep it simple

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - No special skills needed for writing a YAML workflow file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.github/workflows/release.yml` — Existing release workflow (follow same style: actions/checkout@v4, permissions pattern, GITHUB_TOKEN usage)

  **External References**:
  - `softprops/action-gh-release@v2` — GitHub Release action (tag creation, asset upload, release notes)
  - Claude Desktop ZIP format: root folder must be skill directory name

  **Skill Directory References**:
  - `skills/proxmox-mcp-tools/SKILL.md` — First skill (12 reference files in references/)
  - `skills/proxmox-admin/SKILL.md` — Second skill (2 reference files in references/)

  **Acceptance Criteria**:
  - [x] File exists: `test -f .github/workflows/release-skills.yml`
  - [x] Valid YAML
  - [x] Contains push trigger on skills/**
  - [x] Contains workflow_dispatch
  - [x] Contains softprops/action-gh-release
  - [x] Uses skills-v tag prefix
  - [x] Does NOT reference changesets

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Workflow file has valid YAML syntax
    Tool: Bash
    Preconditions: .github/workflows/release-skills.yml exists
    Steps:
      1. Run: python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release-skills.yml')); print('VALID')"
      2. Assert: output is "VALID"
    Expected Result: YAML parses without errors
    Evidence: Command output captured

  Scenario: Workflow has correct trigger configuration
    Tool: Bash
    Preconditions: .github/workflows/release-skills.yml exists
    Steps:
      1. Run: grep -c "paths:" .github/workflows/release-skills.yml
      2. Assert: output >= 1
      3. Run: grep "skills/" .github/workflows/release-skills.yml
      4. Assert: output contains "skills/**"
      5. Run: grep -c "workflow_dispatch" .github/workflows/release-skills.yml
      6. Assert: output >= 1
    Expected Result: Both push-with-paths and workflow_dispatch triggers present
    Evidence: grep outputs captured

  Scenario: Workflow creates properly structured zip files (dry run)
    Tool: Bash
    Preconditions: skills/ directory exists with SKILL.md files
    Steps:
      1. Run: mkdir -p /tmp/test-dist && cd skills && for d in */; do n="${d%/}"; [ -f "$n/SKILL.md" ] && zip -r "/tmp/test-dist/$n.zip" "$n/"; done
      2. Run: ls -la /tmp/test-dist/
      3. Assert: proxmox-mcp-tools.zip exists
      4. Assert: proxmox-admin.zip exists
      5. Run: unzip -l /tmp/test-dist/proxmox-mcp-tools.zip | head -5
      6. Assert: output shows "proxmox-mcp-tools/SKILL.md" (folder at root)
      7. Run: unzip -l /tmp/test-dist/proxmox-admin.zip | head -3
      8. Assert: output shows "proxmox-admin/SKILL.md" (folder at root)
      9. Run: rm -rf /tmp/test-dist
    Expected Result: Zip files have {skill-name}/ as root directory
    Evidence: unzip -l output showing directory structure

  Scenario: Existing release.yml is untouched
    Tool: Bash
    Preconditions: .github/workflows/release.yml exists
    Steps:
      1. Run: git diff .github/workflows/release.yml
      2. Assert: output is empty (no changes)
    Expected Result: Original release workflow unmodified
    Evidence: git diff output (should be empty)
  ```

  **Evidence to Capture**:
  - [x] YAML validation output
  - [x] grep trigger verification output
  - [x] Zip structure verification (unzip -l output)
  - [x] git diff of release.yml (should be empty)

  **Commit**: NO (grouped with Task 3)

---

- [x] 3. Commit all changes

  **What to do**:
  - Stage AGENTS.md deletion and new workflow file
  - Create single commit with both changes
  - Commit message: `chore: remove AGENTS.md, add skill release workflow`

  **Must NOT do**:
  - Don't push to remote (user will push when ready)
  - Don't modify any other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`
    - `git-master`: Atomic commit handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential, after Tasks 1 & 2)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2

  **References**:
  - Task 1 output: `AGENTS.md` deletion staged
  - Task 2 output: `.github/workflows/release-skills.yml` created

  **Acceptance Criteria**:
  - [x] Commit exists: `b84191c chore: remove AGENTS.md, add skill release workflow`
  - [x] Commit includes AGENTS.md deletion
  - [x] Commit includes new workflow
  - [x] Working directory clean

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Single commit contains both changes
    Tool: Bash
    Preconditions: Tasks 1 and 2 completed, changes staged
    Steps:
      1. Run: git add -A && git commit -m "chore: remove AGENTS.md, add skill release workflow"
      2. Run: git show --stat HEAD
      3. Assert: output contains "AGENTS.md" (deletion)
      4. Assert: output contains "release-skills.yml" (addition)
      5. Run: git status --porcelain
      6. Assert: output is empty (clean working directory)
    Expected Result: Clean commit with both changes
    Evidence: git show --stat and git status output
  ```

  **Commit**: YES
  - Message: `chore: remove AGENTS.md, add skill release workflow`
  - Files: `AGENTS.md` (deleted), `.github/workflows/release-skills.yml` (added)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 | `chore: remove AGENTS.md, add skill release workflow` | AGENTS.md (D), .github/workflows/release-skills.yml (A) | `git show --stat HEAD` |

---

## Success Criteria

### Verification Commands
```bash
# AGENTS.md is gone
test ! -f AGENTS.md && echo "PASS" || echo "FAIL"

# Workflow exists and valid YAML
test -f .github/workflows/release-skills.yml && echo "PASS" || echo "FAIL"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release-skills.yml')); print('VALID YAML')"

# Workflow has correct triggers
grep -q "skills/\*\*" .github/workflows/release-skills.yml && echo "PASS: paths trigger" || echo "FAIL"
grep -q "workflow_dispatch" .github/workflows/release-skills.yml && echo "PASS: manual trigger" || echo "FAIL"

# Zip structure test (dry run)
mkdir -p /tmp/skill-test && cd skills && zip -r /tmp/skill-test/proxmox-mcp-tools.zip proxmox-mcp-tools/ && cd ..
unzip -l /tmp/skill-test/proxmox-mcp-tools.zip | grep "SKILL.md"  # Should show proxmox-mcp-tools/SKILL.md
rm -rf /tmp/skill-test

# Existing release.yml untouched
git diff HEAD~1 .github/workflows/release.yml  # Should be empty

# Clean working directory
test -z "$(git status --porcelain)" && echo "PASS: clean" || echo "FAIL: dirty"
```

### Final Checklist
- [x] AGENTS.md removed from repo
- [x] `.github/workflows/release-skills.yml` created
- [x] Workflow triggers on `skills/**` changes + `workflow_dispatch`
- [x] Workflow packages each skill directory as `.zip` with folder at root
- [x] Workflow creates GitHub Release with `skills-v{version}` tag
- [x] Existing `release.yml` NOT modified
- [x] Single commit with both changes
