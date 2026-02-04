import type { ProxmoxBackup } from '../types/proxmox.js';

export const sampleBackups: ProxmoxBackup[] = [
  {
    volid: 'local:backup/vzdump-qemu-100-2024_02_01-03_00_00.vma.zst',
    format: 'vma.zst',
    size: 4294967296,
    ctime: 1706752800,
    content: 'backup',
    vmid: 100,
    notes: 'Scheduled daily backup',
    subtype: 'qemu',
  },
  {
    volid: 'local:backup/vzdump-lxc-200-2024_02_01-03_30_00.tar.zst',
    format: 'tar.zst',
    size: 1073741824,
    ctime: 1706754600,
    content: 'backup',
    vmid: 200,
    subtype: 'lxc',
  },
  {
    volid: 'nfs-backup:backup/vzdump-qemu-100-2024_01_31-03_00_00.vma.zst',
    format: 'vma.zst',
    size: 4294967296,
    ctime: 1706666400,
    content: 'backup',
    vmid: 100,
    notes: 'Scheduled daily backup',
    subtype: 'qemu',
  },
];
