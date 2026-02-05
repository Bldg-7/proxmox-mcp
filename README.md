# Proxmox MCP Server

> Model Context Protocol (MCP) server for Proxmox Virtual Environment

**English** | [한국어](README_ko.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A comprehensive MCP server providing 143 tools for managing Proxmox Virtual Environment, including QEMU VMs and LXC containers.

## Credits & Background

This project is a TypeScript rewrite of [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP), which itself was a Node.js port of the original Python implementation by [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP).

### What Changed

**Architecture**:
- 3,147-line single-file monolith → modular TypeScript across 30+ source files
- No type safety → strict TypeScript with `noUncheckedIndexedAccess`
- Hand-written JSON Schema → Zod schemas with automatic JSON Schema generation
- Giant switch statement (55 cases) → tool registry with handler/schema pairs

**Quality**:
- 0 tests → 405 tests (351 unit + 22 integration)
- No input validation → Zod runtime validation on every tool call
- Implicit error handling → structured MCP error responses with context
- No permission checks → two-tier permission model (basic / elevated)

**Developer Experience**:
- `npx @bldg-7/proxmox-mcp` just works
- All 143 tool descriptions exposed via MCP `ListTools`
- Rate limiter middleware included
- Pino structured logging instead of `console.log`

## Features

- **143 comprehensive tools** for Proxmox management
- **Full TypeScript implementation** with strict type safety
- **Support for both QEMU VMs and LXC containers**
- **Secure authentication** (API token)
- **Flexible SSL modes** (strict, verify, insecure)
- **Permission-based access control** (basic vs elevated operations)
- **Comprehensive error handling** with structured responses
- **Built on MCP SDK 1.25.3**

## Installation

```bash
npm install @bldg-7/proxmox-mcp
# or
pnpm add @bldg-7/proxmox-mcp
# or
yarn add @bldg-7/proxmox-mcp
```

## Configuration

### Environment Variables

Set the following environment variables before starting the server:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PROXMOX_HOST` | **Yes** | Proxmox server hostname or IP address | - |
| `PROXMOX_USER` | No | Username with realm (e.g., `root@pam`) | `root@pam` |
| `PROXMOX_TOKEN_NAME` | **Yes** | API token name | - |
| `PROXMOX_TOKEN_VALUE` | **Yes** | API token value | - |
| `PROXMOX_SSL_MODE` | No | SSL verification mode | `strict` |
| `PROXMOX_ALLOW_ELEVATED` | No | Allow elevated operations | `false` |
| `PROXMOX_PORT` | No | Proxmox API port | `8006` |

### SSL Modes

- **`strict`**: Full SSL certificate verification (recommended for production)
- **`verify`**: Verify SSL but allow self-signed certificates
- **`insecure`**: No SSL verification (development only, not recommended)

### Permission Model

The server implements a two-tier permission model:

- **Basic operations**: Read-only operations (list, get, status) - always allowed
- **Elevated operations**: Create, modify, delete operations - require `PROXMOX_ALLOW_ELEVATED=true`

This prevents accidental destructive operations and provides an additional safety layer.

## Usage

### Starting the Server

```bash
# With environment variables
export PROXMOX_HOST=pve.example.com
export PROXMOX_TOKEN_NAME=mytoken
export PROXMOX_TOKEN_VALUE=abc123-def456-ghi789
export PROXMOX_SSL_MODE=verify
export PROXMOX_ALLOW_ELEVATED=true

npx @bldg-7/proxmox-mcp
```

### Using with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx",
      "args": ["-y", "@bldg-7/proxmox-mcp"],
      "env": {
        "PROXMOX_HOST": "pve.example.com",
        "PROXMOX_TOKEN_NAME": "mytoken",
        "PROXMOX_TOKEN_VALUE": "abc123-def456-ghi789",
        "PROXMOX_SSL_MODE": "verify",
        "PROXMOX_ALLOW_ELEVATED": "true"
      }
    }
  }
}
```

## Available Tools

This server provides **143 comprehensive tools** for Proxmox management:

| Category | Tools | Permission |
|----------|-------|------------|
| Node & Cluster | 7 | Mixed |
| Node Management | 8 | Mixed |
| Cluster Management | 33 | Mixed |
| Storage Management | 12 | Mixed |
| VM Query | 5 | Basic |
| VM Lifecycle | 12 | Elevated 🔒 |
| VM Modify | 4 | Elevated 🔒 |
| VM/LXC Advanced | 26 | Mixed |
| Snapshots | 8 | Mixed |
| Backups | 6 | Elevated 🔒 |
| Disks | 8 | Elevated 🔒 |
| VM/LXC Network | 6 | Elevated 🔒 |
| Command Execution | 1 | Elevated 🔒 |
| VM Creation | 3 | Mixed |
| Node Disk Query | 4 | Basic |
| **Total** | **143** | |

📖 **[Full Tools Reference →](docs/TOOLS.md)**

## Error Handling

All tools return structured responses following the MCP protocol:

### Success Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ Operation completed successfully\n\n• Details here..."
    }
  ],
  "isError": false
}
```

### Error Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error: Operation failed\n\nReason: Detailed error message"
    }
  ],
  "isError": true
}
```

### Permission Denied
```json
{
  "content": [
    {
      "type": "text",
      "text": "🚫 Permission Denied: Operation requires elevated permissions\n\nSet PROXMOX_ALLOW_ELEVATED=true to enable this operation."
    }
  ],
  "isError": true
}
```

## Troubleshooting

### Connection Issues

**Problem**: `ECONNREFUSED` or connection timeout

**Solutions**:
- Verify `PROXMOX_HOST` is correct and reachable
- Check `PROXMOX_PORT` (default: 8006)
- Ensure firewall allows connections to Proxmox API port
- Try `PROXMOX_SSL_MODE=insecure` for testing (not recommended for production)

### Authentication Errors

**Problem**: `401 Unauthorized` or authentication failed

**Solutions**:
- Verify `PROXMOX_USER` includes realm if set (e.g., `root@pam`, not just `root`)
- Verify `PROXMOX_TOKEN_NAME` and `PROXMOX_TOKEN_VALUE` are valid
- Ensure API token has sufficient permissions in Proxmox

### SSL Certificate Errors

**Problem**: `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or SSL errors

**Solutions**:
- Use `PROXMOX_SSL_MODE=verify` for self-signed certificates
- Use `PROXMOX_SSL_MODE=insecure` for development (not recommended for production)
- Install proper SSL certificates on Proxmox server for production use

### Permission Denied Errors

**Problem**: `🚫 Permission Denied` for operations

**Solutions**:
- Set `PROXMOX_ALLOW_ELEVATED=true` to enable elevated operations
- Review which operations require elevated permissions (marked with 🔒)
- Ensure this is intentional - elevated operations can modify/delete resources

## Development

### Building from Source

```bash
git clone https://github.com/Bldg-7/proxmox-mcp.git
cd proxmox-mcp
pnpm install
pnpm build
```

### Running Tests

```bash
pnpm test              # Run tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Type Checking

```bash
pnpm typecheck         # Type check without emitting files
```

### Linting

```bash
pnpm lint              # Run ESLint
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Proxmox Virtual Environment](https://www.proxmox.com/en/proxmox-virtual-environment)

---

**Legend**: 🔒 = Requires elevated permissions (`PROXMOX_ALLOW_ELEVATED=true`)
