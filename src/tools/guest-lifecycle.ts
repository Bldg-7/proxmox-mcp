import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  startVM,
  startLxc,
  stopVM,
  stopLxc,
  rebootVM,
  rebootLxc,
  shutdownVM,
  shutdownLxc,
  deleteVM,
  deleteLxc,
  pauseVM,
  resumeVM,
} from './vm-lifecycle.js';
import {
  guestStartSchema,
  guestStopSchema,
  guestRebootSchema,
  guestShutdownSchema,
  guestDeleteSchema,
  guestPauseSchema,
  guestResumeSchema,
} from '../schemas/guest.js';
import type {
  GuestStartInput,
  GuestStopInput,
  GuestRebootInput,
  GuestShutdownInput,
  GuestDeleteInput,
  GuestPauseInput,
  GuestResumeInput,
} from '../schemas/guest.js';

export async function handleGuestStart(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestStartInput
): Promise<ToolResponse> {
  const validated = guestStartSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return startVM(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return startLxc(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestStop(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestStopInput
): Promise<ToolResponse> {
  const validated = guestStopSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return stopVM(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return stopLxc(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestReboot(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestRebootInput
): Promise<ToolResponse> {
  const validated = guestRebootSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return rebootVM(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return rebootLxc(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestShutdown(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestShutdownInput
): Promise<ToolResponse> {
  const validated = guestShutdownSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return shutdownVM(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return shutdownLxc(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestDelete(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestDeleteInput
): Promise<ToolResponse> {
  const validated = guestDeleteSchema.parse(input);
  switch (validated.type) {
    case 'vm':
      return deleteVM(client, config, { node: validated.node, vmid: validated.vmid });
    case 'lxc':
      return deleteLxc(client, config, { node: validated.node, vmid: validated.vmid });
    default:
      throw new Error(`Unknown type: ${(validated as { type: string }).type}`);
  }
}

export async function handleGuestPause(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestPauseInput
): Promise<ToolResponse> {
  const validated = guestPauseSchema.parse(input);
  return pauseVM(client, config, { node: validated.node, vmid: validated.vmid });
}

export async function handleGuestResume(
  client: ProxmoxApiClient,
  config: Config,
  input: GuestResumeInput
): Promise<ToolResponse> {
  const validated = guestResumeSchema.parse(input);
  return resumeVM(client, config, { node: validated.node, vmid: validated.vmid });
}
