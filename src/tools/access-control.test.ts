import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  sampleUsers,
  sampleUser,
  sampleGroups,
  sampleRoles,
  sampleAclEntries,
  sampleDomains,
  sampleDomain,
} from '../__fixtures__/access-control.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getAcl,
  updateAcl,
  listDomains,
  getDomain,
  createDomain,
  updateDomain,
  deleteDomain,
} from './access-control.js';

describe('listUsers', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted users list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleUsers);

    const result = await listUsers(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Users');
    expect(result.content[0].text).toContain('alice@pve');
  });
});

describe('getUser', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns user details', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleUser);

    const result = await getUser(client, config, { userid: 'alice@pve' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('alice@pve');
    expect(client.request).toHaveBeenCalledWith('/access/users/alice%40pve');
  });
});

describe('createUser', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createUser(client, config, {
      userid: 'alice@pve',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('calls correct API endpoint', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createUser(client, config, {
      userid: 'bob@pve',
      email: 'bob@example.com',
      groups: 'devops',
    });

    expect(client.request).toHaveBeenCalledWith('/access/users', 'POST', {
      userid: 'bob@pve',
      email: 'bob@example.com',
      groups: 'devops',
    });
  });
});

describe('updateUser', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates user details', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateUser(client, config, {
      userid: 'alice@pve',
      comment: 'Updated',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('User Updated');
  });
});

describe('deleteUser', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes user', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteUser(client, config, { userid: 'alice@pve' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/access/users/alice%40pve', 'DELETE');
  });
});

describe('listGroups', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists groups', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleGroups);

    const result = await listGroups(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Groups');
    expect(result.content[0].text).toContain('admins');
  });
});

describe('createGroup', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates group', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createGroup(client, config, {
      groupid: 'ops',
      comment: 'Operations',
    });

    expect(client.request).toHaveBeenCalledWith('/access/groups', 'POST', {
      groupid: 'ops',
      comment: 'Operations',
    });
  });
});

describe('updateGroup', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates group', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateGroup(client, config, {
      groupid: 'admins',
      comment: 'Updated',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Group Updated');
  });
});

describe('deleteGroup', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes group', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteGroup(client, config, { groupid: 'admins' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/access/groups/admins', 'DELETE');
  });
});

describe('listRoles', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists roles', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleRoles);

    const result = await listRoles(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Roles');
    expect(result.content[0].text).toContain('VMAdmin');
  });
});

describe('createRole', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates role', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createRole(client, config, {
      roleid: 'VMOperator',
      privs: 'VM.PowerMgmt',
    });

    expect(client.request).toHaveBeenCalledWith('/access/roles', 'POST', {
      roleid: 'VMOperator',
      privs: 'VM.PowerMgmt',
    });
  });
});

describe('updateRole', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates role', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateRole(client, config, {
      roleid: 'VMAdmin',
      comment: 'Updated',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Role Updated');
  });
});

describe('deleteRole', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes role', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteRole(client, config, { roleid: 'VMAdmin' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/access/roles/VMAdmin', 'DELETE');
  });
});

describe('getAcl', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns ACL entries', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleAclEntries);

    const result = await getAcl(client, config, { path: '/' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('ACL Entries');
    expect(result.content[0].text).toContain('Administrator');
  });
});

describe('updateAcl', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await updateAcl(client, config, {
      path: '/vms',
      roles: 'VMAdmin',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission');
  });

  it('updates ACL entries', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateAcl(client, config, {
      path: '/vms',
      roles: 'VMAdmin',
      users: 'alice@pve',
      propagate: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('ACL Updated');
  });
});

describe('listDomains', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('lists auth domains', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleDomains);

    const result = await listDomains(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Authentication Domains');
    expect(result.content[0].text).toContain('pam');
  });
});

describe('getDomain', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns auth domain details', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue(sampleDomain);

    const result = await getDomain(client, config, { realm: 'ldap' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('ldap');
    expect(client.request).toHaveBeenCalledWith('/access/domains/ldap');
  });
});

describe('createDomain', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createDomain(client, config, {
      realm: 'ldap',
      type: 'ldap',
    });

    expect(result.isError).toBe(true);
  });

  it('creates auth domain', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    await createDomain(client, config, {
      realm: 'ldap',
      type: 'ldap',
      server1: 'ldap.example.com',
    });

    expect(client.request).toHaveBeenCalledWith('/access/domains', 'POST', {
      realm: 'ldap',
      type: 'ldap',
      server1: 'ldap.example.com',
    });
  });
});

describe('updateDomain', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('updates auth domain', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await updateDomain(client, config, {
      realm: 'ldap',
      comment: 'Updated',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Auth Domain Updated');
  });
});

describe('deleteDomain', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes auth domain', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('OK');

    const result = await deleteDomain(client, config, { realm: 'ldap' });

    expect(result.isError).toBe(false);
    expect(client.request).toHaveBeenCalledWith('/access/domains/ldap', 'DELETE');
  });
});
