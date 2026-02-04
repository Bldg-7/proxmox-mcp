/**
 * Format a byte count into a human-readable string.
 *
 * @example formatBytes(0)          // '0 B'
 * @example formatBytes(1024)       // '1 KB'
 * @example formatBytes(1073741824) // '1 GB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${parseFloat(value.toFixed(2))} ${units[i]}`;
}

/**
 * Format an uptime value (in seconds) into a human-readable string.
 *
 * @example formatUptime(60)    // '1 minute'
 * @example formatUptime(3600)  // '1 hour'
 * @example formatUptime(86400) // '1 day'
 */
export function formatUptime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

/**
 * Format a CPU usage fraction as a percentage string.
 *
 * @example formatCpuPercent(0.5123) // '51.23%'
 */
export function formatCpuPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(2)}%`;
}

import type { ToolResponse } from '../types/tools.js';

/**
 * Format a successful tool response.
 *
 * @example formatToolResponse('VM started successfully')
 */
export function formatToolResponse(text: string): ToolResponse {
  return {
    content: [{ type: 'text', text }],
    isError: false,
  };
}

/**
 * Format an error response with context.
 *
 * @example formatErrorResponse(new Error('Connection failed'), 'Get VM Status')
 */
export function formatErrorResponse(error: Error, context: string): ToolResponse {
  const message = `❌ **Error in ${context}**\n\n${error.message}`;
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/**
 * Format a permission denied response.
 *
 * @example formatPermissionDenied('delete_vm')
 */
export function formatPermissionDenied(action: string): ToolResponse {
  const message =
    `🚫 **Permission Denied**\n\n` +
    `The action "${action}" requires elevated permissions.\n` +
    `Set PROXMOX_ALLOW_ELEVATED=true to enable.`;
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}
