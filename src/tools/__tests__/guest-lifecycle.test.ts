import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import {
  handleGuestStart,
  handleGuestStop,
  handleGuestReboot,
  handleGuestShutdown,
  handleGuestDelete,
  handleGuestPause,
  handleGuestResume,
} from '../guest-lifecycle.js';

// ── proxmox_guest_start ──────────────────────────────────────────────────

describe('handleGuestStart', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('starts a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234:00000000:12345678:qmstart::root@pam:');

    const result = await handleGuestStart(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Start Initiated');
    expect(result.content[0].text).toContain('100');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/start', 'POST');
  });

  it('starts an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234:00000000:12345678:vzstart::root@pam:');

    const result = await handleGuestStart(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Start Initiated');
    expect(result.content[0].text).toContain('200');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/start', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestStart(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Connection refused'));

    const result = await handleGuestStart(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Connection refused');
  });
});

// ── proxmox_guest_stop ───────────────────────────────────────────────────

describe('handleGuestStop', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('stops a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestStop(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Stop Initiated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/stop', 'POST');
  });

  it('stops an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestStop(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Stop Initiated');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/stop', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestStop(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Server error'));

    const result = await handleGuestStop(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Server error');
  });
});

// ── proxmox_guest_reboot ─────────────────────────────────────────────────

describe('handleGuestReboot', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('reboots a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestReboot(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Reboot Command Sent');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/reboot', 'POST');
  });

  it('reboots an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestReboot(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Reboot Command Sent');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/reboot', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestReboot(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });
});

// ── proxmox_guest_shutdown ───────────────────────────────────────────────

describe('handleGuestShutdown', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('shuts down a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestShutdown(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Shutdown Command Sent');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/shutdown', 'POST');
  });

  it('shuts down an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestShutdown(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Shutdown Command Sent');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/status/shutdown', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestShutdown(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });
});

// ── proxmox_guest_delete ─────────────────────────────────────────────────

describe('handleGuestDelete', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes a VM when type=vm', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestDelete(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Deletion Started');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100', 'DELETE');
  });

  it('deletes an LXC container when type=lxc', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestDelete(client, config, { type: 'lxc', node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Container Deletion Started');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200', 'DELETE');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestDelete(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('VM is running'));

    const result = await handleGuestDelete(client, config, { type: 'vm', node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('VM is running');
  });
});

// ── proxmox_guest_pause (VM only) ────────────────────────────────────────

describe('handleGuestPause', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('pauses a VM', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestPause(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Pause Command Sent');
    expect(result.content[0].text).toContain('100');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/suspend', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestPause(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('VM not running'));

    const result = await handleGuestPause(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('VM not running');
  });
});

// ── proxmox_guest_resume (VM only) ───────────────────────────────────────

describe('handleGuestResume', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('resumes a paused VM', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:task');

    const result = await handleGuestResume(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Resume Command Sent');
    expect(result.content[0].text).toContain('100');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/status/resume', 'POST');
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleGuestResume(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('VM not paused'));

    const result = await handleGuestResume(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('VM not paused');
  });
});
