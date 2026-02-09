export {
  handleNodeTool,
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
export { handleNodeDisk } from './node-disk.js';
export { handleClusterTool, getClusterStatus, getNextVMID } from './cluster.js';

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
  handleHaResourceTool,
  handleHaGroupTool,
  handleClusterFirewallRuleTool,
  handleClusterFirewallGroupTool,
  handleClusterFirewallTool,
  handleClusterFirewallAliasTool,
  handleClusterFirewallIpsetTool,
  handleClusterFirewallIpsetEntryTool,
  handleClusterBackupJobTool,
  handleClusterReplicationJobTool,
  handleClusterConfigTool,
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
  handleSdnVnetTool,
  handleSdnZoneTool,
  handleSdnControllerTool,
  handleSdnSubnetTool,
} from './sdn.js';

// Access Control tools
export {
  handleUserTool,
  handleGroupTool,
  handleRoleTool,
  handleAclTool,
  handleDomainTool,
  handleUserTokenTool,
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
  handleStorageConfigTool,
  handleStorageContentTool,
  handlePoolTool,
} from './storage-management.js';

// Ceph Integration tools
export {
  handleCephTool,
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
  handleCephOsdTool,
  handleCephMonTool,
  handleCephMdsTool,
  handleCephPoolTool,
  handleCephFsTool,
} from './ceph.js';

// Console Access tools (consolidated)
export {
  handleConsoleVnc,
  handleConsoleTerm,
  getSpiceProxy,
} from './console-access.js';

// Guest Query tools (consolidated VM/LXC)
export {
  handleGuestList,
  handleGuestStatus,
  handleGuestConfig,
  handleGuestPending,
  handleGuestFeature,
  handleGuestRrddata,
} from './guest-query.js';

// VM Query & Lifecycle tools
export { getVMs, getVMStatus, getVMConfig, getLxcConfig, getStorage, getVmPending, getLxcPending, checkVmFeature, checkLxcFeature } from './vm-query.js';

// Guest Lifecycle (consolidated VM/LXC)
export {
  handleGuestStart,
  handleGuestStop,
  handleGuestReboot,
  handleGuestShutdown,
  handleGuestDelete,
  handleGuestPause,
  handleGuestResume,
} from './guest-lifecycle.js';

// Guest Modify (consolidated VM/LXC)
export {
  handleGuestClone,
  handleGuestResize,
  handleGuestConfigUpdate,
  handleGuestMigrate,
  handleGuestTemplate,
} from './guest-modify.js';

export { cloneLxc, cloneVM, resizeLxc, resizeVM, updateVmConfig, updateLxcConfig } from './vm-modify.js';

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
  handleAgentInfo,
  handleAgentHw,
  handleAgentExec,
  handleAgentFile,
  handleAgentFreeze,
  handleAgentPower,
  handleAgentUser,
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
  handleGuestSnapshot,
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
  handleBackup,
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
  handleGuestDiskResize,
  handleGuestDiskMove,
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
  handleGuestNetwork,
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

// Cloud-Init tools (consolidated)
export { handleCloudInit } from './cloud-init.js';

// Certificate Management tools (consolidated)
export { handleCertificate, handleAcmeCert } from './certificate.js';

// ACME Management tools (consolidated)
export { handleAcmeAccount, handleAcmeInfo } from './acme.js';

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

// Notification Management tools (consolidated)
export { handleNotification } from './notifications.js';
