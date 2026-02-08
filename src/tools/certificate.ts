import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName } from '../validators/index.js';
import {
  getNodeCertificatesSchema,
  uploadCustomCertificateSchema,
  deleteCustomCertificateSchema,
  orderAcmeCertificateSchema,
  renewAcmeCertificateSchema,
  revokeAcmeCertificateSchema,
  getNodeAcmeConfigSchema,
} from '../schemas/certificate.js';
import type {
  GetNodeCertificatesInput,
  UploadCustomCertificateInput,
  DeleteCustomCertificateInput,
  OrderAcmeCertificateInput,
  RenewAcmeCertificateInput,
  RevokeAcmeCertificateInput,
  GetNodeAcmeConfigInput,
} from '../schemas/certificate.js';

export async function getNodeCertificates(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeCertificatesInput
): Promise<ToolResponse> {
  try {
    getNodeCertificatesSchema.parse(input);
    validateNodeName(input.node);

    const result = await client.request(`/nodes/${input.node}/certificates/info`);

    let output = '🔒 **Node Certificates**\n\n';
    output += `**Node:** ${input.node}\n\n`;

    if (Array.isArray(result)) {
      for (const cert of result) {
        output += `**Certificate:**\n`;
        output += `   • Subject: ${cert.subject || 'N/A'}\n`;
        output += `   • Issuer: ${cert.issuer || 'N/A'}\n`;
        output += `   • Not Before: ${cert.notbefore ? new Date(cert.notbefore * 1000).toISOString() : 'N/A'}\n`;
        output += `   • Not After: ${cert.notafter ? new Date(cert.notafter * 1000).toISOString() : 'N/A'}\n`;
        output += `   • Fingerprint: ${cert.fingerprint || 'N/A'}\n`;
        output += `   • Public Key Type: ${cert['public-key-type'] || 'N/A'}\n`;
        output += `   • Public Key Bits: ${cert['public-key-bits'] || 'N/A'}\n`;
        output += `   • SAN: ${cert.san?.join(', ') || 'N/A'}\n\n`;
      }
    } else {
      output += 'No certificate information available.\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node Certificates');
  }
}

export async function uploadCustomCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: UploadCustomCertificateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'upload custom SSL certificate');

    uploadCustomCertificateSchema.parse(input);
    validateNodeName(input.node);

    const params: Record<string, string | boolean> = {
      certificates: input.certificates,
    };

    if (input.key !== undefined) {
      params.key = input.key;
    }
    if (input.force !== undefined) {
      params.force = input.force;
    }
    if (input.restart !== undefined) {
      params.restart = input.restart;
    }

    await client.request(`/nodes/${input.node}/certificates/custom`, 'POST', params);

    let output = '✅ **Custom Certificate Uploaded**\n\n';
    output += `**Node:** ${input.node}\n`;
    output += `**Force:** ${input.force || false}\n`;
    output += `**Restart:** ${input.restart || false}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Upload Custom Certificate');
  }
}

export async function deleteCustomCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: DeleteCustomCertificateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'delete custom SSL certificate');

    deleteCustomCertificateSchema.parse(input);
    validateNodeName(input.node);

    await client.request(`/nodes/${input.node}/certificates/custom`, 'DELETE');

    let output = '✅ **Custom Certificate Deleted**\n\n';
    output += `**Node:** ${input.node}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Delete Custom Certificate');
  }
}

export async function orderAcmeCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: OrderAcmeCertificateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'order ACME certificate');

    orderAcmeCertificateSchema.parse(input);
    validateNodeName(input.node);

    const params: Record<string, boolean> = {};
    if (input.force !== undefined) {
      params.force = input.force;
    }

    const result = await client.request(`/nodes/${input.node}/certificates/acme/certificate`, 'POST', params);

    let output = '✅ **ACME Certificate Ordered**\n\n';
    output += `**Node:** ${input.node}\n`;
    output += `**Force:** ${input.force || false}\n`;
    if (result && typeof result === 'string') {
      output += `**Task UPID:** ${result}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Order ACME Certificate');
  }
}

export async function renewAcmeCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: RenewAcmeCertificateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'renew ACME certificate');

    renewAcmeCertificateSchema.parse(input);
    validateNodeName(input.node);

    const params: Record<string, boolean> = {};
    if (input.force !== undefined) {
      params.force = input.force;
    }

    const result = await client.request(`/nodes/${input.node}/certificates/acme/certificate`, 'PUT', params);

    let output = '✅ **ACME Certificate Renewed**\n\n';
    output += `**Node:** ${input.node}\n`;
    output += `**Force:** ${input.force || false}\n`;
    if (result && typeof result === 'string') {
      output += `**Task UPID:** ${result}\n`;
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Renew ACME Certificate');
  }
}

export async function revokeAcmeCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: RevokeAcmeCertificateInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'revoke ACME certificate');

    revokeAcmeCertificateSchema.parse(input);
    validateNodeName(input.node);

    await client.request(`/nodes/${input.node}/certificates/acme/certificate`, 'DELETE');

    let output = '✅ **ACME Certificate Revoked**\n\n';
    output += `**Node:** ${input.node}\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Revoke ACME Certificate');
  }
}

export async function getNodeAcmeConfig(
  client: ProxmoxApiClient,
  _config: Config,
  input: GetNodeAcmeConfigInput
): Promise<ToolResponse> {
  try {
    getNodeAcmeConfigSchema.parse(input);
    validateNodeName(input.node);

    const result = await client.request(`/nodes/${input.node}/certificates/acme`);

    let output = '🔒 **Node ACME Configuration**\n\n';
    output += `**Node:** ${input.node}\n\n`;

    if (result && typeof result === 'object') {
      const config = result as Record<string, unknown>;
      output += `**Account:** ${config.account || 'N/A'}\n`;
      output += `**Domains:** ${Array.isArray(config.domains) ? config.domains.join(', ') : 'N/A'}\n`;
      output += `**Plugin:** ${config.plugin || 'N/A'}\n`;
    } else {
      output += 'No ACME configuration available.\n';
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Get Node ACME Config');
  }
}
