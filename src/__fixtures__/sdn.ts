export const sampleSdnVnets = [
  {
    vnet: 'vnet-prod',
    zone: 'zone-core',
    tag: 100,
    type: 'vxlan',
    alias: 'Production VNet',
  },
  {
    vnet: 'vnet-dev',
    zone: 'zone-lab',
    tag: 200,
    type: 'simple',
    alias: 'Development VNet',
  },
];

export const sampleSdnVnetDetail = {
  vnet: 'vnet-prod',
  zone: 'zone-core',
  tag: 100,
  type: 'vxlan',
  alias: 'Production VNet',
  mtu: 1500,
};

export const sampleSdnZones = [
  {
    zone: 'zone-core',
    type: 'vxlan',
    bridge: 'vmbr0',
    mtu: 1500,
  },
  {
    zone: 'zone-lab',
    type: 'simple',
    bridge: 'vmbr1',
  },
];

export const sampleSdnZoneDetail = {
  zone: 'zone-core',
  type: 'vxlan',
  bridge: 'vmbr0',
  mtu: 1500,
  nodes: 'pve1,pve2',
};

export const sampleSdnControllers = [
  {
    controller: 'ctrl-1',
    type: 'evpn',
    ip: '10.0.0.10',
  },
  {
    controller: 'ctrl-2',
    type: 'vxlan',
    ip: '10.0.0.11',
  },
];

export const sampleSdnControllerDetail = {
  controller: 'ctrl-1',
  type: 'evpn',
  ip: '10.0.0.10',
  port: 4789,
  zone: 'zone-core',
};

export const sampleSdnSubnets = [
  {
    subnet: 'subnet-prod',
    vnet: 'vnet-prod',
    cidr: '10.10.0.0/24',
    gateway: '10.10.0.1',
  },
  {
    subnet: 'subnet-dev',
    vnet: 'vnet-dev',
    cidr: '10.20.0.0/24',
    gateway: '10.20.0.1',
  },
];

export const sampleSdnSubnetDetail = {
  subnet: 'subnet-prod',
  vnet: 'vnet-prod',
  cidr: '10.10.0.0/24',
  gateway: '10.10.0.1',
  dhcp: true,
};
