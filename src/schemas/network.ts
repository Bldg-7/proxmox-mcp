import { z } from 'zod';

// proxmox_add_network_vm - Add network interface to QEMU VM
export const addNetworkVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  net: z.string().min(1).describe('Network interface name (net0, net1, net2, etc.)'),
  bridge: z.string().min(1).describe('Bridge name (e.g., vmbr0, vmbr1)'),
  model: z.string().default('virtio').describe('Network model (virtio, e1000, rtl8139, vmxnet3)'),
  macaddr: z.string().optional().describe('MAC address (XX:XX:XX:XX:XX:XX) - auto-generated if not specified'),
  vlan: z.number().optional().describe('VLAN tag (1-4094)'),
  firewall: z.boolean().optional().describe('Enable firewall on this interface'),
});

export type AddNetworkVmInput = z.infer<typeof addNetworkVmSchema>;

// proxmox_add_network_lxc - Add network interface to LXC container
export const addNetworkLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  net: z.string().min(1).describe('Network interface name (net0, net1, net2, etc.)'),
  bridge: z.string().min(1).describe('Bridge name (e.g., vmbr0, vmbr1)'),
  ip: z.string().optional().describe('IP address (dhcp, 192.168.1.100/24, auto)'),
  gw: z.string().optional().describe('Gateway IP address'),
  firewall: z.boolean().optional().describe('Enable firewall on this interface'),
});

export type AddNetworkLxcInput = z.infer<typeof addNetworkLxcSchema>;

// proxmox_update_network_vm - Update/modify VM network interface configuration
export const updateNetworkVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  net: z.string().min(1).describe('Network interface name to update (net0, net1, net2, etc.)'),
  bridge: z.string().optional().describe('Bridge name (e.g., vmbr0, vmbr1)'),
  model: z.string().optional().describe('Network model (virtio, e1000, rtl8139, vmxnet3)'),
  macaddr: z.string().optional().describe('MAC address (XX:XX:XX:XX:XX:XX)'),
  vlan: z.number().optional().describe('VLAN tag (1-4094)'),
  firewall: z.boolean().optional().describe('Enable firewall on this interface'),
});

export type UpdateNetworkVmInput = z.infer<typeof updateNetworkVmSchema>;

// proxmox_update_network_lxc - Update/modify LXC network interface configuration
export const updateNetworkLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  net: z.string().min(1).describe('Network interface name to update (net0, net1, net2, etc.)'),
  bridge: z.string().optional().describe('Bridge name (e.g., vmbr0, vmbr1)'),
  ip: z.string().optional().describe('IP address (dhcp, 192.168.1.100/24, auto)'),
  gw: z.string().optional().describe('Gateway IP address'),
  firewall: z.boolean().optional().describe('Enable firewall on this interface'),
});

export type UpdateNetworkLxcInput = z.infer<typeof updateNetworkLxcSchema>;

// proxmox_remove_network_vm - Remove network interface from QEMU VM
export const removeNetworkVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
  net: z.string().min(1).describe('Network interface name to remove (net0, net1, net2, etc.)'),
});

export type RemoveNetworkVmInput = z.infer<typeof removeNetworkVmSchema>;

// proxmox_remove_network_lxc - Remove network interface from LXC container
export const removeNetworkLxcSchema = z.object({
  node: z.string().min(1).describe('Node name where container is located'),
  vmid: z.coerce.number().describe('Container ID number'),
  net: z.string().min(1).describe('Network interface name to remove (net0, net1, net2, etc.)'),
});

export type RemoveNetworkLxcInput = z.infer<typeof removeNetworkLxcSchema>;
