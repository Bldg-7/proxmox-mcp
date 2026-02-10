import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { TOOL_NAMES } from '../../types/tools.js';
import { handleGuestDiskResize, handleGuestDiskMove } from '../disk.js';
import { handleGuestNetwork } from '../network.js';
import { handleNodeDisk } from '../node-disk.js';

describe('Disk and network consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('proxmox_guest_disk_resize', () => {
    it('resizes VM disk when type=vm', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:vm-resize');

      const result = await handleGuestDiskResize(client, config, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        disk: 'scsi0',
        size: '+10G',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Disk Resize Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/resize', 'PUT', {
        disk: 'scsi0',
        size: '+10G',
      });
    });

    it('resizes LXC disk when type=lxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:lxc-resize');

      const result = await handleGuestDiskResize(client, config, {
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        disk: 'rootfs',
        size: '+5G',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Disk Resize Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/resize', 'PUT', {
        disk: 'rootfs',
        size: '+5G',
      });
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleGuestDiskResize(client, config, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        disk: 'scsi0',
        size: '+10G',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_guest_disk_move', () => {
    it('moves VM disk when type=vm', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:vm-move');

      const result = await handleGuestDiskMove(client, config, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        disk: 'scsi0',
        storage: 'local-lvm-2',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Disk Move Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/move_disk', 'POST', {
        disk: 'scsi0',
        storage: 'local-lvm-2',
        delete: 1,
      });
    });

    it('moves LXC disk when type=lxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:lxc-move');

      const result = await handleGuestDiskMove(client, config, {
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        disk: 'mp0',
        storage: 'local-lvm-2',
        delete: false,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Disk Move Started');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/move_volume', 'POST', {
        volume: 'mp0',
        storage: 'local-lvm-2',
        delete: 0,
      });
    });
  });

  describe('proxmox_guest_network', () => {
    it('supports action=add with type=vm', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:net-add-vm');

      const result = await handleGuestNetwork(client, config, {
        action: 'add',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr0',
        model: 'virtio',
        macaddr: 'AA:BB:CC:DD:EE:FF',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Network Added');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/config', 'PUT', {
        net0: 'model=virtio,bridge=vmbr0,macaddr=AA:BB:CC:DD:EE:FF',
      });
    });

    it('supports action=add with type=lxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:net-add-lxc');

      const result = await handleGuestNetwork(client, config, {
        action: 'add',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        net: 'net0',
        bridge: 'vmbr0',
        ip: '192.168.1.100/24',
        gw: '192.168.1.1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Network Added');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/config', 'PUT', {
        net0: 'name=eth0,bridge=vmbr0,ip=192.168.1.100/24,gw=192.168.1.1',
      });
    });

    it('supports action=update with type=vm', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request
        .mockResolvedValueOnce({ net0: 'model=virtio,bridge=vmbr0' })
        .mockResolvedValueOnce('UPID:net-update-vm');

      const result = await handleGuestNetwork(client, config, {
        action: 'update',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        net: 'net0',
        bridge: 'vmbr1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Network Updated');
      expect(client.request).toHaveBeenLastCalledWith('/nodes/pve1/qemu/100/config', 'PUT', {
        net0: 'model=virtio,bridge=vmbr1',
      });
    });

    it('supports action=remove with type=lxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:net-remove-lxc');

      const result = await handleGuestNetwork(client, config, {
        action: 'remove',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        net: 'net0',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Network Removed');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/config', 'PUT', {
        delete: 'net0',
      });
    });

    it('requires elevated permissions for all actions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleGuestNetwork(client, config, {
        action: 'remove',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        net: 'net0',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('proxmox_node_disk', () => {
    it('supports action=list without elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });
      client.request.mockResolvedValue([]);

      const result = await handleNodeDisk(client, config, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/list');
    });

    it('supports action=smart without elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });
      client.request.mockResolvedValue({ health: 'PASSED' });

      const result = await handleNodeDisk(client, config, {
        action: 'smart',
        node: 'pve1',
        disk: '/dev/sda',
        health_only: true,
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/smart?disk=%2Fdev%2Fsda&health_only=1');
    });

    it('supports action=lvm', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ leaf: false, children: [] });

      const result = await handleNodeDisk(client, config, {
        action: 'lvm',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/lvm');
    });

    it('supports action=zfs', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await handleNodeDisk(client, config, {
        action: 'zfs',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/zfs');
    });

    it('supports action=lvmthin', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ leaf: false, children: [] });

      const result = await handleNodeDisk(client, config, {
        action: 'lvmthin',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/lvmthin');
    });

    it('supports action=directory', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([]);

      const result = await handleNodeDisk(client, config, {
        action: 'directory',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/disks/directory');
    });
  });

  describe('tool-name mapping guardrails', () => {
    it('has consolidated VM disk, LXC mountpoint, and node disk admin tools', () => {
      expect(TOOL_NAMES).toContain('proxmox_vm_disk');
      expect(TOOL_NAMES).toContain('proxmox_lxc_mountpoint');
      expect(TOOL_NAMES).toContain('proxmox_node_disk_admin');
      expect(TOOL_NAMES).not.toContain('proxmox_add_disk_vm');
      expect(TOOL_NAMES).not.toContain('proxmox_remove_disk_vm');
      expect(TOOL_NAMES).not.toContain('proxmox_add_mountpoint_lxc');
      expect(TOOL_NAMES).not.toContain('proxmox_remove_mountpoint_lxc');
      expect(TOOL_NAMES).not.toContain('proxmox_init_disk_gpt');
      expect(TOOL_NAMES).not.toContain('proxmox_wipe_disk');
    });

    it('replaces legacy resize/move/network/node-disk query tools', () => {
      expect(TOOL_NAMES).toContain('proxmox_guest_disk_resize');
      expect(TOOL_NAMES).toContain('proxmox_guest_disk_move');
      expect(TOOL_NAMES).toContain('proxmox_guest_network');
      expect(TOOL_NAMES).toContain('proxmox_node_disk');

      const legacyToolNames = [
        ['proxmox', 'resize_disk_vm'].join('_'),
        ['proxmox', 'resize_disk_lxc'].join('_'),
        ['proxmox', 'move_disk_vm'].join('_'),
        ['proxmox', 'move_disk_lxc'].join('_'),
        ['proxmox', 'add_network_vm'].join('_'),
        ['proxmox', 'add_network_lxc'].join('_'),
        ['proxmox', 'update_network_vm'].join('_'),
        ['proxmox', 'update_network_lxc'].join('_'),
        ['proxmox', 'remove_network_vm'].join('_'),
        ['proxmox', 'remove_network_lxc'].join('_'),
        ['proxmox', 'get_node_disks'].join('_'),
        ['proxmox', 'get_disk_smart'].join('_'),
        ['proxmox', 'get_node_lvm'].join('_'),
        ['proxmox', 'get_node_zfs'].join('_'),
        ['proxmox', 'get_node_lvmthin'].join('_'),
        ['proxmox', 'get_node_directory'].join('_'),
      ];

      for (const legacyToolName of legacyToolNames) {
        expect(TOOL_NAMES).not.toContain(legacyToolName as (typeof TOOL_NAMES)[number]);
      }
    });
  });
});
