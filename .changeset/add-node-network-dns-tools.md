---
"@bldg-7/proxmox-mcp": minor
---

Add node-level network and DNS query tools

- `proxmox_get_node_network`: List network interfaces on a node with optional type filtering (bridge, bond, eth, alias, vlan, OVS, unknown)
- `proxmox_get_node_dns`: Get DNS configuration for a specific node (nameservers, search domain)
- `proxmox_get_network_iface`: Get detailed configuration for a specific network interface
- All tools are read-only and do not require elevated permissions
- Tool count: 61 → 64
