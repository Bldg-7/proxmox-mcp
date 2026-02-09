import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { notificationSchema } from '../schemas/notifications.js';
import type { NotificationInput } from '../schemas/notifications.js';

export async function handleNotification(
  client: ProxmoxApiClient,
  config: Config,
  input: NotificationInput
): Promise<ToolResponse> {
  try {
    const validated = notificationSchema.parse(input);

    switch (validated.action) {
      case 'list': {
        const result = await client.request('/cluster/notifications/targets');

        let output = '📬 **Notification Targets**\n\n';

        if (Array.isArray(result) && result.length > 0) {
          for (const target of result) {
            output += `**${(target as any).name || 'N/A'}**\n`;
            output += `   • Type: ${(target as any).type || 'N/A'}\n`;
            output += `   • Origin: ${(target as any).origin || 'N/A'}\n`;
            if ((target as any).comment) output += `   • Comment: ${(target as any).comment}\n`;
            if ((target as any).disable !== undefined) {
              output += `   • Disabled: ${(target as any).disable ? 'Yes' : 'No'}\n`;
            }
            output += '\n';
          }
        } else {
          output += 'No notification targets found.\n';
        }

        return formatToolResponse(output);
      }

      case 'get': {
        const encodedName = encodeURIComponent(validated.name);
        const path = `/cluster/notifications/endpoints/${validated.target_type}/${encodedName}`;
        const result = await client.request(path) as any;

        let output = '📬 **Notification Target Details**\n\n';
        output += `**Name:** ${validated.name}\n`;
        output += `**Type:** ${validated.target_type}\n`;

        if (result.comment) output += `**Comment:** ${result.comment}\n`;
        if (result.disable !== undefined) output += `**Disabled:** ${result.disable ? 'Yes' : 'No'}\n`;

        if (validated.target_type === 'smtp') {
          if (result.server) output += `**Server:** ${result.server}\n`;
          if (result.port) output += `**Port:** ${result.port}\n`;
          if (result.username) output += `**Username:** ${result.username}\n`;
          if (result.mailto) output += `**Mail To:** ${result.mailto}\n`;
          if (result['mailto-user']) output += `**Mail To User:** ${result['mailto-user']}\n`;
          if (result.from) output += `**From:** ${result.from}\n`;
          if (result.author) output += `**Author:** ${result.author}\n`;
          if (result.mode) output += `**Mode:** ${result.mode}\n`;
        } else if (validated.target_type === 'gotify') {
          if (result.server) output += `**Server:** ${result.server}\n`;
        } else if (validated.target_type === 'sendmail') {
          if (result.mailto) output += `**Mail To:** ${result.mailto}\n`;
          if (result['mailto-user']) output += `**Mail To User:** ${result['mailto-user']}\n`;
          if (result.from) output += `**From:** ${result.from}\n`;
          if (result.author) output += `**Author:** ${result.author}\n`;
        }

        return formatToolResponse(output);
      }

      case 'create': {
        requireElevated(config, 'create notification target');

        const { action: _action, target_type, ...payload } = validated;
        const path = `/cluster/notifications/endpoints/${target_type}`;

        const result = await client.request(path, 'POST', payload);

        let output = '✅ **Notification Target Created**\n\n';
        output += `**Type:** ${target_type}\n`;
        output += `**Name:** ${validated.name}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }

      case 'delete': {
        requireElevated(config, 'delete notification target');

        const encodedName = encodeURIComponent(validated.name);
        const path = `/cluster/notifications/endpoints/${validated.target_type}/${encodedName}`;
        const result = await client.request(path, 'DELETE');

        let output = '✅ **Notification Target Deleted**\n\n';
        output += `**Type:** ${validated.target_type}\n`;
        output += `**Name:** ${validated.name}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }

      case 'test': {
        requireElevated(config, 'test notification target');

        const encodedName = encodeURIComponent(validated.name);
        const path = `/cluster/notifications/targets/${encodedName}/test`;
        const result = await client.request(path, 'POST');

        let output = '✅ **Notification Target Test Sent**\n\n';
        output += `**Target:** ${validated.name}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Notification');
  }
}
