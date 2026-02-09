# Draft: Tool 수 100개 이하로 줄이기

## Requirements (confirmed)
- 현재 309개 tool → 100개 이하로 줄여야 함
- 통합 전략: **VM+LXC 통합** (type 파라미터 방식) — 사용자 선택
- 하위 호환성: **완전 교체** (기존 309개 삭제, 새 tool로 대체) — 사용자 선택
- 우선순위: **읽기(조회) tool부터 먼저** — 사용자 선택

## Research Findings

### Explore Agent: 현재 Tool 구조 분석
- **CRUD 그룹**: 28개 그룹 = 140개 tool → 30개로 통합 가능 (110개 절감)
- **VM/LXC 미러 쌍**: 35개 쌍 = 70개 tool → 35개로 통합 가능 (35개 절감)
- **Guest Agent**: 30개 tool → 6개로 통합 가능 (24개 절감)
- **싱글톤**: ~60개 (통합 불가)
- **탐색 에이전트 추정**: 309 → ~180 (CRUD + VM/LXC + Agent 모두 적용)

### Librarian Agent: 외부 리서치
- **Anthropic 공식**: "더 적고 사려 깊은 tool > 많은 단순 tool"
- **Stainless 패턴**: Dynamic Discovery (meta-tools) — list_endpoints → get_schema → invoke
- **Cursor**: 40개 하드리밋, GitHub Copilot: 128개
- **Action 파라미터 패턴**: CRUD에 효과적, 10+ action은 품질 저하 가능
- **핵심**: tool description 최적화가 성능에 극적 영향

### 사용자 선택 + 탐색 결과 조합 시 문제점
- VM/LXC 통합만으로는 35개 절감 → 309-35 = 274개 (여전히 100 초과)
- **VM/LXC 통합만으로는 목표 달성 불가. 추가 전략 필요.**

## Technical Decisions
- **통합 전략 1**: VM/LXC 미러 쌍을 type 파라미터로 통합
- **통합 전략 2**: CRUD 그룹을 action 파라미터로 통합 (병행)
- **Guest Agent**: 기능별 그룹 통합 (query/exec/file/system → 4개 tool)
- **하위 호환성**: 완전 교체 (breaking change 허용)

## Open Questions
- 싱글톤 ~60개 중 삭제/통합 가능한 것이 있는지?
- CRUD+VM/LXC 이중 통합 시 tool 이름 네이밍 컨벤션?
- 최종 tool 리스트 구체적 확정 필요

## Scope Boundaries
- INCLUDE: 모든 309개 tool의 통합/재설계
- EXCLUDE: (미정)
