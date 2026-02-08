# Learnings — Remaining API Endpoints

## Conventions

(Subagents will append findings here)

## Task 1: Cluster Firewall Options, Macros, and Refs (COMPLETED)

### Implementation Pattern
- **Schemas**: 4 new schemas in cluster-management.ts following existing pattern
  - `getClusterFirewallOptionsSchema`: Empty object (no params)
  - `updateClusterFirewallOptionsSchema`: Optional fields (enable, policy_in, policy_out, log_ratelimit)
  - `listClusterFirewallMacrosSchema`: Empty object (no params)
  - `listClusterFirewallRefsSchema`: Optional type filter (enum: 'alias' | 'ipset')

- **Handlers**: 4 functions in cluster-management.ts
  - GET options: Returns key-value pairs from API
  - PUT options: Requires elevated, builds payload from optional fields
  - GET macros: Returns array with name/descr fields
  - GET refs: Supports optional type filter via query string

- **Tests**: 6 tests total
  - 4 success cases (one per tool)
  - 2 elevated permission denial tests (for update operations)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Tool count tracking**: Must update 3 places when adding tools
   - registry.ts: Tool count assertion (244→248)
   - integration tests: Two assertions for tool count
   
2. **Firewall options pattern**: Similar to cluster options but firewall-specific
   - GET returns all options as key-value pairs
   - PUT accepts optional fields and builds payload conditionally
   
3. **Type filtering**: Query string filters use `?type=value` pattern
   - Applied in listClusterFirewallRefs for optional type parameter
   
4. **Test coverage**: Elevated operations need both success and permission denial tests
   - updateClusterFirewallOptions requires elevated permissions
   - Tests verify both the permission check and the API call

### Files Modified
- src/schemas/cluster-management.ts: +4 schemas
- src/tools/cluster-management.ts: +4 handlers
- src/tools/index.ts: +4 exports
- src/types/tools.ts: +4 tool names
- src/server.ts: +4 tool descriptions
- src/tools/registry.ts: +4 registrations, updated tool count
- src/tools/cluster-management.test.ts: +6 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (244→248)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 665 tests pass (including 6 new tests)
- ✅ Tool count: 244 → 248 (4 new tools)

## Task 2: Cluster Firewall Aliases CRUD (COMPLETED)

### Implementation Pattern
- **Schemas**: 5 new schemas in cluster-management.ts
  - `listClusterFirewallAliasesSchema`: Empty object (no params)
  - `getClusterFirewallAliasSchema`: name parameter (string, min 1)
  - `createClusterFirewallAliasSchema`: name, cidr (required), comment (optional)
  - `updateClusterFirewallAliasSchema`: name, cidr (required), comment, rename (optional)
  - `deleteClusterFirewallAliasSchema`: name parameter (string, min 1)

- **Handlers**: 5 functions in cluster-management.ts
  - List aliases: Returns array with name/cidr/comment fields
  - Get alias: Returns specific alias by name using `encodeURIComponent(name)` in URL
  - Create alias: Requires elevated, builds payload from name/cidr/comment
  - Update alias: Requires elevated, supports rename via `rename` field
  - Delete alias: Requires elevated, uses `encodeURIComponent(name)` in URL

- **Tests**: 8 tests total
  - 5 success cases (one per tool)
  - 3 elevated permission denial tests (for create/update/delete)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Named entity pattern**: Aliases follow same pattern as firewall groups
   - Use `encodeURIComponent(name)` for URL path parameters
   - Validate name with simple string validation (no special validator needed)
   
2. **CRUD consistency**: All 5 tools follow established patterns
   - List: GET /cluster/firewall/aliases
   - Get: GET /cluster/firewall/aliases/{name}
   - Create: POST /cluster/firewall/aliases
   - Update: PUT /cluster/firewall/aliases/{name}
   - Delete: DELETE /cluster/firewall/aliases/{name}

3. **Elevated operations**: Create/update/delete require `requireElevated(config, 'action')`
   - Tests verify both permission denial and successful execution
   
4. **Integration test updates**: Must update tool count in 2 places
   - registry.ts: Tool count assertion (248→253)
   - integration tests: Two assertions for tool count (248→253)

### Files Modified
- src/schemas/cluster-management.ts: +5 schemas
- src/tools/cluster-management.ts: +5 handlers
- src/tools/index.ts: +5 exports
- src/types/tools.ts: +5 tool names
- src/server.ts: +5 tool descriptions
- src/tools/registry.ts: +5 registrations, updated tool count (248→253)
- src/tools/cluster-management.test.ts: +8 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (248→253)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 673 tests pass (including 8 new tests)
- ✅ Tool count: 248 → 253 (5 new tools)

## Task 3: Cluster Firewall IP Sets CRUD (COMPLETED)

### Implementation Pattern
- **Schemas**: 7 new schemas in cluster-management.ts
  - `listClusterFirewallIpsetsSchema`: Empty object (no params)
  - `createClusterFirewallIpsetSchema`: name (required), comment (optional)
  - `deleteClusterFirewallIpsetSchema`: name parameter
  - `listClusterFirewallIpsetEntriesSchema`: name parameter (IP set name)
  - `addClusterFirewallIpsetEntrySchema`: name, cidr (required), comment, nomatch (optional)
  - `updateClusterFirewallIpsetEntrySchema`: name, cidr (required), comment, nomatch (optional)
  - `deleteClusterFirewallIpsetEntrySchema`: name, cidr (required)

- **Handlers**: 7 functions in cluster-management.ts
  - List ipsets: Returns array with name/comment fields
  - Create ipset: Requires elevated, builds payload from name/comment
  - Delete ipset: Requires elevated, uses `encodeURIComponent(name)` in URL
  - List entries: Returns entries for specific IP set using `encodeURIComponent(name)`
  - Add entry: Requires elevated, uses `encodeURIComponent(name)` in URL, supports nomatch flag
  - Update entry: Requires elevated, uses **double encoding** for both name and cidr
  - Delete entry: Requires elevated, uses **double encoding** for both name and cidr

- **Tests**: 12 tests total
  - 7 success cases (one per tool)
  - 5 elevated permission denial tests (for create/update/delete operations)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **2-level URL encoding**: IP set entries require encoding BOTH name AND cidr
   - Pattern: `/cluster/firewall/ipset/${encodeURIComponent(name)}/${encodeURIComponent(cidr)}`
   - Critical for CIDR notation (e.g., `192.168.1.0/24` → `192.168.1.0%2F24`)
   - Applied in update and delete entry handlers
   
2. **Nested resource pattern**: IP sets have 2 levels
   - Level 1: IP set itself (name-based CRUD)
   - Level 2: Entries within IP set (name + cidr based CRUD)
   - Similar to firewall groups but with additional nesting
   
3. **Nomatch flag**: IP set entries support inversion
   - `nomatch: true` means "exclude this entry" (inverted match)
   - Optional boolean field in add/update operations
   - Displayed in list output with "(nomatch)" indicator
   
4. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (253→260)
   - integration tests: Two assertions for tool count (253→260)
   
5. **Elevated operations**: 5 tools require elevated permissions
   - Create IP set, delete IP set
   - Add entry, update entry, delete entry
   - Tests verify both permission denial and successful execution

### Files Modified
- src/schemas/cluster-management.ts: +7 schemas
- src/tools/cluster-management.ts: +7 handlers
- src/tools/index.ts: +7 exports
- src/types/tools.ts: +7 tool names
- src/server.ts: +7 tool descriptions
- src/tools/registry.ts: +7 registrations, updated tool count (253→260)
- src/tools/cluster-management.test.ts: +12 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (253→260)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 685 tests pass (including 12 new tests)
- ✅ Tool count: 253 → 260 (7 new tools)

### API Endpoints Implemented
- GET /cluster/firewall/ipset (list IP sets)
- POST /cluster/firewall/ipset (create IP set)
- DELETE /cluster/firewall/ipset/{name} (delete IP set)
- GET /cluster/firewall/ipset/{name} (list entries)
- POST /cluster/firewall/ipset/{name} (add entry)
- PUT /cluster/firewall/ipset/{name}/{cidr} (update entry)
- DELETE /cluster/firewall/ipset/{name}/{cidr} (delete entry)

## Task 4: User API Token CRUD (COMPLETED)

### Implementation Pattern
- **Schemas**: 5 new schemas in access-control.ts
  - `listUserTokensSchema`: userid parameter (string, min 1)
  - `getUserTokenSchema`: userid, tokenid parameters (both string, min 1)
  - `createUserTokenSchema`: userid, tokenid (required), comment, expire, privsep (optional)
  - `updateUserTokenSchema`: userid, tokenid (required), comment, expire (optional)
  - `deleteUserTokenSchema`: userid, tokenid parameters (both string, min 1)

- **Handlers**: 5 functions in access-control.ts
  - List tokens: Returns array with tokenid/userid/comment/expire fields
  - Get token: Returns specific token by userid and tokenid using `encodeURIComponent()` for both
  - Create token: Requires elevated, displays one-time `value` field prominently in output
  - Update token: Requires elevated, updates comment/expire fields
  - Delete token: Requires elevated, removes token

- **Tests**: 8 tests total
  - 5 success cases (one per tool)
  - 3 elevated permission denial tests (for create/update/delete)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Double URL encoding**: Both userid AND tokenid must be encoded with `encodeURIComponent()`
   - Pattern: `/access/users/${encodeURIComponent(userid)}/token/${encodeURIComponent(tokenid)}`
   - Critical for special characters in userid (e.g., `root@pam` → `root%40pam`)
   - Applied in all 5 handlers

2. **One-time token value**: Create response displays token value prominently
   - Response includes `value` field with full token (only shown once)
   - Wrapped in code block with warning about saving it
   - Pattern: Check for `result.value` and display with special formatting

3. **Nested resource pattern**: Tokens are nested under users
   - Level 1: User (userid)
   - Level 2: Token (tokenid)
   - Similar to firewall groups but with different nesting structure

4. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (260→265)
   - integration tests: Two assertions for tool count (260→265)

5. **Elevated operations**: 3 tools require elevated permissions
   - Create token, update token, delete token
   - Tests verify both permission denial and successful execution

### Files Modified
- src/schemas/access-control.ts: +5 schemas
- src/tools/access-control.ts: +5 handlers
- src/tools/index.ts: +5 exports
- src/types/tools.ts: +5 tool names
- src/server.ts: +5 tool descriptions
- src/tools/registry.ts: +5 registrations, updated tool count (260→265)
- src/tools/access-control.test.ts: +8 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (260→265)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 693 tests pass (including 8 new tests)
- ✅ Tool count: 260 → 265 (5 new tools)

### API Endpoints Implemented
- GET /access/users/{userid}/token (list tokens)
- GET /access/users/{userid}/token/{tokenid} (get token)
- POST /access/users/{userid}/token/{tokenid} (create token)
- PUT /access/users/{userid}/token/{tokenid} (update token)
- DELETE /access/users/{userid}/token/{tokenid} (delete token)

## Task 5: Node Power Management (COMPLETED)

### Implementation Pattern
- **Schemas**: 3 new schemas in system-operations.ts
  - `nodeShutdownSchema`: node parameter (string, min 1)
  - `nodeRebootSchema`: node parameter (string, min 1)
  - `nodeWakeonlanSchema`: node parameter (string, min 1)

- **Handlers**: 3 functions in system-operations.ts
  - Shutdown: POST /nodes/{node}/status with command=shutdown
  - Reboot: POST /nodes/{node}/status with command=reboot
  - Wake-on-LAN: POST /nodes/{node}/wakeonlan (no payload)

- **Tests**: 6 tests total
  - 3 success cases (one per tool)
  - 3 elevated permission denial tests
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Shared endpoint pattern**: Shutdown and reboot both use `/nodes/{node}/status` endpoint
   - Differentiated by `command` parameter (shutdown vs reboot)
   - Similar to how startAll/stopAll use different endpoints but same pattern
   
2. **Elevated operations**: All 3 tools require elevated permissions
   - Use `requireElevated(config, 'action description')`
   - Tests verify both permission denial and successful execution
   
3. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (265→268)
   - integration tests: Two assertions for tool count (265→268)
   
4. **Destructive operations**: Power management is inherently destructive
   - Shutdown/reboot affect node availability
   - Wake-on-LAN requires network configuration
   - All require elevated permissions as safety measure

### Files Modified
- src/schemas/system-operations.ts: +3 schemas
- src/tools/system-operations.ts: +3 handlers
- src/tools/index.ts: +3 exports
- src/types/tools.ts: +3 tool names
- src/server.ts: +3 tool descriptions
- src/tools/registry.ts: +3 registrations, updated tool count (265→268)
- src/__fixtures__/system-operations.ts: +3 sample data
- src/tools/system-operations.test.ts: +6 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (265→268)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 699 tests pass (including 6 new tests)
- ✅ Tool count: 265 → 268 (3 new tools)

### API Endpoints Implemented
- POST /nodes/{node}/status (shutdown command)
- POST /nodes/{node}/status (reboot command)
- POST /nodes/{node}/wakeonlan

## Task 6: Node and Storage RRD Metrics + Node Report (COMPLETED)

### Implementation Pattern
- **Schemas**: 3 new schemas in node.ts
  - `getNodeRrddataSchema`: node (required), timeframe (optional enum), cf (optional enum)
  - `getStorageRrddataSchema`: node, storage (required), timeframe (optional enum), cf (optional enum)
  - `getNodeReportSchema`: node parameter only

- **Handlers**: 3 functions in node.ts
  - Get node RRD: Returns node performance metrics with optional timeframe/cf query params
  - Get storage RRD: Returns storage performance metrics with optional timeframe/cf query params
  - Get node report: Returns diagnostic report as plain text wrapped in code block

- **Tests**: 6 tests total
  - 3 success cases (one per tool)
  - 3 API endpoint verification tests
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **RRD pattern**: Follows exact pattern from vm-advanced.ts (getVmRrddata)
   - Use URLSearchParams for optional query parameters
   - Build path with conditional query string: `/path${query ? `?${query}` : ''}`
   - Return array of RRD data points with JSON formatting
   - Show first 5 points in output using formatJsonBlock helper

2. **Query parameter handling**: Optional timeframe and cf parameters
   - Only add to URLSearchParams if provided
   - Timeframe enum: 'hour', 'day', 'week', 'month', 'year'
   - CF enum: 'AVERAGE', 'MAX'
   - Pattern: `if (validated.param) params.set('key', validated.param)`

3. **Storage RRD specifics**: Two-level path structure
   - Path: `/nodes/{node}/storage/{storage}/rrddata`
   - Storage name doesn't need validation (unlike node names)
   - Same RRD data format as node metrics

4. **Node report specifics**: Plain text response
   - Returns string (not JSON array)
   - Wrap in code block for readability
   - Pattern: `'```\n' + report + '\n```'`

5. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (268→271)
   - integration tests: Two assertions for tool count (268→271)

6. **Test output formatting**: Bullet points in output
   - Output uses `• **Points**: 2` format (with bullet and bold)
   - Tests must match exact formatting: `toContain('**Points**: 2')`

### Files Modified
- src/schemas/node.ts: +3 schemas
- src/tools/node.ts: +3 handlers (+ ProxmoxRrdDataPoint interface + formatJsonBlock helper)
- src/tools/index.ts: +3 exports
- src/types/tools.ts: +3 tool names
- src/server.ts: +3 tool descriptions
- src/tools/registry.ts: +3 registrations, updated tool count (268→271)
- src/tools/node.test.ts: +6 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (268→271)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 705 tests pass (including 6 new tests)
- ✅ Tool count: 268 → 271 (3 new tools)

### API Endpoints Implemented
- GET /nodes/{node}/rrddata (with optional timeframe/cf params)
- GET /nodes/{node}/storage/{storage}/rrddata (with optional timeframe/cf params)
- GET /nodes/{node}/report

## Task 7: Node Replication Status, Log, and Schedule (COMPLETED)

### Implementation Pattern
- **Schemas**: 3 new schemas in system-operations.ts
  - `getNodeReplicationStatusSchema`: node, id parameters (both string, min 1)
  - `getNodeReplicationLogSchema`: node, id parameters (both string, min 1)
  - `scheduleNodeReplicationSchema`: node, id parameters (both string, min 1)

- **Handlers**: 3 functions in system-operations.ts
  - Get status: Returns replication job status as key-value pairs
  - Get log: Returns array of log entries with timestamp/message fields
  - Schedule: Requires elevated, triggers immediate replication via POST

- **Tests**: 4 tests total
  - 3 success cases (one per tool)
  - 1 elevated permission denial test (schedule only)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Replication job pattern**: Two-level path structure
   - Path: `/nodes/{node}/replication/{id}/status|log|schedule_now`
   - Both node and id are required parameters
   - No special encoding needed (unlike firewall entries)

2. **Status vs Log distinction**:
   - Status: Returns single object with status fields (ok, last_sync, next_sync, etc.)
   - Log: Returns array of log entries with timestamp and message
   - Both are read-only operations (no elevated permissions)

3. **Schedule operation**: Triggers immediate replication
   - POST to `/nodes/{node}/replication/{id}/schedule_now`
   - Requires elevated permissions (destructive action)
   - Returns simple OK response

4. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (271→274)
   - integration tests: Two assertions for tool count (271→274)

5. **Elevated operations**: Only schedule requires elevated permissions
   - Status and log are read-only (no elevated check)
   - Schedule uses `requireElevated(config, 'schedule node replication')`
   - Tests verify both permission denial and successful execution

### Files Modified
- src/schemas/system-operations.ts: +3 schemas
- src/tools/system-operations.ts: +3 handlers
- src/tools/index.ts: +3 exports
- src/types/tools.ts: +3 tool names
- src/server.ts: +3 tool descriptions
- src/tools/registry.ts: +3 registrations, updated tool count (271→274)
- src/__fixtures__/system-operations.ts: +3 sample data
- src/tools/system-operations.test.ts: +4 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (271→274)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 709 tests pass (including 4 new tests)
- ✅ Tool count: 271 → 274 (3 new tools)

### API Endpoints Implemented
- GET /nodes/{node}/replication/{id}/status (get replication status)
- GET /nodes/{node}/replication/{id}/log (get replication log)
- POST /nodes/{node}/replication/{id}/schedule_now (schedule immediate replication)

## Task 8: Pending Changes (COMPLETED)

### Implementation Pattern
- **Schemas**: 2 new schemas in vm.ts
  - `getVmPendingSchema`: node, vmid parameters (same as getVmConfigSchema)
  - `getLxcPendingSchema`: node, vmid parameters (same as getLxcConfigSchema)

- **Handlers**: 2 functions in vm-query.ts
  - Get VM pending: Returns array of pending configuration changes for QEMU VM
  - Get LXC pending: Returns array of pending configuration changes for LXC container
  - Both are read-only operations (no elevated permissions)
  - API endpoints: `/nodes/{node}/qemu/{vmid}/pending` and `/nodes/{node}/lxc/{vmid}/pending`

- **Tests**: 2 test suites (10 tests total)
  - getVmPending: 5 tests (success, empty, node validation, vmid validation, API error)
  - getLxcPending: 5 tests (success, empty, node validation, vmid validation, API error)
  - Pattern: Mock client, verify API calls, check output formatting
  - No elevated permission tests (both are read-only)

### Key Learnings
1. **Pending changes pattern**: Similar to getVMConfig pattern
   - Same parameters: node + vmid
   - Same validation: validateNodeName + validateVMID
   - Read-only operations (no elevated permissions)
   - Returns array of change objects with key/value/delete fields

2. **Output formatting**: Displays pending changes as list
   - Shows change key and value/delete fields
   - Handles empty pending changes gracefully
   - Uses emoji icons (🖥️ for VM, 📦 for LXC)

3. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (274→276)
   - integration tests: Two assertions for tool count (274→276)

4. **Test coverage**: Success cases only (no elevated tests)
   - Validation tests for node and vmid
   - API error handling
   - Empty pending changes handling

### Files Modified
- src/schemas/vm.ts: +2 schemas
- src/tools/vm-query.ts: +2 handlers
- src/tools/index.ts: +2 exports
- src/types/tools.ts: +2 tool names
- src/server.ts: +2 tool descriptions
- src/tools/registry.ts: +2 registrations, updated tool count (274→276)
- src/tools/vm-query.test.ts: +10 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (274→276)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 719 tests pass (including 10 new tests)
- ✅ Tool count: 274 → 276 (2 new tools)

### API Endpoints Implemented
- GET /nodes/{node}/qemu/{vmid}/pending (get VM pending changes)
- GET /nodes/{node}/lxc/{vmid}/pending (get LXC pending changes)

## Task 9: Feature Checks (COMPLETED)

### Implementation Pattern
- **Schemas**: 2 new schemas in vm.ts
  - `checkVmFeatureSchema`: node, vmid, feature (enum: 'snapshot', 'clone', 'copy')
  - `checkLxcFeatureSchema`: node, vmid, feature (enum: 'snapshot', 'clone', 'copy')

- **Handlers**: 2 functions in vm-query.ts
  - Check VM feature: GET /nodes/{node}/qemu/{vmid}/feature?feature={feature}
  - Check LXC feature: GET /nodes/{node}/lxc/{vmid}/feature?feature={feature}
  - Both are read-only operations (no elevated permissions)
  - Returns object with `enabled` (0 or 1) and optional `reason` field

- **Tests**: 10 tests total (5 per tool)
  - Success case: Feature available (enabled: 1)
  - Success case: Feature unavailable (enabled: 0 with reason)
  - Validation tests: node name, vmid
  - API error handling
  - Pattern: Mock client, verify API calls, check output formatting
  - No elevated permission tests (both are read-only)

### Key Learnings
1. **Feature check pattern**: Simple read-only query with feature parameter
   - Path: `/nodes/{node}/{type}/{vmid}/feature?feature={feature}`
   - Feature enum: 'snapshot', 'clone', 'copy'
   - Response: `{ enabled: 0|1, reason?: string }`
   - Similar to other VM/LXC query operations

2. **Output formatting**: Shows feature availability with emoji indicators
   - Available: `✅ Yes`
   - Unavailable: `❌ No`
   - Includes reason if provided by API
   - Uses type-specific icons (🖥️ for VM, 📦 for LXC)

3. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (276→278)
   - integration tests: Two assertions for tool count (276→278)

4. **Test coverage**: Success cases only (no elevated tests)
   - Both available and unavailable feature states
   - Validation for node and vmid
   - API error handling

### Files Modified
- src/schemas/vm.ts: +2 schemas
- src/tools/vm-query.ts: +2 handlers
- src/tools/index.ts: +2 exports
- src/types/tools.ts: +2 tool names
- src/server.ts: +2 tool descriptions
- src/tools/registry.ts: +2 registrations, updated tool count (276→278)
- src/tools/vm-query.test.ts: +10 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (276→278)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 729 tests pass (including 10 new tests)
- ✅ Tool count: 276 → 278 (2 new tools)

### API Endpoints Implemented
- GET /nodes/{node}/qemu/{vmid}/feature (check VM feature)
- GET /nodes/{node}/lxc/{vmid}/feature (check LXC feature)

## Task 10: Advanced Disk Operations (COMPLETED)

### Implementation Pattern
- **Schemas**: 4 new schemas in disk.ts
  - `initDiskGptSchema`: node, disk (required), uuid (optional)
  - `wipeDiskSchema`: node, disk (required)
  - `getNodeLvmThinSchema`: node parameter only
  - `getNodeDirectorySchema`: node parameter only

- **Handlers**: 4 functions in disk.ts
  - Init GPT: POST /nodes/{node}/disks/initgpt (ELEVATED - destructive)
  - Wipe disk: PUT /nodes/{node}/disks/wipedisk (ELEVATED - destructive)
  - Get LVM thin: GET /nodes/{node}/disks/lvmthin (read-only)
  - Get directory: GET /nodes/{node}/disks/directory (read-only)

- **Tests**: 6 tests total
  - 4 success cases (one per tool)
  - 2 elevated permission denial tests (initGpt, wipeDisk only)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Destructive operations pattern**: Init GPT and wipe disk are ELEVATED
   - Both require `requireElevated(config, 'action description')`
   - Both include warning messages about data loss
   - Tests verify both permission denial and successful execution

2. **Read-only operations**: LVM thin and directory are NOT elevated
   - No permission checks needed
   - Return formatted lists with capacity information
   - Handle empty results gracefully

3. **Optional parameters**: Init GPT supports optional UUID
   - Only include in payload if provided
   - Pattern: `if (validated.uuid) { payload.uuid = validated.uuid; }`

4. **Tree structure formatting**: LVM thin and directory use nested structures
   - LVM thin: Volume groups with physical volumes/volumes
   - Directory: Simple array of directory entries
   - Both format sizes in GB with percentage calculations

5. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (278→282)
   - integration tests: Two assertions for tool count (278→282)

6. **API endpoint patterns**:
   - Init GPT: POST with optional uuid parameter
   - Wipe disk: PUT with disk parameter
   - LVM thin: GET returns tree structure
   - Directory: GET returns array of entries

### Files Modified
- src/schemas/disk.ts: +4 schemas
- src/tools/disk.ts: +4 handlers
- src/tools/index.ts: +4 exports
- src/types/tools.ts: +4 tool names
- src/server.ts: +4 tool descriptions
- src/tools/registry.ts: +4 registrations, updated tool count (278→282)
- src/tools/disk.test.ts: +6 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (278→282)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 740 tests pass (including 6 new tests)
- ✅ Tool count: 278 → 282 (4 new tools)

### API Endpoints Implemented
- POST /nodes/{node}/disks/initgpt (initialize GPT partition table)
- PUT /nodes/{node}/disks/wipedisk (wipe disk data)
- GET /nodes/{node}/disks/lvmthin (list LVM thin pools)
- GET /nodes/{node}/disks/directory (list directory-based storage)

## Task 11: Cluster Config (COMPLETED)

### Implementation Pattern
- **Schemas**: 5 new schemas in cluster-management.ts
  - `getClusterConfigSchema`: Empty object (no params)
  - `listClusterConfigNodesSchema`: Empty object (no params)
  - `getClusterConfigNodeSchema`: node parameter (string, min 1)
  - `joinClusterSchema`: hostname, password (required), fingerprint, force (optional)
  - `getClusterTotemSchema`: Empty object (no params)

- **Handlers**: 5 functions in cluster-management.ts
  - Get config: Returns key-value pairs from API
  - List nodes: Returns array with name/nodeid fields
  - Get node: Returns specific node config by name
  - Join cluster: Requires elevated, **REDACTS password in output**
  - Get totem: Returns totem configuration as key-value pairs

- **Tests**: 6 tests total
  - 5 success cases (one per tool)
  - 1 elevated permission denial test (joinCluster only)
  - Pattern: Mock client, verify API calls, check output formatting

### Key Learnings
1. **Password redaction pattern**: Critical for security
   - Create safe copy: `const safePayload = { ...payload, password: '[REDACTED]' };`
   - Display safe version in output, never show actual password
   - Applied in joinCluster handler
   
2. **Cluster config structure**: Similar to cluster options
   - GET returns all config as key-value pairs
   - No special encoding needed for node names in this context
   - Nodes have name and nodeid fields
   
3. **Elevated operations**: Only joinCluster requires elevated permissions
   - Get/list operations are read-only (no elevated check)
   - Join is destructive (adds node to cluster)
   - Tests verify both permission denial and successful execution
   
4. **Tool count tracking**: Updated 3 places
   - registry.ts: Tool count assertion (282→287)
   - integration tests: Two assertions for tool count (282→287)
   
5. **Emoji icons**: Consistent with existing patterns
   - 🔧 for config
   - 🖥️ for nodes
   - ⚙️ for totem

### Files Modified
- src/schemas/cluster-management.ts: +5 schemas
- src/tools/cluster-management.ts: +5 handlers
- src/tools/index.ts: +5 exports
- src/types/tools.ts: +5 tool names
- src/server.ts: +5 tool descriptions
- src/tools/registry.ts: +5 registrations, updated tool count (282→287)
- src/tools/cluster-management.test.ts: +6 tests
- src/__tests__/integration/server.test.ts: Updated 2 assertions (282→287)

### Verification
- ✅ pnpm build: No errors
- ✅ pnpm test: 746 tests pass (including 6 new tests)
- ✅ Tool count: 282 → 287 (5 new tools)

### API Endpoints Implemented
- GET /cluster/config (get cluster config)
- GET /cluster/config/nodes (list cluster config nodes)
- GET /cluster/config/nodes/{node} (get cluster config node)
- POST /cluster/config/join (join cluster - ELEVATED)
- GET /cluster/config/totem (get cluster totem config)

## Task 12: Certificate Management (COMPLETED - $(date '+%Y-%m-%d %H:%M:%S'))

### Implementation Summary
Successfully implemented 7 certificate management tools across 3 new domain files.

### Files Created
1. **src/schemas/certificate.ts**: 7 Zod schemas for certificate operations
2. **src/tools/certificate.ts**: 7 handler functions for certificate management
3. **src/tools/certificate.test.ts**: 21 tests (12 required + 9 additional coverage)

### Files Modified
1. **src/tools/index.ts**: Added 7 exports from certificate.ts
2. **src/types/tools.ts**: Added 7 tool names to TOOL_NAMES array
3. **src/server.ts**: Added 7 tool descriptions to TOOL_DESCRIPTIONS
4. **src/tools/registry.ts**: 
   - Added 7 imports (handlers + schemas)
   - Added 7 tool registrations
   - Updated tool count assertion: 287 → 294
5. **src/__tests__/integration/server.test.ts**: Updated 2 count assertions (287 → 294)

### Tools Implemented
1. `proxmox_get_node_certificates` - GET /nodes/{node}/certificates/info (basic)
2. `proxmox_upload_custom_certificate` - POST /nodes/{node}/certificates/custom (elevated)
3. `proxmox_delete_custom_certificate` - DELETE /nodes/{node}/certificates/custom (elevated)
4. `proxmox_order_acme_certificate` - POST /nodes/{node}/certificates/acme/certificate (elevated)
5. `proxmox_renew_acme_certificate` - PUT /nodes/{node}/certificates/acme/certificate (elevated)
6. `proxmox_revoke_acme_certificate` - DELETE /nodes/{node}/certificates/acme/certificate (elevated)
7. `proxmox_get_node_acme_config` - GET /nodes/{node}/certificates/acme (basic)

### Key Learnings

#### API Patterns
- **client.request signature**: `client.request(path, method?, body?)` - NOT object-based
  - GET: `client.request('/path')`
  - POST: `client.request('/path', 'POST', body)`
  - PUT: `client.request('/path', 'PUT', body)`
  - DELETE: `client.request('/path', 'DELETE')`
- **requireElevated**: Returns `void`, throws on permission denial (not a ToolResponse)
- **formatErrorResponse**: Requires 2 args: `formatErrorResponse(error as Error, 'Context')`

#### Schema Design
- PEM certificate fields use `z.string()` without max length (certificates can be long)
- Optional fields for force/restart flags on certificate operations
- ACME operations share similar schema patterns (node + optional force flag)

#### Test Patterns
- Permission denial tests check for lowercase "Permission denied" (not "Permission Denied")
- Output formatting uses bold markdown: `Force:** true` (not `Force: true`)
- DELETE method calls: `client.request(path, 'DELETE')` (not object with method property)
- Test count: 21 tests total (7 success + 5 elevated denial + 9 additional coverage)

#### NEW Domain File Pattern (3-file creation)
When creating a completely new domain:
1. Create `src/schemas/{domain}.ts` with all Zod schemas
2. Create `src/tools/{domain}.ts` with all handler functions
3. Create `src/tools/{domain}.test.ts` with comprehensive tests
4. Import/export in `src/tools/index.ts`
5. Add tool names to `src/types/tools.ts`
6. Add descriptions to `src/server.ts`
7. Import and register in `src/tools/registry.ts`
8. Update tool count assertions in registry.ts and integration tests

### Verification Results
- **Build**: ✅ PASSED (pnpm build - exit 0)
- **Tests**: ✅ PASSED (767 tests, all passing)
- **Tool Count**: ✅ 287 → 294 (+7 tools)
- **Test Count**: ✅ 746 → 767 (+21 tests)

### Certificate-Specific Notes
- Custom certificates accept PEM format strings (certificates + optional key)
- ACME operations return task UPIDs for async operations
- Certificate info includes subject, issuer, fingerprint, public key details, and SANs
- ACME config shows account, domains, and plugin information

## Task 13: ACME Plugins & Accounts (COMPLETED - $(date '+%Y-%m-%d %H:%M:%S'))

### Implementation Summary
Successfully implemented 8 ACME management tools for account and plugin management.

### New Files Created
1. **src/schemas/acme.ts** (57 lines)
   - 8 Zod schemas for ACME operations
   - Pattern: Empty schemas for list operations, name/id for get/delete, full params for create/update

2. **src/tools/acme.ts** (277 lines)
   - 8 handler functions for ACME account and plugin management
   - Contact info redaction in create/update account operations
   - URL encoding for name and id parameters

3. **src/tools/acme.test.ts** (24 tests)
   - 8 success tests (one per tool)
   - 3 elevated permission denial tests (create, update, delete account)
   - 13 additional edge case tests (empty lists, URL encoding, API errors)

### Files Modified
1. **src/tools/index.ts** - Added ACME Management export section
2. **src/types/tools.ts** - Added 8 tool names with ACME Management section
3. **src/server.ts** - Added 8 tool descriptions with ACME Management section
4. **src/tools/registry.ts** - Added 8 registrations, updated count 294→302
5. **src/__tests__/integration/server.test.ts** - Updated tool count assertions 294→302

### Key Implementation Patterns

#### 1. Contact Redaction Pattern
```typescript
const safePayload = { ...payload, contact: '[REDACTED]' };
// Display safePayload instead of actual payload
```

#### 2. URL Encoding Pattern
```typescript
const encodedName = encodeURIComponent(params.name);
const path = `/cluster/acme/account/${encodedName}`;
```

#### 3. Client Request Signature
```typescript
// GET request
const result = await client.request('/path');

// POST/PUT request
const result = await client.request('/path', 'POST', payload);

// DELETE request
const result = await client.request('/path', 'DELETE');
```

#### 4. Type Casting for Unknown Results
```typescript
// For simple property access
const result = await client.request('/path') as any;

// For array iteration
if (Array.isArray(result)) {
  for (const item of result) {
    const name = (item as any).name || 'N/A';
  }
}
```

### Tools Implemented

| Tool Name | Handler | Endpoint | Method | Elevated |
|-----------|---------|----------|--------|----------|
| `proxmox_list_acme_accounts` | `listAcmeAccounts` | `/cluster/acme/account` | GET | NO |
| `proxmox_get_acme_account` | `getAcmeAccount` | `/cluster/acme/account/{name}` | GET | NO |
| `proxmox_create_acme_account` | `createAcmeAccount` | `/cluster/acme/account` | POST | YES |
| `proxmox_update_acme_account` | `updateAcmeAccount` | `/cluster/acme/account/{name}` | PUT | YES |
| `proxmox_delete_acme_account` | `deleteAcmeAccount` | `/cluster/acme/account/{name}` | DELETE | YES |
| `proxmox_list_acme_plugins` | `listAcmePlugins` | `/cluster/acme/plugins` | GET | NO |
| `proxmox_get_acme_plugin` | `getAcmePlugin` | `/cluster/acme/plugins/{id}` | GET | NO |
| `proxmox_get_acme_directories` | `getAcmeDirectories` | `/cluster/acme/directories` | GET | NO |

### Verification Results
- **Build**: ✅ PASSED (exit 0)
- **Tests**: ✅ PASSED (791 tests, +24 new tests)
- **Tool Count**: ✅ 302 (294 + 8)
- **Test Count**: ✅ 791 (767 + 24)

### Gotchas & Lessons Learned

1. **Client Request Signature**: The ProxmoxApiClient.request() signature is `(endpoint, method?, body?)`, NOT an options object. Tests must match this signature.

2. **Type Casting**: Since client.request returns `unknown`, use `as any` for complex objects or type guards for arrays.

3. **Contact Redaction**: Always redact sensitive data (contact emails) in output, even though it's sent to the API.

4. **URL Encoding**: Always use `encodeURIComponent()` for path parameters that might contain special characters.

5. **Test Expectations**: When updating client.request signature, remember to update test expectations to match the new call pattern.

### Next Steps
- Task 14: Firewall Management (remaining tools)
- Continue with remaining API endpoints from plan

