import pino from 'pino';

// MCP uses stdout for JSON-RPC communication, so logs must go to stderr
export const logger = pino({
  level: process.env.PROXMOX_LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { destination: 2 },
  } : undefined,
}, pino.destination(2));
