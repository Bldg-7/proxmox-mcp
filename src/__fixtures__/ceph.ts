export const sampleCephStatus = {
  health: { status: 'HEALTH_OK' },
  fsid: '5d4f8a0b-1b2c-4d5e-9f00-acde12345678',
  monmap: { mons: 3 },
  osdmap: { num_osds: 4 },
  pgmap: { num_pgs: 128 },
};

export const sampleCephOsds = [
  { id: 0, up: 1, in: 1, host: 'pve1' },
  { id: 1, up: 0, in: 1, host: 'pve2' },
];

export const sampleCephMons = [
  { name: 'mon1', rank: 0, addr: '10.0.0.11:6789', quorum: 1 },
  { name: 'mon2', rank: 1, addr: '10.0.0.12:6789', quorum: 1 },
];

export const sampleCephMds = [
  { name: 'mds-a', state: 'up:active', addr: '10.0.0.21:6800' },
  { name: 'mds-b', state: 'up:standby', addr: '10.0.0.22:6800' },
];

export const sampleCephPools = [
  { pool_name: 'rbd', size: 3, min_size: 2, pg_num: 128 },
  { pool_name: 'cephfs_data', size: 2, min_size: 1, pg_num: 64 },
];

export const sampleCephFilesystems = [
  {
    name: 'cephfs',
    metadata_pool: 'cephfs_metadata',
    data_pools: ['cephfs_data'],
  },
];
