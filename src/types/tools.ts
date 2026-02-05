export const TOOL_NAMES = [
  'proxmox_get_nodes',
  'proxmox_get_node_status',
  'proxmox_get_vms',
  'proxmox_get_vm_status',
  'proxmox_get_vm_config',
  'proxmox_get_lxc_config',
  'proxmox_execute_vm_command',
  'proxmox_get_storage',
  'proxmox_get_cluster_status',
  'proxmox_list_templates',
  'proxmox_create_lxc',
  'proxmox_create_vm',
  'proxmox_get_next_vmid',
  'proxmox_start_lxc',
  'proxmox_start_vm',
  'proxmox_stop_lxc',
  'proxmox_stop_vm',
  'proxmox_delete_lxc',
  'proxmox_delete_vm',
  'proxmox_reboot_lxc',
  'proxmox_reboot_vm',
  'proxmox_shutdown_lxc',
  'proxmox_shutdown_vm',
  'proxmox_pause_vm',
  'proxmox_resume_vm',
  'proxmox_clone_lxc',
  'proxmox_clone_vm',
  'proxmox_resize_lxc',
  'proxmox_resize_vm',
  'proxmox_create_snapshot_lxc',
  'proxmox_create_snapshot_vm',
  'proxmox_list_snapshots_lxc',
  'proxmox_list_snapshots_vm',
  'proxmox_rollback_snapshot_lxc',
  'proxmox_rollback_snapshot_vm',
  'proxmox_delete_snapshot_lxc',
  'proxmox_delete_snapshot_vm',
  'proxmox_create_backup_lxc',
  'proxmox_create_backup_vm',
  'proxmox_list_backups',
  'proxmox_restore_backup_lxc',
  'proxmox_restore_backup_vm',
  'proxmox_delete_backup',
  'proxmox_add_disk_vm',
  'proxmox_add_mountpoint_lxc',
  'proxmox_resize_disk_vm',
  'proxmox_resize_disk_lxc',
  'proxmox_remove_disk_vm',
  'proxmox_remove_mountpoint_lxc',
  'proxmox_move_disk_vm',
  'proxmox_move_disk_lxc',
  'proxmox_add_network_vm',
  'proxmox_add_network_lxc',
  'proxmox_update_network_vm',
  'proxmox_update_network_lxc',
   'proxmox_remove_network_vm',
   'proxmox_remove_network_lxc',
    'proxmox_get_node_disks',
    'proxmox_get_disk_smart',
    'proxmox_get_node_lvm',
    'proxmox_get_node_zfs',
    'proxmox_get_node_network',
    'proxmox_get_node_dns',
    'proxmox_get_network_iface',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export type PermissionLevel = 'basic' | 'elevated';

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export function createToolResponse(text: string, isError = false): ToolResponse {
  return {
    content: [{ type: 'text', text }],
    isError,
  };
}
