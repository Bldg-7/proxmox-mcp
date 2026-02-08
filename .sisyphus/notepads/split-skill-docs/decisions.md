
## Task 2: Script Architecture Decisions

### Domain-based grouping rationale
- Tools grouped by functional domain rather than verb prefix
- Domain names derived from authoritative plan mapping
- Each domain file is self-contained with title, description, and all tools

### Index file design
- Quick links table at top for navigation
- Tool counts per domain for at-a-glance overview
- Links use relative paths (proxmox-{domain}.md)

### Backward compatibility
- `scripts/tool-docs.json` unchanged (227 tools)
- `scripts/tool-docs.md` unchanged (verb-based categories)
- Only added new output files in `docs/skills/`
