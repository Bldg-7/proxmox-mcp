export const sampleGetNodeTime = {
  node: 'pve1',
};

export const sampleUpdateNodeTime = {
  node: 'pve1',
  time: 1710000000,
  timezone: 'UTC',
};

export const sampleUpdateNodeDns = {
  node: 'pve1',
  search: 'example.com',
  dns1: '8.8.8.8',
  dns2: '1.1.1.1',
};

export const sampleGetNodeHosts = {
  node: 'pve1',
};

export const sampleUpdateNodeHosts = {
  node: 'pve1',
  ip: '192.168.1.10',
  name: 'pve1',
  comment: 'Management',
};

export const sampleGetNodeSubscription = {
  node: 'pve1',
};

export const sampleSetNodeSubscription = {
  node: 'pve1',
  key: 'AAAA-BBBB-CCCC',
};

export const sampleDeleteNodeSubscription = {
  node: 'pve1',
};

export const sampleAptUpdate = {
  node: 'pve1',
};

export const sampleAptUpgrade = {
  node: 'pve1',
};

export const sampleAptVersions = {
  node: 'pve1',
  package: 'pve-manager',
};

export const sampleStartAll = {
  node: 'pve1',
};

export const sampleStopAll = {
  node: 'pve1',
};

export const sampleMigrateAll = {
  node: 'pve1',
  target: 'pve2',
  maxworkers: 2,
  'with-local-disks': true,
};

export const sampleNodeShutdown = {
  node: 'pve1',
};

export const sampleNodeReboot = {
  node: 'pve1',
};

export const sampleNodeWakeonlan = {
  node: 'pve1',
};
