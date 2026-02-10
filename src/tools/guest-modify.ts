import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  cloneVM,
  cloneLxc,
  resizeVM,
  resizeLxc,
  updateVmConfig,
  updateLxcConfig,
} from './vm-modify.js';
import {
  migrateVm,
  migrateLxc,
  createTemplateVm,
  createTemplateLxc,
} from './vm-advanced.js';
import {
  guestCloneSchema,
  guestResizeSchema,
  guestConfigUpdateSchema,
  guestMigrateSchema,
  guestTemplateSchema,
} from '../schemas/guest.js';
import type {
  GuestCloneInput,
  GuestResizeInput,
  GuestConfigUpdateInput,
  GuestMigrateInput,
  GuestTemplateInput,
} from '../schemas/guest.js';

export async function handleGuestClone(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestCloneInput
): Promise<ToolResponse> {
  const validated = guestCloneSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return cloneVM(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        newid: validated.newid,
        name: validated.name,
      });
    case 'lxc':
      return cloneLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        newid: validated.newid,
        hostname: validated.hostname,
      });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestResize(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestResizeInput
): Promise<ToolResponse> {
  const validated = guestResizeSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return resizeVM(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        memory: validated.memory,
        cores: validated.cores,
      });
    case 'lxc':
      return resizeLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        memory: validated.memory,
        cores: validated.cores,
      });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestConfigUpdate(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestConfigUpdateInput
): Promise<ToolResponse> {
  const validated = guestConfigUpdateSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return updateVmConfig(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        config: validated.config,
        delete: validated.delete,
      });
    case 'lxc':
      return updateLxcConfig(client, config, {
        node: validated.node,
        vmid: validated.vmid,
        config: validated.config,
        delete: validated.delete,
      });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestMigrate(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestMigrateInput
): Promise<ToolResponse> {
  const validated = guestMigrateSchema.parse(input);
  const migrateInput = {
    node: validated.node,
    vmid: validated.vmid,
    target: validated.target,
    online: validated.online,
    force: validated.force,
    bwlimit: validated.bwlimit,
    'with-local-disks': validated['with-local-disks'],
    'with-local-storage': validated['with-local-storage'],
  };

  switch (validated.type) {
    case 'vm':
      return migrateVm(client, config, migrateInput);
    case 'lxc':
      return migrateLxc(client, config, migrateInput);
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestTemplate(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestTemplateInput
): Promise<ToolResponse> {
  const validated = guestTemplateSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return createTemplateVm(client, config, {
        node: validated.node,
        vmid: validated.vmid,
      });
    case 'lxc':
      return createTemplateLxc(client, config, {
        node: validated.node,
        vmid: validated.vmid,
      });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}
