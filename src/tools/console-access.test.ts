import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleVncProxy,
  sampleSpiceProxy,
  sampleTermProxy,
  sampleLxcVncProxy,
  sampleLxcTermProxy,
} from '../__fixtures__/console-access.js';
import {
  getVncProxy,
  getSpiceProxy,
  getTermProxy,
  getLxcVncProxy,
  getLxcTermProxy,
} from './console-access.js';

describe('Console Access Tools', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('getVncProxy', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await getVncProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requests VNC proxy ticket for VM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleVncProxy);

      const result = await getVncProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/vncproxy', 'POST');
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM VNC Proxy Ticket');
      expect(result.content[0].text).toContain('pve1');
    });

    it('validates node name', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await getVncProxy(client, config, { node: 'invalid@node', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid node name');
    });
  });

  describe('getSpiceProxy', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await getSpiceProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requests SPICE proxy ticket for VM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleSpiceProxy);

      const result = await getSpiceProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/spiceproxy', 'POST');
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM SPICE Proxy Ticket');
    });

    it('validates VMID', async () => {
      const config = createTestConfig({ allowElevated: true });

      const result = await getSpiceProxy(client, config, { node: 'pve1', vmid: 50 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid VM ID');
    });
  });

  describe('getTermProxy', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await getTermProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requests terminal proxy ticket for VM', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleTermProxy);

      const result = await getTermProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/termproxy', 'POST');
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Terminal Proxy Ticket');
    });
  });

  describe('getLxcVncProxy', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await getLxcVncProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requests VNC proxy ticket for LXC', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleLxcVncProxy);

      const result = await getLxcVncProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/100/vncproxy', 'POST');
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC VNC Proxy Ticket');
    });
  });

  describe('getLxcTermProxy', () => {
    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await getLxcTermProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('requests terminal proxy ticket for LXC', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleLxcTermProxy);

      const result = await getLxcTermProxy(client, config, { node: 'pve1', vmid: 100 });

      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/100/termproxy', 'POST');
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Terminal Proxy Ticket');
    });
  });
});
