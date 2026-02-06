# Proxmox MCP Codebase

> Hierarchical knowledge base for AI agents working with the Proxmox MCP server codebase

---

## Overview

**Project**: Proxmox MCP Server  
**Purpose**: Model Context Protocol server providing 227 tools for Proxmox Virtual Environment management  
**Language**: TypeScript  
**Package**: `@bldg-7/proxmox-mcp`  
**Architecture**: Modular MCP server with tool registry, Zod validation, and Proxmox API client

### What This Project Does

Enables AI agents to manage Proxmox VE through the Model Context Protocol:
- **QEMU VMs**: Create, configure, lifecycle management, snapshots, backups
- **LXC Containers**: Create, configure, lifecycle management
- **Cluster**: HA, replication, migration, backup jobs
- **Storage**: Management, content listing, file operations
- **Networking**: Interfaces, bridges, VLANs, SDN
- **Access Control**: Users, groups, roles, ACLs, domains
- **Ceph**: Storage cluster management
- **Monitoring**: Nodes, services, tasks, logs

---

## Directory Structure

```
proxmox-mcp/
├── src/                    # Source code
│   ├── api/               # Proxmox API client
│   │   └── client.ts      # HTTP client with form-encoding
│   ├── schemas/           # Zod validation schemas
│   │   ├── vm.ts          # VM-related schemas
│   │   ├── lxc.ts         # LXC-related schemas
│   │   ├── cluster.ts     # Cluster schemas
│   │   ├── storage.ts     # Storage schemas
│   │   └── ...            # Other domain schemas
│   ├── tools/             # Tool implementations
│   │   ├── registry.ts    # Tool registry (single source of truth)
│   │   ├── vm-lifecycle.ts
│   │   ├── vm-query.ts
│   │   ├── lxc.ts
│   │   ├── cluster.ts
│   │   ├── storage.ts
│   │   └── ...            # Other tool modules
│   ├── server.ts          # MCP server entry point
│   └── index.ts           # Package entry point
├── scripts/               # Build and documentation scripts
│   ├── extract-tool-docs.ts  # Automated doc generation
│   ├── tool-docs.json        # Generated tool data
│   └── tool-docs.md          # Generated markdown
├── docs/                  # Documentation
│   ├── TOOLS.md           # Complete tool reference
│   └── skills/            # AI-optimized documentation
│       ├── proxmox-mcp.md
│       ├── proxmox-workflows.md
│       └── proxmox-troubleshooting.md
├── tests/                 # Test files (co-located with source)
└── package.json           # Project configuration
```

---

## Key Files

### `src/server.ts`
**Purpose**: MCP server entry point  
**Responsibilities**:
- Initialize MCP server
- Register all tools from registry
- Define tool descriptions (TOOL_DESCRIPTIONS map)
- Handle tool execution requests
- Manage environment variables and configuration

**Key Exports**:
- `TOOL_DESCRIPTIONS`: Map of tool names to descriptions
- MCP server instance

---

### `src/tools/registry.ts`
**Purpose**: Single source of truth for all tools  
**Responsibilities**:
- Register all 227 tools with handlers and schemas
- Export TOOL_REGISTRY map
- Provide type-safe tool registration

**Structure**:
```typescript
export const TOOL_REGISTRY = {
  proxmox_get_nodes: {
    handler: getNodes,
    schema: GetNodesSchema
  },
  // ... 226 more tools
};
```

**Usage**: All tools MUST be registered here. This is the authoritative list.

---

### `src/api/client.ts`
**Purpose**: Proxmox API HTTP client  
**Responsibilities**:
- Handle authentication (API tokens)
- Convert JSON to form-encoded format for POST/PUT
- Move params to query string for DELETE
- Handle SSL modes (strict/verify/insecure)
- Rate limiting
- Error handling

**Key Functions**:
- `get(path, params)`: GET requests
- `post(path, data)`: POST requests (auto form-encodes)
- `put(path, data)`: PUT requests (auto form-encodes)
- `delete(path, params)`: DELETE requests (params in query string)

**Critical Implementation Details**:
- POST/PUT use `application/x-www-form-urlencoded` (Proxmox requirement)
- DELETE params go in URL query string, not body
- Handles Proxmox's 500-instead-of-404 quirk

---

### `src/schemas/*.ts`
**Purpose**: Zod validation schemas for tool parameters  
**Organization**: Grouped by domain (vm, lxc, cluster, storage, etc.)

**Pattern**:
```typescript
import { z } from 'zod';

export const CreateVMSchema = z.object({
  node: z.string().describe('Node name'),
  vmid: z.number().describe('VM ID'),
  name: z.string().optional().describe('VM name'),
  // ... more fields
});

export type CreateVMParams = z.infer<typeof CreateVMSchema>;
```

**Usage**: Every tool has a corresponding Zod schema for runtime validation.

---

### `scripts/extract-tool-docs.ts`
**Purpose**: Automated documentation generation  
**How It Works**:
1. Imports TOOL_REGISTRY from `src/tools/registry.ts`
2. Imports TOOL_DESCRIPTIONS from `src/server.ts`
3. Parses Zod schemas to extract parameter info
4. Generates `scripts/tool-docs.json` (structured data)
5. Generates `scripts/tool-docs.md` (markdown template)

**Output**: Used by skills documentation to ensure accuracy.

---

## Architecture Decisions

### Tool Registry Pattern

**Decision**: Centralized tool registry in `src/tools/registry.ts`

**Rationale**:
- Single source of truth for all tools
- Type-safe tool registration
- Easy to add new tools
- Enables automated documentation generation
- Prevents tool name collisions

**How to Add a New Tool**:
1. Create handler function in appropriate `src/tools/*.ts` file
2. Create Zod schema in appropriate `src/schemas/*.ts` file
3. Register in `src/tools/registry.ts`
4. Add description to `TOOL_DESCRIPTIONS` in `src/server.ts`
5. Run `bun run scripts/extract-tool-docs.ts` to update docs

---

### Zod Validation

**Decision**: Use Zod for runtime parameter validation

**Rationale**:
- Type safety at runtime, not just compile time
- Automatic TypeScript type inference
- Rich validation rules (min/max, regex, custom validators)
- Clear error messages for invalid parameters
- Schema introspection for documentation generation

**Pattern**:
```typescript
// Define schema
const schema = z.object({
  node: z.string(),
  vmid: z.number().min(100)
});

// Infer TypeScript type
type Params = z.infer<typeof schema>;

// Validate at runtime
const result = schema.safeParse(input);
if (!result.success) {
  // Handle validation errors
}
```

---

### Permission Model

**Decision**: Two-tier permission system (basic/elevated)

**Rationale**:
- Prevents accidental destructive operations
- Clear separation of read-only vs write operations
- Explicit opt-in for elevated operations via environment variable
- Easy to audit which operations are destructive

**Implementation**:
- **Basic tools**: Always allowed, no env var needed
- **Elevated tools**: Require `PROXMOX_ALLOW_ELEVATED=true`
- Permission level derived from tool description text

**Breakdown**:
- 86 basic tools (read-only)
- 141 elevated tools (create/modify/delete)

---

### Form-Encoded POST/PUT

**Decision**: Automatically convert JSON to form-encoded format

**Rationale**:
- Proxmox API requires `application/x-www-form-urlencoded`
- MCP protocol uses JSON
- Client handles conversion transparently
- Tools don't need to know about encoding

**Implementation**: See `src/api/client.ts` - `post()` and `put()` methods.

---

## Development Patterns

### Adding a New Tool

**Step-by-Step**:

1. **Create Handler Function** (`src/tools/[domain].ts`):
```typescript
export async function createVM(params: CreateVMParams): Promise<ToolResponse> {
  const client = getProxmoxClient();
  const result = await client.post(`/api2/json/nodes/${params.node}/qemu`, params);
  return {
    content: [{ type: 'text', text: `✅ VM ${params.vmid} created` }],
    isError: false
  };
}
```

2. **Create Schema** (`src/schemas/vm.ts`):
```typescript
export const CreateVMSchema = z.object({
  node: z.string().describe('Node name'),
  vmid: z.number().describe('VM ID'),
  name: z.string().optional().describe('VM name')
});

export type CreateVMParams = z.infer<typeof CreateVMSchema>;
```

3. **Register Tool** (`src/tools/registry.ts`):
```typescript
import { createVM } from './vm-lifecycle';
import { CreateVMSchema } from '../schemas/vm';

export const TOOL_REGISTRY = {
  // ... existing tools
  proxmox_create_vm: {
    handler: createVM,
    schema: CreateVMSchema
  }
};
```

4. **Add Description** (`src/server.ts`):
```typescript
export const TOOL_DESCRIPTIONS = {
  // ... existing descriptions
  proxmox_create_vm: 'Create a new QEMU virtual machine (requires elevated permissions)'
};
```

5. **Update Documentation**:
```bash
bun run scripts/extract-tool-docs.ts
```

6. **Write Tests** (`src/tools/vm-lifecycle.test.ts`):
```typescript
describe('createVM', () => {
  it('should create VM with valid parameters', async () => {
    // Test implementation
  });
});
```

---

### Schema Conventions

**Required vs Optional**:
```typescript
z.string()              // Required
z.string().optional()   // Optional
```

**Descriptions** (used in documentation):
```typescript
z.string().describe('Node name where VM is located')
```

**Validation Rules**:
```typescript
z.number().min(100).max(999999)  // VMID range
z.string().regex(/^[a-z0-9-]+$/) // Hostname format
z.enum(['strict', 'verify', 'insecure'])  // SSL modes
```

**Nested Objects**:
```typescript
z.object({
  node: z.string(),
  config: z.object({
    memory: z.number(),
    cores: z.number()
  })
})
```

---

### Error Handling Pattern

**Standard Response Format**:
```typescript
// Success
return {
  content: [{ type: 'text', text: '✅ Operation successful\n\n• Details...' }],
  isError: false
};

// Error
return {
  content: [{ type: 'text', text: '❌ Error: Operation failed\n\nReason: ...' }],
  isError: true
};

// Permission Denied
return {
  content: [{ type: 'text', text: '🚫 Permission Denied: ...' }],
  isError: true
};
```

**Try-Catch Pattern**:
```typescript
try {
  const result = await client.post(endpoint, params);
  return successResponse(result);
} catch (error) {
  return errorResponse(error);
}
```

---

### Testing Patterns

**Unit Tests** (handler logic):
```typescript
describe('toolName', () => {
  it('should handle valid input', async () => {
    const result = await handler(validParams);
    expect(result.isError).toBe(false);
  });

  it('should reject invalid input', async () => {
    const result = schema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });
});
```

**Integration Tests** (API calls):
```typescript
describe('toolName integration', () => {
  it('should call correct API endpoint', async () => {
    // Mock API client
    // Call handler
    // Verify endpoint and params
  });
});
```

---

## Code Quality Standards

### TypeScript Configuration

- **Strict mode**: Enabled
- **noUncheckedIndexedAccess**: Enabled (prevents undefined access)
- **Target**: ES2022
- **Module**: ESNext

### Linting

- ESLint with TypeScript rules
- Prettier for formatting
- Pre-commit hooks enforce standards

### Testing

- **Framework**: Bun test
- **Coverage**: 405 tests (351 unit + 22 integration)
- **Target**: >80% coverage
- **Run**: `bun test`

---

## Build and Development

### Commands

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Generate documentation
bun run scripts/extract-tool-docs.ts

# Lint
bun run lint
```

### Development Workflow

1. Create feature branch
2. Implement changes (handler + schema + registry + description)
3. Write tests
4. Run `bun test` and `bun run typecheck`
5. Update documentation: `bun run scripts/extract-tool-docs.ts`
6. Commit with conventional commit message
7. Create pull request

---

## Environment Variables

### Required

- `PROXMOX_HOST`: Proxmox server hostname/IP
- `PROXMOX_TOKEN_NAME`: API token name
- `PROXMOX_TOKEN_VALUE`: API token value

### Optional

- `PROXMOX_USER`: Username with realm (default: `root@pam`)
- `PROXMOX_SSL_MODE`: SSL verification mode (default: `strict`)
- `PROXMOX_ALLOW_ELEVATED`: Allow elevated operations (default: `false`)
- `PROXMOX_PORT`: API port (default: `8006`)

---

## Dependencies

### Core

- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `zod`: Runtime validation
- `axios`: HTTP client

### Development

- `typescript`: Type system
- `@types/node`: Node.js types
- `bun`: Runtime and test framework
- `eslint`: Linting
- `prettier`: Formatting

---

## Related Documentation

- **Tools Reference**: `docs/TOOLS.md` - Complete list of 227 tools
- **Skills Documentation**: `docs/skills/proxmox-mcp.md` - AI-optimized reference
- **Workflows**: `docs/skills/proxmox-workflows.md` - Common patterns
- **Troubleshooting**: `docs/skills/proxmox-troubleshooting.md` - API quirks and solutions
- **README**: `README.md` - User-facing documentation

---

## Contributing

See `CONTRIBUTING.md` for guidelines on:
- Code style
- Commit message format
- Pull request process
- Testing requirements
