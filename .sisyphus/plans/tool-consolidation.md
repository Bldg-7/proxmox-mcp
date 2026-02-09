# Tool Consolidation: 309 → <100 Tools

## TL;DR

> **Quick Summary**: 309개 MCP tool을 VM/LXC 통합 + CRUD 통합 + Guest Agent 그룹통합을 적용하여 ~75개로 줄인다. 완전 교체 (breaking change). 기존 기능 100% 보존.
> 
> **Deliverables**:
> - 309개 tool → ~75개 통합 tool로 전면 교체
> - 모든 handler/schema/description/registry 재작성
> - Agent Skills, SubAgents, README, docs 전체 업데이트
> - TDD: 모든 통합 tool에 대한 새 테스트 스위트
> - npm major version bump + migration guide
> 
> **Estimated Effort**: XL (8-12 weeks)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 0 (mapping table) → Task 1-3 (read query) → Task 4-8 (CRUD) → Task 9-12 (write ops) → Task 13-15 (docs/release)

---

## Context

### Original Request
MCP Client에서 tool이 보이지 않는 문제. Cursor 40개, GitHub Copilot 128개 등 client별 tool 수 제한 존재. 현재 309개를 100개 이하로 줄여야 함.

### Interview Summary
**Key Discussions**:
- 통합 전략: VM/LXC 통합 (type 파라미터) + CRUD 통합 (action 파라미터) 2단계 적용
- 하위 호환성: 완전 교체 (breaking change 허용)
- 우선순위: 읽기(조회) tool부터 먼저
- Guest Agent: 기능별 4그룹 통합 (query/exec/file/system)
- 네이밍: `proxmox_<resource>` 패턴
- 테스트: TDD (vitest)

**Research Findings**:
- Anthropic: "더 적고 사려 깊은 tool > 많은 단순 tool"
- Stainless: action param은 CRUD에 효과적, 10+ action은 성능 저하
- Cursor 40개 하드리밋, GitHub Copilot 128개 리밋

### Metis Review
**Identified Gaps** (addressed):
- VM/LXC 미러 쌍 중 3쌍은 스키마가 근본적으로 다름 (create, disk/mountpoint) → 별도 tool 유지
- registry.ts:1275 하드코딩된 카운트 체크 → 첫 번째 변경으로 수정
- 7개 Agent 정의 + 20개 Skill 참조 파일이 old tool name 참조 → 각 phase에서 함께 업데이트
- 단일 tool에 10+ action은 성능 저하 → 6 action 이하로 제한, 초과 시 sub-resource로 분리
- Permission model 파편화 → 중앙 permission map 구축

---

## Work Objectives

### Core Objective
309개 MCP tool을 100개 이하로 줄이되, 기존의 모든 Proxmox API 기능을 100% 보존한다.

### Concrete Deliverables
- `src/types/tools.ts` — 새로운 TOOL_NAMES (<100개)
- `src/server.ts` — 새로운 TOOL_DESCRIPTIONS
- `src/schemas/` — 통합 Zod 스키마
- `src/tools/` — 통합 handler 함수
- `src/tools/registry.ts` — 새로운 toolRegistry
- `src/tools/permissions.ts` — 중앙 permission map (신규)
- `agents/*.md` — SubAgent 정의 업데이트
- `skills/` + `docs/skills/` — Skill 참조 업데이트
- `docs/TOOLS.md` + `docs/TOOLS_ko.md` — Tool 레퍼런스 재작성
- `README.md` — Tool 수 및 카테고리 테이블 업데이트
- `CHANGELOG.md` — Breaking change 기록
- `MIGRATION.md` — 기존 사용자 마이그레이션 가이드 (신규)

### Definition of Done
- [ ] `pnpm build` — exit 0, TypeScript 에러 없음
- [ ] `pnpm test` — 모든 테스트 pass
- [ ] TOOL_NAMES.length < 100
- [ ] `grep -r "proxmox_start_vm\|proxmox_start_lxc\|proxmox_stop_vm\|proxmox_stop_lxc" agents/ skills/ docs/ README.md` — zero matches
- [ ] 모든 기존 309개 tool의 기능이 새 tool에 매핑됨 (mapping table로 검증)

### Must Have
- 309개 tool의 모든 기능 100% 보존
- type 파라미터로 VM/LXC 구분
- action 파라미터로 CRUD 구분
- TDD — 각 통합 tool마다 테스트 선행
- 중앙 permission map

### Must NOT Have (Guardrails)
- 기존 309개 tool에 없던 새 기능 추가 금지
- Response 포맷 변경 금지 (emoji, markdown 구조 유지)
- Handler factory/abstraction layer 금지 — 단순 switch/dispatch만
- Cursor 40-tool 동적 필터링 기능 — 이 plan 범위 밖
- 스키마 자동 생성 — 수동 마이그레이션만
- 테스트 프레임워크 변경 금지 — vitest + mock client 패턴 유지
- 단일 tool에 7개 이상 action 금지 — 6 이하로 제한
- VM/LXC 스키마가 type-specific optional field 3개 초과 시 통합하지 말고 별도 tool 유지

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: TDD
- **Framework**: vitest

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test file: `src/tools/__tests__/<tool-name>.test.ts`
   - Test command: `pnpm test <file>`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `pnpm test <file>`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `pnpm test`
   - Expected: PASS (all tests)

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| TypeScript build | Bash | `pnpm build` exit 0 |
| Test suite | Bash | `pnpm test` all pass |
| Tool count | Bash | `node -e` script assert < 100 |
| Old name references | Bash (grep) | grep for old names = zero matches |
| MCP protocol | Bash (node -e) | Simulate ListTools, verify JSON Schema |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Foundation — must complete first):
└── Task 0: Mapping table + infrastructure changes (registry assertion, permission map)

Wave 1 (Read-only query tools — start after Wave 0):
├── Task 1: Node & Cluster query tools
├── Task 2: VM/LXC query tools (config, status, pending, feature)
└── Task 3: Storage & Ceph query tools

Wave 2 (CRUD resource tools — start after Wave 0):
├── Task 4: Cluster Management CRUD (HA, firewall, backup jobs, replication)
├── Task 5: SDN CRUD (vnets, zones, controllers, subnets)
├── Task 6: Access Control CRUD (users, groups, roles, domains, tokens, ACL)
└── Task 7: Storage & Pool CRUD + Ceph CRUD

Wave 3 (Write/lifecycle tools — start after Wave 1+2):
├── Task 8: VM/LXC lifecycle (start/stop/reboot/shutdown/pause/resume/delete)
├── Task 9: VM/LXC modify (clone/resize/migrate/template/create)
├── Task 10: Snapshot + Backup tools
├── Task 11: Disk + Network tools
└── Task 12: Guest Agent consolidation (4 groups)

Wave 4 (Finalization — after Wave 3):
├── Task 13: Console, Cloud-Init, Certificate, ACME, Notification tools
├── Task 14: System Operations + Node Management singleton tools
├── Task 15: Documentation, Skills, Agents, README, MIGRATION guide
└── Task 16: Final integration test + npm version bump

Critical Path: Task 0 → Task 2 → Task 8 → Task 15 → Task 16
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 0 | None | 1-16 | None |
| 1 | 0 | 14 | 2, 3, 4, 5, 6, 7 |
| 2 | 0 | 8, 9 | 1, 3, 4, 5, 6, 7 |
| 3 | 0 | 7 | 1, 2, 4, 5, 6 |
| 4 | 0 | 13 | 1, 2, 3, 5, 6, 7 |
| 5 | 0 | 13 | 1, 2, 3, 4, 6, 7 |
| 6 | 0 | 13 | 1, 2, 3, 4, 5, 7 |
| 7 | 0 | 13 | 1, 2, 3, 4, 5, 6 |
| 8 | 0, 2 | 15 | 9, 10, 11, 12 |
| 9 | 0, 2 | 15 | 8, 10, 11, 12 |
| 10 | 0, 2 | 15 | 8, 9, 11, 12 |
| 11 | 0, 2 | 15 | 8, 9, 10, 12 |
| 12 | 0 | 15 | 8, 9, 10, 11 |
| 13 | 0, 4-7 | 15 | 14 |
| 14 | 0, 1 | 15 | 13 |
| 15 | 8-14 | 16 | None |
| 16 | 15 | None | None |

---

## TODOs

- [ ] 0. Foundation: Mapping Table + Infrastructure

  **What to do**:
  - 309개 old tool → new tool 완전 매핑 테이블 작성 (old name → new name + action + type)
  - `src/tools/registry.ts:1275` 하드코딩된 `!== 309` 체크를 `TOOL_NAMES.length` 비교로 변경
  - `src/tools/permissions.ts` 신규 생성: 중앙 permission map `Record<ToolName, Record<Action, PermissionLevel>>`
  - 통합 tool용 base schema 패턴 정의 (action enum + type enum + conditional params)

  **Must NOT do**:
  - 실제 tool handler 구현 금지 — 이 task는 매핑과 인프라만
  - 기존 tool 삭제 금지 — 아직 교체할 것이 없음

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 309→75 매핑은 논리적 분류와 edge case 판단이 핵심. 코드 변경은 최소.
  - **Skills**: []
    - 외부 skill 불필요 — 순수 분석 + 소량 코드 변경

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0)
  - **Blocks**: Tasks 1-16 (모두)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/types/tools.ts:1-315` — 전체 TOOL_NAMES 배열. 309개 tool의 완전한 목록
  - `src/server.ts:16-393` — TOOL_DESCRIPTIONS. 모든 tool의 description 텍스트
  - `src/tools/registry.ts:684-1266` — toolRegistry. handler+schema 매핑의 완전한 목록
  - `src/tools/registry.ts:1273-1279` — 하드코딩된 카운트 assertion. 이것을 수정해야 함

  **API/Type References**:
  - `src/types/tools.ts:317` — `ToolName` union type. 모든 tool이 여기서 파생됨
  - `src/types/tools.ts:319` — `PermissionLevel` type. 'basic' | 'elevated'

  **Documentation References**:
  - `docs/TOOLS.md` — 현재 tool 레퍼런스. 매핑 테이블 작성 시 참고
  - Metis analysis (이 plan의 Context 섹션) — VM/LXC 미러 쌍 31개, CRUD 그룹 27개, 스키마 비대칭 목록

  **Acceptance Criteria**:
  - [ ] `.sisyphus/plans/tool-mapping-table.md` 파일에 309개 old → new 매핑 완성
  - [ ] `src/tools/registry.ts` — 카운트 assertion이 `TOOL_NAMES.length` 기반으로 변경됨
  - [ ] `src/tools/permissions.ts` — 빈 permission map 구조 생성됨 (내용은 후속 task에서 채움)
  - [ ] `pnpm build` exit 0
  - [ ] `pnpm test` — 기존 테스트 여전히 pass (아직 tool 변경 없으므로)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Registry assertion uses dynamic count
    Tool: Bash
    Steps:
      1. grep -n "!== 309\|!== 307" src/tools/registry.ts
      2. Assert: zero matches (하드코딩 숫자 없음)
      3. grep -n "TOOL_NAMES.length" src/tools/registry.ts
      4. Assert: 1+ matches (동적 체크 존재)
    Expected Result: 하드코딩된 tool 수 체크가 동적으로 변경됨

  Scenario: Mapping table completeness
    Tool: Bash
    Steps:
      1. Count lines containing "proxmox_" in mapping table
      2. Assert: >= 309 (모든 old tool이 매핑됨)
    Expected Result: 309개 tool 전부 매핑됨

  Scenario: Build and test pass
    Tool: Bash
    Steps:
      1. pnpm build
      2. Assert: exit 0
      3. pnpm test
      4. Assert: all tests pass
    Expected Result: 기존 기능 무결성 유지
  ```

  **Commit**: YES
  - Message: `refactor(tools): prepare infrastructure for tool consolidation`
  - Files: `src/tools/registry.ts`, `src/tools/permissions.ts`, `.sisyphus/plans/tool-mapping-table.md`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 1. Read Query: Node & Cluster Tools

  **What to do**:
  - 통합 대상 (CRUD 통합):
    - `proxmox_get_nodes` + `proxmox_get_node_status` + `proxmox_get_node_network` + `proxmox_get_node_dns` + `proxmox_get_network_iface` → `proxmox_node(action='list'|'status'|'network'|'dns'|'iface')` (5→1)
    - `proxmox_get_cluster_status` → `proxmox_cluster(action='status')` (시작점, 나중에 다른 cluster tool 합류)
    - `proxmox_get_next_vmid` — 싱글톤 유지
  - TDD: 테스트 먼저 작성 → 구현 → 리팩터
  - TOOL_NAMES, TOOL_DESCRIPTIONS, toolRegistry 업데이트
  - 새 통합 handler + schema 작성

  **Must NOT do**:
  - Node Management (services, syslog 등) 건드리지 않음 — Task 14에서 처리
  - Cluster Management CRUD — Task 4에서 처리
  - action 6개 초과 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 복잡한 로직은 아니지만 정확한 schema 설계와 TDD 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 14
  - **Blocked By**: Task 0

  **References**:
  **Pattern References**:
  - `src/tools/vm-query.ts:25-99` — 기존 query handler 패턴 (validate → sanitize → request → format)
  - `src/schemas/node.ts` — Node 관련 Zod 스키마 전체
  - Task 0의 mapping table — 정확한 old→new 매핑

  **API/Type References**:
  - `src/client/proxmox.ts` — API request 패턴 (`client.request()`)

  **Acceptance Criteria**:
  - [ ] 테스트 파일 생성: `src/tools/__tests__/node.test.ts`
  - [ ] `proxmox_node(action='list'|'status'|'network'|'dns'|'iface')` — 5개 old tool 기능 보존
  - [ ] `pnpm test src/tools/__tests__/node.test.ts` → PASS
  - [ ] `pnpm build` exit 0
  - [ ] old tool names (`proxmox_get_nodes`, `proxmox_get_node_status` 등) — types/tools.ts에서 제거됨

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Node tool handles all actions
    Tool: Bash
    Steps:
      1. pnpm test src/tools/__tests__/node.test.ts
      2. Assert: all tests pass
      3. Assert: test covers action='list', 'status', 'network', 'dns', 'iface'
    Expected Result: 5개 action 모두 테스트됨

  Scenario: Old tool names removed
    Tool: Bash
    Steps:
      1. grep "proxmox_get_nodes\b" src/types/tools.ts
      2. Assert: zero matches
      3. grep "proxmox_node" src/types/tools.ts
      4. Assert: 1 match (new name)
    Expected Result: Old names 제거, new name 등록
  ```

  **Commit**: YES
  - Message: `refactor(tools): consolidate node & cluster query tools`
  - Files: `src/tools/node.ts`, `src/schemas/node.ts`, `src/tools/__tests__/node.test.ts`, `src/types/tools.ts`, `src/server.ts`, `src/tools/registry.ts`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 2. Read Query: VM/LXC Query Tools

  **What to do**:
  - VM/LXC 통합 (type 파라미터):
    - `proxmox_get_vms` — 이미 둘 다 조회하므로 유지 (rename: `proxmox_guest_list`)
    - `proxmox_get_vm_status` / (LXC는 get_vms에 포함) → `proxmox_guest_status(type='vm'|'lxc')`
    - `proxmox_get_vm_config` / `proxmox_get_lxc_config` → `proxmox_guest_config(type='vm'|'lxc')`
    - `proxmox_get_vm_pending` / `proxmox_get_lxc_pending` → `proxmox_guest_pending(type='vm'|'lxc')`
    - `proxmox_check_vm_feature` / `proxmox_check_lxc_feature` → `proxmox_guest_feature(type='vm'|'lxc')`
    - `proxmox_get_storage` — 싱글톤 유지
  - TDD

  **Must NOT do**:
  - VM/LXC lifecycle (start/stop 등) — Task 8
  - VM/LXC modify (clone/resize 등) — Task 9

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: VM/LXC type 파라미터 패턴의 첫 구현. 후속 task의 템플릿이 됨
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 8, 9, 10, 11
  - **Blocked By**: Task 0

  **References**:
  **Pattern References**:
  - `src/schemas/vm.ts:12-24` — 기존 getVmsSchema. `type` field가 이미 존재하는 패턴 참고
  - `src/tools/vm-query.ts` — 기존 VM query handler 전체
  - `src/schemas/vm.ts:26-48` — getVmConfigSchema vs getLxcConfigSchema 비교 필요

  **Acceptance Criteria**:
  - [ ] `proxmox_guest_list`, `proxmox_guest_status`, `proxmox_guest_config`, `proxmox_guest_pending`, `proxmox_guest_feature` — 5개 tool
  - [ ] 각 tool에 `type: 'vm' | 'lxc'` 파라미터
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Guest config handles both VM and LXC
    Tool: Bash
    Steps:
      1. pnpm test src/tools/__tests__/guest-query.test.ts
      2. Assert: tests for type='vm' AND type='lxc' both pass
      3. Assert: VM returns disk/network/CPU config
      4. Assert: LXC returns mountpoint/network/CPU config
    Expected Result: 양쪽 type 모두 올바른 응답

  Scenario: Old VM/LXC query names removed
    Tool: Bash
    Steps:
      1. grep -E "proxmox_get_vm_config|proxmox_get_lxc_config" src/types/tools.ts
      2. Assert: zero matches
    Expected Result: Old names 완전 제거
  ```

  **Commit**: YES
  - Message: `refactor(tools): consolidate VM/LXC query tools with type parameter`
  - Files: `src/tools/guest-query.ts`, `src/schemas/guest.ts`, `src/tools/__tests__/guest-query.test.ts`, `src/types/tools.ts`, `src/server.ts`, `src/tools/registry.ts`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 3. Read Query: Storage & Ceph Query Tools

  **What to do**:
  - Storage 조회: `proxmox_get_storage`, `proxmox_list_storage_content`, `proxmox_list_file_restore`, `proxmox_download_file_restore` → 필요 시 통합
  - Ceph 조회: `proxmox_get_ceph_status`, `proxmox_list_ceph_osds`, `proxmox_list_ceph_mons`, `proxmox_list_ceph_mds`, `proxmox_list_ceph_pools`, `proxmox_list_ceph_fs` → `proxmox_ceph(action='status'|'list_osds'|'list_mons'|'list_mds'|'list_pools'|'list_fs')` (6→1)
  - TDD

  **Must NOT do**:
  - Storage/Ceph CRUD (create/update/delete) — Task 7
  - action 6개 초과 금지 (ceph는 정확히 6개로 한계)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 7
  - **Blocked By**: Task 0

  **References**:
  - `src/schemas/ceph.ts` — Ceph 스키마 전체
  - `src/schemas/storage-management.ts` — Storage 스키마

  **Acceptance Criteria**:
  - [ ] Ceph 조회 6개 tool → 1개 `proxmox_ceph` tool
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate storage & ceph query tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 4. CRUD: Cluster Management (HA, Firewall, Backup Jobs, Replication)

  **What to do**:
  - HA Resources (5→1): `proxmox_ha_resource(action='list'|'get'|'create'|'update'|'delete')`
  - HA Groups (5→1): `proxmox_ha_group(action=...)`
  - Cluster Firewall Rules (5→1): `proxmox_cluster_firewall_rule(action=...)`
  - Cluster Firewall Groups (5→1): `proxmox_cluster_firewall_group(action=...)`
  - Cluster Firewall Aliases (5→1): `proxmox_cluster_firewall_alias(action=...)`
  - Cluster Firewall IPSets (3→1): `proxmox_cluster_firewall_ipset(action='list'|'create'|'delete')`
  - Cluster Firewall IPSet Entries (4→1): `proxmox_cluster_firewall_ipset_entry(action=...)`
  - Cluster Backup Jobs (5→1): `proxmox_cluster_backup_job(action=...)`
  - Cluster Replication Jobs (5→1): `proxmox_cluster_replication_job(action=...)`
  - Cluster Options (2→ merge into `proxmox_cluster`): `proxmox_cluster(action='options'|'update_options'|...)`
  - Cluster Firewall Options (2→ merge into cluster firewall)
  - Cluster Firewall Macros/Refs (2→ 유지 또는 merge)
  - Cluster Config (5→1): `proxmox_cluster_config(action='get'|'list_nodes'|'get_node'|'join'|'totem')`
  - HA Status (1→ merge into `proxmox_ha_resource` or `proxmox_cluster`)
  - Permission map: list/get = basic, create/update/delete = elevated
  - TDD

  **Must NOT do**:
  - SDN — Task 5
  - Access Control — Task 6
  - 단일 tool에 7+ action 금지 → cluster_firewall을 sub-resource별로 분리

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 54개 tool → ~12개. 복잡한 분류/매핑 + permission 설계 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Task 13
  - **Blocked By**: Task 0

  **References**:
  - `src/schemas/cluster-management.ts` — 전체 Cluster 스키마
  - `src/tools/permissions.ts` — Task 0에서 만든 permission map 구조

  **Acceptance Criteria**:
  - [ ] 54개 cluster tool → ~12개 통합 tool
  - [ ] 각 tool의 action 수 ≤ 6
  - [ ] Permission map에 모든 action의 basic/elevated 등록
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate cluster management CRUD tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 5. CRUD: SDN (VNets, Zones, Controllers, Subnets)

  **What to do**:
  - SDN VNets (5→1): `proxmox_sdn_vnet(action='list'|'get'|'create'|'update'|'delete')`
  - SDN Zones (5→1): `proxmox_sdn_zone(action=...)`
  - SDN Controllers (5→1): `proxmox_sdn_controller(action=...)`
  - SDN Subnets (5→1): `proxmox_sdn_subnet(action=...)`
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 4개 CRUD 그룹이 모두 동일한 5-action 패턴. Task 4의 패턴 복사.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: Task 13
  - **Blocked By**: Task 0

  **References**:
  - `src/schemas/sdn.ts` — SDN 스키마 전체
  - Task 4의 구현 패턴 — action 기반 CRUD handler 패턴 복사

  **Acceptance Criteria**:
  - [ ] 20개 SDN tool → 4개
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate SDN CRUD tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 6. CRUD: Access Control (Users, Groups, Roles, Domains, Tokens, ACL)

  **What to do**:
  - Users (5→1): `proxmox_user(action='list'|'get'|'create'|'update'|'delete')`
  - Groups (4→1): `proxmox_group(action='list'|'create'|'update'|'delete')`
  - Roles (4→1): `proxmox_role(action=...)`
  - Domains (5→1): `proxmox_domain(action=...)`
  - User Tokens (5→1): `proxmox_user_token(action=...)`
  - ACL (2→1): `proxmox_acl(action='get'|'update')`
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 6개 CRUD 그룹, 모두 표준 패턴
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7)
  - **Blocks**: Task 13
  - **Blocked By**: Task 0

  **References**:
  - `src/schemas/access-control.ts` — Access Control 스키마 전체

  **Acceptance Criteria**:
  - [ ] 25개 Access Control tool → 6개
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate access control CRUD tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 7. CRUD: Storage Config, Pool, Ceph Mutate

  **What to do**:
  - Storage Config (5→1): `proxmox_storage_config(action='list'|'get'|'create'|'update'|'delete')`
  - Pools (5→1): `proxmox_pool(action=...)`
  - Storage Ops: `upload_to_storage`, `download_url_to_storage`, `delete_storage_content`, `prune_backups` → `proxmox_storage_content(action='list'|'upload'|'download'|'delete'|'prune')` (5→1)
  - Ceph mutate: Task 3의 `proxmox_ceph`에 action 추가 또는 sub-resource 분리
    - Ceph OSDs (3): create/delete → `proxmox_ceph_osd(action='list'|'create'|'delete')`
    - Ceph Mons (3): → `proxmox_ceph_mon(action=...)`
    - Ceph MDS (3): → `proxmox_ceph_mds(action=...)`
    - Ceph Pools (4): → `proxmox_ceph_pool(action=...)`
    - Ceph FS (2): → `proxmox_ceph_fs(action='list'|'create')`
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 13
  - **Blocked By**: Task 0, Task 3

  **References**:
  - `src/schemas/storage-management.ts`
  - `src/schemas/pool-management.ts`
  - `src/schemas/ceph.ts`

  **Acceptance Criteria**:
  - [ ] Storage + Pool + Ceph mutate → ~9개 tool
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate storage, pool, and ceph CRUD tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 8. VM/LXC Lifecycle (start/stop/reboot/shutdown/pause/resume/delete)

  **What to do**:
  - VM/LXC 통합:
    - `proxmox_start_vm` / `proxmox_start_lxc` → `proxmox_guest_start(type='vm'|'lxc')`
    - `proxmox_stop_vm` / `proxmox_stop_lxc` → `proxmox_guest_stop(type=...)`
    - `proxmox_reboot_vm` / `proxmox_reboot_lxc` → `proxmox_guest_reboot(type=...)`
    - `proxmox_shutdown_vm` / `proxmox_shutdown_lxc` → `proxmox_guest_shutdown(type=...)`
    - `proxmox_delete_vm` / `proxmox_delete_lxc` → `proxmox_guest_delete(type=...)`
    - `proxmox_pause_vm` → `proxmox_guest_pause` (VM only — type param 없이, 또는 type='vm' 고정)
    - `proxmox_resume_vm` → `proxmox_guest_resume` (VM only)
  - 또는 추가 CRUD 통합: `proxmox_guest_power(action='start'|'stop'|'reboot'|'shutdown'|'pause'|'resume', type=...)` (12→1)
  - Permission: 모두 elevated
  - TDD

  **Must NOT do**:
  - Clone/resize/migrate — Task 9
  - pause/resume에 type='lxc' 허용 금지 (LXC 미지원)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: VM/LXC 통합 + lifecycle은 elevated 작업. 정확한 permission 처리 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 12)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 2

  **References**:
  - `src/tools/vm-lifecycle.ts` — 기존 lifecycle handler 전체
  - `src/schemas/vm.ts:69-115` — start/stop/reboot/shutdown 스키마
  - Task 2의 type 파라미터 패턴 — 동일 패턴 재사용

  **Acceptance Criteria**:
  - [ ] 12-14개 lifecycle tool → 1-7개 (통합 전략에 따라)
  - [ ] pause/resume는 VM only 명시
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate VM/LXC lifecycle tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 9. VM/LXC Modify (clone/resize/migrate/template/create)

  **What to do**:
  - Clean mirrors (type 통합):
    - `clone_vm` / `clone_lxc` → `proxmox_guest_clone(type=...)`
    - `resize_vm` / `resize_lxc` → `proxmox_guest_resize(type=...)`
    - `migrate_vm` / `migrate_lxc` → `proxmox_guest_migrate(type=...)`
    - `create_template_vm` / `create_template_lxc` → `proxmox_guest_template(type=...)`
  - **Schema divergence — 별도 tool 유지**:
    - `create_vm` / `create_lxc` — 스키마 근본적으로 다름 → `proxmox_create_vm`, `proxmox_create_lxc` 별도 유지
    - `update_vm_config` / `update_lxc_config` → `proxmox_guest_config_update(type=...)` (스키마 유사: 둘 다 key-value config)
  - `list_templates` — 싱글톤 유지
  - TDD

  **Must NOT do**:
  - create_vm과 create_lxc를 강제 통합하지 말 것 — 스키마가 근본적으로 다름
  - type-specific optional field 3개 초과 시 별도 유지

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: schema divergence 판단이 핵심. create_vm/lxc 분리 결정 등 복잡한 설계 판단
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11, 12)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 2

  **References**:
  - `src/tools/vm-modify.ts` — 기존 modify handler
  - `src/tools/vm-create.ts` — create handler (VM/LXC 스키마 차이 확인)
  - `src/schemas/vm.ts:236-248` — updateVmConfigSchema
  - `src/schemas/vm.ts:93-115` — createVmSchema (vs createLxcSchema 비교)

  **Acceptance Criteria**:
  - [ ] clone/resize/migrate/template — type 통합 완료
  - [ ] create_vm, create_lxc — 별도 tool로 유지
  - [ ] update_vm_config / update_lxc_config — 통합 여부 (스키마 유사성 기반 판단)
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate VM/LXC modify tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 10. Snapshot + Backup Tools

  **What to do**:
  - Snapshots — VM/LXC 통합 + CRUD 통합:
    - 8개 tool (create/list/rollback/delete × vm/lxc) → `proxmox_guest_snapshot(action='create'|'list'|'rollback'|'delete', type='vm'|'lxc')` (8→1)
  - Backups — VM/LXC 통합 + CRUD 통합:
    - `create_backup_vm/lxc` + `restore_backup_vm/lxc` + `list_backups` + `delete_backup` → `proxmox_backup(action='create'|'list'|'restore'|'delete', type='vm'|'lxc')` (6→1)
    - Note: `list_backups`와 `delete_backup`는 VM/LXC 구분 없음 — type은 create/restore에서만 사용
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2개 CRUD 그룹, 패턴 확립됨
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11, 12)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 2

  **References**:
  - `src/schemas/snapshot.ts`
  - `src/schemas/backup.ts`

  **Acceptance Criteria**:
  - [ ] 14개 snapshot+backup tool → 2개
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate snapshot and backup tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 11. Disk + Network Tools

  **What to do**:
  - Guest Disk — VM/LXC 통합 (주의: 스키마 비대칭):
    - `add_disk_vm` / `add_mountpoint_lxc` — **별도 유지** (개념 자체가 다름: disk vs mountpoint)
    - `resize_disk_vm` / `resize_disk_lxc` → `proxmox_guest_disk_resize(type=...)`
    - `move_disk_vm` / `move_disk_lxc` → `proxmox_guest_disk_move(type=...)`
    - `remove_disk_vm` / `remove_mountpoint_lxc` — **별도 유지** (파라미터 다름)
  - Guest Network — VM/LXC 통합 (주의: 스키마 비대칭):
    - `add_network_vm/lxc`, `update_network_vm/lxc`, `remove_network_vm/lxc` → `proxmox_guest_network(action='add'|'update'|'remove', type='vm'|'lxc')` (6→1)
    - Note: VM은 `model`/`macaddr`, LXC는 `ip`/`gw` — type-specific optional fields 존재
  - Node Disk Query:
    - `get_node_disks`, `get_disk_smart`, `get_node_lvm`, `get_node_zfs`, `get_node_lvmthin`, `get_node_directory` → `proxmox_node_disk(action='list'|'smart'|'lvm'|'zfs'|'lvmthin'|'directory')` (6→1)
    - `init_disk_gpt`, `wipe_disk` — 별도 유지 또는 merge
  - TDD

  **Must NOT do**:
  - disk_vm과 mountpoint_lxc 강제 통합 금지
  - type-specific field 3개 초과 시 별도 유지

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 스키마 비대칭 판단 복잡
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10, 12)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 2

  **References**:
  - `src/schemas/disk.ts` — Disk 스키마 (VM disk vs LXC mountpoint 비교)
  - `src/schemas/network.ts` — Network 스키마 (VM model/macaddr vs LXC ip/gw 비교)

  **Acceptance Criteria**:
  - [ ] disk_vm / mountpoint_lxc — 별도 유지 확인
  - [ ] resize/move disk — type 통합 확인
  - [ ] guest_network — action+type 이중 통합
  - [ ] node_disk — action 통합
  - [ ] `pnpm test` → PASS, `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate disk and network tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 12. Guest Agent Consolidation (30→4)

  **What to do**:
  - **Query group** (11→1): `proxmox_agent_query(operation='ping'|'osinfo'|'fsinfo'|'memory_blocks'|'network_interfaces'|'time'|'timezone'|'vcpus'|'hostname'|'users'|'memory_block_info')`
    - Note: 11개 action. 6개 초과이므로 분할 고려: `proxmox_agent_info(op=...)` (hw: memory, vcpus, memory_block_info) + `proxmox_agent_query(op=...)` (os: osinfo, fsinfo, network, time, timezone, hostname, users, ping)
  - **Exec group** (2→1): `proxmox_agent_exec(operation='exec'|'status')`
  - **File group** (2→1): `proxmox_agent_file(operation='read'|'write')`
  - **System group** (8→1): `proxmox_agent_system(operation='shutdown'|'fsfreeze_status'|'fsfreeze_freeze'|'fsfreeze_thaw'|'fstrim'|'suspend_disk'|'suspend_ram'|'suspend_hybrid'|'set_user_password')`
    - Note: 9개 action. 6개 초과이므로 분할: `proxmox_agent_freeze(op=...)` + `proxmox_agent_power(op=...)` + `proxmox_agent_user(op=...)`
  - 최종: 30개 → ~6-7개 (action 6개 제한 준수)
  - 모두 VM only (type 파라미터 불필요)
  - TDD

  **Must NOT do**:
  - LXC 지원 추가 금지 — guest agent는 QEMU only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10, 11)
  - **Blocks**: Task 15
  - **Blocked By**: Task 0

  **References**:
  - `src/schemas/vm-advanced.ts` — agent 스키마 전체
  - `src/tools/vm-advanced.ts` — agent handler 전체 (agent_* 함수들)

  **Acceptance Criteria**:
  - [ ] 30개 agent tool → 6-7개
  - [ ] 각 tool action ≤ 6
  - [ ] `pnpm test` → PASS
  - [ ] `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate guest agent tools into functional groups`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 13. Console, Cloud-Init, Certificate, ACME, Notification

  **What to do**:
  - Console Access:
    - `get_vnc_proxy` / `get_lxc_vnc_proxy` → `proxmox_console_vnc(type='vm'|'lxc')` (2→1)
    - `get_term_proxy` / `get_lxc_term_proxy` → `proxmox_console_term(type='vm'|'lxc')` (2→1)
    - `get_spice_proxy` → 싱글톤 유지 (VM only)
  - Cloud-Init (3→1): `proxmox_cloudinit(action='get'|'dump'|'regenerate')`
  - Certificate (7→1): `proxmox_certificate(action='list'|'upload'|'delete'|'order_acme'|'renew_acme'|'revoke_acme'|'acme_config')`
    - Note: 7개 action — 한계. 또는 `proxmox_certificate(action='list'|'upload'|'delete')` + `proxmox_acme_cert(action='order'|'renew'|'revoke'|'config')` 분리
  - ACME (8→2):
    - `proxmox_acme_account(action='list'|'get'|'create'|'update'|'delete')` (5→1)
    - `proxmox_acme_plugin(action='list'|'get')` + `get_acme_directories` → `proxmox_acme_info(action='list_plugins'|'get_plugin'|'directories')` (3→1)
  - Notification (5→1): `proxmox_notification(action='list'|'get'|'create'|'delete'|'test')`
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 14)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 4-7

  **References**:
  - `src/schemas/console-access.ts`, `src/schemas/cloud-init.ts`, `src/schemas/certificate.ts`, `src/schemas/acme.ts`, `src/schemas/notifications.ts`

  **Acceptance Criteria**:
  - [ ] Console 5→3, Cloud-Init 3→1, Certificate 7→2, ACME 8→2, Notification 5→1
  - [ ] 각 tool action ≤ 6
  - [ ] `pnpm test` → PASS, `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate console, cloud-init, cert, ACME, notification tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 14. System Operations + Node Management Singleton Tools

  **What to do**:
  - Node Services: `get_node_services`, `control_node_service` → `proxmox_node_service(action='list'|'control')`
  - Node Logs: `get_node_syslog`, `get_node_journal` → `proxmox_node_log(action='syslog'|'journal')`
  - Node Tasks: `get_node_tasks`, `get_node_task` → `proxmox_node_task(action='list'|'get')`
  - Node Misc: `get_node_aplinfo`, `get_node_netstat`, `get_node_rrddata`, `get_storage_rrddata`, `get_node_report` → `proxmox_node_info(action='aplinfo'|'netstat'|'rrddata'|'storage_rrddata'|'report')` (5→1)
  - System Ops (20개):
    - Time/DNS/Hosts: `proxmox_node_config(action='get_time'|'set_time'|'get_dns'|'set_dns'|'get_hosts'|'set_hosts')` (6→1)
    - Subscription: `proxmox_node_subscription(action='get'|'set'|'delete')` (3→1)
    - APT: `proxmox_apt(action='update'|'upgrade'|'versions')` (3→1)
    - Bulk Ops: `proxmox_node_bulk(action='start_all'|'stop_all'|'migrate_all')` (3→1)
    - Node Power: `proxmox_node_power(action='shutdown'|'reboot'|'wakeonlan')` (3→1)
    - Replication: `proxmox_node_replication(action='status'|'log'|'schedule')` (3→1)
  - Node Network Config: `proxmox_node_network_iface(action='create'|'update'|'delete'|'apply')` (4→1)
  - `proxmox_execute_vm_command` → 유지 또는 `proxmox_agent_exec`에 통합
  - TDD

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 13)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 0, 1

  **References**:
  - `src/schemas/system-operations.ts`
  - `src/schemas/node.ts`
  - `src/schemas/node-network.ts`

  **Acceptance Criteria**:
  - [ ] System Ops 20개 + Node Management 8개 + Node Network 4개 → ~10개
  - [ ] `pnpm test` → PASS, `pnpm build` exit 0

  **Commit**: YES
  - Message: `refactor(tools): consolidate system operations and node management tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 15. Documentation, Skills, Agents, README, Migration Guide

  **What to do**:
  - `agents/*.md` (7개 파일) — old tool names를 new names로 업데이트
  - `skills/` + `docs/skills/` (20+ 파일) — tool reference 업데이트
  - `docs/TOOLS.md` — 전면 재작성
  - `docs/TOOLS_ko.md` — 전면 재작성
  - `README.md` — tool 수, 카테고리 테이블, 예시 업데이트
  - `CHANGELOG.md` — breaking change 기록
  - `MIGRATION.md` (신규) — old→new tool 매핑, 파라미터 변경 가이드

  **Must NOT do**:
  - 코드 변경 금지 — 이 task는 문서만

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 순수 문서 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4 final)
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 8-14

  **References**:
  - Task 0의 mapping table — old→new 매핑 참조
  - 기존 `docs/TOOLS.md` — 현재 형식 유지
  - 기존 `README.md` — 현재 구조 유지

  **Acceptance Criteria**:
  - [ ] `grep -rE "proxmox_start_vm|proxmox_start_lxc|proxmox_get_vm_config|proxmox_get_lxc_config" agents/ skills/ docs/ README.md` → zero matches
  - [ ] MIGRATION.md에 309개 old name 전부 매핑됨
  - [ ] README.md의 tool 수가 실제 TOOL_NAMES.length와 일치

  **Commit**: YES
  - Message: `docs: update all documentation for tool consolidation`
  - Pre-commit: `pnpm build && pnpm test`

---

- [ ] 16. Final Integration Test + npm Version Bump

  **What to do**:
  - 최종 통합 테스트:
    - MCP 서버 시작 → ListTools 요청 → 응답 검증 (tool 수 < 100, 모든 tool에 description + inputSchema)
    - 각 tool에 대해 CallTool 시뮬레이션 (mock)
    - old tool name으로 CallTool → 의미 있는 에러 메시지 확인 (crash 아님)
  - ListTools response size 측정 (< 256KB 확인)
  - TOOL_NAMES.length assertion 테스트 추가
  - `package.json` version bump (major version)
  - 최종 `pnpm build && pnpm test`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None
  - **Blocked By**: Task 15

  **References**:
  - `src/__tests__/integration/server.test.ts` — 기존 integration test 패턴
  - `package.json` — 현재 version 0.6.1

  **Acceptance Criteria**:
  - [ ] `pnpm build` exit 0
  - [ ] `pnpm test` — ALL pass
  - [ ] `node -e "import {TOOL_NAMES} from './dist/types/tools.js'; process.exit(TOOL_NAMES.length > 100 ? 1 : 0)"` → exit 0
  - [ ] ListTools response < 256KB
  - [ ] package.json version bumped to 1.0.0 (or appropriate major)
  - [ ] Integration test: ListTools returns all tools with valid schema
  - [ ] Integration test: CallTool with old name returns error (not crash)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tool count under 100
    Tool: Bash
    Steps:
      1. pnpm build
      2. node -e "import {TOOL_NAMES} from './dist/types/tools.js'; console.log('Tools:', TOOL_NAMES.length); process.exit(TOOL_NAMES.length > 100 ? 1 : 0)"
      3. Assert: exit 0
    Expected Result: Tool count < 100

  Scenario: ListTools response valid
    Tool: Bash
    Steps:
      1. Run integration test
      2. Assert: Every tool has name, description, inputSchema
      3. Assert: No tool has empty description
      4. Assert: Response JSON size < 256KB
    Expected Result: Valid MCP ListTools response

  Scenario: Old tool names return error
    Tool: Bash
    Steps:
      1. Run integration test with old tool name "proxmox_start_vm"
      2. Assert: response.isError === true
      3. Assert: response contains "Unknown tool" message (not crash/exception)
    Expected Result: Graceful error handling for old names
  ```

  **Commit**: YES
  - Message: `feat!: consolidate 309 tools to <100 (BREAKING CHANGE)`
  - Files: `package.json`, `src/__tests__/integration/`
  - Pre-commit: `pnpm build && pnpm test`

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 0 | `refactor(tools): prepare infrastructure for tool consolidation` | `pnpm build && pnpm test` |
| 1 | `refactor(tools): consolidate node & cluster query tools` | `pnpm build && pnpm test` |
| 2 | `refactor(tools): consolidate VM/LXC query tools with type parameter` | `pnpm build && pnpm test` |
| 3 | `refactor(tools): consolidate storage & ceph query tools` | `pnpm build && pnpm test` |
| 4 | `refactor(tools): consolidate cluster management CRUD tools` | `pnpm build && pnpm test` |
| 5 | `refactor(tools): consolidate SDN CRUD tools` | `pnpm build && pnpm test` |
| 6 | `refactor(tools): consolidate access control CRUD tools` | `pnpm build && pnpm test` |
| 7 | `refactor(tools): consolidate storage, pool, and ceph CRUD tools` | `pnpm build && pnpm test` |
| 8 | `refactor(tools): consolidate VM/LXC lifecycle tools` | `pnpm build && pnpm test` |
| 9 | `refactor(tools): consolidate VM/LXC modify tools` | `pnpm build && pnpm test` |
| 10 | `refactor(tools): consolidate snapshot and backup tools` | `pnpm build && pnpm test` |
| 11 | `refactor(tools): consolidate disk and network tools` | `pnpm build && pnpm test` |
| 12 | `refactor(tools): consolidate guest agent tools into functional groups` | `pnpm build && pnpm test` |
| 13 | `refactor(tools): consolidate console, cloud-init, cert, ACME, notification tools` | `pnpm build && pnpm test` |
| 14 | `refactor(tools): consolidate system operations and node management tools` | `pnpm build && pnpm test` |
| 15 | `docs: update all documentation for tool consolidation` | `pnpm build && pnpm test` |
| 16 | `feat!: consolidate 309 tools to <100 (BREAKING CHANGE)` | `pnpm build && pnpm test` |

---

## Success Criteria

### Verification Commands
```bash
pnpm build                    # Expected: exit 0
pnpm test                     # Expected: ALL pass
node -e "import {TOOL_NAMES} from './dist/types/tools.js'; console.log(TOOL_NAMES.length); process.exit(TOOL_NAMES.length > 100 ? 1 : 0)"  # Expected: exit 0, count < 100
grep -rE "proxmox_start_vm|proxmox_stop_vm|proxmox_get_vm_config" src/types/tools.ts  # Expected: zero matches
grep -rE "proxmox_start_vm|proxmox_stop_lxc" agents/ skills/ docs/ README.md  # Expected: zero matches
```

### Final Checklist
- [ ] All "Must Have" present (기능 100% 보존, type/action 파라미터, TDD, permission map)
- [ ] All "Must NOT Have" absent (새 기능 없음, response 포맷 변경 없음, 7+ action 없음)
- [ ] All tests pass
- [ ] Tool count < 100
- [ ] Documentation fully updated
- [ ] Migration guide complete
- [ ] npm major version bumped
