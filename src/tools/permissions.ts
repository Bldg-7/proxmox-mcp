import { TOOL_NAMES, type PermissionLevel, type ToolName } from '../types/tools.js';

export type Action = string;

export type ToolPermissions = Record<ToolName, Record<Action, PermissionLevel>>;

const defaultToolPermissions: ToolPermissions = Object.fromEntries(
  TOOL_NAMES.map((toolName) => [toolName, {}])
) as ToolPermissions;

export const toolPermissions: ToolPermissions = {
  ...defaultToolPermissions,
  proxmox_cluster: {
    status: 'basic',
    options: 'basic',
    update_options: 'elevated',
  },
  proxmox_ha_resource: {
    list: 'basic',
    get: 'basic',
    status: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_ha_group: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_rule: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_group: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall: {
    get_options: 'basic',
    list_macros: 'basic',
    list_refs: 'basic',
    update_options: 'elevated',
  },
  proxmox_cluster_firewall_alias: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_ipset: {
    list: 'basic',
    create: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_firewall_ipset_entry: {
    list: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_backup_job: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_replication_job: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_cluster_config: {
    get: 'basic',
    list_nodes: 'basic',
    get_node: 'basic',
    totem: 'basic',
    join: 'elevated',
  },
  proxmox_sdn_vnet: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_zone: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_controller: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
  proxmox_sdn_subnet: {
    list: 'basic',
    get: 'basic',
    create: 'elevated',
    update: 'elevated',
    delete: 'elevated',
  },
};
