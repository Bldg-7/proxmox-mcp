import type { ProxmoxSnapshot } from '../types/proxmox.js';

export const sampleSnapshots: ProxmoxSnapshot[] = [
  {
    name: 'current',
    description: 'You are here!',
  },
  {
    name: 'before-upgrade',
    description: 'Snapshot before system upgrade',
    snaptime: 1706745600,
    vmstate: 0,
    parent: 'clean-install',
  },
  {
    name: 'clean-install',
    description: 'Fresh OS install',
    snaptime: 1706659200,
    vmstate: 1,
  },
];
