import type { z } from 'zod';
import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { TransferJobs } from '../transfers/job-service.js';
import type { transferControlSchema } from '../schemas/storage-management.js';
import type { ToolResponse } from '../types/index.js';
import { requireElevated } from '../middleware/index.js';
import { formatToolResponse } from '../formatters/index.js';

export function requireTransfers(config: Config, jobs?: TransferJobs): TransferJobs {
  requireElevated(config, 'local file transfer');
  if (!config.fileTransfer || !jobs) throw new Error('Local file transfers are not enabled on this server');
  return jobs;
}

export async function handleFileTransfer(_client: ProxmoxApiClient, config: Config,
  input: z.infer<typeof transferControlSchema>, jobs?: TransferJobs): Promise<ToolResponse> {
  const service = requireTransfers(config, jobs);
  const status = input.action === 'cancel' ? await service.cancel(input.id) : service.status(input.id);
  return formatToolResponse(JSON.stringify(status));
}
