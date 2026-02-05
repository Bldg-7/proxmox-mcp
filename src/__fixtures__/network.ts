import type { ProxmoxNetwork, ProxmoxDNS } from '../types/proxmox';

// Network interfaces with various types
export const sampleNetworkInterfaces: ProxmoxNetwork[] = [
  {
    iface: 'vmbr0',
    type: 'bridge',
    active: 1,
    autostart: 1,
    method: 'static',
    address: '192.168.1.100',
    netmask: '255.255.255.0',
    gateway: '192.168.1.1',
    bridge_ports: 'eth0',
    bridge_stp: 'off',
    bridge_fd: '0',
  },
  {
    iface: 'eth0',
    type: 'physical',
    active: 1,
    autostart: 1,
    method: 'manual',
  },
  {
    iface: 'bond0',
    type: 'bond',
    active: 1,
    autostart: 1,
    method: 'static',
    address: '10.0.0.50',
    netmask: '255.255.255.0',
    gateway: '10.0.0.1',
  },
  {
    iface: 'eth0.100',
    type: 'vlan',
    active: 1,
    autostart: 1,
    method: 'static',
    address: '172.16.0.10',
    netmask: '255.255.255.0',
    cidr: '172.16.0.10/24',
  },
];

// Empty network list
export const emptyNetworkList: ProxmoxNetwork[] = [];

// DNS configuration with all fields
export const sampleDnsConfig: ProxmoxDNS = {
  search: 'example.com internal.local',
  dns1: '8.8.8.8',
  dns2: '8.8.4.4',
  dns3: '1.1.1.1',
};

// DNS configuration with partial fields
export const partialDnsConfig: ProxmoxDNS = {
  search: 'example.com',
  dns1: '192.168.1.1',
};

// Detailed network interface
export const sampleInterfaceDetail: ProxmoxNetwork = {
  iface: 'vmbr0',
  type: 'bridge',
  active: 1,
  autostart: 1,
  method: 'static',
  address: '192.168.1.100',
  netmask: '255.255.255.0',
  gateway: '192.168.1.1',
  bridge_ports: 'eth0',
  bridge_stp: 'off',
  bridge_fd: '0',
  families: ['inet'],
  priority: 0,
};
