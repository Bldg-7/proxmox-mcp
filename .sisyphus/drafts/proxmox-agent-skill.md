# Draft: Proxmox Admin Agent + Skill Package

## Requirements (confirmed)
- **Type**: OpenCode plugin 형태로 Agent + Skill 패키징
- **Domain**: Proxmox 인프라 관리 (운영 자동화 + 상태 분석/진단 + 프로비저닝 모두 포함)
- **Target**: Claude Code / OpenCode 에서 사용 가능

## Research Findings

### Agent Skills Open Standard (agentskills.io)
- **Format**: 폴더 + `SKILL.md` (YAML frontmatter + Markdown body)
- **Optional dirs**: `scripts/`, `references/`, `assets/`
- **Frontmatter fields**: `name` (required), `description` (required), `license`, `compatibility`, `metadata`, `allowed-tools`
- **Progressive disclosure**: metadata (~100 tokens) → instructions (<5000 tokens) → resources (on demand)
- **Best practice**: SKILL.md < 500 lines, 상세 내용은 `references/`로 분리
- **Distribution**: `npx skills add <owner/repo>` 또는 직접 설치
- **Supported agents**: Claude Code, OpenCode, Cursor, Codex, Gemini CLI, VS Code, Goose, Roo, etc.

### SuperClaude Custom Agent Format (~/.claude/agents/*.md)
- YAML frontmatter: `name`, `description`, `category`, `tools`
- Sections: Triggers, Behavioral Mindset, Focus Areas, Key Actions, Outputs, Boundaries
- 49 lines max (established pattern)
- Global scope (all projects)

### Anthropic Plugin Format (.claude-plugin/)
- Used by `anthropics/skills` repo
- Can bundle multiple skills into "plugins"
- Installable via `/plugin marketplace add <repo>` and `/plugin install <plugin>@<marketplace>`

### 기존 Proxmox MCP 문서 자산
- `docs/skills/proxmox-mcp.md` (index, ~54 lines)
- `docs/skills/proxmox-{domain}.md` (11 domain files, 227 tools total)
- `docs/skills/proxmox-workflows.md` (463 lines, workflow patterns)
- `docs/skills/proxmox-troubleshooting.md` (860 lines, API quirks)
- `AGENTS.md` (533 lines, codebase knowledge)

## Decisions Made
1. **Location**: 기존 `proxmox-mcp` repo 내부에 생성
2. **Distribution**: Agent Skills Standard + Claude Plugin 두 가지 포맷 지원
3. **Scope**: 2개 skill로 분리
   - `proxmox-mcp-tools` — MCP 도구 레퍼런스 (227 tools, 파라미터, 예제)
   - `proxmox-admin` — Proxmox 운영 노하우 (best practices, 장애 대응, 아키텍처 패턴)
4. **Content Source**: 기존 `docs/skills/` 문서 자산을 `references/`로 활용

## Open Questions
1. repo 내 정확한 디렉토리 경로: `skills/` vs `.skills/` vs `agent-skills/`?
2. .claude-plugin/ 디렉토리 구조는 어떻게 할지?

## Scope Boundaries
- INCLUDE: 2개 Skill SKILL.md + references + .claude-plugin/ 설정 + README 업데이트
- EXCLUDE: MCP server code 수정, 새로운 도구 추가, 기존 docs/skills/ 삭제
