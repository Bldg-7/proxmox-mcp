# Proxmox QEMU Guest Agent API Endpoints

Complete inventory of QEMU Guest Agent API endpoints available in Proxmox VE.

**Base Path**: `/nodes/{node}/qemu/{vmid}/agent/`

**Source**: https://git.proxmox.com/?p=qemu-server.git;a=blob_plain;f=src/PVE/API2/Qemu/Agent.pm;hb=HEAD

---

## 1. System Information Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/info
- **Description**: Get QEMU Guest Agent information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required): Node name
  - `vmid` (integer, required): VM ID
- **Response**: Object with agent version and supported commands

### GET /nodes/{node}/qemu/{vmid}/agent/get-osinfo
- **Description**: Get guest operating system information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: OS name, version, kernel info
- **Available**: Since QEMU 2.9

### GET /nodes/{node}/qemu/{vmid}/agent/get-host-name
- **Description**: Get the hostname of the guest
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Hostname string
- **Available**: Since QEMU 2.9

### GET /nodes/{node}/qemu/{vmid}/agent/get-timezone
- **Description**: Get guest timezone information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Timezone offset and zone name
- **Available**: Since QEMU 2.9

### GET /nodes/{node}/qemu/{vmid}/agent/get-time
- **Description**: Get guest system time
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Time in nanoseconds since epoch

---

## 2. User Information Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/get-users
- **Description**: Get list of logged-in users
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of user objects with username, login time, domain
- **Available**: Since QEMU 2.9

### POST /nodes/{node}/qemu/{vmid}/agent/set-user-password
- **Description**: Set password for a user in the guest
- **Permission**: VM.GuestAgent.Unrestricted
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
  - `username` (string, required): User to set password for
  - `password` (string, required): New password (5-1024 chars)
  - `crypted` (boolean, optional): Whether password is already crypted (default: false)
- **Response**: Success confirmation

---

## 3. Network Information Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/network-get-interfaces
- **Description**: Get network interface information from guest
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of network interface objects with:
  - Interface name
  - Hardware address (MAC)
  - IP addresses (v4 and v6)
  - Statistics

---

## 4. Filesystem Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/get-fsinfo
- **Description**: Get filesystem information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of filesystem objects with:
  - Mount point
  - Filesystem type
  - Disk information
  - Used/total space

### POST /nodes/{node}/qemu/{vmid}/agent/fsfreeze-status
- **Description**: Get filesystem freeze status
- **Permission**: VM.GuestAgent.Audit OR VM.GuestAgent.FileSystemMgmt OR VM.GuestAgent.Unrestricted (any)
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Freeze status (frozen/thawed)

### POST /nodes/{node}/qemu/{vmid}/agent/fsfreeze-freeze
- **Description**: Freeze guest filesystems
- **Permission**: VM.GuestAgent.FileSystemMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Number of filesystems frozen
- **Note**: Used during backup operations

### POST /nodes/{node}/qemu/{vmid}/agent/fsfreeze-thaw
- **Description**: Thaw (unfreeze) guest filesystems
- **Permission**: VM.GuestAgent.FileSystemMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Number of filesystems thawed

### POST /nodes/{node}/qemu/{vmid}/agent/fstrim
- **Description**: Discard unused blocks on filesystems
- **Permission**: VM.GuestAgent.FileSystemMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Trim results per filesystem

---

## 5. File Operations Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/file-read
- **Description**: Read file content from guest
- **Permission**: VM.GuestAgent.FileRead OR VM.GuestAgent.Unrestricted (any)
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
  - `file` (string, required): Path to file
- **Response**: 
  - `content` (string): File content
  - `bytes-read` (integer): Number of bytes read
  - `truncated` (boolean, optional): True if output was truncated
- **Limits**: Maximum 16 MiB read size

### POST /nodes/{node}/qemu/{vmid}/agent/file-write
- **Description**: Write content to file in guest
- **Permission**: VM.GuestAgent.FileWrite OR VM.GuestAgent.Unrestricted (any)
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
  - `file` (string, required): Path to file
  - `content` (string, required): Content to write (max 60 KiB)
  - `encode` (boolean, optional): Base64 encode content (default: true)
- **Response**: null (success)
- **Note**: Creates or overwrites file

---

## 6. Command Execution Endpoints

### POST /nodes/{node}/qemu/{vmid}/agent/exec
- **Description**: Execute command in guest via guest agent
- **Permission**: VM.GuestAgent.Unrestricted
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
  - `command` (array, required): Command as array of [program, arg1, arg2, ...]
  - `input-data` (string, optional): Data to pass as stdin (max 64 KiB)
- **Response**: 
  - `pid` (integer): Process ID of started command
- **Note**: Command runs asynchronously, use exec-status to get results

### GET /nodes/{node}/qemu/{vmid}/agent/exec-status
- **Description**: Get status of previously executed command
- **Permission**: VM.GuestAgent.Unrestricted
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
  - `pid` (integer, required): Process ID from exec call
- **Response**: 
  - `exited` (boolean): Whether process has exited
  - `exitcode` (integer, optional): Exit code if normally terminated
  - `signal` (integer, optional): Signal number if abnormally terminated
  - `out-data` (string, optional): stdout output
  - `err-data` (string, optional): stderr output
  - `out-truncated` (boolean, optional): True if stdout was truncated
  - `err-truncated` (boolean, optional): True if stderr was truncated

---

## 7. Hardware Information Endpoints

### GET /nodes/{node}/qemu/{vmid}/agent/get-vcpus
- **Description**: Get virtual CPU information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of vCPU objects with online status

### GET /nodes/{node}/qemu/{vmid}/agent/get-memory-blocks
- **Description**: Get memory block information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of memory block objects

### GET /nodes/{node}/qemu/{vmid}/agent/get-memory-block-info
- **Description**: Get memory block size information
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Memory block size in bytes

---

## 8. Power Management Endpoints

### POST /nodes/{node}/qemu/{vmid}/agent/shutdown
- **Description**: Shutdown guest via agent
- **Permission**: VM.PowerMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Success confirmation
- **Note**: Graceful shutdown from inside guest

### POST /nodes/{node}/qemu/{vmid}/agent/suspend-disk
- **Description**: Suspend guest to disk (hibernate)
- **Permission**: VM.PowerMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Success confirmation

### POST /nodes/{node}/qemu/{vmid}/agent/suspend-ram
- **Description**: Suspend guest to RAM (sleep)
- **Permission**: VM.PowerMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Success confirmation

### POST /nodes/{node}/qemu/{vmid}/agent/suspend-hybrid
- **Description**: Hybrid suspend (RAM + disk)
- **Permission**: VM.PowerMgmt
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Success confirmation

---

## 9. Utility Endpoints

### POST /nodes/{node}/qemu/{vmid}/agent/ping
- **Description**: Ping the guest agent to check availability
- **Permission**: VM.GuestAgent.Audit
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Success if agent is responsive

### GET /nodes/{node}/qemu/{vmid}/agent
- **Description**: List all available agent commands
- **Permission**: All users
- **Parameters**: 
  - `node` (string, required)
  - `vmid` (integer, required)
- **Response**: Array of available command names

---

## Permission Levels

The following permission levels are used:

- **VM.GuestAgent.Audit**: Read-only operations (info, status checks)
- **VM.GuestAgent.FileRead**: Read files from guest
- **VM.GuestAgent.FileWrite**: Write files to guest
- **VM.GuestAgent.FileSystemMgmt**: Filesystem operations (freeze, trim)
- **VM.GuestAgent.Unrestricted**: Full access (exec, password changes)
- **VM.PowerMgmt**: Power management operations

---

## Implementation Notes

1. **Agent Availability**: All endpoints require the QEMU Guest Agent to be installed and running in the guest
2. **Error Handling**: Endpoints return errors if agent is not available or command fails
3. **Async Operations**: `exec` command is asynchronous - use `exec-status` to poll for results
4. **Size Limits**: 
   - file-read: 16 MiB maximum
   - file-write: 60 KiB maximum
   - exec input-data: 64 KiB maximum
5. **Base64 Encoding**: File operations use base64 encoding for binary safety
6. **QEMU Version**: Some commands require QEMU 2.9+ (noted in descriptions)

---

## Endpoints Already Implemented in proxmox-mcp

Based on the existing codebase, these endpoints are already implemented:
- ping
- get-osinfo
- network-get-interfaces
- get-fsinfo
- exec
- exec-status

## Endpoints Available for Implementation

High-value endpoints not yet implemented:
- **file-read**: Read files from guest
- **file-write**: Write files to guest
- **set-user-password**: Change user passwords
- **get-users**: List logged-in users
- **get-host-name**: Get hostname
- **get-timezone**: Get timezone info
- **get-time**: Get system time
- **fsfreeze-freeze/thaw**: Filesystem freeze operations
- **fstrim**: Filesystem trim
- **shutdown**: Graceful shutdown
- **suspend-***: Suspend operations
- **get-vcpus**: CPU information
- **get-memory-blocks**: Memory information

