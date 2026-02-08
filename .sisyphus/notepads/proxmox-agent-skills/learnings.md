# Learnings: Proxmox Agent Skills Implementation

## QEMU Guest Agent API Research (2026-02-08)

### Source Discovery
- Official Proxmox source: https://git.proxmox.com/?p=qemu-server.git
- Agent API implementation: `src/PVE/API2/Qemu/Agent.pm`
- All endpoints follow pattern: `/nodes/{node}/qemu/{vmid}/agent/{command}`

### Complete Endpoint Inventory
Found **30+ QEMU Guest Agent endpoints** organized into 9 categories:

1. **System Information** (5 endpoints): info, get-osinfo, get-host-name, get-timezone, get-time
2. **User Information** (2 endpoints): get-users, set-user-password
3. **Network Information** (1 endpoint): network-get-interfaces
4. **Filesystem** (5 endpoints): get-fsinfo, fsfreeze-status/freeze/thaw, fstrim
5. **File Operations** (2 endpoints): file-read, file-write
6. **Command Execution** (2 endpoints): exec, exec-status
7. **Hardware Information** (3 endpoints): get-vcpus, get-memory-blocks, get-memory-block-info
8. **Power Management** (4 endpoints): shutdown, suspend-disk/ram/hybrid
9. **Utility** (2 endpoints): ping, index

### Permission Model
Proxmox uses granular permissions:
- `VM.GuestAgent.Audit`: Read-only operations
- `VM.GuestAgent.FileRead`: Read files
- `VM.GuestAgent.FileWrite`: Write files
- `VM.GuestAgent.FileSystemMgmt`: Filesystem operations
- `VM.GuestAgent.Unrestricted`: Full access (exec, passwords)
- `VM.PowerMgmt`: Power operations

### Implementation Patterns
1. **Simple Commands**: Direct pass-through to `guest-{command}` QMP command
2. **Complex Commands**: Custom logic (file-read uses chunked reading, file-write uses handles)
3. **Async Commands**: exec returns PID, exec-status polls for results
4. **Size Limits**: file-read (16 MiB), file-write (60 KiB), exec input (64 KiB)

### High-Value Unimplemented Endpoints
Priority for implementation:
1. **file-read/write**: Essential for configuration management
2. **set-user-password**: User management automation
3. **get-users**: Security auditing
4. **get-host-name**: VM identification
5. **shutdown**: Graceful power management
6. **get-vcpus**: Resource monitoring

### Documentation Created
- Comprehensive endpoint inventory: `docs/proxmox-qemu-agent-endpoints.md`
- Includes HTTP methods, parameters, responses, permissions, and notes
- Ready for implementation reference

### Research Methodology
1. Used Context7 to find Proxmox documentation sources
2. Located official git repository at git.proxmox.com
3. Fetched raw source code of Agent.pm directly
4. Analyzed Perl code to extract all registered endpoints
5. Documented parameters, permissions, and implementation details

### Key Insights
- Proxmox wraps QEMU Guest Agent protocol with REST API
- Most endpoints are simple wrappers around QMP commands
- File operations have special handling for chunking and base64 encoding
- Permission system is more granular than basic read/write
- Some commands require QEMU 2.9+ (documented in source comments)
