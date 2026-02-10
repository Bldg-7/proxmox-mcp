import { z } from 'zod';

// proxmox_list_sdn_vnets - List SDN virtual networks
export const listSdnVnetsSchema = z.object({});

export type ListSdnVnetsInput = z.infer<typeof listSdnVnetsSchema>;

// proxmox_get_sdn_vnet - Get SDN virtual network by ID
export const getSdnVnetSchema = z.object({
  vnet: z.string().min(1).describe('SDN VNet identifier'),
});

export type GetSdnVnetInput = z.infer<typeof getSdnVnetSchema>;

// proxmox_create_sdn_vnet - Create SDN virtual network
export const createSdnVnetSchema = z
  .object({
    vnet: z.string().min(1).describe('SDN VNet identifier'),
    zone: z.string().optional().describe('SDN zone identifier'),
    alias: z.string().optional().describe('Alias/description'),
    comment: z.string().optional().describe('Comment or notes'),
    tag: z.number().int().optional().describe('VLAN tag'),
    vlan: z.number().int().optional().describe('VLAN ID'),
    vxlan: z.number().int().optional().describe('VXLAN ID'),
    mtu: z.number().int().optional().describe('MTU value'),
    mac: z.string().optional().describe('MAC address'),
    ipam: z.string().optional().describe('IPAM plugin'),
    type: z.string().optional().describe('VNet type'),
  })
  .passthrough();

export type CreateSdnVnetInput = z.infer<typeof createSdnVnetSchema>;

// proxmox_update_sdn_vnet - Update SDN virtual network
export const updateSdnVnetSchema = z
  .object({
    vnet: z.string().min(1).describe('SDN VNet identifier'),
    zone: z.string().optional().describe('SDN zone identifier'),
    alias: z.string().optional().describe('Alias/description'),
    comment: z.string().optional().describe('Comment or notes'),
    tag: z.number().int().optional().describe('VLAN tag'),
    vlan: z.number().int().optional().describe('VLAN ID'),
    vxlan: z.number().int().optional().describe('VXLAN ID'),
    mtu: z.number().int().optional().describe('MTU value'),
    mac: z.string().optional().describe('MAC address'),
    ipam: z.string().optional().describe('IPAM plugin'),
    type: z.string().optional().describe('VNet type'),
    delete: z.string().optional().describe('Comma-separated list of options to delete'),
    digest: z.string().optional().describe('Prevent concurrent modifications'),
  })
  .passthrough();

export type UpdateSdnVnetInput = z.infer<typeof updateSdnVnetSchema>;

// proxmox_delete_sdn_vnet - Delete SDN virtual network
export const deleteSdnVnetSchema = z.object({
  vnet: z.string().min(1).describe('SDN VNet identifier'),
});

export type DeleteSdnVnetInput = z.infer<typeof deleteSdnVnetSchema>;

// proxmox_list_sdn_zones - List SDN zones
export const listSdnZonesSchema = z.object({});

export type ListSdnZonesInput = z.infer<typeof listSdnZonesSchema>;

// proxmox_get_sdn_zone - Get SDN zone by ID
export const getSdnZoneSchema = z.object({
  zone: z.string().min(1).describe('SDN zone identifier'),
});

export type GetSdnZoneInput = z.infer<typeof getSdnZoneSchema>;

// proxmox_create_sdn_zone - Create SDN zone
export const createSdnZoneSchema = z
  .object({
    zone: z.string().min(1).describe('SDN zone identifier'),
    type: z.string().optional().describe('Zone type (simple, evpn, vxlan, etc.)'),
    bridge: z.string().optional().describe('Bridge name'),
    comment: z.string().optional().describe('Comment or notes'),
    nodes: z.string().optional().describe('Nodes list (comma-separated)'),
    mtu: z.number().int().optional().describe('MTU value'),
    vxlan: z.number().int().optional().describe('VXLAN ID'),
    tag: z.number().int().optional().describe('VLAN tag'),
    ipam: z.string().optional().describe('IPAM plugin'),
  })
  .passthrough();

export type CreateSdnZoneInput = z.infer<typeof createSdnZoneSchema>;

// proxmox_update_sdn_zone - Update SDN zone
export const updateSdnZoneSchema = z
  .object({
    zone: z.string().min(1).describe('SDN zone identifier'),
    type: z.string().optional().describe('Zone type (simple, evpn, vxlan, etc.)'),
    bridge: z.string().optional().describe('Bridge name'),
    comment: z.string().optional().describe('Comment or notes'),
    nodes: z.string().optional().describe('Nodes list (comma-separated)'),
    mtu: z.number().int().optional().describe('MTU value'),
    vxlan: z.number().int().optional().describe('VXLAN ID'),
    tag: z.number().int().optional().describe('VLAN tag'),
    ipam: z.string().optional().describe('IPAM plugin'),
    delete: z.string().optional().describe('Comma-separated list of options to delete'),
    digest: z.string().optional().describe('Prevent concurrent modifications'),
  })
  .passthrough();

export type UpdateSdnZoneInput = z.infer<typeof updateSdnZoneSchema>;

// proxmox_delete_sdn_zone - Delete SDN zone
export const deleteSdnZoneSchema = z.object({
  zone: z.string().min(1).describe('SDN zone identifier'),
});

export type DeleteSdnZoneInput = z.infer<typeof deleteSdnZoneSchema>;

// proxmox_list_sdn_controllers - List SDN controllers
export const listSdnControllersSchema = z.object({});

export type ListSdnControllersInput = z.infer<typeof listSdnControllersSchema>;

// proxmox_get_sdn_controller - Get SDN controller by ID
export const getSdnControllerSchema = z.object({
  controller: z.string().min(1).describe('SDN controller identifier'),
});

export type GetSdnControllerInput = z.infer<typeof getSdnControllerSchema>;

// proxmox_create_sdn_controller - Create SDN controller
export const createSdnControllerSchema = z
  .object({
    controller: z.string().min(1).describe('SDN controller identifier'),
    type: z.string().optional().describe('Controller type'),
    ip: z.string().optional().describe('Controller IP address'),
    port: z.number().int().optional().describe('Controller port'),
    token: z.string().optional().describe('Access token'),
    secret: z.string().optional().describe('Shared secret'),
    zone: z.string().optional().describe('Associated SDN zone'),
    comment: z.string().optional().describe('Comment or notes'),
  })
  .passthrough();

export type CreateSdnControllerInput = z.infer<typeof createSdnControllerSchema>;

// proxmox_update_sdn_controller - Update SDN controller
export const updateSdnControllerSchema = z
  .object({
    controller: z.string().min(1).describe('SDN controller identifier'),
    type: z.string().optional().describe('Controller type'),
    ip: z.string().optional().describe('Controller IP address'),
    port: z.number().int().optional().describe('Controller port'),
    token: z.string().optional().describe('Access token'),
    secret: z.string().optional().describe('Shared secret'),
    zone: z.string().optional().describe('Associated SDN zone'),
    comment: z.string().optional().describe('Comment or notes'),
    delete: z.string().optional().describe('Comma-separated list of options to delete'),
    digest: z.string().optional().describe('Prevent concurrent modifications'),
  })
  .passthrough();

export type UpdateSdnControllerInput = z.infer<typeof updateSdnControllerSchema>;

// proxmox_delete_sdn_controller - Delete SDN controller
export const deleteSdnControllerSchema = z.object({
  controller: z.string().min(1).describe('SDN controller identifier'),
});

export type DeleteSdnControllerInput = z.infer<typeof deleteSdnControllerSchema>;

// proxmox_list_sdn_subnets - List SDN subnets
export const listSdnSubnetsSchema = z.object({});

export type ListSdnSubnetsInput = z.infer<typeof listSdnSubnetsSchema>;

// proxmox_get_sdn_subnet - Get SDN subnet by ID
export const getSdnSubnetSchema = z.object({
  subnet: z.string().min(1).describe('SDN subnet identifier'),
});

export type GetSdnSubnetInput = z.infer<typeof getSdnSubnetSchema>;

// proxmox_create_sdn_subnet - Create SDN subnet
export const createSdnSubnetSchema = z
  .object({
    subnet: z.string().min(1).describe('SDN subnet identifier'),
    vnet: z.string().optional().describe('Associated SDN VNet'),
    cidr: z.string().optional().describe('CIDR range (e.g., 10.0.0.0/24)'),
    gateway: z.string().optional().describe('Gateway IP address'),
    dhcp: z.boolean().optional().describe('Enable DHCP'),
    snat: z.boolean().optional().describe('Enable source NAT'),
    dns: z.string().optional().describe('DNS servers list'),
    mtu: z.number().int().optional().describe('MTU value'),
    ipam: z.string().optional().describe('IPAM plugin'),
    comment: z.string().optional().describe('Comment or notes'),
  })
  .passthrough();

export type CreateSdnSubnetInput = z.infer<typeof createSdnSubnetSchema>;

// proxmox_update_sdn_subnet - Update SDN subnet
export const updateSdnSubnetSchema = z
  .object({
    subnet: z.string().min(1).describe('SDN subnet identifier'),
    vnet: z.string().optional().describe('Associated SDN VNet'),
    cidr: z.string().optional().describe('CIDR range (e.g., 10.0.0.0/24)'),
    gateway: z.string().optional().describe('Gateway IP address'),
    dhcp: z.boolean().optional().describe('Enable DHCP'),
    snat: z.boolean().optional().describe('Enable source NAT'),
    dns: z.string().optional().describe('DNS servers list'),
    mtu: z.number().int().optional().describe('MTU value'),
    ipam: z.string().optional().describe('IPAM plugin'),
    comment: z.string().optional().describe('Comment or notes'),
    delete: z.string().optional().describe('Comma-separated list of options to delete'),
    digest: z.string().optional().describe('Prevent concurrent modifications'),
  })
  .passthrough();

export type UpdateSdnSubnetInput = z.infer<typeof updateSdnSubnetSchema>;

// proxmox_delete_sdn_subnet - Delete SDN subnet
export const deleteSdnSubnetSchema = z.object({
  subnet: z.string().min(1).describe('SDN subnet identifier'),
});

export type DeleteSdnSubnetInput = z.infer<typeof deleteSdnSubnetSchema>;

// ── Consolidated: proxmox_sdn_vnet ────────────────────────────────────────
export const sdnVnetToolSchema = z.discriminatedUnion('action', [
  listSdnVnetsSchema.extend({
    action: z.literal('list'),
  }),
  getSdnVnetSchema.extend({
    action: z.literal('get'),
  }),
  createSdnVnetSchema.extend({
    action: z.literal('create'),
  }),
  updateSdnVnetSchema.extend({
    action: z.literal('update'),
  }),
  deleteSdnVnetSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type SdnVnetToolInput = z.infer<typeof sdnVnetToolSchema>;

// ── Consolidated: proxmox_sdn_zone ────────────────────────────────────────
export const sdnZoneToolSchema = z.discriminatedUnion('action', [
  listSdnZonesSchema.extend({
    action: z.literal('list'),
  }),
  getSdnZoneSchema.extend({
    action: z.literal('get'),
  }),
  createSdnZoneSchema.extend({
    action: z.literal('create'),
  }),
  updateSdnZoneSchema.extend({
    action: z.literal('update'),
  }),
  deleteSdnZoneSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type SdnZoneToolInput = z.infer<typeof sdnZoneToolSchema>;

// ── Consolidated: proxmox_sdn_controller ──────────────────────────────────
export const sdnControllerToolSchema = z.discriminatedUnion('action', [
  listSdnControllersSchema.extend({
    action: z.literal('list'),
  }),
  getSdnControllerSchema.extend({
    action: z.literal('get'),
  }),
  createSdnControllerSchema.extend({
    action: z.literal('create'),
  }),
  updateSdnControllerSchema.extend({
    action: z.literal('update'),
  }),
  deleteSdnControllerSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type SdnControllerToolInput = z.infer<typeof sdnControllerToolSchema>;

// ── Consolidated: proxmox_sdn_subnet ──────────────────────────────────────
export const sdnSubnetToolSchema = z.discriminatedUnion('action', [
  listSdnSubnetsSchema.extend({
    action: z.literal('list'),
  }),
  getSdnSubnetSchema.extend({
    action: z.literal('get'),
  }),
  createSdnSubnetSchema.extend({
    action: z.literal('create'),
  }),
  updateSdnSubnetSchema.extend({
    action: z.literal('update'),
  }),
  deleteSdnSubnetSchema.extend({
    action: z.literal('delete'),
  }),
]);

export type SdnSubnetToolInput = z.infer<typeof sdnSubnetToolSchema>;
