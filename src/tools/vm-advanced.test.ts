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
  agentFileRead,
  agentFileWrite,
  agentGetHostname,
  agentGetUsers,
  agentSetUserPassword,
  agentShutdown,
  agentFsfreezeStatus,
  agentFsfreezeFreeze,
  agentFsfreezeThaw,
  agentFstrim,
  agentGetMemoryBlockInfo,
  agentSuspendDisk,
  agentSuspendRam,
  agentSuspendHybrid,
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

   describe('agentFileRead', () => {
     it('should read file content from guest', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       const mockResponse = {
         content: Buffer.from('Hello, World!').toString('base64'),
         'bytes-read': 13,
       };
       client.request.mockResolvedValue(mockResponse);

       const result = await agentFileRead(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/etc/hostname',
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/file-read',
         'GET',
         { file: '/etc/hostname' }
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Hello, World!');
       expect(result.content[0].text).toContain('13');
     });

     it('should handle truncated files', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       const mockResponse = {
         content: Buffer.from('truncated...').toString('base64'),
         'bytes-read': 16777216,
         truncated: true,
       };
       client.request.mockResolvedValue(mockResponse);

       const result = await agentFileRead(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/var/log/huge.log',
       });

       expect(result.content[0].text).toContain('truncated');
       expect(result.content[0].text).toContain('16 MiB');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentFileRead(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/etc/shadow',
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentFileWrite', () => {
     it('should write content to file in guest', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentFileWrite(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/tmp/test.txt',
         content: 'Hello, World!',
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/file-write',
         'POST',
         {
           file: '/tmp/test.txt',
           content: Buffer.from('Hello, World!').toString('base64'),
           encode: true,
         }
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('successfully written');
     });

     it('should reject content larger than 60 KiB', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       const largeContent = 'x'.repeat(61441);

       const result = await agentFileWrite(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/tmp/large.txt',
         content: largeContent,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('too large');
       expect(result.content[0].text).toContain('60 KiB');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentFileWrite(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
         file: '/etc/config',
         content: 'data',
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentGetHostname', () => {
     it('should get hostname from guest', async () => {
       const mockConfig = createTestConfig();
       const mockResponse = { 'host-name': 'webserver01' };
       client.request.mockResolvedValue(mockResponse);

       const result = await agentGetHostname(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/get-host-name'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('webserver01');
     });
   });

   describe('agentGetUsers', () => {
     it('should list logged-in users', async () => {
       const mockConfig = createTestConfig();
       const mockResponse = [
         { user: 'root', 'login-time': 1609459200 },
         { user: 'admin', 'login-time': 1609462800, domain: 'WORKGROUP' },
       ];
       client.request.mockResolvedValue(mockResponse);

       const result = await agentGetUsers(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/get-users'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('root');
       expect(result.content[0].text).toContain('admin');
       expect(result.content[0].text).toContain('WORKGROUP');
     });

     it('should handle no logged-in users', async () => {
       const mockConfig = createTestConfig();
       client.request.mockResolvedValue([]);

       const result = await agentGetUsers(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('No users currently logged in');
     });
   });

   describe('agentSetUserPassword', () => {
     it('should set user password', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentSetUserPassword(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
         username: 'testuser',
         password: 'newpassword123',
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/set-user-password',
         'POST',
         {
           username: 'testuser',
           password: 'newpassword123',
           crypted: false,
         }
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('successfully updated');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentSetUserPassword(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
         username: 'testuser',
         password: 'newpassword123',
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentShutdown', () => {
     it('should shutdown guest via agent', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentShutdown(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/shutdown',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Graceful shutdown');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentShutdown(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

      expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Permission denied');
      });
   });

   describe('agentFsfreezeStatus', () => {
     it('should get filesystem freeze status', async () => {
       const mockConfig = createTestConfig();
       client.request.mockResolvedValue('thawed');

       const result = await agentFsfreezeStatus(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/fsfreeze-status',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Filesystem Freeze Status');
       expect(result.content[0].text).toContain('thawed');
     });
   });

   describe('agentFsfreezeFreeze', () => {
     it('should freeze guest filesystems', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(3);

       const result = await agentFsfreezeFreeze(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/fsfreeze-freeze',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Filesystem Freeze');
       expect(result.content[0].text).toContain('3');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentFsfreezeFreeze(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentFsfreezeThaw', () => {
     it('should thaw guest filesystems', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(3);

       const result = await agentFsfreezeThaw(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/fsfreeze-thaw',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Filesystem Thaw');
       expect(result.content[0].text).toContain('3');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentFsfreezeThaw(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentFstrim', () => {
     it('should trim guest filesystems', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue({ paths: [{ path: '/', trimmed: 1024, minimum: 0, error: '' }] });

       const result = await agentFstrim(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/fstrim',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Filesystem Trim');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentFstrim(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentGetMemoryBlockInfo', () => {
     it('should get memory block info', async () => {
       const mockConfig = createTestConfig();
       client.request.mockResolvedValue({ size: 134217728 });

       const result = await agentGetMemoryBlockInfo(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/get-memory-block-info',
         'GET'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Memory Block Info');
       expect(result.content[0].text).toContain('134217728');
     });
   });

   describe('agentSuspendDisk', () => {
     it('should suspend guest to disk', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentSuspendDisk(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/suspend-disk',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Guest Suspended to Disk');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentSuspendDisk(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentSuspendRam', () => {
     it('should suspend guest to RAM', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentSuspendRam(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/suspend-ram',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Guest Suspended to RAM');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentSuspendRam(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });

   describe('agentSuspendHybrid', () => {
     it('should hybrid suspend guest', async () => {
       const mockConfig = createTestConfig({ allowElevated: true });
       client.request.mockResolvedValue(null);

       const result = await agentSuspendHybrid(client, mockConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(client.request).toHaveBeenCalledWith(
         '/nodes/pve1/qemu/100/agent/suspend-hybrid',
         'POST'
       );
       expect(result.isError).toBe(false);
       expect(result.content[0].text).toContain('Guest Hybrid Suspended');
     });

     it('should require elevated permissions', async () => {
       const restrictedConfig = createTestConfig({ allowElevated: false });

       const result = await agentSuspendHybrid(client, restrictedConfig, {
         node: 'pve1',
         vmid: 100,
       });

       expect(result.isError).toBe(true);
       expect(result.content[0].text).toContain('Permission denied');
     });
   });
});
