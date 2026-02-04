import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatUptime,
  formatCpuPercent,
  formatToolResponse,
  formatErrorResponse,
  formatPermissionDenied,
} from './index.js';

describe('formatBytes', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(10485760)).toBe('10 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(8589934592)).toBe('8 GB');
  });

  it('formats terabytes', () => {
    expect(formatBytes(1099511627776)).toBe('1 TB');
  });
});

describe('formatUptime', () => {
  it('formats seconds', () => {
    expect(formatUptime(0)).toBe('0 seconds');
    expect(formatUptime(1)).toBe('1 second');
    expect(formatUptime(45)).toBe('45 seconds');
  });

  it('formats minutes', () => {
    expect(formatUptime(60)).toBe('1 minute');
    expect(formatUptime(120)).toBe('2 minutes');
    expect(formatUptime(150)).toBe('2 minutes');
  });

  it('formats hours', () => {
    expect(formatUptime(3600)).toBe('1 hour');
    expect(formatUptime(7200)).toBe('2 hours');
    expect(formatUptime(3660)).toBe('1 hour, 1 minute');
  });

  it('formats days', () => {
    expect(formatUptime(86400)).toBe('1 day');
    expect(formatUptime(172800)).toBe('2 days');
  });

  it('formats days and hours without minutes', () => {
    expect(formatUptime(90000)).toBe('1 day, 1 hour');
  });

  it('formats complex durations', () => {
    expect(formatUptime(1209600)).toBe('14 days');
  });
});

describe('formatCpuPercent', () => {
  it('formats zero', () => {
    expect(formatCpuPercent(0)).toBe('0.00%');
  });

  it('formats fractional CPU usage', () => {
    expect(formatCpuPercent(0.5123)).toBe('51.23%');
    expect(formatCpuPercent(0.0523)).toBe('5.23%');
    expect(formatCpuPercent(1)).toBe('100.00%');
  });
});

describe('formatToolResponse', () => {
  it('returns ToolResponse with text content', () => {
    const result = formatToolResponse('VM started successfully');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('VM started successfully');
  });

  it('sets isError to false', () => {
    const result = formatToolResponse('Success');
    expect(result.isError).toBe(false);
  });

  it('handles multiline text', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    const result = formatToolResponse(text);
    expect(result.content[0].text).toBe(text);
  });
});

describe('formatErrorResponse', () => {
  it('returns ToolResponse with error message', () => {
    const error = new Error('Connection failed');
    const result = formatErrorResponse(error, 'Get VM Status');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Connection failed');
  });

  it('includes context in error message', () => {
    const error = new Error('Timeout');
    const result = formatErrorResponse(error, 'Start VM');
    expect(result.content[0].text).toContain('Start VM');
  });

  it('includes error emoji', () => {
    const error = new Error('Failed');
    const result = formatErrorResponse(error, 'Test');
    expect(result.content[0].text).toContain('❌');
  });

  it('sets isError to true', () => {
    const error = new Error('Test error');
    const result = formatErrorResponse(error, 'Context');
    expect(result.isError).toBe(true);
  });
});

describe('formatPermissionDenied', () => {
  it('returns ToolResponse with permission denied message', () => {
    const result = formatPermissionDenied('delete_vm');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Permission Denied');
  });

  it('includes action name in message', () => {
    const result = formatPermissionDenied('delete_vm');
    expect(result.content[0].text).toContain('delete_vm');
  });

  it('includes permission denied emoji', () => {
    const result = formatPermissionDenied('test_action');
    expect(result.content[0].text).toContain('🚫');
  });

  it('includes environment variable hint', () => {
    const result = formatPermissionDenied('dangerous_action');
    expect(result.content[0].text).toContain('PROXMOX_ALLOW_ELEVATED=true');
  });

  it('sets isError to true', () => {
    const result = formatPermissionDenied('action');
    expect(result.isError).toBe(true);
  });
});
