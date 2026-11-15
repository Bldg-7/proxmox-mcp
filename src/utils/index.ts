import pino, { type DestinationStream, type Logger, type LogFn } from 'pino';
import { format } from 'node:util';
import { sanitizeDiagnostic, sanitizeLogValue } from '../security/diagnostics.js';

/** Apply sanitization before pino serializes either structured fields or message arguments. */
export function createLogger(destination: DestinationStream): Logger {
  return pino({
    level: process.env.PROXMOX_LOG_LEVEL || 'info',
    hooks: {
      logMethod(args, method): void {
        // Format first so split arguments such as '--token %s', secret are masked together.
        if (typeof args[0] === 'string') {
          method.apply(this, [sanitizeDiagnostic(format(...args))]);
        } else if (typeof args[1] === 'string') {
          method.apply(this, [sanitizeLogValue(args[0]), sanitizeDiagnostic(format(...args.slice(1)))]);
        } else {
          method.apply(this, args.map(arg => sanitizeLogValue(arg)) as Parameters<LogFn>);
        }
      },
    },
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: { destination: 2 },
    } : undefined,
  }, destination);
}

// MCP uses stdout for JSON-RPC communication, so logs must go to stderr.
export const logger = createLogger(pino.destination(2));
