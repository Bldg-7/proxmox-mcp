import crypto from 'node:crypto';

/**
 * Validates a Proxmox node name.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Maximum length: 64 characters.
 *
 * @throws {Error} If node name is invalid
 */
export function validateNodeName(node: unknown): string {
  if (!node || typeof node !== 'string') {
    throw new Error('Node name is required and must be a string');
  }

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-zA-Z0-9\-_]+$/.test(node)) {
    throw new Error(
      'Invalid node name format. Only alphanumeric, hyphens, and underscores allowed'
    );
  }

  if (node.length > 64) {
    throw new Error('Node name too long (max 64 characters)');
  }

  return node;
}

/**
 * Validates a system service name.
 * Allows alphanumeric characters, hyphens, underscores, dots, and @.
 * Maximum length: 128 characters.
 *
 * @throws {Error} If service name is invalid
 */
export function validateServiceName(service: unknown): string {
  if (!service || typeof service !== 'string') {
    throw new Error('Service name is required and must be a string');
  }

  if (!/^[a-zA-Z0-9@._-]+$/.test(service)) {
    throw new Error(
      'Invalid service name format. Only alphanumeric, hyphens, underscores, dots, and @ allowed'
    );
  }

  if (service.length > 128) {
    throw new Error('Service name too long (max 128 characters)');
  }

  return service;
}

/**
 * Validates a Proxmox task UPID.
 * Allows alphanumeric characters, colons, hyphens, underscores, dots, and @.
 * Maximum length: 512 characters.
 *
 * @throws {Error} If UPID is invalid
 */
export function validateUpid(upid: unknown): string {
  if (!upid || typeof upid !== 'string') {
    throw new Error('Task UPID is required and must be a string');
  }

  if (!/^[a-zA-Z0-9:._@-]+$/.test(upid)) {
    throw new Error(
      'Invalid task UPID format. Only alphanumeric, colons, hyphens, underscores, dots, and @ allowed'
    );
  }

  if (upid.length > 512) {
    throw new Error('Task UPID too long (max 512 characters)');
  }

  return upid;
}

/**
 * Validates a HA resource ID (e.g., vm:100 or ct:100).
 *
 * @throws {Error} If HA resource ID is invalid
 */
export function validateHaResourceId(sid: unknown): string {
  if (!sid || typeof sid !== 'string') {
    throw new Error('HA resource ID is required and must be a string');
  }

  if (!/^[a-zA-Z0-9:_-]+$/.test(sid)) {
    throw new Error('Invalid HA resource ID format');
  }

  if (sid.length > 128) {
    throw new Error('HA resource ID too long (max 128 characters)');
  }

  return sid;
}

/**
 * Validates a HA group identifier.
 *
 * @throws {Error} If HA group ID is invalid
 */
export function validateHaGroupId(group: unknown): string {
  if (!group || typeof group !== 'string') {
    throw new Error('HA group ID is required and must be a string');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(group)) {
    throw new Error('Invalid HA group ID format');
  }

  if (group.length > 64) {
    throw new Error('HA group ID too long (max 64 characters)');
  }

  return group;
}

/**
 * Validates a firewall group name.
 *
 * @throws {Error} If firewall group name is invalid
 */
export function validateFirewallGroupName(group: unknown): string {
  if (!group || typeof group !== 'string') {
    throw new Error('Firewall group name is required and must be a string');
  }

  if (!/^[A-Za-z][A-Za-z0-9_-]+$/.test(group)) {
    throw new Error('Invalid firewall group name format');
  }

  if (group.length < 2 || group.length > 64) {
    throw new Error('Firewall group name length must be between 2 and 64 characters');
  }

  return group;
}

/**
 * Validates a firewall rule position.
 *
 * @throws {Error} If rule position is invalid
 */
export function validateFirewallRulePos(pos: unknown): number {
  if (pos === undefined || pos === null) {
    throw new Error('Firewall rule position is required');
  }

  const parsed = typeof pos === 'number' ? pos : parseInt(String(pos), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Invalid firewall rule position');
  }

  return parsed;
}

/**
 * Validates a backup job ID.
 *
 * @throws {Error} If backup job ID is invalid
 */
export function validateBackupJobId(id: unknown): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Backup job ID is required and must be a string');
  }

  if (!/^[A-Za-z0-9._-]+$/.test(id)) {
    throw new Error('Invalid backup job ID format');
  }

  if (id.length > 64) {
    throw new Error('Backup job ID too long (max 64 characters)');
  }

  return id;
}

/**
 * Validates a replication job ID (<guest>-<jobnum>).
 *
 * @throws {Error} If replication job ID is invalid
 */
export function validateReplicationJobId(id: unknown): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Replication job ID is required and must be a string');
  }

  if (!/^[1-9][0-9]{2,8}-[0-9]{1,9}$/.test(id)) {
    throw new Error('Invalid replication job ID format');
  }

  return id;
}

/**
 * Validates a Proxmox VM ID.
 * Must be a number between 100 and 999999999.
 *
 * @throws {Error} If VMID is invalid
 */
export function validateVMID(vmid: unknown): string {
  if (!vmid) {
    throw new Error('VM ID is required');
  }

  const id = parseInt(String(vmid), 10);
  if (isNaN(id) || id < 100 || id > 999999999) {
    throw new Error('Invalid VM ID. Must be a number between 100 and 999999999');
  }

  return id.toString();
}

/**
 * Validates a shell command for execution.
 * Blocks dangerous characters that could be used for command injection.
 * Maximum length: 1000 characters.
 *
 * @throws {Error} If command contains dangerous characters or is too long
 */
export function validateCommand(command: unknown): string {
  if (!command || typeof command !== 'string') {
    throw new Error('Command is required and must be a string');
  }

  // Check for dangerous characters that could be used for command injection
  const dangerousChars = /[;&|`$(){}[\]<>\\]/g;
  if (dangerousChars.test(command)) {
    throw new Error(
      'Command contains potentially dangerous characters: ; & | ` $ ( ) { } [ ] < > \\'
    );
  }

  // Limit command length
  if (command.length > 1000) {
    throw new Error('Command exceeds maximum allowed length (1000 characters)');
  }

  return command;
}

/**
 * Validates a storage name.
 * Only allows alphanumeric characters, hyphens, underscores, and dots.
 * Maximum length: 64 characters.
 *
 * @throws {Error} If storage name is invalid
 */
export function validateStorageName(storage: unknown): string {
  if (!storage || typeof storage !== 'string') {
    throw new Error('Storage name is required and must be a string');
  }

  // Allow alphanumeric, hyphens, underscores, and dots
  if (!/^[a-zA-Z0-9\-_.]+$/.test(storage)) {
    throw new Error(
      'Invalid storage name format. Only alphanumeric, hyphens, underscores, and dots allowed'
    );
  }

  if (storage.length > 64) {
    throw new Error('Storage name too long (max 64 characters)');
  }

  return storage;
}

/**
 * Validates an ISO image filename.
 * Must end with .iso extension.
 * Maximum length: 255 characters.
 *
 * @throws {Error} If ISO filename is invalid
 */
export function validateISOName(iso: unknown): string {
  if (!iso || typeof iso !== 'string') {
    throw new Error('ISO name is required and must be a string');
  }

  if (!iso.toLowerCase().endsWith('.iso')) {
    throw new Error('ISO name must end with .iso extension');
  }

  // Allow alphanumeric, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9\-_.]+$/.test(iso)) {
    throw new Error(
      'Invalid ISO name format. Only alphanumeric, hyphens, underscores, and dots allowed'
    );
  }

  if (iso.length > 255) {
    throw new Error('ISO name too long (max 255 characters)');
  }

  return iso;
}

/**
 * Validates a snapshot name.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Maximum length: 64 characters.
 *
 * @throws {Error} If snapshot name is invalid
 */
export function validateSnapshotName(snapshot: unknown): string {
  if (!snapshot || typeof snapshot !== 'string') {
    throw new Error('Snapshot name is required and must be a string');
  }

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-zA-Z0-9\-_]+$/.test(snapshot)) {
    throw new Error(
      'Invalid snapshot name format. Only alphanumeric, hyphens, and underscores allowed'
    );
  }

  if (snapshot.length > 64) {
    throw new Error('Snapshot name too long (max 64 characters)');
  }

  return snapshot;
}

/**
 * Validates a disk identifier (e.g., scsi0, virtio1, sata2).
 * Format: controller + number (e.g., scsi0, virtio1, ide2, sata3).
 *
 * @throws {Error} If disk identifier is invalid
 */
export function validateDiskId(disk: unknown): string {
  if (!disk || typeof disk !== 'string') {
    throw new Error('Disk identifier is required and must be a string');
  }

  // Valid formats: scsi0, virtio1, ide2, sata3, etc.
  if (!/^(scsi|virtio|ide|sata)\d+$/.test(disk)) {
    throw new Error(
      'Invalid disk identifier format. Must be controller + number (e.g., scsi0, virtio1)'
    );
  }

  return disk;
}

/**
 * Validates a network interface identifier (e.g., net0, net1).
 * Format: net + number.
 *
 * @throws {Error} If network identifier is invalid
 */
export function validateNetworkId(net: unknown): string {
  if (!net || typeof net !== 'string') {
    throw new Error('Network identifier is required and must be a string');
  }

  // Valid format: net0, net1, net2, etc.
  if (!/^net\d+$/.test(net)) {
    throw new Error('Invalid network identifier format. Must be net + number (e.g., net0)');
  }

  return net;
}

/**
 * Validates a network bridge name (e.g., vmbr0, vmbr1).
 * Format: vmbr + number.
 *
 * @throws {Error} If bridge name is invalid
 */
export function validateBridgeName(bridge: unknown): string {
  if (!bridge || typeof bridge !== 'string') {
    throw new Error('Bridge name is required and must be a string');
  }

  // Valid format: vmbr0, vmbr1, etc.
  if (!/^vmbr\d+$/.test(bridge)) {
    throw new Error('Invalid bridge name format. Must be vmbr + number (e.g., vmbr0)');
  }

  return bridge;
}

/**
 * Validates a Linux network interface name.
 * Must start with a letter, followed by alphanumeric characters, dots (for VLAN), hyphens, or underscores.
 * Examples: eth0, vmbr0, bond0, eth0.100 (VLAN), ens18, enp0s3
 *
 * @throws {Error} If interface name is invalid
 */
export function validateInterfaceName(iface: unknown): string {
  if (!iface || typeof iface !== 'string') {
    throw new Error('Interface name is required and must be a string');
  }

  // Linux interface names: must start with letter, then alphanumeric, dots (VLAN), hyphens, underscores
  if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(iface)) {
    throw new Error(
      'Invalid interface name format. Must start with a letter, followed by alphanumeric characters, dots (VLAN), hyphens, or underscores'
    );
  }

  return iface;
}

/**
 * Generates a secure random password using Node.js crypto.
 * Length: 16 characters.
 * Character set: A-Z, a-z, 0-9, !@#$%^&*
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(16);

  for (let i = 0; i < 16; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  return password;
}
