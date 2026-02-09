import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  guestListSchema,
  guestStatusSchema,
  guestConfigSchema,
  guestPendingSchema,
  guestFeatureSchema,
  guestRrddataSchema,
} from '../schemas/guest.js';
import type {
  GuestListInput,
  GuestStatusInput,
  GuestConfigInput,
  GuestPendingInput,
  GuestFeatureInput,
  GuestRrddataInput,
} from '../schemas/guest.js';
import { getVMs, getVMStatus, getVMConfig, getLxcConfig, getVmPending, getLxcPending, checkVmFeature, checkLxcFeature } from './vm-query.js';
import { getVmRrddata, getLxcRrddata } from './vm-advanced.js';

export async function handleGuestList(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestListInput
): Promise<ToolResponse> {
  const validated = guestListSchema.parse(input);
  return getVMs(client, config, validated);
}

export async function handleGuestStatus(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestStatusInput
): Promise<ToolResponse> {
  const validated = guestStatusSchema.parse(input);
  const apiType = validated.type === 'vm' ? 'qemu' : 'lxc';
  return getVMStatus(client, config, { node: validated.node, vmid: validated.vmid, type: apiType });
}

export async function handleGuestConfig(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestConfigInput
): Promise<ToolResponse> {
  const validated = guestConfigSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return getVMConfig(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return getLxcConfig(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestPending(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestPendingInput
): Promise<ToolResponse> {
  const validated = guestPendingSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return getVmPending(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return getLxcPending(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestFeature(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestFeatureInput
): Promise<ToolResponse> {
  const validated = guestFeatureSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return checkVmFeature(client, config, { node: validated.node, vmid: validated.vmid, feature: validated.feature });
    case 'lxc':
      return checkLxcFeature(client, config, { node: validated.node, vmid: validated.vmid, feature: validated.feature });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestRrddata(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestRrddataInput
): Promise<ToolResponse> {
  const validated = guestRrddataSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return getVmRrddata(client, config, { node: validated.node, vmid: validated.vmid, timeframe: validated.timeframe, cf: validated.cf });
    case 'lxc':
      return getLxcRrddata(client, config, { node: validated.node, vmid: validated.vmid, timeframe: validated.timeframe, cf: validated.cf });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}
