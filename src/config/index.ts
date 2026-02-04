import dotenv from 'dotenv';
import { configSchema, type Config } from './schema.js';

export { type Config } from './schema.js';

export function loadConfig(): Config {
  dotenv.config();

  const rawConfig = {
    host: process.env.PROXMOX_HOST,
    port: process.env.PROXMOX_PORT ? parseInt(process.env.PROXMOX_PORT, 10) : undefined,
    user: process.env.PROXMOX_USER || undefined,
    tokenName: process.env.PROXMOX_TOKEN_NAME,
    tokenValue: process.env.PROXMOX_TOKEN_VALUE,
    allowElevated: process.env.PROXMOX_ALLOW_ELEVATED === 'true',
    sslVerify: process.env.PROXMOX_SSL_VERIFY === 'true',
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
