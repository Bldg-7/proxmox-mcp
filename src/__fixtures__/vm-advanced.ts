import type { ProxmoxFirewallRule } from '../types/proxmox.js';

export const sampleVmRrdData: Array<Record<string, number | string | null>> = [
  {
    time: 1700000000,
    cpu: 0.12,
    mem: 2147483648,
    netin: 1048576,
    netout: 524288,
  },
  {
    time: 1700000060,
    cpu: 0.2,
    mem: 3221225472,
    netin: 2097152,
    netout: 1048576,
  },
];

export const sampleLxcRrdData: Array<Record<string, number | string | null>> = [
  {
    time: 1700000000,
    cpu: 0.05,
    mem: 1073741824,
    netin: 262144,
    netout: 131072,
  },
];

export const sampleAgentOsinfo = {
  id: 'ubuntu',
  name: 'Ubuntu',
  version: '22.04',
  kernel_release: '5.15.0-89-generic',
  kernel_version: '#99-Ubuntu SMP',
  machine: 'x86_64',
};

export const sampleAgentFsinfo = {
  filesystems: [
    {
      name: '/dev/sda1',
      type: 'ext4',
      mountpoint: '/',
      total_bytes: 32212254720,
      used_bytes: 16106127360,
    },
  ],
};

export const sampleAgentMemoryBlocks = {
  blocks: [
    {
      size: 134217728,
      used: true,
      online: true,
    },
  ],
};

export const sampleAgentInterfaces = {
  interfaces: [
    {
      name: 'eth0',
      hardware_address: '52:54:00:12:34:56',
      ip_addresses: [
        {
          ip_address: '192.168.1.100',
          ip_address_type: 'ipv4',
          prefix: 24,
        },
      ],
    },
  ],
};

export const sampleAgentTime = {
  time: 1700000123,
};

export const sampleAgentTimezone = {
  timezone: 'UTC',
  offset: 0,
};

export const sampleAgentVcpus = {
  vcpus: [
    {
      id: 0,
      online: true,
    },
  ],
};

export const sampleAgentExecResult = {
  pid: 4242,
};

export const sampleAgentExecStatus = {
  exited: true,
  exitcode: 0,
  ['out-data']: 'ok',
  ['err-data']: '',
};

export const sampleVmFirewallRules: ProxmoxFirewallRule[] = [
  {
    pos: 0,
    type: 'in',
    action: 'ACCEPT',
    proto: 'tcp',
    dport: '22',
    comment: 'Allow SSH',
  },
  {
    pos: 1,
    type: 'in',
    action: 'DROP',
    proto: 'tcp',
    dport: '23',
  },
];

export const sampleLxcFirewallRules: ProxmoxFirewallRule[] = [
  {
    pos: 0,
    type: 'out',
    action: 'ACCEPT',
    proto: 'tcp',
    dport: '443',
    comment: 'Allow HTTPS',
  },
];
