import fs from 'node:fs';
import { Agent, type Dispatcher } from 'undici';
import type { Config } from '../config/schema.js';
import { logger } from '../utils/index.js';

const DEFAULT_TIMEOUT_MS = 30_000;

const encodeFormValue = (value: unknown): string => {
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
};

const toFormParams = (body: unknown): URLSearchParams => {
  if (body instanceof URLSearchParams) {
    return body;
  }

  const params = new URLSearchParams();
  if (!body || typeof body !== 'object') {
    return params;
  }

  for (const [key, rawValue] of Object.entries(body as Record<string, unknown>)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        params.append(key, encodeFormValue(item));
      }
      continue;
    }

    params.append(key, encodeFormValue(rawValue));
  }

  return params;
};

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
    const normalizedMethod = method.toUpperCase();
    let url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
    };

    const options = {
      method: normalizedMethod,
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      dispatcher: this.dispatcher,
    } as unknown as RequestInit;

    if (body !== undefined) {
      const params = toFormParams(body);
      if (normalizedMethod === 'DELETE') {
        const query = params.toString();
        if (query) {
          url += url.includes('?') ? `&${query}` : `?${query}`;
        }
      } else if (normalizedMethod === 'POST' || normalizedMethod === 'PUT') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = params.toString();
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    } else if (normalizedMethod === 'POST' || normalizedMethod === 'PUT') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
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
