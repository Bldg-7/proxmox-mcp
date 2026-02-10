import { z } from 'zod';

// proxmox_create_network_iface - Create network interface on node
export const createNetworkIfaceSchema = z.object({
  node: z.string().min(1).describe('Node name to configure'),
  iface: z.string().min(1).describe('Interface name (e.g., vmbr0, bond0, eth0.100)'),
  type: z
    .string()
    .min(1)
    .describe('Interface type (bridge, bond, vlan, eth, OVSBridge, OVSBond, OVSIntPort, OVSPort)'),
  autostart: z.boolean().optional().describe('Start interface on boot'),
  method: z.string().optional().describe('IP configuration method (static, dhcp, manual)'),
  address: z.string().optional().describe('IPv4 address'),
  netmask: z.string().optional().describe('IPv4 netmask'),
  gateway: z.string().optional().describe('Default gateway'),
  cidr: z.string().optional().describe('CIDR notation (e.g., 192.168.1.10/24)'),
  mtu: z.number().int().optional().describe('MTU for the interface'),
  comment: z.string().optional().describe('Interface comment/description'),
  bridge_ports: z.string().optional().describe('Bridge ports (e.g., eth0,eth1)'),
  bridge_stp: z.string().optional().describe('Bridge STP setting (on/off)'),
  bridge_fd: z.string().optional().describe('Bridge forwarding delay'),
  bond_mode: z.string().optional().describe('Bond mode (e.g., active-backup, balance-rr)'),
  bond_xmit_hash_policy: z.string().optional().describe('Bond transmit hash policy'),
  bond_miimon: z.number().int().optional().describe('Bond MII monitoring interval (ms)'),
  bond_primary: z.string().optional().describe('Bond primary interface'),
  bond_slaves: z.string().optional().describe('Bond slave interfaces (comma-separated)'),
  ['vlan-id']: z.number().int().optional().describe('VLAN ID'),
  ['vlan-raw-device']: z.string().optional().describe('Raw device for VLAN'),
});

export type CreateNetworkIfaceInput = z.infer<typeof createNetworkIfaceSchema>;

// proxmox_update_network_iface - Update network interface on node
export const updateNetworkIfaceSchema = z.object({
  node: z.string().min(1).describe('Node name to configure'),
  iface: z.string().min(1).describe('Interface name to update (e.g., vmbr0, bond0, eth0.100)'),
  type: z
    .string()
    .optional()
    .describe('Interface type (bridge, bond, vlan, eth, OVSBridge, OVSBond, OVSIntPort, OVSPort)'),
  autostart: z.boolean().optional().describe('Start interface on boot'),
  method: z.string().optional().describe('IP configuration method (static, dhcp, manual)'),
  address: z.string().optional().describe('IPv4 address'),
  netmask: z.string().optional().describe('IPv4 netmask'),
  gateway: z.string().optional().describe('Default gateway'),
  cidr: z.string().optional().describe('CIDR notation (e.g., 192.168.1.10/24)'),
  mtu: z.number().int().optional().describe('MTU for the interface'),
  comment: z.string().optional().describe('Interface comment/description'),
  bridge_ports: z.string().optional().describe('Bridge ports (e.g., eth0,eth1)'),
  bridge_stp: z.string().optional().describe('Bridge STP setting (on/off)'),
  bridge_fd: z.string().optional().describe('Bridge forwarding delay'),
  bond_mode: z.string().optional().describe('Bond mode (e.g., active-backup, balance-rr)'),
  bond_xmit_hash_policy: z.string().optional().describe('Bond transmit hash policy'),
  bond_miimon: z.number().int().optional().describe('Bond MII monitoring interval (ms)'),
  bond_primary: z.string().optional().describe('Bond primary interface'),
  bond_slaves: z.string().optional().describe('Bond slave interfaces (comma-separated)'),
  ['vlan-id']: z.number().int().optional().describe('VLAN ID'),
  ['vlan-raw-device']: z.string().optional().describe('Raw device for VLAN'),
  delete: z.string().optional().describe('Comma-separated list of properties to delete'),
  digest: z.string().optional().describe('Configuration digest'),
});

export type UpdateNetworkIfaceInput = z.infer<typeof updateNetworkIfaceSchema>;

// proxmox_delete_network_iface - Delete network interface on node
export const deleteNetworkIfaceSchema = z.object({
  node: z.string().min(1).describe('Node name to configure'),
  iface: z.string().min(1).describe('Interface name to delete (e.g., vmbr0, bond0, eth0.100)'),
  digest: z.string().optional().describe('Configuration digest'),
});

export type DeleteNetworkIfaceInput = z.infer<typeof deleteNetworkIfaceSchema>;

// proxmox_apply_network_config - Apply pending network changes on node
export const applyNetworkConfigSchema = z.object({
  node: z.string().min(1).describe('Node name to configure'),
  revert: z.boolean().optional().describe('Revert pending changes instead of applying'),
});

export type ApplyNetworkConfigInput = z.infer<typeof applyNetworkConfigSchema>;

// ── Consolidated: proxmox_node_network_iface ─────────────────────────────
export const nodeNetworkIfaceToolSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    node: z.string().min(1).describe('Node name to configure'),
    iface: z.string().min(1).describe('Interface name (e.g., vmbr0, bond0, eth0.100)'),
    type: z.string().min(1).describe('Interface type (bridge, bond, vlan, eth, OVSBridge, OVSBond, OVSIntPort, OVSPort)'),
    autostart: z.boolean().optional().describe('Start interface on boot'),
    method: z.string().optional().describe('IP configuration method (static, dhcp, manual)'),
    address: z.string().optional().describe('IPv4 address'),
    netmask: z.string().optional().describe('IPv4 netmask'),
    gateway: z.string().optional().describe('Default gateway'),
    cidr: z.string().optional().describe('CIDR notation (e.g., 192.168.1.10/24)'),
    mtu: z.number().int().optional().describe('MTU for the interface'),
    comment: z.string().optional().describe('Interface comment/description'),
    bridge_ports: z.string().optional().describe('Bridge ports (e.g., eth0,eth1)'),
    bridge_stp: z.string().optional().describe('Bridge STP setting (on/off)'),
    bridge_fd: z.string().optional().describe('Bridge forwarding delay'),
    bond_mode: z.string().optional().describe('Bond mode (e.g., active-backup, balance-rr)'),
    bond_xmit_hash_policy: z.string().optional().describe('Bond transmit hash policy'),
    bond_miimon: z.number().int().optional().describe('Bond MII monitoring interval (ms)'),
    bond_primary: z.string().optional().describe('Bond primary interface'),
    bond_slaves: z.string().optional().describe('Bond slave interfaces (comma-separated)'),
    'vlan-id': z.number().int().optional().describe('VLAN ID'),
    'vlan-raw-device': z.string().optional().describe('Raw device for VLAN'),
  }),
  z.object({
    action: z.literal('update'),
    node: z.string().min(1).describe('Node name to configure'),
    iface: z.string().min(1).describe('Interface name to update'),
    type: z.string().optional().describe('Interface type'),
    autostart: z.boolean().optional().describe('Start interface on boot'),
    method: z.string().optional().describe('IP configuration method'),
    address: z.string().optional().describe('IPv4 address'),
    netmask: z.string().optional().describe('IPv4 netmask'),
    gateway: z.string().optional().describe('Default gateway'),
    cidr: z.string().optional().describe('CIDR notation'),
    mtu: z.number().int().optional().describe('MTU for the interface'),
    comment: z.string().optional().describe('Interface comment/description'),
    bridge_ports: z.string().optional().describe('Bridge ports'),
    bridge_stp: z.string().optional().describe('Bridge STP setting'),
    bridge_fd: z.string().optional().describe('Bridge forwarding delay'),
    bond_mode: z.string().optional().describe('Bond mode'),
    bond_xmit_hash_policy: z.string().optional().describe('Bond transmit hash policy'),
    bond_miimon: z.number().int().optional().describe('Bond MII monitoring interval'),
    bond_primary: z.string().optional().describe('Bond primary interface'),
    bond_slaves: z.string().optional().describe('Bond slave interfaces'),
    'vlan-id': z.number().int().optional().describe('VLAN ID'),
    'vlan-raw-device': z.string().optional().describe('Raw device for VLAN'),
    delete: z.string().optional().describe('Comma-separated list of properties to delete'),
    digest: z.string().optional().describe('Configuration digest'),
  }),
  z.object({
    action: z.literal('delete'),
    node: z.string().min(1).describe('Node name to configure'),
    iface: z.string().min(1).describe('Interface name to delete'),
    digest: z.string().optional().describe('Configuration digest'),
  }),
  z.object({
    action: z.literal('apply'),
    node: z.string().min(1).describe('Node name to configure'),
    revert: z.boolean().optional().describe('Revert pending changes instead of applying'),
  }),
]);

export type NodeNetworkIfaceToolInput = z.infer<typeof nodeNetworkIfaceToolSchema>;
