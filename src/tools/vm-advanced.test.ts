import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleVmRrdData,
  sampleLxcRrdData,
  sampleAgentOsinfo,
  sampleAgentFsinfo,
  sampleAgentMemoryBlocks,
  sampleAgentInterfaces,
  sampleAgentTime,
  sampleAgentTimezone,
  sampleAgentVcpus,
  sampleAgentExecResult,
  sampleAgentExecStatus,
  sampleVmFirewallRules,
  sampleLxcFirewallRules,
} from '../__fixtures__/vm-advanced.js';
import {
  migrateVm,
  migrateLxc,
  createTemplateVm,
  createTemplateLxc,
  getVmRrddata,
  getLxcRrddata,
  agentPing,
  agentGetOsinfo,
  agentGetFsinfo,
  agentGetMemoryBlocks,
  agentGetNetworkInterfaces,
  agentGetTime,
  agentGetTimezone,
  agentGetVcpus,
  agentExec,
  agentExecStatus,
  listVmFirewallRules,
  getVmFirewallRule,
  createVmFirewallRule,
  updateVmFirewallRule,
  deleteVmFirewallRule,
  listLxcFirewallRules,
  getLxcFirewallRule,
  createLxcFirewallRule,
  updateLxcFirewallRule,
  deleteLxcFirewallRule,
} from './vm-advanced.js';

describe('VM/LXC Advanced Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('migrates a VM with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:0000abcd');

    const result = await migrateVm(client, config, {
      node: 'pve1',
      vmid: 100,
      target: 'pve2',
      online: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Migration Initiated');
    expect(result.content[0].text).toContain('pve2');
  });

  it('requires elevated permissions for VM migration', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await migrateVm(client, config, {
      node: 'pve1',
      vmid: 100,
      target: 'pve2',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('migrates an LXC container with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:0000abce');

    const result = await migrateLxc(client, config, {
      node: 'pve1',
      vmid: 200,
      target: 'pve3',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Migration Initiated');
  });

  it('converts a VM to template', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await createTemplateVm(client, config, { node: 'pve1', vmid: 101 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Converted to Template');
  });

  it('converts an LXC to template', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await createTemplateLxc(client, config, { node: 'pve1', vmid: 201 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Converted to Template');
  });

  it('returns VM RRD data', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleVmRrdData);

    const result = await getVmRrddata(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Performance Metrics');
    expect(result.content[0].text).toContain('Points');
  });

  it('returns LXC RRD data', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleLxcRrdData);

    const result = await getLxcRrddata(client, config, { node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Performance Metrics');
  });

  it('pings the guest agent', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue('pong');

    const result = await agentPing(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest Agent Ping');
  });

  it('gets guest OS info', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentOsinfo);

    const result = await agentGetOsinfo(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest OS Information');
  });

  it('gets guest filesystem info', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentFsinfo);

    const result = await agentGetFsinfo(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Filesystem Information');
  });

  it('gets guest memory blocks', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentMemoryBlocks);

    const result = await agentGetMemoryBlocks(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Memory Blocks');
  });

  it('gets guest network interfaces', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentInterfaces);

    const result = await agentGetNetworkInterfaces(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Network Interfaces');
  });

  it('gets guest time', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentTime);

    const result = await agentGetTime(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest Time');
  });

  it('gets guest timezone', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentTimezone);

    const result = await agentGetTimezone(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest Timezone');
  });

  it('gets guest vCPU info', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentVcpus);

    const result = await agentGetVcpus(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest vCPU Info');
  });

  it('executes a guest agent command with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue(sampleAgentExecResult);

    const result = await agentExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'uname',
      args: ['-a'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Guest Agent Command Started');
    expect(result.content[0].text).toContain('uname');
  });

  it('requires elevated permissions for guest agent exec', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await agentExec(client, config, {
      node: 'pve1',
      vmid: 100,
      command: 'uname',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('gets guest agent exec status', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAgentExecStatus);

    const result = await agentExecStatus(client, config, { node: 'pve1', vmid: 100, pid: 4242 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Exec Status');
  });

  it('lists VM firewall rules', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleVmFirewallRules);

    const result = await listVmFirewallRules(client, config, { node: 'pve1', vmid: 100 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Firewall Rules');
  });

  it('gets a VM firewall rule', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleVmFirewallRules[0]);

    const result = await getVmFirewallRule(client, config, { node: 'pve1', vmid: 100, pos: 0 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Firewall Rule');
  });

  it('creates a VM firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await createVmFirewallRule(client, config, {
      node: 'pve1',
      vmid: 100,
      action: 'ACCEPT',
      type: 'in',
      dport: '22',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Firewall Rule Created');
  });

  it('updates a VM firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateVmFirewallRule(client, config, {
      node: 'pve1',
      vmid: 100,
      pos: 0,
      comment: 'Allow SSH',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Firewall Rule Updated');
  });

  it('deletes a VM firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteVmFirewallRule(client, config, {
      node: 'pve1',
      vmid: 100,
      pos: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('VM Firewall Rule Deleted');
  });

  it('lists LXC firewall rules', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleLxcFirewallRules);

    const result = await listLxcFirewallRules(client, config, { node: 'pve1', vmid: 200 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Firewall Rules');
  });

  it('gets an LXC firewall rule', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleLxcFirewallRules[0]);

    const result = await getLxcFirewallRule(client, config, { node: 'pve1', vmid: 200, pos: 0 });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Firewall Rule');
  });

  it('creates an LXC firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await createLxcFirewallRule(client, config, {
      node: 'pve1',
      vmid: 200,
      action: 'ACCEPT',
      type: 'out',
      dport: '443',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Firewall Rule Created');
  });

  it('updates an LXC firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateLxcFirewallRule(client, config, {
      node: 'pve1',
      vmid: 200,
      pos: 0,
      comment: 'Allow HTTPS',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Firewall Rule Updated');
  });

  it('deletes an LXC firewall rule with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteLxcFirewallRule(client, config, {
      node: 'pve1',
      vmid: 200,
      pos: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('LXC Firewall Rule Deleted');
  });
});
