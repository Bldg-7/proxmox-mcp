# QEMU Agent Tools Implementation

## TL;DR

> **Quick Summary**: Add 6 QEMU Agent tools to the Proxmox MCP server for file operations, user management, and power control. Includes new validators for file paths and usernames.
> 
> **Deliverables**:
> - `src/validators/index.ts` — Add 2 new validators (validateFilePath, validateUsername)
> - `src/schemas/vm-advanced.ts` — Add 6 Zod schemas
> - `src/tools/vm-advanced.ts` — Add 6 handler functions
> - Modified: `src/types/tools.ts`, `src/tools/registry.ts`, `src/server.ts`
> - Tests: `src/tools/vm-advanced.test.ts` — Add tests for 6 new tools
> 
> **Estimated Effort**: Medium (~45 min)
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

---

## Context

### Original Request
User wants to implement 6 high-value QEMU Agent API endpoints as MCP tools, continuing the incremental implementation of ~140 missing Proxmox API endpoints.

### Proxmox QEMU Agent API Endpoints (Selected 6)
1. **`GET /nodes/{node}/qemu/{vmid}/agent/file-read`** — Read file content from guest (max 16 MiB)
2. **`POST /nodes/{node}/qemu/{vmid}/agent/file-write`** — Write content to file in guest (max 60 KiB)
3. **`GET /nodes/{node}/qemu/{vmid}/agent/get-host-name`** — Get guest hostname
4. **`GET /nodes/{node}/qemu/{vmid}/agent/get-users`** — List logged-in users
5. **`POST /nodes/{node}/qemu/{vmid}/agent/set-user-password`** — Change user password
6. **`POST /nodes/{node}/qemu/{vmid}/agent/shutdown`** — Graceful shutdown via agent

### Metis Review
**Key Findings**:
- **Base64 handling**: file-read returns base64, file-write expects base64 (encode param)
- **Size limits**: file-read 16 MiB max, file-write 60 KiB max (before encoding)
- **New validators needed**: validateFilePath() and validateUsername()
- **Permission model**: file_read, file_write, set_user_password, shutdown all require elevated
- **Response format quirks**: Hyphenated keys (host-name, login-time)
- **Security**: Password must not be logged
- **Tool count**: 230 → 236

---

## Work Objectives

### Core Objective
Add 6 QEMU Agent MCP tools following the established 230-tool codebase pattern, bringing total to 236.

### Concrete Deliverables
- 6 new tools: `proxmox_agent_file_read`, `proxmox_agent_file_write`, `proxmox_agent_get_hostname`, `proxmox_agent_get_users`, `proxmox_agent_set_user_password`, `proxmox_agent_shutdown`
- 2 new validators: `validateFilePath`, `validateUsername`
- All properly typed, validated, and registered

### Definition of Done
- [ ] All 6 tools registered and functional
- [ ] 2 new validators implemented with tests
- [ ] `pnpm build` succeeds with no errors
- [ ] `pnpm test` passes (all existing + new tests)
- [ ] Tool count assertion updated to 236 and doesn't throw

### Must Have
- Zod schemas with `.describe()` on every field
- `requireElevated` guard on file_read, file_write, set_user_password, shutdown handlers
- `validateNodeName`, `validateVMID`, `validateFilePath`, `validateUsername` in handlers
- Base64 encoding/decoding for file operations
- Size validation: file-write content ≤60 KiB before encoding
- Handle truncated flag in file-read response
- Handle hyphenated response keys (host-name, login-time)
- Password field must not be logged
- Re-exports in `src/tools/index.ts` and `src/schemas/index.ts`
- Tool descriptions in `src/server.ts`
- Tool count updated from 230 → 236
- Unit tests for all 6 handlers

### Must NOT Have (Guardrails)
- ❌ DO NOT add file append mode (not in API spec)
- ❌ DO NOT add recursive file operations (scope creep)
- ❌ DO NOT add file permission checking (API doesn't support)
- ❌ DO NOT create new schema file (use existing `vm-advanced.ts`)
- ❌ DO NOT add file upload via multipart (API uses base64 in JSON)
- ❌ DO NOT over-engineer file type detection (simple binary check sufficient)
- ❌ DO NOT add agent installation helper (out of scope)
- ❌ DO NOT log password values in set_user_password
- ❌ DO NOT skip base64 encoding for file_write
- ❌ DO NOT modify any existing tool handlers

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks verified by agent-executed commands. No manual testing.

### Test Decision
- **Infrastructure exists**: YES (bun test / vitest)
- **Automated tests**: YES (6 new tools with complex logic require unit tests)
- **Agent-Executed QA**: MANDATORY — build + typecheck + test suite + runtime count validation

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Add validators (src/validators/index.ts + tests)

Wave 2 (After Wave 1):
├── Task 2: Create schemas (src/schemas/vm-advanced.ts)
└── Task 3: Create handlers (src/tools/vm-advanced.ts)

Wave 3 (After Wave 2):
└── Task 4: Register tools (modify 3 existing files)

Wave 4 (After Wave 3):
├── Task 5: Add unit tests (src/tools/vm-advanced.test.ts)
└── Task 6: Build, verify, commit
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None (foundational) |
| 2 | 1 (validators) | 3, 4 | 3 (partial) |
| 3 | 1, 2 (types) | 4 | 2 (partial) |
| 4 | 2, 3 | 5, 6 | None |
| 5 | 4 | 6 | None |
| 6 | 5 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 2, 3 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 3 | 4 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 4 | 5, 6 | delegate_task(category="quick", load_skills=["git-master"], run_in_background=false) |

---

## TODOs

- [ ] 1. Add validators — `validateFilePath()` and `validateUsername()` with tests

  **What to do**:
  Add two new validators to `src/validators/index.ts`:

  ```typescript
  /**
   * Validate file path for guest agent file operations.
   * Prevents path traversal attacks and enforces reasonable limits.
   */
  export function validateFilePath(path: unknown): string {
    if (typeof path !== 'string') {
      throw new Error('File path must be a string');
    }

    const trimmed = path.trim();

    if (trimmed.length === 0) {
      throw new Error('File path cannot be empty');
    }

    if (trimmed.length > 4096) {
      throw new Error('File path too long (max 4096 characters)');
    }

    // Prevent path traversal
    if (trimmed.includes('..')) {
      throw new Error('File path cannot contain ".." (path traversal)');
    }

    return trimmed;
  }

  /**
   * Validate username for guest agent user operations.
   * Follows Linux username conventions.
   */
  export function validateUsername(username: unknown): string {
    if (typeof username !== 'string') {
      throw new Error('Username must be a string');
    }

    const trimmed = username.trim();

    if (trimmed.length === 0) {
      throw new Error('Username cannot be empty');
    }

    if (trimmed.length > 32) {
      throw new Error('Username too long (max 32 characters)');
    }

    // Linux username format: starts with lowercase letter or underscore,
    // followed by lowercase letters, digits, underscores, or hyphens,
    // optionally ending with $
    const usernameRegex = /^[a-z_][a-z0-9_-]*\$?$/;
    if (!usernameRegex.test(trimmed)) {
      throw new Error(
        'Invalid username format (must follow Linux username conventions)'
      );
    }

    return trimmed;
  }
  ```

  Add tests to `src/validators/index.test.ts`:

  ```typescript
  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      expect(validateFilePath('/etc/hostname')).toBe('/etc/hostname');
      expect(validateFilePath('/var/log/syslog')).toBe('/var/log/syslog');
      expect(validateFilePath('C:\\Windows\\System32\\config')).toBe('C:\\Windows\\System32\\config');
    });

    it('should reject path traversal attempts', () => {
      expect(() => validateFilePath('../../../etc/passwd')).toThrow('path traversal');
      expect(() => validateFilePath('/var/log/../../etc/shadow')).toThrow('path traversal');
    });

    it('should reject empty paths', () => {
      expect(() => validateFilePath('')).toThrow('cannot be empty');
      expect(() => validateFilePath('   ')).toThrow('cannot be empty');
    });

    it('should reject paths that are too long', () => {
      const longPath = '/'.repeat(4097);
      expect(() => validateFilePath(longPath)).toThrow('too long');
    });

    it('should reject non-string values', () => {
      expect(() => validateFilePath(123)).toThrow('must be a string');
      expect(() => validateFilePath(null)).toThrow('must be a string');
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('root')).toBe('root');
      expect(validateUsername('user123')).toBe('user123');
      expect(validateUsername('_service')).toBe('_service');
      expect(validateUsername('user-name')).toBe('user-name');
      expect(validateUsername('machine$')).toBe('machine$');
    });

    it('should reject invalid usernames', () => {
      expect(() => validateUsername('User')).toThrow('Invalid username format');
      expect(() => validateUsername('123user')).toThrow('Invalid username format');
      expect(() => validateUsername('user@host')).toThrow('Invalid username format');
      expect(() => validateUsername('user name')).toThrow('Invalid username format');
    });

    it('should reject empty usernames', () => {
      expect(() => validateUsername('')).toThrow('cannot be empty');
      expect(() => validateUsername('   ')).toThrow('cannot be empty');
    });

    it('should reject usernames that are too long', () => {
      const longUsername = 'a'.repeat(33);
      expect(() => validateUsername(longUsername)).toThrow('too long');
    });

    it('should reject non-string values', () => {
      expect(() => validateUsername(123)).toThrow('must be a string');
      expect(() => validateUsername(null)).toThrow('must be a string');
    });
  });
  ```

  **Must NOT do**:
  - Don't add validators for other purposes (stay focused)
  - Don't modify existing validators

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundational, blocks everything)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/validators/index.ts:10-27` — validateNodeName pattern
  - `src/validators/index.ts:204-215` — validateVMID pattern
  - `src/validators/index.test.ts:1-50` — Test structure pattern

  **Acceptance Criteria**:
  - [ ] File exists: `test -f src/validators/index.ts` (already exists, modified)
  - [ ] Exports 2 new functions: `validateFilePath`, `validateUsername`
  - [ ] Tests exist: `grep -c "describe('validateFilePath'" src/validators/index.test.ts` equals 1
  - [ ] Tests exist: `grep -c "describe('validateUsername'" src/validators/index.test.ts` equals 1
  - [ ] Tests pass: `bun test src/validators/index.test.ts` exits with code 0

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Validators compile without errors
    Tool: Bash
    Preconditions: src/validators/index.ts modified
    Steps:
      1. Run: bun run typecheck
      2. Assert: exit code 0 (no type errors)
    Expected Result: TypeScript compiles cleanly
    Evidence: Command output captured

  Scenario: Validator tests pass
    Tool: Bash
    Preconditions: Tests added to src/validators/index.test.ts
    Steps:
      1. Run: bun test src/validators/index.test.ts
      2. Assert: exit code 0
      3. Assert: output contains "pass" or test summary
    Expected Result: All validator tests pass
    Evidence: Test output captured
  ```

  **Commit**: NO (grouped with Task 6)

---

- [ ] 2. Create schemas — Add 6 Zod schemas to `src/schemas/vm-advanced.ts`

  **What to do**:
  Add 6 new schemas to `src/schemas/vm-advanced.ts` (after existing agent schemas, around line 118):

  ```typescript
  // proxmox_agent_file_read — Read file content from guest
  export const agentFileReadSchema = baseVmSchema.extend({
    file: z.string().min(1).describe('Path to file in guest filesystem'),
  });
  export type AgentFileReadInput = z.input<typeof agentFileReadSchema>;

  // proxmox_agent_file_write — Write content to file in guest
  export const agentFileWriteSchema = baseVmSchema.extend({
    file: z.string().min(1).describe('Path to file in guest filesystem'),
    content: z.string().describe('Content to write to file'),
    encode: z.boolean().optional().describe('Base64 encode content (default: true)'),
  });
  export type AgentFileWriteInput = z.input<typeof agentFileWriteSchema>;

  // proxmox_agent_get_hostname — Get guest hostname
  export const agentGetHostnameSchema = baseVmSchema;
  export type AgentGetHostnameInput = z.input<typeof agentGetHostnameSchema>;

  // proxmox_agent_get_users — List logged-in users
  export const agentGetUsersSchema = baseVmSchema;
  export type AgentGetUsersInput = z.input<typeof agentGetUsersSchema>;

  // proxmox_agent_set_user_password — Change user password
  export const agentSetUserPasswordSchema = baseVmSchema.extend({
    username: z.string().min(1).max(32).describe('Username to set password for'),
    password: z.string().min(5).max(1024).describe('New password (5-1024 characters)'),
    crypted: z.boolean().optional().describe('Whether password is already crypted (default: false)'),
  });
  export type AgentSetUserPasswordInput = z.input<typeof agentSetUserPasswordSchema>;

  // proxmox_agent_shutdown — Graceful shutdown via agent
  export const agentShutdownSchema = baseVmSchema;
  export type AgentShutdownInput = z.input<typeof agentShutdownSchema>;
  ```

  **Must NOT do**:
  - Don't add optional parameters beyond what's in the API spec
  - Don't create shared schema imports from other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3 if validators done)
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1 (needs validators)

  **References**:

  **Pattern References**:
  - `src/schemas/vm-advanced.ts:1-6` — baseVmSchema definition pattern
  - `src/schemas/vm-advanced.ts:62-118` — Existing agent schemas pattern

  **API References**:
  - `docs/proxmox-qemu-agent-endpoints.md:149-173` — file-read and file-write specs
  - `docs/proxmox-qemu-agent-endpoints.md:30-47` — get-host-name spec
  - `docs/proxmox-qemu-agent-endpoints.md:60-78` — get-users and set-user-password specs
  - `docs/proxmox-qemu-agent-endpoints.md:238-245` — shutdown spec

  **Acceptance Criteria**:
  - [ ] File modified: `test -f src/schemas/vm-advanced.ts`
  - [ ] Exports 6 new schemas: `grep -c "export const agent.*Schema" src/schemas/vm-advanced.ts` increased by 6
  - [ ] Exports 6 new types: `grep -c "export type Agent.*Input" src/schemas/vm-advanced.ts` increased by 6
  - [ ] Every field has `.describe()`
  - [ ] Password field has min(5) and max(1024) constraints

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Schemas compile without errors
    Tool: Bash
    Preconditions: src/schemas/vm-advanced.ts modified
    Steps:
      1. Run: bun run typecheck
      2. Assert: exit code 0 (no type errors)
    Expected Result: TypeScript compiles cleanly
    Evidence: Command output captured

  Scenario: Schema exports are correct
    Tool: Bash
    Preconditions: src/schemas/vm-advanced.ts modified
    Steps:
      1. Run: grep -c "export const agent.*Schema" src/schemas/vm-advanced.ts
      2. Assert: output increased by 6 from baseline
      3. Run: grep -c "export type Agent.*Input" src/schemas/vm-advanced.ts
      4. Assert: output increased by 6 from baseline
    Expected Result: 6 new schemas + 6 new types exported
    Evidence: grep outputs captured
  ```

  **Commit**: NO (grouped with Task 6)

---

- [ ] 3. Create handlers — Add 6 handler functions to `src/tools/vm-advanced.ts`

  **What to do**:
  Add 6 new handler functions to `src/tools/vm-advanced.ts` (after existing agent handlers, around line 600):

  ```typescript
  /**
   * Read file content from guest via QEMU agent.
   * Returns base64-decoded content (or base64 if binary).
   */
  export async function agentFileRead(
    client: ProxmoxApiClient,
    config: Config,
    input: AgentFileReadInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'read files from guest');

      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);
      const safeFile = validateFilePath(input.file);

      const result = await client.request<{
        content: string;
        'bytes-read': number;
        truncated?: boolean;
      }>(`/nodes/${safeNode}/qemu/${safeVmid}/agent/file-read`, 'GET', {
        file: safeFile,
      });

      // Decode base64 content
      let decodedContent: string;
      let isBinary = false;
      try {
        decodedContent = Buffer.from(result.content, 'base64').toString('utf-8');
      } catch {
        // Binary content - show base64
        decodedContent = result.content;
        isBinary = true;
      }

      const truncatedWarning = result.truncated
        ? '\n\n⚠️ **Warning**: Content was truncated (>16 MiB limit)'
        : '';

      const output =
        `📄 **File Read from Guest**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **File**: ${safeFile}\n` +
        `• **Bytes Read**: ${result['bytes-read']}\n` +
        (isBinary ? `• **Format**: Binary (base64 encoded)\n` : '') +
        truncatedWarning +
        `\n\n\`\`\`\n${decodedContent}\n\`\`\``;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent File Read');
    }
  }

  /**
   * Write content to file in guest via QEMU agent.
   * Content is base64-encoded before sending.
   */
  export async function agentFileWrite(
    client: ProxmoxApiClient,
    config: Config,
    input: AgentFileWriteInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'write files to guest');

      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);
      const safeFile = validateFilePath(input.file);

      // Validate content size (60 KiB max before encoding)
      const contentBytes = Buffer.byteLength(input.content, 'utf-8');
      if (contentBytes > 61440) {
        throw new Error(
          `Content too large: ${contentBytes} bytes (max 60 KiB = 61,440 bytes)`
        );
      }

      // Base64 encode content if encode is true (default)
      const encode = input.encode !== false;
      const content = encode
        ? Buffer.from(input.content).toString('base64')
        : input.content;

      await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/agent/file-write`,
        'POST',
        {
          file: safeFile,
          content,
          encode,
        }
      );

      const output =
        `📝 **File Written to Guest**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **File**: ${safeFile}\n` +
        `• **Size**: ${contentBytes} bytes\n` +
        `• **Encoded**: ${encode ? 'Yes (base64)' : 'No'}\n\n` +
        `File has been successfully written.`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent File Write');
    }
  }

  /**
   * Get hostname from guest via QEMU agent.
   */
  export async function agentGetHostname(
    client: ProxmoxApiClient,
    _config: Config,
    input: AgentGetHostnameInput
  ): Promise<ToolResponse> {
    try {
      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      const result = await client.request<{ 'host-name': string }>(
        `/nodes/${safeNode}/qemu/${safeVmid}/agent/get-host-name`
      );

      const output =
        `🖥️ **Guest Hostname**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Hostname**: ${result['host-name']}`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent Get Hostname');
    }
  }

  /**
   * Get list of logged-in users from guest via QEMU agent.
   */
  export async function agentGetUsers(
    client: ProxmoxApiClient,
    _config: Config,
    input: AgentGetUsersInput
  ): Promise<ToolResponse> {
    try {
      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      const result = await client.request<
        Array<{
          user: string;
          'login-time': number;
          domain?: string;
        }>
      >(`/nodes/${safeNode}/qemu/${safeVmid}/agent/get-users`);

      if (result.length === 0) {
        const output =
          `👥 **Logged-in Users**\n\n` +
          `• **Node**: ${safeNode}\n` +
          `• **VM ID**: ${safeVmid}\n\n` +
          `No users currently logged in.`;
        return formatToolResponse(output);
      }

      const userList = result
        .map((u) => {
          const loginTime = new Date(u['login-time'] * 1000).toISOString();
          const domain = u.domain ? ` (${u.domain})` : '';
          return `  - **${u.user}**${domain} — logged in at ${loginTime}`;
        })
        .join('\n');

      const output =
        `👥 **Logged-in Users**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Count**: ${result.length}\n\n` +
        userList;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent Get Users');
    }
  }

  /**
   * Set user password in guest via QEMU agent.
   * WARNING: Password is sent in plain text via API.
   */
  export async function agentSetUserPassword(
    client: ProxmoxApiClient,
    config: Config,
    input: AgentSetUserPasswordInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'set user password in guest');

      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);
      const safeUsername = validateUsername(input.username);

      // Note: Password is intentionally NOT logged
      await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/agent/set-user-password`,
        'POST',
        {
          username: safeUsername,
          password: input.password,
          crypted: input.crypted ?? false,
        }
      );

      const output =
        `🔐 **User Password Updated**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n` +
        `• **Username**: ${safeUsername}\n` +
        `• **Crypted**: ${input.crypted ? 'Yes' : 'No'}\n\n` +
        `Password has been successfully updated.`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent Set User Password');
    }
  }

  /**
   * Shutdown guest via QEMU agent (graceful shutdown from inside guest).
   */
  export async function agentShutdown(
    client: ProxmoxApiClient,
    config: Config,
    input: AgentShutdownInput
  ): Promise<ToolResponse> {
    try {
      requireElevated(config, 'shutdown guest via agent');

      const safeNode = validateNodeName(input.node);
      const safeVmid = validateVMID(input.vmid);

      await client.request(
        `/nodes/${safeNode}/qemu/${safeVmid}/agent/shutdown`,
        'POST'
      );

      const output =
        `🔌 **Guest Shutdown Initiated**\n\n` +
        `• **Node**: ${safeNode}\n` +
        `• **VM ID**: ${safeVmid}\n\n` +
        `Graceful shutdown has been initiated via guest agent.`;

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Agent Shutdown');
    }
  }
  ```

  **Must NOT do**:
  - Don't parse YAML/text from responses (return structured data)
  - Don't add pre-validation for agent availability (let API handle errors)
  - Don't log password values in set_user_password
  - Don't skip base64 encoding for file_write

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2 if validators done)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2 (needs validators and types)

  **References**:

  **Pattern References**:
  - `src/tools/vm-advanced.ts:1-7` — Import pattern
  - `src/tools/vm-advanced.ts:313-400` — Existing agent handler patterns
  - `src/tools/vm-advanced.ts:83` — `requireElevated(config, 'action')` pattern
  - `src/tools/vm-advanced.ts:86-87` — `validateNodeName()` and `validateVMID()` usage

  **API References**:
  - `src/client/proxmox.ts:89` — `async request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T>`
  - `src/formatters/index.ts:59-64` — `formatToolResponse(text: string): ToolResponse`
  - `src/formatters/index.ts:71-77` — `formatErrorResponse(error: Error, context: string): ToolResponse`
  - `src/middleware/index.ts:9-13` — `requireElevated(config: Config, action: string): void`

  **Acceptance Criteria**:
  - [ ] File modified: `test -f src/tools/vm-advanced.ts`
  - [ ] Exports 6 new functions: `grep -c "export async function agent" src/tools/vm-advanced.ts` increased by 6
  - [ ] All handlers call `requireElevated` where appropriate (file_read, file_write, set_user_password, shutdown)
  - [ ] All handlers validate node and vmid
  - [ ] file_read decodes base64 content
  - [ ] file_write encodes content and validates size
  - [ ] set_user_password does NOT log password value
  - [ ] No `config` usage in read-only handlers except passing to elevated check

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Handlers compile without errors
    Tool: Bash
    Preconditions: src/tools/vm-advanced.ts modified
    Steps:
      1. Run: bun run typecheck
      2. Assert: exit code 0 (no type errors)
    Expected Result: TypeScript compiles cleanly
    Evidence: Command output captured

  Scenario: Handlers have correct exports
    Tool: Bash
    Preconditions: src/tools/vm-advanced.ts modified
    Steps:
      1. Run: grep -c "export async function agent" src/tools/vm-advanced.ts
      2. Assert: output increased by 6 from baseline
      3. Run: grep "requireElevated" src/tools/vm-advanced.ts | grep -E "(file_read|file_write|set_user_password|shutdown)"
      4. Assert: 4 matches (one per elevated handler)
    Expected Result: 6 handlers with proper elevation checks
    Evidence: grep outputs captured
  ```

  **Commit**: NO (grouped with Task 6)

---

- [ ] 4. Register tools — Modify 3 existing files

  **What to do**:

  **4a. `src/types/tools.ts`** — Add 6 tool names to `TOOL_NAMES` array:
  
  After the last agent entry `'proxmox_agent_exec_status'` (around line 181), add:
  ```typescript
    'proxmox_agent_file_read',
    'proxmox_agent_file_write',
    'proxmox_agent_get_hostname',
    'proxmox_agent_get_users',
    'proxmox_agent_set_user_password',
    'proxmox_agent_shutdown',
  ```

  **4b. `src/tools/registry.ts`** — Three changes:

  1. Add handler imports (in the import from `'./index.js'`, around line 234):
     ```typescript
     agentFileRead,
     agentFileWrite,
     agentGetHostname,
     agentGetUsers,
     agentSetUserPassword,
     agentShutdown,
     ```

  2. Add schema imports (in the import from `'../schemas/vm-advanced.js'`, around line 496):
     ```typescript
     agentFileReadSchema,
     agentFileWriteSchema,
     agentGetHostnameSchema,
     agentGetUsersSchema,
     agentSetUserPasswordSchema,
     agentShutdownSchema,
     ```

  3. Add registry entries (after existing agent entries, around line 859):
     ```typescript
     proxmox_agent_file_read: { handler: agentFileRead, schema: agentFileReadSchema },
     proxmox_agent_file_write: { handler: agentFileWrite, schema: agentFileWriteSchema },
     proxmox_agent_get_hostname: { handler: agentGetHostname, schema: agentGetHostnameSchema },
     proxmox_agent_get_users: { handler: agentGetUsers, schema: agentGetUsersSchema },
     proxmox_agent_set_user_password: { handler: agentSetUserPassword, schema: agentSetUserPasswordSchema },
     proxmox_agent_shutdown: { handler: agentShutdown, schema: agentShutdownSchema },
     ```

  4. **Update tool count** (line 946): Change `230` to `236`:
     ```typescript
     if (registeredCount !== 236) {
       throw new Error(
         `Tool registry incomplete: expected 236 tools, got ${registeredCount}`
       );
     }
     ```

  **4c. `src/server.ts`** — Add tool descriptions:

  After existing agent descriptions (around line 240), add:
  ```typescript
    proxmox_agent_file_read: 'Read file content from guest via QEMU agent (requires elevated permissions)',
    proxmox_agent_file_write: 'Write content to file in guest via QEMU agent (requires elevated permissions)',
    proxmox_agent_get_hostname: 'Get hostname from guest via QEMU agent',
    proxmox_agent_get_users: 'Get list of logged-in users from guest via QEMU agent',
    proxmox_agent_set_user_password: 'Set user password in guest via QEMU agent (requires elevated permissions)',
    proxmox_agent_shutdown: 'Shutdown guest via QEMU agent (requires elevated permissions)',
  ```

  **Must NOT do**:
  - Don't modify any existing entries in these files
  - Don't change the structure of the registry or exports

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Wave 2)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/types/tools.ts:172-181` — Existing agent tool names
  - `src/tools/registry.ts:1-235` — Handler import block
  - `src/tools/registry.ts:238-496` — Schema import blocks
  - `src/tools/registry.ts:844-859` — Existing agent registry entries
  - `src/tools/registry.ts:945-950` — Tool count assertion
  - `src/server.ts:231-240` — Existing agent descriptions

  **Acceptance Criteria**:
  - [ ] `TOOL_NAMES` array has 236 entries: `grep -c "proxmox_" src/types/tools.ts` equals 236
  - [ ] Registry imports all 6 handlers and schemas: `grep -E "(agentFileRead|agentFileWrite|agentGetHostname|agentGetUsers|agentSetUserPassword|agentShutdown)" src/tools/registry.ts | wc -l` >= 12
  - [ ] Registry count updated: `grep "236" src/tools/registry.ts`
  - [ ] Server has 6 descriptions: `grep -c "proxmox_agent_" src/server.ts` increased by 6

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Tool names correctly registered
    Tool: Bash
    Preconditions: src/types/tools.ts modified
    Steps:
      1. Run: grep "proxmox_agent_file_read" src/types/tools.ts
      2. Assert: match found
      3. Run: grep "proxmox_agent_shutdown" src/types/tools.ts
      4. Assert: match found
    Expected Result: All 6 tool names present in TOOL_NAMES
    Evidence: grep outputs captured

  Scenario: Registry count updated to 236
    Tool: Bash
    Preconditions: src/tools/registry.ts modified
    Steps:
      1. Run: grep "expected 236" src/tools/registry.ts
      2. Assert: match found (not 230)
    Expected Result: Count assertion updated
    Evidence: grep output captured
  ```

  **Commit**: NO (grouped with Task 6)

---

- [ ] 5. Add unit tests — Add tests for 6 new handlers

  **What to do**:
  Add unit tests to `src/tools/vm-advanced.test.ts` for all 6 new handlers:

  ```typescript
  describe('agentFileRead', () => {
    it('should read file content from guest', async () => {
      const mockResponse = {
        content: Buffer.from('Hello, World!').toString('base64'),
        'bytes-read': 13,
      };
      mockClient.request.mockResolvedValue(mockResponse);

      const result = await agentFileRead(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/etc/hostname',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/file-read',
        'GET',
        { file: '/etc/hostname' }
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Hello, World!');
      expect(result.content[0].text).toContain('13');
    });

    it('should handle truncated files', async () => {
      const mockResponse = {
        content: Buffer.from('truncated...').toString('base64'),
        'bytes-read': 16777216,
        truncated: true,
      };
      mockClient.request.mockResolvedValue(mockResponse);

      const result = await agentFileRead(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/var/log/huge.log',
      });

      expect(result.content[0].text).toContain('truncated');
      expect(result.content[0].text).toContain('16 MiB');
    });

    it('should require elevated permissions', async () => {
      const restrictedConfig = { ...mockConfig, allowElevated: false };

      const result = await agentFileRead(mockClient, restrictedConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/etc/shadow',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission Denied');
    });
  });

  describe('agentFileWrite', () => {
    it('should write content to file in guest', async () => {
      mockClient.request.mockResolvedValue(null);

      const result = await agentFileWrite(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/tmp/test.txt',
        content: 'Hello, World!',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/file-write',
        'POST',
        {
          file: '/tmp/test.txt',
          content: Buffer.from('Hello, World!').toString('base64'),
          encode: true,
        }
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('successfully written');
    });

    it('should reject content larger than 60 KiB', async () => {
      const largeContent = 'x'.repeat(61441);

      const result = await agentFileWrite(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/tmp/large.txt',
        content: largeContent,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('too large');
      expect(result.content[0].text).toContain('60 KiB');
    });

    it('should require elevated permissions', async () => {
      const restrictedConfig = { ...mockConfig, allowElevated: false };

      const result = await agentFileWrite(mockClient, restrictedConfig, {
        node: 'pve1',
        vmid: 100,
        file: '/etc/config',
        content: 'data',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission Denied');
    });
  });

  describe('agentGetHostname', () => {
    it('should get hostname from guest', async () => {
      const mockResponse = { 'host-name': 'webserver01' };
      mockClient.request.mockResolvedValue(mockResponse);

      const result = await agentGetHostname(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-host-name'
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('webserver01');
    });
  });

  describe('agentGetUsers', () => {
    it('should list logged-in users', async () => {
      const mockResponse = [
        { user: 'root', 'login-time': 1609459200 },
        { user: 'admin', 'login-time': 1609462800, domain: 'WORKGROUP' },
      ];
      mockClient.request.mockResolvedValue(mockResponse);

      const result = await agentGetUsers(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-users'
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('root');
      expect(result.content[0].text).toContain('admin');
      expect(result.content[0].text).toContain('WORKGROUP');
    });

    it('should handle no logged-in users', async () => {
      mockClient.request.mockResolvedValue([]);

      const result = await agentGetUsers(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('No users currently logged in');
    });
  });

  describe('agentSetUserPassword', () => {
    it('should set user password', async () => {
      mockClient.request.mockResolvedValue(null);

      const result = await agentSetUserPassword(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
        username: 'testuser',
        password: 'newpassword123',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/set-user-password',
        'POST',
        {
          username: 'testuser',
          password: 'newpassword123',
          crypted: false,
        }
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('successfully updated');
    });

    it('should require elevated permissions', async () => {
      const restrictedConfig = { ...mockConfig, allowElevated: false };

      const result = await agentSetUserPassword(mockClient, restrictedConfig, {
        node: 'pve1',
        vmid: 100,
        username: 'testuser',
        password: 'newpassword123',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission Denied');
    });
  });

  describe('agentShutdown', () => {
    it('should shutdown guest via agent', async () => {
      mockClient.request.mockResolvedValue(null);

      const result = await agentShutdown(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/shutdown',
        'POST'
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Graceful shutdown');
    });

    it('should require elevated permissions', async () => {
      const restrictedConfig = { ...mockConfig, allowElevated: false };

      const result = await agentShutdown(mockClient, restrictedConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission Denied');
    });
  });
  ```

  **Must NOT do**:
  - Don't modify existing tests
  - Don't skip permission tests for elevated operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (with Task 6)
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/tools/vm-advanced.test.ts:1-50` — Test structure pattern
  - `src/tools/vm-advanced.test.ts:100-200` — Mock setup pattern

  **Acceptance Criteria**:
  - [ ] Tests added: `grep -c "describe('agent" src/tools/vm-advanced.test.ts` increased by 6
  - [ ] Tests pass: `bun test src/tools/vm-advanced.test.ts` exits with code 0
  - [ ] All elevated operations have permission tests

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Tests pass
    Tool: Bash
    Preconditions: Tests added to src/tools/vm-advanced.test.ts
    Steps:
      1. Run: bun test src/tools/vm-advanced.test.ts
      2. Assert: exit code 0
      3. Assert: output contains "pass" or test summary
    Expected Result: All tests pass
    Evidence: Test output captured
  ```

  **Commit**: NO (grouped with Task 6)

---

- [ ] 6. Build, verify, and commit

  **What to do**:
  1. Run `pnpm build` — must succeed with no errors
  2. Run `pnpm test` — all existing + new tests must pass
  3. Verify no TypeScript errors: `pnpm typecheck`
  4. Commit all changes

  **Must NOT do**:
  - Don't push to remote
  - Don't modify any files not listed in Tasks 1-5

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`
    - `git-master`: Atomic commit handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3, 4, 5

  **References**:
  - Task 1-5 outputs: All files created/modified
  - `package.json` — Build/test scripts

  **Acceptance Criteria**:
  - [ ] `pnpm build` exits with code 0
  - [ ] `pnpm test` exits with code 0 (all tests pass)
  - [ ] Commit exists with message: `feat: add qemu agent tools (file ops, user mgmt, shutdown)`
  - [ ] Commit includes exactly these files:
    - `src/validators/index.ts` (modified)
    - `src/validators/index.test.ts` (modified)
    - `src/schemas/vm-advanced.ts` (modified)
    - `src/tools/vm-advanced.ts` (modified)
    - `src/types/tools.ts` (modified)
    - `src/tools/registry.ts` (modified)
    - `src/server.ts` (modified)
    - `src/tools/vm-advanced.test.ts` (modified)
  - [ ] Working directory clean after commit: `git status --porcelain` is empty

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All files from Tasks 1-5 created/modified
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
    Expected Result: All existing + new tests pass
    Evidence: Test output captured

  Scenario: Commit includes all changes
    Tool: Bash
    Preconditions: Build and tests passed
    Steps:
      1. Run: git add -A && git commit -m "feat: add qemu agent tools (file ops, user mgmt, shutdown)"
      2. Run: git show --stat HEAD
      3. Assert: output contains "validators/index.ts"
      4. Assert: output contains "vm-advanced.ts" (2 files: schemas and tools)
      5. Assert: output contains "registry.ts"
      6. Assert: output contains "server.ts"
      7. Assert: output shows "8 files changed"
      8. Run: git status --porcelain
      9. Assert: output is empty
    Expected Result: Clean commit with all 8 files
    Evidence: git show --stat and git status output
  ```

  **Commit**: YES
  - Message: `feat: add qemu agent tools (file ops, user mgmt, shutdown)`
  - Files: 8 files (all modified)
  - Pre-commit: `pnpm build && pnpm test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 6 | `feat: add qemu agent tools (file ops, user mgmt, shutdown)` | 8 files (all modified) | `pnpm build && pnpm test` |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
pnpm build  # Expected: exit 0

# Tests pass
pnpm test  # Expected: exit 0, all tests pass

# Tool count correct
grep "expected 236" src/tools/registry.ts  # Expected: match

# New validators exist
grep "validateFilePath" src/validators/index.ts  # Expected: match
grep "validateUsername" src/validators/index.ts  # Expected: match

# New schemas exist
grep -c "export const agent.*Schema" src/schemas/vm-advanced.ts  # Expected: increased by 6

# New handlers exist
grep -c "export async function agent" src/tools/vm-advanced.ts  # Expected: increased by 6

# Registry has new tools
grep "proxmox_agent_file_read" src/tools/registry.ts  # Expected: match

# Descriptions exist
grep "proxmox_agent_file_read" src/server.ts  # Expected: match

# Clean git state
git status --porcelain  # Expected: empty after commit
```

### Final Checklist
- [ ] `src/validators/index.ts` modified with 2 new validators
- [ ] `src/validators/index.test.ts` modified with tests for 2 validators
- [ ] `src/schemas/vm-advanced.ts` modified with 6 new schemas
- [ ] `src/tools/vm-advanced.ts` modified with 6 new handlers
- [ ] `src/types/tools.ts` has 6 new tool names (total: 236)
- [ ] `src/tools/registry.ts` has 6 new entries, count updated to 236
- [ ] `src/server.ts` has 6 new tool descriptions
- [ ] `src/tools/vm-advanced.test.ts` modified with tests for 6 handlers
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
- [ ] Single commit with all 8 files
