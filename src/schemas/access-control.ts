import { z } from 'zod';

// proxmox_list_users - List users
export const listUsersSchema = z.object({});

export type ListUsersInput = z.input<typeof listUsersSchema>;

// proxmox_get_user - Get user details
export const getUserSchema = z.object({
  userid: z.string().min(1).describe('User ID with realm (e.g., root@pam)'),
});

export type GetUserInput = z.input<typeof getUserSchema>;

// proxmox_create_user - Create user
export const createUserSchema = z.object({
  userid: z.string().min(1).describe('User ID with realm (e.g., user@pve)'),
  password: z.string().optional().describe('User password'),
  comment: z.string().optional().describe('User comment'),
  email: z.string().email().optional().describe('Email address'),
  firstname: z.string().optional().describe('First name'),
  lastname: z.string().optional().describe('Last name'),
  groups: z.string().optional().describe('Comma-separated group IDs'),
  expire: z.number().int().min(0).optional().describe('Account expiration (epoch seconds)'),
  enable: z.boolean().optional().describe('Enable user account'),
});

export type CreateUserInput = z.input<typeof createUserSchema>;

// proxmox_update_user - Update user
export const updateUserSchema = z.object({
  userid: z.string().min(1).describe('User ID with realm (e.g., user@pve)'),
  password: z.string().optional().describe('New password'),
  comment: z.string().optional().describe('User comment'),
  email: z.string().email().optional().describe('Email address'),
  firstname: z.string().optional().describe('First name'),
  lastname: z.string().optional().describe('Last name'),
  groups: z.string().optional().describe('Comma-separated group IDs'),
  append: z.boolean().optional().describe('Append groups instead of replacing'),
  expire: z.number().int().min(0).optional().describe('Account expiration (epoch seconds)'),
  enable: z.boolean().optional().describe('Enable user account'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateUserInput = z.input<typeof updateUserSchema>;

// proxmox_delete_user - Delete user
export const deleteUserSchema = z.object({
  userid: z.string().min(1).describe('User ID with realm (e.g., user@pve)'),
});

export type DeleteUserInput = z.input<typeof deleteUserSchema>;

// proxmox_list_groups - List groups
export const listGroupsSchema = z.object({});

export type ListGroupsInput = z.input<typeof listGroupsSchema>;

// proxmox_create_group - Create group
export const createGroupSchema = z.object({
  groupid: z.string().min(1).describe('Group identifier'),
  comment: z.string().optional().describe('Group comment'),
  users: z.string().optional().describe('Comma-separated user IDs'),
});

export type CreateGroupInput = z.input<typeof createGroupSchema>;

// proxmox_update_group - Update group
export const updateGroupSchema = z.object({
  groupid: z.string().min(1).describe('Group identifier'),
  comment: z.string().optional().describe('Group comment'),
  users: z.string().optional().describe('Comma-separated user IDs'),
  append: z.boolean().optional().describe('Append users instead of replacing'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateGroupInput = z.input<typeof updateGroupSchema>;

// proxmox_delete_group - Delete group
export const deleteGroupSchema = z.object({
  groupid: z.string().min(1).describe('Group identifier'),
});

export type DeleteGroupInput = z.input<typeof deleteGroupSchema>;

// proxmox_list_roles - List roles
export const listRolesSchema = z.object({});

export type ListRolesInput = z.input<typeof listRolesSchema>;

// proxmox_create_role - Create role
export const createRoleSchema = z.object({
  roleid: z.string().min(1).describe('Role identifier'),
  privs: z.string().min(1).describe('Comma-separated privileges'),
  comment: z.string().optional().describe('Role comment'),
});

export type CreateRoleInput = z.input<typeof createRoleSchema>;

// proxmox_update_role - Update role
export const updateRoleSchema = z.object({
  roleid: z.string().min(1).describe('Role identifier'),
  privs: z.string().optional().describe('Comma-separated privileges'),
  comment: z.string().optional().describe('Role comment'),
  append: z.boolean().optional().describe('Append privileges instead of replacing'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateRoleInput = z.input<typeof updateRoleSchema>;

// proxmox_delete_role - Delete role
export const deleteRoleSchema = z.object({
  roleid: z.string().min(1).describe('Role identifier'),
});

export type DeleteRoleInput = z.input<typeof deleteRoleSchema>;

// proxmox_get_acl - Get ACL entries
export const getAclSchema = z.object({
  path: z.string().optional().describe('Filter by path (e.g., /vms)'),
  userid: z.string().optional().describe('Filter by user ID'),
  groupid: z.string().optional().describe('Filter by group ID'),
  roleid: z.string().optional().describe('Filter by role ID'),
});

export type GetAclInput = z.input<typeof getAclSchema>;

// proxmox_update_acl - Update ACL
export const updateAclSchema = z.object({
  path: z.string().min(1).describe('ACL path (e.g., /vms)'),
  roles: z.string().min(1).describe('Comma-separated roles'),
  users: z.string().optional().describe('Comma-separated user IDs'),
  groups: z.string().optional().describe('Comma-separated group IDs'),
  propagate: z.boolean().optional().describe('Propagate to sub-paths'),
  delete: z.boolean().optional().describe('Delete ACL entry'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateAclInput = z.input<typeof updateAclSchema>;

const domainTypeEnum = z.enum(['pam', 'pve', 'ldap', 'ad', 'openid']);

// proxmox_list_domains - List auth domains
export const listDomainsSchema = z.object({});

export type ListDomainsInput = z.input<typeof listDomainsSchema>;

// proxmox_get_domain - Get auth domain details
export const getDomainSchema = z.object({
  realm: z.string().min(1).describe('Auth domain (realm) name'),
});

export type GetDomainInput = z.input<typeof getDomainSchema>;

// proxmox_create_domain - Create auth domain
export const createDomainSchema = z.object({
  realm: z.string().min(1).describe('Auth domain (realm) name'),
  type: domainTypeEnum.describe('Authentication domain type'),
  comment: z.string().optional().describe('Domain comment'),
  default: z.boolean().optional().describe('Set as default realm'),
  server1: z.string().optional().describe('Primary server'),
  server2: z.string().optional().describe('Secondary server'),
  port: z.number().int().min(1).max(65535).optional().describe('Port'),
  secure: z.boolean().optional().describe('Enable TLS'),
  base_dn: z.string().optional().describe('Base DN'),
  user_attr: z.string().optional().describe('User attribute'),
  bind_dn: z.string().optional().describe('Bind DN'),
  bind_password: z.string().optional().describe('Bind password'),
  group_filter: z.string().optional().describe('Group filter'),
  capath: z.string().optional().describe('CA certificate path'),
  sslversion: z.string().optional().describe('TLS version'),
});

export type CreateDomainInput = z.input<typeof createDomainSchema>;

// proxmox_update_domain - Update auth domain
export const updateDomainSchema = z.object({
  realm: z.string().min(1).describe('Auth domain (realm) name'),
  type: domainTypeEnum.optional().describe('Authentication domain type'),
  comment: z.string().optional().describe('Domain comment'),
  default: z.boolean().optional().describe('Set as default realm'),
  server1: z.string().optional().describe('Primary server'),
  server2: z.string().optional().describe('Secondary server'),
  port: z.number().int().min(1).max(65535).optional().describe('Port'),
  secure: z.boolean().optional().describe('Enable TLS'),
  base_dn: z.string().optional().describe('Base DN'),
  user_attr: z.string().optional().describe('User attribute'),
  bind_dn: z.string().optional().describe('Bind DN'),
  bind_password: z.string().optional().describe('Bind password'),
  group_filter: z.string().optional().describe('Group filter'),
  capath: z.string().optional().describe('CA certificate path'),
  sslversion: z.string().optional().describe('TLS version'),
  delete: z.string().optional().describe('List of settings to delete'),
  digest: z.string().max(64).optional().describe('Config digest'),
});

export type UpdateDomainInput = z.input<typeof updateDomainSchema>;

// proxmox_delete_domain - Delete auth domain
export const deleteDomainSchema = z.object({
  realm: z.string().min(1).describe('Auth domain (realm) name'),
});

export type DeleteDomainInput = z.input<typeof deleteDomainSchema>;
