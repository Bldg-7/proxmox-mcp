import { z } from 'zod';

const baseConsoleSchema = z.object({
  node: z.string().min(1).describe('Node name where the guest is located'),
  vmid: z.coerce.number().describe('VM or container ID'),
});

// proxmox_get_vnc_proxy - Get VNC proxy ticket for a QEMU VM
export const getVncProxySchema = baseConsoleSchema;
export type GetVncProxyInput = z.input<typeof getVncProxySchema>;

// proxmox_get_spice_proxy - Get SPICE proxy ticket for a QEMU VM
export const getSpiceProxySchema = baseConsoleSchema;
export type GetSpiceProxyInput = z.input<typeof getSpiceProxySchema>;

// proxmox_get_term_proxy - Get terminal proxy ticket for a QEMU VM
export const getTermProxySchema = baseConsoleSchema;
export type GetTermProxyInput = z.input<typeof getTermProxySchema>;

// proxmox_get_lxc_vnc_proxy - Get VNC proxy ticket for an LXC container
export const getLxcVncProxySchema = baseConsoleSchema;
export type GetLxcVncProxyInput = z.input<typeof getLxcVncProxySchema>;

// proxmox_get_lxc_term_proxy - Get terminal proxy ticket for an LXC container
export const getLxcTermProxySchema = baseConsoleSchema;
export type GetLxcTermProxyInput = z.input<typeof getLxcTermProxySchema>;
