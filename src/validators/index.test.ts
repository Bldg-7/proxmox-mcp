import { describe, it, expect } from 'vitest';
import {
  validateNodeName,
  validateVMID,
  validateCommand,
  validateStorageName,
  validateISOName,
  validateSnapshotName,
  validateDiskId,
  validateNetworkId,
  validateBridgeName,
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
