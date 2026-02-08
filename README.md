# Proxmox MCP Server

> Model Context Protocol (MCP) server for Proxmox Virtual Environment

**English** | [한국어](README_ko.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A comprehensive MCP server providing 307 tools for managing Proxmox Virtual Environment, including QEMU VMs and LXC containers.

## Credits & Background

This project is a TypeScript rewrite of [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP), which itself was a Node.js port of the original Python implementation by [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP).

### What Changed

**Architecture**:
- 3,147-line single-file monolith → modular TypeScript across 110+ source files
- No type safety → strict TypeScript with `noUncheckedIndexedAccess`
- Hand-written JSON Schema → Zod schemas with automatic JSON Schema generation
- Giant switch statement (55 cases) → tool registry with handler/schema pairs

**Quality**:
- 0 tests → 808 tests
- No input validation → Zod runtime validation on every tool call
- Implicit error handling → structured MCP error responses with context
- No permission checks → two-tier permission model (basic / elevated)

**Developer Experience**:
- `npx @bldg-7/proxmox-mcp` just works
- All 307 tool descriptions exposed via MCP `ListTools`
- Rate limiter middleware included
- Pino structured logging instead of `console.log`

## Features

- **307 comprehensive tools** for Proxmox management
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

This server provides **307 comprehensive tools** for Proxmox management:

| Category | Tools | Permission |
|----------|-------|------------|
| Node & Cluster | 7 | Mixed |
| Node Management | 8 | Mixed |
| System Operations | 20 | Mixed |
| Node Network Config | 4 | Elevated 🔒 |
| Cluster Management | 54 | Mixed |
| Storage Management | 12 | Mixed |
| Access Control | 25 | Mixed |
| Pool Management | 5 | Mixed |
| SDN Networking | 20 | Mixed |
| Ceph | 16 | Mixed |
| VM Query | 9 | Basic |
| VM Lifecycle | 12 | Elevated 🔒 |
| VM Modify | 4 | Elevated 🔒 |
| VM/LXC Advanced | 30 | Mixed |
| Snapshots | 8 | Mixed |
| Backups | 6 | Elevated 🔒 |
| Disks | 16 | Mixed |
| VM/LXC Network | 6 | Elevated 🔒 |
| Console Access | 5 | Elevated 🔒 |
| Command Execution | 1 | Elevated 🔒 |
| VM Creation | 6 | Mixed |
| Certificates | 7 | Mixed |
| ACME | 8 | Mixed |
| Notifications | 5 | Mixed |
| **Total** | **307** | |

📖 **[Full Tools Reference →](docs/TOOLS.md)**

## Agent Skills

This package includes **Agent Skills** - AI-optimized documentation that teaches agents how to use Proxmox MCP tools and operational best practices. Skills follow the [agentskills.io](https://agentskills.io) open standard and work across multiple AI agent platforms.

### Available Skills

| Skill | Description | Tools/Topics |
|-------|-------------|--------------|
| **proxmox-mcp-tools** | Complete MCP tool reference for Proxmox VE | 307 tools across 14 domains (VMs, LXC, cluster, storage, networking, Ceph, certificates, ACME, notifications) |
| **proxmox-admin** | Operational expertise for Proxmox infrastructure | VM lifecycle, storage management, HA configuration, troubleshooting |

### Installation

**For Agent Skills Standard** (Claude Code, OpenCode, Cursor, Codex, Gemini CLI, VS Code):
```bash
npx skills add Bldg-7/proxmox-mcp
```

**For Claude Code Plugin**:
```bash
/plugin marketplace add Bldg-7/proxmox-mcp
```

### Supported Agents

- **Claude Code** - Anthropic's official CLI
- **OpenCode** - Open-source Claude Code alternative
- **Cursor** - AI-powered code editor
- **Codex** - GitHub Copilot CLI
- **Gemini CLI** - Google's AI assistant
- **VS Code** - With agent skills extensions

Skills provide progressive disclosure: metadata (~100 tokens) → instructions (<5000 tokens) → detailed references (on demand).

### How Skills Work

Once installed, skills are automatically loaded into the agent's context. The agent learns Proxmox tool usage, workflows, and best practices — so you can give natural language instructions and the agent translates them into the right MCP tool calls.

**Example — Creating a VM** (agent uses `proxmox-mcp-tools` skill):
```
You: "Create an Ubuntu VM with 4 cores, 8GB RAM, and 50GB disk on pve1"

Agent knows the workflow from the skill:
  1. proxmox_get_next_vmid        → gets available VM ID (e.g., 105)
  2. proxmox_create_vm            → creates VM 105 with 4 cores, 8GB RAM
  3. proxmox_add_disk_vm          → attaches 50GB virtio disk
  4. proxmox_add_network_vm       → adds network interface on vmbr0
  5. proxmox_start_vm             → powers on the VM
```

**Example — Setting up HA** (agent uses `proxmox-admin` skill):
```
You: "Make VM 100 highly available"

Agent knows the operational playbook:
  1. proxmox_get_ha_groups        → checks existing HA groups
  2. proxmox_create_ha_resource   → adds VM 100 to HA with priority
  3. proxmox_get_ha_status        → verifies HA is active
```

**Example — Troubleshooting** (agent uses both skills together):
```
You: "VM 100 won't start, help me figure out why"

Agent combines tool knowledge + operational expertise:
  1. proxmox_get_vm_status        → checks current state
  2. proxmox_get_vm_config        → reviews configuration
  3. proxmox_get_node_status      → checks node resource availability
  4. proxmox_get_node_tasks       → finds recent failed tasks
  → Diagnoses: "Node pve1 has insufficient memory. VM requires 8GB but only 2GB free."
  → Suggests: resize VM memory, migrate to another node, or free resources
```

### Skill Contents

**proxmox-mcp-tools** — Tool Reference:
- 307 tools organized into 14 domains (VMs, LXC, cluster, storage, networking, Ceph, access control, pools, certificates, ACME, notifications)
- Parameters, types, and descriptions for every tool
- Permission levels (basic vs elevated 🔒)
- Common workflow patterns (create VM, backup/restore, clone, migrate)

**proxmox-admin** — Operational Expertise:
- VM & LXC lifecycle playbooks (create → configure → monitor → backup → decommission)
- Storage management strategies (Ceph, NFS, LVM, ZFS)
- HA configuration and failover procedures
- Troubleshooting guides for common API quirks
- Security best practices (permission model, token management)
- Performance monitoring and optimization

## SubAgents

This package includes **SubAgents** - specialized AI agents for executing domain-specific Proxmox operations. While Skills provide knowledge ("here are the tools and how to use them"), SubAgents provide action ("I'll do this for you"). SubAgents automatically load the relevant skills and execute operations using MCP tools.

### Available SubAgents

| SubAgent | Domain | Description |
|----------|--------|-------------|
| **vm-manager** | QEMU VMs | VM lifecycle management (create, configure, start/stop, snapshots, backups, cloning, templates) |
| **lxc-manager** | LXC Containers | Container lifecycle management (create, configure, mount points, snapshots, backups, cloning) |
| **cluster-admin** | Cluster Operations | High availability, VM/LXC migration, replication jobs, cluster firewall, cluster backup jobs |
| **storage-admin** | Storage Infrastructure | Storage backends (NFS, iSCSI, Ceph), ISO/template management, backup pruning, disk operations |
| **network-admin** | Network Infrastructure | SDN (VNets, zones, controllers, subnets), node network interfaces, DNS configuration |
| **access-admin** | Access Control | Users, groups, roles, ACLs, authentication domains (PAM, LDAP, AD) |
| **monitor** | Monitoring | Read-only health checks, status monitoring, log analysis, task tracking (delegates actions to other agents) |

### How SubAgents Work

SubAgents use **auto-delegation** in Claude Code and compatible platforms:

1. **User makes request**: "Create a new Ubuntu VM with 4 cores and 8GB RAM"
2. **Claude analyzes request**: Matches request to vm-manager agent based on example blocks
3. **Auto-delegates**: Invokes vm-manager agent with full context
4. **Agent executes**: vm-manager loads skills, calls MCP tools, completes operation
5. **Returns result**: Structured response with operation details

### Prerequisites

- **MCP Server**: The Proxmox MCP server must be connected and configured
- **Skills**: SubAgents automatically load `proxmox-mcp-tools` and `proxmox-admin` skills
- **Permissions**: Elevated operations require `PROXMOX_ALLOW_ELEVATED=true` in MCP server config

### Installation

SubAgents are included when you install the plugin:

**For Claude Code Plugin**:
```bash
/plugin marketplace add Bldg-7/proxmox-mcp
```

**For Agent Skills Standard** (if supported):
```bash
npx skills add Bldg-7/proxmox-mcp
```

### Usage Examples

**Create a VM** (auto-delegates to vm-manager):
```
User: "Create a new Ubuntu VM with 4 cores, 8GB RAM, and a 50GB disk on node pve1"
→ vm-manager executes: get next VMID → create VM → add disk → add network → start
```

**Enable HA** (auto-delegates to cluster-admin):
```
User: "Enable high availability for VM 100 with priority 100"
→ cluster-admin executes: check HA config → add HA resource → verify
```

**Monitor cluster** (auto-delegates to monitor):
```
User: "Show me the current cluster status and any issues"
→ monitor executes: get cluster status → get HA status → get nodes → report
```

### Agent Domain Boundaries

Each SubAgent has clear responsibilities to avoid overlap:

- **vm-manager**: Only QEMU VMs (not LXC). Delegates cluster ops to cluster-admin.
- **lxc-manager**: Only LXC containers (not VMs). Delegates cluster ops to cluster-admin.
- **cluster-admin**: Cluster-wide operations (HA, firewall aliases/ipsets, cluster config, notifications). Delegates per-VM/LXC ops to respective managers.
- **storage-admin**: Storage infrastructure, certificate management, ACME configuration, advanced disk operations. Delegates VM disk operations to vm-manager.
- **network-admin**: Network infrastructure only. Delegates per-VM/LXC NICs to respective managers.
- **access-admin**: Access control including API token management. No delegation to other agents.
- **monitor**: Read-only monitoring including node metrics/RRD data. Delegates ALL actions to appropriate agents.

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
