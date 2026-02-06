export const sampleCreateNetworkIface = {
  node: 'pve1',
  iface: 'vmbr1',
  type: 'bridge',
  bridge_ports: 'eth0',
  bridge_stp: 'on',
  bridge_fd: '0',
  autostart: true,
  comment: 'Secondary bridge',
};

export const sampleUpdateNetworkIface = {
  node: 'pve1',
  iface: 'vmbr1',
  bridge_ports: 'eth1',
  mtu: 9000,
  comment: 'Updated bridge config',
  delete: 'bridge_fd',
};

export const sampleApplyNetworkConfig = {
  node: 'pve1',
  revert: true,
};
