# Add Skill Usage Documentation to README

## TL;DR

> **Quick Summary**: Add "How Skills Work" and "Skill Contents" subsections to the existing Agent Skills section in README.md, showing concrete examples of how agents use skills to execute Proxmox operations.
> 
> **Deliverables**:
> - Updated `README.md` with skill usage examples and content descriptions
> 
> **Estimated Effort**: Quick (5 minutes)
> **Parallel Execution**: NO - single task
> **Critical Path**: Task 1

---

## Context

### Original Request
User wants skill usage instructions added to README.md — showing how agents actually use the skills with concrete examples.

### Current State
- README has Agent Skills section (lines 151-183) with:
  - Available Skills table ✅
  - Installation commands ✅
  - Supported Agents list ✅
  - Progressive disclosure note ✅
- **Missing**: How skills actually work, usage examples, skill contents breakdown

---

## Work Objectives

### Core Objective
Add practical usage documentation showing how AI agents use skills to execute Proxmox operations.

### Must Have
- "How Skills Work" subsection with explanation
- 3 concrete examples showing skill → MCP tool call workflow
- "Skill Contents" subsection describing what each skill covers

### Must NOT Have (Guardrails)
- ❌ DO NOT modify existing README sections (only add within Agent Skills section)
- ❌ DO NOT duplicate SubAgents content
- ❌ DO NOT modify any files other than README.md

---

## TODOs

- [x] 1. Add skill usage documentation to README.md

  **What to do**:
  In `README.md`, find the line:
  ```
  Skills provide progressive disclosure: metadata (~100 tokens) → instructions (<5000 tokens) → detailed references (on demand).
  ```
  
  Replace it with the following expanded content:
  
  ```markdown
  Skills provide progressive disclosure: metadata (~100 tokens) → instructions (<5000 tokens) → detailed references (on demand).

  ### How Skills Work

  Once installed, skills are automatically loaded into the agent's context. The agent learns Proxmox tool usage, workflows, and best practices — so you can give natural language instructions and the agent translates them into the right MCP tool calls.

  **Example — Creating a VM** (agent uses `proxmox-mcp-tools` skill):
  ```
  You: "Create an Ubuntu VM with 4 cores, 8GB RAM, and 50GB disk on pve1"

  Agent knows the workflow from the skill:
    1. proxmox_get_next_vmid        → gets available VM ID (e.g., 105)
    2. proxmox_create_vm            → creates VM 105 with 4 cores, 8GB RAM
    3. proxmox_add_disk_vm          → attaches 50GB virtio disk
    4. proxmox_add_network_vm       → adds network interface on vmbr0
    5. proxmox_start_vm             → powers on the VM
  ```

  **Example — Setting up HA** (agent uses `proxmox-admin` skill):
  ```
  You: "Make VM 100 highly available"

  Agent knows the operational playbook:
    1. proxmox_get_ha_groups        → checks existing HA groups
    2. proxmox_create_ha_resource   → adds VM 100 to HA with priority
    3. proxmox_get_ha_status        → verifies HA is active
  ```

  **Example — Troubleshooting** (agent uses both skills together):
  ```
  You: "VM 100 won't start, help me figure out why"

  Agent combines tool knowledge + operational expertise:
    1. proxmox_get_vm_status        → checks current state
    2. proxmox_get_vm_config        → reviews configuration
    3. proxmox_get_node_status      → checks node resource availability
    4. proxmox_get_node_tasks       → finds recent failed tasks
    → Diagnoses: "Node pve1 has insufficient memory. VM requires 8GB but only 2GB free."
    → Suggests: resize VM memory, migrate to another node, or free resources
  ```

  ### Skill Contents

  **proxmox-mcp-tools** — Tool Reference:
  - 227 tools organized into 11 domains (VMs, LXC, cluster, storage, networking, Ceph, access control, pools)
  - Parameters, types, and descriptions for every tool
  - Permission levels (basic vs elevated 🔒)
  - Common workflow patterns (create VM, backup/restore, clone, migrate)

  **proxmox-admin** — Operational Expertise:
  - VM & LXC lifecycle playbooks (create → configure → monitor → backup → decommission)
  - Storage management strategies (Ceph, NFS, LVM, ZFS)
  - HA configuration and failover procedures
  - Troubleshooting guides for common API quirks
  - Security best practices (permission model, token management)
  - Performance monitoring and optimization
  ```

  **Must NOT do**:
  - Don't modify other README sections
  - Don't modify SubAgents section

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `README.md` — Current file (Agent Skills section, lines 151-183)
  - `skills/proxmox-mcp-tools/SKILL.md` — Tool reference skill content
  - `skills/proxmox-admin/SKILL.md` — Admin skill content

  **Acceptance Criteria**:
  - [x] README has "How Skills Work" subsection
  - [x] README has 3 usage examples (VM creation, HA setup, troubleshooting)
  - [x] README has "Skill Contents" subsection
  - [x] Existing README content not modified
  - [x] No other files changed

  **Commit**: YES
  - Message: `docs: add skill usage examples to README`
  - Files: `README.md`

---

## Success Criteria

### Verification Commands
```bash
grep -c "How Skills Work" README.md          # Expected: >= 1
grep -c "Skill Contents" README.md           # Expected: >= 1
grep -c "proxmox_get_next_vmid" README.md    # Expected: >= 1 (usage example)
```

### Final Checklist
- [x] "How Skills Work" section present
- [x] 3 usage examples with tool call workflows
- [x] "Skill Contents" section with both skills described
- [x] No existing content broken
