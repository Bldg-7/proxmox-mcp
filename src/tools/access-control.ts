import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { formatToolResponse, formatErrorResponse } from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  listUsersSchema,
  getUserSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  listGroupsSchema,
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
  listRolesSchema,
  createRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
  getAclSchema,
  updateAclSchema,
  listDomainsSchema,
  getDomainSchema,
  createDomainSchema,
  updateDomainSchema,
  deleteDomainSchema,
} from '../schemas/access-control.js';
import type {
  ListUsersInput,
  GetUserInput,
  CreateUserInput,
  UpdateUserInput,
  DeleteUserInput,
  ListGroupsInput,
  CreateGroupInput,
  UpdateGroupInput,
  DeleteGroupInput,
  ListRolesInput,
  CreateRoleInput,
  UpdateRoleInput,
  DeleteRoleInput,
  GetAclInput,
  UpdateAclInput,
  ListDomainsInput,
  GetDomainInput,
  CreateDomainInput,
  UpdateDomainInput,
  DeleteDomainInput,
} from '../schemas/access-control.js';

interface AccessUserEntry {
  userid?: string;
  comment?: string;
  enable?: number | boolean;
  expire?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  groups?: string;
  [key: string]: unknown;
}

interface AccessGroupEntry {
  groupid?: string;
  comment?: string;
  users?: string;
  [key: string]: unknown;
}

interface AccessRoleEntry {
  roleid?: string;
  privs?: string;
  comment?: string;
  [key: string]: unknown;
}

interface AccessAclEntry {
  path?: string;
  type?: string;
  ugid?: string;
  roleid?: string;
  propagate?: number | boolean;
  [key: string]: unknown;
}

interface AccessDomainEntry {
  realm?: string;
  type?: string;
  comment?: string;
  default?: number | boolean;
  [key: string]: unknown;
}

function formatKeyValueEntries(data: Record<string, unknown>): string {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return 'No details available.';
  return entries
    .map(([key, value]) => `• **${key}**: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n');
}

/**
 * List users.
 */
export async function listUsers(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListUsersInput
): Promise<ToolResponse> {
  try {
    listUsersSchema.parse(input);
    const users = (await client.request('/access/users')) as AccessUserEntry[];

    let output = '👥 **Users**\n\n';

    if (!users || users.length === 0) {
      output += 'No users found.';
      return formatToolResponse(output);
    }

    for (const user of users) {
      const userid = user.userid ?? 'unknown';
      output += `• **${userid}**`;
      if (user.enable !== undefined) {
        const enabled = Boolean(user.enable);
        output += ` - ${enabled ? 'enabled' : 'disabled'}`;
      }
      if (user.groups) output += ` (groups: ${user.groups})`;
      if (user.comment) output += `\n  ${user.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${users.length} user(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Users');
  }
}

/**
 * Get user details.
 */
export async function getUser(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetUserInput
): Promise<ToolResponse> {
  try {
    const validated = getUserSchema.parse(input);
    const encodedUser = encodeURIComponent(validated.userid);
    const user = (await client.request(`/access/users/${encodedUser}`)) as AccessUserEntry;

    let output = '👤 **User Details**\n\n';
    output += `• **User ID**: ${validated.userid}\n`;
    if (user.enable !== undefined) {
      output += `• **Enabled**: ${Boolean(user.enable) ? 'yes' : 'no'}\n`;
    }
    if (user.expire !== undefined) output += `• **Expire**: ${user.expire}\n`;
    if (user.firstname) output += `• **First Name**: ${user.firstname}\n`;
    if (user.lastname) output += `• **Last Name**: ${user.lastname}\n`;
    if (user.email) output += `• **Email**: ${user.email}\n`;
    if (user.groups) output += `• **Groups**: ${user.groups}\n`;
    if (user.comment) output += `• **Comment**: ${user.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get User');
  }
}

/**
 * Create user.
 */
export async function createUser(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateUserInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create user');

    const validated = createUserSchema.parse(input);
    const payload: Record<string, unknown> = { userid: validated.userid };

    if (validated.password) payload.password = validated.password;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.email) payload.email = validated.email;
    if (validated.firstname) payload.firstname = validated.firstname;
    if (validated.lastname) payload.lastname = validated.lastname;
    if (validated.groups) payload.groups = validated.groups;
    if (validated.expire !== undefined) payload.expire = validated.expire;
    if (validated.enable !== undefined) payload.enable = validated.enable;

    const result = await client.request('/access/users', 'POST', payload);

    let output = '✅ **User Created**\n\n';
    output += `• **User ID**: ${validated.userid}\n`;
    if (payload.groups) output += `• **Groups**: ${payload.groups}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create User');
  }
}

/**
 * Update user.
 */
export async function updateUser(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateUserInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update user');

    const validated = updateUserSchema.parse(input);
    const payload: Record<string, unknown> = {};

    if (validated.password) payload.password = validated.password;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.email) payload.email = validated.email;
    if (validated.firstname) payload.firstname = validated.firstname;
    if (validated.lastname) payload.lastname = validated.lastname;
    if (validated.groups) payload.groups = validated.groups;
    if (validated.append !== undefined) payload.append = validated.append;
    if (validated.expire !== undefined) payload.expire = validated.expire;
    if (validated.enable !== undefined) payload.enable = validated.enable;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/access/users/${encodeURIComponent(validated.userid)}`,
      'PUT',
      payload
    );

    let output = '✅ **User Updated**\n\n';
    output += `• **User ID**: ${validated.userid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update User');
  }
}

/**
 * Delete user.
 */
export async function deleteUser(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteUserInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete user');

    const validated = deleteUserSchema.parse(input);
    const result = await client.request(
      `/access/users/${encodeURIComponent(validated.userid)}`,
      'DELETE'
    );

    let output = '🗑️  **User Deleted**\n\n';
    output += `• **User ID**: ${validated.userid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete User');
  }
}

/**
 * List groups.
 */
export async function listGroups(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListGroupsInput
): Promise<ToolResponse> {
  try {
    listGroupsSchema.parse(input);
    const groups = (await client.request('/access/groups')) as AccessGroupEntry[];

    let output = '👥 **Groups**\n\n';

    if (!groups || groups.length === 0) {
      output += 'No groups found.';
      return formatToolResponse(output);
    }

    for (const group of groups) {
      const groupid = group.groupid ?? 'unknown';
      output += `• **${groupid}**`;
      if (group.comment) output += ` - ${group.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${groups.length} group(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Groups');
  }
}

/**
 * Create group.
 */
export async function createGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create group');

    const validated = createGroupSchema.parse(input);
    const payload: Record<string, unknown> = { groupid: validated.groupid };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.users) payload.users = validated.users;

    const result = await client.request('/access/groups', 'POST', payload);

    let output = '✅ **Group Created**\n\n';
    output += `• **Group**: ${validated.groupid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Group');
  }
}

/**
 * Update group.
 */
export async function updateGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update group');

    const validated = updateGroupSchema.parse(input);
    const payload: Record<string, unknown> = {};

    if (validated.comment) payload.comment = validated.comment;
    if (validated.users) payload.users = validated.users;
    if (validated.append !== undefined) payload.append = validated.append;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/access/groups/${encodeURIComponent(validated.groupid)}`,
      'PUT',
      payload
    );

    let output = '✅ **Group Updated**\n\n';
    output += `• **Group**: ${validated.groupid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Group');
  }
}

/**
 * Delete group.
 */
export async function deleteGroup(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteGroupInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete group');

    const validated = deleteGroupSchema.parse(input);
    const result = await client.request(
      `/access/groups/${encodeURIComponent(validated.groupid)}`,
      'DELETE'
    );

    let output = '🗑️  **Group Deleted**\n\n';
    output += `• **Group**: ${validated.groupid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Group');
  }
}

/**
 * List roles.
 */
export async function listRoles(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListRolesInput
): Promise<ToolResponse> {
  try {
    listRolesSchema.parse(input);
    const roles = (await client.request('/access/roles')) as AccessRoleEntry[];

    let output = '🛡️  **Roles**\n\n';

    if (!roles || roles.length === 0) {
      output += 'No roles found.';
      return formatToolResponse(output);
    }

    for (const role of roles) {
      const roleid = role.roleid ?? 'unknown';
      output += `• **${roleid}**`;
      if (role.privs) output += ` - privs: ${role.privs}`;
      if (role.comment) output += `\n  ${role.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${roles.length} role(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Roles');
  }
}

/**
 * Create role.
 */
export async function createRole(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateRoleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create role');

    const validated = createRoleSchema.parse(input);
    const payload: Record<string, unknown> = {
      roleid: validated.roleid,
      privs: validated.privs,
    };

    if (validated.comment) payload.comment = validated.comment;

    const result = await client.request('/access/roles', 'POST', payload);

    let output = '✅ **Role Created**\n\n';
    output += `• **Role**: ${validated.roleid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Role');
  }
}

/**
 * Update role.
 */
export async function updateRole(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateRoleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update role');

    const validated = updateRoleSchema.parse(input);
    const payload: Record<string, unknown> = {};

    if (validated.privs) payload.privs = validated.privs;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.append !== undefined) payload.append = validated.append;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/access/roles/${encodeURIComponent(validated.roleid)}`,
      'PUT',
      payload
    );

    let output = '✅ **Role Updated**\n\n';
    output += `• **Role**: ${validated.roleid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Role');
  }
}

/**
 * Delete role.
 */
export async function deleteRole(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteRoleInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete role');

    const validated = deleteRoleSchema.parse(input);
    const result = await client.request(
      `/access/roles/${encodeURIComponent(validated.roleid)}`,
      'DELETE'
    );

    let output = '🗑️  **Role Deleted**\n\n';
    output += `• **Role**: ${validated.roleid}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Role');
  }
}

/**
 * Get ACL entries.
 */
export async function getAcl(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetAclInput
): Promise<ToolResponse> {
  try {
    const validated = getAclSchema.parse(input);
    const params = new URLSearchParams();
    if (validated.path) params.set('path', validated.path);
    if (validated.userid) params.set('userid', validated.userid);
    if (validated.groupid) params.set('groupid', validated.groupid);
    if (validated.roleid) params.set('roleid', validated.roleid);
    const query = params.toString();

    const entries = (await client.request(`/access/acl${query ? `?${query}` : ''}`)) as
      | AccessAclEntry[]
      | Record<string, unknown>;

    let output = '🔐 **ACL Entries**\n\n';

    if (!entries || (Array.isArray(entries) && entries.length === 0)) {
      output += 'No ACL entries found.';
      return formatToolResponse(output);
    }

    if (!Array.isArray(entries)) {
      output += formatKeyValueEntries(entries as Record<string, unknown>);
      return formatToolResponse(output.trimEnd());
    }

    for (const entry of entries) {
      const path = entry.path ?? 'unknown';
      output += `• **${path}**`;
      if (entry.type) output += ` (${entry.type})`;
      if (entry.ugid) output += ` - ${entry.ugid}`;
      if (entry.roleid) output += ` [role: ${entry.roleid}]`;
      if (entry.propagate !== undefined) {
        output += ` (propagate: ${Boolean(entry.propagate) ? 'yes' : 'no'})`;
      }
      output += '\n';
    }

    output += `\n**Total**: ${entries.length} entry(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get ACL');
  }
}

/**
 * Update ACL.
 */
export async function updateAcl(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateAclInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update ACL');

    const validated = updateAclSchema.parse(input);
    const payload: Record<string, unknown> = {
      path: validated.path,
      roles: validated.roles,
    };

    if (validated.users) payload.users = validated.users;
    if (validated.groups) payload.groups = validated.groups;
    if (validated.propagate !== undefined) payload.propagate = validated.propagate;
    if (validated.delete !== undefined) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request('/access/acl', 'PUT', payload);

    let output = '✅ **ACL Updated**\n\n';
    output += `• **Path**: ${validated.path}\n`;
    output += `• **Roles**: ${validated.roles}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update ACL');
  }
}

/**
 * List auth domains.
 */
export async function listDomains(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListDomainsInput
): Promise<ToolResponse> {
  try {
    listDomainsSchema.parse(input);
    const domains = (await client.request('/access/domains')) as AccessDomainEntry[];

    let output = '🧭 **Authentication Domains**\n\n';

    if (!domains || domains.length === 0) {
      output += 'No authentication domains found.';
      return formatToolResponse(output);
    }

    for (const domain of domains) {
      const realm = domain.realm ?? 'unknown';
      const type = domain.type ?? 'n/a';
      output += `• **${realm}** (${type})`;
      if (domain.default !== undefined) {
        output += ` - ${Boolean(domain.default) ? 'default' : 'non-default'}`;
      }
      if (domain.comment) output += `\n  ${domain.comment}`;
      output += '\n';
    }

    output += `\n**Total**: ${domains.length} domain(s)`;
    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Domains');
  }
}

/**
 * Get auth domain details.
 */
export async function getDomain(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetDomainInput
): Promise<ToolResponse> {
  try {
    const validated = getDomainSchema.parse(input);
    const domain = (await client.request(
      `/access/domains/${encodeURIComponent(validated.realm)}`
    )) as AccessDomainEntry;

    let output = '🧭 **Auth Domain Details**\n\n';
    output += `• **Realm**: ${validated.realm}\n`;
    if (domain.type) output += `• **Type**: ${domain.type}\n`;
    if (domain.default !== undefined) {
      output += `• **Default**: ${Boolean(domain.default) ? 'yes' : 'no'}\n`;
    }
    if (domain.comment) output += `• **Comment**: ${domain.comment}\n`;

    return formatToolResponse(output.trimEnd());
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Domain');
  }
}

/**
 * Create auth domain.
 */
export async function createDomain(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateDomainInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create auth domain');

    const validated = createDomainSchema.parse(input);
    const payload: Record<string, unknown> = {
      realm: validated.realm,
      type: validated.type,
    };

    if (validated.comment) payload.comment = validated.comment;
    if (validated.default !== undefined) payload.default = validated.default;
    if (validated.server1) payload.server1 = validated.server1;
    if (validated.server2) payload.server2 = validated.server2;
    if (validated.port !== undefined) payload.port = validated.port;
    if (validated.secure !== undefined) payload.secure = validated.secure;
    if (validated.base_dn) payload.base_dn = validated.base_dn;
    if (validated.user_attr) payload.user_attr = validated.user_attr;
    if (validated.bind_dn) payload.bind_dn = validated.bind_dn;
    if (validated.bind_password) payload.bind_password = validated.bind_password;
    if (validated.group_filter) payload.group_filter = validated.group_filter;
    if (validated.capath) payload.capath = validated.capath;
    if (validated.sslversion) payload.sslversion = validated.sslversion;

    const result = await client.request('/access/domains', 'POST', payload);

    let output = '✅ **Auth Domain Created**\n\n';
    output += `• **Realm**: ${validated.realm}\n`;
    output += `• **Type**: ${validated.type}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create Domain');
  }
}

/**
 * Update auth domain.
 */
export async function updateDomain(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateDomainInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update auth domain');

    const validated = updateDomainSchema.parse(input);
    const payload: Record<string, unknown> = {};

    if (validated.type) payload.type = validated.type;
    if (validated.comment) payload.comment = validated.comment;
    if (validated.default !== undefined) payload.default = validated.default;
    if (validated.server1) payload.server1 = validated.server1;
    if (validated.server2) payload.server2 = validated.server2;
    if (validated.port !== undefined) payload.port = validated.port;
    if (validated.secure !== undefined) payload.secure = validated.secure;
    if (validated.base_dn) payload.base_dn = validated.base_dn;
    if (validated.user_attr) payload.user_attr = validated.user_attr;
    if (validated.bind_dn) payload.bind_dn = validated.bind_dn;
    if (validated.bind_password) payload.bind_password = validated.bind_password;
    if (validated.group_filter) payload.group_filter = validated.group_filter;
    if (validated.capath) payload.capath = validated.capath;
    if (validated.sslversion) payload.sslversion = validated.sslversion;
    if (validated.delete) payload.delete = validated.delete;
    if (validated.digest) payload.digest = validated.digest;

    const result = await client.request(
      `/access/domains/${encodeURIComponent(validated.realm)}`,
      'PUT',
      payload
    );

    let output = '✅ **Auth Domain Updated**\n\n';
    output += `• **Realm**: ${validated.realm}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Update Domain');
  }
}

/**
 * Delete auth domain.
 */
export async function deleteDomain(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteDomainInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete auth domain');

    const validated = deleteDomainSchema.parse(input);
    const result = await client.request(
      `/access/domains/${encodeURIComponent(validated.realm)}`,
      'DELETE'
    );

    let output = '🗑️  **Auth Domain Deleted**\n\n';
    output += `• **Realm**: ${validated.realm}\n`;
    output += `• **Result**: ${result ?? 'OK'}`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Domain');
  }
}
