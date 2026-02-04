import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  startLxc,
  startVM,
  stopLxc,
  stopVM,
  deleteLxc,
  deleteVM,
  rebootLxc,
  rebootVM,
  shutdownLxc,
  shutdownVM,
  pauseVM,
  resumeVM,
} from './vm-lifecycle.js';

describe('VM Lifecycle Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('startLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await startLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('starts LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await startLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('▶️');
      expect(result.content[0].text).toContain('LXC Container Start Initiated');
      expect(result.content[0].text).toContain('100');
      expect(result.content[0].text).toContain('pve1');
      expect(result.content[0].text).toContain('UPID');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await startLxc(client, config, { node: 'invalid@node', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await startLxc(client, config, { node: 'pve1', vmid: 50 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container already running'));

      const result = await startLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Container already running');
    });
  });

  describe('startVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await startVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('starts VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001234');

      const result = await startVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('▶️');
      expect(result.content[0].text).toContain('VM Start Initiated');
      expect(result.content[0].text).toContain('100');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await startVM(client, config, { node: 'invalid@node', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await startVM(client, config, { node: 'pve1', vmid: 50 });

      expect(result.isError).toBe(true);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM already running'));

      const result = await startVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('VM already running');
    });
  });

  describe('stopLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await stopLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('stops LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001235');

      const result = await stopLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('⏹️');
      expect(result.content[0].text).toContain('LXC Container Stop Initiated');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container not running'));

      const result = await stopLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('stopVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await stopVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('stops VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001235');

      const result = await stopVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('⏹️');
      expect(result.content[0].text).toContain('VM Stop Initiated');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM not running'));

      const result = await stopVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('deleteLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await deleteLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('deletes LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001236');

      const result = await deleteLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('LXC Container Deletion Started');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container is running'));

      const result = await deleteLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('deleteVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await deleteVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('deletes VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001236');

      const result = await deleteVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('🗑️');
      expect(result.content[0].text).toContain('VM Deletion Started');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM is running'));

      const result = await deleteVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('rebootLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await rebootLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('reboots LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001237');

      const result = await rebootLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('🔄');
      expect(result.content[0].text).toContain('LXC Container Reboot Command Sent');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container not running'));

      const result = await rebootLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('rebootVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await rebootVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('reboots VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001237');

      const result = await rebootVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('🔄');
      expect(result.content[0].text).toContain('VM Reboot Command Sent');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM not running'));

      const result = await rebootVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('shutdownLxc', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await shutdownLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('shuts down LXC container with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001238');

      const result = await shutdownLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('⏸️');
      expect(result.content[0].text).toContain('LXC Container Shutdown Command Sent');
      expect(result.content[0].text).toContain('graceful');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('Container not running'));

      const result = await shutdownLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('shutdownVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await shutdownVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('shuts down VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001238');

      const result = await shutdownVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('⏸️');
      expect(result.content[0].text).toContain('VM Shutdown Command Sent');
      expect(result.content[0].text).toContain('graceful');
      expect(result.isError).toBe(false);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM not running'));

      const result = await shutdownVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('pauseVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await pauseVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('pauses VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001239');

      const result = await pauseVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('⏸️');
      expect(result.content[0].text).toContain('VM Pause Command Sent');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await pauseVM(client, config, { node: 'invalid@node', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await pauseVM(client, config, { node: 'pve1', vmid: 50 });

      expect(result.isError).toBe(true);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM not running'));

      const result = await pauseVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('resumeVM', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await resumeVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('resumes VM with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID:pve1:00001240');

      const result = await resumeVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.content[0].text).toContain('▶️');
      expect(result.content[0].text).toContain('VM Resume Command Sent');
      expect(result.isError).toBe(false);
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resumeVM(client, config, { node: 'invalid@node', vmid: 100 });

      expect(result.isError).toBe(true);
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await resumeVM(client, config, { node: 'pve1', vmid: 50 });

      expect(result.isError).toBe(true);
    });

    it('handles API errors', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockRejectedValue(new Error('VM not paused'));

      const result = await resumeVM(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
    });
  });

  describe('API endpoint verification', () => {
    it('calls correct endpoint for startLxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await startLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/status/start',
        'POST'
      );
    });

    it('calls correct endpoint for startVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await startVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/start',
        'POST'
      );
    });

    it('calls correct endpoint for stopLxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await stopLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/status/stop',
        'POST'
      );
    });

    it('calls correct endpoint for stopVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await stopVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/stop',
        'POST'
      );
    });

    it('calls correct endpoint for deleteLxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await deleteLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100',
        'DELETE'
      );
    });

    it('calls correct endpoint for deleteVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await deleteVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100',
        'DELETE'
      );
    });

    it('calls correct endpoint for rebootLxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await rebootLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/status/reboot',
        'POST'
      );
    });

    it('calls correct endpoint for rebootVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await rebootVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/reboot',
        'POST'
      );
    });

    it('calls correct endpoint for shutdownLxc', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await shutdownLxc(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/lxc/100/status/shutdown',
        'POST'
      );
    });

    it('calls correct endpoint for shutdownVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await shutdownVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/shutdown',
        'POST'
      );
    });

    it('calls correct endpoint for pauseVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await pauseVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/suspend',
        'POST'
      );
    });

    it('calls correct endpoint for resumeVM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue('UPID');

      await resumeVM(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/status/resume',
        'POST'
      );
    });
  });
});
