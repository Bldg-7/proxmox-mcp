import https from 'node:https';
import fs from 'node:fs';
import type { Config } from '../config/schema.js';
import { logger } from '../utils/index.js';

const DEFAULT_TIMEOUT_MS = 30_000;

export class ProxmoxApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = 'ProxmoxApiError';
  }
}

export class ProxmoxApiClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly agent: https.Agent;

  constructor(config: Config) {
    this.baseUrl = `https://${config.host}:${config.port}/api2/json`;
    this.authHeader = `PVEAPIToken=${config.user}!${config.tokenName}=${config.tokenValue}`;

    if (config.sslVerify && config.sslCaCert) {
      this.agent = new https.Agent({
        ca: fs.readFileSync(config.sslCaCert),
      });
    } else if (config.sslVerify) {
      this.agent = new https.Agent({
        rejectUnauthorized: true,
      });
    } else {
      this.agent = new https.Agent({
        rejectUnauthorized: false,
      });
    }
  }

  async request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
    };

    const options: RequestInit & { dispatcher?: unknown } = {
      method,
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    };

    // Pass the HTTPS agent via the Node.js-specific dispatcher
    // Node's native fetch accepts an agent-like option
    (options as Record<string, unknown>)['agent'] = this.agent;

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    logger.debug({ method, endpoint }, 'Proxmox API request');

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ statusCode: response.status, endpoint, error: errorText }, 'Proxmox API error');
        throw new ProxmoxApiError(
          `Proxmox API error: ${response.status} - ${errorText}`,
          response.status,
          endpoint,
        );
      }

      const textResponse = await response.text();
      if (!textResponse.trim()) {
        throw new ProxmoxApiError('Empty response from Proxmox API', 0, endpoint);
      }

      const data = JSON.parse(textResponse) as { data: T };
      return data.data;
    } catch (error) {
      if (error instanceof ProxmoxApiError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new ProxmoxApiError(
          `Failed to parse Proxmox API response: ${error.message}`,
          0,
          endpoint,
        );
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new ProxmoxApiError(
        `Failed to connect to Proxmox: ${message}`,
        0,
        endpoint,
      );
    }
  }
}
