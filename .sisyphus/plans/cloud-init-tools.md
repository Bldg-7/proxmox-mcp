# Cloud-Init Tools Implementation

## TL;DR

> **Quick Summary**: Add 3 Cloud-Init tools to the Proxmox MCP server for listing, dumping, and regenerating VM cloud-init configurations. Follows established codebase patterns exactly.
> 
> **Deliverables**:
> - `src/schemas/cloud-init.ts` — 3 Zod schemas
> - `src/tools/cloud-init.ts` — 3 handler functions
> - Modified: `src/types/tools.ts`, `src/tools/registry.ts`, `src/tools/index.ts`, `src/schemas/index.ts`, `src/server.ts`
> 
> **Estimated Effort**: Short (~15 min)
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
User wants to implement Cloud-Init Proxmox API endpoints as MCP tools. These are the first of ~140 missing API endpoints being added incrementally.

### Proxmox Cloud-Init API Endpoints
1. **`GET /nodes/{node}/qemu/{vmid}/cloudinit`** — List cloud-init configuration items
2. **`GET /nodes/{node}/qemu/{vmid}/cloudinit/dump`** — Dump rendered cloud-init config (`type`: `user`|`network`|`meta`)
3. **`PUT /nodes/{node}/qemu/{vmid}/cloudinit`** — Regenerate the cloud-init drive (no additional params)

### Metis Review
**Identified Gaps** (addressed):
- **Missing file**: `src/schemas/index.ts` needs re-export (added to plan)
- **Dump response format**: Returns raw YAML/text string, not JSON object. Proxmox wraps all responses in `{ data: ... }` so `client.request<string>()` handles this correctly.
- **PUT returns null**: Regeneration is synchronous, not a task. No task ID in response.
- **Tool count assertion**: `registry.ts:946` checks `registeredCount !== 227` — must update to 230.

---

## Work Objectives

### Core Objective
Add 3 Cloud-Init MCP tools following the established 227-tool codebase pattern, bringing total to 230.

### Concrete Deliverables
- 3 new tools: `proxmox_get_cloudinit_config`, `proxmox_dump_cloudinit`, `proxmox_regenerate_cloudinit`
- All properly typed, validated, and registered

### Definition of Done
- [x] All 3 tools registered and functional
- [x] `pnpm build` succeeds with no errors
- [x] `pnpm test` passes
- [x] Tool count assertion updated to 230 and doesn't throw

### Must Have
- Zod schemas with `.describe()` on every field
- `z.enum(['user', 'network', 'meta'])` for dump type parameter
- `requireElevated` guard on regenerate (PUT) handler
- `validateNodeName` and `validateVMID` in all handlers
- Re-exports in both `src/tools/index.ts` and `src/schemas/index.ts`
- Tool descriptions in `src/server.ts`
- Tool count updated from 227 → 230

### Must NOT Have (Guardrails)
- ❌ DO NOT add LXC support (Cloud-init API is QEMU-only: `/nodes/{node}/qemu/{vmid}/cloudinit`)
- ❌ DO NOT add cloud-init configuration *setter* tools (different endpoint, different scope)
- ❌ DO NOT add cloud-init drive creation tools
- ❌ DO NOT validate cloud-init drive existence before API calls (let Proxmox handle errors)
- ❌ DO NOT parse YAML responses from dump endpoint (return raw text)
- ❌ DO NOT add new formatting utilities (use existing `formatToolResponse`)
- ❌ DO NOT modify any existing tool handlers
- ❌ DO NOT change the existing `release.yml` or any CI workflows

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks verified by agent-executed commands. No manual testing.

### Test Decision
- **Infrastructure exists**: YES (bun test / vitest)
- **Automated tests**: NO (3 simple tools following established pattern; existing test suite validates patterns)
- **Agent-Executed QA**: MANDATORY — build + typecheck + runtime count validation

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create schema file (src/schemas/cloud-init.ts)
└── Task 2: Create handler file (src/tools/cloud-init.ts)

Wave 2 (After Wave 1):
└── Task 3: Register tools (modify 5 existing files)

Wave 3 (After Wave 2):
└── Task 4: Build, verify, commit
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | 2 |
| 2 | 1 (types) | 3 | 1 (partial) |
| 3 | 1, 2 | 4 | None |
| 4 | 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 3 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 3 | 4 | delegate_task(category="quick", load_skills=["git-master"], run_in_background=false) |

---

## TODOs

- [x] 1. Create `src/schemas/cloud-init.ts` — Zod schemas for 3 tools

  **What to do**:
  Create the schema file with these exact schemas:

  ```typescript
  import { z } from 'zod';

  const baseVmSchema = z.object({
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  });

  // proxmox_get_cloudinit_config — List cloud-init configuration items
  export const getCloudInitConfigSchema = baseVmSchema;
  export type GetCloudInitConfigInput = z.input<typeof getCloudInitConfigSchema>;

  // proxmox_dump_cloudinit — Dump rendered cloud-init config
  export const dumpCloudInitSchema = baseVmSchema.extend({
    type: z.enum(['user', 'network', 'meta']).describe('Cloud-init config type to dump (user, network, or meta)'),
  });
  export type DumpCloudInitInput = z.input<typeof dumpCloudInitSchema>;

  // proxmox_regenerate_cloudinit — Regenerate the cloud-init drive
  export const regenerateCloudInitSchema = baseVmSchema;
  export type RegenerateCloudInitInput = z.input<typeof regenerateCloudInitSchema>;
  ```

  **Must NOT do**:
  - Don't add optional parameters beyond what's in the API spec
  - Don't create shared schema imports from other files (self-contained baseVmSchema)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/schemas/vm-advanced.ts:1-6` — baseVmSchema definition pattern (node + vmid)
  - `src/schemas/vm-advanced.ts:37-44` — Simple schema using baseVmSchema directly (createTemplateVmSchema)
  - `src/schemas/vm-advanced.ts:47-52` — Schema extending baseVmSchema with `.extend()` (getVmRrddataSchema)

  **API References**:
  - Proxmox API: `GET /nodes/{node}/qemu/{vmid}/cloudinit` — no params beyond node/vmid
  - Proxmox API: `GET /nodes/{node}/qemu/{vmid}/cloudinit/dump` — requires `type` param (enum: user|network|meta)
  - Proxmox API: `PUT /nodes/{node}/qemu/{vmid}/cloudinit` — no params beyond node/vmid

  **Acceptance Criteria**:
  - [x] File exists: `test -f src/schemas/cloud-init.ts`
  - [x] Exports 3 schemas: `getCloudInitConfigSchema`, `dumpCloudInitSchema`, `regenerateCloudInitSchema`
  - [x] Exports 3 types: `GetCloudInitConfigInput`, `DumpCloudInitInput`, `RegenerateCloudInitInput`
  - [x] `dumpCloudInitSchema` has `type` field with `z.enum(['user', 'network', 'meta'])`
  - [x] Every field has `.describe()`

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Schema file compiles without errors
    Tool: Bash
    Preconditions: src/schemas/cloud-init.ts created
    Steps:
      1. Run: npx tsc --noEmit src/schemas/cloud-init.ts --skipLibCheck --esModuleInterop --module nodenext --moduleResolution nodenext --target es2022
      2. Assert: exit code 0 (no type errors)
    Expected Result: TypeScript compiles cleanly
    Evidence: Command output captured

  Scenario: Schema exports are correct
    Tool: Bash
    Preconditions: src/schemas/cloud-init.ts exists
    Steps:
      1. Run: grep -c "export const" src/schemas/cloud-init.ts
      2. Assert: output is "3"
      3. Run: grep -c "export type" src/schemas/cloud-init.ts
      4. Assert: output is "3"
      5. Run: grep "z.enum" src/schemas/cloud-init.ts
      6. Assert: output contains "user" and "network" and "meta"
    Expected Result: 3 schemas + 3 types exported, enum constraint present
    Evidence: grep outputs captured
  ```

  **Commit**: NO (grouped with Task 4)

---

- [x] 2. Create `src/tools/cloud-init.ts` — Handler functions for 3 tools

  **What to do**:
  Create the handler file with 3 functions following the exact pattern from `vm-advanced.ts`:

  ```typescript
  import type { ProxmoxApiClient } from '../client/proxmox.js';
  import type { Config } from '../config/index.js';
  import type { ToolResponse } from '../types/index.js';
  import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
  import { requireElevated } from '../middleware/index.js';
  import { validateNodeName, validateVMID } from '../validators/index.js';
  import type {
    GetCloudInitConfigInput,
    DumpCloudInitInput,
    RegenerateCloudInitInput,
  } from '../schemas/cloud-init.js';

  /**
   * Get cloud-init configuration items for a QEMU VM.
   */
  export async function getCloudInitConfig(
    client: ProxmoxApiClient,
    config: Config,
    input: GetCloudInitConfigInput
  ): Promise<ToolResponse> {
    try {
      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      const result = await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit`
      );

      const output =
        `☁️ **Cloud-Init Configuration**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n\n` +
        `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Get Cloud-Init Config');
    }
  }

  /**
   * Dump rendered cloud-init configuration for a QEMU VM.
   * Returns raw cloud-init content (YAML for user-data, etc.).
   */
  export async function dumpCloudInit(
    client: ProxmoxApiClient,
    config: Config,
    input: DumpCloudInitInput
  ): Promise<ToolResponse> {
    try {
      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      const result = await client.request<string>(
        `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit/dump`,
        'GET',
        { type: input.type }
      );

      const output =
        `☁️ **Cloud-Init Dump (${input.type})**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Type**: ${input.type}\n\n` +
        `\`\`\`\n${result}\n\`\`\``;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Dump Cloud-Init Config');
    }
  }

  /**
   * Regenerate the cloud-init drive for a QEMU VM.
   * This re-creates the cloud-init ISO with current configuration.
   */
  export async function regenerateCloudInit(
    client: ProxmoxApiClient,
    config: Config,
    input: RegenerateCloudInitInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'regenerate cloud-init drive');

      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit`,
        'PUT'
      );

      const output =
        `☁️ **Cloud-Init Drive Regenerated**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n\n` +
        `The cloud-init drive has been regenerated with current configuration.`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Regenerate Cloud-Init');
    }
  }
  ```

  **Must NOT do**:
  - Don't parse YAML/text from dump response (return raw)
  - Don't add pre-validation for cloud-init drive existence
  - Don't use `config` parameter in read-only handlers (only `regenerateCloudInit` uses it via `requireElevated`)
  - Don't add LXC variants

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (if schemas are written first or simultaneously)
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1 (imports types from schema file)

  **References**:

  **Pattern References**:
  - `src/tools/vm-advanced.ts:1-7` — Import pattern (client, config, ToolResponse types + formatters + middleware + validators)
  - `src/tools/vm-advanced.ts:77-119` — Handler function pattern: `migrateVm()` shows validate → request → format → return
  - `src/tools/vm-advanced.ts:83` — `requireElevated(config, 'migrate VM')` pattern for elevated ops
  - `src/tools/vm-advanced.ts:86-87` — `validateNodeName()` and `validateVMID()` usage
  - `src/tools/vm-advanced.ts:101` — `client.request()` call with endpoint, method, payload
  - `src/tools/vm-advanced.ts:116-118` — Error handling: `catch (error) { return formatErrorResponse(error as Error, 'context') }`

  **API References**:
  - `src/client/proxmox.ts:89` — `async request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T>`
  - `src/client/proxmox.ts:142` — Response: `JSON.parse(textResponse) as { data: T }` → returns `data.data`
  - `src/formatters/index.ts:59-64` — `formatToolResponse(text: string): ToolResponse`
  - `src/formatters/index.ts:71-77` — `formatErrorResponse(error: Error, context: string): ToolResponse`
  - `src/middleware/index.ts:9-13` — `requireElevated(config: Config, action: string): void`
  - `src/validators/index.ts:10-27` — `validateNodeName(node: unknown): string`
  - `src/validators/index.ts:204-215` — `validateVMID(vmid: unknown): string`

  **Key Behavior Notes**:
  - GET cloudinit: Returns array/object of config items → JSON.stringify for display
  - GET cloudinit/dump: Returns raw string (YAML/text) → display in code block
  - PUT cloudinit: Returns null → display success message, no result to show
  - `client.request()` passes GET params as `body` which gets serialized — for dump, pass `{ type }` as body so it becomes query string (check: GET with body appends to URL? No — looking at client code line 104-117, only POST/PUT/DELETE handle body; for GET, body is NOT sent. **Must use query string manually for dump endpoint**)

  **⚠️ CRITICAL**: For the dump endpoint, the `type` parameter must be passed as a query string, NOT as a body parameter. Looking at `client.request()`:
  - Line 104-117: Body handling is only for POST, PUT, DELETE
  - For GET requests, body is NOT appended as query params
  - **Solution**: Build the URL directly: `` `/nodes/${safeNode}/qemu/${safeVmid}/cloudinit/dump?type=${input.type}` ``

  **Acceptance Criteria**:
  - [x] File exists: `test -f src/tools/cloud-init.ts`
  - [x] Exports 3 functions: `getCloudInitConfig`, `dumpCloudInit`, `regenerateCloudInit`
  - [x] `regenerateCloudInit` calls `requireElevated`
  - [x] All handlers validate node and vmid
  - [x] Dump handler uses query string (NOT body) for type parameter
  - [x] No `config` usage in read-only handlers except passing to elevated check

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Handler file has correct exports
    Tool: Bash
    Preconditions: src/tools/cloud-init.ts created
    Steps:
      1. Run: grep -c "export async function" src/tools/cloud-init.ts
      2. Assert: output is "3"
      3. Run: grep "requireElevated" src/tools/cloud-init.ts
      4. Assert: output contains "regenerate cloud-init"
      5. Run: grep "validateNodeName" src/tools/cloud-init.ts | wc -l
      6. Assert: output is "3" (one per handler)
      7. Run: grep "validateVMID" src/tools/cloud-init.ts | wc -l
      8. Assert: output is "3" (one per handler)
    Expected Result: 3 handlers with proper validation and elevation check
    Evidence: grep outputs captured

  Scenario: Dump endpoint uses query string for type parameter
    Tool: Bash
    Preconditions: src/tools/cloud-init.ts exists
    Steps:
      1. Run: grep "cloudinit/dump" src/tools/cloud-init.ts
      2. Assert: output contains "?type=" (query string, not body)
    Expected Result: Type passed as URL query parameter
    Evidence: grep output captured
  ```

  **Commit**: NO (grouped with Task 4)

---

- [x] 3. Register tools — Modify 5 existing files

  **What to do**:

  **3a. `src/types/tools.ts`** — Add 3 tool names to `TOOL_NAMES` array:
  
  After the last entry `'proxmox_get_node_zfs'` (line 228), before `] as const;` (line 229), add:
  ```typescript
    // Cloud-Init
    'proxmox_get_cloudinit_config',
    'proxmox_dump_cloudinit',
    'proxmox_regenerate_cloudinit',
  ```

  **3b. `src/schemas/index.ts`** — Add re-export:
  
  After last line `export * from './sdn.js';` (line 16), add:
  ```typescript
  export * from './cloud-init.js';
  ```

  **3c. `src/tools/index.ts`** — Add re-export:
  
  After last line `export { listTemplates, createLxc, createVM } from './vm-create.js';` (line 284), add:
  ```typescript

  // Cloud-Init tools
  export {
    getCloudInitConfig,
    dumpCloudInit,
    regenerateCloudInit,
  } from './cloud-init.js';
  ```

  **3d. `src/tools/registry.ts`** — Three changes:

  1. Add handler imports (after line 234, in the import from `'./index.js'`):
     ```typescript
     getCloudInitConfig,
     dumpCloudInit,
     regenerateCloudInit,
     ```

  2. Add schema imports (new import block after existing schema imports, around line 496):
     ```typescript
     import {
       getCloudInitConfigSchema,
       dumpCloudInitSchema,
       regenerateCloudInitSchema,
     } from '../schemas/cloud-init.js';
     ```

  3. Add registry entries (before the closing `};` of `toolRegistry`, after the Creation section around line 936):
     ```typescript

       // Cloud-Init
       proxmox_get_cloudinit_config: { handler: getCloudInitConfig, schema: getCloudInitConfigSchema },
       proxmox_dump_cloudinit: { handler: dumpCloudInit, schema: dumpCloudInitSchema },
       proxmox_regenerate_cloudinit: { handler: regenerateCloudInit, schema: regenerateCloudInitSchema },
     ```

  4. **Update tool count** (line 946): Change `227` to `230`:
     ```typescript
     if (registeredCount !== 230) {
       throw new Error(
         `Tool registry incomplete: expected 230 tools, got ${registeredCount}`
       );
     }
     ```

  **3e. `src/server.ts`** — Add tool descriptions:

  After `proxmox_get_node_zfs` description (line 300), before `};` (line 301), add:
  ```typescript

     // Cloud-Init
     proxmox_get_cloudinit_config: 'Get cloud-init configuration items for a QEMU VM',
     proxmox_dump_cloudinit: 'Dump rendered cloud-init config (user-data, network-config, or meta-data) for a QEMU VM',
     proxmox_regenerate_cloudinit: 'Regenerate the cloud-init drive for a QEMU VM (requires elevated permissions)',
  ```

  **Must NOT do**:
  - Don't modify any existing entries in these files
  - Don't change the structure of the registry or exports
  - Don't add descriptions for tools that don't exist yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References** (for exact insertion patterns):
  - `src/types/tools.ts:228-229` — Where to add new tool names (before `] as const;`)
  - `src/schemas/index.ts:16` — Where to add schema re-export (after last `export *`)
  - `src/tools/index.ts:284` — Where to add handler re-export (after last export block)
  - `src/tools/registry.ts:1-235` — Handler import block from `'./index.js'`
  - `src/tools/registry.ts:238-496` — Schema import blocks (add new import after last one)
  - `src/tools/registry.ts:512-937` — Registry entries (add after Creation section)
  - `src/tools/registry.ts:945-950` — Tool count assertion (change 227 → 230)
  - `src/server.ts:16-301` — TOOL_DESCRIPTIONS record (add before closing `}`)

  **Acceptance Criteria**:
  - [x] `TOOL_NAMES` array has 230 entries: `grep -c "proxmox_" src/types/tools.ts` equals 230
  - [x] `src/schemas/index.ts` exports cloud-init: `grep "cloud-init" src/schemas/index.ts`
  - [x] `src/tools/index.ts` exports cloud-init handlers: `grep "cloud-init" src/tools/index.ts`
  - [x] Registry imports all 3 handlers and schemas: `grep "CloudInit\|cloudinit\|cloud-init" src/tools/registry.ts | wc -l` >= 6
  - [x] Registry count updated: `grep "230" src/tools/registry.ts`
  - [x] Server has 3 descriptions: `grep "cloudinit" src/server.ts | wc -l` equals 3

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Tool names correctly registered
    Tool: Bash
    Preconditions: src/types/tools.ts modified
    Steps:
      1. Run: grep "proxmox_get_cloudinit_config" src/types/tools.ts
      2. Assert: match found
      3. Run: grep "proxmox_dump_cloudinit" src/types/tools.ts
      4. Assert: match found
      5. Run: grep "proxmox_regenerate_cloudinit" src/types/tools.ts
      6. Assert: match found
    Expected Result: All 3 tool names present in TOOL_NAMES
    Evidence: grep outputs captured

  Scenario: Registry count updated to 230
    Tool: Bash
    Preconditions: src/tools/registry.ts modified
    Steps:
      1. Run: grep "expected 230" src/tools/registry.ts
      2. Assert: match found (not 227)
    Expected Result: Count assertion updated
    Evidence: grep output captured

  Scenario: All barrel exports include cloud-init
    Tool: Bash
    Preconditions: All files modified
    Steps:
      1. Run: grep "cloud-init" src/schemas/index.ts
      2. Assert: match found
      3. Run: grep "cloud-init" src/tools/index.ts
      4. Assert: match found
    Expected Result: Both barrel exports include cloud-init module
    Evidence: grep outputs captured
  ```

  **Commit**: NO (grouped with Task 4)

---

- [x] 4. Build, verify, and commit

  **What to do**:
  1. Run `pnpm build` — must succeed with no errors
  2. Run `pnpm test` — all existing tests must still pass
  3. Verify no TypeScript errors: `pnpm typecheck` (or `pnpm build` covers this)
  4. Commit all changes

  **Must NOT do**:
  - Don't push to remote
  - Don't modify any files not listed in Tasks 1-3

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`
    - `git-master`: Atomic commit handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final, sequential)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - Task 1-3 outputs: All files created/modified
  - `package.json` — Build/test scripts (`pnpm build`, `pnpm test`)

  **Acceptance Criteria**:
  - [x] `pnpm build` exits with code 0
  - [x] `pnpm test` exits with code 0 (all tests pass)
  - [x] Commit exists with message: `feat: add cloud-init tools (get config, dump, regenerate)`
  - [x] Commit includes exactly these files:
    - `src/schemas/cloud-init.ts` (new)
    - `src/tools/cloud-init.ts` (new)
    - `src/types/tools.ts` (modified)
    - `src/tools/registry.ts` (modified)
    - `src/tools/index.ts` (modified)
    - `src/schemas/index.ts` (modified)
    - `src/server.ts` (modified)
  - [x] Working directory clean after commit: `git status --porcelain` is empty

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All files from Tasks 1-3 created/modified
    Steps:
      1. Run: pnpm build
      2. Assert: exit code 0
      3. Assert: no "error" in output (case-insensitive)
    Expected Result: TypeScript compiles cleanly
    Evidence: Build output captured

  Scenario: Tests pass
    Tool: Bash
    Preconditions: Build succeeded
    Steps:
      1. Run: pnpm test
      2. Assert: exit code 0
      3. Assert: output contains "pass" or test summary
    Expected Result: All existing tests still pass
    Evidence: Test output captured

  Scenario: Commit includes all changes
    Tool: Bash
    Preconditions: Build and tests passed
    Steps:
      1. Run: git add -A && git commit -m "feat: add cloud-init tools (get config, dump, regenerate)"
      2. Run: git show --stat HEAD
      3. Assert: output contains "cloud-init.ts" (2 new files)
      4. Assert: output contains "registry.ts"
      5. Assert: output contains "tools.ts"
      6. Assert: output contains "server.ts"
      7. Assert: output shows "7 files changed"
      8. Run: git status --porcelain
      9. Assert: output is empty
    Expected Result: Clean commit with all 7 files
    Evidence: git show --stat and git status output
  ```

  **Commit**: YES
  - Message: `feat: add cloud-init tools (get config, dump, regenerate)`
  - Files: `src/schemas/cloud-init.ts`, `src/tools/cloud-init.ts`, `src/types/tools.ts`, `src/tools/registry.ts`, `src/tools/index.ts`, `src/schemas/index.ts`, `src/server.ts`
  - Pre-commit: `pnpm build && pnpm test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 4 | `feat: add cloud-init tools (get config, dump, regenerate)` | 7 files (2 new, 5 modified) | `pnpm build && pnpm test` |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
pnpm build  # Expected: exit 0

# Tests pass
pnpm test  # Expected: exit 0, all tests pass

# Tool count correct
grep "expected 230" src/tools/registry.ts  # Expected: match

# New schemas exist
grep "CloudInit" src/schemas/cloud-init.ts  # Expected: 3+ matches

# New handlers exist
grep "export async function" src/tools/cloud-init.ts  # Expected: 3 matches

# Registry has new tools
grep "cloudinit" src/tools/registry.ts  # Expected: 3+ matches

# Descriptions exist
grep "cloudinit" src/server.ts  # Expected: 3 matches

# Clean git state
git status --porcelain  # Expected: empty after commit
```

### Final Checklist
- [x] `src/schemas/cloud-init.ts` created with 3 schemas
- [x] `src/tools/cloud-init.ts` created with 3 handlers
- [x] `src/types/tools.ts` has 3 new tool names (total: 230)
- [x] `src/tools/registry.ts` has 3 new entries, count updated to 230
- [x] `src/tools/index.ts` re-exports cloud-init handlers
- [x] `src/schemas/index.ts` re-exports cloud-init schemas
- [x] `src/server.ts` has 3 new tool descriptions
- [x] `pnpm build` succeeds
- [x] `pnpm test` passes
- [x] Single commit with all 7 files
