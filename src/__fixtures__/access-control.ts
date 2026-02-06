export const sampleUsers = [
  {
    userid: 'alice@pve',
    enable: 1,
    firstname: 'Alice',
    lastname: 'Admin',
    email: 'alice@example.com',
    groups: 'admins',
    comment: 'Platform admin',
  },
  {
    userid: 'bob@pam',
    enable: 0,
    groups: 'contractors',
    comment: 'Contractor account',
  },
];

export const sampleUser = {
  userid: 'alice@pve',
  enable: 1,
  firstname: 'Alice',
  lastname: 'Admin',
  email: 'alice@example.com',
  groups: 'admins',
  comment: 'Platform admin',
};

export const sampleGroups = [
  {
    groupid: 'admins',
    comment: 'Administrators',
  },
  {
    groupid: 'devops',
    comment: 'DevOps team',
  },
];

export const sampleRoles = [
  {
    roleid: 'Auditor',
    privs: 'VM.Audit,Datastore.Audit',
    comment: 'Read-only audit role',
  },
  {
    roleid: 'VMAdmin',
    privs: 'VM.Allocate,VM.PowerMgmt',
    comment: 'VM admin role',
  },
];

export const sampleAclEntries = [
  {
    path: '/',
    type: 'user',
    ugid: 'alice@pve',
    roleid: 'Administrator',
    propagate: 1,
  },
  {
    path: '/vms',
    type: 'group',
    ugid: 'devops',
    roleid: 'VMAdmin',
    propagate: 0,
  },
];

export const sampleDomains = [
  {
    realm: 'pam',
    type: 'pam',
    comment: 'Linux PAM',
    default: 1,
  },
  {
    realm: 'ldap',
    type: 'ldap',
    comment: 'Corp LDAP',
  },
];

export const sampleDomain = {
  realm: 'ldap',
  type: 'ldap',
  comment: 'Corp LDAP',
  server1: 'ldap.example.com',
  base_dn: 'dc=example,dc=com',
};
