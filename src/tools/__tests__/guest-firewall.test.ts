import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { TOOL_NAMES } from '../../types/tools.js';
import { handleGuestFirewallRule } from '../vm-advanced.js';

describe('proxmox_guest_firewall_rule', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('is registered in TOOL_NAMES', () => {
    expect(TOOL_NAMES).toContain('proxmox_guest_firewall_rule');
  });

  it('old firewall tool names are removed from TOOL_NAMES', () => {
    const oldNames = [
      'proxmox_list_vm_firewall_rules',
      'proxmox_get_vm_firewall_rule',
      'proxmox_create_vm_firewall_rule',
      'proxmox_update_vm_firewall_rule',
      'proxmox_delete_vm_firewall_rule',
      'proxmox_list_lxc_firewall_rules',
      'proxmox_get_lxc_firewall_rule',
      'proxmox_create_lxc_firewall_rule',
      'proxmox_update_lxc_firewall_rule',
      'proxmox_delete_lxc_firewall_rule',
    ];
    for (const name of oldNames) {
      expect(TOOL_NAMES).not.toContain(name);
    }
  });

  describe('action=list', () => {
    it('lists VM firewall rules when type=vm', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { pos: 0, type: 'in', action: 'ACCEPT', proto: 'tcp', dport: '22' },
      ]);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'list',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Firewall Rules');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/firewall/rules');
    });

    it('lists LXC firewall rules when type=lxc', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue([
        { pos: 0, type: 'in', action: 'ACCEPT', proto: 'tcp', dport: '80' },
      ]);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'list',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Firewall Rules');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/firewall/rules');
    });
  });

  describe('action=get', () => {
    it('gets VM firewall rule by position', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ pos: 0, type: 'in', action: 'ACCEPT' });

      const result = await handleGuestFirewallRule(client, config, {
        action: 'get',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        pos: 0,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Firewall Rule');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/qemu/100/firewall/rules/0');
    });

    it('gets LXC firewall rule by position', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({ pos: 0, type: 'in', action: 'DROP' });

      const result = await handleGuestFirewallRule(client, config, {
        action: 'get',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        pos: 0,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Firewall Rule');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/lxc/200/firewall/rules/0');
    });
  });

  describe('action=create', () => {
    it('creates VM firewall rule with rule_action mapping', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'create',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        rule_action: 'ACCEPT',
        rule_type: 'in',
        proto: 'tcp',
        dport: '22',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Firewall Rule Created');
    });

    it('creates LXC firewall rule', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'create',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        rule_action: 'DROP',
        rule_type: 'in',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Firewall Rule Created');
    });

    it('requires elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleGuestFirewallRule(client, config, {
        action: 'create',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        rule_action: 'ACCEPT',
        rule_type: 'in',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('action=update', () => {
    it('updates VM firewall rule', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'update',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        pos: 0,
        rule_action: 'REJECT',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Firewall Rule Updated');
    });

    it('requires elevated permissions for update', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleGuestFirewallRule(client, config, {
        action: 'update',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        pos: 0,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('action=delete', () => {
    it('deletes VM firewall rule', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'delete',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        pos: 0,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VM Firewall Rule Deleted');
    });

    it('deletes LXC firewall rule', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(null);

      const result = await handleGuestFirewallRule(client, config, {
        action: 'delete',
        type: 'lxc',
        node: 'pve1',
        vmid: 200,
        pos: 1,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('LXC Firewall Rule Deleted');
    });

    it('requires elevated permissions for delete', async () => {
      const config = createTestConfig({ allowElevated: false });

      const result = await handleGuestFirewallRule(client, config, {
        action: 'delete',
        type: 'vm',
        node: 'pve1',
        vmid: 100,
        pos: 0,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Permission denied');
    });
  });
});
