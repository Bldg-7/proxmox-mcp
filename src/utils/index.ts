import pino from 'pino';

export const logger = pino({
  level: process.env.PROXMOX_LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
  } : undefined,
});
