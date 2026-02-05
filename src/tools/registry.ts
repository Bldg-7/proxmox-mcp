import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse, ToolName } from '../types/index.js';
import type { z } from 'zod';

// Import all tool handlers
import {
  getNodes,
  getNodeStatus,
  getClusterStatus,
  getNextVMID,
  getVMs,
  getVMStatus,
  getVMConfig,
  getLxcConfig,
  getStorage,
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
  cloneLxc,
  cloneVM,
  resizeLxc,
  resizeVM,
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
} from './index.js';

// Import all schemas
import {
  getNodesSchema,
  getNodeStatusSchema,
  getClusterStatusSchema,
  getNextVmidSchema,
} from '../schemas/node.js';
import {
  getVmsSchema,
  getVmStatusSchema,
  getVmConfigSchema,
  getLxcConfigSchema,
  getStorageSchema,
  startLxcSchema,
  startVmSchema,
  stopLxcSchema,
  stopVmSchema,
  deleteLxcSchema,
  deleteVmSchema,
  rebootLxcSchema,
  rebootVmSchema,
  shutdownLxcSchema,
  shutdownVmSchema,
  pauseVmSchema,
  resumeVmSchema,
  cloneLxcSchema,
  cloneVmSchema,
  resizeLxcSchema,
  resizeVmSchema,
  executeVmCommandSchema,
  listTemplatesSchema,
  createLxcSchema,
  createVmSchema,
} from '../schemas/vm.js';
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
} from '../schemas/disk.js';
import {
  addNetworkVmSchema,
  addNetworkLxcSchema,
  updateNetworkVmSchema,
  updateNetworkLxcSchema,
  removeNetworkVmSchema,
  removeNetworkLxcSchema,
} from '../schemas/network.js';

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
  // Node & Cluster
  proxmox_get_nodes: { handler: getNodes, schema: getNodesSchema },
  proxmox_get_node_status: { handler: getNodeStatus, schema: getNodeStatusSchema },
  proxmox_get_cluster_status: { handler: getClusterStatus, schema: getClusterStatusSchema },
  proxmox_get_next_vmid: { handler: getNextVMID, schema: getNextVmidSchema },

  // VM Query
  proxmox_get_vms: { handler: getVMs, schema: getVmsSchema },
  proxmox_get_vm_status: { handler: getVMStatus, schema: getVmStatusSchema },
  proxmox_get_vm_config: { handler: getVMConfig, schema: getVmConfigSchema },
  proxmox_get_lxc_config: { handler: getLxcConfig, schema: getLxcConfigSchema },
  proxmox_get_storage: { handler: getStorage, schema: getStorageSchema },

  // VM Lifecycle
  proxmox_start_lxc: { handler: startLxc, schema: startLxcSchema },
  proxmox_start_vm: { handler: startVM, schema: startVmSchema },
  proxmox_stop_lxc: { handler: stopLxc, schema: stopLxcSchema },
  proxmox_stop_vm: { handler: stopVM, schema: stopVmSchema },
  proxmox_delete_lxc: { handler: deleteLxc, schema: deleteLxcSchema },
  proxmox_delete_vm: { handler: deleteVM, schema: deleteVmSchema },
  proxmox_reboot_lxc: { handler: rebootLxc, schema: rebootLxcSchema },
  proxmox_reboot_vm: { handler: rebootVM, schema: rebootVmSchema },
  proxmox_shutdown_lxc: { handler: shutdownLxc, schema: shutdownLxcSchema },
  proxmox_shutdown_vm: { handler: shutdownVM, schema: shutdownVmSchema },
  proxmox_pause_vm: { handler: pauseVM, schema: pauseVmSchema },
  proxmox_resume_vm: { handler: resumeVM, schema: resumeVmSchema },

  // VM Modify
  proxmox_clone_lxc: { handler: cloneLxc, schema: cloneLxcSchema },
  proxmox_clone_vm: { handler: cloneVM, schema: cloneVmSchema },
  proxmox_resize_lxc: { handler: resizeLxc, schema: resizeLxcSchema },
  proxmox_resize_vm: { handler: resizeVM, schema: resizeVmSchema },

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
};

// Helper to get tool handler
export function getToolHandler(toolName: ToolName): ToolRegistryEntry | undefined {
  return toolRegistry[toolName];
}

// Validate all 61 tools are registered
const registeredCount = Object.keys(toolRegistry).length;
if (registeredCount !== 61) {
  throw new Error(
    `Tool registry incomplete: expected 61 tools, got ${registeredCount}`
  );
}
