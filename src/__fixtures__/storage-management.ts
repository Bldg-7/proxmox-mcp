export const sampleStorageConfigs = [
  {
    storage: 'local',
    type: 'dir',
    content: 'iso,vztmpl,backup',
    path: '/var/lib/vz',
    nodes: 'pve1,pve2',
    shared: 0,
    disable: 0,
  },
  {
    storage: 'backup-nfs',
    type: 'nfs',
    content: 'backup',
    server: '10.0.0.10',
    export: '/exports/backups',
    shared: 1,
    disable: 0,
  },
];

export const sampleStorageConfig = {
  storage: 'backup-nfs',
  type: 'nfs',
  content: 'backup',
  server: '10.0.0.10',
  export: '/exports/backups',
  shared: 1,
  disable: 0,
};

export const sampleStorageContent = [
  {
    volid: 'local:iso/ubuntu-22.04.iso',
    content: 'iso',
    size: 2147483648,
    format: 'iso',
  },
  {
    volid: 'local:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst',
    content: 'backup',
    size: 1073741824,
    vmid: 100,
  },
];

export const sampleFileRestoreList = [
  {
    filepath: '/etc/hosts',
    type: 'file',
    size: 512,
  },
  {
    filepath: '/var/log',
    type: 'directory',
  },
];

export const samplePruneResult = {
  kept: 3,
  pruned: 5,
};
