import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse, ToolName } from '../types/index.js';
import { TOOL_NAMES } from '../types/index.js';
import type { z } from 'zod';

// Import all tool handlers
import {
  handleGuestList,
  handleGuestStatus,
  handleGuestConfig,
  handleGuestPending,
  handleGuestFeature,
  handleGuestRrddata,
} from './guest-query.js';
import {
  guestListSchema,
  guestStatusSchema,
  guestConfigSchema,
  guestPendingSchema,
  guestFeatureSchema,
  guestRrddataSchema,
  guestStartSchema,
  guestStopSchema,
  guestRebootSchema,
  guestShutdownSchema,
  guestDeleteSchema,
  guestPauseSchema,
  guestResumeSchema,
} from '../schemas/guest.js';
import {
  handleNodeTool,
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
  createNetworkIface,
  updateNetworkIface,
  deleteNetworkIface,
  applyNetworkConfig,
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
  handleClusterTool,
  getNextVMID,
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
  handleSdnVnetTool,
  handleSdnZoneTool,
  handleSdnControllerTool,
  handleSdnSubnetTool,
  handleUserTool,
  handleGroupTool,
  handleRoleTool,
  handleAclTool,
  handleDomainTool,
  handleUserTokenTool,
  handlePoolTool,
  handleStorageConfigTool,
  handleStorageContentTool,
  listFileRestore,
  downloadFileRestore,
  handleCephTool,
  handleCephOsdTool,
  handleCephMonTool,
  handleCephMdsTool,
  handleCephPoolTool,
  handleCephFsTool,

  getStorage,
  handleGuestStart,
  handleGuestStop,
  handleGuestReboot,
  handleGuestShutdown,
  handleGuestDelete,
  handleGuestPause,
  handleGuestResume,
  cloneLxc,
  cloneVM,
  resizeLxc,
  resizeVM,
  updateVmConfig,
  updateLxcConfig,
  migrateVm,
  migrateLxc,
  createTemplateVm,
  createTemplateLxc,

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
  getVncProxy,
  getSpiceProxy,
  getTermProxy,
  getLxcVncProxy,
  getLxcTermProxy,
  createSnapshotLxc,
  createSnapshotVM,
  listSnapshotsLxc,
  listSnapshotsVM,
  rollbackSnapshotLxc,
  rollbackSnapshotVM,
  deleteSnapshotLxc,
  deleteSnapshotVM,
  createBackupLxc,
  createBackupVM,
  listBackups,
  restoreBackupLxc,
  restoreBackupVM,
  deleteBackup,
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
  addNetworkVm,
  addNetworkLxc,
  updateNetworkVm,
  updateNetworkLxc,
  removeNetworkVm,
  removeNetworkLxc,
  executeVMCommand,
  listTemplates,
  createLxc,
  createVM,
  getCloudInitConfig,
  dumpCloudInit,
  regenerateCloudInit,
  getNodeCertificates,
  uploadCustomCertificate,
  deleteCustomCertificate,
  orderAcmeCertificate,
  renewAcmeCertificate,
  revokeAcmeCertificate,
  getNodeAcmeConfig,
  listAcmeAccounts,
  getAcmeAccount,
  createAcmeAccount,
  updateAcmeAccount,
  deleteAcmeAccount,
  listAcmePlugins,
  getAcmePlugin,
  getAcmeDirectories,
  listNotificationTargets,
  getNotificationTarget,
  createNotificationTarget,
  deleteNotificationTarget,
  testNotificationTarget,
} from './index.js';

// Import all schemas
import {
  nodeToolSchema,
  clusterToolSchema,
  getNodeServicesSchema,
  controlNodeServiceSchema,
  getNodeSyslogSchema,
  getNodeJournalSchema,
  getNodeTasksSchema,
  getNodeTaskSchema,
  getNodeAplinfoSchema,
  getNodeNetstatSchema,
  getNodeRrddataSchema,
  getStorageRrddataSchema,
  getNodeReportSchema,
  getNextVmidSchema,
} from '../schemas/node.js';
import {
  createNetworkIfaceSchema,
  updateNetworkIfaceSchema,
  deleteNetworkIfaceSchema,
  applyNetworkConfigSchema,
} from '../schemas/node-network.js';
import {
  getNodeTimeSchema,
  updateNodeTimeSchema,
  updateNodeDnsSchema,
  getNodeHostsSchema,
  updateNodeHostsSchema,
  getNodeSubscriptionSchema,
  setNodeSubscriptionSchema,
  deleteNodeSubscriptionSchema,
  aptUpdateSchema,
  aptUpgradeSchema,
  aptVersionsSchema,
  startAllSchema,
  stopAllSchema,
  migrateAllSchema,
  nodeShutdownSchema,
  nodeRebootSchema,
  nodeWakeonlanSchema,
  getNodeReplicationStatusSchema,
  getNodeReplicationLogSchema,
  scheduleNodeReplicationSchema,
} from '../schemas/system-operations.js';
import {
  haResourceToolSchema,
  haGroupToolSchema,
  clusterFirewallRuleToolSchema,
  clusterFirewallGroupToolSchema,
  clusterFirewallToolSchema,
  clusterFirewallAliasToolSchema,
  clusterFirewallIpsetToolSchema,
  clusterFirewallIpsetEntryToolSchema,
  clusterBackupJobToolSchema,
  clusterReplicationJobToolSchema,
  clusterConfigToolSchema,
} from '../schemas/cluster-management.js';
import {
  sdnVnetToolSchema,
  sdnZoneToolSchema,
  sdnControllerToolSchema,
  sdnSubnetToolSchema,
} from '../schemas/sdn.js';
import {
  userToolSchema,
  groupToolSchema,
  roleToolSchema,
  aclToolSchema,
  domainToolSchema,
  userTokenToolSchema,
} from '../schemas/access-control.js';
import { poolToolSchema } from '../schemas/pool-management.js';
import {
  storageConfigToolSchema,
  storageContentToolSchema,
  listFileRestoreSchema,
  downloadFileRestoreSchema,
} from '../schemas/storage-management.js';
import {
  cephToolSchema,
  cephOsdToolSchema,
  cephMonToolSchema,
  cephMdsToolSchema,
  cephPoolToolSchema,
  cephFsToolSchema,
} from '../schemas/ceph.js';
import {
    getStorageSchema,
  cloneLxcSchema,
  cloneVmSchema,
  resizeLxcSchema,
  resizeVmSchema,
  updateVmConfigSchema,
  updateLxcConfigSchema,
  executeVmCommandSchema,
  listTemplatesSchema,
  createLxcSchema,
  createVmSchema,
} from '../schemas/vm.js';
import {
  migrateVmSchema,
  migrateLxcSchema,
  createTemplateVmSchema,
  createTemplateLxcSchema,

  agentPingSchema,
  agentGetOsinfoSchema,
  agentGetFsinfoSchema,
  agentGetMemoryBlocksSchema,
  agentGetNetworkInterfacesSchema,
  agentGetTimeSchema,
  agentGetTimezoneSchema,
  agentGetVcpusSchema,
   agentExecSchema,
   agentExecStatusSchema,
   agentFileReadSchema,
   agentFileWriteSchema,
   agentGetHostnameSchema,
   agentGetUsersSchema,
   agentSetUserPasswordSchema,
   agentShutdownSchema,
  agentFsfreezeStatusSchema,
  agentFsfreezeFreezeSchema,
  agentFsfreezeThawSchema,
  agentFstrimSchema,
  agentGetMemoryBlockInfoSchema,
  agentSuspendDiskSchema,
  agentSuspendRamSchema,
  agentSuspendHybridSchema,
   listVmFirewallRulesSchema,
  getVmFirewallRuleSchema,
  createVmFirewallRuleSchema,
  updateVmFirewallRuleSchema,
  deleteVmFirewallRuleSchema,
  listLxcFirewallRulesSchema,
  getLxcFirewallRuleSchema,
  createLxcFirewallRuleSchema,
  updateLxcFirewallRuleSchema,
  deleteLxcFirewallRuleSchema,
} from '../schemas/vm-advanced.js';
import {
  createSnapshotLxcSchema,
  createSnapshotVmSchema,
  listSnapshotsLxcSchema,
  listSnapshotsVmSchema,
  rollbackSnapshotLxcSchema,
  rollbackSnapshotVmSchema,
  deleteSnapshotLxcSchema,
  deleteSnapshotVmSchema,
} from '../schemas/snapshot.js';
import {
  createBackupLxcSchema,
  createBackupVmSchema,
  listBackupsSchema,
  restoreBackupLxcSchema,
  restoreBackupVmSchema,
  deleteBackupSchema,
} from '../schemas/backup.js';
import {
  addDiskVmSchema,
  addMountpointLxcSchema,
  resizeDiskVmSchema,
  resizeDiskLxcSchema,
  removeDiskVmSchema,
  removeMountpointLxcSchema,
  moveDiskVmSchema,
  moveDiskLxcSchema,
  getNodeDisksSchema,
  getDiskSmartSchema,
  getNodeLvmSchema,
  getNodeZfsSchema,
  initDiskGptSchema,
  wipeDiskSchema,
  getNodeLvmThinSchema,
  getNodeDirectorySchema,
} from '../schemas/disk.js';
import {
  addNetworkVmSchema,
  addNetworkLxcSchema,
  updateNetworkVmSchema,
  updateNetworkLxcSchema,
  removeNetworkVmSchema,
  removeNetworkLxcSchema,
} from '../schemas/network.js';
import {
  getVncProxySchema,
  getSpiceProxySchema,
  getTermProxySchema,
  getLxcVncProxySchema,
  getLxcTermProxySchema,
} from '../schemas/console-access.js';
import {
  getCloudInitConfigSchema,
  dumpCloudInitSchema,
  regenerateCloudInitSchema,
} from '../schemas/cloud-init.js';
import {
  getNodeCertificatesSchema,
  uploadCustomCertificateSchema,
  deleteCustomCertificateSchema,
  orderAcmeCertificateSchema,
  renewAcmeCertificateSchema,
  revokeAcmeCertificateSchema,
  getNodeAcmeConfigSchema,
} from '../schemas/certificate.js';
import {
  listAcmeAccountsSchema,
  getAcmeAccountSchema,
  createAcmeAccountSchema,
  updateAcmeAccountSchema,
  deleteAcmeAccountSchema,
  listAcmePluginsSchema,
  getAcmePluginSchema,
  getAcmeDirectoriesSchema,
} from '../schemas/acme.js';
import {
  listNotificationTargetsSchema,
  getNotificationTargetSchema,
  createNotificationTargetSchema,
  deleteNotificationTargetSchema,
  testNotificationTargetSchema,
} from '../schemas/notifications.js';

// Tool handler type - accepts any input type for flexibility
export type ToolHandler = (
  client: ProxmoxApiClient,
  config: Config,
  input: any
) => Promise<ToolResponse>;

// Registry entry type
export interface ToolRegistryEntry {
  handler: ToolHandler;
  schema: z.ZodSchema;
}

// Tool registry mapping tool names to handlers and schemas
export const toolRegistry: Record<ToolName, ToolRegistryEntry> = {
  // Node & Cluster (consolidated)
  proxmox_node: { handler: handleNodeTool, schema: nodeToolSchema },
  proxmox_cluster: { handler: handleClusterTool, schema: clusterToolSchema },
  proxmox_get_next_vmid: { handler: getNextVMID, schema: getNextVmidSchema },

  // Node Network Configuration
  proxmox_create_network_iface: {
    handler: createNetworkIface,
    schema: createNetworkIfaceSchema,
  },
  proxmox_update_network_iface: {
    handler: updateNetworkIface,
    schema: updateNetworkIfaceSchema,
  },
  proxmox_delete_network_iface: {
    handler: deleteNetworkIface,
    schema: deleteNetworkIfaceSchema,
  },
  proxmox_apply_network_config: {
    handler: applyNetworkConfig,
    schema: applyNetworkConfigSchema,
  },

  // System Operations
  proxmox_get_node_time: { handler: getNodeTime, schema: getNodeTimeSchema },
  proxmox_update_node_time: { handler: updateNodeTime, schema: updateNodeTimeSchema },
  proxmox_update_node_dns: { handler: updateNodeDns, schema: updateNodeDnsSchema },
  proxmox_get_node_hosts: { handler: getNodeHosts, schema: getNodeHostsSchema },
  proxmox_update_node_hosts: {
    handler: updateNodeHosts,
    schema: updateNodeHostsSchema,
  },
  proxmox_get_node_subscription: {
    handler: getNodeSubscription,
    schema: getNodeSubscriptionSchema,
  },
  proxmox_set_node_subscription: {
    handler: setNodeSubscription,
    schema: setNodeSubscriptionSchema,
  },
  proxmox_delete_node_subscription: {
    handler: deleteNodeSubscription,
    schema: deleteNodeSubscriptionSchema,
  },
  proxmox_apt_update: { handler: aptUpdate, schema: aptUpdateSchema },
  proxmox_apt_upgrade: { handler: aptUpgrade, schema: aptUpgradeSchema },
  proxmox_apt_versions: { handler: aptVersions, schema: aptVersionsSchema },
  proxmox_start_all: { handler: startAll, schema: startAllSchema },
  proxmox_stop_all: { handler: stopAll, schema: stopAllSchema },
  proxmox_migrate_all: { handler: migrateAll, schema: migrateAllSchema },
  proxmox_node_shutdown: { handler: nodeShutdown, schema: nodeShutdownSchema },
  proxmox_node_reboot: { handler: nodeReboot, schema: nodeRebootSchema },
  proxmox_node_wakeonlan: { handler: nodeWakeonlan, schema: nodeWakeonlanSchema },
  proxmox_get_node_replication_status: { handler: getNodeReplicationStatus, schema: getNodeReplicationStatusSchema },
  proxmox_get_node_replication_log: { handler: getNodeReplicationLog, schema: getNodeReplicationLogSchema },
  proxmox_schedule_node_replication: { handler: scheduleNodeReplication, schema: scheduleNodeReplicationSchema },

  // Cluster Management
  proxmox_ha_resource: { handler: handleHaResourceTool, schema: haResourceToolSchema },
  proxmox_ha_group: { handler: handleHaGroupTool, schema: haGroupToolSchema },
  proxmox_cluster_firewall_rule: {
    handler: handleClusterFirewallRuleTool,
    schema: clusterFirewallRuleToolSchema,
  },
  proxmox_cluster_firewall_group: {
    handler: handleClusterFirewallGroupTool,
    schema: clusterFirewallGroupToolSchema,
  },
  proxmox_cluster_firewall: {
    handler: handleClusterFirewallTool,
    schema: clusterFirewallToolSchema,
  },
  proxmox_cluster_firewall_alias: {
    handler: handleClusterFirewallAliasTool,
    schema: clusterFirewallAliasToolSchema,
  },
  proxmox_cluster_firewall_ipset: {
    handler: handleClusterFirewallIpsetTool,
    schema: clusterFirewallIpsetToolSchema,
  },
  proxmox_cluster_firewall_ipset_entry: {
    handler: handleClusterFirewallIpsetEntryTool,
    schema: clusterFirewallIpsetEntryToolSchema,
  },
  proxmox_cluster_backup_job: {
    handler: handleClusterBackupJobTool,
    schema: clusterBackupJobToolSchema,
  },
  proxmox_cluster_replication_job: {
    handler: handleClusterReplicationJobTool,
    schema: clusterReplicationJobToolSchema,
  },
  proxmox_cluster_config: {
    handler: handleClusterConfigTool,
    schema: clusterConfigToolSchema,
  },

  // SDN
  proxmox_sdn_vnet: { handler: handleSdnVnetTool, schema: sdnVnetToolSchema },
  proxmox_sdn_zone: { handler: handleSdnZoneTool, schema: sdnZoneToolSchema },
  proxmox_sdn_controller: { handler: handleSdnControllerTool, schema: sdnControllerToolSchema },
  proxmox_sdn_subnet: { handler: handleSdnSubnetTool, schema: sdnSubnetToolSchema },

  // Access Control (consolidated)
  proxmox_user: { handler: handleUserTool, schema: userToolSchema },
  proxmox_group: { handler: handleGroupTool, schema: groupToolSchema },
  proxmox_role: { handler: handleRoleTool, schema: roleToolSchema },
  proxmox_acl: { handler: handleAclTool, schema: aclToolSchema },
  proxmox_domain: { handler: handleDomainTool, schema: domainToolSchema },
  proxmox_user_token: { handler: handleUserTokenTool, schema: userTokenToolSchema },

  // Pool Management (consolidated)
  proxmox_pool: { handler: handlePoolTool, schema: poolToolSchema },

  // Storage Management (consolidated)
  proxmox_storage_config: { handler: handleStorageConfigTool, schema: storageConfigToolSchema },
  proxmox_storage_content: { handler: handleStorageContentTool, schema: storageContentToolSchema },
  proxmox_list_file_restore: { handler: listFileRestore, schema: listFileRestoreSchema },
  proxmox_download_file_restore: {
    handler: downloadFileRestore,
    schema: downloadFileRestoreSchema,
  },

  // Ceph Integration (consolidated)
  proxmox_ceph: { handler: handleCephTool, schema: cephToolSchema },
  proxmox_ceph_osd: { handler: handleCephOsdTool, schema: cephOsdToolSchema },
  proxmox_ceph_mon: { handler: handleCephMonTool, schema: cephMonToolSchema },
  proxmox_ceph_mds: { handler: handleCephMdsTool, schema: cephMdsToolSchema },
  proxmox_ceph_pool: { handler: handleCephPoolTool, schema: cephPoolToolSchema },
  proxmox_ceph_fs: { handler: handleCephFsTool, schema: cephFsToolSchema },

  // Console Access
  proxmox_get_vnc_proxy: { handler: getVncProxy, schema: getVncProxySchema },
  proxmox_get_spice_proxy: { handler: getSpiceProxy, schema: getSpiceProxySchema },
  proxmox_get_term_proxy: { handler: getTermProxy, schema: getTermProxySchema },
  proxmox_get_lxc_vnc_proxy: {
    handler: getLxcVncProxy,
    schema: getLxcVncProxySchema,
  },
  proxmox_get_lxc_term_proxy: {
    handler: getLxcTermProxy,
    schema: getLxcTermProxySchema,
  },

  // Node Management
  proxmox_get_node_services: { handler: getNodeServices, schema: getNodeServicesSchema },
  proxmox_control_node_service: {
    handler: controlNodeService,
    schema: controlNodeServiceSchema,
  },
  proxmox_get_node_syslog: { handler: getNodeSyslog, schema: getNodeSyslogSchema },
  proxmox_get_node_journal: { handler: getNodeJournal, schema: getNodeJournalSchema },
  proxmox_get_node_tasks: { handler: getNodeTasks, schema: getNodeTasksSchema },
  proxmox_get_node_task: { handler: getNodeTask, schema: getNodeTaskSchema },
  proxmox_get_node_aplinfo: { handler: getNodeAplinfo, schema: getNodeAplinfoSchema },
  proxmox_get_node_netstat: { handler: getNodeNetstat, schema: getNodeNetstatSchema },
  proxmox_get_node_rrddata: { handler: getNodeRrddata, schema: getNodeRrddataSchema },
  proxmox_get_storage_rrddata: { handler: getStorageRrddata, schema: getStorageRrddataSchema },
  proxmox_get_node_report: { handler: getNodeReport, schema: getNodeReportSchema },

  // Guest Query (consolidated VM/LXC)
  proxmox_guest_list: { handler: handleGuestList, schema: guestListSchema },
  proxmox_guest_status: { handler: handleGuestStatus, schema: guestStatusSchema },
  proxmox_guest_config: { handler: handleGuestConfig, schema: guestConfigSchema },
  proxmox_guest_pending: { handler: handleGuestPending, schema: guestPendingSchema },
  proxmox_guest_feature: { handler: handleGuestFeature, schema: guestFeatureSchema },
  proxmox_guest_rrddata: { handler: handleGuestRrddata, schema: guestRrddataSchema },
  proxmox_get_storage: { handler: getStorage, schema: getStorageSchema },

  // Guest Lifecycle (consolidated VM/LXC)
  proxmox_guest_start: { handler: handleGuestStart, schema: guestStartSchema },
  proxmox_guest_stop: { handler: handleGuestStop, schema: guestStopSchema },
  proxmox_guest_reboot: { handler: handleGuestReboot, schema: guestRebootSchema },
  proxmox_guest_shutdown: { handler: handleGuestShutdown, schema: guestShutdownSchema },
  proxmox_guest_delete: { handler: handleGuestDelete, schema: guestDeleteSchema },
  proxmox_guest_pause: { handler: handleGuestPause, schema: guestPauseSchema },
  proxmox_guest_resume: { handler: handleGuestResume, schema: guestResumeSchema },

  // VM Modify
  proxmox_clone_lxc: { handler: cloneLxc, schema: cloneLxcSchema },
  proxmox_clone_vm: { handler: cloneVM, schema: cloneVmSchema },
  proxmox_resize_lxc: { handler: resizeLxc, schema: resizeLxcSchema },
  proxmox_resize_vm: { handler: resizeVM, schema: resizeVmSchema },
  proxmox_update_vm_config: { handler: updateVmConfig, schema: updateVmConfigSchema },
  proxmox_update_lxc_config: { handler: updateLxcConfig, schema: updateLxcConfigSchema },

  // VM/LXC Advanced
  proxmox_migrate_vm: { handler: migrateVm, schema: migrateVmSchema },
  proxmox_migrate_lxc: { handler: migrateLxc, schema: migrateLxcSchema },
  proxmox_create_template_vm: { handler: createTemplateVm, schema: createTemplateVmSchema },
  proxmox_create_template_lxc: { handler: createTemplateLxc, schema: createTemplateLxcSchema },

  proxmox_agent_ping: { handler: agentPing, schema: agentPingSchema },
  proxmox_agent_get_osinfo: { handler: agentGetOsinfo, schema: agentGetOsinfoSchema },
  proxmox_agent_get_fsinfo: { handler: agentGetFsinfo, schema: agentGetFsinfoSchema },
  proxmox_agent_get_memory_blocks: {
    handler: agentGetMemoryBlocks,
    schema: agentGetMemoryBlocksSchema,
  },
  proxmox_agent_get_network_interfaces: {
    handler: agentGetNetworkInterfaces,
    schema: agentGetNetworkInterfacesSchema,
  },
  proxmox_agent_get_time: { handler: agentGetTime, schema: agentGetTimeSchema },
  proxmox_agent_get_timezone: { handler: agentGetTimezone, schema: agentGetTimezoneSchema },
  proxmox_agent_get_vcpus: { handler: agentGetVcpus, schema: agentGetVcpusSchema },
   proxmox_agent_exec: { handler: agentExec, schema: agentExecSchema },
   proxmox_agent_exec_status: { handler: agentExecStatus, schema: agentExecStatusSchema },
   proxmox_agent_file_read: { handler: agentFileRead, schema: agentFileReadSchema },
   proxmox_agent_file_write: { handler: agentFileWrite, schema: agentFileWriteSchema },
   proxmox_agent_get_hostname: { handler: agentGetHostname, schema: agentGetHostnameSchema },
   proxmox_agent_get_users: { handler: agentGetUsers, schema: agentGetUsersSchema },
   proxmox_agent_set_user_password: { handler: agentSetUserPassword, schema: agentSetUserPasswordSchema },
   proxmox_agent_shutdown: { handler: agentShutdown, schema: agentShutdownSchema },
   proxmox_agent_fsfreeze_status: { handler: agentFsfreezeStatus, schema: agentFsfreezeStatusSchema },
   proxmox_agent_fsfreeze_freeze: { handler: agentFsfreezeFreeze, schema: agentFsfreezeFreezeSchema },
   proxmox_agent_fsfreeze_thaw: { handler: agentFsfreezeThaw, schema: agentFsfreezeThawSchema },
   proxmox_agent_fstrim: { handler: agentFstrim, schema: agentFstrimSchema },
   proxmox_agent_get_memory_block_info: { handler: agentGetMemoryBlockInfo, schema: agentGetMemoryBlockInfoSchema },
   proxmox_agent_suspend_disk: { handler: agentSuspendDisk, schema: agentSuspendDiskSchema },
   proxmox_agent_suspend_ram: { handler: agentSuspendRam, schema: agentSuspendRamSchema },
   proxmox_agent_suspend_hybrid: { handler: agentSuspendHybrid, schema: agentSuspendHybridSchema },
   proxmox_list_vm_firewall_rules: {
    handler: listVmFirewallRules,
    schema: listVmFirewallRulesSchema,
  },
  proxmox_get_vm_firewall_rule: { handler: getVmFirewallRule, schema: getVmFirewallRuleSchema },
  proxmox_create_vm_firewall_rule: {
    handler: createVmFirewallRule,
    schema: createVmFirewallRuleSchema,
  },
  proxmox_update_vm_firewall_rule: {
    handler: updateVmFirewallRule,
    schema: updateVmFirewallRuleSchema,
  },
  proxmox_delete_vm_firewall_rule: {
    handler: deleteVmFirewallRule,
    schema: deleteVmFirewallRuleSchema,
  },
  proxmox_list_lxc_firewall_rules: {
    handler: listLxcFirewallRules,
    schema: listLxcFirewallRulesSchema,
  },
  proxmox_get_lxc_firewall_rule: {
    handler: getLxcFirewallRule,
    schema: getLxcFirewallRuleSchema,
  },
  proxmox_create_lxc_firewall_rule: {
    handler: createLxcFirewallRule,
    schema: createLxcFirewallRuleSchema,
  },
  proxmox_update_lxc_firewall_rule: {
    handler: updateLxcFirewallRule,
    schema: updateLxcFirewallRuleSchema,
  },
  proxmox_delete_lxc_firewall_rule: {
    handler: deleteLxcFirewallRule,
    schema: deleteLxcFirewallRuleSchema,
  },

  // Snapshots
  proxmox_create_snapshot_lxc: { handler: createSnapshotLxc, schema: createSnapshotLxcSchema },
  proxmox_create_snapshot_vm: { handler: createSnapshotVM, schema: createSnapshotVmSchema },
  proxmox_list_snapshots_lxc: { handler: listSnapshotsLxc, schema: listSnapshotsLxcSchema },
  proxmox_list_snapshots_vm: { handler: listSnapshotsVM, schema: listSnapshotsVmSchema },
  proxmox_rollback_snapshot_lxc: { handler: rollbackSnapshotLxc, schema: rollbackSnapshotLxcSchema },
  proxmox_rollback_snapshot_vm: { handler: rollbackSnapshotVM, schema: rollbackSnapshotVmSchema },
  proxmox_delete_snapshot_lxc: { handler: deleteSnapshotLxc, schema: deleteSnapshotLxcSchema },
  proxmox_delete_snapshot_vm: { handler: deleteSnapshotVM, schema: deleteSnapshotVmSchema },

  // Backups
  proxmox_create_backup_lxc: { handler: createBackupLxc, schema: createBackupLxcSchema },
  proxmox_create_backup_vm: { handler: createBackupVM, schema: createBackupVmSchema },
  proxmox_list_backups: { handler: listBackups, schema: listBackupsSchema },
  proxmox_restore_backup_lxc: { handler: restoreBackupLxc, schema: restoreBackupLxcSchema },
  proxmox_restore_backup_vm: { handler: restoreBackupVM, schema: restoreBackupVmSchema },
  proxmox_delete_backup: { handler: deleteBackup, schema: deleteBackupSchema },

   // Disks
   proxmox_add_disk_vm: { handler: addDiskVM, schema: addDiskVmSchema },
   proxmox_add_mountpoint_lxc: { handler: addMountpointLxc, schema: addMountpointLxcSchema },
   proxmox_resize_disk_vm: { handler: resizeDiskVM, schema: resizeDiskVmSchema },
   proxmox_resize_disk_lxc: { handler: resizeDiskLxc, schema: resizeDiskLxcSchema },
   proxmox_remove_disk_vm: { handler: removeDiskVM, schema: removeDiskVmSchema },
   proxmox_remove_mountpoint_lxc: { handler: removeMountpointLxc, schema: removeMountpointLxcSchema },
   proxmox_move_disk_vm: { handler: moveDiskVM, schema: moveDiskVmSchema },
   proxmox_move_disk_lxc: { handler: moveDiskLxc, schema: moveDiskLxcSchema },
   proxmox_get_node_disks: { handler: getNodeDisks, schema: getNodeDisksSchema },
   proxmox_get_disk_smart: { handler: getDiskSmart, schema: getDiskSmartSchema },
   proxmox_get_node_lvm: { handler: getNodeLvm, schema: getNodeLvmSchema },
   proxmox_get_node_zfs: { handler: getNodeZfs, schema: getNodeZfsSchema },
   proxmox_init_disk_gpt: { handler: initDiskGpt, schema: initDiskGptSchema },
   proxmox_wipe_disk: { handler: wipeDisk, schema: wipeDiskSchema },
   proxmox_get_node_lvmthin: { handler: getNodeLvmThin, schema: getNodeLvmThinSchema },
   proxmox_get_node_directory: { handler: getNodeDirectory, schema: getNodeDirectorySchema },

  // Network
  proxmox_add_network_vm: { handler: addNetworkVm, schema: addNetworkVmSchema },
  proxmox_add_network_lxc: { handler: addNetworkLxc, schema: addNetworkLxcSchema },
  proxmox_update_network_vm: { handler: updateNetworkVm, schema: updateNetworkVmSchema },
  proxmox_update_network_lxc: { handler: updateNetworkLxc, schema: updateNetworkLxcSchema },
  proxmox_remove_network_vm: { handler: removeNetworkVm, schema: removeNetworkVmSchema },
  proxmox_remove_network_lxc: { handler: removeNetworkLxc, schema: removeNetworkLxcSchema },

  // Command
  proxmox_execute_vm_command: { handler: executeVMCommand, schema: executeVmCommandSchema },

   // Creation
   proxmox_list_templates: { handler: listTemplates, schema: listTemplatesSchema },
   proxmox_create_lxc: { handler: createLxc, schema: createLxcSchema },
   proxmox_create_vm: { handler: createVM, schema: createVmSchema },

   // Cloud-Init
   proxmox_get_cloudinit_config: { handler: getCloudInitConfig, schema: getCloudInitConfigSchema },
   proxmox_dump_cloudinit: { handler: dumpCloudInit, schema: dumpCloudInitSchema },
   proxmox_regenerate_cloudinit: { handler: regenerateCloudInit, schema: regenerateCloudInitSchema },

   // Certificate Management
   proxmox_get_node_certificates: { handler: getNodeCertificates, schema: getNodeCertificatesSchema },
   proxmox_upload_custom_certificate: { handler: uploadCustomCertificate, schema: uploadCustomCertificateSchema },
   proxmox_delete_custom_certificate: { handler: deleteCustomCertificate, schema: deleteCustomCertificateSchema },
   proxmox_order_acme_certificate: { handler: orderAcmeCertificate, schema: orderAcmeCertificateSchema },
   proxmox_renew_acme_certificate: { handler: renewAcmeCertificate, schema: renewAcmeCertificateSchema },
   proxmox_revoke_acme_certificate: { handler: revokeAcmeCertificate, schema: revokeAcmeCertificateSchema },
   proxmox_get_node_acme_config: { handler: getNodeAcmeConfig, schema: getNodeAcmeConfigSchema },

   // ACME Management
   proxmox_list_acme_accounts: { handler: listAcmeAccounts, schema: listAcmeAccountsSchema },
   proxmox_get_acme_account: { handler: getAcmeAccount, schema: getAcmeAccountSchema },
   proxmox_create_acme_account: { handler: createAcmeAccount, schema: createAcmeAccountSchema },
   proxmox_update_acme_account: { handler: updateAcmeAccount, schema: updateAcmeAccountSchema },
   proxmox_delete_acme_account: { handler: deleteAcmeAccount, schema: deleteAcmeAccountSchema },
   proxmox_list_acme_plugins: { handler: listAcmePlugins, schema: listAcmePluginsSchema },
   proxmox_get_acme_plugin: { handler: getAcmePlugin, schema: getAcmePluginSchema },
   proxmox_get_acme_directories: { handler: getAcmeDirectories, schema: getAcmeDirectoriesSchema },

   // Notification Management
   proxmox_list_notification_targets: { handler: listNotificationTargets, schema: listNotificationTargetsSchema },
   proxmox_get_notification_target: { handler: getNotificationTarget, schema: getNotificationTargetSchema },
   proxmox_create_notification_target: { handler: createNotificationTarget, schema: createNotificationTargetSchema },
   proxmox_delete_notification_target: { handler: deleteNotificationTarget, schema: deleteNotificationTargetSchema },
   proxmox_test_notification_target: { handler: testNotificationTarget, schema: testNotificationTargetSchema },
};

// Helper to get tool handler
export function getToolHandler(toolName: ToolName): ToolRegistryEntry | undefined {
  return toolRegistry[toolName];
}

// Validate all tools are registered
const registeredCount = Object.keys(toolRegistry).length;
const expectedCount = TOOL_NAMES.length;
if (registeredCount !== expectedCount) {
   throw new Error(
     `Tool registry incomplete: expected ${expectedCount} tools, got ${registeredCount}`
   );
}
