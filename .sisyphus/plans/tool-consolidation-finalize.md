# Tool Consolidation Finalize: 107 → <100

## TL;DR

> **Quick Summary**: feat/tool-consolidation-309-to-107 브랜치의 마감 작업. 24개 잔여 old-style tool 추가 통합 (107→~90), 문서/스킬/에이전트 전면 업데이트, MIGRATION.md 작성, changeset 생성, 최종 검증.
>
> **Deliverables**:
> - 107개 tool → ~90개 통합 tool (잔여 old-style 정리)
> - 52+ 문서 파일 업데이트 (agents, skills, docs, README)
> - MIGRATION.md 신규 작성 (old→new 매핑 가이드)
> - changeset 파일 생성 (major version bump)
> - 최종 통합 테스트 통과
>
> **Estimated Effort**: Medium (2-3일)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (추가 통합) → Task 2 (docs/TOOLS 재작성) → Task 3 (agents/skills/README) → Task 4 (MIGRATION) → Task 5 (changeset + 최종 검증)

---

## Context

### Original Request
feat/tool-consolidation-309-to-107 브랜치 마감. Task 0~14 완료 상태에서 남은 작업 마무리.

### Current State
- **브랜치**: `feat/tool-consolidation-309-to-107` (14 commits ahead of main)
- **코드 통합**: Task 0~14 완료, 309→107 tool
- **빌드**: `pnpm build` exit 0
- **테스트**: 1100 tests all pass (40 test files)
- **잔여 old-style tool**: 24개 (create_vm/lxc 2개는 의도적 유지)
- **문서**: 미업데이트 (309 참조 32곳, tool 참조 2400+)

### Metis Review
**Identified Gaps** (addressed):
- `src/server.ts` TOOL_DESCRIPTIONS 업데이트 누락 위험 → 각 통합 시 반드시 포함
- `permissions.ts` 원자적 업데이트 필요 → 코드 통합과 동시 수행
- `README_ko.md` 누락 → 명시적으로 포함
- `skills/` vs `docs/skills/` 두 트리 별도 관리 → 명시적 분리
- SKILL.md YAML frontmatter `tool_count` 업데이트 → prose뿐 아니라 메타데이터도
- 내부 함수명 (listVmFirewallRules 등) 변경 불필요 → 명시적 guardrail
- 정확한 문서 파일 수: 52개 (plan에서 30+로 과소추정)
- `docs/TOOLS.md`, `docs/TOOLS_ko.md`는 find-replace 불가, 전면 재작성 필요

---

## Work Objectives

### Core Objective
107개 tool을 100개 미만으로 줄이고, 모든 문서/스킬/에이전트를 동기화하여 PR-ready 상태로 만든다.

### Concrete Deliverables
- `src/types/tools.ts` — TOOL_NAMES < 100개
- `src/server.ts` — TOOL_DESCRIPTIONS 동기화
- `src/tools/registry.ts` — toolRegistry 동기화
- `src/tools/permissions.ts` — permission map 동기화
- 새 통합 handler/schema 파일들
- `docs/TOOLS.md` + `docs/TOOLS_ko.md` — 전면 재작성
- `agents/*.md` (7개) — tool name 교체
- `skills/**/*.md` (20개) + `docs/skills/*.md` (21개) — tool name/count 교체
- `README.md` + `README_ko.md` — tool count/table/예시 업데이트
- `MIGRATION.md` (신규) — old→new 매핑 가이드
- `.changeset/*.md` — major version changeset

### Definition of Done
- [ ] `pnpm build` exit 0
- [ ] `pnpm test` ≥ 1100 tests pass
- [ ] `TOOL_NAMES.length` < 100
- [ ] `grep -r "309" docs/ README*.md skills/ agents/` → zero matches
- [ ] `grep -rE "proxmox_start_vm|proxmox_start_lxc|proxmox_stop_vm|proxmox_list_vm_firewall" src/types/tools.ts` → zero matches
- [ ] MIGRATION.md에 모든 removed tool 매핑됨
- [ ] changeset 파일 존재

### Must Have
- 기존 309개 tool 기능 100% 보존
- 각 통합 그룹별 atomic commit (build+test 통과 후 커밋)
- MIGRATION.md의 old→new 매핑 완전성
- changeset으로 버전 관리 (직접 package.json 수정 금지)

### Must NOT Have (Guardrails)
- 내부 함수명 변경 금지 — `listVmFirewallRules` 등은 그대로 유지, TOOL_NAMES만 변경
- `vm-advanced.ts` 리팩토링 금지 — 새 handler 추가만
- agent/skill 예시 로직 변경 금지 — tool name만 교체
- 새 기능/action 추가 금지 — 1:1 매핑만
- `proxmox_create_vm`, `proxmox_create_lxc` 통합 금지 — 스키마 근본 차이
- package.json version 직접 수정 금지 — changeset만
- CHANGELOG.md 직접 수정 금지 — changeset이 생성
- 기존 버그 수정 금지 (예: monitor.md의 proxmox_get_storage_rrddata 오참조)
- response 포맷 변경 금지 (emoji, markdown 구조 유지)
- 단일 tool에 7개 이상 action 금지

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: TDD
- **Framework**: vitest

### Gate: 각 통합 그룹 후 반드시 실행
```bash
pnpm build && pnpm test
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Code Consolidation — SEQUENTIAL within wave):
└── Task 1: 잔여 old-style tool 추가 통합 (107→~90)
    ├── Group A: Guest Firewall 10→1
    ├── Group B: File Restore 2→1
    ├── Group C: VM Disk 2→1
    ├── Group D: LXC Mountpoint 2→1
    ├── Group E: Node Disk Admin 2→1
    ├── Group F: Singleton 흡수 (get_storage, list_templates, execute_vm_command)
    └── Group G: Spice rename

Wave 2 (Documentation — PARALLEL after Wave 1):
├── Task 2: docs/TOOLS.md + docs/TOOLS_ko.md 전면 재작성
├── Task 3: agents + skills + README 업데이트
└── Task 4: MIGRATION.md 작성

Wave 3 (Finalization — SEQUENTIAL after Wave 2):
└── Task 5: changeset 생성 + 최종 통합 검증
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5 | None |
| 2 | 1 | 5 | 3, 4 |
| 3 | 1 | 5 | 2, 4 |
| 4 | 1 | 5 | 2, 3 |
| 5 | 2, 3, 4 | None | None |

---

## TODOs

- [ ] 1. 잔여 Old-Style Tool 추가 통합 (107→~90)

  **What to do**:
  
  **Group A: Guest Firewall Rules 통합 (10→1)**
  - VM/LXC firewall 10개 tool → `proxmox_guest_firewall_rule(action='list'|'get'|'create'|'update'|'delete', type='vm'|'lxc')`
  - `rule_action` 필드 사용 (cluster firewall과 동일 패턴 — Task 4에서 `proxmox_cluster_firewall_rule`이 이미 이 패턴 사용 중)
  - 수정 대상: `src/types/tools.ts`, `src/server.ts`, `src/tools/registry.ts`, `src/tools/permissions.ts`, `src/tools/index.ts`
  - 새 파일 또는 기존 `src/tools/vm-advanced.ts`에 handler 추가
  - 새 schema: `src/schemas/guest.ts`에 guestFirewallRuleSchema 추가
  - 테스트: `src/tools/__tests__/guest-firewall.test.ts` 신규 생성
  - Permission: list/get = basic, create/update/delete = elevated
  - `pnpm build && pnpm test` → commit: `refactor(tools): consolidate guest firewall rules (10→1)`

  **Group B: File Restore 통합 (2→1)**
  - `proxmox_list_file_restore` + `proxmox_download_file_restore` → `proxmox_file_restore(action='list'|'download')`
  - 수정 대상: 동일 8개 파일
  - Permission: list = basic, download = basic
  - `pnpm build && pnpm test` → commit: `refactor(tools): consolidate file restore tools (2→1)`

  **Group C: VM Disk 통합 (2→1)**
  - `proxmox_add_disk_vm` + `proxmox_remove_disk_vm` → `proxmox_vm_disk(action='add'|'remove')`
  - Permission: add = elevated, remove = elevated
  - `pnpm build && pnpm test` → commit: `refactor(tools): consolidate VM disk tools (2→1)`

  **Group D: LXC Mountpoint 통합 (2→1)**
  - `proxmox_add_mountpoint_lxc` + `proxmox_remove_mountpoint_lxc` → `proxmox_lxc_mountpoint(action='add'|'remove')`
  - Permission: add = elevated, remove = elevated
  - `pnpm build && pnpm test` → commit: `refactor(tools): consolidate LXC mountpoint tools (2→1)`

  **Group E: Node Disk Admin 통합 (2→1)**
  - `proxmox_init_disk_gpt` + `proxmox_wipe_disk` → `proxmox_node_disk_admin(action='init_gpt'|'wipe')`
  - Permission: init_gpt = elevated, wipe = elevated
  - `pnpm build && pnpm test` → commit: `refactor(tools): consolidate node disk admin tools (2→1)`

  **Group F: Singleton 흡수 (3→0)**
  - `proxmox_get_storage` → `proxmox_storage_config`에 흡수 (`action='cluster_usage'`는 이미 permissions.ts에 등록됨, handler 구현 확인 후 TOOL_NAMES에서 제거)
  - `proxmox_list_templates` → `proxmox_storage_content`에 흡수 (`action='list_templates'`는 이미 permissions.ts에 등록됨, handler 구현 확인 후 제거)
  - `proxmox_execute_vm_command` → `proxmox_agent_exec`에 `operation='exec_shell'`로 흡수 (mapping table에서 이미 매핑됨)
  - **`proxmox_get_next_vmid` 유지** — agent/skill 파일에서 가장 많이 참조되는 singleton, 흡수 시 인지 부하 증가
  - `pnpm build && pnpm test` → commit: `refactor(tools): absorb singleton tools into consolidated tools`

  **Group G: SPICE Rename (1→1)**
  - `proxmox_get_spice_proxy` → `proxmox_console_spice` (console 패밀리와 네이밍 통일)
  - net count 변화 없음 (rename only)
  - `pnpm build && pnpm test` → commit: `refactor(tools): rename get_spice_proxy to console_spice`

  **예상 결과**: 107 - 9 - 1 - 1 - 1 - 1 - 3 = **91 tools**

  **Must NOT do**:
  - `proxmox_create_vm`, `proxmox_create_lxc` 통합 금지
  - `proxmox_get_next_vmid` 흡수 금지 (유지)
  - 내부 함수명 변경 금지
  - vm-advanced.ts 리팩토링 금지
  - action 6개 초과 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 7개 통합 그룹을 순차 처리. 각 그룹마다 8개 파일 수정 + TDD + 빌드 검증. 패턴은 확립되어 있으나 양이 많음.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/tools/guest-lifecycle.ts` — type 파라미터 통합 패턴 (handleGuestStart 등)
  - `src/tools/guest-query.ts` — type discriminatedUnion 패턴
  - `src/tools/cluster-management.ts:클러스터 firewall rule` — `rule_action` 필드 패턴 (firewall action 충돌 해결)
  - `src/schemas/guest.ts` — 기존 통합 스키마 전체 (action + type 패턴 참조)
  - `src/tools/permissions.ts:160-170` — `storage_config.cluster_usage`, `storage_content.list_templates` 이미 등록됨 (singleton 흡수 시 참조)

  **API/Type References**:
  - `src/types/tools.ts:79-88` — 현재 10개 firewall tool names
  - `src/types/tools.ts:94-103` — vm_disk, mountpoint_lxc, init_disk_gpt, wipe_disk
  - `src/tools/vm-advanced.ts` — 기존 firewall handler 함수 (listVmFirewallRules, getVmFirewallRule 등)
  - `src/schemas/vm-advanced.ts` — 기존 firewall 스키마 (listFirewallRulesSchema 등)

  **Mapping References**:
  - `.sisyphus/plans/tool-mapping-table.md:282-291` — firewall old→new 매핑
  - `.sisyphus/plans/tool-mapping-table.md:311-332` — disk/mountpoint/node_disk 매핑
  - `.sisyphus/plans/tool-mapping-table.md:95-101` — singleton 매핑 (get_storage→storage_config, list_templates→storage_content, execute_vm_command→agent_exec, get_next_vmid→cluster)

  **Acceptance Criteria**:
  - [ ] `TOOL_NAMES.length` < 100 (pnpm build 후 검증)
  - [ ] 10개 firewall tool names가 `src/types/tools.ts`에서 제거됨
  - [ ] `proxmox_guest_firewall_rule` 등록됨 (types, server, registry, permissions)
  - [ ] file_restore, vm_disk, lxc_mountpoint, node_disk_admin 각각 통합됨
  - [ ] `proxmox_get_storage`, `proxmox_list_templates`, `proxmox_execute_vm_command` 제거됨
  - [ ] `proxmox_get_next_vmid` 유지됨
  - [ ] `proxmox_get_spice_proxy` → `proxmox_console_spice` 변경됨
  - [ ] 각 Group마다 `pnpm build && pnpm test` 통과 후 커밋됨
  - [ ] 최종: `pnpm test` ≥ 1100 tests pass

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tool count under 100 after all consolidations
    Tool: Bash
    Steps:
      1. pnpm build
      2. node -e "import('./dist/types/tools.js').then(m=>{console.log(m.TOOL_NAMES.length);process.exit(m.TOOL_NAMES.length>100?1:0)})"
      3. Assert: exit 0, output < 100
    Expected Result: Tool count under 100
    Evidence: Terminal output captured

  Scenario: Old firewall tool names removed
    Tool: Bash
    Steps:
      1. grep -E "proxmox_list_vm_firewall_rules|proxmox_get_vm_firewall_rule|proxmox_create_vm_firewall_rule|proxmox_list_lxc_firewall_rules" src/types/tools.ts
      2. Assert: zero matches
      3. grep "proxmox_guest_firewall_rule" src/types/tools.ts
      4. Assert: 1 match
    Expected Result: Old names removed, new name registered
    Evidence: grep output

  Scenario: Singleton tools removed
    Tool: Bash
    Steps:
      1. grep -E "proxmox_get_storage'|proxmox_list_templates'|proxmox_execute_vm_command'" src/types/tools.ts
      2. Assert: zero matches
      3. grep "proxmox_get_next_vmid" src/types/tools.ts
      4. Assert: 1 match (kept)
    Expected Result: 3 singletons removed, get_next_vmid kept
    Evidence: grep output

  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. pnpm test
      2. Assert: all tests pass, count >= 1100
    Expected Result: No regression
    Evidence: vitest output
  ```

  **Commit**: YES (7 atomic commits, one per Group A-G)

---

- [ ] 2. docs/TOOLS.md + docs/TOOLS_ko.md 전면 재작성

  **What to do**:
  - `docs/TOOLS.md` — 현재 309개 tool 기준 전면 재작성 → 새 ~91개 tool 기준
    - 카테고리 테이블 재작성 (Node & Cluster, Guest Management, Storage, Ceph, Agent, Console, Cluster Firewall, SDN, Access Control, Pool, Backup, Disk, Cloud-Init, Certificate, ACME, Notification)
    - 제거된 tool 섹션 삭제
    - 새 통합 tool 섹션 추가 (action/type 파라미터 포함)
    - `scripts/extract-tool-docs.ts` 사용 가능하면 활용, 아니면 수동 작성
  - `docs/TOOLS_ko.md` — 동일하게 한국어 버전 재작성
  - tool count는 Task 1 완료 후 `TOOL_NAMES.length`로 정확히 계산한 값 사용 (하드코딩 금지)

  **Must NOT do**:
  - tool count 추정치 사용 금지 — 반드시 build 후 정확한 값 사용
  - 코드 변경 금지 — 이 task는 문서만
  - 기존 tool 설명 재작성 금지 — 새 통합 tool만 새로 작성, 나머지는 이름만 교체

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 순수 문서 작업. 대량 텍스트 생성/교체.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  **Pattern References**:
  - `docs/TOOLS.md` — 현재 구조 및 포맷 참조 (섹션 헤더, 파라미터 테이블, 예시 형식)
  - `docs/TOOLS_ko.md` — 한국어 번역 패턴
  - `src/server.ts:16-171` — TOOL_DESCRIPTIONS (각 tool의 description 텍스트 소스)
  - `src/types/tools.ts` — 최종 TOOL_NAMES 목록 (source of truth)

  **Mapping References**:
  - `.sisyphus/plans/tool-mapping-table.md` — old→new 전체 매핑

  **Acceptance Criteria**:
  - [ ] `docs/TOOLS.md`의 tool count가 `TOOL_NAMES.length`와 일치
  - [ ] `docs/TOOLS_ko.md`의 tool count가 `TOOL_NAMES.length`와 일치
  - [ ] 제거된 tool (proxmox_start_vm, proxmox_list_vm_firewall_rules 등)의 섹션이 없음
  - [ ] 새 통합 tool (proxmox_guest_firewall_rule, proxmox_file_restore 등)의 섹션이 있음
  - [ ] 각 tool 섹션에 action/type 파라미터 설명 포함

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: No old tool references in TOOLS docs
    Tool: Bash
    Steps:
      1. grep -cE "proxmox_start_vm|proxmox_stop_lxc|proxmox_list_vm_firewall|proxmox_get_vm_config" docs/TOOLS.md
      2. Assert: 0
      3. Same for docs/TOOLS_ko.md
      4. Assert: 0
    Expected Result: All old tool references removed
    Evidence: grep output

  Scenario: Tool count matches code
    Tool: Bash
    Steps:
      1. pnpm build
      2. ACTUAL=$(node -e "import('./dist/types/tools.js').then(m=>console.log(m.TOOL_NAMES.length))")
      3. grep -o "comprehensive tools" docs/TOOLS.md → extract count number before it
      4. Assert: doc count == ACTUAL
    Expected Result: Doc and code in sync
    Evidence: Count comparison output
  ```

  **Commit**: YES
  - Message: `docs: rewrite TOOLS.md and TOOLS_ko.md for consolidated tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [x] 3. Agents + Skills + README 업데이트

  **What to do**:
  
  **README.md + README_ko.md**:
  - "309" → 실제 `TOOL_NAMES.length` 값으로 교체 (7곳 + 5곳 = 12곳)
  - tool 카테고리 테이블 재작성 (새 카테고리/개수 반영)
  - workflow 예시의 tool name 교체 (proxmox_start_vm → proxmox_guest_start 등)
  - "808 tests" → 실제 테스트 수로 업데이트

  **Agent 파일 (7개)**:
  - `agents/vm-manager.md` — 47개 tool 참조 교체
  - `agents/cluster-admin.md` — 61개 tool 참조 교체
  - `agents/lxc-manager.md` — 41개 tool 참조 교체
  - `agents/network-admin.md` — 30개 tool 참조 교체
  - `agents/storage-admin.md` — 57개 tool 참조 교체
  - `agents/access-admin.md` — 29개 tool 참조 교체
  - `agents/monitor.md` — 23개 tool 참조 교체
  - **주의**: 기존 버그 (monitor.md의 proxmox_get_storage_rrddata 오참조 등) 수정 금지

  **Skill 파일 (20개 + 21개 mirror = 41개)**:
  - `skills/proxmox-mcp-tools/SKILL.md` — tool_count frontmatter + prose 교체 (7곳)
  - `skills/proxmox-mcp-tools/references/proxmox-*.md` (14개) — tool name/count 교체
  - `skills/proxmox-admin/references/proxmox-*.md` (5개) — tool name 교체
  - `docs/skills/proxmox-*.md` (21개) — **mirror 파일**, skills/ 와 동일하게 교체
  - **주의**: YAML frontmatter의 `tool_count:` 필드도 반드시 업데이트
  - **주의**: 예시 코드의 tool name만 교체, 예시 로직 변경 금지

  **Must NOT do**:
  - 예시 로직/워크플로우 변경 금지 — tool name만 교체
  - 기존 버그 수정 금지
  - 코드 변경 금지
  - CHANGELOG.md 수정 금지 (changeset이 처리)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 대량 find-replace + 문서 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  **Pattern References**:
  - `.sisyphus/plans/tool-mapping-table.md` — old→new 전체 매핑 (교체 시 참조)
  - `src/types/tools.ts` — 최종 TOOL_NAMES (교체 후 검증 시 대조)

  **File Inventory (exact)**:
  - `README.md` — "309" 7곳, tool 참조 12곳
  - `README_ko.md` — "309" 5곳
  - `agents/vm-manager.md` — 47 참조
  - `agents/cluster-admin.md` — 61 참조
  - `agents/lxc-manager.md` — 41 참조
  - `agents/network-admin.md` — 30 참조
  - `agents/storage-admin.md` — 57 참조
  - `agents/access-admin.md` — 29 참조
  - `agents/monitor.md` — 23 참조
  - `skills/proxmox-mcp-tools/SKILL.md` — "309" 7곳
  - `skills/proxmox-mcp-tools/references/*.md` — 14개 파일
  - `skills/proxmox-admin/references/*.md` — 5개 파일
  - `docs/skills/*.md` — 21개 mirror 파일

  **Acceptance Criteria**:
  - [ ] `grep -r "309" README.md README_ko.md agents/ skills/ docs/skills/` → zero matches
  - [ ] `grep -rE "proxmox_start_vm|proxmox_stop_lxc|proxmox_get_vm_config|proxmox_get_lxc_config" agents/ skills/ docs/skills/ README.md README_ko.md` → zero matches
  - [ ] `skills/proxmox-mcp-tools/SKILL.md`의 `tool_count:` frontmatter가 실제 값과 일치
  - [ ] `docs/skills/proxmox-mcp-tools.md`의 `tool_count:` frontmatter가 실제 값과 일치
  - [ ] 모든 `docs/skills/` mirror 파일이 대응하는 `skills/` 파일과 일치

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: No "309" references remain
    Tool: Bash
    Steps:
      1. grep -rn "309" README.md README_ko.md agents/ skills/ docs/skills/
      2. Assert: zero matches (exclude CHANGELOG.md — historical data)
    Expected Result: All "309" replaced with actual tool count
    Evidence: grep output

  Scenario: No old tool names in agents
    Tool: Bash
    Steps:
      1. grep -rlE "proxmox_start_vm|proxmox_stop_vm|proxmox_start_lxc|proxmox_stop_lxc" agents/
      2. Assert: zero matching files
    Expected Result: All agent files use new consolidated names
    Evidence: grep output

  Scenario: Skill YAML frontmatter updated
    Tool: Bash
    Steps:
      1. grep "tool_count:" skills/proxmox-mcp-tools/SKILL.md
      2. Assert: value matches TOOL_NAMES.length
      3. grep "tool_count:" docs/skills/proxmox-mcp-tools.md
      4. Assert: same value
    Expected Result: Frontmatter reflects actual tool count
    Evidence: grep output

  Scenario: skills/ and docs/skills/ in sync
    Tool: Bash
    Steps:
      1. diff skills/proxmox-mcp-tools/references/proxmox-vm.md docs/skills/proxmox-vm.md
      2. Assert: identical (or expected differences)
      3. Repeat for all mirror pairs
    Expected Result: Mirror files synchronized
    Evidence: diff output
  ```

  **Commit**: YES
  - Message: `docs: update agents, skills, README for consolidated tools`
  - Pre-commit: `pnpm build && pnpm test`

---

- [x] 4. MIGRATION.md 작성

  **What to do**:
  - `MIGRATION.md` 신규 파일 작성 (프로젝트 루트)
  - 내용:
    - Breaking change 요약 (309→~91 tools)
    - 통합 전략 설명 (VM/LXC type 파라미터, CRUD action 파라미터)
    - **Old → New 매핑 테이블** (`.sisyphus/plans/tool-mapping-table.md` 기반)
      - 309개 old tool 전부 포함
      - 각각의 new tool name, action, type 명시
    - 파라미터 변경 가이드:
      - `type` 파라미터 추가 예시 (before/after)
      - `action` 파라미터 추가 예시 (before/after)
      - `rule_action` 필드 사용 예시 (firewall)
    - 유지된 tool 목록 (`create_vm`, `create_lxc`, `get_next_vmid` 등)
    - AI agent 사용자를 위한 가이드 (skill 업데이트 방법)

  **Must NOT do**:
  - 코드 변경 금지
  - tool-mapping-table.md 내용 변경 금지 — 참조만

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 순수 문서 작성
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `.sisyphus/plans/tool-mapping-table.md` — 309개 old→new 전체 매핑 (source of truth)
  - `src/types/tools.ts` — 최종 TOOL_NAMES
  - `.sisyphus/notepads/tool-consolidation/decisions.md` — 설계 결정 기록

  **Acceptance Criteria**:
  - [ ] `MIGRATION.md` 파일 존재
  - [ ] 309개 old tool name이 모두 매핑됨 (grep count ≥ 309)
  - [ ] before/after 코드 예시 포함
  - [ ] 유지된 tool 목록 포함

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Migration guide completeness
    Tool: Bash
    Steps:
      1. grep -c "proxmox_" MIGRATION.md
      2. Assert: >= 309 (모든 old tool이 언급됨)
      3. grep "proxmox_guest_firewall_rule" MIGRATION.md
      4. Assert: 1+ match (새 통합 tool 설명)
    Expected Result: Comprehensive migration guide
    Evidence: grep output
  ```

  **Commit**: YES
  - Message: `docs: add MIGRATION.md for tool consolidation`
  - Pre-commit: `pnpm build && pnpm test`

---

- [x] 5. Changeset 생성 + 최종 통합 검증

  **What to do**:
  
  **Changeset 생성**:
  - `npx changeset` 또는 수동으로 `.changeset/` 에 markdown 파일 생성
  - 내용:
    ```
    ---
    "@bldg-7/proxmox-mcp": major
    ---

    BREAKING CHANGE: Consolidate 309 tools to ~91 tools

    - VM/LXC tool pairs merged with `type` parameter (vm|lxc)
    - CRUD tool groups merged with `action` parameter
    - Guest agent tools merged into functional groups
    - See MIGRATION.md for complete old→new tool mapping
    ```
  - **package.json 직접 수정 금지** — changeset이 PR merge 시 처리

  **최종 통합 검증**:
  - `pnpm build` exit 0
  - `pnpm test` — all pass, ≥ 1100 tests
  - `TOOL_NAMES.length` < 100 확인
  - `grep -r "309" docs/ README*.md skills/ agents/` → zero matches
  - `grep -rE "proxmox_start_vm|proxmox_start_lxc|proxmox_stop_vm" src/types/tools.ts` → zero matches
  - 모든 `proxmox_*` 참조 in docs/agents/skills가 실제 TOOL_NAMES에 존재하는지 교차 검증
  - ListTools response size 측정 (< 256KB 확인)

  **Must NOT do**:
  - package.json version 직접 수정 금지
  - CHANGELOG.md 수정 금지
  - 코드 변경 금지 — 검증만

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: changeset 파일 1개 생성 + 검증 스크립트 실행
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `.changeset/config.json` — changeset 설정 (baseBranch: "main", access: "public")
  - `src/types/tools.ts` — TOOL_NAMES (source of truth)
  - `src/__tests__/integration/server.test.ts` — 기존 integration test

  **Acceptance Criteria**:
  - [ ] `.changeset/*.md` 파일 존재 (major bump changeset)
  - [ ] `pnpm build` exit 0
  - [ ] `pnpm test` ≥ 1100 tests pass
  - [ ] `TOOL_NAMES.length` < 100
  - [ ] `grep -r "309" docs/ README*.md skills/ agents/` → zero matches
  - [ ] 모든 doc/agent/skill의 `proxmox_*` 참조가 TOOL_NAMES에 존재

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Changeset file exists with major bump
    Tool: Bash
    Steps:
      1. ls .changeset/*.md
      2. Assert: at least 1 file (not README.md)
      3. cat .changeset/*.md | grep "major"
      4. Assert: 1+ match
    Expected Result: Major version changeset ready
    Evidence: File listing + content

  Scenario: Final tool count verification
    Tool: Bash
    Steps:
      1. pnpm build
      2. node -e "import('./dist/types/tools.js').then(m=>{const c=m.TOOL_NAMES.length;console.log('Final tool count:',c);process.exit(c>100?1:0)})"
      3. Assert: exit 0
    Expected Result: Under 100 tools
    Evidence: Terminal output

  Scenario: No stale tool references in documentation
    Tool: Bash
    Steps:
      1. node -e "import('./dist/types/tools.js').then(m=>m.TOOL_NAMES.forEach(n=>console.log(n)))" > /tmp/code_tools.txt
      2. grep -roh "proxmox_[a-z_]*" docs/ agents/ skills/ | sort -u > /tmp/doc_tools.txt
      3. comm -23 /tmp/doc_tools.txt /tmp/code_tools.txt
      4. Assert: empty output (no stale references)
    Expected Result: All doc tool references exist in code
    Evidence: comm output

  Scenario: Full test suite non-regression
    Tool: Bash
    Steps:
      1. pnpm test
      2. Assert: all pass, >= 1100 tests
    Expected Result: No regression
    Evidence: vitest output
  ```

  **Commit**: YES
  - Message: `chore: add changeset for tool consolidation (major)`
  - Pre-commit: `pnpm build && pnpm test`

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 1-A | `refactor(tools): consolidate guest firewall rules (10→1)` | `pnpm build && pnpm test` |
| 1-B | `refactor(tools): consolidate file restore tools (2→1)` | `pnpm build && pnpm test` |
| 1-C | `refactor(tools): consolidate VM disk tools (2→1)` | `pnpm build && pnpm test` |
| 1-D | `refactor(tools): consolidate LXC mountpoint tools (2→1)` | `pnpm build && pnpm test` |
| 1-E | `refactor(tools): consolidate node disk admin tools (2→1)` | `pnpm build && pnpm test` |
| 1-F | `refactor(tools): absorb singleton tools into consolidated tools` | `pnpm build && pnpm test` |
| 1-G | `refactor(tools): rename get_spice_proxy to console_spice` | `pnpm build && pnpm test` |
| 2 | `docs: rewrite TOOLS.md and TOOLS_ko.md for consolidated tools` | `pnpm build && pnpm test` |
| 3 | `docs: update agents, skills, README for consolidated tools` | `pnpm build && pnpm test` |
| 4 | `docs: add MIGRATION.md for tool consolidation` | `pnpm build && pnpm test` |
| 5 | `chore: add changeset for tool consolidation (major)` | `pnpm build && pnpm test` |

---

## Success Criteria

### Verification Commands
```bash
pnpm build                    # Expected: exit 0
pnpm test                     # Expected: ALL pass, >= 1100
node -e "import('./dist/types/tools.js').then(m=>{console.log(m.TOOL_NAMES.length);process.exit(m.TOOL_NAMES.length>100?1:0)})"  # Expected: exit 0
grep -r "309" docs/ README*.md skills/ agents/  # Expected: zero matches
grep -rE "proxmox_start_vm|proxmox_stop_vm|proxmox_list_vm_firewall_rules" src/types/tools.ts  # Expected: zero matches
ls .changeset/*.md  # Expected: at least 1 changeset file
cat MIGRATION.md | grep -c "proxmox_"  # Expected: >= 309
```

### Final Checklist
- [ ] All "Must Have" present (기능 보존, atomic commit, MIGRATION, changeset)
- [ ] All "Must NOT Have" absent (내부 함수 변경 없음, 새 기능 없음, 직접 version bump 없음)
- [ ] Tool count < 100
- [ ] All tests pass
- [ ] Documentation fully updated (52+ files)
- [ ] Migration guide complete
- [ ] Changeset file created (major)
- [ ] Branch ready for PR
