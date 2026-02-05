# Add Node Network & DNS Query Tools

## TL;DR

> **Quick Summary**: Add 3 new read-only tools to query node network interfaces and DNS configuration. Follows existing TDD patterns from disk tools.
> 
> **Deliverables**:
> - `proxmox_get_node_network`: List network interfaces (with optional type filter)
> - `proxmox_get_node_dns`: Get DNS configuration
> - `proxmox_get_network_iface`: Get specific interface details
> 
> **Estimated Effort**: Short (2-3 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Fixtures → Schemas → Tests → Handlers → Registry

---

## Context

### Original Request
User requested tools for `/nodes/{node}/network` and `/nodes/{node}/dns` Proxmox API endpoints.

### Interview Summary
**Key Decisions**:
- 3 tools: network list, DNS config, interface details
- Type filter for network list (bridge, bond, eth, vlan, etc.)
- TDD approach (tests first)
- Read-only (no elevated permissions)

**Research Findings**:
- `ProxmoxNetwork` and `ProxmoxDNS` types already exist in `src/types/proxmox.ts`
- Current tool count: 61 → will become 64
- Existing patterns in `node.ts` and `disk.ts` to follow

### Metis Review
**Identified Gaps** (addressed):
- Interface name validation needed → add `validateInterfaceName()`
- Fixture file missing → create `src/__fixtures__/network.ts`
- Registry count update required → 61 → 64

---

## Work Objectives

### Core Objective
Add 3 node-level network/DNS query tools following existing patterns, with full test coverage.

### Concrete Deliverables
- `src/__fixtures__/network.ts` - Test fixtures for network/DNS
- `src/schemas/node.ts` - 3 new Zod schemas
- `src/validators/index.ts` - `validateInterfaceName()` function
- `src/tools/node.ts` - 3 new handler functions
- `src/tools/node.test.ts` - ~18 new tests
- `src/tools/registry.ts` - 3 registry entries, count 61→64
- `src/types/tools.ts` - 3 tool names added
- `src/server.ts` - 3 tool descriptions added
- `src/tools/index.ts` - 3 exports added

### Definition of Done
- [x] `bun test src/tools/node.test.ts` → all pass
- [x] `bun run typecheck` → exit code 0
- [x] `bun run lint` → exit code 0
- [x] Tool count exactly 64

### Must Have
- All 3 tools implemented and tested
- Type filter on network list tool
- TDD workflow followed
- Existing types (`ProxmoxNetwork`, `ProxmoxDNS`) reused

### Must NOT Have (Guardrails)
- ❌ Write operations (set DNS, create interface)
- ❌ New type definitions (use existing)
- ❌ `requireElevated()` checks (read-only tools)
- ❌ Over-validation of type filter (let API validate)
- ❌ Caching or state management

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: TDD
- **Framework**: bun test (vitest)

### TDD Workflow
Each TODO follows RED-GREEN-REFACTOR:
1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping green

### Agent-Executed QA Scenarios (All Tasks)

All verification automated via bash commands:
```bash
# Test suite
bun test src/tools/node.test.ts --reporter=verbose

# TypeScript
bun run typecheck

# Lint
bun run lint

# Registry count
grep "registeredCount !== 64" src/tools/registry.ts
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create fixtures (src/__fixtures__/network.ts)
└── Task 2: Add schemas (src/schemas/node.ts)

Wave 2 (After Wave 1):
├── Task 3: Add validator (validateInterfaceName)
├── Task 4: Add tool names to types
└── Task 5: Write tests (TDD RED phase)

Wave 3 (After Wave 2):
└── Task 6: Implement handlers (TDD GREEN phase)

Wave 4 (After Wave 3):
├── Task 7: Register tools and update count
├── Task 8: Add exports
└── Task 9: Add server descriptions

Wave 5 (Final):
└── Task 10: Full verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 5 | 2 |
| 2 | None | 5 | 1 |
| 3 | None | 5 | 1, 2, 4 |
| 4 | None | 5, 7 | 1, 2, 3 |
| 5 | 1, 2, 3, 4 | 6 | None |
| 6 | 5 | 7, 8 | None |
| 7 | 4, 6 | 10 | 8, 9 |
| 8 | 6 | 10 | 7, 9 |
| 9 | 6 | 10 | 7, 8 |
| 10 | 7, 8, 9 | None | None |

---

## TODOs

- [x] 1. Create network fixtures file

  **What to do**:
  - Create `src/__fixtures__/network.ts`
  - Export sample data following `disks.ts` pattern:
    - `sampleNetworkInterfaces`: Array with bridge, eth, bond, vlan examples
    - `emptyNetworkList`: Empty array
    - `sampleDnsConfig`: Full DNS config (search, dns1, dns2, dns3)
    - `partialDnsConfig`: Only search and dns1
    - `sampleInterfaceDetail`: Single interface full details

  **Must NOT do**:
  - Don't create types (use existing `ProxmoxNetwork`, `ProxmoxDNS`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - Simple file creation following existing pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `src/__fixtures__/disks.ts` - Fixture pattern to follow
  - `src/types/proxmox.ts:97-112` - `ProxmoxNetwork` interface
  - `src/types/proxmox.ts:172-177` - `ProxmoxDNS` interface

  **Acceptance Criteria**:
  - [ ] File created at `src/__fixtures__/network.ts`
  - [ ] Exports: `sampleNetworkInterfaces`, `emptyNetworkList`, `sampleDnsConfig`, `partialDnsConfig`, `sampleInterfaceDetail`
  - [ ] TypeScript compiles: `bun run typecheck`

  **Commit**: YES (groups with Task 2)
  - Message: `feat(fixtures): add network and DNS test fixtures`
  - Files: `src/__fixtures__/network.ts`

---

- [x] 2. Add Zod schemas for network/DNS tools

  **What to do**:
  - Add to `src/schemas/node.ts`:
    ```typescript
    export const getNodeNetworkSchema = z.object({
      node: z.string().min(1).describe('Node name'),
      type: z.string().optional().describe('Filter by interface type (bridge, bond, eth, vlan, etc.)'),
    });
    export type GetNodeNetworkInput = z.infer<typeof getNodeNetworkSchema>;

    export const getNodeDnsSchema = z.object({
      node: z.string().min(1).describe('Node name'),
    });
    export type GetNodeDnsInput = z.infer<typeof getNodeDnsSchema>;

    export const getNetworkIfaceSchema = z.object({
      node: z.string().min(1).describe('Node name'),
      iface: z.string().min(1).describe('Interface name (e.g., eth0, vmbr0, bond0)'),
    });
    export type GetNetworkIfaceInput = z.infer<typeof getNetworkIfaceSchema>;
    ```

  **Must NOT do**:
  - Don't over-validate type parameter (let API handle invalid values)
  - Don't create separate schema file

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - Simple schema additions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `src/schemas/node.ts` - Existing schema patterns
  - `src/schemas/disk.ts:85-116` - Recent schema additions pattern

  **Acceptance Criteria**:
  - [ ] 3 schemas added to `src/schemas/node.ts`
  - [ ] Types exported: `GetNodeNetworkInput`, `GetNodeDnsInput`, `GetNetworkIfaceInput`
  - [ ] TypeScript compiles: `bun run typecheck`

  **Commit**: YES (groups with Task 1)
  - Message: `feat(schemas): add node network and DNS schemas`
  - Files: `src/schemas/node.ts`

---

- [x] 3. Add interface name validator

  **What to do**:
  - Add to `src/validators/index.ts`:
    ```typescript
    export function validateInterfaceName(iface: string): string {
      // Linux interface names: alphanumeric, may include dots (VLAN), hyphens
      // Examples: eth0, vmbr0, bond0, eth0.100, ens18, enp0s3
      if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(iface)) {
        throw new Error(`Invalid interface name: ${iface}`);
      }
      return iface;
    }
    ```
  - Add tests to `src/validators/index.test.ts`

  **Must NOT do**:
  - Don't be too restrictive (allow VLAN interfaces like `eth0.100`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - Simple validator function

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `src/validators/index.ts:10-27` - Existing `validateNodeName` pattern
  - `src/validators/index.test.ts` - Test patterns

  **Acceptance Criteria**:
  - [ ] `validateInterfaceName` function added
  - [ ] Accepts: `eth0`, `vmbr0`, `bond0`, `eth0.100`, `ens18`
  - [ ] Rejects: `@invalid`, `123start`, empty string
  - [ ] Tests pass: `bun test src/validators`

  **Commit**: YES
  - Message: `feat(validators): add interface name validator`
  - Files: `src/validators/index.ts`, `src/validators/index.test.ts`

---

- [x] 4. Add tool names to types

  **What to do**:
  - Add to `src/types/tools.ts` TOOL_NAMES array (around line 59-62):
    ```typescript
    'proxmox_get_node_network',
    'proxmox_get_node_dns',
    'proxmox_get_network_iface',
    ```

  **Must NOT do**:
  - Don't update registry count yet (Task 7)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 5, 7
  - **Blocked By**: None

  **References**:
  - `src/types/tools.ts:1-63` - TOOL_NAMES array

  **Acceptance Criteria**:
  - [ ] 3 tool names added to TOOL_NAMES
  - [ ] `grep -c "proxmox_get_node_network\|proxmox_get_node_dns\|proxmox_get_network_iface" src/types/tools.ts` → 3
  - [ ] TypeScript compiles

  **Commit**: NO (will be committed with Task 7)

---

- [x] 5. Write tests for network/DNS tools (TDD RED)

  **What to do**:
  - Add tests to `src/tools/node.test.ts`:

  **proxmox_get_node_network tests** (~7):
  - Returns formatted list of interfaces
  - Handles empty interface list
  - Filters by type when provided
  - Validates node name
  - Handles API errors gracefully
  - Calls correct API endpoint (`/nodes/{node}/network`)
  - Calls correct endpoint with type filter (`/nodes/{node}/network?type=bridge`)

  **proxmox_get_node_dns tests** (~5):
  - Returns formatted DNS configuration
  - Handles partial DNS config (missing dns2/dns3)
  - Validates node name
  - Handles API errors gracefully
  - Calls correct API endpoint (`/nodes/{node}/dns`)

  **proxmox_get_network_iface tests** (~6):
  - Returns formatted interface details
  - Handles interface not found (API error)
  - Validates node name
  - Validates interface name
  - Handles API errors gracefully
  - Calls correct API endpoint (`/nodes/{node}/network/{iface}`)

  **Must NOT do**:
  - Don't implement handlers yet (tests should FAIL)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: `[]`
    - Following existing test patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2 end)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:
  - `src/tools/node.test.ts` - Existing node tests
  - `src/tools/disk.test.ts` - Recent test additions pattern
  - `src/__fixtures__/network.ts` - Fixtures from Task 1

  **Acceptance Criteria**:
  - [ ] ~18 new tests added to `src/tools/node.test.ts`
  - [ ] Tests compile but FAIL (handlers not implemented)
  - [ ] Import fixtures from `src/__fixtures__/network.ts`

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Tests compile but fail (RED phase)
    Tool: Bash
    Steps:
      1. bun test src/tools/node.test.ts 2>&1 || true
      2. Check output contains "FAIL" for new tests
      3. Check output shows test count increased
    Expected Result: New tests exist and fail
  ```

  **Commit**: NO (will be committed with Task 6)

---

- [x] 6. Implement handler functions (TDD GREEN)

  **What to do**:
  - Add to `src/tools/node.ts`:

  **getNodeNetwork**:
  ```typescript
  export async function getNodeNetwork(
    client: ProxmoxApiClient,
    _config: Config,
    input: GetNodeNetworkInput
  ): Promise<ToolResponse> {
    try {
      const validated = getNodeNetworkSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      
      let path = `/nodes/${safeNode}/network`;
      if (validated.type) {
        path += `?type=${validated.type}`;
      }
      
      const interfaces = (await client.request(path)) as ProxmoxNetwork[];
      
      if (interfaces.length === 0) {
        return formatToolResponse('No network interfaces found.');
      }
      
      let output = '🌐 **Network Interfaces**\n\n';
      for (const iface of interfaces) {
        const status = iface.active ? '🟢' : '⚪';
        output += `${status} **${iface.iface}** (${iface.type})\n`;
        if (iface.address) output += `   • IP: ${iface.address}/${iface.netmask || 'N/A'}\n`;
        if (iface.gateway) output += `   • Gateway: ${iface.gateway}\n`;
        if (iface.bridge_ports) output += `   • Bridge Ports: ${iface.bridge_ports}\n`;
        output += '\n';
      }
      
      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Get Node Network');
    }
  }
  ```

  **getNodeDns** and **getNetworkIface**: Similar pattern

  **Must NOT do**:
  - Don't add `requireElevated()` (read-only)
  - Don't create new types

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: `[]`
    - Following existing handler patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Tasks 7, 8, 9
  - **Blocked By**: Task 5

  **References**:
  - `src/tools/node.ts:22-59` - `getNodes` handler pattern
  - `src/tools/disk.ts:365-599` - Recent handler additions
  - `src/types/proxmox.ts:97-112` - `ProxmoxNetwork` type
  - `src/types/proxmox.ts:172-177` - `ProxmoxDNS` type

  **Acceptance Criteria**:
  - [ ] 3 handler functions added to `src/tools/node.ts`
  - [ ] All tests pass: `bun test src/tools/node.test.ts`
  - [ ] TypeScript compiles

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: All node tests pass (GREEN phase)
    Tool: Bash
    Steps:
      1. bun test src/tools/node.test.ts
      2. Assert exit code 0
      3. Assert output shows all tests passing
    Expected Result: 0 failures, all tests green
  ```

  **Commit**: YES
  - Message: `feat(tools): add node network and DNS query tools`
  - Files: `src/tools/node.ts`, `src/tools/node.test.ts`
  - Pre-commit: `bun test src/tools/node.test.ts`

---

- [x] 7. Register tools in registry

  **What to do**:
  - Add to `src/tools/registry.ts` (Node & Cluster section):
    ```typescript
    proxmox_get_node_network: { handler: getNodeNetwork, schema: getNodeNetworkSchema },
    proxmox_get_node_dns: { handler: getNodeDns, schema: getNodeDnsSchema },
    proxmox_get_network_iface: { handler: getNetworkIface, schema: getNetworkIfaceSchema },
    ```
  - Update count validation: `61` → `64` (line ~250)
  - Add imports for new handlers and schemas

  **Must NOT do**:
  - Don't change any other tool registrations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 4, 6

  **References**:
  - `src/tools/registry.ts:1-254` - Registry structure
  - `src/tools/registry.ts:249-254` - Count validation

  **Acceptance Criteria**:
  - [ ] 3 entries added to toolRegistry
  - [ ] Count updated to 64
  - [ ] `grep "registeredCount !== 64" src/tools/registry.ts` → match found
  - [ ] TypeScript compiles

  **Commit**: YES (groups with Tasks 4, 8, 9)
  - Message: `feat(registry): register node network/DNS tools (count 61→64)`
  - Files: `src/tools/registry.ts`, `src/types/tools.ts`

---

- [x] 8. Add exports to index

  **What to do**:
  - Add to `src/tools/index.ts` (node exports section):
    ```typescript
    export { getNodeNetwork, getNodeDns, getNetworkIface } from './node.js';
    ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 6

  **References**:
  - `src/tools/index.ts` - Export structure

  **Acceptance Criteria**:
  - [ ] 3 exports added
  - [ ] TypeScript compiles

  **Commit**: NO (grouped with Task 7)

---

- [x] 9. Add tool descriptions to server

  **What to do**:
  - Add to `src/server.ts` tool descriptions:
    ```typescript
    proxmox_get_node_network: 'List network interfaces on a Proxmox node with optional type filtering',
    proxmox_get_node_dns: 'Get DNS configuration for a Proxmox node',
    proxmox_get_network_iface: 'Get detailed information about a specific network interface',
    ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 6

  **References**:
  - `src/server.ts` - Tool description mapping

  **Acceptance Criteria**:
  - [ ] 3 descriptions added
  - [ ] TypeScript compiles

  **Commit**: NO (grouped with Task 7)

---

- [x] 10. Full verification

  **What to do**:
  - Run complete test suite
  - Verify TypeScript compilation
  - Verify lint passes
  - Verify tool count is 64
  - Run integration tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (Wave 5)
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 8, 9

  **References**:
  - `src/__tests__/integration/server.test.ts` - Integration tests

  **Acceptance Criteria**:
  - [ ] `bun test` → all pass (expect ~405 tests total: 387 + 18)
  - [ ] `bun run typecheck` → exit code 0
  - [ ] `bun run lint` → exit code 0
  - [ ] Integration test confirms 64 tools

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. bun test
      2. Assert exit code 0
      3. Assert "Tests: X passed" where X >= 400
    Expected Result: All tests pass

  Scenario: TypeScript compiles
    Tool: Bash
    Steps:
      1. bun run typecheck
      2. Assert exit code 0
    Expected Result: No type errors

  Scenario: Tool count is 64
    Tool: Bash
    Steps:
      1. bun test src/__tests__/integration/server.test.ts
      2. Assert test "should have 64 tools" passes
    Expected Result: Integration confirms 64 tools
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1, 2 | `feat(fixtures): add network/DNS fixtures and schemas` | `src/__fixtures__/network.ts`, `src/schemas/node.ts` |
| 3 | `feat(validators): add interface name validator` | `src/validators/index.ts`, `src/validators/index.test.ts` |
| 6 | `feat(tools): add node network/DNS query tools` | `src/tools/node.ts`, `src/tools/node.test.ts` |
| 7, 8, 9 | `feat(registry): register node network/DNS tools (count 61→64)` | `src/tools/registry.ts`, `src/types/tools.ts`, `src/tools/index.ts`, `src/server.ts` |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
bun test
# Expected: ~405 tests pass

# TypeScript compiles
bun run typecheck
# Expected: exit code 0

# Lint passes  
bun run lint
# Expected: exit code 0

# Tool count is 64
grep "registeredCount !== 64" src/tools/registry.ts
# Expected: match found
```

### Final Checklist
- [x] 3 new tools implemented
- [x] ~18 new tests added
- [x] Tool count: 61 → 64
- [x] All tests pass
- [x] TypeScript compiles
- [x] Lint passes
- [x] No elevated permissions required
- [x] Existing types reused
