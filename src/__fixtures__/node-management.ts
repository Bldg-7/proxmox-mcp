export const sampleNodeServices: ProxmoxService[] = [
  {
    name: 'pveproxy',
    state: 'running',
    enabled: 1,
    desc: 'PVE API Proxy',
  },
  {
    name: 'sshd',
    state: 'stopped',
    enabled: 0,
    desc: 'OpenSSH Server',
  },
];

export const sampleSyslogEntries: ProxmoxSyslogEntry[] = [
  { n: 1, t: 'Jan 01 00:00:01 pve1 kernel: Booting Linux...' },
  { n: 2, t: 'Jan 01 00:00:05 pve1 systemd[1]: Started Proxmox VE.' },
];

export const sampleJournalEntries: ProxmoxJournalEntry[] = [
  { n: 1, t: 'systemd[1]: Starting PVE API Proxy...' },
  { n: 2, t: 'systemd[1]: Started PVE API Proxy.' },
];

export const sampleNodeTasks: ProxmoxTask[] = [
  {
    upid: 'UPID:pve1:0002E0B4:0000001D:64A539CB:qmstart:100:root@pam:',
    node: 'pve1',
    pid: 1234,
    pstart: 123456,
    starttime: 1710000000,
    type: 'qmstart',
    id: '100',
    user: 'root@pam',
    status: 'running',
  },
  {
    upid: 'UPID:pve1:0002E0B5:0000001E:64A539CC:qmstop:101:root@pam:',
    node: 'pve1',
    pid: 1235,
    pstart: 123457,
    starttime: 1710000100,
    type: 'qmstop',
    id: '101',
    user: 'root@pam',
    status: 'stopped',
    exitstatus: 'OK',
    endtime: 1710000200,
  },
];

export const sampleApplianceTemplates: ProxmoxApplianceTemplate[] = [
  {
    template: 'debian-12-standard',
    version: '12.1-1',
    type: 'template',
    os: 'debian',
    description: 'Debian 12 standard template',
  },
  {
    template: 'ubuntu-24.04-standard',
    version: '24.04-1',
    type: 'template',
    os: 'ubuntu',
    description: 'Ubuntu 24.04 standard template',
  },
];

export const sampleNetstatEntries: ProxmoxNetstatEntry[] = [
  {
    proto: 'tcp',
    local_address: '0.0.0.0:22',
    remote_address: '0.0.0.0:*',
    state: 'LISTEN',
    pid: 1123,
    program: 'sshd',
  },
  {
    proto: 'tcp',
    local_address: '0.0.0.0:8006',
    remote_address: '0.0.0.0:*',
    state: 'LISTEN',
    pid: 2211,
    program: 'pveproxy',
  },
];
