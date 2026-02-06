# Proxmox SDN Networking

> Software-Defined Networking: VNets, zones, controllers, and subnets.

**Tools in this file:** 20  
**Generated:** 2026-02-06T10:49:51.723Z

---

## Tools

#### `proxmox_create_sdn_controller`

**Description:** Create an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |
| `type` | unknown | No | - |
| `ip` | unknown | No | - |
| `port` | unknown | No | - |
| `token` | unknown | No | - |
| `secret` | unknown | No | - |
| `zone` | unknown | No | - |
| `comment` | unknown | No | - |

---

#### `proxmox_create_sdn_subnet`

**Description:** Create an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |
| `vnet` | unknown | No | - |
| `cidr` | unknown | No | - |
| `gateway` | unknown | No | - |
| `dhcp` | unknown | No | - |
| `snat` | unknown | No | - |
| `dns` | unknown | No | - |
| `mtu` | unknown | No | - |
| `ipam` | unknown | No | - |
| `comment` | unknown | No | - |

---

#### `proxmox_create_sdn_vnet`

**Description:** Create an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |
| `zone` | unknown | No | - |
| `alias` | unknown | No | - |
| `comment` | unknown | No | - |
| `tag` | unknown | No | - |
| `vlan` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `mtu` | unknown | No | - |
| `mac` | unknown | No | - |
| `ipam` | unknown | No | - |
| `type` | unknown | No | - |

---

#### `proxmox_create_sdn_zone`

**Description:** Create an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |
| `type` | unknown | No | - |
| `bridge` | unknown | No | - |
| `comment` | unknown | No | - |
| `nodes` | unknown | No | - |
| `mtu` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `tag` | unknown | No | - |
| `ipam` | unknown | No | - |

---

#### `proxmox_delete_sdn_controller`

**Description:** Delete an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

---

#### `proxmox_delete_sdn_subnet`

**Description:** Delete an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

---

#### `proxmox_delete_sdn_vnet`

**Description:** Delete an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

---

#### `proxmox_delete_sdn_zone`

**Description:** Delete an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

---

#### `proxmox_get_sdn_controller`

**Description:** Get an SDN controller by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |

---

#### `proxmox_get_sdn_subnet`

**Description:** Get an SDN subnet by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |

---

#### `proxmox_get_sdn_vnet`

**Description:** Get an SDN virtual network by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |

---

#### `proxmox_get_sdn_zone`

**Description:** Get an SDN zone by name

**Permission:** basic

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |

---

#### `proxmox_list_sdn_controllers`

**Description:** List SDN controllers

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_sdn_subnets`

**Description:** List SDN subnets

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_sdn_vnets`

**Description:** List SDN virtual networks

**Permission:** basic

**Parameters:** None

---

#### `proxmox_list_sdn_zones`

**Description:** List SDN zones

**Permission:** basic

**Parameters:** None

---

#### `proxmox_update_sdn_controller`

**Description:** Update an SDN controller (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `controller` | string | Yes | SDN controller identifier |
| `type` | unknown | No | - |
| `ip` | unknown | No | - |
| `port` | unknown | No | - |
| `token` | unknown | No | - |
| `secret` | unknown | No | - |
| `zone` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_sdn_subnet`

**Description:** Update an SDN subnet (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subnet` | string | Yes | SDN subnet identifier |
| `vnet` | unknown | No | - |
| `cidr` | unknown | No | - |
| `gateway` | unknown | No | - |
| `dhcp` | unknown | No | - |
| `snat` | unknown | No | - |
| `dns` | unknown | No | - |
| `mtu` | unknown | No | - |
| `ipam` | unknown | No | - |
| `comment` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_sdn_vnet`

**Description:** Update an SDN virtual network (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `vnet` | string | Yes | SDN VNet identifier |
| `zone` | unknown | No | - |
| `alias` | unknown | No | - |
| `comment` | unknown | No | - |
| `tag` | unknown | No | - |
| `vlan` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `mtu` | unknown | No | - |
| `mac` | unknown | No | - |
| `ipam` | unknown | No | - |
| `type` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

#### `proxmox_update_sdn_zone`

**Description:** Update an SDN zone (requires elevated permissions)

**Permission:** elevated

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zone` | string | Yes | SDN zone identifier |
| `type` | unknown | No | - |
| `bridge` | unknown | No | - |
| `comment` | unknown | No | - |
| `nodes` | unknown | No | - |
| `mtu` | unknown | No | - |
| `vxlan` | unknown | No | - |
| `tag` | unknown | No | - |
| `ipam` | unknown | No | - |
| `delete` | unknown | No | - |
| `digest` | unknown | No | - |

---

