import { z } from 'zod';

const baseVmSchema = z.object({
  node: z.string().min(1).describe('Node name where VM is located'),
  vmid: z.coerce.number().describe('VM ID number'),
});

// proxmox_migrate_vm - Migrate a QEMU VM to another node
export const migrateVmSchema = z.object({
  node: z.string().min(1).describe('Source node name'),
  vmid: z.coerce.number().describe('VM ID to migrate'),
  target: z.string().min(1).describe('Target node name'),
  online: z.boolean().optional().describe('Live migrate running VM'),
  force: z.boolean().optional().describe('Force migration'),
  bwlimit: z.number().int().min(0).optional().describe('Migration bandwidth limit (MB/s)'),
  ['with-local-disks']: z.boolean().optional().describe('Migrate local disks'),
  ['with-local-storage']: z.boolean().optional().describe('Migrate local storage'),
});

export type MigrateVmInput = z.input<typeof migrateVmSchema>;

// proxmox_migrate_lxc - Migrate an LXC container to another node
export const migrateLxcSchema = z.object({
  node: z.string().min(1).describe('Source node name'),
  vmid: z.coerce.number().describe('Container ID to migrate'),
  target: z.string().min(1).describe('Target node name'),
  online: z.boolean().optional().describe('Live migrate running container'),
  force: z.boolean().optional().describe('Force migration'),
  bwlimit: z.number().int().min(0).optional().describe('Migration bandwidth limit (MB/s)'),
  ['with-local-disks']: z.boolean().optional().describe('Migrate local disks'),
  ['with-local-storage']: z.boolean().optional().describe('Migrate local storage'),
});

export type MigrateLxcInput = z.input<typeof migrateLxcSchema>;

// proxmox_create_template_vm - Convert QEMU VM to template
export const createTemplateVmSchema = baseVmSchema;

export type CreateTemplateVmInput = z.input<typeof createTemplateVmSchema>;

// proxmox_create_template_lxc - Convert LXC container to template
export const createTemplateLxcSchema = baseVmSchema;

export type CreateTemplateLxcInput = z.input<typeof createTemplateLxcSchema>;

// proxmox_get_vm_rrddata - Get VM performance metrics
export const getVmRrddataSchema = baseVmSchema.extend({
  timeframe: z.string().optional().describe('Timeframe (e.g., hour, day, week, month, year)'),
  cf: z.string().optional().describe('Consolidation function (e.g., AVERAGE, MAX)')
});

export type GetVmRrddataInput = z.input<typeof getVmRrddataSchema>;

// proxmox_get_lxc_rrddata - Get LXC performance metrics
export const getLxcRrddataSchema = baseVmSchema.extend({
  timeframe: z.string().optional().describe('Timeframe (e.g., hour, day, week, month, year)'),
  cf: z.string().optional().describe('Consolidation function (e.g., AVERAGE, MAX)')
});

export type GetLxcRrddataInput = z.input<typeof getLxcRrddataSchema>;

// proxmox_agent_ping - Ping QEMU guest agent
export const agentPingSchema = baseVmSchema;

export type AgentPingInput = z.input<typeof agentPingSchema>;

// proxmox_agent_get_osinfo - Get OS info via QEMU guest agent
export const agentGetOsinfoSchema = baseVmSchema;

export type AgentGetOsinfoInput = z.input<typeof agentGetOsinfoSchema>;

// proxmox_agent_get_fsinfo - Get filesystem info via QEMU guest agent
export const agentGetFsinfoSchema = baseVmSchema;

export type AgentGetFsinfoInput = z.input<typeof agentGetFsinfoSchema>;

// proxmox_agent_get_memory_blocks - Get memory block info via QEMU guest agent
export const agentGetMemoryBlocksSchema = baseVmSchema;

export type AgentGetMemoryBlocksInput = z.input<typeof agentGetMemoryBlocksSchema>;

// proxmox_agent_get_network_interfaces - Get network interfaces via QEMU guest agent
export const agentGetNetworkInterfacesSchema = baseVmSchema;

export type AgentGetNetworkInterfacesInput = z.input<typeof agentGetNetworkInterfacesSchema>;

// proxmox_agent_get_time - Get guest time via QEMU guest agent
export const agentGetTimeSchema = baseVmSchema;

export type AgentGetTimeInput = z.input<typeof agentGetTimeSchema>;

// proxmox_agent_get_timezone - Get guest timezone via QEMU guest agent
export const agentGetTimezoneSchema = baseVmSchema;

export type AgentGetTimezoneInput = z.input<typeof agentGetTimezoneSchema>;

// proxmox_agent_get_vcpus - Get guest vCPU info via QEMU guest agent
export const agentGetVcpusSchema = baseVmSchema;

export type AgentGetVcpusInput = z.input<typeof agentGetVcpusSchema>;

// proxmox_agent_exec - Execute command via QEMU guest agent
export const agentExecSchema = baseVmSchema.extend({
  command: z.string().min(1).describe('Command to execute'),
  args: z.array(z.string()).optional().describe('Command arguments'),
  ['input-data']: z.string().optional().describe('Input data for stdin'),
  ['capture-output']: z.boolean().optional().describe('Capture stdout/stderr'),
  timeout: z.number().int().min(0).optional().describe('Timeout in seconds')
});

export type AgentExecInput = z.input<typeof agentExecSchema>;

// proxmox_agent_exec_status - Get execution status via QEMU guest agent
export const agentExecStatusSchema = baseVmSchema.extend({
  pid: z.coerce.number().int().min(1).describe('Process ID returned by agent exec')
});

export type AgentExecStatusInput = z.input<typeof agentExecStatusSchema>;

// proxmox_list_vm_firewall_rules - List VM firewall rules
export const listVmFirewallRulesSchema = baseVmSchema;

export type ListVmFirewallRulesInput = z.input<typeof listVmFirewallRulesSchema>;

// proxmox_get_vm_firewall_rule - Get VM firewall rule
export const getVmFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position')
});

export type GetVmFirewallRuleInput = z.input<typeof getVmFirewallRuleSchema>;

// proxmox_create_vm_firewall_rule - Create VM firewall rule
export const createVmFirewallRuleSchema = baseVmSchema.extend({
  action: z.string().min(1).describe('Rule action (ACCEPT, REJECT, DROP)'),
  type: z.enum(['in', 'out', 'group']).describe('Rule direction'),
  comment: z.string().optional(),
  dest: z.string().optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  pos: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional()
});

export type CreateVmFirewallRuleInput = z.input<typeof createVmFirewallRuleSchema>;

// proxmox_update_vm_firewall_rule - Update VM firewall rule
export const updateVmFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position'),
  action: z.string().optional(),
  comment: z.string().optional(),
  delete: z.string().optional(),
  dest: z.string().optional(),
  digest: z.string().max(64).optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  moveto: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional(),
  type: z.enum(['in', 'out', 'group']).optional()
});

export type UpdateVmFirewallRuleInput = z.input<typeof updateVmFirewallRuleSchema>;

// proxmox_delete_vm_firewall_rule - Delete VM firewall rule
export const deleteVmFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position'),
  digest: z.string().max(64).optional().describe('Config digest')
});

export type DeleteVmFirewallRuleInput = z.input<typeof deleteVmFirewallRuleSchema>;

// proxmox_list_lxc_firewall_rules - List LXC firewall rules
export const listLxcFirewallRulesSchema = baseVmSchema;

export type ListLxcFirewallRulesInput = z.input<typeof listLxcFirewallRulesSchema>;

// proxmox_get_lxc_firewall_rule - Get LXC firewall rule
export const getLxcFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position')
});

export type GetLxcFirewallRuleInput = z.input<typeof getLxcFirewallRuleSchema>;

// proxmox_create_lxc_firewall_rule - Create LXC firewall rule
export const createLxcFirewallRuleSchema = baseVmSchema.extend({
  action: z.string().min(1).describe('Rule action (ACCEPT, REJECT, DROP)'),
  type: z.enum(['in', 'out', 'group']).describe('Rule direction'),
  comment: z.string().optional(),
  dest: z.string().optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  pos: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional()
});

export type CreateLxcFirewallRuleInput = z.input<typeof createLxcFirewallRuleSchema>;

// proxmox_update_lxc_firewall_rule - Update LXC firewall rule
export const updateLxcFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position'),
  action: z.string().optional(),
  comment: z.string().optional(),
  delete: z.string().optional(),
  dest: z.string().optional(),
  digest: z.string().max(64).optional(),
  dport: z.string().optional(),
  enable: z.number().int().optional(),
  iface: z.string().optional(),
  log: z
    .enum(['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug', 'nolog'])
    .optional(),
  macro: z.string().optional(),
  moveto: z.number().int().optional(),
  proto: z.string().optional(),
  source: z.string().optional(),
  sport: z.string().optional(),
  type: z.enum(['in', 'out', 'group']).optional()
});

export type UpdateLxcFirewallRuleInput = z.input<typeof updateLxcFirewallRuleSchema>;

// proxmox_delete_lxc_firewall_rule - Delete LXC firewall rule
export const deleteLxcFirewallRuleSchema = baseVmSchema.extend({
  pos: z.number().int().min(0).describe('Rule position'),
  digest: z.string().max(64).optional().describe('Config digest')
});

export type DeleteLxcFirewallRuleInput = z.input<typeof deleteLxcFirewallRuleSchema>;
