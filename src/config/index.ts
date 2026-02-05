import dotenv from 'dotenv';
import { configSchema, sslModeSchema, type Config, type SslMode } from './schema.js';

export { type Config, type SslMode } from './schema.js';

function parseSslMode(value: string | undefined): SslMode {
  if (!value) return 'strict';
  
  const result = sslModeSchema.safeParse(value.toLowerCase());
  if (result.success) {
    return result.data;
  }
  
  return 'strict';
}

export function loadConfig(): Config {
  dotenv.config();

  const rawConfig = {
    host: process.env.PROXMOX_HOST,
    port: process.env.PROXMOX_PORT ? parseInt(process.env.PROXMOX_PORT, 10) : undefined,
    user: process.env.PROXMOX_USER || undefined,
    tokenName: process.env.PROXMOX_TOKEN_NAME,
    tokenValue: process.env.PROXMOX_TOKEN_VALUE,
    allowElevated: process.env.PROXMOX_ALLOW_ELEVATED === 'true',
    sslMode: parseSslMode(process.env.PROXMOX_SSL_MODE),
    sslCaCert: process.env.PROXMOX_SSL_CA_CERT || undefined,
  };

  const result = configSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${errors}`);
  }

  return result.data;
}
