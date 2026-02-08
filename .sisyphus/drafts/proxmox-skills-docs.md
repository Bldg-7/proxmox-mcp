# ARCHIVED - Plan Generated

This draft has been converted to a work plan.
See: `.sisyphus/plans/proxmox-skills-docs.md`

---

# Draft: Proxmox MCP Skills Documentation (ARCHIVED)

## Requirements (confirmed)

- **Audience**: AI Agents (Claude, etc.) - optimized for AI consumption
- **Distribution Model**: Dual support
  1. Individual skill files (standalone deployment)
  2. Bundled with `AGENTS.md` as plugin package
- **Scope**: Complete (all 227 tools) + Essential workflows

## Technical Decisions

- **Format**: Structured markdown optimized for AI parsing
- **Location**: `docs/skills/` directory
- **AGENTS.md**: Hierarchical knowledge base bundled for plugin distribution

## Research Findings

- **docs/TOOLS.md exists**: 143 tools documented (outdated - says 143, session claims 227)
- **README.md**: User-focused documentation exists
- **No AGENTS.md yet**: Needs to be created
- **No docs/skills/ directory**: Needs to be created

## Key Session Learnings to Document

From previous session context:
1. POST/PUT requires `application/x-www-form-urlencoded` (not JSON)
2. DELETE params go in query string (not body)
3. Proxmox returns 500 (not 404) for missing resources
4. LXC exec not supported via API (only `pct exec` via SSH)
5. `/nodes/{node}/execute` is root@pam only (API tokens fail)
6. `net0` creates veth but guest OS must configure networking (DHCP/netplan)

## Open Questions

1. Should we also update docs/TOOLS.md to reflect actual 227 tools?
2. Korean version of skills docs needed?
3. What additional API quirks should be documented?

## Scope Boundaries

- INCLUDE: All 227 tools, workflows, troubleshooting, constraints
- INCLUDE: AGENTS.md for hierarchical codebase knowledge
- INCLUDE: Standalone skill files for individual deployment
- EXCLUDE: Human-focused tutorials (README covers this)
- EXCLUDE: Video/visual content
