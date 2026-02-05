# Add VM/LXC Config Read Tools

## TL;DR

> **Quick Summary**: Add two new tools to read VM and LXC hardware configuration (disks, network interfaces, memory, CPU) via the `/config` API endpoint.
> 
> **Deliverables**:
> - `proxmox_get_vm_config` - Read QEMU VM hardware config
> - `proxmox_get_lxc_config` - Read LXC container hardware config
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential (files depend on each other)

---

## Context

### Original Request
MCP server currently lacks tools to READ VM/LXC hardware configuration. The `/config` endpoint is only used for WRITE operations (adding disks, networks). Users cannot query what disks/networks are attached to a VM.

### Gap Analysis
| API Endpoint | Current Support |
|--------------|-----------------|
| `GET /nodes/{node}/qemu/{vmid}/config` | ❌ Missing |
| `GET /nodes/{node}/lxc/{vmid}/config` | ❌ Missing |
| `PUT /nodes/{node}/qemu/{vmid}/config` | ✅ Supported (disk.ts, network.ts) |

---

## Work Objectives

### Core Objective
Add read-only tools to query VM/LXC hardware configuration including disks, network interfaces, CPU, memory, and boot order.

### Concrete Deliverables
- `proxmox_get_vm_config` tool
- `proxmox_get_lxc_config` tool
- Unit tests for both tools

### Must Have
- Return disk info (scsi0, virtio0, ide0, etc.)
- Return network info (net0, net1, etc.)
- Return CPU/memory config
- Formatted human-readable output

### Must NOT Have
- No elevated permissions required (read-only)
- No modification capabilities

---

## TODOs

- [x] 1. Add schemas to `src/schemas/vm.ts`

  **What to do**:
  ```typescript
  // Add after getVmStatusSchema (around line 24)
  
  // proxmox_get_vm_config - Get hardware configuration for a QEMU VM
  export const getVmConfigSchema = z.object({
    node: z.string().min(1).describe('Node name where VM is located'),
    vmid: z.coerce.number().describe('VM ID number'),
  });
  
  export type GetVmConfigInput = z.infer<typeof getVmConfigSchema>;
  
  // proxmox_get_lxc_config - Get hardware configuration for an LXC container
  export const getLxcConfigSchema = z.object({
    node: z.string().min(1).describe('Node name where container is located'),
    vmid: z.coerce.number().describe('Container ID number'),
  });
  
  export type GetLxcConfigInput = z.infer<typeof getLxcConfigSchema>;
  ```

  **Acceptance Criteria**:
  - [x] Both schemas defined with node and vmid fields
  - [x] Types exported

---

- [x] 2. Add handlers to `src/tools/vm-query.ts`

  **What to do**:
  Add after `getVMStatus` function (around line 159):

  ```typescript
  /**
   * Get hardware configuration for a QEMU VM.
   * Returns disks, network interfaces, CPU, memory settings.
   * No elevated permissions required.
   */
  export async function getVMConfig(
    client: ProxmoxApiClient,
    _config: Config,
    input: GetVmConfigInput
  ): Promise<ToolResponse> {
    try {
      const validated = getVmConfigSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      const safeVMID = validateVMID(validated.vmid);

      const vmConfig = await client.request(
        `/nodes/${safeNode}/qemu/${safeVMID}/config`
      ) as Record<string, unknown>;

      let output = `🖥️ **QEMU VM Configuration** (ID: ${safeVMID})\n\n`;
      output += `• **Node**: ${safeNode}\n`;
      output += `• **Name**: ${vmConfig.name || 'N/A'}\n`;
      output += `• **Memory**: ${vmConfig.memory || 'N/A'} MB\n`;
      output += `• **CPU Cores**: ${vmConfig.cores || 1}\n`;
      output += `• **CPU Sockets**: ${vmConfig.sockets || 1}\n`;
      output += `• **OS Type**: ${vmConfig.ostype || 'N/A'}\n\n`;

      // Disks
      output += `**💿 Disks**:\n`;
      const diskKeys = Object.keys(vmConfig).filter(k => 
        /^(scsi|virtio|ide|sata)\d+$/.test(k)
      ).sort();
      if (diskKeys.length === 0) {
        output += `  (none)\n`;
      } else {
        for (const key of diskKeys) {
          output += `  • ${key}: ${vmConfig[key]}\n`;
        }
      }

      // Network interfaces
      output += `\n**🌐 Network Interfaces**:\n`;
      const netKeys = Object.keys(vmConfig).filter(k => /^net\d+$/.test(k)).sort();
      if (netKeys.length === 0) {
        output += `  (none)\n`;
      } else {
        for (const key of netKeys) {
          output += `  • ${key}: ${vmConfig[key]}\n`;
        }
      }

      // Boot order
      if (vmConfig.boot) {
        output += `\n**🔄 Boot Order**: ${vmConfig.boot}\n`;
      }

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Get VM Config');
    }
  }

  /**
   * Get hardware configuration for an LXC container.
   * Returns mount points, network interfaces, CPU, memory settings.
   * No elevated permissions required.
   */
  export async function getLxcConfig(
    client: ProxmoxApiClient,
    _config: Config,
    input: GetLxcConfigInput
  ): Promise<ToolResponse> {
    try {
      const validated = getLxcConfigSchema.parse(input);
      const safeNode = validateNodeName(validated.node);
      const safeVMID = validateVMID(validated.vmid);

      const lxcConfig = await client.request(
        `/nodes/${safeNode}/lxc/${safeVMID}/config`
      ) as Record<string, unknown>;

      let output = `📦 **LXC Container Configuration** (ID: ${safeVMID})\n\n`;
      output += `• **Node**: ${safeNode}\n`;
      output += `• **Hostname**: ${lxcConfig.hostname || 'N/A'}\n`;
      output += `• **Memory**: ${lxcConfig.memory || 'N/A'} MB\n`;
      output += `• **Swap**: ${lxcConfig.swap || 0} MB\n`;
      output += `• **CPU Cores**: ${lxcConfig.cores || 'unlimited'}\n`;
      output += `• **OS Type**: ${lxcConfig.ostype || 'N/A'}\n\n`;

      // Root filesystem
      if (lxcConfig.rootfs) {
        output += `**💿 Root Filesystem**:\n`;
        output += `  • rootfs: ${lxcConfig.rootfs}\n\n`;
      }

      // Mount points
      output += `**📁 Mount Points**:\n`;
      const mpKeys = Object.keys(lxcConfig).filter(k => /^mp\d+$/.test(k)).sort();
      if (mpKeys.length === 0) {
        output += `  (none)\n`;
      } else {
        for (const key of mpKeys) {
          output += `  • ${key}: ${lxcConfig[key]}\n`;
        }
      }

      // Network interfaces
      output += `\n**🌐 Network Interfaces**:\n`;
      const netKeys = Object.keys(lxcConfig).filter(k => /^net\d+$/.test(k)).sort();
      if (netKeys.length === 0) {
        output += `  (none)\n`;
      } else {
        for (const key of netKeys) {
          output += `  • ${key}: ${lxcConfig[key]}\n`;
        }
      }

      return formatToolResponse(output);
    } catch (error) {
      return formatErrorResponse(error as Error, 'Get LXC Config');
    }
  }
  ```

  **Also add imports at top of file**:
  ```typescript
  import { getVmsSchema, getVmStatusSchema, getStorageSchema, getVmConfigSchema, getLxcConfigSchema } from '../schemas/vm.js';
  import type { GetVmsInput, GetVmStatusInput, GetStorageInput, GetVmConfigInput, GetLxcConfigInput } from '../schemas/vm.js';
  ```

  **Acceptance Criteria**:
  - [x] `getVMConfig` function implemented
  - [x] `getLxcConfig` function implemented
  - [x] Both call correct API endpoints
  - [x] Output formatted with disk/network/memory info

---

- [x] 3. Export handlers from `src/tools/index.ts`

  **What to do**:
  Change line 6:
  ```typescript
  // FROM:
  export { getVMs, getVMStatus, getStorage } from './vm-query.js';
  
  // TO:
  export { getVMs, getVMStatus, getVMConfig, getLxcConfig, getStorage } from './vm-query.js';
  ```

  **Acceptance Criteria**:
  - [x] Both new functions exported

---

- [x] 4. Add tool names to `src/types/tools.ts`

  **What to do**:
  Add after line 5 (`'proxmox_get_vm_status'`):
  ```typescript
  'proxmox_get_vm_config',
  'proxmox_get_lxc_config',
  ```

  **Acceptance Criteria**:
  - [x] Both tool names in TOOL_NAMES array

---

- [x] 5. Register tools in `src/tools/registry.ts`

  **What to do**:
  
  5a. Add imports (around line 13-14):
  ```typescript
  getVMConfig,
  getLxcConfig,
  ```
  
  5b. Add schema imports (around line 75):
  ```typescript
  getVmConfigSchema,
  getLxcConfigSchema,
  ```
  
  5c. Add registry entries after line 158 (`proxmox_get_vm_status`):
  ```typescript
  proxmox_get_vm_config: { handler: getVMConfig, schema: getVmConfigSchema },
  proxmox_get_lxc_config: { handler: getLxcConfig, schema: getLxcConfigSchema },
  ```
  
  5d. Update tool count validation (line 232):
  ```typescript
  // FROM: if (registeredCount !== 55)
  // TO:
  if (registeredCount !== 57)
  ```

  **Acceptance Criteria**:
  - [x] Both tools registered in toolRegistry
  - [x] Count updated to 57

---

- [x] 6. Add descriptions in `src/server.ts`

  **What to do**:
  Add after line 26 (`proxmox_get_storage`):
  ```typescript
  proxmox_get_vm_config: 'Get hardware configuration for a QEMU VM (disks, network, CPU, memory)',
  proxmox_get_lxc_config: 'Get hardware configuration for an LXC container (mount points, network, CPU, memory)',
  ```

  **Acceptance Criteria**:
  - [x] Both descriptions added to TOOL_DESCRIPTIONS

---

- [x] 7. Build and test

  **What to do**:
  ```bash
  pnpm build
  pnpm test
  ```

  **Acceptance Criteria**:
  - [x] Build passes with no errors
  - [x] All tests pass (373 + new tests)

---

## Success Criteria

### Verification Commands
```bash
pnpm build    # Expected: no errors
pnpm test     # Expected: all tests pass
```

### Final Checklist
- [x] `proxmox_get_vm_config` tool working
- [x] `proxmox_get_lxc_config` tool working
- [x] No elevated permissions required
- [x] Tool count is 57
