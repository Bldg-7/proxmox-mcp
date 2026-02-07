import { describe, it, expect } from 'vitest';
import {
  validateNodeName,
  validateServiceName,
  validateUpid,
  validateVMID,
  validateCommand,
  validateStorageName,
  validateISOName,
  validateSnapshotName,
  validateDiskId,
  validateNetworkId,
  validateBridgeName,
  validateInterfaceName,
  validateFilePath,
  validateUsername,
} from './index.js';

describe('validateNodeName', () => {
  it('accepts valid node names', () => {
    expect(validateNodeName('pve1')).toBe('pve1');
    expect(validateNodeName('proxmox-node-2')).toBe('proxmox-node-2');
    expect(validateNodeName('node_test')).toBe('node_test');
  });

  it('rejects non-string input', () => {
    expect(() => validateNodeName(null)).toThrow('Node name is required and must be a string');
    expect(() => validateNodeName(undefined)).toThrow('Node name is required and must be a string');
    expect(() => validateNodeName(123)).toThrow('Node name is required and must be a string');
  });

  it('rejects invalid characters', () => {
    expect(() => validateNodeName('node@123')).toThrow('Invalid node name format');
    expect(() => validateNodeName('node.test')).toThrow('Invalid node name format');
    expect(() => validateNodeName('node test')).toThrow('Invalid node name format');
  });

  it('rejects too long names', () => {
    expect(() => validateNodeName('a'.repeat(65))).toThrow('too long');
  });

  it('accepts max length name', () => {
    const maxName = 'a'.repeat(64);
    expect(validateNodeName(maxName)).toBe(maxName);
  });
});

describe('validateServiceName', () => {
  it('accepts valid service names', () => {
    expect(validateServiceName('pveproxy')).toBe('pveproxy');
    expect(validateServiceName('ssh')).toBe('ssh');
    expect(validateServiceName('pve-ha-lrm')).toBe('pve-ha-lrm');
    expect(validateServiceName('pvedaemon.service')).toBe('pvedaemon.service');
    expect(validateServiceName('serial-getty@ttyS0')).toBe('serial-getty@ttyS0');
  });

  it('rejects non-string input', () => {
    expect(() => validateServiceName(null)).toThrow('Service name is required');
    expect(() => validateServiceName(undefined)).toThrow('Service name is required');
    expect(() => validateServiceName(123)).toThrow('Service name is required');
  });

  it('rejects invalid characters', () => {
    expect(() => validateServiceName('pve/proxy')).toThrow('Invalid service name format');
    expect(() => validateServiceName('pve proxy')).toThrow('Invalid service name format');
    expect(() => validateServiceName('pve;proxy')).toThrow('Invalid service name format');
  });

  it('rejects too long names', () => {
    expect(() => validateServiceName('a'.repeat(129))).toThrow('too long');
  });
});

describe('validateUpid', () => {
  it('accepts valid UPIDs', () => {
    expect(validateUpid('UPID:pve1:0002E0B4:0000001D:64A539CB:qmstart:100:root@pam:')).toBe(
      'UPID:pve1:0002E0B4:0000001D:64A539CB:qmstart:100:root@pam:'
    );
    expect(validateUpid('UPID:pve-node_1:ABC123:00000001:5F09D2AB:vzdump:101:backup@pve:')).toBe(
      'UPID:pve-node_1:ABC123:00000001:5F09D2AB:vzdump:101:backup@pve:'
    );
  });

  it('rejects non-string input', () => {
    expect(() => validateUpid(null)).toThrow('Task UPID is required');
    expect(() => validateUpid(undefined)).toThrow('Task UPID is required');
    expect(() => validateUpid(123)).toThrow('Task UPID is required');
  });

  it('rejects invalid characters', () => {
    expect(() => validateUpid('UPID/pve1/123')).toThrow('Invalid task UPID format');
    expect(() => validateUpid('UPID:pve1:123?bad')).toThrow('Invalid task UPID format');
  });

  it('rejects too long UPIDs', () => {
    expect(() => validateUpid('a'.repeat(513))).toThrow('too long');
  });
});

describe('validateVMID', () => {
  it('accepts valid VM IDs', () => {
    expect(validateVMID(100)).toBe('100');
    expect(validateVMID('100')).toBe('100');
    expect(validateVMID(999999999)).toBe('999999999');
  });

  it('rejects missing VMID', () => {
    expect(() => validateVMID(null)).toThrow('VM ID is required');
    expect(() => validateVMID(undefined)).toThrow('VM ID is required');
    expect(() => validateVMID(0)).toThrow('VM ID is required');
  });

  it('rejects out of range IDs', () => {
    expect(() => validateVMID(99)).toThrow('Invalid VM ID');
    expect(() => validateVMID(1000000000)).toThrow('Invalid VM ID');
    expect(() => validateVMID(-100)).toThrow('Invalid VM ID');
  });

  it('rejects non-numeric input', () => {
    expect(() => validateVMID('abc')).toThrow('Invalid VM ID');
    expect(() => validateVMID('not-a-number')).toThrow('Invalid VM ID');
  });
});

describe('validateCommand', () => {
  it('accepts valid commands', () => {
    expect(validateCommand('ls')).toBe('ls');
    expect(validateCommand('echo hello')).toBe('echo hello');
    expect(validateCommand('ps aux')).toBe('ps aux');
  });

  it('rejects non-string input', () => {
    expect(() => validateCommand(null)).toThrow('Command is required and must be a string');
    expect(() => validateCommand(undefined)).toThrow('Command is required and must be a string');
    expect(() => validateCommand(123)).toThrow('Command is required and must be a string');
  });

  it('rejects dangerous characters', () => {
    expect(() => validateCommand('ls; rm -rf /')).toThrow('dangerous characters');
    expect(() => validateCommand('ls && cat /etc/passwd')).toThrow('dangerous characters');
    expect(() => validateCommand('ls | grep test')).toThrow('dangerous characters');
    expect(() => validateCommand('echo `whoami`')).toThrow('dangerous characters');
    expect(() => validateCommand('$(whoami)')).toThrow('dangerous characters');
  });

  it('rejects too long commands', () => {
    expect(() => validateCommand('a'.repeat(1001))).toThrow('exceeds maximum allowed length');
  });

  it('accepts max length command', () => {
    const maxCmd = 'a'.repeat(1000);
    expect(validateCommand(maxCmd)).toBe(maxCmd);
  });
});

describe('validateStorageName', () => {
  it('accepts valid storage names', () => {
    expect(validateStorageName('local')).toBe('local');
    expect(validateStorageName('storage-1')).toBe('storage-1');
    expect(validateStorageName('storage_test')).toBe('storage_test');
    expect(validateStorageName('storage.backup')).toBe('storage.backup');
  });

  it('rejects non-string input', () => {
    expect(() => validateStorageName(null)).toThrow('Storage name is required and must be a string');
    expect(() => validateStorageName(undefined)).toThrow('Storage name is required and must be a string');
  });

  it('rejects invalid characters', () => {
    expect(() => validateStorageName('storage@test')).toThrow('Invalid storage name format');
    expect(() => validateStorageName('storage test')).toThrow('Invalid storage name format');
  });

  it('rejects too long names', () => {
    expect(() => validateStorageName('a'.repeat(65))).toThrow('too long');
  });
});

describe('validateISOName', () => {
  it('accepts valid ISO names', () => {
    expect(validateISOName('ubuntu-20.04.iso')).toBe('ubuntu-20.04.iso');
    expect(validateISOName('debian.iso')).toBe('debian.iso');
    expect(validateISOName('CentOS-8.iso')).toBe('CentOS-8.iso');
  });

  it('rejects non-string input', () => {
    expect(() => validateISOName(null)).toThrow('ISO name is required and must be a string');
    expect(() => validateISOName(undefined)).toThrow('ISO name is required and must be a string');
  });

  it('rejects missing .iso extension', () => {
    expect(() => validateISOName('ubuntu-20.04')).toThrow('must end with .iso extension');
    expect(() => validateISOName('ubuntu.img')).toThrow('must end with .iso extension');
  });

  it('accepts case-insensitive .iso extension', () => {
    expect(validateISOName('ubuntu.ISO')).toBe('ubuntu.ISO');
    expect(validateISOName('ubuntu.Iso')).toBe('ubuntu.Iso');
  });

  it('rejects invalid characters', () => {
    expect(() => validateISOName('ubuntu@20.iso')).toThrow('Invalid ISO name format');
  });

  it('rejects too long names', () => {
    expect(() => validateISOName('a'.repeat(252) + '.iso')).toThrow('too long');
  });
});

describe('validateSnapshotName', () => {
  it('accepts valid snapshot names', () => {
    expect(validateSnapshotName('backup-1')).toBe('backup-1');
    expect(validateSnapshotName('snapshot_test')).toBe('snapshot_test');
    expect(validateSnapshotName('snap1')).toBe('snap1');
  });

  it('rejects non-string input', () => {
    expect(() => validateSnapshotName(null)).toThrow('Snapshot name is required and must be a string');
    expect(() => validateSnapshotName(undefined)).toThrow('Snapshot name is required and must be a string');
  });

  it('rejects invalid characters', () => {
    expect(() => validateSnapshotName('snapshot.test')).toThrow('Invalid snapshot name format');
    expect(() => validateSnapshotName('snapshot test')).toThrow('Invalid snapshot name format');
  });

  it('rejects too long names', () => {
    expect(() => validateSnapshotName('a'.repeat(65))).toThrow('too long');
  });
});

describe('validateDiskId', () => {
  it('accepts valid disk identifiers', () => {
    expect(validateDiskId('scsi0')).toBe('scsi0');
    expect(validateDiskId('virtio1')).toBe('virtio1');
    expect(validateDiskId('ide2')).toBe('ide2');
    expect(validateDiskId('sata3')).toBe('sata3');
  });

  it('rejects non-string input', () => {
    expect(() => validateDiskId(null)).toThrow('Disk identifier is required and must be a string');
    expect(() => validateDiskId(undefined)).toThrow('Disk identifier is required and must be a string');
  });

  it('rejects invalid format', () => {
    expect(() => validateDiskId('disk0')).toThrow('Invalid disk identifier format');
    expect(() => validateDiskId('scsi')).toThrow('Invalid disk identifier format');
    expect(() => validateDiskId('scsi0a')).toThrow('Invalid disk identifier format');
  });
});

describe('validateNetworkId', () => {
  it('accepts valid network identifiers', () => {
    expect(validateNetworkId('net0')).toBe('net0');
    expect(validateNetworkId('net1')).toBe('net1');
    expect(validateNetworkId('net99')).toBe('net99');
  });

  it('rejects non-string input', () => {
    expect(() => validateNetworkId(null)).toThrow('Network identifier is required and must be a string');
    expect(() => validateNetworkId(undefined)).toThrow('Network identifier is required and must be a string');
  });

  it('rejects invalid format', () => {
    expect(() => validateNetworkId('eth0')).toThrow('Invalid network identifier format');
    expect(() => validateNetworkId('net')).toThrow('Invalid network identifier format');
    expect(() => validateNetworkId('net0a')).toThrow('Invalid network identifier format');
  });
});

describe('validateBridgeName', () => {
  it('accepts valid bridge names', () => {
    expect(validateBridgeName('vmbr0')).toBe('vmbr0');
    expect(validateBridgeName('vmbr1')).toBe('vmbr1');
    expect(validateBridgeName('vmbr99')).toBe('vmbr99');
  });

  it('rejects non-string input', () => {
    expect(() => validateBridgeName(null)).toThrow('Bridge name is required and must be a string');
    expect(() => validateBridgeName(undefined)).toThrow('Bridge name is required and must be a string');
  });

  it('rejects invalid format', () => {
    expect(() => validateBridgeName('br0')).toThrow('Invalid bridge name format');
    expect(() => validateBridgeName('vmbr')).toThrow('Invalid bridge name format');
    expect(() => validateBridgeName('vmbr0a')).toThrow('Invalid bridge name format');
  });
});

describe('validateInterfaceName', () => {
  it('accepts valid physical interface names', () => {
    expect(validateInterfaceName('eth0')).toBe('eth0');
    expect(validateInterfaceName('eth1')).toBe('eth1');
    expect(validateInterfaceName('ens18')).toBe('ens18');
    expect(validateInterfaceName('enp0s3')).toBe('enp0s3');
  });

  it('accepts valid bridge interface names', () => {
    expect(validateInterfaceName('vmbr0')).toBe('vmbr0');
    expect(validateInterfaceName('vmbr1')).toBe('vmbr1');
  });

  it('accepts valid bond interface names', () => {
    expect(validateInterfaceName('bond0')).toBe('bond0');
    expect(validateInterfaceName('bond1')).toBe('bond1');
  });

  it('accepts VLAN interface names with dots', () => {
    expect(validateInterfaceName('eth0.100')).toBe('eth0.100');
    expect(validateInterfaceName('eth1.200')).toBe('eth1.200');
    expect(validateInterfaceName('vmbr0.100')).toBe('vmbr0.100');
  });

  it('accepts interface names with hyphens and underscores', () => {
    expect(validateInterfaceName('eth-0')).toBe('eth-0');
    expect(validateInterfaceName('eth_0')).toBe('eth_0');
    expect(validateInterfaceName('my-interface')).toBe('my-interface');
    expect(validateInterfaceName('my_interface')).toBe('my_interface');
  });

  it('accepts complex interface names', () => {
    expect(validateInterfaceName('enp0s3.100')).toBe('enp0s3.100');
    expect(validateInterfaceName('bond0-vlan')).toBe('bond0-vlan');
    expect(validateInterfaceName('a1b2c3')).toBe('a1b2c3');
  });

  it('rejects non-string input', () => {
    expect(() => validateInterfaceName(null)).toThrow('Interface name is required and must be a string');
    expect(() => validateInterfaceName(undefined)).toThrow('Interface name is required and must be a string');
    expect(() => validateInterfaceName(123)).toThrow('Interface name is required and must be a string');
  });

  it('rejects empty string', () => {
    expect(() => validateInterfaceName('')).toThrow('Interface name is required and must be a string');
  });

  it('rejects names starting with numbers', () => {
    expect(() => validateInterfaceName('0eth')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('123start')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('1interface')).toThrow('Invalid interface name format');
  });

  it('rejects names starting with special characters', () => {
    expect(() => validateInterfaceName('@invalid')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('-eth0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('_eth0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('.eth0')).toThrow('Invalid interface name format');
  });

  it('rejects names with spaces', () => {
    expect(() => validateInterfaceName('eth 0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('eth0 vlan')).toThrow('Invalid interface name format');
  });

  it('rejects names with invalid special characters', () => {
    expect(() => validateInterfaceName('eth@0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('eth#0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('eth$0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('eth/0')).toThrow('Invalid interface name format');
    expect(() => validateInterfaceName('eth:0')).toThrow('Invalid interface name format');
  });
});

describe('validateFilePath', () => {
  it('accepts valid file paths', () => {
    expect(validateFilePath('/etc/passwd')).toBe('/etc/passwd');
    expect(validateFilePath('/home/user/file.txt')).toBe('/home/user/file.txt');
    expect(validateFilePath('relative/path/file.txt')).toBe('relative/path/file.txt');
    expect(validateFilePath('/var/log/syslog')).toBe('/var/log/syslog');
  });

  it('accepts paths with whitespace and trims them', () => {
    expect(validateFilePath('  /etc/passwd  ')).toBe('/etc/passwd');
    expect(validateFilePath('\t/home/user/file.txt\n')).toBe('/home/user/file.txt');
  });

  it('rejects non-string input', () => {
    expect(() => validateFilePath(null)).toThrow('File path is required and must be a string');
    expect(() => validateFilePath(undefined)).toThrow('File path is required and must be a string');
    expect(() => validateFilePath(123)).toThrow('File path is required and must be a string');
    expect(() => validateFilePath({})).toThrow('File path is required and must be a string');
  });

  it('rejects empty or whitespace-only paths', () => {
    expect(() => validateFilePath('')).toThrow('File path cannot be empty or whitespace-only');
    expect(() => validateFilePath('   ')).toThrow('File path cannot be empty or whitespace-only');
    expect(() => validateFilePath('\t\n')).toThrow('File path cannot be empty or whitespace-only');
  });

  it('rejects paths with path traversal (..) sequences', () => {
    expect(() => validateFilePath('/etc/../passwd')).toThrow('contains invalid path traversal sequence');
    expect(() => validateFilePath('../../../etc/passwd')).toThrow('contains invalid path traversal sequence');
    expect(() => validateFilePath('/home/user/../../etc/passwd')).toThrow('contains invalid path traversal sequence');
    expect(() => validateFilePath('..')).toThrow('contains invalid path traversal sequence');
    expect(() => validateFilePath('file..txt')).toThrow('contains invalid path traversal sequence');
  });

  it('rejects paths exceeding 4096 characters', () => {
    const longPath = '/path/' + 'a'.repeat(4092);
    expect(() => validateFilePath(longPath)).toThrow('File path too long (max 4096 characters)');
  });

  it('accepts paths at maximum length (4096 characters)', () => {
    const maxPath = '/path/' + 'a'.repeat(4090);
    expect(validateFilePath(maxPath)).toBe(maxPath);
  });

  it('accepts paths with special characters (except ..)', () => {
    expect(validateFilePath('/home/user-name/file_name.txt')).toBe('/home/user-name/file_name.txt');
    expect(validateFilePath('/var/log/app@service.log')).toBe('/var/log/app@service.log');
    expect(validateFilePath('/home/user/file (1).txt')).toBe('/home/user/file (1).txt');
  });
});

describe('validateUsername', () => {
  it('accepts valid Linux usernames', () => {
    expect(validateUsername('root')).toBe('root');
    expect(validateUsername('user')).toBe('user');
    expect(validateUsername('user123')).toBe('user123');
    expect(validateUsername('user_name')).toBe('user_name');
    expect(validateUsername('user-name')).toBe('user-name');
    expect(validateUsername('_user')).toBe('_user');
    expect(validateUsername('_')).toBe('_');
  });

  it('accepts system account usernames with trailing $', () => {
    expect(validateUsername('user$')).toBe('user$');
    expect(validateUsername('_user$')).toBe('_user$');
    expect(validateUsername('system_account$')).toBe('system_account$');
  });

  it('accepts usernames with whitespace and trims them', () => {
    expect(validateUsername('  user  ')).toBe('user');
    expect(validateUsername('\troot\n')).toBe('root');
  });

  it('rejects non-string input', () => {
    expect(() => validateUsername(null)).toThrow('Username is required and must be a string');
    expect(() => validateUsername(undefined)).toThrow('Username is required and must be a string');
    expect(() => validateUsername(123)).toThrow('Username is required and must be a string');
    expect(() => validateUsername({})).toThrow('Username is required and must be a string');
  });

  it('rejects empty or whitespace-only usernames', () => {
    expect(() => validateUsername('')).toThrow('Username cannot be empty or whitespace-only');
    expect(() => validateUsername('   ')).toThrow('Username cannot be empty or whitespace-only');
    expect(() => validateUsername('\t\n')).toThrow('Username cannot be empty or whitespace-only');
  });

  it('rejects usernames exceeding 32 characters', () => {
    const longUsername = 'a'.repeat(33);
    expect(() => validateUsername(longUsername)).toThrow('Username too long (max 32 characters)');
  });

  it('accepts usernames at maximum length (32 characters)', () => {
    const maxUsername = 'a'.repeat(32);
    expect(validateUsername(maxUsername)).toBe(maxUsername);
  });

  it('rejects usernames starting with uppercase letters', () => {
    expect(() => validateUsername('User')).toThrow('Invalid username format');
    expect(() => validateUsername('ROOT')).toThrow('Invalid username format');
    expect(() => validateUsername('Admin')).toThrow('Invalid username format');
  });

  it('rejects usernames starting with numbers', () => {
    expect(() => validateUsername('1user')).toThrow('Invalid username format');
    expect(() => validateUsername('123')).toThrow('Invalid username format');
  });

  it('rejects usernames starting with hyphens or dots', () => {
    expect(() => validateUsername('-user')).toThrow('Invalid username format');
    expect(() => validateUsername('.user')).toThrow('Invalid username format');
  });

  it('rejects usernames with uppercase letters in the middle', () => {
    expect(() => validateUsername('userNAME')).toThrow('Invalid username format');
    expect(() => validateUsername('user_NAME')).toThrow('Invalid username format');
  });

  it('rejects usernames with invalid characters', () => {
    expect(() => validateUsername('user@domain')).toThrow('Invalid username format');
    expect(() => validateUsername('user.name')).toThrow('Invalid username format');
    expect(() => validateUsername('user name')).toThrow('Invalid username format');
    expect(() => validateUsername('user#name')).toThrow('Invalid username format');
    expect(() => validateUsername('user/name')).toThrow('Invalid username format');
  });

  it('rejects usernames with multiple trailing $', () => {
    expect(() => validateUsername('user$$')).toThrow('Invalid username format');
    expect(() => validateUsername('user$name')).toThrow('Invalid username format');
  });

  it('accepts complex valid usernames', () => {
    expect(validateUsername('user_123')).toBe('user_123');
    expect(validateUsername('user-123')).toBe('user-123');
    expect(validateUsername('_user_123')).toBe('_user_123');
    expect(validateUsername('_user-123')).toBe('_user-123');
    expect(validateUsername('user_123$')).toBe('user_123$');
  });
});
