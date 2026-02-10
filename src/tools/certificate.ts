import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import { validateNodeName } from '../validators/index.js';
import { certificateSchema, acmeCertSchema } from '../schemas/certificate.js';
import type { CertificateInput, AcmeCertInput } from '../schemas/certificate.js';

export async function handleCertificate(
  client: ProxmoxApiClient,
  config: Config,
  input: CertificateInput
): Promise<ToolResponse> {
  try {
    const validated = certificateSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    switch (validated.action) {
      case 'list': {
        const result = await client.request(`/nodes/${safeNode}/certificates/info`);

        let output = '🔒 **Node Certificates**\n\n';
        output += `**Node:** ${safeNode}\n\n`;

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
      }

      case 'upload': {
        requireElevated(config, 'upload custom SSL certificate');

        const params: Record<string, string | boolean> = {
          certificates: validated.certificates,
        };
        if (validated.key !== undefined) params.key = validated.key;
        if (validated.force !== undefined) params.force = validated.force;
        if (validated.restart !== undefined) params.restart = validated.restart;

        await client.request(`/nodes/${safeNode}/certificates/custom`, 'POST', params);

        let output = '✅ **Custom Certificate Uploaded**\n\n';
        output += `**Node:** ${safeNode}\n`;
        output += `**Force:** ${validated.force || false}\n`;
        output += `**Restart:** ${validated.restart || false}\n`;

        return formatToolResponse(output);
      }

      case 'delete': {
        requireElevated(config, 'delete custom SSL certificate');

        await client.request(`/nodes/${safeNode}/certificates/custom`, 'DELETE');

        let output = '✅ **Custom Certificate Deleted**\n\n';
        output += `**Node:** ${safeNode}\n`;

        return formatToolResponse(output);
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'Certificate');
  }
}

export async function handleAcmeCert(
  client: ProxmoxApiClient,
  config: Config,
  input: AcmeCertInput
): Promise<ToolResponse> {
  try {
    const validated = acmeCertSchema.parse(input);
    const safeNode = validateNodeName(validated.node);

    switch (validated.action) {
      case 'order': {
        requireElevated(config, 'order ACME certificate');

        const params: Record<string, boolean> = {};
        if (validated.force !== undefined) params.force = validated.force;

        const result = await client.request(
          `/nodes/${safeNode}/certificates/acme/certificate`,
          'POST',
          params
        );

        let output = '✅ **ACME Certificate Ordered**\n\n';
        output += `**Node:** ${safeNode}\n`;
        output += `**Force:** ${validated.force || false}\n`;
        if (result && typeof result === 'string') {
          output += `**Task UPID:** ${result}\n`;
        }

        return formatToolResponse(output);
      }

      case 'renew': {
        requireElevated(config, 'renew ACME certificate');

        const params: Record<string, boolean> = {};
        if (validated.force !== undefined) params.force = validated.force;

        const result = await client.request(
          `/nodes/${safeNode}/certificates/acme/certificate`,
          'PUT',
          params
        );

        let output = '✅ **ACME Certificate Renewed**\n\n';
        output += `**Node:** ${safeNode}\n`;
        output += `**Force:** ${validated.force || false}\n`;
        if (result && typeof result === 'string') {
          output += `**Task UPID:** ${result}\n`;
        }

        return formatToolResponse(output);
      }

      case 'revoke': {
        requireElevated(config, 'revoke ACME certificate');

        await client.request(
          `/nodes/${safeNode}/certificates/acme/certificate`,
          'DELETE'
        );

        let output = '✅ **ACME Certificate Revoked**\n\n';
        output += `**Node:** ${safeNode}\n`;

        return formatToolResponse(output);
      }

      case 'config': {
        const result = await client.request(`/nodes/${safeNode}/certificates/acme`);

        let output = '🔒 **Node ACME Configuration**\n\n';
        output += `**Node:** ${safeNode}\n\n`;

        if (result && typeof result === 'object') {
          const acmeConfig = result as Record<string, unknown>;
          output += `**Account:** ${acmeConfig.account || 'N/A'}\n`;
          output += `**Domains:** ${Array.isArray(acmeConfig.domains) ? acmeConfig.domains.join(', ') : 'N/A'}\n`;
          output += `**Plugin:** ${acmeConfig.plugin || 'N/A'}\n`;
        } else {
          output += 'No ACME configuration available.\n';
        }

        return formatToolResponse(output);
      }
    }
  } catch (error) {
    return formatErrorResponse(error as Error, 'ACME Certificate');
  }
}
