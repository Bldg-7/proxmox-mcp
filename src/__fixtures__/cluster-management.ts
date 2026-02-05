import type {
  ProxmoxHaResource,
  ProxmoxHaGroup,
  ProxmoxFirewallRule,
  ProxmoxFirewallGroup,
  ProxmoxBackupJob,
  ProxmoxReplicationJob,
} from '../types/proxmox.js';

export const sampleHaResources: ProxmoxHaResource[] = [
  {
    sid: 'vm:100',
    type: 'vm',
    state: 'started',
    group: 'prod',
    comment: 'Primary web VM',
  },
  {
    sid: 'ct:200',
    type: 'ct',
    state: 'stopped',
    group: 'staging',
  },
];

export const sampleHaGroups: ProxmoxHaGroup[] = [
  {
    group: 'prod',
    nodes: 'pve1:1,pve2:2',
    restricted: 1,
    nofailback: 0,
    comment: 'Production nodes',
  },
  {
    group: 'staging',
    nodes: 'pve3:1',
    restricted: 0,
    nofailback: 1,
  },
];

export const sampleHaStatus: Record<string, unknown> = {
  manager: 'pve1',
  state: 'active',
  resources: 2,
  quorate: true,
};

export const sampleFirewallRules: ProxmoxFirewallRule[] = [
  {
    pos: 0,
    type: 'in',
    action: 'ACCEPT',
    proto: 'tcp',
    dport: '22',
    comment: 'Allow SSH',
  },
  {
    pos: 1,
    type: 'in',
    action: 'DROP',
    proto: 'tcp',
    dport: '23',
  },
];

export const sampleFirewallGroups: ProxmoxFirewallGroup[] = [
  {
    group: 'web-servers',
    comment: 'Web tier access',
    digest: 'abc123',
  },
  {
    group: 'db-servers',
    comment: 'Database tier access',
    digest: 'def456',
  },
];

export const sampleBackupJobs: ProxmoxBackupJob[] = [
  {
    id: 'daily-backup',
    storage: 'backup-nfs',
    starttime: '02:00',
    dow: 'mon,tue,wed,thu,fri',
    enabled: 1,
    comment: 'Weekday backups',
  },
  {
    id: 'weekly-backup',
    storage: 'backup-nfs',
    starttime: '03:00',
    dow: 'sun',
    enabled: 0,
  },
];

export const sampleReplicationJobs: ProxmoxReplicationJob[] = [
  {
    id: '101-0',
    guest: 101,
    target: 'pve2',
    type: 'local',
    schedule: '*/15',
    disable: 0,
    comment: 'Critical VM replication',
  },
  {
    id: '102-1',
    guest: 102,
    target: 'pve3',
    type: 'local',
    schedule: '0 */1',
    disable: 1,
  },
];

export const sampleClusterOptions: Record<string, unknown> = {
  console: 'xtermjs',
  language: 'en',
  keyboard: 'en-us',
};
