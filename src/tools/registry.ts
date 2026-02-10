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
  guestCloneSchema,
  guestResizeSchema,
  guestConfigUpdateSchema,
  guestMigrateSchema,
  guestTemplateSchema,
} from '../schemas/guest.js';
import {
  handleNodeTool,
  handleNodeService,
  handleNodeLog,
  handleNodeTask,
  handleNodeInfo,
  handleNodeConfig,
  handleNodeSubscription,
  handleApt,
  handleNodeBulk,
  handleNodePower,
  handleNodeReplication,
  handleClusterTool,
  getNextVMID,
  handleNodeNetworkIface,
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
  handleFileRestore,
  handleCephTool,
  handleCephOsdTool,
  handleCephMonTool,
  handleCephMdsTool,
  handleCephPoolTool,
  handleCephFsTool,

  handleGuestStart,
  handleGuestStop,
  handleGuestReboot,
  handleGuestShutdown,
  handleGuestDelete,
  handleGuestPause,
  handleGuestResume,
  handleGuestClone,
  handleGuestResize,
  handleGuestConfigUpdate,
  handleGuestMigrate,
  handleGuestTemplate,

  handleAgentInfo,
  handleAgentHw,
  handleAgentExec,
  handleAgentFile,
  handleAgentFreeze,
  handleAgentPower,
  handleAgentUser,
  handleGuestFirewallRule,
  handleConsoleVnc,
  handleConsoleTerm,
  getSpiceProxy,
  handleGuestSnapshot,
  handleBackup,
  handleVmDisk,
  handleLxcMountpoint,
  handleGuestDiskResize,
  handleGuestDiskMove,
  handleNodeDisk,
  handleNodeDiskAdmin,
  handleGuestNetwork,
  createLxc,
  createVM,
  handleCloudInit,
  handleCertificate,
  handleAcmeCert,
  handleAcmeAccount,
  handleAcmeInfo,
  handleNotification,
} from './index.js';

// Import all schemas
import {
  nodeToolSchema,
  clusterToolSchema,
  nodeServiceToolSchema,
  nodeLogToolSchema,
  nodeTaskToolSchema,
  nodeInfoToolSchema,
  nodeDiskSchema,
  getNextVmidSchema,
} from '../schemas/node.js';
import {
  nodeNetworkIfaceToolSchema,
} from '../schemas/node-network.js';
import {
  nodeConfigToolSchema,
  nodeSubscriptionToolSchema,
  aptToolSchema,
  nodeBulkToolSchema,
  nodePowerToolSchema,
  nodeReplicationToolSchema,
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
  fileRestoreSchema,
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
  createLxcSchema,
  createVmSchema,
} from '../schemas/vm.js';
import {
  agentInfoSchema,
  agentHwSchema,
  agentExecToolSchema,
  agentFileSchema,
  agentFreezeSchema,
  agentPowerSchema,
  agentUserSchema,
} from '../schemas/vm-advanced.js';
import { guestFirewallRuleSchema } from '../schemas/guest.js';
import {
  guestSnapshotSchema,
} from '../schemas/snapshot.js';
import {
  backupSchema,
} from '../schemas/backup.js';
import {
  vmDiskSchema,
  lxcMountpointSchema,
  guestDiskResizeSchema,
  guestDiskMoveSchema,
  nodeDiskAdminSchema,
} from '../schemas/disk.js';
import {
  guestNetworkSchema,
} from '../schemas/network.js';
import {
  consoleVncSchema,
  consoleTermSchema,
  getSpiceProxySchema,
} from '../schemas/console-access.js';
import { cloudInitSchema } from '../schemas/cloud-init.js';
import { certificateSchema, acmeCertSchema } from '../schemas/certificate.js';
import { acmeAccountSchema, acmeInfoSchema } from '../schemas/acme.js';
import { notificationSchema } from '../schemas/notifications.js';

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

  // Node Management (consolidated)
  proxmox_node_service: { handler: handleNodeService, schema: nodeServiceToolSchema },
  proxmox_node_log: { handler: handleNodeLog, schema: nodeLogToolSchema },
  proxmox_node_task: { handler: handleNodeTask, schema: nodeTaskToolSchema },
  proxmox_node_info: { handler: handleNodeInfo, schema: nodeInfoToolSchema },
  proxmox_node_config: { handler: handleNodeConfig, schema: nodeConfigToolSchema },
  proxmox_node_subscription: { handler: handleNodeSubscription, schema: nodeSubscriptionToolSchema },
  proxmox_apt: { handler: handleApt, schema: aptToolSchema },
  proxmox_node_bulk: { handler: handleNodeBulk, schema: nodeBulkToolSchema },
  proxmox_node_power: { handler: handleNodePower, schema: nodePowerToolSchema },
  proxmox_node_replication: { handler: handleNodeReplication, schema: nodeReplicationToolSchema },
  proxmox_node_network_iface: { handler: handleNodeNetworkIface, schema: nodeNetworkIfaceToolSchema },

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
  proxmox_file_restore: { handler: handleFileRestore, schema: fileRestoreSchema },

  // Ceph Integration (consolidated)
  proxmox_ceph: { handler: handleCephTool, schema: cephToolSchema },
  proxmox_ceph_osd: { handler: handleCephOsdTool, schema: cephOsdToolSchema },
  proxmox_ceph_mon: { handler: handleCephMonTool, schema: cephMonToolSchema },
  proxmox_ceph_mds: { handler: handleCephMdsTool, schema: cephMdsToolSchema },
  proxmox_ceph_pool: { handler: handleCephPoolTool, schema: cephPoolToolSchema },
  proxmox_ceph_fs: { handler: handleCephFsTool, schema: cephFsToolSchema },

  // Console Access (consolidated)
  proxmox_console_vnc: { handler: handleConsoleVnc, schema: consoleVncSchema },
  proxmox_console_term: { handler: handleConsoleTerm, schema: consoleTermSchema },
  proxmox_get_spice_proxy: { handler: getSpiceProxy, schema: getSpiceProxySchema },

  // Guest Query (consolidated VM/LXC)
  proxmox_guest_list: { handler: handleGuestList, schema: guestListSchema },
  proxmox_guest_status: { handler: handleGuestStatus, schema: guestStatusSchema },
  proxmox_guest_config: { handler: handleGuestConfig, schema: guestConfigSchema },
  proxmox_guest_pending: { handler: handleGuestPending, schema: guestPendingSchema },
  proxmox_guest_feature: { handler: handleGuestFeature, schema: guestFeatureSchema },
  proxmox_guest_rrddata: { handler: handleGuestRrddata, schema: guestRrddataSchema },

  // Guest Lifecycle (consolidated VM/LXC)
  proxmox_guest_start: { handler: handleGuestStart, schema: guestStartSchema },
  proxmox_guest_stop: { handler: handleGuestStop, schema: guestStopSchema },
  proxmox_guest_reboot: { handler: handleGuestReboot, schema: guestRebootSchema },
  proxmox_guest_shutdown: { handler: handleGuestShutdown, schema: guestShutdownSchema },
  proxmox_guest_delete: { handler: handleGuestDelete, schema: guestDeleteSchema },
  proxmox_guest_pause: { handler: handleGuestPause, schema: guestPauseSchema },
  proxmox_guest_resume: { handler: handleGuestResume, schema: guestResumeSchema },

  // Guest Modify (consolidated VM/LXC)
  proxmox_guest_clone: { handler: handleGuestClone, schema: guestCloneSchema },
  proxmox_guest_resize: { handler: handleGuestResize, schema: guestResizeSchema },
  proxmox_guest_config_update: {
    handler: handleGuestConfigUpdate,
    schema: guestConfigUpdateSchema,
  },
  proxmox_guest_migrate: { handler: handleGuestMigrate, schema: guestMigrateSchema },
  proxmox_guest_template: { handler: handleGuestTemplate, schema: guestTemplateSchema },

  // VM/LXC Advanced

  proxmox_agent_info: { handler: handleAgentInfo, schema: agentInfoSchema },
  proxmox_agent_hw: { handler: handleAgentHw, schema: agentHwSchema },
  proxmox_agent_exec: { handler: handleAgentExec, schema: agentExecToolSchema },
  proxmox_agent_file: { handler: handleAgentFile, schema: agentFileSchema },
  proxmox_agent_freeze: { handler: handleAgentFreeze, schema: agentFreezeSchema },
  proxmox_agent_power: { handler: handleAgentPower, schema: agentPowerSchema },
  proxmox_agent_user: { handler: handleAgentUser, schema: agentUserSchema },
  proxmox_guest_firewall_rule: {
    handler: handleGuestFirewallRule,
    schema: guestFirewallRuleSchema,
  },

  // Snapshots
  proxmox_guest_snapshot: { handler: handleGuestSnapshot, schema: guestSnapshotSchema },

  // Backups
  proxmox_backup: { handler: handleBackup, schema: backupSchema },

   // Disks
   proxmox_vm_disk: { handler: handleVmDisk, schema: vmDiskSchema },
   proxmox_lxc_mountpoint: { handler: handleLxcMountpoint, schema: lxcMountpointSchema },
   proxmox_guest_disk_resize: { handler: handleGuestDiskResize, schema: guestDiskResizeSchema },

   proxmox_guest_disk_move: { handler: handleGuestDiskMove, schema: guestDiskMoveSchema },
   proxmox_node_disk: { handler: handleNodeDisk, schema: nodeDiskSchema },
   proxmox_node_disk_admin: { handler: handleNodeDiskAdmin, schema: nodeDiskAdminSchema },

  // Network
  proxmox_guest_network: { handler: handleGuestNetwork, schema: guestNetworkSchema },

   // Creation
   proxmox_create_lxc: { handler: createLxc, schema: createLxcSchema },
   proxmox_create_vm: { handler: createVM, schema: createVmSchema },

   // Cloud-Init (consolidated)
   proxmox_cloudinit: { handler: handleCloudInit, schema: cloudInitSchema },

   // Certificate Management (consolidated)
   proxmox_certificate: { handler: handleCertificate, schema: certificateSchema },
   proxmox_acme_cert: { handler: handleAcmeCert, schema: acmeCertSchema },

   // ACME Management (consolidated)
   proxmox_acme_account: { handler: handleAcmeAccount, schema: acmeAccountSchema },
   proxmox_acme_info: { handler: handleAcmeInfo, schema: acmeInfoSchema },

   // Notification Management (consolidated)
   proxmox_notification: { handler: handleNotification, schema: notificationSchema },
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
