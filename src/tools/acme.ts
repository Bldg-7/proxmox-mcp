import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  listAcmeAccountsSchema,
  getAcmeAccountSchema,
  createAcmeAccountSchema,
  updateAcmeAccountSchema,
  deleteAcmeAccountSchema,
  listAcmePluginsSchema,
  getAcmePluginSchema,
  getAcmeDirectoriesSchema,
} from '../schemas/acme.js';
import type {
  ListAcmeAccountsInput,
  GetAcmeAccountInput,
  CreateAcmeAccountInput,
  UpdateAcmeAccountInput,
  DeleteAcmeAccountInput,
  ListAcmePluginsInput,
  GetAcmePluginInput,
  GetAcmeDirectoriesInput,
} from '../schemas/acme.js';

export async function listAcmeAccounts(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListAcmeAccountsInput
): Promise<ToolResponse> {
  try {
    listAcmeAccountsSchema.parse(input);

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
  } catch (error) {
    return formatErrorResponse(error as Error, 'list ACME accounts');
  }
}

export async function getAcmeAccount(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetAcmeAccountInput
): Promise<ToolResponse> {
  try {
    getAcmeAccountSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const result = await client.request(`/cluster/acme/account/${encodedName}`) as any;

    let output = '🔐 **ACME Account Details**\n\n';
    output += `**Name:** ${input.name}\n`;
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
  } catch (error) {
    return formatErrorResponse(error as Error, 'get ACME account');
  }
}

export async function createAcmeAccount(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateAcmeAccountInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create ACME account');
    createAcmeAccountSchema.parse(input);

    const payload: Record<string, unknown> = {
      contact: input.contact,
    };

    if (input.name) {
      payload.name = input.name;
    }
    if (input.tos_url) {
      payload.tos_url = input.tos_url;
    }
    if (input.directory) {
      payload.directory = input.directory;
    }

    const result = await client.request('/cluster/acme/account', 'POST', payload);

    const safePayload = { ...payload, contact: '[REDACTED]' };

    let output = '✅ **ACME Account Created**\n\n';
    output += `**Payload:** ${JSON.stringify(safePayload, null, 2)}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'create ACME account');
  }
}

export async function updateAcmeAccount(
  client: ProxmoxApiClient,
  config: Config,
  input: UpdateAcmeAccountInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'update ACME account');
    updateAcmeAccountSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const payload: Record<string, unknown> = {};

    if (input.contact) {
      payload.contact = input.contact;
    }

    const result = await client.request(`/cluster/acme/account/${encodedName}`, 'PUT', payload);

    const safePayload = input.contact
      ? { ...payload, contact: '[REDACTED]' }
      : payload;

    let output = '✅ **ACME Account Updated**\n\n';
    output += `**Account:** ${input.name}\n`;
    output += `**Payload:** ${JSON.stringify(safePayload, null, 2)}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'update ACME account');
  }
}

export async function deleteAcmeAccount(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteAcmeAccountInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete ACME account');
    deleteAcmeAccountSchema.parse(input);

    const encodedName = encodeURIComponent(input.name);
    const result = await client.request(`/cluster/acme/account/${encodedName}`, 'DELETE');

    let output = '✅ **ACME Account Deleted**\n\n';
    output += `**Account:** ${input.name}\n`;
    output += `**Result:** ${JSON.stringify(result, null, 2)}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'delete ACME account');
  }
}

export async function listAcmePlugins(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListAcmePluginsInput
): Promise<ToolResponse> {
  try {
    listAcmePluginsSchema.parse(input);

    const result = await client.request('/cluster/acme/plugins');

    let output = '🔌 **ACME Plugins**\n\n';

    if (Array.isArray(result) && result.length > 0) {
      for (const plugin of result) {
        output += `**${(plugin as any).plugin || 'N/A'}**\n`;
        output += `   • Type: ${(plugin as any).type || 'N/A'}\n`;
        if ((plugin as any).api) {
          output += `   • API: ${(plugin as any).api}\n`;
        }
        if ((plugin as any).data) {
          output += `   • Data: ${(plugin as any).data}\n`;
        }
        output += '\n';
      }
    } else {
      output += 'No ACME plugins found.\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'list ACME plugins');
  }
}

export async function getAcmePlugin(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetAcmePluginInput
): Promise<ToolResponse> {
  try {
    getAcmePluginSchema.parse(input);

    const encodedId = encodeURIComponent(input.id);
    const result = await client.request(`/cluster/acme/plugins/${encodedId}`) as any;

    let output = '🔌 **ACME Plugin Details**\n\n';
    output += `**Plugin ID:** ${input.id}\n`;
    output += `**Type:** ${result.type || 'N/A'}\n`;

    if (result.api) {
      output += `**API:** ${result.api}\n`;
    }
    if (result.data) {
      output += `**Data:** ${result.data}\n`;
    }
    if (result.validation_delay) {
      output += `**Validation Delay:** ${result.validation_delay}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'get ACME plugin');
  }
}

export async function getAcmeDirectories(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetAcmeDirectoriesInput
): Promise<ToolResponse> {
  try {
    getAcmeDirectoriesSchema.parse(input);

    const result = await client.request('/cluster/acme/directories');

    let output = '📁 **ACME Directories**\n\n';

    if (Array.isArray(result) && result.length > 0) {
      for (const directory of result) {
        output += `**${(directory as any).name || 'N/A'}**\n`;
        output += `   • URL: ${(directory as any).url || 'N/A'}\n`;
        if ((directory as any).tos) {
          output += `   • TOS: ${(directory as any).tos}\n`;
        }
        output += '\n';
      }
    } else {
      output += 'No ACME directories found.\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'get ACME directories');
  }
}
