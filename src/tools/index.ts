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
} from './node.js';
export { getClusterStatus, getNextVMID } from './cluster.js';

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
} from './cluster-management.js';

// VM Query & Lifecycle tools
export { getVMs, getVMStatus, getVMConfig, getLxcConfig, getStorage } from './vm-query.js';
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
