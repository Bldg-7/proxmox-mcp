import type { Config } from './config/index.js';
import { ProxmoxApiClient } from './client/proxmox.js';
import { createServer } from './server.js';
import type { TransferJobs } from './transfers/job-service.js';
import { logger } from './utils/index.js';

interface ServerRuntime { server: ReturnType<typeof createServer>; close(): Promise<void> }

/** Owns the client and (only when explicitly configured) one transfer journal for this server. */
export async function createServerRuntime(config: Config, client = new ProxmoxApiClient(config)): Promise<ServerRuntime> {
  let jobs: TransferJobs | undefined;
  let releasing: Promise<void> | undefined;
  const release = (): Promise<void> => releasing ??= Promise.resolve(jobs?.close()).finally(() => client.close());
  try {
    if (config.fileTransfer) {
      const { TransferJobs } = await import('./transfers/job-service.js');
      const {timeoutSeconds, ...policy} = config.fileTransfer;
      jobs = await TransferJobs.open({...policy, enabled:true, allowElevated:config.allowElevated,
        serverIdentity:JSON.stringify([config.host,config.port,config.user,config.tokenName]),
        timeoutMs:timeoutSeconds === undefined ? undefined : timeoutSeconds * 1000}, client.storageTransfer);
    }
    const server = createServer(client, config, jobs);
    server.onclose = (): void => { void release().catch(error => logger.error({error}, 'Server cleanup failed')); };
    let closing: Promise<void> | undefined;
    return { server, close: () => closing ??= server.close().finally(release) };
  } catch (error) { await release(); throw error; }
}
