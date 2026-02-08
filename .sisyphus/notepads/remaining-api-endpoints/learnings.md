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
