import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { toolRegistry } from '../registry.js';
import { ProxmoxApiClient } from '../../client/proxmox.js';
import type { ToolName, ToolResponse } from '../../types/tools.js';

const config = createTestConfig({ allowElevated: true });
const makeClient = createMockProxmoxClient;
async function call(name: ToolName, args: unknown, client: ProxmoxApiClient): Promise<ToolResponse> {
  const entry = toolRegistry[name];
  return entry.handler(client, config, entry.schema.parse(args));
}
const guest = { node: 'lab', vmid: 102 };
const upid = 'UPID:lab:00156910:61860286:6AF9941C:vzdump:100:root@pam!test:';

afterEach(() => vi.unstubAllGlobals());

describe('Live cluster API contract regressions', () => {
  it('accepts token UPIDs and reads task status, not the directory index', async () => {
    const client = makeClient();
    client.request.mockResolvedValue({ upid, status: 'stopped', exitstatus: 'OK' });
    const result = await call('proxmox_node_task', { action: 'get', node: 'lab', upid }, client);
    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith(`/nodes/lab/tasks/${encodeURIComponent(upid)}/status`);
    expect(result.content[0].text).toContain('OK');
  });

  it('uses encoded status URL and GET without a body through the HTTP client', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({data:{upid,status:'running'}})));
    vi.stubGlobal('fetch', fetchMock);
    const result = await call('proxmox_node_task', {action:'get',node:'lab',upid}, new ProxmoxApiClient(config));
    expect(result.isError).toBe(false);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://${config.host}:8006/api2/json/nodes/lab/tasks/${encodeURIComponent(upid)}/status`);
    expect(options?.method).toBe('GET');
    expect(options?.body).toBeUndefined();
    expect(new Headers(options?.headers).get('authorization')).toBe(`PVEAPIToken=${config.user}!${config.tokenName}=${config.tokenValue}`);
  });

  it('includes active tasks by default', async () => {
    const client = makeClient(); client.request.mockResolvedValue([]);
    await call('proxmox_node_task', { action: 'list', node: 'lab' }, client);
    expect(client.request).toHaveBeenCalledWith('/nodes/lab/tasks?source=all');
  });

  it('forwards task source, limit, vmid and type filters', async () => {
    const client = makeClient(); client.request.mockResolvedValue([]);
    await call('proxmox_node_task', { action: 'list', node: 'lab', source: 'active', limit: 10, vmid: 102, typefilter: 'vzdump' }, client);
    const url = new URL(String(client.request.mock.calls[0][0]), 'https://example.invalid');
    expect(Object.fromEntries(url.searchParams)).toEqual({ source: 'active', limit: '10', vmid: '102', typefilter: 'vzdump' });
  });

  it.each([{source:'invalid'}, {limit:0}, {vmid:-1}])('rejects invalid task filters %j', filters => {
    expect(toolRegistry.proxmox_node_task.schema.safeParse({action:'list',node:'lab',...filters}).success).toBe(false);
  });

  it('serializes agent argv as repeated form fields through the real HTTP client', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({data:{pid:42}})));
    vi.stubGlobal('fetch', fetchMock);
    const result = await call('proxmox_agent_exec', { ...guest, operation:'exec', command:'printf', args:['%s','a b',''], 'input-data':'', 'capture-output':true }, new ProxmoxApiClient(config));
    expect(result.isError).toBe(false);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://${config.host}:8006/api2/json/nodes/lab/qemu/102/agent/exec`);
    expect(options?.method).toBe('POST');
    expect(new Headers(options?.headers).get('content-type')).toBe('application/x-www-form-urlencoded');
    const body = new URLSearchParams(String(options?.body));
    expect(body.getAll('command')).toEqual(['printf','%s','a b','']);
    expect(body.get('input-data')).toBe('');
    expect([...body.keys()]).not.toContain('args');
    expect(body.has('capture-output')).toBe(false);
    expect(body.has('timeout')).toBe(false);
  });

  it.each([{timeout:5}, {'capture-output':false}])('explicitly rejects unsupported exec options %j', options => {
    const client = makeClient();
    return call('proxmox_agent_exec', {...guest,operation:'exec',command:'true',...options},client).then(result => {
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/not supported/i);
      expect(client.request).not.toHaveBeenCalled();
    });
  });

  it('keeps commands literal without implicit shell splitting', async () => {
    const client = makeClient(); client.request.mockResolvedValue({pid:42});
    await call('proxmox_agent_exec',{...guest,operation:'exec',command:'program with spaces'},client);
    expect(client.request).toHaveBeenCalledWith('/nodes/lab/qemu/102/agent/exec','POST',{command:['program with spaces']});
  });

  it('uses PVE APT fields and filters locally, case-insensitively', async () => {
    const client = makeClient(); client.request.mockResolvedValue([
      {Package:'proxmox-ve',Version:'9.0',RunningKernel:'6.17',Arch:'amd64'},
      {Package:'pve-manager',Version:'9.0.1',ManagerVersion:'9.0.1/abc',CurrentState:'Installed'},
    ]);
    const result = await call('proxmox_apt',{action:'versions',node:'lab',package:'PVE-MAN'},client);
    expect(client.request).toHaveBeenCalledWith('/nodes/lab/apt/versions');
    expect(result.content[0].text).toContain('pve-manager');
    expect(result.content[0].text).toContain('9.0.1/abc');
    expect(result.content[0].text).not.toContain('proxmox-ve');
    const all = await call('proxmox_apt',{action:'versions',node:'lab'},client);
    expect(all.content[0].text).toContain('6.17');
    const empty = await call('proxmox_apt',{action:'versions',node:'lab',package:'absent'},client);
    expect(empty.content[0].text).toContain('No package versions');
  });

  it.each(['vm','lxc'])('shows only real pending changes for %s, including falsy values', async type => {
    const client = makeClient(); client.request.mockResolvedValue([
      {key:'unchanged',value:'same'}, {key:'not-deleted',value:'same',delete:0},
      {key:'memory',value:'1024',pending:'2048'}, {key:'empty',value:'x',pending:''},
      {key:'zero',value:1,pending:0}, {key:'false',value:true,pending:false},
      {key:'removed',value:'old',delete:1}, {key:'forced',value:'old',delete:2},
    ]);
    const result = await call('proxmox_guest_pending',{...guest,type},client);
    const text = result.content[0].text;
    expect(text).toContain('**Pending Changes** (6)');
    expect(text).not.toContain('unchanged'); expect(text).not.toContain('not-deleted');
    expect(text).toContain('2048'); expect(text).toContain('Pending: 0');
    expect(text).toContain('Pending: false'); expect(text).toContain('force-delete');
    expect(text).toContain('Current: 1024'); expect(text).toContain('Pending: ""');
    expect(text).toContain('Delete: scheduled');
  });

  it.each(['vm','lxc'])('reports no pending changes for unchanged %s config', async type => {
    const client = makeClient(); client.request.mockResolvedValue([{key:'cores',value:'2',delete:0}]);
    const result = await call('proxmox_guest_pending',{...guest,type},client);
    expect(result.content[0].text).toContain('No pending changes');
  });

  it.each([{}, {result:{}}, null])('formats empty successful ping %j as pong', async response => {
    const client = makeClient(); client.request.mockResolvedValue(response);
    const result = await call('proxmox_agent_info',{...guest,operation:'ping'},client);
    expect(result.content[0].text).toContain('pong');
    expect(result.content[0].text).not.toContain('[object Object]');
  });

  it('retains non-empty ping details as JSON', async () => {
    const client = makeClient(); client.request.mockResolvedValue({result:{message:'ready'}});
    const result = await call('proxmox_agent_info',{...guest,operation:'ping'},client);
    expect(result.content[0].text).toContain('ready');
    expect(result.content[0].text).not.toContain('[object Object]');
  });

  it('preserves same-name storage on different nodes and displays zero usage', async () => {
    const client = makeClient(); client.request.mockResolvedValueOnce([{node:'lab'},{node:'epyc'}])
      .mockResolvedValueOnce([{storage:'local',node:'lab',enabled:1,total:100,used:0}])
      .mockResolvedValueOnce([{storage:'local',node:'epyc',enabled:1,total:200,used:50}]);
    const result = await call('proxmox_storage_config',{action:'cluster_usage'},client);
    expect(result.content[0].text).toContain('lab'); expect(result.content[0].text).toContain('epyc');
    expect(result.content[0].text).toContain('0.0%');
  });

  it.each([0,0.1])('uses cpu rather than memory fraction (%s)', async cpu => {
    const client = makeClient(); client.request.mockResolvedValue([{vmid:102,status:'running',cpu,mem:512,maxmem:1024}]);
    const result = await call('proxmox_guest_list',{node:'lab',type:'qemu'},client);
    expect(result.content[0].text).toContain(`CPU: ${(cpu*100).toFixed(2)}%`);
  });

  it('shows zero CPU, memory and IO in guest status', async () => {
    const client = makeClient(); client.request.mockResolvedValue({status:'running',cpu:0,mem:0,maxmem:1024,uptime:0,diskread:0,diskwrite:0,netin:0,netout:0});
    const result = await call('proxmox_guest_status',{...guest,type:'vm'},client);
    expect(result.content[0].text).not.toContain('N/A');
  });
});
