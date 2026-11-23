---
"@bldg-7/proxmox-mcp": patch
---

Fix tools that did not match the Proxmox API, found on a live cluster

- `proxmox_agent_exec`: send the command and `args` as one array, as PVE expects. `timeout` and `capture-output=false` now return a clear error instead of a PVE 400; read output with `operation=status`.
- `proxmox_apt` `versions`: read the capitalized PVE fields (`Package`, `Version`, `RunningKernel`, ...) and filter by `package` locally.
- `proxmox_node_task`: accept UPIDs from API tokens (`user@realm!token`), read task details from `/status`, and list active and archived tasks (`source=all`, with optional `limit`, `vmid`, `typefilter`).
- `proxmox_guest_pending`: show only real pending changes, with the current and pending values.
- `proxmox_agent_info` `ping`: no more `[object Object]` output.
- `proxmox_storage_config` `cluster_usage`: `node` is optional; per-node usage is no longer merged by storage name.
- VM list: CPU usage is no longer computed from memory.
