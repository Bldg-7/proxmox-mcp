# Update README with New Tools

## TL;DR

> **Quick Summary**: Update README.md to reflect the 9 new tools added (55 → 64 tools) and update test counts (373 → 405).
> 
> **Deliverables**:
> - Updated tool count in README.md (55 → 64)
> - Updated test count (373 → 405)
> - New documentation sections for VM/LXC Config, Node Disk, and Node Network tools
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential edits to single file
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
Update README to document the new tools added in recent sessions.

### Recent Tool Additions
1. **VM/LXC Configuration Query (2 tools)** - Tool count 55 → 57
   - `proxmox_get_vm_config`: Read QEMU VM hardware configuration
   - `proxmox_get_lxc_config`: Read LXC container hardware configuration

2. **Node Disk Query (4 tools)** - Tool count 57 → 61
   - `proxmox_get_node_disks`: List physical disks on a node
   - `proxmox_get_node_disk_smart`: Get SMART health data for a disk
   - `proxmox_get_node_lvm`: List LVM volume groups and logical volumes
   - `proxmox_get_node_zfs`: List ZFS pools on a node

3. **Node Network/DNS Query (3 tools)** - Tool count 61 → 64
   - `proxmox_get_node_network`: List network interfaces with optional type filtering
   - `proxmox_get_node_dns`: Get DNS configuration for a node
   - `proxmox_get_network_iface`: Get specific interface details

---

## Work Objectives

### Core Objective
Update README.md to accurately reflect current tool count (64) and document all new tools.

### Concrete Deliverables
- README.md with updated counts and new tool sections

### Definition of Done
- [x] All tool counts updated (55 → 64)
- [x] Test counts updated (373 → 405)
- [x] VM/LXC Configuration section added
- [x] Node Disk Query section added
- [x] Node Network Query section added

### Must Have
- Accurate tool descriptions matching server.ts
- Proper parameter documentation with examples
- Consistent formatting with existing sections

### Must NOT Have (Guardrails)
- Do NOT change existing tool documentation
- Do NOT add elevated permission markers (🔒) to read-only tools
- Do NOT modify non-README files

---

## TODOs

- [x] 1. Update tool and test counts in README header sections

  **What to do**:
  - Line 11: Change "55 tools" to "64 tools"
  - Line 26: Change "373 tests" to "405 tests"
  - Line 33: Change "55 tool descriptions" to "64 tool descriptions"
  - Line 39: Change "55 comprehensive tools" to "64 comprehensive tools"

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **References**:
  - `README.md:11,26,33,39` - Lines to update

  **Acceptance Criteria**:
  - [ ] `grep -c "64 tools" README.md` returns 2
  - [ ] `grep -c "405 tests" README.md` returns 1
  - [ ] `grep -c "55 tools" README.md` returns 0

  **Commit**: NO (group with final commit)

---

- [x] 2. Add VM/LXC Configuration Query section after VM Query section

  **What to do**:
  - Insert new section after line 222 (after VM Query section, before VM Lifecycle)
  - Add documentation for `proxmox_get_vm_config` and `proxmox_get_lxc_config`

  **Section content**:
  ```markdown
  ### VM/LXC Configuration Query (2 tools)

  #### `proxmox_get_vm_config`
  Get hardware configuration for a QEMU virtual machine.

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

  **Returns**: CPU, memory, disks, network interfaces, boot order, and other VM settings.

  #### `proxmox_get_lxc_config`
  Get hardware configuration for an LXC container.

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

  **Returns**: CPU, memory, mount points, network interfaces, and other container settings.

  ---
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **References**:
  - `src/server.ts:150-160` - Tool descriptions
  - `src/tools/vm.ts` - Handler implementations

  **Acceptance Criteria**:
  - [ ] `grep -c "proxmox_get_vm_config" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_lxc_config" README.md` returns at least 1
  - [ ] `grep "VM/LXC Configuration Query" README.md` returns match

  **Commit**: NO (group with final commit)

---

- [x] 3. Add Node Disk Query section after VM Creation section

  **What to do**:
  - Insert new section after VM Creation section (around line 896)
  - Add documentation for 4 node disk tools

  **Section content**:
  ```markdown
  ### Node Disk Query (4 tools)

  #### `proxmox_get_node_disks`
  List physical disks on a Proxmox node.

  **Parameters**:
  - `node` (string): Node name
  - `type` (string, optional): Filter by disk type (`unused`, `journal_disks`)

  **Example**:
  ```json
  {
    "node": "pve1"
  }
  ```

  **Returns**: List of physical disks with device path, size, model, serial, and usage status.

  #### `proxmox_get_node_disk_smart`
  Get SMART health data for a specific disk.

  **Parameters**:
  - `node` (string): Node name
  - `disk` (string): Disk device path (e.g., `/dev/sda`)

  **Example**:
  ```json
  {
    "node": "pve1",
    "disk": "/dev/sda"
  }
  ```

  **Returns**: SMART health status, attributes, and disk diagnostics.

  #### `proxmox_get_node_lvm`
  List LVM volume groups and logical volumes on a node.

  **Parameters**:
  - `node` (string): Node name

  **Example**:
  ```json
  {
    "node": "pve1"
  }
  ```

  **Returns**: Volume groups with their logical volumes, sizes, and free space.

  #### `proxmox_get_node_zfs`
  List ZFS pools on a Proxmox node.

  **Parameters**:
  - `node` (string): Node name

  **Example**:
  ```json
  {
    "node": "pve1"
  }
  ```

  **Returns**: ZFS pools with health status, size, allocated/free space, and fragmentation.

  ---
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **References**:
  - `src/server.ts:170-190` - Tool descriptions
  - `src/tools/node.ts` - Handler implementations

  **Acceptance Criteria**:
  - [ ] `grep -c "proxmox_get_node_disks" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_node_disk_smart" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_node_lvm" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_node_zfs" README.md` returns at least 1
  - [ ] `grep "Node Disk Query" README.md` returns match

  **Commit**: NO (group with final commit)

---

- [x] 4. Add Node Network Query section after Node Disk Query section

  **What to do**:
  - Insert new section after Node Disk Query section
  - Add documentation for 3 network/DNS tools

  **Section content**:
  ```markdown
  ### Node Network Query (3 tools)

  #### `proxmox_get_node_network`
  List network interfaces on a Proxmox node.

  **Parameters**:
  - `node` (string): Node name
  - `type` (string, optional): Filter by interface type (`bridge`, `bond`, `eth`, `alias`, `vlan`, `OVSBridge`, `OVSBond`, `OVSPort`, `OVSIntPort`, `any_bridge`, `any_local_bridge`)

  **Example**:
  ```json
  {
    "node": "pve1",
    "type": "bridge"
  }
  ```

  **Returns**: List of network interfaces with IP addresses, status, and configuration.

  #### `proxmox_get_node_dns`
  Get DNS configuration for a Proxmox node.

  **Parameters**:
  - `node` (string): Node name

  **Example**:
  ```json
  {
    "node": "pve1"
  }
  ```

  **Returns**: DNS servers (dns1, dns2, dns3) and search domain.

  #### `proxmox_get_network_iface`
  Get detailed configuration for a specific network interface.

  **Parameters**:
  - `node` (string): Node name
  - `iface` (string): Interface name (e.g., `vmbr0`, `eth0`)

  **Example**:
  ```json
  {
    "node": "pve1",
    "iface": "vmbr0"
  }
  ```

  **Returns**: Interface details including type, IP address, netmask, gateway, bridge ports, and active status.

  ---
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **References**:
  - `src/server.ts:195-210` - Tool descriptions
  - `src/tools/node.ts` - Handler implementations

  **Acceptance Criteria**:
  - [ ] `grep -c "proxmox_get_node_network" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_node_dns" README.md` returns at least 1
  - [ ] `grep -c "proxmox_get_network_iface" README.md` returns at least 1
  - [ ] `grep "Node Network Query" README.md` returns match

  **Commit**: NO (group with final commit)

---

- [x] 5. Also update README_ko.md (Korean version) with same changes

  **What to do**:
  - Apply same tool count updates (55 → 64, 373 → 405)
  - Add Korean translations for new tool sections

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Acceptance Criteria**:
  - [ ] `grep -c "64" README_ko.md` returns at least 2 (tool counts)
  - [ ] `grep -c "405" README_ko.md` returns 1 (test count)

  **Commit**: NO (group with final commit)

---

- [x] 6. Commit all README changes

  **What to do**:
  - Stage README.md and README_ko.md
  - Create commit with message: `docs: update README with new tools (55→64)`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["git-master"]`

  **Acceptance Criteria**:
  - [ ] `git log -1 --oneline` shows the commit message
  - [ ] Working tree is clean

  **Commit**: YES
  - Message: `docs: update README with new tools (55→64)`
  - Files: `README.md`, `README_ko.md`

---

## Success Criteria

### Verification Commands
```bash
# Verify tool counts updated
grep -c "64 tools" README.md  # Expected: 2
grep -c "55 tools" README.md  # Expected: 0

# Verify new sections exist
grep "VM/LXC Configuration Query" README.md
grep "Node Disk Query" README.md
grep "Node Network Query" README.md

# Verify all 9 new tools documented
grep "proxmox_get_vm_config\|proxmox_get_lxc_config\|proxmox_get_node_disks\|proxmox_get_node_disk_smart\|proxmox_get_node_lvm\|proxmox_get_node_zfs\|proxmox_get_node_network\|proxmox_get_node_dns\|proxmox_get_network_iface" README.md | wc -l
# Expected: at least 9
```

### Final Checklist
- [x] Tool count updated to 64
- [x] Test count updated to 405
- [x] All 9 new tools have documentation
- [x] Korean README also updated
- [x] Changes committed
