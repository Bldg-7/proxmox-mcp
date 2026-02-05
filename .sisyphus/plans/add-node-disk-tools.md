# Add Node-Level Disk Query Tools

## TL;DR

> **Quick Summary**: Add 4 read-only node-level disk query tools to the Proxmox MCP server: physical disk list, SMART health, LVM volumes, and ZFS pools.
> 
> **Deliverables**:
> - 4 new MCP tools: `proxmox_get_node_disks`, `proxmox_get_disk_smart`, `proxmox_get_node_lvm`, `proxmox_get_node_zfs`
> - Zod schemas for all 4 tools
> - Unit tests (minimum 14 new tests, TDD approach)
> - Test fixtures for disk responses
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (fixtures) → Task 2 (schemas) → Task 3-6 (tools) → Task 7 (registration)

---

## Context

### Original Request
Add node-level physical disk query tools to the Proxmox MCP server. The server currently has 57 tools but lacks the ability to query physical disk information at the node level (disk list, SMART health, LVM, ZFS).

### Interview Summary
**Key Discussions**:
- **Tool count**: 4 separate tools (not combined) - approved
- **Parameter exposure**: Full parameters (no simplification) - approved
- **Test strategy**: TDD (RED-GREEN-REFACTOR) - selected

**Research Findings**:
- **Codebase patterns**: Vitest test framework, Zod schemas, formatToolResponse/formatErrorResponse
- **Existing disk.ts**: Contains 8 elevated-permission disk modification tools (add, resize, remove, move)
- **Pattern to follow**: `getNodes()` in node.ts for non-elevated read-only
- **API documentation**: All 4 endpoints confirmed with parameters and response schemas

### Metis Review
**Identified Gaps** (addressed):
- **Permission pattern**: Confirmed no `requireElevated()` needed (read-only with Sys.Audit)
- **File strategy**: EXTEND existing disk.ts/schemas, not create new files
- **Test fixtures**: Need to create `src/__fixtures__/disks.ts`
- **Edge cases**: Empty responses, missing SMART capability, no LVM/ZFS configured

---

## Work Objectives

### Core Objective
Add 4 read-only node-level disk query tools following existing codebase patterns, with full TDD coverage.

### Concrete Deliverables
- `src/schemas/disk.ts` - 4 new Zod schemas (getNodeDisksSchema, getDiskSmartSchema, getNodeLvmSchema, getNodeZfsSchema)
- `src/tools/disk.ts` - 4 new handler functions
- `src/__fixtures__/disks.ts` - Test fixtures for disk API responses
- `src/tools/disk.test.ts` - Extended with 14+ new tests
- `src/tools/registry.ts` - 4 new entries (count 57 → 61)
- `src/types/tools.ts` - 4 new tool names in TOOL_NAMES array
- `src/server.ts` - 4 new descriptions in TOOL_DESCRIPTIONS

### Definition of Done
- [ ] `bun run typecheck` passes with no errors
- [ ] `bun test` passes (all existing + 14+ new tests)
- [ ] `bun run build` succeeds
- [ ] Tool count is exactly 61 (verified by integration test)

### Must Have
- All 4 tools implemented with full parameter support
- TDD approach: tests written before implementation
- Non-elevated permission pattern (no requireElevated)
- Consistent formatting with existing tools

### Must NOT Have (Guardrails)
- ❌ Disk write/wipe/format operations
- ❌ Elevated permission checks on these read-only tools
- ❌ New utility functions in formatters or validators
- ❌ Modifications to existing disk operations
- ❌ Storage-level management (this is node-level only)
- ❌ Response caching or retry logic
- ❌ Derived metrics (pass SMART data raw)
- ❌ More than exactly 4 tools

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES (Vitest 2.1.8, 373 existing tests)
- **Automated tests**: TDD (RED-GREEN-REFACTOR)
- **Framework**: Vitest (`bun test`)

### If TDD Enabled

Each tool TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test command: `bun test src/tools/disk.test.ts`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `bun test src/tools/disk.test.ts`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| TypeScript code | Bash | `bun run typecheck` - exit code 0 |
| Tests | Bash | `bun test` - all pass |
| Build | Bash | `bun run build` - exit code 0 |
| Tool count | Bash | `bun test src/__tests__/integration/server.test.ts` - 61 tools |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create test fixtures

Wave 2 (After Wave 1):
├── Task 2: Add schemas to src/schemas/disk.ts

Wave 3 (After Wave 2):
├── Task 3: Implement proxmox_get_node_disks (TDD)
├── Task 4: Implement proxmox_get_disk_smart (TDD)
├── Task 5: Implement proxmox_get_node_lvm (TDD)
└── Task 6: Implement proxmox_get_node_zfs (TDD)

Wave 4 (After Wave 3):
└── Task 7: Register tools and verify

Critical Path: Task 1 → Task 2 → Tasks 3-6 → Task 7
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5, 6 | None |
| 2 | 1 | 3, 4, 5, 6 | None |
| 3 | 2 | 7 | 4, 5, 6 |
| 4 | 2 | 7 | 3, 5, 6 |
| 5 | 2 | 7 | 3, 4, 6 |
| 6 | 2 | 7 | 3, 4, 5 |
| 7 | 3, 4, 5, 6 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Approach |
|------|-------|---------------------|
| 1 | 1 | Quick task |
| 2 | 2 | Quick task |
| 3 | 3, 4, 5, 6 | Can parallelize 4 agents |
| 4 | 7 | Quick task (registration) |

---

## TODOs

---

- [x] 1. Create test fixtures for disk API responses

  **What to do**:
  - Create `src/__fixtures__/disks.ts` with sample API responses
  - Include: disk list response, SMART response, LVM response, ZFS response
  - Include edge cases: empty lists, disk with no SMART, health statuses

  **Must NOT do**:
  - Don't add fixtures for disk modification operations
  - Don't add real serial numbers or sensitive data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Simple file creation with sample data

  **Parallelization**:
  - **Can Run In Parallel**: NO (first task)
  - **Blocks**: Tasks 2, 3, 4, 5, 6

  **References**:
  - `src/__fixtures__/vms.ts` - Example fixture structure with sampleQemuVMs, sampleLxcContainers
  - `src/__fixtures__/nodes.ts` - Example node fixture structure
  - Proxmox API response schemas from librarian research

  **Fixture Content Required**:
  ```typescript
  // src/__fixtures__/disks.ts
  export const sampleDiskList = [
    {
      devpath: '/dev/sda',
      used: 'LVM',
      gpt: true,
      mounted: false,
      size: 1000204886016,
      vendor: 'Samsung',
      model: 'SSD 870 EVO',
      serial: 'S5GUNG0N123456',
      health: 'PASSED',
    },
    // ... more samples
  ];

  export const sampleSmartData = {
    health: 'PASSED',
    type: 'ata',
    attributes: [...],
  };

  export const sampleLvmData = {
    leaf: false,
    children: [...],
  };

  export const sampleZfsData = [
    { name: 'rpool', size: 1000204886016, alloc: 250051221504, free: 750153664512, health: 'ONLINE' },
  ];

  // Edge cases
  export const emptyDiskList = [];
  export const noLvmConfigured = { leaf: false, children: [] };
  export const noZfsPools = [];
  ```

  **Acceptance Criteria**:
  - [ ] File exists: `src/__fixtures__/disks.ts`
  - [ ] TypeScript compiles: `bun run typecheck` → exit code 0
  - [ ] Exports: sampleDiskList, sampleSmartData, sampleLvmData, sampleZfsData, emptyDiskList, noLvmConfigured, noZfsPools

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Fixture file is valid TypeScript
    Tool: Bash
    Steps:
      1. bun run typecheck
      2. Assert: exit code 0
      3. Assert: no errors mentioning "disks.ts"
    Expected Result: Type check passes
  ```

  **Commit**: NO (groups with Task 2)

---

- [x] 2. Add Zod schemas for all 4 tools

  **What to do**:
  - Add 4 schemas to `src/schemas/disk.ts` (EXTEND, not replace)
  - Add type exports for each schema
  - Export from `src/schemas/index.ts`

  **Must NOT do**:
  - Don't modify existing schemas (addDiskVmSchema, etc.)
  - Don't create new schema file

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Schema additions following existing patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1)
  - **Blocked By**: Task 1
  - **Blocks**: Tasks 3, 4, 5, 6

  **References**:
  - `src/schemas/disk.ts:1-84` - Existing disk schemas pattern
  - `src/schemas/node.ts:1-15` - getNodeStatusSchema pattern (simple node param)
  - `src/schemas/vm.ts:1-50` - Schema with optional params and .describe()

  **Schema Definitions Required**:
  ```typescript
  // Add to src/schemas/disk.ts

  // 1. Get node disks
  export const getNodeDisksSchema = z.object({
    node: z.string().min(1).describe('Node name'),
    include_partitions: z.boolean().optional().describe('Include partitions in listing'),
    skip_smart: z.boolean().optional().describe('Skip SMART health checks (faster)'),
    type: z.enum(['unused', 'journal_disks']).optional().describe('Filter by disk type'),
  });
  export type GetNodeDisksInput = z.infer<typeof getNodeDisksSchema>;

  // 2. Get disk SMART
  export const getDiskSmartSchema = z.object({
    node: z.string().min(1).describe('Node name'),
    disk: z.string().min(1).describe('Block device path (e.g., /dev/sda)'),
    health_only: z.boolean().optional().describe('Only return health status'),
  });
  export type GetDiskSmartInput = z.infer<typeof getDiskSmartSchema>;

  // 3. Get node LVM
  export const getNodeLvmSchema = z.object({
    node: z.string().min(1).describe('Node name'),
  });
  export type GetNodeLvmInput = z.infer<typeof getNodeLvmSchema>;

  // 4. Get node ZFS
  export const getNodeZfsSchema = z.object({
    node: z.string().min(1).describe('Node name'),
  });
  export type GetNodeZfsInput = z.infer<typeof getNodeZfsSchema>;
  ```

  **Acceptance Criteria**:
  - [ ] 4 schemas added to `src/schemas/disk.ts`
  - [ ] 4 type exports added
  - [ ] Schemas exported from `src/schemas/index.ts`
  - [ ] TypeScript compiles: `bun run typecheck` → exit code 0

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Schemas compile and export correctly
    Tool: Bash
    Steps:
      1. bun run typecheck
      2. Assert: exit code 0
    Expected Result: No type errors
  ```

  **Commit**: YES
  - Message: `feat(schemas): add node-level disk query schemas`
  - Files: `src/schemas/disk.ts`, `src/schemas/index.ts`
  - Pre-commit: `bun run typecheck`

---

- [x] 3. Implement proxmox_get_node_disks (TDD)

  **What to do**:
  - **RED**: Write failing tests first in `src/tools/disk.test.ts`
  - **GREEN**: Implement `getNodeDisks()` handler in `src/tools/disk.ts`
  - **REFACTOR**: Clean up while tests pass

  **Must NOT do**:
  - Don't call `requireElevated()` (read-only tool)
  - Don't modify existing disk handlers
  - Don't add disk write operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Following established patterns exactly

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 4, 5, 6)
  - **Blocked By**: Task 2
  - **Blocks**: Task 7

  **References**:
  - `src/tools/node.ts:22-59` - `getNodes()` pattern for non-elevated read-only
  - `src/tools/disk.ts:1-364` - Existing disk handlers (extend this file)
  - `src/tools/disk.test.ts` - Existing disk tests (extend this file)
  - `src/__fixtures__/disks.ts` - Sample disk list data (created in Task 1)
  - `src/validators/index.ts:validateNodeName` - Node name validation

  **Test Cases Required** (minimum 4):
  ```typescript
  describe('getNodeDisks', () => {
    it('returns disk list successfully', async () => {
      client.request.mockResolvedValue(sampleDiskList);
      const result = await getNodeDisks(client, config, { node: 'pve1' });
      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/list');
    });

    it('passes optional parameters to API', async () => {
      client.request.mockResolvedValue(sampleDiskList);
      await getNodeDisks(client, config, { 
        node: 'pve1', 
        include_partitions: true,
        skip_smart: true,
        type: 'unused'
      });
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/disks/list',
        'GET',
        { 'include-partitions': true, skipsmart: true, type: 'unused' }
      );
    });

    it('validates node name', async () => {
      const result = await getNodeDisks(client, config, { node: 'invalid@node!' });
      expect(result.isError).toBe(true);
    });

    it('handles empty disk list', async () => {
      client.request.mockResolvedValue(emptyDiskList);
      const result = await getNodeDisks(client, config, { node: 'pve1' });
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('No disks found');
    });
  });
  ```

  **Handler Implementation Pattern**:
  ```typescript
  export async function getNodeDisks(
    client: ProxmoxApiClient,
    _config: Config,
    input: GetNodeDisksInput
  ): Promise<ToolResponse> {
    try {
      const validated = getNodeDisksSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      
      const params: Record<string, unknown> = {};
      if (validated.include_partitions !== undefined) {
        params['include-partitions'] = validated.include_partitions;
      }
      if (validated.skip_smart !== undefined) {
        params.skipsmart = validated.skip_smart;
      }
      if (validated.type !== undefined) {
        params.type = validated.type;
      }

      const disks = await client.request(
        `/nodes/${safeNode}/disks/list`,
        Object.keys(params).length > 0 ? 'GET' : undefined,
        Object.keys(params).length > 0 ? params : undefined
      );

      if (!Array.isArray(disks) || disks.length === 0) {
        return formatToolResponse(`💿 **Node Disks - ${safeNode}**\n\nNo disks found.`);
      }

      let output = `💿 **Node Disks - ${safeNode}**\n\n`;
      output += `Found ${disks.length} disk(s):\n\n`;
      
      for (const disk of disks) {
        output += `---\n`;
        output += `• **Device**: ${disk.devpath}\n`;
        output += `• **Size**: ${formatBytes(disk.size)}\n`;
        if (disk.model) output += `• **Model**: ${disk.vendor || ''} ${disk.model}\n`;
        if (disk.serial) output += `• **Serial**: ${disk.serial}\n`;
        output += `• **Used**: ${disk.used || 'unused'}\n`;
        if (disk.health) output += `• **Health**: ${disk.health}\n`;
        output += `\n`;
      }

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Get Node Disks');
    }
  }
  ```

  **Acceptance Criteria**:
  - [ ] Tests written FIRST (RED phase): `bun test src/tools/disk.test.ts --grep "getNodeDisks"` → FAIL
  - [ ] Handler implemented (GREEN phase): `bun test src/tools/disk.test.ts --grep "getNodeDisks"` → PASS
  - [ ] All 4 test cases pass
  - [ ] TypeScript compiles: `bun run typecheck` → exit code 0

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: TDD RED phase - tests fail without implementation
    Tool: Bash
    Steps:
      1. Add test cases to disk.test.ts
      2. bun test src/tools/disk.test.ts --grep "getNodeDisks"
      3. Assert: tests FAIL (handler not implemented yet)
    Expected Result: Tests exist and fail as expected

  Scenario: TDD GREEN phase - implementation passes tests
    Tool: Bash
    Steps:
      1. Implement getNodeDisks in disk.ts
      2. bun test src/tools/disk.test.ts --grep "getNodeDisks"
      3. Assert: all 4 tests PASS
    Expected Result: All tests pass
  ```

  **Commit**: NO (groups with Tasks 4, 5, 6)

---

- [x] 4. Implement proxmox_get_disk_smart (TDD)

  **What to do**:
  - **RED**: Write failing tests first
  - **GREEN**: Implement `getDiskSmart()` handler
  - **REFACTOR**: Clean up while tests pass

  **Must NOT do**:
  - Don't call `requireElevated()`
  - Don't validate disk exists before query (let API error naturally)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 5, 6)
  - **Blocked By**: Task 2
  - **Blocks**: Task 7

  **References**:
  - `src/tools/node.ts:22-59` - Non-elevated read-only pattern
  - `src/tools/disk.ts` - Extend this file
  - `src/__fixtures__/disks.ts:sampleSmartData` - Test fixture

  **Test Cases Required** (minimum 4):
  ```typescript
  describe('getDiskSmart', () => {
    it('returns SMART data successfully', async () => {...});
    it('returns health only when health_only=true', async () => {...});
    it('validates node name', async () => {...});
    it('validates disk parameter is provided', async () => {...});
  });
  ```

  **Acceptance Criteria**:
  - [ ] Tests written FIRST: `bun test --grep "getDiskSmart"` → FAIL
  - [ ] Handler implemented: `bun test --grep "getDiskSmart"` → PASS
  - [ ] All 4 test cases pass
  - [ ] TypeScript compiles

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: getDiskSmart passes all tests
    Tool: Bash
    Steps:
      1. bun test src/tools/disk.test.ts --grep "getDiskSmart"
      2. Assert: 4 tests pass
    Expected Result: All tests pass
  ```

  **Commit**: NO (groups with Tasks 3, 5, 6)

---

- [x] 5. Implement proxmox_get_node_lvm (TDD)

  **What to do**:
  - **RED**: Write failing tests first
  - **GREEN**: Implement `getNodeLvm()` handler
  - **REFACTOR**: Clean up

  **Must NOT do**:
  - Don't call `requireElevated()`
  - Don't add LVM create/modify operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 4, 6)
  - **Blocked By**: Task 2
  - **Blocks**: Task 7

  **References**:
  - `src/tools/node.ts:22-59` - Non-elevated pattern
  - `src/__fixtures__/disks.ts:sampleLvmData, noLvmConfigured` - Fixtures

  **Test Cases Required** (minimum 3):
  ```typescript
  describe('getNodeLvm', () => {
    it('returns LVM data successfully', async () => {...});
    it('validates node name', async () => {...});
    it('handles no LVM configured', async () => {...});
  });
  ```

  **Acceptance Criteria**:
  - [ ] Tests written FIRST: `bun test --grep "getNodeLvm"` → FAIL
  - [ ] Handler implemented: `bun test --grep "getNodeLvm"` → PASS
  - [ ] All 3 test cases pass

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: getNodeLvm passes all tests
    Tool: Bash
    Steps:
      1. bun test src/tools/disk.test.ts --grep "getNodeLvm"
      2. Assert: 3 tests pass
    Expected Result: All tests pass
  ```

  **Commit**: NO (groups with Tasks 3, 4, 6)

---

- [x] 6. Implement proxmox_get_node_zfs (TDD)

  **What to do**:
  - **RED**: Write failing tests first
  - **GREEN**: Implement `getNodeZfs()` handler
  - **REFACTOR**: Clean up

  **Must NOT do**:
  - Don't call `requireElevated()`
  - Don't add ZFS create/modify operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 4, 5)
  - **Blocked By**: Task 2
  - **Blocks**: Task 7

  **References**:
  - `src/tools/node.ts:22-59` - Non-elevated pattern
  - `src/__fixtures__/disks.ts:sampleZfsData, noZfsPools` - Fixtures

  **Test Cases Required** (minimum 3):
  ```typescript
  describe('getNodeZfs', () => {
    it('returns ZFS pools successfully', async () => {...});
    it('validates node name', async () => {...});
    it('handles no ZFS pools', async () => {...});
  });
  ```

  **Acceptance Criteria**:
  - [ ] Tests written FIRST: `bun test --grep "getNodeZfs"` → FAIL
  - [ ] Handler implemented: `bun test --grep "getNodeZfs"` → PASS
  - [ ] All 3 test cases pass

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: getNodeZfs passes all tests
    Tool: Bash
    Steps:
      1. bun test src/tools/disk.test.ts --grep "getNodeZfs"
      2. Assert: 3 tests pass
    Expected Result: All tests pass
  ```

  **Commit**: YES (commit all 4 tool implementations together)
  - Message: `feat(tools): add node-level disk query tools (disks, smart, lvm, zfs)`
  - Files: `src/tools/disk.ts`, `src/tools/disk.test.ts`, `src/__fixtures__/disks.ts`
  - Pre-commit: `bun test src/tools/disk.test.ts`

---

- [ ] 7. Register tools and verify final count

  **What to do**:
  - Add 4 entries to `TOOL_NAMES` array in `src/types/tools.ts`
  - Add 4 entries to `toolRegistry` in `src/tools/registry.ts`
  - Add 4 descriptions to `TOOL_DESCRIPTIONS` in `src/server.ts`
  - Export handlers from `src/tools/index.ts`
  - Update registry count assertion from 57 to 61

  **Must NOT do**:
  - Don't modify existing tool entries
  - Don't add more than 4 tools

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Straightforward file edits

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Blocked By**: Tasks 3, 4, 5, 6

  **References**:
  - `src/types/tools.ts:1-59` - TOOL_NAMES array format
  - `src/tools/registry.ts:152-229` - toolRegistry entries format
  - `src/server.ts:16-93` - TOOL_DESCRIPTIONS format
  - `src/tools/index.ts` - Export pattern

  **Registration Content Required**:

  **TOOL_NAMES** (add to src/types/tools.ts):
  ```typescript
  'proxmox_get_node_disks',
  'proxmox_get_disk_smart',
  'proxmox_get_node_lvm',
  'proxmox_get_node_zfs',
  ```

  **toolRegistry** (add to src/tools/registry.ts):
  ```typescript
  proxmox_get_node_disks: { handler: getNodeDisks, schema: getNodeDisksSchema },
  proxmox_get_disk_smart: { handler: getDiskSmart, schema: getDiskSmartSchema },
  proxmox_get_node_lvm: { handler: getNodeLvm, schema: getNodeLvmSchema },
  proxmox_get_node_zfs: { handler: getNodeZfs, schema: getNodeZfsSchema },
  ```

  **TOOL_DESCRIPTIONS** (add to src/server.ts):
  ```typescript
  proxmox_get_node_disks: 'List physical disks on a Proxmox node (SSD, HDD, NVMe) with health status',
  proxmox_get_disk_smart: 'Get SMART health data for a specific disk on a Proxmox node',
  proxmox_get_node_lvm: 'List LVM volume groups and physical volumes on a Proxmox node',
  proxmox_get_node_zfs: 'List ZFS pools on a Proxmox node with health and capacity info',
  ```

  **Acceptance Criteria**:
  - [ ] TOOL_NAMES has 4 new entries
  - [ ] toolRegistry has 4 new entries
  - [ ] TOOL_DESCRIPTIONS has 4 new entries
  - [ ] Handlers exported from index.ts
  - [ ] TypeScript compiles: `bun run typecheck` → exit code 0
  - [ ] All tests pass: `bun test` → exit code 0
  - [ ] Integration test confirms 61 tools: `bun test src/__tests__/integration/server.test.ts`
  - [ ] Build succeeds: `bun run build` → exit code 0

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Tool count is exactly 61
    Tool: Bash
    Steps:
      1. bun test src/__tests__/integration/server.test.ts
      2. Assert: test "returns all 61 tools" passes
    Expected Result: Integration test confirms 61 tools

  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. bun test
      2. Assert: all tests pass
      3. Assert: test count increased by ~14
    Expected Result: 387+ tests pass

  Scenario: Build succeeds
    Tool: Bash
    Steps:
      1. bun run build
      2. Assert: exit code 0
      3. Assert: dist/ directory updated
    Expected Result: Production build succeeds
  ```

  **Commit**: YES
  - Message: `feat(registry): register 4 node-level disk query tools (count 57→61)`
  - Files: `src/types/tools.ts`, `src/tools/registry.ts`, `src/server.ts`, `src/tools/index.ts`
  - Pre-commit: `bun test && bun run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `feat(schemas): add node-level disk query schemas` | schemas/disk.ts, schemas/index.ts | typecheck |
| 6 | `feat(tools): add node-level disk query tools` | tools/disk.ts, disk.test.ts, fixtures/disks.ts | test |
| 7 | `feat(registry): register 4 node-level disk tools (57→61)` | types/tools.ts, registry.ts, server.ts, tools/index.ts | test + build |

---

## Success Criteria

### Verification Commands
```bash
bun run typecheck        # Expected: exit code 0
bun test                 # Expected: all pass, ~387+ tests
bun run build            # Expected: exit code 0

# Specific verification
bun test src/__tests__/integration/server.test.ts
# Expected: "returns all 61 tools" passes
```

### Final Checklist
- [ ] All 4 tools implemented and tested
- [ ] Tool count is exactly 61
- [ ] No elevated permission checks on these tools
- [ ] All existing tests still pass
- [ ] Build succeeds
- [ ] TDD approach followed (tests written before implementation)
