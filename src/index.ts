#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/index.js';
import { ProxmoxApiClient } from './client/proxmox.js';
import { createServer } from './server.js';
import { TOOL_NAMES } from './types/tools.js';
import { logger } from './utils/index.js';

export async function main(): Promise<void> {
  try {
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
      logger.warn(
        'NODE_TLS_REJECT_UNAUTHORIZED=0 disables TLS certificate verification for all HTTPS requests. Remove it and use PROXMOX_SSL_MODE/PROXMOX_SSL_CA_CERT instead.'
      );
    }

    // Load configuration from environment variables
    const config = loadConfig();
    logger.info('Configuration loaded successfully');

    // Create Proxmox API client
    const client = new ProxmoxApiClient(config);
    logger.info('Proxmox API client initialized');

    // Create MCP server with all tools registered
    const server = createServer(client, config);
    logger.info(`MCP server created with ${TOOL_NAMES.length} tools registered`);

    // Create stdio transport and connect server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('MCP server started on stdio transport');
  } catch (error) {
    logger.error({ error }, 'Fatal error during startup');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
main();
