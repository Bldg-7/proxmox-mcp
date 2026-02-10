import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import { nodeDiskSchema } from '../schemas/node.js';
import type { NodeDiskInput } from '../schemas/node.js';
import {
  getNodeDisks,
  getDiskSmart,
  getNodeLvm,
  getNodeZfs,
  getNodeLvmThin,
  getNodeDirectory,
} from './disk.js';

export async function handleNodeDisk(
  client: ProxmoxApiClient,
  config: Config,
  input: NodeDiskInput
): Promise<ToolResponse> {
  const validated = nodeDiskSchema.parse(input);

  switch (validated.action) {
    case 'list':
      return getNodeDisks(client, config, {
        node: validated.node,
        include_partitions: validated.include_partitions,
        skip_smart: validated.skip_smart,
        type: validated.type,
      });
    case 'smart':
      return getDiskSmart(client, config, {
        node: validated.node,
        disk: validated.disk,
        health_only: validated.health_only,
      });
    case 'lvm':
      return getNodeLvm(client, config, {
        node: validated.node,
      });
    case 'zfs':
      return getNodeZfs(client, config, {
        node: validated.node,
      });
    case 'lvmthin':
      return getNodeLvmThin(client, config, {
        node: validated.node,
      });
    case 'directory':
      return getNodeDirectory(client, config, {
        node: validated.node,
      });
    default:
      throw new Error(`Unknown action: ${(validated as { action: string }).action}`);
  }
}
