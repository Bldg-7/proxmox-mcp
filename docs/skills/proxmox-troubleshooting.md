# Proxmox MCP Troubleshooting Guide

> Common issues, API quirks, and solutions for the Proxmox MCP server

---

## API Quirks and Limitations

### POST/PUT Encoding

**Issue**: Proxmox API requires `application/x-www-form-urlencoded` for POST and PUT requests, not JSON.

**Impact**: The MCP server handles this automatically, but if you're debugging or extending the codebase, be aware that request bodies must be form-encoded.

**Implementation**: See `src/api/client.ts` - the client automatically converts JSON payloads to form-encoded format.

```typescript
// Correct (handled by client):
await client.post('/api2/json/nodes/pve1/qemu', {
  vmid: 100,
  name: 'my-vm'
});

// Incorrect (would fail):
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vmid: 100 })
});
```

---

### DELETE Parameters

**Issue**: DELETE requests must pass parameters in the query string, not the request body.

**Impact**: The MCP server handles this automatically. Parameters are moved to the URL query string for DELETE operations.

**Implementation**: See `src/api/client.ts` - DELETE requests automatically serialize params to query string.

---

### 500 Errors for Missing Resources

**Issue**: Proxmox returns HTTP 500 (Internal Server Error) instead of 404 (Not Found) when a resource doesn't exist.

**Example**:
```
GET /api2/json/nodes/pve1/qemu/999/status
→ 500 Internal Server Error (VM 999 doesn't exist)
```

**Solution**: Treat 500 errors as potential "resource not found" errors. Always verify resource existence before operations:

```
1. List VMs: proxmox_guest_list()
2. Verify VMID exists in list
3. Then perform operation on that VMID
```

---

### LXC Command Execution Not Available

**Issue**: LXC containers do not support command execution via the Proxmox API. Only QEMU VMs with guest agent support `proxmox_agent_exec`.

**Why**: The Proxmox API only exposes QEMU guest agent functionality, not LXC `pct exec`.

**Workaround**: Use SSH or `pct exec` directly on the Proxmox node:
```bash
# On Proxmox node:
pct exec 200 -- /bin/bash -c "your-command"
```

**Tools Affected**:
- ❌ `proxmox_agent_exec` - Only works with QEMU VMs
- ✅ `proxmox_guest_start`, `proxmox_guest_stop` - Work fine
- ✅ `proxmox_guest_status` - Works fine

---

### `/nodes/{node}/execute` Requires root@pam

**Issue**: The `/nodes/{node}/execute` endpoint requires `root@pam` authentication and does NOT work with API tokens.

**Impact**: Cannot execute arbitrary commands on Proxmox nodes via MCP when using API token authentication.

**Solution**: Use specific API endpoints instead of generic command execution:
- Use `proxmox_node_service` for service management
- Use `proxmox_node_log` for log access
- Use `proxmox_node_task` for task monitoring

---

### LXC net0 Networking Quirk

**Issue**: Creating an LXC container with `net0` parameter creates the veth interface in Proxmox, but the guest OS must configure its own networking.

**Example**:
```javascript
proxmox_create_lxc({
  node: "pve1",
  vmid: 200,
  net0: "name=eth0,bridge=vmbr0,ip=dhcp"
})
// ✅ Creates veth interface
// ❌ Guest OS still needs DHCP client or static IP configuration
```

**Solution**: After container creation:
1. Start the container
2. Configure networking inside the guest:
   - **DHCP**: Ensure DHCP client is running (usually automatic)
   - **Static IP**: Edit `/etc/netplan/01-netcfg.yaml` or `/etc/network/interfaces`

**Common mistake**: Assuming `ip=dhcp` in `net0` automatically configures the guest. It only tells Proxmox to allow DHCP; the guest must request it.

---

## Common Error Codes

### 400 Bad Request

**Cause**: Invalid parameters or malformed request.

**Common Issues**:
- Missing required parameters
- Invalid parameter values (e.g., negative VMID)
- Incorrect parameter types (string instead of number)

**Solution**: Verify parameters match tool schema. Use `scripts/tool-docs.json` to check required parameters.

---

### 401 Unauthorized

**Cause**: Authentication failed.

**Common Issues**:
- Invalid API token name or value
- Token expired or revoked
- Missing `PVEAPIToken` header format

**Solution**:
1. Verify `PROXMOX_TOKEN_NAME` and `PROXMOX_TOKEN_VALUE` are correct
2. Check token permissions in Proxmox UI
3. Ensure token format: `user@realm!tokenname=value`

---

### 403 Forbidden

**Cause**: Authenticated but lacking permissions.

**Common Issues**:
- API token lacks required privileges
- User lacks permissions for the operation
- Resource is in a restricted pool

**Solution**:
1. Check API token permissions in Proxmox UI (Datacenter → Permissions → API Tokens)
2. Verify user has appropriate role (PVEAdmin, PVEVMAdmin, etc.)
3. Check pool permissions if resource is in a pool

---

### 500 Internal Server Error

**Cause**: Server-side error OR resource not found (Proxmox quirk).

**Common Issues**:
- Resource doesn't exist (VM, container, storage, etc.)
- Invalid operation for resource state (e.g., start already-running VM)
- Backend service failure

**Solution**:
1. **First**: Check if resource exists via list/get operations
2. **Then**: Verify resource state is appropriate for operation
3. **Finally**: Check Proxmox logs if issue persists

---

### 501 Not Implemented

**Cause**: Endpoint or feature not supported.

**Common Issues**:
- Using wrong content-type (should be form-encoded)
- Endpoint doesn't exist in your Proxmox version
- Feature requires additional Proxmox packages

**Solution**:
1. Verify Proxmox VE version compatibility
2. Check if feature requires additional packages (e.g., Ceph, SDN)
3. Ensure MCP server is using correct API endpoints

---

## Permission Issues

### Elevated Operations Blocked

**Issue**: Tools marked with 🔒 fail even with valid credentials.

**Cause**: `PROXMOX_ALLOW_ELEVATED` environment variable not set to `true`.

**Solution**:
```bash
export PROXMOX_ALLOW_ELEVATED=true
```

**Why**: Safety feature to prevent accidental destructive operations. Elevated operations include:
- Create/delete VMs and containers
- Modify storage
- Change cluster configuration
- Execute commands

---

### API Token vs User Permissions

**Issue**: API token has different permissions than the user who created it.

**Explanation**: API tokens have their own permission set, separate from the user.

**Solution**:
1. Go to Datacenter → Permissions → API Tokens in Proxmox UI
2. Edit token permissions
3. Grant required privileges (e.g., `PVEVMAdmin` for VM management)

---

## SSL Certificate Issues

### Self-Signed Certificate Errors

**Issue**: `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or similar SSL errors.

**Cause**: Proxmox uses self-signed certificate by default.

**Solution**: Use `PROXMOX_SSL_MODE=verify` to allow self-signed certificates:
```bash
export PROXMOX_SSL_MODE=verify
```

**Options**:
- `strict`: Full verification (production with valid cert)
- `verify`: Allow self-signed (development/testing)
- `insecure`: No verification (NOT recommended)

---

## Connection Issues

### ECONNREFUSED

**Cause**: Cannot connect to Proxmox server.

**Common Issues**:
- Wrong hostname/IP in `PROXMOX_HOST`
- Firewall blocking port 8006
- Proxmox API service not running

**Solution**:
1. Verify `PROXMOX_HOST` is correct: `ping $PROXMOX_HOST`
2. Check port is open: `telnet $PROXMOX_HOST 8006`
3. Verify Proxmox API service: `systemctl status pveproxy` (on Proxmox node)

---

### Timeout Errors

**Cause**: Request taking too long.

**Common Issues**:
- Large backup/restore operations
- Slow storage backend
- Network latency

**Solution**:
1. Use task-based operations for long-running tasks
2. Monitor task status via `proxmox_node_task()`
3. Increase timeout if needed (not currently configurable in MCP)

---

## Debugging Tips

### Enable Verbose Logging

The MCP server uses Pino for structured logging. Check logs for detailed error information.

### Verify API Endpoint

Test Proxmox API directly:
```bash
curl -k -H "Authorization: PVEAPIToken=user@pam!token=secret" \
  https://pve.example.com:8006/api2/json/nodes
```

### Check Proxmox Logs

On the Proxmox node:
```bash
# API proxy logs
journalctl -u pveproxy -f

# System logs
tail -f /var/log/syslog

# Task logs
cat /var/log/pve/tasks/*
```

### Verify Tool Parameters

Use `scripts/tool-docs.json` to verify exact parameter requirements:
```bash
cat scripts/tool-docs.json | jq '.tools[] | select(.name == "proxmox_create_vm")'
```

---

## Known Limitations

### No Bulk Operations

The MCP server operates on individual resources. For bulk operations, call tools multiple times.

### No Streaming Output

Command execution (`proxmox_agent_exec`) does not stream output. Results are returned after command completes.

### No File Upload via MCP

ISO/template uploads must be done via Proxmox UI or direct API calls. The MCP server can list and use uploaded files.

### No Console Access

Interactive console access (VNC/SPICE) is not available via MCP. Use Proxmox UI for console access.

---

## Getting Help

### Check Documentation

1. **MCP Tools Reference**: `docs/TOOLS.md` - Complete tool list
2. **Skills Documentation**: `docs/skills/proxmox-mcp.md` - AI-optimized reference
3. **Workflows**: `docs/skills/proxmox-workflows.md` - Common patterns

### Proxmox API Documentation

Official API docs: https://pve.proxmox.com/pve-docs/api-viewer/

### Report Issues

GitHub repository: https://github.com/Bldg-7/proxmox-mcp

Include:
- MCP server version
- Proxmox VE version
- Error message and stack trace
- Steps to reproduce
