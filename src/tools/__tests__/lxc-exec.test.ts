import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { handleLxcExec } from '../lxc-exec.js';

const mockExec = vi.fn();

vi.mock('../../client/ssh.js', () => ({
  getSshClient: vi.fn(() => ({ exec: mockExec })),
  shellQuote: (s: string): string => "'" + s.replace(/'/g, "'\\''") + "'",
}));

describe('proxmox_lxc_exec', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
    vi.clearAllMocks();
  });

  it('rejects when elevated permissions not enabled', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('elevated');
  });

  it('rejects when SSH is not enabled', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: false,
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('SSH is not enabled');
  });

  it('rejects when SSH key path is missing', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('SSH_KEY_PATH');
  });

  it('rejects when SSH node is missing', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('SSH_NODE');
  });

  it('rejects when node does not match SSH node', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve2',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Node mismatch');
  });

  it('rejects dangerous command characters', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'rm -rf /; echo hacked',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('dangerous');
  });

  it('rejects invalid node name', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1; echo',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid node name');
  });

  it('rejects invalid VMID', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 50,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
  });

  it('executes command successfully', async () => {
    mockExec.mockResolvedValue({
      stdout: 'container-host\n',
      stderr: '',
      exitCode: 0,
    });

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('container-host');
    expect(result.content[0].text).toContain('Exit Code**: 0');
  });

  it('returns error result for non-zero exit code', async () => {
    mockExec.mockResolvedValue({
      stdout: '',
      stderr: 'command not found\n',
      exitCode: 127,
    });

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'nonexistent',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('127');
    expect(result.content[0].text).toContain('command not found');
  });

  it('handles SSH connection failure', async () => {
    mockExec.mockRejectedValue(new Error('SSH connection failed: Connection refused'));

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'hostname',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('SSH connection failed');
  });

  it('passes timeout to SSH exec', async () => {
    mockExec.mockResolvedValue({
      stdout: 'done\n',
      stderr: '',
      exitCode: 0,
    });

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'long-running-task',
      timeout: 60,
    });

    expect(mockExec).toHaveBeenCalledWith(
      expect.stringContaining('/usr/sbin/pct exec 100'),
      60,
    );
  });

  it('uses pct exec with shell quoting', async () => {
    mockExec.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0,
    });

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
    });

    await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 200,
      command: 'echo hello world',
      timeout: 30,
    });

    expect(mockExec).toHaveBeenCalledWith(
      "/usr/sbin/pct exec 200 -- /bin/sh -c 'echo hello world'",
      30,
    );
  });

  it('allows dangerous characters when allowUnsafeCommands is true', async () => {
    mockExec.mockResolvedValue({
      stdout: 'root\n',
      stderr: '',
      exitCode: 0,
    });

    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
      allowUnsafeCommands: true,
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'cat /etc/passwd | grep root',
      timeout: 30,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('root');
  });

  it('still rejects dangerous characters when allowUnsafeCommands is false', async () => {
    const config = createTestConfig({
      allowElevated: true,
      sshEnabled: true,
      sshKeyPath: '/tmp/test_key',
      sshNode: 'pve1',
      allowUnsafeCommands: false,
    });

    const result = await handleLxcExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'ls | grep test',
      timeout: 30,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('dangerous');
  });
});
