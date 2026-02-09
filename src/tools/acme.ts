import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { acmeAccountSchema, acmeInfoSchema } from '../schemas/acme.js';
import type { AcmeAccountInput, AcmeInfoInput } from '../schemas/acme.js';

export async function handleAcmeAccount(
  client: ProxmoxApiClient,
  config: Config,
  input: AcmeAccountInput
): Promise<ToolResponse> {
  try {
    const validated = acmeAccountSchema.parse(input);

    switch (validated.action) {
      case 'list': {
        const result = await client.request('/cluster/acme/account');

        let output = '🔐 **ACME Accounts**\n\n';

        if (Array.isArray(result) && result.length > 0) {
          for (const account of result) {
            output += `**${(account as any).name || 'N/A'}**\n`;
            output += `   • Directory: ${(account as any).directory || 'N/A'}\n`;
            output += `   • Location: ${(account as any).location || 'N/A'}\n`;
            output += `   • TOS: ${(account as any).tos || 'N/A'}\n\n`;
          }
        } else {
          output += 'No ACME accounts found.\n';
        }

        return formatToolResponse(output);
      }

      case 'get': {
        const encodedName = encodeURIComponent(validated.name);
        const result = await client.request(`/cluster/acme/account/${encodedName}`) as any;

        let output = '🔐 **ACME Account Details**\n\n';
        output += `**Name:** ${validated.name}\n`;
        output += `**Directory:** ${result.directory || 'N/A'}\n`;
        output += `**Location:** ${result.location || 'N/A'}\n`;
        output += `**TOS:** ${result.tos || 'N/A'}\n`;

        if (result.account) {
          output += '\n**Account Information:**\n';
          output += `   • Status: ${result.account.status || 'N/A'}\n`;
          if (result.account.contact && Array.isArray(result.account.contact)) {
            output += `   • Contact: ${result.account.contact.join(', ')}\n`;
          }
        }

        return formatToolResponse(output);
      }

      case 'create': {
        requireElevated(config, 'create ACME account');

        const payload: Record<string, unknown> = {
          contact: validated.contact,
        };
        if (validated.name) payload.name = validated.name;
        if (validated.tos_url) payload.tos_url = validated.tos_url;
        if (validated.directory) payload.directory = validated.directory;

        const result = await client.request('/cluster/acme/account', 'POST', payload);

        const safePayload = { ...payload, contact: '[REDACTED]' };

        let output = '✅ **ACME Account Created**\n\n';
        output += `**Payload:** ${JSON.stringify(safePayload, null, 2)}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }

      case 'update': {
        requireElevated(config, 'update ACME account');

        const encodedName = encodeURIComponent(validated.name);
        const payload: Record<string, unknown> = {};
        if (validated.contact) payload.contact = validated.contact;

        const result = await client.request(`/cluster/acme/account/${encodedName}`, 'PUT', payload);

        const safePayload = validated.contact
          ? { ...payload, contact: '[REDACTED]' }
          : payload;

        let output = '✅ **ACME Account Updated**\n\n';
        output += `**Account:** ${validated.name}\n`;
        output += `**Payload:** ${JSON.stringify(safePayload, null, 2)}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }

      case 'delete': {
        requireElevated(config, 'delete ACME account');

        const encodedName = encodeURIComponent(validated.name);
        const result = await client.request(`/cluster/acme/account/${encodedName}`, 'DELETE');

        let output = '✅ **ACME Account Deleted**\n\n';
        output += `**Account:** ${validated.name}\n`;
        output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

        return formatToolResponse(output);
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'ACME Account');
  }
}

export async function handleAcmeInfo(
  client: ProxmoxApiClient,
  _config: Config,
  input: AcmeInfoInput
): Promise<ToolResponse> {
  try {
    const validated = acmeInfoSchema.parse(input);

    switch (validated.action) {
      case 'list_plugins': {
        const result = await client.request('/cluster/acme/plugins');

        let output = '🔌 **ACME Plugins**\n\n';

        if (Array.isArray(result) && result.length > 0) {
          for (const plugin of result) {
            output += `**${(plugin as any).plugin || 'N/A'}**\n`;
            output += `   • Type: ${(plugin as any).type || 'N/A'}\n`;
            if ((plugin as any).api) output += `   • API: ${(plugin as any).api}\n`;
            if ((plugin as any).data) output += `   • Data: ${(plugin as any).data}\n`;
            output += '\n';
          }
        } else {
          output += 'No ACME plugins found.\n';
        }

        return formatToolResponse(output);
      }

      case 'get_plugin': {
        const encodedId = encodeURIComponent(validated.id);
        const result = await client.request(`/cluster/acme/plugins/${encodedId}`) as any;

        let output = '🔌 **ACME Plugin Details**\n\n';
        output += `**Plugin ID:** ${validated.id}\n`;
        output += `**Type:** ${result.type || 'N/A'}\n`;
        if (result.api) output += `**API:** ${result.api}\n`;
        if (result.data) output += `**Data:** ${result.data}\n`;
        if (result.validation_delay) output += `**Validation Delay:** ${result.validation_delay}\n`;

        return formatToolResponse(output);
      }

      case 'directories': {
        const result = await client.request('/cluster/acme/directories');

        let output = '📁 **ACME Directories**\n\n';

        if (Array.isArray(result) && result.length > 0) {
          for (const directory of result) {
            output += `**${(directory as any).name || 'N/A'}**\n`;
            output += `   • URL: ${(directory as any).url || 'N/A'}\n`;
            if ((directory as any).tos) output += `   • TOS: ${(directory as any).tos}\n`;
            output += '\n';
          }
        } else {
          output += 'No ACME directories found.\n';
        }

        return formatToolResponse(output);
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'ACME Info');
  }
}
