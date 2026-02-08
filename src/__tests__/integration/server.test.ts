import { describe, it, expect, beforeEach } from 'vitest';
import { createServer } from '../../server.js';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { TOOL_NAMES } from '../../types/tools.js';
import type { Config } from '../../config/index.js';

type RequestHandler = (request: any) => Promise<any>;

type ServerWithHandlers = {
  _requestHandlers: Map<string, RequestHandler>;
};

const getRequestHandlers = (server: unknown): ServerWithHandlers['_requestHandlers'] =>
  (server as ServerWithHandlers)._requestHandlers;

describe('MCP Server Integration', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;
  let config: Config;

  beforeEach(() => {
    client = createMockProxmoxClient();
    config = createTestConfig();
  });

  describe('Server Initialization', () => {
    it('creates server successfully', () => {
      const server = createServer(client, config);
      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    it('server has request handlers registered', () => {
      const server = createServer(client, config);
      const listHandler = getRequestHandlers(server).get('tools/list');
      const callHandler = getRequestHandlers(server).get('tools/call');
      expect(listHandler).toBeDefined();
      expect(callHandler).toBeDefined();
    });
  });

  describe('ListTools Handler', () => {
    it('returns all 227 tools', async () => {
      const server = createServer(client, config);

      const handler = getRequestHandlers(server).get('tools/list');
      expect(handler).toBeDefined();

      const response = await handler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
       expect(response).toBeDefined();
       expect(response.tools).toBeDefined();
       expect(Array.isArray(response.tools)).toBe(true);
       expect(response.tools).toHaveLength(265);
    });

    it('includes correct tool properties', async () => {
      const server = createServer(client, config);
      const handler = getRequestHandlers(server).get('tools/list');
      const response = await handler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
      const tools = response.tools;

      const firstTool = tools[0];
      expect(firstTool).toHaveProperty('name');
      expect(firstTool).toHaveProperty('description');
      expect(firstTool).toHaveProperty('inputSchema');
      expect(typeof firstTool.name).toBe('string');
      expect(typeof firstTool.description).toBe('string');
      expect(typeof firstTool.inputSchema).toBe('object');
    });

    it('includes all expected tool names', async () => {
      const server = createServer(client, config);
      const handler = getRequestHandlers(server).get('tools/list');
      const response = await handler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
      const tools = response.tools;
      const toolNames = tools.map((t: { name: string }) => t.name);

      for (const name of TOOL_NAMES) {
        expect(toolNames).toContain(name);
      }
    });

    it('includes inputSchema for each tool', async () => {
      const server = createServer(client, config);
      const handler = getRequestHandlers(server).get('tools/list');
      const response = await handler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
      const tools = response.tools;

      for (const tool of tools) {
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.inputSchema).toBe('object');
        expect(tool.inputSchema.$schema).toBeUndefined();
      }
    });

    it('includes descriptions for all tools', async () => {
      const server = createServer(client, config);
      const handler = getRequestHandlers(server).get('tools/list');
      const response = await handler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
      const tools = response.tools;

      for (const tool of tools) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CallTool Handler - Success Cases', () => {
    it('executes valid tool with empty input', async () => {
      const server = createServer(client, config);
      client.request.mockResolvedValueOnce([
        { node: 'pve1', status: 'online', uptime: 86400 },
      ]);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.isError).toBe(false);
    });

    it('executes valid tool with parameters', async () => {
      const elevatedConfig = createTestConfig({ allowElevated: true });
      const server = createServer(client, elevatedConfig);
      client.request.mockResolvedValueOnce({
        status: 'online',
        uptime: 86400,
        loadavg: [0.5, 0.6, 0.7],
      });

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_node_status',
          arguments: {
            node: 'pve1',
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.isError).toBe(false);
    });

    it('returns proper response structure for successful execution', async () => {
      const server = createServer(client, config);
      client.request.mockResolvedValueOnce([]);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_vms',
          arguments: {},
        },
      });

      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.content[0]).toHaveProperty('type');
      expect(response.content[0]).toHaveProperty('text');
      expect(response.content[0].type).toBe('text');
      expect(typeof response.content[0].text).toBe('string');
      expect(response.isError).toBe(false);
    });
  });

  describe('CallTool Handler - Error Cases', () => {
    it('returns error for unknown tool', async () => {
      const server = createServer(client, config);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_unknown_tool',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Unknown tool');
    });

    it('returns error for invalid input (validation failure)', async () => {
      const server = createServer(client, config);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_node_status',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Validation error');
    });

    it('returns error for invalid parameter type', async () => {
      const server = createServer(client, config);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_vm_status',
          arguments: {
            node: 'pve1',
            vmid: 'not-a-number',
            type: 'qemu',
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Validation error');
    });

    it('returns error when tool execution fails', async () => {
      const server = createServer(client, config);
      client.request.mockRejectedValueOnce(new Error('API connection failed'));

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('API connection failed');
    });

    it('returns error for permission denied (elevated operation without permission)', async () => {
      const restrictedConfig = createTestConfig({ allowElevated: false });
      const server = createServer(client, restrictedConfig);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_start_vm',
          arguments: {
            node: 'pve1',
            vmid: 100,
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Permission');
    });
  });

  describe('CallTool Handler - Permission Checks', () => {
    it('allows elevated operations when allowElevated=true', async () => {
      const elevatedConfig = createTestConfig({ allowElevated: true });
      const server = createServer(client, elevatedConfig);

      client.request.mockResolvedValueOnce({ upid: 'UPID:pve1:00001234' });

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_start_vm',
          arguments: {
            node: 'pve1',
            vmid: 100,
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(false);
    });

    it('blocks elevated operations when allowElevated=false', async () => {
      const restrictedConfig = createTestConfig({ allowElevated: false });
      const server = createServer(client, restrictedConfig);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_start_vm',
          arguments: {
            node: 'pve1',
            vmid: 100,
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Permission');
    });

    it('allows read-only operations without elevated permissions', async () => {
      const restrictedConfig = createTestConfig({ allowElevated: false });
      const server = createServer(client, restrictedConfig);

      client.request.mockResolvedValueOnce([
        { node: 'pve1', status: 'online', uptime: 86400 },
      ]);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(false);
    });
  });

  describe('CallTool Handler - Tool Routing', () => {
    it('routes to correct handler for different tools', async () => {
      const server = createServer(client, config);
      client.request.mockResolvedValueOnce([]);

      const handler = getRequestHandlers(server).get('tools/call');

      const response1 = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_vms',
          arguments: {},
        },
      });
      expect(response1.isError).toBe(false);

      client.request.mockResolvedValueOnce([
        { node: 'pve1', status: 'online', uptime: 86400 },
      ]);

      const response2 = await handler!({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });
      expect(response2.isError).toBe(false);
    });

    it('handles empty arguments object', async () => {
      const server = createServer(client, config);
      client.request.mockResolvedValueOnce([]);

      const handler = getRequestHandlers(server).get('tools/call');
      const response = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_vms',
          arguments: {},
        },
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(false);
    });
  });

  describe('End-to-End Tool Execution Flow', () => {
    it('executes complete flow: list tools -> call tool -> get result', async () => {
      const server = createServer(client, config);

       const listHandler = getRequestHandlers(server).get('tools/list');
       const listResponse = await listHandler!({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
       expect(listResponse.tools).toHaveLength(265);

      const getNodesToolDef = listResponse.tools.find(
        (t: { name: string }) => t.name === 'proxmox_get_nodes'
      );
      expect(getNodesToolDef).toBeDefined();

      client.request.mockResolvedValueOnce([
        { node: 'pve1', status: 'online', uptime: 86400 },
        { node: 'pve2', status: 'online', uptime: 172800 },
      ]);

      const callHandler = getRequestHandlers(server).get('tools/call');
      const callResponse = await callHandler!({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });

      expect(callResponse.isError).toBe(false);
      expect(callResponse.content).toBeDefined();
      expect(callResponse.content[0].text).toContain('pve1');
    });

    it('handles multiple sequential tool calls', async () => {
      const elevatedConfig = createTestConfig({ allowElevated: true });
      const server = createServer(client, elevatedConfig);
      client.request.mockResolvedValueOnce([
        { node: 'pve1', status: 'online', uptime: 86400 },
      ]);

      const handler = getRequestHandlers(server).get('tools/call');

      const response1 = await handler!({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_nodes',
          arguments: {},
        },
      });
      expect(response1.isError).toBe(false);

      client.request.mockResolvedValueOnce({
        status: 'online',
        uptime: 86400,
        loadavg: [0.5, 0.6, 0.7],
      });

      const response2 = await handler!({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'proxmox_get_node_status',
          arguments: {
            node: 'pve1',
          },
        },
      });
      expect(response2.isError).toBe(false);

      expect(response1.isError).toBe(false);
      expect(response2.isError).toBe(false);
    });
  });
});
