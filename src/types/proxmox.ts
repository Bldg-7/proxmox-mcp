export type VMType = 'qemu' | 'lxc';

export type PermissionLevel = 'basic' | 'elevated';

export interface ProxmoxNode {
  node: string;
  status: string;
  uptime: number;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  level: string;
  id: string;
  type: string;
  ssl_fingerprint?: string;
  loadavg?: number[];
}

export interface ProxmoxVM {
  vmid: number;
  name: string;
  status: string;
  node?: string;
  type?: VMType;
  cpus: number;
  maxmem: number;
  maxdisk: number;
  uptime: number;
  pid?: number;
  mem?: number;
  disk?: number;
  netin?: number;
  netout?: number;
  diskread?: number;
  diskwrite?: number;
  template?: number;
  lock?: string;
  tags?: string;
}

export interface ProxmoxStorage {
  storage: string;
  type: string;
  content: string;
  active: number;
  enabled: number;
  total: number;
  used: number;
  avail: number;
  shared: number;
  used_fraction?: number;
}

export interface ProxmoxSnapshot {
  name: string;
  description: string;
  snaptime?: number;
  vmstate?: number;
  parent?: string;
}

export interface ProxmoxBackup {
  volid: string;
  format: string;
  size: number;
  ctime: number;
  content?: string;
  notes?: string;
  subtype?: string;
  vmid?: number;
}

export interface ProxmoxTemplate {
  volid: string;
  format: string;
  size: number;
  content?: string;
}

export interface ProxmoxTask {
  upid: string;
  node: string;
  pid: number;
  pstart: number;
  starttime: number;
  type: string;
  id: string;
  user: string;
  status?: string;
  exitstatus?: string;
  endtime?: number;
}

export interface ProxmoxService {
  name?: string;
  service?: string;
  state?: string;
  status?: string;
  enabled?: number;
  desc?: string;
}

export interface ProxmoxSyslogEntry {
  n?: number;
  t?: string;
  msg?: string;
  time?: number;
  pri?: string;
}

export interface ProxmoxJournalEntry {
  n?: number;
  t?: string;
  msg?: string;
  time?: number;
  pri?: string;
}

export interface ProxmoxApplianceTemplate {
  template?: string;
  package?: string;
  version?: string;
  type?: string;
  os?: string;
  description?: string;
}

export interface ProxmoxNetstatEntry {
  proto?: string;
  local_address?: string;
  remote_address?: string;
  local?: string;
  remote?: string;
  state?: string;
  recvq?: number;
  sendq?: number;
  pid?: number;
  program?: string;
}

export interface ProxmoxNetwork {
  iface: string;
  type: string;
  active: number;
  autostart?: number;
  method?: string;
  address?: string;
  netmask?: string;
  gateway?: string;
  cidr?: string;
  bridge_ports?: string;
  bridge_stp?: string;
  bridge_fd?: string;
  families?: string[];
  priority?: number;
}

export interface ProxmoxPool {
  poolid: string;
  comment?: string;
  members?: ProxmoxPoolMember[];
}

export interface ProxmoxPoolMember {
  id: string;
  node: string;
  type: string;
  vmid?: number;
  storage?: string;
  status?: string;
}

export interface ProxmoxClusterStatus {
  id: string;
  name: string;
  type: string;
  nodeid?: number;
  ip?: string;
  level?: string;
  local?: number;
  online?: number;
  quorate?: number;
  version?: number;
  nodes?: number;
}

export interface ProxmoxHaResource {
  sid?: string;
  type?: string;
  state?: string;
  group?: string;
  comment?: string;
}

export interface ProxmoxHaGroup {
  group?: string;
  nodes?: string;
  comment?: string;
  restricted?: number;
  nofailback?: number;
}

export interface ProxmoxFirewallGroup {
  group?: string;
  comment?: string;
  digest?: string;
}

export interface ProxmoxBackupJob {
  id?: string;
  storage?: string;
  starttime?: string;
  dow?: string;
  enabled?: number;
  comment?: string;
}

export interface ProxmoxReplicationJob {
  id?: string;
  guest?: number;
  target?: string;
  type?: string;
  schedule?: string;
  disable?: number;
  comment?: string;
}

export interface ProxmoxFirewallRule {
  pos: number;
  type: string;
  action: string;
  enable?: number;
  comment?: string;
  source?: string;
  dest?: string;
  sport?: string;
  dport?: string;
  proto?: string;
  macro?: string;
  iface?: string;
  log?: string;
}

export interface ProxmoxCertificate {
  filename: string;
  fingerprint: string;
  issuer: string;
  subject: string;
  notbefore: number;
  notafter: number;
  san?: string[];
  pem?: string;
  'public-key-bits'?: number;
  'public-key-type'?: string;
}

export interface ProxmoxDNS {
  search: string;
  dns1?: string;
  dns2?: string;
  dns3?: string;
}

export interface ProxmoxAPIResponse<T> {
  data: T;
}
