import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  listNotificationTargetsSchema,
  getNotificationTargetSchema,
  createNotificationTargetSchema,
  deleteNotificationTargetSchema,
  testNotificationTargetSchema,
} from '../schemas/notifications.js';
import type {
  ListNotificationTargetsInput,
  GetNotificationTargetInput,
  CreateNotificationTargetInput,
  DeleteNotificationTargetInput,
  TestNotificationTargetInput,
} from '../schemas/notifications.js';

export async function listNotificationTargets(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListNotificationTargetsInput
): Promise<ToolResponse> {
  try {
    listNotificationTargetsSchema.parse(input);

    const result = await client.request('/cluster/notifications/targets');

    let output = '📬 **Notification Targets**\n\n';

    if (Array.isArray(result) && result.length > 0) {
      for (const target of result) {
        output += `**${(target as any).name || 'N/A'}**\n`;
        output += `   • Type: ${(target as any).type || 'N/A'}\n`;
        output += `   • Origin: ${(target as any).origin || 'N/A'}\n`;
        if ((target as any).comment) {
          output += `   • Comment: ${(target as any).comment}\n`;
        }
        if ((target as any).disable !== undefined) {
          output += `   • Disabled: ${(target as any).disable ? 'Yes' : 'No'}\n`;
        }
        output += '\n';
      }
    } else {
      output += 'No notification targets found.\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'list notification targets');
  }
}

export async function getNotificationTarget(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNotificationTargetInput
): Promise<ToolResponse> {
  try {
    getNotificationTargetSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const path = `/cluster/notifications/endpoints/${input.type}/${encodedName}`;
    const result = await client.request(path) as any;

    let output = '📬 **Notification Target Details**\n\n';
    output += `**Name:** ${input.name}\n`;
    output += `**Type:** ${input.type}\n`;

    if (result.comment) {
      output += `**Comment:** ${result.comment}\n`;
    }
    if (result.disable !== undefined) {
      output += `**Disabled:** ${result.disable ? 'Yes' : 'No'}\n`;
    }

    if (input.type === 'smtp') {
      if (result.server) output += `**Server:** ${result.server}\n`;
      if (result.port) output += `**Port:** ${result.port}\n`;
      if (result.username) output += `**Username:** ${result.username}\n`;
      if (result.mailto) output += `**Mail To:** ${result.mailto}\n`;
      if (result['mailto-user']) output += `**Mail To User:** ${result['mailto-user']}\n`;
      if (result.from) output += `**From:** ${result.from}\n`;
      if (result.author) output += `**Author:** ${result.author}\n`;
      if (result.mode) output += `**Mode:** ${result.mode}\n`;
    } else if (input.type === 'gotify') {
      if (result.server) output += `**Server:** ${result.server}\n`;
    } else if (input.type === 'sendmail') {
      if (result.mailto) output += `**Mail To:** ${result.mailto}\n`;
      if (result['mailto-user']) output += `**Mail To User:** ${result['mailto-user']}\n`;
      if (result.from) output += `**From:** ${result.from}\n`;
      if (result.author) output += `**Author:** ${result.author}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'get notification target');
  }
}

export async function createNotificationTarget(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateNotificationTargetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create notification target');
    createNotificationTargetSchema.parse(input);

    const { type, ...payload } = input;
    const path = `/cluster/notifications/endpoints/${type}`;

    const result = await client.request(path, 'POST', payload);

    let output = '✅ **Notification Target Created**\n\n';
    output += `**Type:** ${type}\n`;
    output += `**Name:** ${input.name}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'create notification target');
  }
}

export async function deleteNotificationTarget(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteNotificationTargetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete notification target');
    deleteNotificationTargetSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const path = `/cluster/notifications/endpoints/${input.type}/${encodedName}`;
    const result = await client.request(path, 'DELETE');

    let output = '✅ **Notification Target Deleted**\n\n';
    output += `**Type:** ${input.type}\n`;
    output += `**Name:** ${input.name}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'delete notification target');
  }
}

export async function testNotificationTarget(
  client: ProxmoxApiClient,
  config: Config,
  input: TestNotificationTargetInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'test notification target');
    testNotificationTargetSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const path = `/cluster/notifications/targets/${encodedName}/test`;
    const result = await client.request(path, 'POST');

    let output = '✅ **Notification Target Test Sent**\n\n';
    output += `**Target:** ${input.name}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'test notification target');
  }
}
