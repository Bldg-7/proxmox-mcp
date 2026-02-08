# Add Proxmox SubAgents for Claude Code Plugin

## TL;DR

> **Quick Summary**: Create 7 role-based SubAgent definitions in `agents/` directory for the Claude Code plugin. Each agent preloads existing Proxmox skills and executes user requests using MCP tools. Includes a validation-first approach: create one test agent, verify it works, then create the remaining 6.
> 
> **Deliverables**:
> - `agents/vm-manager.md` — QEMU VM lifecycle management
> - `agents/lxc-manager.md` — LXC container management
> - `agents/cluster-admin.md` — HA, migration, replication, cluster firewall
> - `agents/storage-admin.md` — Storage, Ceph, ISO/template, backup pruning
> - `agents/network-admin.md` — SDN, VNets, zones, node interfaces
> - `agents/access-admin.md` — Users, groups, roles, ACLs, auth domains
> - `agents/monitor.md` — Read-only node monitoring, tasks, logs, health
> - Updated `.claude-plugin/plugin.json` with `"agents"` field
> - Updated `README.md` with SubAgent documentation
> 
> **Estimated Effort**: Medium (2-3 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (plugin.json + scaffold) → Task 2 (vm-manager test agent) → Task 3 (validate) → Tasks 4-9 (parallel: 6 agents) → Task 10 (README + verify)

---

## Context

### Original Request
User wants Skills (knowledge) and SubAgents (action) completely separated:
- **Skills** = "이런 도구들이 있고, 이렇게 쓰면 된다" (passive knowledge)
- **SubAgents** = "VM 만들어줘" → skills 로드 → MCP 도구 호출 → 실행 (active execution)

### Current State
- 2 Agent Skills exist: `skills/proxmox-mcp-tools/` (227 tools reference) + `skills/proxmox-admin/` (operations expertise)
- `.claude-plugin/plugin.json` exists but only references skills, not agents
- No `agents/` directory exists
- 227 MCP tools available via `@bldg-7/proxmox-mcp`

### Research Findings
- Claude Code agent format: YAML frontmatter + markdown system prompt in `agents/*.md`
- `description` field with `<example>` blocks determines auto-delegation
- `skills:` field in frontmatter preloads skill content into agent context
- `plugin.json` must include `"agents": "./agents"` for agent discovery
- MCP tools are available as standard tools when MCP server is connected
- Path resolution: `"./agents"` resolves relative to plugin root (repo root)

### Metis Review
**Identified Gaps** (addressed):
1. **Path resolution ambiguity**: `"./agents"` in plugin.json resolves from repo root → Confirmed correct
2. **MCP tool access**: Agents access Proxmox tools via MCP server connection, not `tools:` field. The `tools:` field restricts Claude's built-in tools (Read, Write, Bash, etc.), NOT MCP server tools
3. **Validation-first approach**: Create one agent first, verify format works, then create remaining 6 → Included in plan
4. **skills field format**: Comma-separated string in YAML, not array → Will use correct format
5. **Agent system prompt quality**: Each agent needs detailed domain-specific instructions, not generic → Each agent gets custom operations playbook
6. **Overlap between agents**: Some tools appear in multiple domains (e.g., firewall) → Defined clear boundaries per agent

---

## Work Objectives

### Core Objective
Create 7 role-based SubAgent definitions that preload existing Proxmox skills and execute domain-specific Proxmox operations, following Claude Code plugin agent specification.

### Concrete Deliverables
- 7 agent .md files in `agents/` directory
- Updated `plugin.json` with agents field
- Updated README with SubAgent section

### Definition of Done
- [x] All 7 agent files have valid YAML frontmatter (name, description, tools, model, skills)
- [x] Each agent's `description` contains at least 2 `<example>` blocks
- [x] Each agent preloads both skills via `skills` field
- [x] `plugin.json` has `"agents": "./agents"` field
- [x] Monitor agent is read-only (tools restricted)
- [x] No existing files modified (except plugin.json and README)
- [x] README has SubAgent installation/usage section

### Must Have
- YAML frontmatter following Claude Code agent spec
- Detailed `<example>` blocks showing when each agent triggers
- Domain-specific system prompts with operations playbooks
- Skills preload for all agents
- Tool restrictions (especially monitor = read-only)

### Must NOT Have (Guardrails)
- ❌ DO NOT modify `src/` directory or MCP server code
- ❌ DO NOT modify existing `skills/` files
- ❌ DO NOT modify `docs/skills/` files
- ❌ DO NOT create duplicate skill content inside agent files
- ❌ DO NOT give monitor agent write/elevated tool access
- ❌ DO NOT use generic/vague descriptions — each agent needs specific trigger examples
- ❌ DO NOT overlap agent responsibilities — clear domain boundaries

---

## Agent Domain Boundaries (Authoritative)

| Agent | Domain Tools | Boundary Rules |
|-------|-------------|----------------|
| **vm-manager** | proxmox_*_vm, proxmox_*_disk_vm, proxmox_*_network_vm, proxmox_create_vm, proxmox_clone_vm, proxmox_resize_vm, proxmox_execute_vm_command, proxmox_create_template_vm, proxmox_get_vm_rrddata, proxmox_*_snapshot_vm, proxmox_*_backup_vm | Only QEMU VMs. LXC → lxc-manager. Cluster-wide backup jobs → cluster-admin |
| **lxc-manager** | proxmox_*_lxc, proxmox_*_mountpoint_lxc, proxmox_*_network_lxc, proxmox_create_lxc, proxmox_clone_lxc, proxmox_resize_lxc, proxmox_create_template_lxc, proxmox_get_lxc_rrddata, proxmox_*_snapshot_lxc, proxmox_*_backup_lxc | Only LXC containers. QEMU VMs → vm-manager |
| **cluster-admin** | proxmox_*_ha_*, proxmox_migrate_vm, proxmox_migrate_lxc, proxmox_*_cluster_firewall_*, proxmox_*_cluster_backup_job*, proxmox_*_cluster_replication_*, proxmox_*_cluster_options | Cluster-wide operations only. Per-VM/LXC ops → respective managers |
| **storage-admin** | proxmox_*_storage*, proxmox_*_ceph_*, proxmox_upload_*, proxmox_download_*, proxmox_prune_backups, proxmox_*_file_restore, proxmox_get_node_disks, proxmox_get_disk_smart, proxmox_get_node_lvm, proxmox_get_node_zfs | Storage infra only. VM disk attachment → vm-manager |
| **network-admin** | proxmox_*_sdn_*, proxmox_*_network_iface, proxmox_apply_network_config, proxmox_get_node_network, proxmox_get_node_dns, proxmox_update_node_dns, proxmox_get_node_netstat | SDN + node networking. Per-VM/LXC NICs → respective managers |
| **access-admin** | proxmox_*_user*, proxmox_*_group*, proxmox_*_role*, proxmox_*_acl, proxmox_*_domain* | Access control only |
| **monitor** | proxmox_get_nodes, proxmox_get_node_status, proxmox_get_cluster_status, proxmox_get_node_services, proxmox_get_node_syslog, proxmox_get_node_journal, proxmox_get_node_tasks, proxmox_get_node_task, proxmox_get_ha_status, proxmox_get_vms, proxmox_get_vm_status, proxmox_get_vm_config, proxmox_get_lxc_config | **Read-only**. Never modify. Delegate to appropriate agent if action needed |

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: NO — Configuration/documentation task
- **Agent-Executed QA**: YES — All verification via commands

### Agent-Executed QA Scenarios

```
Scenario: All agent files have valid YAML frontmatter
  Tool: Bash
  Steps:
    1. for f in agents/*.md; do head -1 "$f"; done
    2. Assert: All files start with "---"
    3. for f in agents/*.md; do grep "^name:" "$f"; done
    4. Assert: Each has a name field
    5. for f in agents/*.md; do grep "^description:" "$f" | head -c 50; done
    6. Assert: Each has a description field
  Expected Result: 7 files, all with valid frontmatter

Scenario: Each agent has <example> blocks
  Tool: Bash
  Steps:
    1. for f in agents/*.md; do echo "$f: $(grep -c '<example>' "$f')"; done
    2. Assert: Each file has >= 2 example blocks
  Expected Result: All agents have at least 2 examples

Scenario: Skills preloaded in all agents
  Tool: Bash
  Steps:
    1. for f in agents/*.md; do grep "skills:" "$f"; done
    2. Assert: All contain "proxmox-mcp-tools" and "proxmox-admin"
  Expected Result: Both skills referenced in all 7 agents

Scenario: Monitor agent is read-only
  Tool: Bash
  Steps:
    1. grep "^tools:" agents/monitor.md
    2. Assert: Only Read, Grep, Glob (no Write, Edit, Bash)
  Expected Result: Monitor restricted to read-only tools

Scenario: plugin.json has agents field
  Tool: Bash
  Steps:
    1. python3 -m json.tool .claude-plugin/plugin.json
    2. Assert: Contains "agents" key
    3. Assert: Value is "./agents"
  Expected Result: plugin.json references agents directory

Scenario: Agent count matches
  Tool: Bash
  Steps:
    1. ls agents/*.md | wc -l
    2. Assert: Output equals 7
  Expected Result: Exactly 7 agent files

Scenario: No existing docs/src modified
  Tool: Bash
  Steps:
    1. git diff --name-only docs/skills/ src/
    2. Assert: Empty (no changes)
  Expected Result: Existing code and docs untouched
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Update plugin.json + create agents/ directory

Wave 2 (After Wave 1 - Sequential, Validation):
├── Task 2: Create vm-manager.md (test agent)
└── Task 3: Validate agent format works

Wave 3 (After Wave 3 - PARALLEL):
├── Task 4: Create lxc-manager.md
├── Task 5: Create cluster-admin.md
├── Task 6: Create storage-admin.md
├── Task 7: Create network-admin.md
├── Task 8: Create access-admin.md
└── Task 9: Create monitor.md

Wave 4 (Final):
└── Task 10: Update README + full verification + commit
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None |
| 2 | 1 | 3 | None |
| 3 | 2 | 4-9 | None |
| 4-9 | 3 | 10 | Each other (all parallel) |
| 10 | 4-9 | None | None |

---

## TODOs

- [x] 1. Update plugin.json and create agents/ directory

  **What to do**:
  - Create `agents/` directory at repo root
  - Update `.claude-plugin/plugin.json` to add `"agents": "./agents"` field

  **Must NOT do**:
  - Don't remove existing fields from plugin.json
  - Don't create agent files yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `.claude-plugin/plugin.json` — Current file (add `"agents"` field)
  - Claude Code plugin spec: `"agents"` field required for agent discovery

  **Acceptance Criteria**:
  - [ ] `agents/` directory exists
  - [ ] `plugin.json` has `"agents": "./agents"` field
  - [ ] `plugin.json` is still valid JSON

  **Commit**: NO

---

- [x] 2. Create vm-manager.md (test agent)

  **What to do**:
  - Create `agents/vm-manager.md` with full agent specification
  - This serves as the template/test for all other agents
  - Include detailed YAML frontmatter and comprehensive system prompt

  **Agent Definition Specification**:

  ```yaml
  name: vm-manager
  description: [2+ <example> blocks for VM lifecycle scenarios]
  model: inherit
  color: blue
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Must Cover**:
  - Role: QEMU VM lifecycle specialist
  - Available MCP tools: List of proxmox_*_vm tools from domain boundary table
  - Operations Playbook:
    - VM creation workflow (get next vmid → create → add disk → add network → start)
    - VM configuration (get_vm_config → modify disks/networks)
    - VM lifecycle (start/stop/shutdown/reboot/pause/resume/delete)
    - Snapshot management (create → list → rollback → delete)
    - Backup operations (create → list → restore)
    - Clone and template creation
    - Command execution via QEMU agent
  - Safety Rules:
    - Always confirm before destructive operations (delete VM, rollback snapshot)
    - Check VM status before operations (don't start already running VM)
    - Verify storage availability before creating disks
  - Delegation Rules:
    - LXC operations → "delegate to lxc-manager"
    - Cluster-wide operations → "delegate to cluster-admin"
    - Storage infrastructure → "delegate to storage-admin"
  - Output Format: structured responses matching MCP tool response format

  **Must NOT do**:
  - Don't include raw tool parameter documentation (that's in the skills)
  - Don't exceed reasonable agent prompt size (~300-500 lines max)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - Agent Domain Boundaries table above (vm-manager row)
  - `skills/proxmox-mcp-tools/references/proxmox-vm.md` — VM tool reference (25 tools)
  - `skills/proxmox-mcp-tools/references/proxmox-snapshots-backups.md` — Snapshot/backup reference
  - `skills/proxmox-admin/SKILL.md` — VM lifecycle playbook section
  - Research findings: agent format examples from VoltAgent, anthropics/claude-code

  **Acceptance Criteria**:
  - [ ] `agents/vm-manager.md` exists
  - [ ] YAML frontmatter has: name, description (with ≥2 `<example>` blocks), model, tools, skills
  - [ ] System prompt covers: creation, lifecycle, snapshots, backups, cloning, delegation rules
  - [ ] Line count < 500

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: vm-manager frontmatter validation
    Tool: Bash
    Steps:
      1. head -1 agents/vm-manager.md → Assert: "---"
      2. grep "^name: vm-manager" agents/vm-manager.md → Assert: found
      3. grep -c "<example>" agents/vm-manager.md → Assert: >= 2
      4. grep "skills:" agents/vm-manager.md → Assert: contains proxmox-mcp-tools
      5. wc -l agents/vm-manager.md → Assert: < 500
    Expected Result: Valid agent file
  ```

  **Commit**: YES
  - Message: `feat(agents): add vm-manager subagent for QEMU VM lifecycle management`
  - Files: `agents/vm-manager.md`, `.claude-plugin/plugin.json`

---

- [x] 3. Validate agent format

  **What to do**:
  - Verify vm-manager.md follows Claude Code agent spec
  - Check YAML frontmatter is valid
  - Verify skills field format
  - Verify example blocks are well-formed
  - Confirm no syntax errors that would prevent agent loading

  **Must NOT do**:
  - Don't test with actual Proxmox MCP server (we're validating file format only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 4-9
  - **Blocked By**: Task 2

  **References**:
  - `agents/vm-manager.md` — File to validate
  - Claude Code agent spec from research findings

  **Acceptance Criteria**:
  - [ ] YAML frontmatter parses without error
  - [ ] All required fields present (name, description)
  - [ ] `<example>` blocks properly formatted
  - [ ] Skills field references both existing skills
  - [ ] No obvious syntax issues

  **Commit**: NO

---

- [x] 4. Create lxc-manager.md

  **What to do**:
  - Create `agents/lxc-manager.md` following vm-manager template
  - Focus: LXC container lifecycle (create, configure, manage, snapshot, backup)

  **Agent Definition**:
  ```yaml
  name: lxc-manager
  description: [2+ <example> blocks for LXC scenarios]
  model: inherit
  color: green
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - LXC creation from template
  - Mount point management (mp0, mp1...)
  - Container lifecycle (start/stop/shutdown/reboot/delete)
  - Snapshot and backup operations (LXC-specific)
  - Clone and template creation
  - Key differences from VM (lighter, shared kernel, faster)
  - Delegation rules (VMs → vm-manager, cluster → cluster-admin)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5-9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (lxc-manager row)
  - `skills/proxmox-mcp-tools/references/proxmox-lxc.md` — LXC tool reference (18 tools)
  - `agents/vm-manager.md` — Template to follow

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] System prompt covers LXC-specific operations
  - [ ] Line count < 500

  **Commit**: NO (groups with other agents)

---

- [x] 5. Create cluster-admin.md

  **What to do**:
  - Create `agents/cluster-admin.md`
  - Focus: HA management, migration, replication, cluster firewall, cluster backup jobs, cluster options

  **Agent Definition**:
  ```yaml
  name: cluster-admin
  description: [2+ <example> blocks for HA and cluster scenarios]
  model: inherit
  color: red
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - HA group and resource management
  - Live and offline migration
  - Replication job management
  - Cluster firewall rules and groups
  - Cluster backup job scheduling
  - Cluster options configuration
  - HA state monitoring and troubleshooting

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (cluster-admin row)
  - `skills/proxmox-mcp-tools/references/proxmox-cluster.md` — Cluster tool reference (33 tools)
  - `skills/proxmox-mcp-tools/references/proxmox-vm-lxc-shared.md` — Migration tools

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] System prompt covers HA, migration, replication, cluster firewall
  - [ ] Line count < 500

  **Commit**: NO (groups with other agents)

---

- [x] 6. Create storage-admin.md

  **What to do**:
  - Create `agents/storage-admin.md`
  - Focus: Storage config, Ceph cluster, ISO/template management, backup pruning, node disks

  **Agent Definition**:
  ```yaml
  name: storage-admin
  description: [2+ <example> blocks for storage and Ceph scenarios]
  model: inherit
  color: yellow
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - Storage backend configuration (create, update, delete)
  - Content management (upload ISOs, download templates)
  - Backup pruning and retention
  - Ceph cluster operations (OSD, MON, MDS, pools, filesystems)
  - Node disk inventory (SMART, LVM, ZFS)
  - File restore operations

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (storage-admin row)
  - `skills/proxmox-mcp-tools/references/proxmox-storage.md` — Storage tools (16 tools)
  - `skills/proxmox-mcp-tools/references/proxmox-ceph.md` — Ceph tools (16 tools)

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] System prompt covers storage config, Ceph, content management
  - [ ] Line count < 500

  **Commit**: NO (groups with other agents)

---

- [x] 7. Create network-admin.md

  **What to do**:
  - Create `agents/network-admin.md`
  - Focus: SDN (VNets, zones, controllers, subnets), node network interfaces

  **Agent Definition**:
  ```yaml
  name: network-admin
  description: [2+ <example> blocks for SDN and networking scenarios]
  model: inherit
  color: cyan
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - SDN VNet management (CRUD)
  - SDN zone management (CRUD)
  - SDN controller management (CRUD)
  - SDN subnet management (CRUD)
  - Node network interface configuration (create, update, delete, apply)
  - DNS configuration
  - Network statistics

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (network-admin row)
  - `skills/proxmox-mcp-tools/references/proxmox-networking.md` — SDN tools (20 tools)
  - `skills/proxmox-mcp-tools/references/proxmox-nodes.md` — Node network tools

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] System prompt covers SDN and node networking
  - [ ] Line count < 500

  **Commit**: NO (groups with other agents)

---

- [x] 8. Create access-admin.md

  **What to do**:
  - Create `agents/access-admin.md`
  - Focus: Users, groups, roles, ACLs, authentication domains

  **Agent Definition**:
  ```yaml
  name: access-admin
  description: [2+ <example> blocks for access control scenarios]
  model: inherit
  color: magenta
  tools: Read, Write, Edit, Bash, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - User management (create, update, delete, list)
  - Group management with user assignments
  - Role definition and permission management
  - ACL configuration (path + role + user/group)
  - Authentication domain management (PAM, LDAP, AD)
  - Security best practices (least privilege, token rotation)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (access-admin row)
  - `skills/proxmox-mcp-tools/references/proxmox-access-control.md` — Access tools (20 tools)

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] System prompt covers users, groups, roles, ACLs, domains
  - [ ] Line count < 500

  **Commit**: NO (groups with other agents)

---

- [x] 9. Create monitor.md (READ-ONLY)

  **What to do**:
  - Create `agents/monitor.md`
  - Focus: Read-only monitoring, health checks, task tracking, log analysis
  - **CRITICAL**: Tools restricted to read-only (Read, Grep, Glob only)

  **Agent Definition**:
  ```yaml
  name: monitor
  description: [2+ <example> blocks for monitoring and health check scenarios]
  model: inherit
  color: green
  tools: Read, Grep, Glob
  skills: proxmox-mcp-tools, proxmox-admin
  ```

  **System Prompt Focus**:
  - Node status and health overview
  - Cluster status assessment
  - VM/LXC status monitoring
  - Task tracking and progress
  - Log analysis (syslog, journal)
  - Service status checks
  - HA status monitoring
  - Performance metrics review
  - **CRITICAL RULE**: Never modify anything. If action is needed, recommend and delegate:
    - "VM needs restart" → "I recommend running vm-manager to restart this VM"
    - "Storage is full" → "I recommend running storage-admin to prune backups"

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - Agent Domain Boundaries table (monitor row)
  - `skills/proxmox-mcp-tools/references/proxmox-nodes.md` — Node monitoring tools

  **Acceptance Criteria**:
  - [ ] Valid YAML frontmatter with ≥2 `<example>` blocks
  - [ ] Tools field = `Read, Grep, Glob` (NO Write, Edit, Bash)
  - [ ] System prompt emphasizes read-only nature
  - [ ] Delegation rules for when action is needed
  - [ ] Line count < 500

  **Commit**: NO (groups with Task 10)

---

- [x] 10. Update README, full verification, and commit

  **What to do**:
  - Add "SubAgents" section to README.md (after Agent Skills section)
  - Run ALL verification scenarios
  - Verify 7 agent files exist with valid format
  - Verify plugin.json updated
  - Verify no existing docs/src modified
  - Commit all remaining changes

  **README SubAgents Section**:
  - What SubAgents are (one paragraph — action vs knowledge distinction)
  - List of 7 agents with descriptions
  - How they work (auto-delegation via Claude Code)
  - Prerequisite: MCP server must be connected

  **Must NOT do**:
  - Don't rewrite other README sections
  - Don't modify existing content

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Tasks 4-9

  **References**:
  - `README.md` — Current file
  - All agents in `agents/` directory

  **Acceptance Criteria**:
  - [ ] README has "SubAgents" section
  - [ ] Lists all 7 agents with descriptions
  - [ ] 7 agent files in `agents/` directory
  - [ ] All agents have valid frontmatter
  - [ ] All agents have ≥2 `<example>` blocks
  - [ ] All agents preload both skills
  - [ ] Monitor agent is read-only
  - [ ] plugin.json references agents
  - [ ] No docs/skills/ or src/ changes
  - [ ] Git commit created

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Complete verification suite
    Tool: Bash
    Steps:
      1. ls agents/*.md | wc -l → Assert: 7
      2. for f in agents/*.md; do head -1 "$f"; done → All start with "---"
      3. for f in agents/*.md; do grep -c "<example>" "$f"; done → All >= 2
      4. for f in agents/*.md; do grep "skills:" "$f"; done → All reference skills
      5. grep "tools: Read, Grep, Glob" agents/monitor.md → Found (read-only)
      6. python3 -m json.tool .claude-plugin/plugin.json → Exit 0
      7. grep '"agents"' .claude-plugin/plugin.json → Found
      8. git diff --name-only docs/skills/ src/ → Empty
      9. grep "SubAgents" README.md → Found
    Expected Result: All checks pass
  ```

  **Commit**: YES
  - Message: `feat(agents): add 7 Proxmox SubAgents for Claude Code plugin (vm, lxc, cluster, storage, network, access, monitor)`
  - Files: `agents/*.md`, `.claude-plugin/plugin.json`, `README.md`

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 2 | `feat(agents): add vm-manager subagent for QEMU VM lifecycle management` | `agents/vm-manager.md`, `.claude-plugin/plugin.json` |
| 10 | `feat(agents): add 7 Proxmox SubAgents for Claude Code plugin (vm, lxc, cluster, storage, network, access, monitor)` | `agents/*.md`, `README.md` |

---

## Success Criteria

### Verification Commands
```bash
# Agent file count
ls agents/*.md | wc -l                          # Expected: 7

# All have frontmatter
for f in agents/*.md; do head -1 "$f"; done     # Expected: all "---"

# All have examples
for f in agents/*.md; do echo "$(basename $f): $(grep -c '<example>' "$f")"; done
# Expected: all >= 2

# All preload skills
for f in agents/*.md; do grep "skills:" "$f"; done
# Expected: all contain proxmox-mcp-tools

# Monitor is read-only
grep "^tools:" agents/monitor.md                 # Expected: Read, Grep, Glob

# Plugin JSON valid and has agents
python3 -m json.tool .claude-plugin/plugin.json  # Expected: exit 0
grep '"agents"' .claude-plugin/plugin.json       # Expected: found

# No existing files modified
git diff --name-only docs/skills/ src/           # Expected: empty

# README updated
grep -c "SubAgents" README.md                    # Expected: >= 1
```

### Final Checklist
- [x] 7 agent files in agents/ directory
- [x] All agents have valid YAML frontmatter
- [x] All agents have ≥2 <example> blocks
- [x] All agents preload both skills
- [x] Monitor agent is read-only
- [x] plugin.json has "agents": "./agents"
- [x] README has SubAgents section
- [x] No existing docs or source code modified
- [x] All commits clean
