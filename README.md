# Proxmox MCP Server

> Model Context Protocol (MCP) server for Proxmox Virtual Environment

**English** | [한국어](README_ko.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A comprehensive MCP server providing 55 tools for managing Proxmox Virtual Environment, including QEMU VMs and LXC containers.

## Credits & Background

This project is a TypeScript rewrite of [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP), which itself was a Node.js port of the original Python implementation by [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP).

### What Changed

**Architecture**:
- 3,147-line single-file monolith → modular TypeScript across 30+ source files
- No type safety → strict TypeScript with `noUncheckedIndexedAccess`
- Hand-written JSON Schema → Zod schemas with automatic JSON Schema generation
- Giant switch statement (55 cases) → tool registry with handler/schema pairs

**Quality**:
- 0 tests → 373 tests (351 unit + 22 integration)
- No input validation → Zod runtime validation on every tool call
- Implicit error handling → structured MCP error responses with context
- No permission checks → two-tier permission model (basic / elevated)

**Developer Experience**:
- `npx @bldg-7/proxmox-mcp` just works
- All 55 tool descriptions exposed via MCP `ListTools`
- Rate limiter middleware included
- Pino structured logging instead of `console.log`

## Features

- **55 comprehensive tools** for Proxmox management
- **Full TypeScript implementation** with strict type safety
- **Support for both QEMU VMs and LXC containers**
- **Secure authentication** (password + API token)
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
| `PROXMOX_USER` | **Yes** | Username with realm (e.g., `root@pam`) | - |
| `PROXMOX_PASSWORD` | **Yes** | User password | - |
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
export PROXMOX_USER=root@pam
export PROXMOX_PASSWORD=your-password
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
        "PROXMOX_USER": "root@pam",
        "PROXMOX_PASSWORD": "your-password",
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

### Node & Cluster Management (4 tools)

#### `proxmox_get_nodes`
List all Proxmox cluster nodes with their status and resources.

**Parameters**: None

**Example**:
```json
{}
```

#### `proxmox_get_node_status` 🔒
Get detailed status information for a specific Proxmox node.

**Parameters**:
- `node` (string): Node name

**Example**:
```json
{
  "node": "pve1"
}
```

#### `proxmox_get_cluster_status`
Get overall cluster status including nodes and resource usage.

**Parameters**: None

**Example**:
```json
{}
```

#### `proxmox_get_next_vmid`
Get the next available VM/Container ID number.

**Parameters**: None

**Example**:
```json
{}
```

---

### VM Query (3 tools)

#### `proxmox_get_vms`
List all virtual machines across the cluster with their status.

**Parameters**:
- `node` (string, optional): Filter by specific node
- `type` (string, optional): Filter by type (`qemu` or `lxc`)

**Example**:
```json
{
  "node": "pve1",
  "type": "qemu"
}
```

#### `proxmox_get_vm_status`
Get detailed status information for a specific VM.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM/Container ID
- `type` (string): VM type (`qemu` or `lxc`)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "type": "qemu"
}
```

#### `proxmox_get_storage`
List all storage pools and their usage across the cluster.

**Parameters**:
- `node` (string, optional): Filter by specific node

**Example**:
```json
{
  "node": "pve1"
}
```

---

### VM Lifecycle (12 tools) 🔒

All lifecycle operations require elevated permissions.

#### `proxmox_start_lxc` 🔒
Start an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100
}
```

#### `proxmox_start_vm` 🔒
Start a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101
}
```

#### `proxmox_stop_lxc` 🔒
Stop an LXC container (forceful).

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

#### `proxmox_stop_vm` 🔒
Stop a QEMU virtual machine (forceful).

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_shutdown_lxc` 🔒
Gracefully shutdown an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

#### `proxmox_shutdown_vm` 🔒
Gracefully shutdown a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_reboot_lxc` 🔒
Reboot an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

#### `proxmox_reboot_vm` 🔒
Reboot a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_pause_vm` 🔒
Pause a QEMU virtual machine (suspend to RAM).

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_resume_vm` 🔒
Resume a paused QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_delete_lxc` 🔒
Delete an LXC container permanently.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

#### `proxmox_delete_vm` 🔒
Delete a QEMU virtual machine permanently.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

---

### VM Modify (4 tools) 🔒

#### `proxmox_clone_lxc` 🔒
Clone an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Source container ID
- `newid` (number): New container ID
- `hostname` (string, optional): New hostname

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "newid": 200,
  "hostname": "cloned-container"
}
```

#### `proxmox_clone_vm` 🔒
Clone a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Source VM ID
- `newid` (number): New VM ID
- `name` (string, optional): New VM name

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "newid": 201,
  "name": "cloned-vm"
}
```

#### `proxmox_resize_lxc` 🔒
Resize an LXC container CPU/memory.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `memory` (number, optional): Memory in MB
- `cores` (number, optional): Number of CPU cores

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "memory": 2048,
  "cores": 2
}
```

#### `proxmox_resize_vm` 🔒
Resize a QEMU VM CPU/memory.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `memory` (number, optional): Memory in MB
- `cores` (number, optional): Number of CPU cores

---

### Snapshots (8 tools)

#### `proxmox_create_snapshot_lxc` 🔒
Create a snapshot of an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `snapname` (string): Snapshot name
- `description` (string, optional): Snapshot description

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "snapname": "before-update",
  "description": "Snapshot before system update"
}
```

#### `proxmox_create_snapshot_vm` 🔒
Create a snapshot of a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `snapname` (string): Snapshot name
- `description` (string, optional): Snapshot description

#### `proxmox_list_snapshots_lxc`
List all snapshots of an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100
}
```

#### `proxmox_list_snapshots_vm`
List all snapshots of a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID

#### `proxmox_rollback_snapshot_lxc` 🔒
Rollback an LXC container to a snapshot.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `snapname` (string): Snapshot name

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "snapname": "before-update"
}
```

#### `proxmox_rollback_snapshot_vm` 🔒
Rollback a QEMU virtual machine to a snapshot.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `snapname` (string): Snapshot name

#### `proxmox_delete_snapshot_lxc` 🔒
Delete a snapshot of an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `snapname` (string): Snapshot name

#### `proxmox_delete_snapshot_vm` 🔒
Delete a snapshot of a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `snapname` (string): Snapshot name

---

### Backups (6 tools) 🔒

All backup operations require elevated permissions.

#### `proxmox_create_backup_lxc` 🔒
Create a backup of an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `storage` (string, optional): Storage name (default: `local`)
- `mode` (string, optional): Backup mode: `snapshot`, `suspend`, `stop` (default: `snapshot`)
- `compress` (string, optional): Compression: `none`, `lzo`, `gzip`, `zstd` (default: `zstd`)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "storage": "backup-storage",
  "mode": "snapshot",
  "compress": "zstd"
}
```

#### `proxmox_create_backup_vm` 🔒
Create a backup of a QEMU virtual machine.

**Parameters**: Same as `proxmox_create_backup_lxc`

#### `proxmox_list_backups` 🔒
List all backups on a storage.

**Parameters**:
- `node` (string): Node name
- `storage` (string): Storage name

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-storage"
}
```

#### `proxmox_restore_backup_lxc` 🔒
Restore an LXC container from backup.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): New container ID
- `archive` (string): Backup archive path (e.g., `local:backup/vzdump-lxc-100-...`)
- `storage` (string, optional): Target storage for restored container

**Example**:
```json
{
  "node": "pve1",
  "vmid": 300,
  "archive": "local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst",
  "storage": "local-lvm"
}
```

#### `proxmox_restore_backup_vm` 🔒
Restore a QEMU virtual machine from backup.

**Parameters**: Same as `proxmox_restore_backup_lxc`

#### `proxmox_delete_backup` 🔒
Delete a backup file from storage.

**Parameters**:
- `node` (string): Node name
- `storage` (string): Storage name
- `volume` (string): Volume ID (e.g., `local:backup/vzdump-lxc-100-...`)

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "volume": "local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst"
}
```

---

### Disks (8 tools) 🔒

All disk operations require elevated permissions.

#### `proxmox_add_disk_vm` 🔒
Add a new disk to a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `disk` (string): Disk ID (e.g., `scsi0`, `virtio0`, `sata0`, `ide0`)
- `storage` (string): Storage name
- `size` (string): Disk size (e.g., `10` for 10GB)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi1",
  "storage": "local-lvm",
  "size": "50"
}
```

#### `proxmox_add_mountpoint_lxc` 🔒
Add a mount point to an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `mp` (string): Mount point ID (e.g., `mp0`, `mp1`)
- `storage` (string): Storage name
- `size` (string): Size (e.g., `10` for 10GB)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "mp": "mp0",
  "storage": "local-lvm",
  "size": "20"
}
```

#### `proxmox_resize_disk_vm` 🔒
Resize a QEMU VM disk (expansion only).

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `disk` (string): Disk ID
- `size` (string): New size (e.g., `+10G` to add 10GB, or `50G` for absolute size)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi0",
  "size": "+20G"
}
```

#### `proxmox_resize_disk_lxc` 🔒
Resize an LXC container disk or mount point (expansion only).

**Parameters**: Same as `proxmox_resize_disk_vm`

#### `proxmox_remove_disk_vm` 🔒
Remove a disk from a QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `disk` (string): Disk ID

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi1"
}
```

#### `proxmox_remove_mountpoint_lxc` 🔒
Remove a mount point from an LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `mp` (string): Mount point ID

#### `proxmox_move_disk_vm` 🔒
Move a QEMU VM disk to different storage.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `disk` (string): Disk ID
- `storage` (string): Target storage name
- `delete` (boolean, optional): Delete source after move (default: `true`)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi0",
  "storage": "fast-ssd",
  "delete": true
}
```

#### `proxmox_move_disk_lxc` 🔒
Move an LXC container disk to different storage.

**Parameters**: Same as `proxmox_move_disk_vm`

---

### Network (6 tools) 🔒

All network operations require elevated permissions.

#### `proxmox_add_network_vm` 🔒
Add network interface to QEMU VM.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `net` (string): Network interface ID (e.g., `net0`, `net1`)
- `bridge` (string): Bridge name (e.g., `vmbr0`)
- `model` (string, optional): Network model: `virtio`, `e1000`, `rtl8139`, `vmxnet3`
- `macaddr` (string, optional): MAC address
- `tag` (number, optional): VLAN tag
- `firewall` (boolean, optional): Enable firewall

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "net": "net1",
  "bridge": "vmbr0",
  "model": "virtio",
  "tag": 100,
  "firewall": true
}
```

#### `proxmox_add_network_lxc` 🔒
Add network interface to LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `net` (string): Network interface ID (e.g., `net0`, `net1`)
- `bridge` (string): Bridge name
- `ip` (string, optional): IP address with CIDR (e.g., `192.168.1.100/24`) or `dhcp`
- `gw` (string, optional): Gateway IP
- `firewall` (boolean, optional): Enable firewall

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "net": "net1",
  "bridge": "vmbr0",
  "ip": "192.168.1.100/24",
  "gw": "192.168.1.1",
  "firewall": true
}
```

#### `proxmox_update_network_vm` 🔒
Update/modify VM network interface configuration.

**Parameters**: Same as `proxmox_add_network_vm` (updates existing interface)

#### `proxmox_update_network_lxc` 🔒
Update/modify LXC network interface configuration.

**Parameters**: Same as `proxmox_add_network_lxc` (updates existing interface)

#### `proxmox_remove_network_vm` 🔒
Remove network interface from QEMU VM.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `net` (string): Network interface ID

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "net": "net1"
}
```

#### `proxmox_remove_network_lxc` 🔒
Remove network interface from LXC container.

**Parameters**: Same as `proxmox_remove_network_vm`

---

### Command Execution (1 tool) 🔒

#### `proxmox_execute_vm_command` 🔒
Execute a shell command on a virtual machine via Proxmox API.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM/Container ID
- `type` (string): VM type (`qemu` or `lxc`)
- `command` (string): Shell command to execute

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "type": "qemu",
  "command": "uptime"
}
```

**Note**: Command validation blocks potentially dangerous characters for security.

---

### VM Creation (3 tools)

#### `proxmox_list_templates`
List available LXC container templates on a storage.

**Parameters**:
- `node` (string): Node name
- `storage` (string): Storage name

**Example**:
```json
{
  "node": "pve1",
  "storage": "local"
}
```

#### `proxmox_create_lxc` 🔒
Create a new LXC container.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): Container ID
- `ostemplate` (string): Template path (e.g., `local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz`)
- `hostname` (string): Container hostname
- `password` (string, optional): Root password (auto-generated if not provided)
- `memory` (number, optional): Memory in MB (default: 512)
- `storage` (string, optional): Storage name (default: `local-lvm`)
- `rootfs_size` (string, optional): Root filesystem size in GB (default: `8`)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "ostemplate": "local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz",
  "hostname": "my-container",
  "password": "SecurePassword123!",
  "memory": 1024,
  "storage": "local-lvm",
  "rootfs_size": "16"
}
```

#### `proxmox_create_vm` 🔒
Create a new QEMU virtual machine.

**Parameters**:
- `node` (string): Node name
- `vmid` (number): VM ID
- `name` (string): VM name
- `memory` (number, optional): Memory in MB (default: 512)
- `cores` (number, optional): CPU cores (default: 1)
- `sockets` (number, optional): CPU sockets (default: 1)
- `disk_size` (string, optional): Disk size (e.g., `20G`) (default: `8G`)
- `storage` (string, optional): Storage name (default: `local-lvm`)
- `iso` (string, optional): ISO image path (e.g., `local:iso/debian-12.2-amd64-netinst.iso`)
- `ostype` (string, optional): OS type (default: `l26` for Linux 2.6+)
- `bridge` (string, optional): Network bridge (default: `vmbr0`)

**Example**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "name": "my-vm",
  "memory": 2048,
  "cores": 2,
  "sockets": 1,
  "disk_size": "50G",
  "storage": "local-lvm",
  "iso": "local:iso/debian-12.2-amd64-netinst.iso",
  "ostype": "l26",
  "bridge": "vmbr0"
}
```

---

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
- Verify `PROXMOX_USER` includes realm (e.g., `root@pam`, not just `root`)
- Check `PROXMOX_PASSWORD` is correct
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
