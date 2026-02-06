# Split Proxmox MCP Skills Documentation

## TL;DR

> **Quick Summary**: Split the monolithic `docs/skills/proxmox-mcp.md` (3,511 lines, 227 tools) into ~10 smaller domain-based category files, keeping the original as a slim index. Update the extraction script to generate domain-based output.
> 
> **Deliverables**:
> - `docs/skills/proxmox-mcp.md` → Slim index/overview (~120 lines)
> - `docs/skills/proxmox-nodes.md` → Node, system, console tools (~33 tools)
> - `docs/skills/proxmox-vm.md` → QEMU VM tools (~25 tools)
> - `docs/skills/proxmox-lxc.md` → LXC container tools (~15 tools)
> - `docs/skills/proxmox-vm-lxc-shared.md` → Shared VM/LXC tools: agent, firewall, migration (~26 tools)
> - `docs/skills/proxmox-snapshots-backups.md` → Snapshots & backups (~14 tools)
> - `docs/skills/proxmox-storage.md` → Storage & disk tools (~24 tools)
> - `docs/skills/proxmox-networking.md` → Networking & SDN (~30 tools)
> - `docs/skills/proxmox-cluster.md` → Cluster management (~33 tools)
> - `docs/skills/proxmox-access-control.md` → Users, groups, roles (~20 tools)
> - `docs/skills/proxmox-ceph.md` → Ceph storage cluster (~16 tools)
> - Updated `scripts/extract-tool-docs.ts` → Generates domain-based split output
> 
> **Estimated Effort**: Medium (3-4 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (plan mapping) → Task 2 (update script) → Tasks 3-13 (parallel creation) → Task 14 (verify)

---

## Context

### Original Request
User asked (in Korean): "proxmox-mcp의 도구 목록을 더 작은 카테고리의 여러 문서로 나눠"
(Split the Proxmox MCP tool list into smaller category documents)

### Current State
- `docs/skills/proxmox-mcp.md`: **3,511 lines**, all 227 tools in one file
- Current organization: **28 verb-based categories** (Add, Agent, Clone, Create, Delete, Get, List, etc.)
- This is hard to navigate - finding all VM-related tools requires scanning multiple verb categories

### Target State
- **~10 domain-based files** averaging ~300 lines each
- Organization matches the source code structure (registry.ts comment sections)
- Main file becomes a slim index with configuration, permissions, and links

### Research Findings
- Source code (`registry.ts`, `server.ts`, `tools/index.ts`) uses **18 domain-based comment groups**
- Tool handler files map 1:1 to domains (e.g., `vm-lifecycle.ts`, `cluster-management.ts`, `ceph.ts`)
- Current verb-based grouping in docs does NOT match the source code organization

### Metis Review
**Identified Gaps** (addressed):
1. **Extraction script strategy**: Update script to generate domain-based output (maintainable)
2. **Cross-category tools tiebreaker**: Tools with `_lxc` in name → LXC file; tools with `_vm` → VM file; shared tools (e.g., `get_vms` lists both) → VM file (primary audience)
3. **LXC extraction criteria**: Tools containing `_lxc` in tool name go to LXC file
4. **Single-tool categories**: Merge into parent domain (e.g., `proxmox_execute_vm_command` → VM file)
5. **External references**: `AGENTS.md` references main file → update to reference index
6. **Duplicate header bug**: Fix `## Tools by Category` appearing twice at line 72-74

---

## Work Objectives

### Core Objective
Reorganize 227 tools from a single 3,511-line file into ~10 domain-based files for better navigation and AI agent context efficiency.

### Concrete Deliverables
- 10 new domain-based skill files in `docs/skills/`
- Slimmed main index file `docs/skills/proxmox-mcp.md`
- Updated extraction script to maintain domain-based output
- Updated external references in `AGENTS.md`

### Definition of Done
- [x] Total tool count across ALL files equals exactly 227
- [x] Zero duplicate tools across files
- [x] All tool documentation preserved verbatim (no content changes)
- [x] Each category file is under 500 lines
- [x] Main index file has links to all category files
- [x] Extraction script generates domain-based output
- [x] External references in AGENTS.md updated

### Must Have
- All 227 tools documented across the split files (zero loss)
- Domain-based organization matching source code structure
- Each file self-contained with its own header/description
- Main index file as navigation hub

### Must NOT Have (Guardrails)
- ❌ DO NOT rewrite tool descriptions - verbatim copy only
- ❌ DO NOT modify source code (`src/tools/`, `src/schemas/`)
- ❌ DO NOT modify `README.md` (separate concern)
- ❌ DO NOT change `proxmox-workflows.md` or `proxmox-troubleshooting.md` content
- ❌ DO NOT add new documentation content beyond organizational structure
- ❌ DO NOT create Korean translations (separate task)

---

## Tool-to-File Mapping (Authoritative)

### File 1: `proxmox-nodes.md` (~33 tools)
**Source groups**: Node & Cluster + Node Network Config + System Operations + Console Access + Node Management

| Tool Name | Source |
|-----------|--------|
| `proxmox_get_nodes` | Node & Cluster |
| `proxmox_get_node_status` | Node & Cluster |
| `proxmox_get_cluster_status` | Node & Cluster |
| `proxmox_get_next_vmid` | Node & Cluster |
| `proxmox_get_node_network` | Node & Cluster |
| `proxmox_get_node_dns` | Node & Cluster |
| `proxmox_get_network_iface` | Node & Cluster |
| `proxmox_create_network_iface` | Node Network Config |
| `proxmox_update_network_iface` | Node Network Config |
| `proxmox_delete_network_iface` | Node Network Config |
| `proxmox_apply_network_config` | Node Network Config |
| `proxmox_get_node_time` | System Ops |
| `proxmox_update_node_time` | System Ops |
| `proxmox_update_node_dns` | System Ops |
| `proxmox_get_node_hosts` | System Ops |
| `proxmox_update_node_hosts` | System Ops |
| `proxmox_get_node_subscription` | System Ops |
| `proxmox_set_node_subscription` | System Ops |
| `proxmox_delete_node_subscription` | System Ops |
| `proxmox_apt_update` | System Ops |
| `proxmox_apt_upgrade` | System Ops |
| `proxmox_apt_versions` | System Ops |
| `proxmox_start_all` | System Ops |
| `proxmox_stop_all` | System Ops |
| `proxmox_migrate_all` | System Ops |
| `proxmox_get_vnc_proxy` | Console Access |
| `proxmox_get_spice_proxy` | Console Access |
| `proxmox_get_term_proxy` | Console Access |
| `proxmox_get_lxc_vnc_proxy` | Console Access |
| `proxmox_get_lxc_term_proxy` | Console Access |
| `proxmox_get_node_services` | Node Management |
| `proxmox_control_node_service` | Node Management |
| `proxmox_get_node_syslog` | Node Management |
| `proxmox_get_node_journal` | Node Management |
| `proxmox_get_node_tasks` | Node Management |
| `proxmox_get_node_task` | Node Management |
| `proxmox_get_node_aplinfo` | Node Management |
| `proxmox_get_node_netstat` | Node Management |

### File 2: `proxmox-vm.md` (~25 tools)
**Source groups**: VM Query + VM Lifecycle + VM Modify + Creation (VM parts) + Command + Disks (VM parts) + Network (VM parts)

| Tool Name | Source |
|-----------|--------|
| `proxmox_get_vms` | VM Query |
| `proxmox_get_vm_status` | VM Query |
| `proxmox_get_vm_config` | VM Query |
| `proxmox_get_storage` | VM Query |
| `proxmox_create_vm` | Creation |
| `proxmox_list_templates` | Creation |
| `proxmox_start_vm` | VM Lifecycle |
| `proxmox_stop_vm` | VM Lifecycle |
| `proxmox_shutdown_vm` | VM Lifecycle |
| `proxmox_reboot_vm` | VM Lifecycle |
| `proxmox_pause_vm` | VM Lifecycle |
| `proxmox_resume_vm` | VM Lifecycle |
| `proxmox_delete_vm` | VM Lifecycle |
| `proxmox_clone_vm` | VM Modify |
| `proxmox_resize_vm` | VM Modify |
| `proxmox_add_disk_vm` | Disks |
| `proxmox_resize_disk_vm` | Disks |
| `proxmox_remove_disk_vm` | Disks |
| `proxmox_move_disk_vm` | Disks |
| `proxmox_add_network_vm` | Network |
| `proxmox_update_network_vm` | Network |
| `proxmox_remove_network_vm` | Network |
| `proxmox_execute_vm_command` | Command |
| `proxmox_create_template_vm` | VM/LXC Advanced |
| `proxmox_get_vm_rrddata` | VM/LXC Advanced |

### File 3: `proxmox-lxc.md` (~15 tools)
**Source groups**: LXC-specific tools from VM Lifecycle + Creation + Disks + Network + VM/LXC Advanced

| Tool Name | Source |
|-----------|--------|
| `proxmox_get_lxc_config` | VM Query |
| `proxmox_create_lxc` | Creation |
| `proxmox_start_lxc` | VM Lifecycle |
| `proxmox_stop_lxc` | VM Lifecycle |
| `proxmox_shutdown_lxc` | VM Lifecycle |
| `proxmox_reboot_lxc` | VM Lifecycle |
| `proxmox_delete_lxc` | VM Lifecycle |
| `proxmox_clone_lxc` | VM Modify |
| `proxmox_resize_lxc` | VM Modify |
| `proxmox_add_mountpoint_lxc` | Disks |
| `proxmox_resize_disk_lxc` | Disks |
| `proxmox_remove_mountpoint_lxc` | Disks |
| `proxmox_move_disk_lxc` | Disks |
| `proxmox_add_network_lxc` | Network |
| `proxmox_update_network_lxc` | Network |
| `proxmox_remove_network_lxc` | Network |
| `proxmox_create_template_lxc` | VM/LXC Advanced |
| `proxmox_get_lxc_rrddata` | VM/LXC Advanced |

### File 4: `proxmox-vm-lxc-shared.md` (~26 tools)
**Source groups**: VM/LXC Advanced (agent, firewall, migration)

| Tool Name | Source |
|-----------|--------|
| `proxmox_migrate_vm` | VM/LXC Advanced |
| `proxmox_migrate_lxc` | VM/LXC Advanced |
| `proxmox_agent_ping` | VM/LXC Advanced |
| `proxmox_agent_get_osinfo` | VM/LXC Advanced |
| `proxmox_agent_get_fsinfo` | VM/LXC Advanced |
| `proxmox_agent_get_memory_blocks` | VM/LXC Advanced |
| `proxmox_agent_get_network_interfaces` | VM/LXC Advanced |
| `proxmox_agent_get_time` | VM/LXC Advanced |
| `proxmox_agent_get_timezone` | VM/LXC Advanced |
| `proxmox_agent_get_vcpus` | VM/LXC Advanced |
| `proxmox_agent_exec` | VM/LXC Advanced |
| `proxmox_agent_exec_status` | VM/LXC Advanced |
| `proxmox_list_vm_firewall_rules` | VM/LXC Advanced |
| `proxmox_get_vm_firewall_rule` | VM/LXC Advanced |
| `proxmox_create_vm_firewall_rule` | VM/LXC Advanced |
| `proxmox_update_vm_firewall_rule` | VM/LXC Advanced |
| `proxmox_delete_vm_firewall_rule` | VM/LXC Advanced |
| `proxmox_list_lxc_firewall_rules` | VM/LXC Advanced |
| `proxmox_get_lxc_firewall_rule` | VM/LXC Advanced |
| `proxmox_create_lxc_firewall_rule` | VM/LXC Advanced |
| `proxmox_update_lxc_firewall_rule` | VM/LXC Advanced |
| `proxmox_delete_lxc_firewall_rule` | VM/LXC Advanced |

### File 5: `proxmox-snapshots-backups.md` (~14 tools)
**Source groups**: Snapshots + Backups

| Tool Name | Source |
|-----------|--------|
| `proxmox_create_snapshot_vm` | Snapshots |
| `proxmox_create_snapshot_lxc` | Snapshots |
| `proxmox_list_snapshots_vm` | Snapshots |
| `proxmox_list_snapshots_lxc` | Snapshots |
| `proxmox_rollback_snapshot_vm` | Snapshots |
| `proxmox_rollback_snapshot_lxc` | Snapshots |
| `proxmox_delete_snapshot_vm` | Snapshots |
| `proxmox_delete_snapshot_lxc` | Snapshots |
| `proxmox_create_backup_vm` | Backups |
| `proxmox_create_backup_lxc` | Backups |
| `proxmox_list_backups` | Backups |
| `proxmox_restore_backup_vm` | Backups |
| `proxmox_restore_backup_lxc` | Backups |
| `proxmox_delete_backup` | Backups |

### File 6: `proxmox-storage.md` (~16 tools)
**Source groups**: Storage Management + Node Disk Query

| Tool Name | Source |
|-----------|--------|
| `proxmox_list_storage_config` | Storage Management |
| `proxmox_get_storage_config` | Storage Management |
| `proxmox_create_storage` | Storage Management |
| `proxmox_update_storage` | Storage Management |
| `proxmox_delete_storage` | Storage Management |
| `proxmox_upload_to_storage` | Storage Management |
| `proxmox_download_url_to_storage` | Storage Management |
| `proxmox_list_storage_content` | Storage Management |
| `proxmox_delete_storage_content` | Storage Management |
| `proxmox_list_file_restore` | Storage Management |
| `proxmox_download_file_restore` | Storage Management |
| `proxmox_prune_backups` | Storage Management |
| `proxmox_get_node_disks` | Disks (node query) |
| `proxmox_get_disk_smart` | Disks (node query) |
| `proxmox_get_node_lvm` | Disks (node query) |
| `proxmox_get_node_zfs` | Disks (node query) |

### File 7: `proxmox-networking.md` (~20 tools)
**Source groups**: SDN

| Tool Name | Source |
|-----------|--------|
| `proxmox_list_sdn_vnets` | SDN |
| `proxmox_get_sdn_vnet` | SDN |
| `proxmox_create_sdn_vnet` | SDN |
| `proxmox_update_sdn_vnet` | SDN |
| `proxmox_delete_sdn_vnet` | SDN |
| `proxmox_list_sdn_zones` | SDN |
| `proxmox_get_sdn_zone` | SDN |
| `proxmox_create_sdn_zone` | SDN |
| `proxmox_update_sdn_zone` | SDN |
| `proxmox_delete_sdn_zone` | SDN |
| `proxmox_list_sdn_controllers` | SDN |
| `proxmox_get_sdn_controller` | SDN |
| `proxmox_create_sdn_controller` | SDN |
| `proxmox_update_sdn_controller` | SDN |
| `proxmox_delete_sdn_controller` | SDN |
| `proxmox_list_sdn_subnets` | SDN |
| `proxmox_get_sdn_subnet` | SDN |
| `proxmox_create_sdn_subnet` | SDN |
| `proxmox_update_sdn_subnet` | SDN |
| `proxmox_delete_sdn_subnet` | SDN |

### File 8: `proxmox-cluster.md` (~33 tools)
**Source groups**: Cluster Management

| Tool Name | Source |
|-----------|--------|
| `proxmox_get_ha_resources` | Cluster |
| `proxmox_get_ha_resource` | Cluster |
| `proxmox_create_ha_resource` | Cluster |
| `proxmox_update_ha_resource` | Cluster |
| `proxmox_delete_ha_resource` | Cluster |
| `proxmox_get_ha_groups` | Cluster |
| `proxmox_get_ha_group` | Cluster |
| `proxmox_create_ha_group` | Cluster |
| `proxmox_update_ha_group` | Cluster |
| `proxmox_delete_ha_group` | Cluster |
| `proxmox_get_ha_status` | Cluster |
| `proxmox_list_cluster_firewall_rules` | Cluster |
| `proxmox_get_cluster_firewall_rule` | Cluster |
| `proxmox_create_cluster_firewall_rule` | Cluster |
| `proxmox_update_cluster_firewall_rule` | Cluster |
| `proxmox_delete_cluster_firewall_rule` | Cluster |
| `proxmox_list_cluster_firewall_groups` | Cluster |
| `proxmox_get_cluster_firewall_group` | Cluster |
| `proxmox_create_cluster_firewall_group` | Cluster |
| `proxmox_update_cluster_firewall_group` | Cluster |
| `proxmox_delete_cluster_firewall_group` | Cluster |
| `proxmox_list_cluster_backup_jobs` | Cluster |
| `proxmox_get_cluster_backup_job` | Cluster |
| `proxmox_create_cluster_backup_job` | Cluster |
| `proxmox_update_cluster_backup_job` | Cluster |
| `proxmox_delete_cluster_backup_job` | Cluster |
| `proxmox_list_cluster_replication_jobs` | Cluster |
| `proxmox_get_cluster_replication_job` | Cluster |
| `proxmox_create_cluster_replication_job` | Cluster |
| `proxmox_update_cluster_replication_job` | Cluster |
| `proxmox_delete_cluster_replication_job` | Cluster |
| `proxmox_get_cluster_options` | Cluster |
| `proxmox_update_cluster_options` | Cluster |

### File 9: `proxmox-access-control.md` (~20 tools)
**Source groups**: Access Control

| Tool Name | Source |
|-----------|--------|
| `proxmox_list_users` | Access Control |
| `proxmox_get_user` | Access Control |
| `proxmox_create_user` | Access Control |
| `proxmox_update_user` | Access Control |
| `proxmox_delete_user` | Access Control |
| `proxmox_list_groups` | Access Control |
| `proxmox_create_group` | Access Control |
| `proxmox_update_group` | Access Control |
| `proxmox_delete_group` | Access Control |
| `proxmox_list_roles` | Access Control |
| `proxmox_create_role` | Access Control |
| `proxmox_update_role` | Access Control |
| `proxmox_delete_role` | Access Control |
| `proxmox_get_acl` | Access Control |
| `proxmox_update_acl` | Access Control |
| `proxmox_list_domains` | Access Control |
| `proxmox_get_domain` | Access Control |
| `proxmox_create_domain` | Access Control |
| `proxmox_update_domain` | Access Control |
| `proxmox_delete_domain` | Access Control |

### File 10: `proxmox-ceph.md` (~16 tools)
**Source groups**: Ceph Integration

| Tool Name | Source |
|-----------|--------|
| `proxmox_get_ceph_status` | Ceph |
| `proxmox_list_ceph_osds` | Ceph |
| `proxmox_create_ceph_osd` | Ceph |
| `proxmox_delete_ceph_osd` | Ceph |
| `proxmox_list_ceph_mons` | Ceph |
| `proxmox_create_ceph_mon` | Ceph |
| `proxmox_delete_ceph_mon` | Ceph |
| `proxmox_list_ceph_mds` | Ceph |
| `proxmox_create_ceph_mds` | Ceph |
| `proxmox_delete_ceph_mds` | Ceph |
| `proxmox_list_ceph_pools` | Ceph |
| `proxmox_create_ceph_pool` | Ceph |
| `proxmox_update_ceph_pool` | Ceph |
| `proxmox_delete_ceph_pool` | Ceph |
| `proxmox_list_ceph_fs` | Ceph |
| `proxmox_create_ceph_fs` | Ceph |

### File 11: `proxmox-pools.md` (~5 tools)
**Source groups**: Pool Management

| Tool Name | Source |
|-----------|--------|
| `proxmox_list_pools` | Pool Management |
| `proxmox_get_pool` | Pool Management |
| `proxmox_create_pool` | Pool Management |
| `proxmox_update_pool` | Pool Management |
| `proxmox_delete_pool` | Pool Management |

**TOTAL**: 38 + 25 + 18 + 22 + 14 + 16 + 20 + 33 + 20 + 16 + 5 = **227** ✓

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: NO - Documentation task, not code
- **Agent-Executed QA**: YES - All verification via commands

### Agent-Executed QA Scenarios

```
Scenario: Total tool count preserved
  Tool: Bash
  Steps:
    1. grep -rch "^#### \`proxmox_" docs/skills/proxmox-*.md | paste -sd+ | bc
    2. Assert: Output equals 227
  Expected Result: Exactly 227 tools across all files

Scenario: Zero duplicate tools
  Tool: Bash
  Steps:
    1. grep -rh "^#### \`proxmox_" docs/skills/proxmox-*.md | sort | uniq -d | wc -l
    2. Assert: Output equals 0
  Expected Result: No duplicates

Scenario: All original tools preserved
  Tool: Bash
  Steps:
    1. diff <(grep -h "^#### \`proxmox_" docs/skills/proxmox-mcp.md.bak | sort) \
            <(grep -rh "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | sort)
    2. Assert: No differences
  Expected Result: Zero tool loss

Scenario: File size under 500 lines each
  Tool: Bash
  Steps:
    1. wc -l docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md
    2. Assert: All files under 500 lines
  Expected Result: No file exceeds 500 lines

Scenario: Index has links to all category files
  Tool: Bash
  Steps:
    1. grep -c "proxmox-" docs/skills/proxmox-mcp.md
    2. Assert: Output >= 10 (one link per category file)
  Expected Result: All categories linked

Scenario: Extraction script generates domain-based output
  Tool: Bash
  Steps:
    1. bun run scripts/extract-tool-docs.ts
    2. Assert: Exit code 0
    3. ls docs/skills/proxmox-*.md | wc -l
    4. Assert: Output >= 11 (index + 10 category files)
  Expected Result: Script generates split files
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Backup original file and plan the tool mapping

Wave 2 (After Wave 1):
└── Task 2: Update extraction script for domain-based output

Wave 3 (After Wave 2 - PARALLEL):
├── Task 3: Create proxmox-nodes.md
├── Task 4: Create proxmox-vm.md
├── Task 5: Create proxmox-lxc.md
├── Task 6: Create proxmox-vm-lxc-shared.md
├── Task 7: Create proxmox-snapshots-backups.md
├── Task 8: Create proxmox-storage.md
├── Task 9: Create proxmox-networking.md
├── Task 10: Create proxmox-cluster.md
├── Task 11: Create proxmox-access-control.md
├── Task 12: Create proxmox-ceph.md
└── Task 13: Create proxmox-pools.md

Wave 4 (After Wave 3):
├── Task 14: Rewrite main index file (proxmox-mcp.md)
└── Task 15: Update AGENTS.md references

Wave 5 (Final):
└── Task 16: Full verification and commit
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3-13 | None |
| 2 | 1 | 3-13 | None |
| 3-13 | 2 | 14 | Each other (all parallel) |
| 14 | 3-13 | 16 | 15 |
| 15 | 3-13 | 16 | 14 |
| 16 | 14, 15 | None | None |

---

## TODOs

- [x] 1. Backup original file

  **What to do**:
  - Copy `docs/skills/proxmox-mcp.md` to `docs/skills/proxmox-mcp.md.bak`
  - This is the baseline for diff verification

  **Must NOT do**:
  - Don't modify the backup file ever

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 2-16
  - **Blocked By**: None

  **References**:
  - `docs/skills/proxmox-mcp.md` - File to backup

  **Acceptance Criteria**:
  - [ ] `diff docs/skills/proxmox-mcp.md docs/skills/proxmox-mcp.md.bak` → no differences
  - [ ] Backup file exists

  **Commit**: NO

---

- [x] 2. Update extraction script for domain-based output

  **What to do**:
  - Modify `scripts/extract-tool-docs.ts` to:
    1. Define a `DOMAIN_MAPPING` constant that maps each tool name to its domain file
    2. Group tools by domain instead of by verb prefix
    3. Generate individual domain files to `docs/skills/proxmox-{domain}.md`
    4. Generate a slim index file `docs/skills/proxmox-mcp.md`
    5. Keep generating `scripts/tool-docs.json` and `scripts/tool-docs.md` as before
  - Use the Tool-to-File Mapping from this plan as the authoritative source
  - Each generated domain file should have:
    - Title header with tool count
    - Brief category description
    - All tools with full parameter documentation
    - Same format as current file (#### heading, description, permission, parameters table)

  **Must NOT do**:
  - Don't change the JSON output format
  - Don't modify registry.ts or server.ts
  - Don't change parameter extraction logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
    - Reason: Significant script modification requiring understanding of existing code

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Tasks 3-13
  - **Blocked By**: Task 1

  **References**:
  - `scripts/extract-tool-docs.ts` - Current extraction script (446 lines)
  - `src/tools/registry.ts` - Tool registry with domain comments
  - `src/server.ts` - TOOL_DESCRIPTIONS with domain comments
  - Tool-to-File Mapping section above (authoritative mapping)

  **Acceptance Criteria**:
  - [ ] `bun run scripts/extract-tool-docs.ts` → exit code 0
  - [ ] Generated files in `docs/skills/`: 11 domain files + 1 index
  - [ ] `grep -rch "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | paste -sd+ | bc` → 227
  - [ ] `scripts/tool-docs.json` still generated with all 227 tools

  **Commit**: YES
  - Message: `feat(docs): update extraction script for domain-based skill files`
  - Files: `scripts/extract-tool-docs.ts`
  - Pre-commit: `bun run scripts/extract-tool-docs.ts`

---

- [x] 3. Generate all domain skill files

  **What to do**:
  - Run the updated extraction script: `bun run scripts/extract-tool-docs.ts`
  - Verify all 11 domain files are generated
  - Verify the index file is generated
  - Spot-check 2-3 files for correct content

  **Must NOT do**:
  - Don't manually create files — the script generates them
  - Don't edit generated content

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:
  - `scripts/extract-tool-docs.ts` - Updated script (from Task 2)
  - Tool-to-File Mapping section above - for verification

  **Acceptance Criteria**:
  - [ ] 11 domain files exist in `docs/skills/`
  - [ ] Each file has correct tool count per the mapping
  - [ ] proxmox-nodes.md contains ~38 tools
  - [ ] proxmox-vm.md contains ~25 tools
  - [ ] proxmox-ceph.md contains 16 tools
  - [ ] proxmox-pools.md contains 5 tools

  **Commit**: YES
  - Message: `docs(skills): split tool documentation into domain-based files`
  - Files: `docs/skills/proxmox-*.md`, `scripts/tool-docs.json`, `scripts/tool-docs.md`

---

- [x] 4. Update AGENTS.md references

  **What to do**:
  - Update `AGENTS.md` to reference the new split skill files instead of just the monolithic file
  - Add list of domain files under the documentation section

  **Must NOT do**:
  - Don't rewrite AGENTS.md structure
  - Don't add new sections

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 5)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - `AGENTS.md` - File to update
  - `docs/skills/` - New file list

  **Acceptance Criteria**:
  - [ ] `grep -c "proxmox-" AGENTS.md` → >= 10 (references to split files)
  - [ ] `grep "Skills Documentation" AGENTS.md` → found

  **Commit**: NO (groups with Task 5)

---

- [x] 5. Full verification and commit

  **What to do**:
  - Run ALL verification scenarios from the Verification Strategy section
  - Verify exact tool count: 227
  - Verify zero duplicates
  - Verify all original tools preserved (diff against backup)
  - Verify all files under 500 lines
  - Remove backup file after verification
  - Commit everything

  **Must NOT do**:
  - Don't skip any verification step
  - Don't remove backup before all checks pass

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `docs/skills/proxmox-mcp.md.bak` - Backup for diff verification
  - Verification Strategy section above

  **Acceptance Criteria**:
  - [ ] Total tool count = 227 (verified by grep + bc)
  - [ ] Zero duplicates (verified by sort | uniq -d)
  - [ ] Zero tool loss (verified by diff against backup)
  - [ ] All files under 500 lines
  - [ ] Backup file removed
  - [ ] `bun run scripts/extract-tool-docs.ts` → exit 0
  - [ ] Git commit created

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Complete verification suite
    Tool: Bash
    Steps:
      1. TOTAL=$(grep -rch "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | paste -sd+ | bc)
      2. Assert: $TOTAL = 227
      3. DUPES=$(grep -rh "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | sort | uniq -d | wc -l)
      4. Assert: $DUPES = 0
      5. diff <(grep -h "^#### \`proxmox_" docs/skills/proxmox-mcp.md.bak | sort) <(grep -rh "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | sort)
      6. Assert: No differences
      7. rm docs/skills/proxmox-mcp.md.bak
    Expected Result: All verifications pass
    Evidence: Command outputs captured

  Scenario: Extraction script still works
    Tool: Bash
    Steps:
      1. bun run scripts/extract-tool-docs.ts
      2. Assert: exit code 0
    Expected Result: Script generates all files cleanly
  ```

  **Commit**: YES
  - Message: `docs(skills): complete domain-based skill file split (227 tools → 11 files)`
  - Files: `docs/skills/proxmox-*.md`, `AGENTS.md`
  - Pre-commit: verification suite above

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 2 | `feat(docs): update extraction script for domain-based skill files` | `scripts/extract-tool-docs.ts` |
| 3 | `docs(skills): split tool documentation into domain-based files` | `docs/skills/proxmox-*.md`, `scripts/tool-docs.*` |
| 5 | `docs(skills): complete domain-based skill file split (227 tools → 11 files)` | `docs/skills/proxmox-*.md`, `AGENTS.md` |

---

## Success Criteria

### Verification Commands
```bash
# Total tool count
grep -rch "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | paste -sd+ | bc
# Expected: 227

# Zero duplicates
grep -rh "^#### \`proxmox_" docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md | sort | uniq -d
# Expected: empty output

# File count
ls docs/skills/proxmox-*.md | wc -l
# Expected: >= 12 (index + 11 domain files)

# Extraction script works
bun run scripts/extract-tool-docs.ts
# Expected: exit 0

# All files under 500 lines
wc -l docs/skills/proxmox-{nodes,vm,lxc,vm-lxc-shared,snapshots-backups,storage,networking,cluster,access-control,ceph,pools}.md
# Expected: all under 500
```

### Final Checklist
- [x] All 227 tools documented across split files
- [x] Zero duplicate tools
- [x] Zero tool loss (verified by diff)
- [x] Each file under 500 lines
- [x] Main index has links to all 10+ category files
- [x] Extraction script generates domain-based output
- [x] AGENTS.md references updated
- [x] Backup file removed
- [x] All commits clean
