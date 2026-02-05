import fs from 'node:fs';
import { Agent, type Dispatcher } from 'undici';
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
  private readonly dispatcher: Dispatcher;

  constructor(config: Config) {
    this.baseUrl = `https://${config.host}:${config.port}/api2/json`;
    this.authHeader = `PVEAPIToken=${config.user}!${config.tokenName}=${config.tokenValue}`;

    const connectOptions: { rejectUnauthorized?: boolean; ca?: Buffer } = {};

    switch (config.sslMode) {
      case 'strict':
        connectOptions.rejectUnauthorized = true;
        break;
      case 'verify':
        connectOptions.rejectUnauthorized = true;
        if (config.sslCaCert) {
          connectOptions.ca = fs.readFileSync(config.sslCaCert);
        }
        break;
      case 'insecure':
        connectOptions.rejectUnauthorized = false;
        break;
    }

    this.dispatcher = new Agent({ connect: connectOptions });
  }

  async request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
    };

    const options = {
      method,
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      dispatcher: this.dispatcher,
    } as unknown as RequestInit;

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
