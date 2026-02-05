# Draft: Add Node-Level Disk Query Tools

## Requirements (confirmed)

- **Tool count**: 4 separate tools (not combined)
- **Parameter exposure**: Full (no simplification)
- **Operation type**: Read-only queries (no elevated permissions needed)

## Tools to Implement

### 1. proxmox_get_node_disks
- **Endpoint**: GET /nodes/{node}/disks/list
- **Parameters**:
  - `node` (required): Cluster node name
  - `include_partitions` (optional, default false): Include partitions
  - `skip_smart` (optional, default false): Skip SMART health checks
  - `type` (optional): Filter - 'unused' | 'journal_disks'
- **Permission**: Sys.Audit on / or /nodes/{node}

### 2. proxmox_get_disk_smart
- **Endpoint**: GET /nodes/{node}/disks/smart
- **Parameters**:
  - `node` (required): Cluster node name
  - `disk` (required): Device path (e.g., /dev/sda)
  - `health_only` (optional, default false): Only return health status
- **Permission**: Sys.Audit on /

### 3. proxmox_get_node_lvm
- **Endpoint**: GET /nodes/{node}/disks/lvm
- **Parameters**:
  - `node` (required): Cluster node name
- **Permission**: Sys.Audit on /

### 4. proxmox_get_node_zfs
- **Endpoint**: GET /nodes/{node}/disks/zfs
- **Parameters**:
  - `node` (required): Cluster node name
- **Permission**: Sys.Audit on /

## Technical Decisions

- **Schema location**: Add to existing `src/schemas/disk.ts`
- **Handler location**: Add to existing `src/tools/disk.ts`
- **Permission**: No `requireElevated()` needed (read-only with Sys.Audit)
- **Validation**: Use existing `validateNodeName()` for node param
- **Disk path validation**: Need new validator for `/dev/[a-zA-Z0-9\/]+` pattern

## Research Findings

### Codebase Patterns (from explore agent)
- Tools use: `client.request()`, Zod schemas, `formatToolResponse()`
- Registration: registry.ts + TOOL_NAMES + TOOL_DESCRIPTIONS
- Current tool count: 57 (will become 61)

### Test Infrastructure (from explore agent)
- Framework: Vitest 2.1.8
- Pattern: colocated `*.test.ts` files
- Mocking: `createMockProxmoxClient()`, `createTestConfig()`
- 373 tests total

### API Response Schemas (from librarian agent)
- disks/list: Array of disk objects with devpath, used, size, health, etc.
- disks/smart: Object with health, type, attributes array, text
- disks/lvm: Tree structure with leaf, children, name, size, free
- disks/zfs: Array of pool objects with name, size, alloc, free, health

## Scope Boundaries

**INCLUDE**:
- 4 new query tools
- Zod schemas with full parameter exposure
- Unit tests following existing patterns
- Registration in all required files

**EXCLUDE**:
- Disk modification operations (create LVM, create ZFS, wipe disk)
- Elevated permission requirements
- New validators (will add disk path validator inline if needed)

## Open Questions

- [ ] Test strategy: TDD vs tests-after vs none?
