import { describe, it, expect } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  addDiskVM,
  addMountpointLxc,
  resizeDiskVM,
  resizeDiskLxc,
  removeDiskVM,
  removeMountpointLxc,
  moveDiskVM,
  moveDiskLxc,
  getNodeZfs,
  getDiskSmart,
  getNodeLvm,
  getNodeDisks,
} from './disk.js';
import { sampleZfsData, noZfsPools, sampleLvmData, noLvmConfigured, sampleDiskList, emptyDiskList } from '../__fixtures__/disks.js';

describe('addDiskVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await addDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      storage: 'local-lvm',
      size: '10',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('adds disk with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await addDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      storage: 'local-lvm',
      size: '10',
    });

    expect(result.content[0].text).toContain('💿');
    expect(result.content[0].text).toContain('VM Disk Addition Started');
    expect(result.content[0].text).toContain('scsi0');
    expect(result.content[0].text).toContain('10 GB');
    expect(result.content[0].text).toContain('local-lvm');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    await addDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'virtio1',
      storage: 'local-lvm',
      size: '20',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/config',
      'PUT',
      {
        virtio1: 'local-lvm:20',
      }
    );
  });

  it('shows disk naming conventions in output', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234');

    const result = await addDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'sata0',
      storage: 'local-lvm',
      size: '50',
    });

    expect(result.content[0].text).toContain('SCSI: scsi0-15');
    expect(result.content[0].text).toContain('VirtIO: virtio0-15');
    expect(result.content[0].text).toContain('SATA: sata0-5');
    expect(result.content[0].text).toContain('IDE: ide0-3');
  });
});

describe('addMountpointLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await addMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp0',
      storage: 'local-lvm',
      size: '10',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('adds mount point with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001235');

    const result = await addMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp0',
      storage: 'local-lvm',
      size: '10',
    });

    expect(result.content[0].text).toContain('💿');
    expect(result.content[0].text).toContain('LXC Mount Point Addition Started');
    expect(result.content[0].text).toContain('mp0');
    expect(result.content[0].text).toContain('200');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001235');

    await addMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp1',
      storage: 'local-lvm',
      size: '20',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/config',
      'PUT',
      {
        mp1: 'local-lvm:20',
      }
    );
  });
});

describe('resizeDiskVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await resizeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      size: '+10G',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('resizes disk with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001236');

    const result = await resizeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      size: '+10G',
    });

    expect(result.content[0].text).toContain('📏');
    expect(result.content[0].text).toContain('VM Disk Resize Started');
    expect(result.content[0].text).toContain('+10G');
    expect(result.content[0].text).toContain('scsi0');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001236');

    await resizeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'virtio0',
      size: '50G',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/resize',
      'PUT',
      {
        disk: 'virtio0',
        size: '50G',
      }
    );
  });

  it('shows size format examples in output', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001236');

    const result = await resizeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      size: '+10G',
    });

    expect(result.content[0].text).toContain('+10G: Add 10GB to current size');
    expect(result.content[0].text).toContain('50G: Set absolute size to 50GB');
    expect(result.content[0].text).toContain('Disks can only be expanded, not shrunk');
  });
});

describe('resizeDiskLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await resizeDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'rootfs',
      size: '+10G',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('resizes LXC disk with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001237');

    const result = await resizeDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'rootfs',
      size: '+10G',
    });

    expect(result.content[0].text).toContain('📏');
    expect(result.content[0].text).toContain('LXC Disk Resize Started');
    expect(result.content[0].text).toContain('rootfs');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001237');

    await resizeDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'mp0',
      size: '30G',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/resize',
      'PUT',
      {
        disk: 'mp0',
        size: '30G',
      }
    );
  });

  it('shows valid disk names in output', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001237');

    const result = await resizeDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'mp1',
      size: '+5G',
    });

    expect(result.content[0].text).toContain('**Valid disk names**: rootfs, mp0, mp1, mp2, etc.');
  });
});

describe('removeDiskVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await removeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi1',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('removes disk with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001238');

    const result = await removeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi1',
    });

    expect(result.content[0].text).toContain('➖');
    expect(result.content[0].text).toContain('VM Disk Removal Started');
    expect(result.content[0].text).toContain('scsi1');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001238');

    await removeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'virtio1',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/config',
      'PUT',
      {
        delete: 'virtio1',
      }
    );
  });

  it('shows warning about permanent deletion', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001238');

    const result = await removeDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'sata0',
    });

    expect(result.content[0].text).toContain('Warning');
    expect(result.content[0].text).toContain('permanently delete');
  });
});

describe('removeMountpointLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await removeMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp1',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('removes mount point with elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001239');

    const result = await removeMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp1',
    });

    expect(result.content[0].text).toContain('➖');
    expect(result.content[0].text).toContain('LXC Mount Point Removal Started');
    expect(result.content[0].text).toContain('mp1');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with correct body', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001239');

    await removeMountpointLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      mp: 'mp2',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/config',
      'PUT',
      {
        delete: 'mp2',
      }
    );
  });
});

describe('moveDiskVM', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await moveDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      storage: 'local-lvm-2',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('moves disk with elevated permissions and default delete=true', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001240');

    const result = await moveDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      storage: 'local-lvm-2',
    });

    expect(result.content[0].text).toContain('📦');
    expect(result.content[0].text).toContain('VM Disk Move Started');
    expect(result.content[0].text).toContain('scsi0');
    expect(result.content[0].text).toContain('local-lvm-2');
    expect(result.content[0].text).toContain('**Delete Source**: Yes');
    expect(result.isError).toBe(false);
  });

  it('moves disk with delete=false', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001240');

    const result = await moveDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'virtio0',
      storage: 'local-lvm-2',
      delete: false,
    });

    expect(result.content[0].text).toContain('**Delete Source**: No');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with delete=1 by default', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001240');

    await moveDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'scsi0',
      storage: 'local-lvm-2',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/move_disk',
      'POST',
      {
        disk: 'scsi0',
        storage: 'local-lvm-2',
        delete: 1,
      }
    );
  });

  it('calls correct API endpoint with delete=0 when delete=false', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001240');

    await moveDiskVM(client, config, {
      node: 'pve1',
      vmid: 100,
      disk: 'sata0',
      storage: 'local-lvm-2',
      delete: false,
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/qemu/100/move_disk',
      'POST',
      {
        disk: 'sata0',
        storage: 'local-lvm-2',
        delete: 0,
      }
    );
  });
});

describe('moveDiskLxc', () => {
  it('requires elevated permissions', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'rootfs',
      storage: 'local-lvm-2',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('moves disk with elevated permissions and default delete=true', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001241');

    const result = await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'rootfs',
      storage: 'local-lvm-2',
    });

    expect(result.content[0].text).toContain('📦');
    expect(result.content[0].text).toContain('LXC Disk Move Started');
    expect(result.content[0].text).toContain('rootfs');
    expect(result.content[0].text).toContain('local-lvm-2');
    expect(result.content[0].text).toContain('**Delete Source**: Yes');
    expect(result.isError).toBe(false);
  });

  it('moves disk with delete=false', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001241');

    const result = await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'mp0',
      storage: 'local-lvm-2',
      delete: false,
    });

    expect(result.content[0].text).toContain('**Delete Source**: No');
    expect(result.isError).toBe(false);
  });

  it('calls correct API endpoint with volume parameter and delete=1 by default', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001241');

    await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'rootfs',
      storage: 'local-lvm-2',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/move_volume',
      'POST',
      {
        volume: 'rootfs',
        storage: 'local-lvm-2',
        delete: 1,
      }
    );
  });

  it('calls correct API endpoint with delete=0 when delete=false', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001241');

    await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'mp1',
      storage: 'local-lvm-2',
      delete: false,
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/lxc/200/move_volume',
      'POST',
      {
        volume: 'mp1',
        storage: 'local-lvm-2',
        delete: 0,
      }
    );
  });

  it('shows valid volumes in output', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001241');

    const result = await moveDiskLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      disk: 'mp2',
      storage: 'local-lvm-2',
    });

     expect(result.content[0].text).toContain('**Valid volumes**: rootfs, mp0, mp1, mp2, etc.');
   });
});

describe('getDiskSmart', () => {
  it('returns SMART data successfully', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });
    const { sampleSmartData } = await import('../__fixtures__/disks.js');
    client.request.mockResolvedValue(sampleSmartData);

    const result = await getDiskSmart(client, config, {
      node: 'pve1',
      disk: '/dev/sda',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('💾');
    expect(result.content[0].text).toContain('SMART Data');
    expect(result.content[0].text).toContain('PASSED');
    expect(result.content[0].text).toContain('Reallocated_Sector_Ct');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/smart?disk=%2Fdev%2Fsda');
  });

  it('returns health only when health_only=true', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });
    const { sampleSmartData } = await import('../__fixtures__/disks.js');
    client.request.mockResolvedValue(sampleSmartData);

    const result = await getDiskSmart(client, config, {
      node: 'pve1',
      disk: '/dev/sda',
      health_only: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('PASSED');
    expect(result.content[0].text).not.toContain('Reallocated_Sector_Ct');
  });

  it('validates node name', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await getDiskSmart(client, config, {
      node: 'invalid@node',
      disk: '/dev/sda',
    });

    expect(result.isError).toBe(true);
  });

  it('validates disk parameter is provided', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig({ allowElevated: false });

    const result = await getDiskSmart(client, config, {
      node: 'pve1',
      disk: '',
    });

    expect(result.isError).toBe(true);
  });
});

describe('getNodeLvm', () => {
  it('returns LVM data successfully', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleLvmData);

    const result = await getNodeLvm(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LVM');
    expect(result.content[0].text).toContain('pve');
    expect(result.content[0].text).toContain('data');
  });

  it('validates node name', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();

    const result = await getNodeLvm(client, config, { node: '' });

    expect(result.isError).toBe(true);
  });

  it('handles no LVM configured', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(noLvmConfigured);

    const result = await getNodeLvm(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No LVM');
  });
});

describe('getNodeDisks', () => {
  it('returns disk list successfully', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleDiskList);

    const result = await getNodeDisks(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('💿');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('Found 4 disk(s)');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/list');
  });

  it('passes optional parameters to API', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleDiskList);

    await getNodeDisks(client, config, {
      node: 'pve1',
      include_partitions: true,
      skip_smart: true,
      type: 'unused',
    });

    expect(client.request).toHaveBeenCalledWith(
      '/nodes/pve1/disks/list',
      'GET',
      { 'include-partitions': true, skipsmart: true, type: 'unused' }
    );
  });

  it('validates node name', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();

    const result = await getNodeDisks(client, config, { node: 'invalid@node!' });

    expect(result.isError).toBe(true);
  });

  it('handles empty disk list', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(emptyDiskList);

    const result = await getNodeDisks(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No disks found');
  });
});

describe('getNodeZfs', () => {
  it('returns ZFS pools successfully', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleZfsData);

    const result = await getNodeZfs(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('💾');
    expect(result.content[0].text).toContain('ZFS Pools');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('rpool');
    expect(result.content[0].text).toContain('tank');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/zfs');
  });

  it('validates node name', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();

    const result = await getNodeZfs(client, config, { node: 'invalid@node!' });

    expect(result.isError).toBe(true);
  });

  it('handles no ZFS pools', async () => {
    const client = createMockProxmoxClient();
    const config = createTestConfig();
    client.request.mockResolvedValue(noZfsPools);

    const result = await getNodeZfs(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No ZFS pools found');
  });
});
