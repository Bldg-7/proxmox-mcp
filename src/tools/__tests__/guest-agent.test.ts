import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleAgentInfo,
  handleAgentHw,
  handleAgentExec,
  handleAgentFile,
  handleAgentFreeze,
  handleAgentPower,
  handleAgentUser,
} from '../vm-advanced.js';

describe('guest agent consolidated tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  // ─── proxmox_agent_info (6 operations) ───────────────────────

  describe('proxmox_agent_info', () => {
    it('supports operation=ping', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentInfo(client, config, {
        operation: 'ping',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ping');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/ping',
        'POST'
      );
    });

    it('supports operation=osinfo', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ id: 'linux', 'kernel-release': '5.15' });

      const result = await handleAgentInfo(client, config, {
        operation: 'osinfo',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('OS Information');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-osinfo'
      );
    });

    it('supports operation=fsinfo', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue([{ name: '/', total: 1024, used: 512 }]);

      const result = await handleAgentInfo(client, config, {
        operation: 'fsinfo',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Filesystem');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-fsinfo'
      );
    });

    it('supports operation=network_interfaces', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue([{ name: 'eth0' }]);

      const result = await handleAgentInfo(client, config, {
        operation: 'network_interfaces',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Network');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/network-get-interfaces'
      );
    });

    it('supports operation=time', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ time: 1700000000 });

      const result = await handleAgentInfo(client, config, {
        operation: 'time',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Time');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-time'
      );
    });

    it('supports operation=timezone', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ zone: 'UTC', offset: 0 });

      const result = await handleAgentInfo(client, config, {
        operation: 'timezone',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Timezone');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-timezone'
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentInfo(client, config, {
        operation: 'ping',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_hw (5 operations) ───────────────────────

  describe('proxmox_agent_hw', () => {
    it('supports operation=memory_blocks', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue([{ phys: 0, online: true }]);

      const result = await handleAgentHw(client, config, {
        operation: 'memory_blocks',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Memory Blocks');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-memory-blocks'
      );
    });

    it('supports operation=vcpus', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue([{ online: true, 'logical-id': 0 }]);

      const result = await handleAgentHw(client, config, {
        operation: 'vcpus',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('vCPU');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-vcpus'
      );
    });

    it('supports operation=memory_block_info', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ size: 134217728 });

      const result = await handleAgentHw(client, config, {
        operation: 'memory_block_info',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Memory Block Info');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-memory-block-info',
        'GET'
      );
    });

    it('supports operation=hostname', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ 'host-name': 'testvm' });

      const result = await handleAgentHw(client, config, {
        operation: 'hostname',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Hostname');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-host-name'
      );
    });

    it('supports operation=users', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue([
        { user: 'root', 'login-time': 1700000000 },
      ]);

      const result = await handleAgentHw(client, config, {
        operation: 'users',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Users');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/get-users'
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentHw(client, config, {
        operation: 'vcpus',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_exec (2 operations) ───────────────────────

  describe('proxmox_agent_exec', () => {
    it('supports operation=exec', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ pid: 1234 });

      const result = await handleAgentExec(client, config, {
        operation: 'exec',
        node: 'pve1',
        vmid: 100,
        command: 'ls',
        args: ['-la'],
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Command Started');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/exec',
        'POST',
        expect.objectContaining({ command: 'ls' })
      );
    });

    it('supports operation=status', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ exited: 1, exitcode: 0 });

      const result = await handleAgentExec(client, config, {
        operation: 'status',
        node: 'pve1',
        vmid: 100,
        pid: 1234,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Exec Status');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/exec-status?pid=1234'
      );
    });

    it('requires elevated permissions for exec', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentExec(client, config, {
        operation: 'exec',
        node: 'pve1',
        vmid: 100,
        command: 'ls',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_file (2 operations) ───────────────────────

  describe('proxmox_agent_file', () => {
    it('supports operation=read', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({
        content: Buffer.from('hello world').toString('base64'),
        'bytes-read': 11,
      });

      const result = await handleAgentFile(client, config, {
        operation: 'read',
        node: 'pve1',
        vmid: 100,
        file: '/etc/hostname',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('File Read');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/file-read',
        'GET',
        { file: '/etc/hostname' }
      );
    });

    it('supports operation=write', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentFile(client, config, {
        operation: 'write',
        node: 'pve1',
        vmid: 100,
        file: '/tmp/test.txt',
        content: 'hello',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('File Written');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/file-write',
        'POST',
        expect.objectContaining({ file: '/tmp/test.txt' })
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentFile(client, config, {
        operation: 'read',
        node: 'pve1',
        vmid: 100,
        file: '/etc/hostname',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_freeze (4 operations) ───────────────────────

  describe('proxmox_agent_freeze', () => {
    it('supports operation=status', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('thawed');

      const result = await handleAgentFreeze(client, config, {
        operation: 'status',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Freeze Status');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/fsfreeze-status',
        'POST'
      );
    });

    it('supports operation=freeze', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(3);

      const result = await handleAgentFreeze(client, config, {
        operation: 'freeze',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Freeze');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/fsfreeze-freeze',
        'POST'
      );
    });

    it('supports operation=thaw', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(3);

      const result = await handleAgentFreeze(client, config, {
        operation: 'thaw',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Thaw');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/fsfreeze-thaw',
        'POST'
      );
    });

    it('supports operation=fstrim', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue({ paths: [] });

      const result = await handleAgentFreeze(client, config, {
        operation: 'fstrim',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Trim');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/fstrim',
        'POST'
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentFreeze(client, config, {
        operation: 'freeze',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_power (4 operations) ───────────────────────

  describe('proxmox_agent_power', () => {
    it('supports operation=shutdown', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentPower(client, config, {
        operation: 'shutdown',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Shutdown');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/shutdown',
        'POST'
      );
    });

    it('supports operation=suspend_disk', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentPower(client, config, {
        operation: 'suspend_disk',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Suspended to Disk');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/suspend-disk',
        'POST'
      );
    });

    it('supports operation=suspend_ram', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentPower(client, config, {
        operation: 'suspend_ram',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Suspended to RAM');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/suspend-ram',
        'POST'
      );
    });

    it('supports operation=suspend_hybrid', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentPower(client, config, {
        operation: 'suspend_hybrid',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Hybrid Suspended');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/suspend-hybrid',
        'POST'
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentPower(client, config, {
        operation: 'shutdown',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  // ─── proxmox_agent_user (1 operation) ───────────────────────

  describe('proxmox_agent_user', () => {
    it('supports operation=set_password', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleAgentUser(client, config, {
        operation: 'set_password',
        node: 'pve1',
        vmid: 100,
        username: 'testuser',
        password: 'securepassword123',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Password Updated');
      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/agent/set-user-password',
        'POST',
        expect.objectContaining({ username: 'testuser' })
      );
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleAgentUser(client, config, {
        operation: 'set_password',
        node: 'pve1',
        vmid: 100,
        username: 'testuser',
        password: 'securepassword123',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });
});
