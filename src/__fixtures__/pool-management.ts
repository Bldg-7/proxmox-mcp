export const samplePools = [
  {
    poolid: 'prod',
    comment: 'Production workloads',
    members: [
      {
        id: 'qemu/100',
        node: 'pve1',
        type: 'qemu',
        vmid: 100,
        status: 'running',
      },
    ],
  },
  {
    poolid: 'dev',
    comment: 'Development workloads',
    members: [],
  },
];

export const samplePool = {
  poolid: 'prod',
  comment: 'Production workloads',
  members: [
    {
      id: 'qemu/100',
      node: 'pve1',
      type: 'qemu',
      vmid: 100,
      status: 'running',
    },
    {
      id: 'lxc/200',
      node: 'pve2',
      type: 'lxc',
      vmid: 200,
      status: 'stopped',
    },
  ],
};
