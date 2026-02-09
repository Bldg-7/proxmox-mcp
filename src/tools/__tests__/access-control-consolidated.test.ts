import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../../client/proxmox.js';
import type { Config } from '../../config/index.js';
import {
  handleUserTool,
  handleGroupTool,
  handleRoleTool,
  handleAclTool,
  handleDomainTool,
  handleUserTokenTool,
} from '../access-control.js';

// Mock client and config
const mockClient = {
  request: vi.fn(),
} as unknown as ProxmoxApiClient;

const mockConfig = {
  allowElevated: true,
} as unknown as Config;

const mockConfigNoElevated = {
  allowElevated: false,
} as unknown as Config;

describe('Access Control Consolidated Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('proxmox_user', () => {
    it('should list users with action=list', async () => {
      (mockClient.request as any).mockResolvedValue([
        { userid: 'root@pam', comment: 'Administrator' },
      ]);

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toBe('/access/users');
    });

    it('should get user with action=get', async () => {
      (mockClient.request as any).mockResolvedValue({
        userid: 'user@pve',
        comment: 'Test User',
      });

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'get',
        userid: 'user@pve',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toContain('/access/users/');
    });

    it('should create user with action=create (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'create',
        userid: 'newuser@pve',
        password: 'password123',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('POST');
    });

    it('should deny create user without elevated permissions', async () => {
      const result = await handleUserTool(mockClient, mockConfigNoElevated, {
        action: 'create',
        userid: 'newuser@pve',
        password: 'password123',
      });

      expect(result.isError).toBe(true);
    });

    it('should update user with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'update',
        userid: 'user@pve',
        comment: 'Updated comment',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should delete user with action=delete (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'delete',
        userid: 'user@pve',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('DELETE');
    });
  });

  describe('proxmox_group', () => {
    it('should list groups with action=list', async () => {
      (mockClient.request as any).mockResolvedValue([
        { groupid: 'admins', comment: 'Admin group' },
      ]);

      const result = await handleGroupTool(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toBe('/access/groups');
    });

    it('should create group with action=create (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleGroupTool(mockClient, mockConfig, {
        action: 'create',
        groupid: 'newgroup',
        comment: 'New group',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('POST');
    });

    it('should deny create group without elevated permissions', async () => {
      const result = await handleGroupTool(mockClient, mockConfigNoElevated, {
        action: 'create',
        groupid: 'newgroup',
      });

      expect(result.isError).toBe(true);
    });

    it('should update group with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleGroupTool(mockClient, mockConfig, {
        action: 'update',
        groupid: 'admins',
        comment: 'Updated admin group',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should delete group with action=delete (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleGroupTool(mockClient, mockConfig, {
        action: 'delete',
        groupid: 'admins',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('DELETE');
    });
  });

  describe('proxmox_role', () => {
    it('should list roles with action=list', async () => {
      (mockClient.request as any).mockResolvedValue([
        { roleid: 'Administrator', privs: 'Sys.Audit,Sys.Modify' },
      ]);

      const result = await handleRoleTool(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toBe('/access/roles');
    });

    it('should create role with action=create (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleRoleTool(mockClient, mockConfig, {
        action: 'create',
        roleid: 'CustomRole',
        privs: 'Vm.Audit',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('POST');
    });

    it('should update role with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleRoleTool(mockClient, mockConfig, {
        action: 'update',
        roleid: 'CustomRole',
        privs: 'Vm.Audit,Vm.Modify',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should delete role with action=delete (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleRoleTool(mockClient, mockConfig, {
        action: 'delete',
        roleid: 'CustomRole',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('DELETE');
    });
  });

  describe('proxmox_acl', () => {
    it('should get ACL with action=get', async () => {
      (mockClient.request as any).mockResolvedValue([
        { path: '/', ugid: 'user@pve', roleid: 'Administrator' },
      ]);

      const result = await handleAclTool(mockClient, mockConfig, {
        action: 'get',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toBe('/access/acl');
    });

    it('should update ACL with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleAclTool(mockClient, mockConfig, {
        action: 'update',
        path: '/',
        users: 'user@pve',
        roles: 'Administrator',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should deny update ACL without elevated permissions', async () => {
      const result = await handleAclTool(mockClient, mockConfigNoElevated, {
        action: 'update',
        path: '/',
        users: 'user@pve',
        roles: 'Administrator',
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('proxmox_domain', () => {
    it('should list domains with action=list', async () => {
      (mockClient.request as any).mockResolvedValue([
        { realm: 'pam', type: 'pam', comment: 'Linux PAM' },
      ]);

      const result = await handleDomainTool(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toBe('/access/domains');
    });

    it('should get domain with action=get', async () => {
      (mockClient.request as any).mockResolvedValue({
        realm: 'pam',
        type: 'pam',
      });

      const result = await handleDomainTool(mockClient, mockConfig, {
        action: 'get',
        realm: 'pam',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toContain('/access/domains/');
    });

    it('should create domain with action=create (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleDomainTool(mockClient, mockConfig, {
        action: 'create',
        realm: 'ldap',
        type: 'ldap',
        server1: 'ldap.example.com',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('POST');
    });

    it('should update domain with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleDomainTool(mockClient, mockConfig, {
        action: 'update',
        realm: 'ldap',
        comment: 'Updated LDAP',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should delete domain with action=delete (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleDomainTool(mockClient, mockConfig, {
        action: 'delete',
        realm: 'ldap',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('DELETE');
    });
  });

  describe('proxmox_user_token', () => {
    it('should list user tokens with action=list', async () => {
      (mockClient.request as any).mockResolvedValue([
        { tokenid: 'user@pve!token1', comment: 'API token' },
      ]);

      const result = await handleUserTokenTool(mockClient, mockConfig, {
        action: 'list',
        userid: 'user@pve',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][0]).toContain('/access/users/');
    });

    it('should get user token with action=get', async () => {
      (mockClient.request as any).mockResolvedValue({
        tokenid: 'user@pve!token1',
        comment: 'API token',
      });

      const result = await handleUserTokenTool(mockClient, mockConfig, {
        action: 'get',
        userid: 'user@pve',
        tokenid: 'token1',
      });

      expect(result.isError).toBe(false);
    });

    it('should create user token with action=create (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue({
        value: 'abc123-def456',
      });

      const result = await handleUserTokenTool(mockClient, mockConfig, {
        action: 'create',
        userid: 'user@pve',
        tokenid: 'newtoken',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('POST');
    });

    it('should update user token with action=update (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleUserTokenTool(mockClient, mockConfig, {
        action: 'update',
        userid: 'user@pve',
        tokenid: 'token1',
        comment: 'Updated token',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('PUT');
    });

    it('should delete user token with action=delete (elevated)', async () => {
      (mockClient.request as any).mockResolvedValue('OK');

      const result = await handleUserTokenTool(mockClient, mockConfig, {
        action: 'delete',
        userid: 'user@pve',
        tokenid: 'token1',
      });

      expect(result.isError).toBe(false);
      expect((mockClient.request as any).mock.calls[0][1]).toBe('DELETE');
    });
  });

  describe('Permission checks', () => {
    it('should allow list operations without elevated permissions', async () => {
      (mockClient.request as any).mockResolvedValue([]);

      const result = await handleUserTool(mockClient, mockConfigNoElevated, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
    });

    it('should allow get operations without elevated permissions', async () => {
      (mockClient.request as any).mockResolvedValue({});

      const result = await handleUserTool(mockClient, mockConfigNoElevated, {
        action: 'get',
        userid: 'user@pve',
      });

      expect(result.isError).toBe(false);
    });

    it('should deny elevated operations without elevated permissions', async () => {
      const result = await handleUserTool(mockClient, mockConfigNoElevated, {
        action: 'delete',
        userid: 'user@pve',
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      (mockClient.request as any).mockRejectedValue(new Error('API Error'));

      const result = await handleUserTool(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(true);
    });
  });
});
