// Node & Cluster tools
export {
  getNodes,
  getNodeStatus,
  getNodeNetwork,
  getNodeDns,
  getNetworkIface,
  getNodeServices,
  controlNodeService,
  getNodeSyslog,
  getNodeJournal,
  getNodeTasks,
  getNodeTask,
  getNodeAplinfo,
  getNodeNetstat,
  getNodeRrddata,
  getStorageRrddata,
  getNodeReport,
} from './node.js';
export { getClusterStatus, getNextVMID } from './cluster.js';

// Node Network Configuration tools
export {
  createNetworkIface,
  updateNetworkIface,
  deleteNetworkIface,
  applyNetworkConfig,
} from './node-network.js';

// System Operations tools
export {
  getNodeTime,
  updateNodeTime,
  updateNodeDns,
  getNodeHosts,
  updateNodeHosts,
  getNodeSubscription,
  setNodeSubscription,
  deleteNodeSubscription,
  aptUpdate,
  aptUpgrade,
  aptVersions,
  startAll,
  stopAll,
  migrateAll,
  nodeShutdown,
  nodeReboot,
  nodeWakeonlan,
  getNodeReplicationStatus,
  getNodeReplicationLog,
  scheduleNodeReplication,
} from './system-operations.js';

// Cluster Management tools
export {
  getHaResources,
  getHaResource,
  createHaResource,
  updateHaResource,
  deleteHaResource,
  getHaGroups,
  getHaGroup,
  createHaGroup,
  updateHaGroup,
  deleteHaGroup,
  getHaStatus,
  listClusterFirewallRules,
  getClusterFirewallRule,
  createClusterFirewallRule,
  updateClusterFirewallRule,
  deleteClusterFirewallRule,
  listClusterFirewallGroups,
  getClusterFirewallGroup,
  createClusterFirewallGroup,
  updateClusterFirewallGroup,
  deleteClusterFirewallGroup,
  listClusterBackupJobs,
  getClusterBackupJob,
  createClusterBackupJob,
  updateClusterBackupJob,
  deleteClusterBackupJob,
  listClusterReplicationJobs,
  getClusterReplicationJob,
  createClusterReplicationJob,
  updateClusterReplicationJob,
  deleteClusterReplicationJob,
  getClusterOptions,
  updateClusterOptions,
  getClusterFirewallOptions,
   updateClusterFirewallOptions,
   listClusterFirewallMacros,
   listClusterFirewallRefs,
   listClusterFirewallAliases,
   getClusterFirewallAlias,
   createClusterFirewallAlias,
   updateClusterFirewallAlias,
   deleteClusterFirewallAlias,
   listClusterFirewallIpsets,
   createClusterFirewallIpset,
   deleteClusterFirewallIpset,
    listClusterFirewallIpsetEntries,
    addClusterFirewallIpsetEntry,
    updateClusterFirewallIpsetEntry,
    deleteClusterFirewallIpsetEntry,
    getClusterConfig,
    listClusterConfigNodes,
    getClusterConfigNode,
    joinCluster,
    getClusterTotem,
  } from './cluster-management.js';

// SDN tools
export {
  listSdnVnets,
  getSdnVnet,
  createSdnVnet,
  updateSdnVnet,
  deleteSdnVnet,
  listSdnZones,
  getSdnZone,
  createSdnZone,
  updateSdnZone,
  deleteSdnZone,
  listSdnControllers,
  getSdnController,
  createSdnController,
  updateSdnController,
  deleteSdnController,
  listSdnSubnets,
  getSdnSubnet,
  createSdnSubnet,
  updateSdnSubnet,
  deleteSdnSubnet,
} from './sdn.js';

// Access Control tools
export {
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
  listUserTokens,
  getUserToken,
  createUserToken,
  updateUserToken,
  deleteUserToken,
} from './access-control.js';

// Pool Management tools
export {
  listPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
} from './pool-management.js';

// Storage Management tools
export {
  listStorageConfig,
  getStorageConfig,
  createStorage,
  updateStorage,
  deleteStorage,
  uploadToStorage,
  downloadUrlToStorage,
  listStorageContent,
  deleteStorageContent,
  listFileRestore,
  downloadFileRestore,
  pruneBackups,
} from './storage-management.js';

// Ceph Integration tools
export {
  getCephStatus,
  listCephOsds,
  createCephOsd,
  deleteCephOsd,
  listCephMons,
  createCephMon,
  deleteCephMon,
  listCephMds,
  createCephMds,
  deleteCephMds,
  listCephPools,
  createCephPool,
  updateCephPool,
  deleteCephPool,
  listCephFs,
  createCephFs,
} from './ceph.js';

// Console Access tools
export {
  getVncProxy,
  getSpiceProxy,
  getTermProxy,
  getLxcVncProxy,
  getLxcTermProxy,
} from './console-access.js';

// VM Query & Lifecycle tools
export { getVMs, getVMStatus, getVMConfig, getLxcConfig, getStorage, getVmPending, getLxcPending, checkVmFeature, checkLxcFeature } from './vm-query.js';
export {
  startLxc,
  startVM,
  stopLxc,
  stopVM,
  deleteLxc,
  deleteVM,
  rebootLxc,
  rebootVM,
  shutdownLxc,
  shutdownVM,
  pauseVM,
  resumeVM,
} from './vm-lifecycle.js';
export { cloneLxc, cloneVM, resizeLxc, resizeVM } from './vm-modify.js';

// VM/LXC Advanced tools
export {
  migrateVm,
  migrateLxc,
  createTemplateVm,
  createTemplateLxc,
  getVmRrddata,
  getLxcRrddata,
  agentPing,
  agentGetOsinfo,
  agentGetFsinfo,
  agentGetMemoryBlocks,
  agentGetNetworkInterfaces,
  agentGetTime,
  agentGetTimezone,
  agentGetVcpus,
  agentExec,
  agentExecStatus,
  listVmFirewallRules,
  getVmFirewallRule,
  createVmFirewallRule,
  updateVmFirewallRule,
  deleteVmFirewallRule,
  listLxcFirewallRules,
  getLxcFirewallRule,
  createLxcFirewallRule,
  updateLxcFirewallRule,
  deleteLxcFirewallRule,
} from './vm-advanced.js';

// Snapshot tools
export {
  createSnapshotLxc,
  createSnapshotVM,
  listSnapshotsLxc,
  listSnapshotsVM,
  rollbackSnapshotLxc,
  rollbackSnapshotVM,
  deleteSnapshotLxc,
  deleteSnapshotVM,
} from './snapshot.js';

// Backup tools
export {
  createBackupLxc,
  createBackupVM,
  listBackups,
  restoreBackupLxc,
  restoreBackupVM,
  deleteBackup,
} from './backup.js';

// Disk tools
export {
  addDiskVM,
  addMountpointLxc,
  resizeDiskVM,
  resizeDiskLxc,
  removeDiskVM,
  removeMountpointLxc,
  moveDiskVM,
  moveDiskLxc,
  getNodeDisks,
  getDiskSmart,
  getNodeLvm,
  getNodeZfs,
  initDiskGpt,
  wipeDisk,
  getNodeLvmThin,
  getNodeDirectory,
} from './disk.js';

// Network tools
export {
  addNetworkVm,
  addNetworkLxc,
  updateNetworkVm,
  updateNetworkLxc,
  removeNetworkVm,
  removeNetworkLxc,
} from './network.js';

// Command tool
export { executeVMCommand } from './command.js';

// Creation tools
export { listTemplates, createLxc, createVM } from './vm-create.js';

// Cloud-Init tools
export {
  getCloudInitConfig,
  dumpCloudInit,
  regenerateCloudInit,
} from './cloud-init.js';

// QEMU Agent tools (file operations, user management, power control)
export {
  agentFileRead,
  agentFileWrite,
  agentGetHostname,
  agentGetUsers,
  agentSetUserPassword,
  agentShutdown,
  agentFsfreezeStatus,
  agentFsfreezeFreeze,
  agentFsfreezeThaw,
  agentFstrim,
  agentGetMemoryBlockInfo,
  agentSuspendDisk,
  agentSuspendRam,
  agentSuspendHybrid,
} from './vm-advanced.js';
