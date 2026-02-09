import type { ProxmoxApiClient } from '../client/proxmox.js';
import type { Config } from '../config/index.js';
import type { ToolResponse } from '../types/index.js';
import {
  formatToolResponse,
  formatErrorResponse,
} from '../formatters/index.js';
import { requireElevated } from '../middleware/index.js';
import {
  validateNodeName,
  validateVMID,
  validateStorageName,
  generateSecurePassword,
} from '../validators/index.js';
import {
  listTemplatesSchema,
  createLxcSchema,
  createVmSchema,
} from '../schemas/vm.js';
import type {
  ListTemplatesInput,
  CreateLxcInput,
  CreateVmInput,
} from '../schemas/vm.js';

export async function listTemplates(
  client: ProxmoxApiClient,
  _config: Config,
  input: ListTemplatesInput
): Promise<ToolResponse> {
  try {
    const validated = listTemplatesSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeStorage = validateStorageName(validated.storage);

    const templates = (await client.request(
      `/nodes/${safeNode}/storage/${safeStorage}/content?content=vztmpl`,
      'GET'
    )) as Array<{ volid: string; size?: number }>;

    let output = '📋 **Available LXC Templates**\n\n';

    if (!templates || templates.length === 0) {
      output += `No templates found on storage \`${safeStorage}\`.\n\n`;
      output += `**Tip**: Download templates in Proxmox:\n`;
      output += `1. Go to your node → Storage → ${safeStorage}\n`;
      output += `2. Click "CT Templates"\n`;
      output += `3. Download a template (e.g., Debian, Ubuntu)\n`;
    } else {
      for (const template of templates) {
        const size = template.size
          ? formatBytes(template.size)
          : 'N/A';
        output += `• **${template.volid}**\n`;
        output += `  Size: ${size}\n\n`;
      }
    }

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'List Templates');
  }
}

export async function createLxc(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateLxcInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create LXC container');

    const validated = createLxcSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const password = validated.password || generateSecurePassword();
    const isPasswordGenerated = !validated.password;

    const body: Record<string, string | number> = {
      vmid: parseInt(safeVmid, 10),
      ostemplate: validated.ostemplate,
      hostname: validated.hostname || `lxc-${safeVmid}`,
      password,
      memory: validated.memory || 512,
      storage: validated.storage || 'local-lvm',
      rootfs: `${validated.storage || 'local-lvm'}:${validated.rootfs || 8}`,
    };

    if (validated.net0) body.net0 = validated.net0;

    const result = await client.request(
      `/nodes/${safeNode}/lxc`,
      'POST',
      body
    );

    let output =
      `📦 **LXC Container Creation Started**\n\n` +
      `• **Container ID**: ${safeVmid}\n` +
      `• **Hostname**: ${body.hostname}\n` +
      `• **Template**: ${validated.ostemplate}\n` +
      `• **Memory**: ${body.memory} MB\n` +
      `• **Storage**: ${body.storage}\n` +
      `• **Root FS**: ${body.rootfs}\n` +
      (validated.net0 ? `• **Network**: ${validated.net0}\n` : '');

    if (isPasswordGenerated) {
      output += `• **🔐 Generated Password**: \`${password}\`\n`;
      output += `  ⚠️ **SAVE THIS PASSWORD** - it will not be shown again!\n`;
    }

    output +=
      `• **Task ID**: ${result}\n\n` +
      `**Next steps**:\n` +
      `1. Wait a moment for container to be created\n` +
      `2. Start it with \`proxmox_guest_start\` (type='lxc')\n` +
      `3. View status with \`proxmox_guest_status\` (type='lxc')\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create LXC Container');
  }
}

export async function createVM(
  client: ProxmoxApiClient,
  config: Config,
  input: CreateVmInput
): Promise<ToolResponse> {
  try {
    requireElevated(config, 'create QEMU VM');

    const validated = createVmSchema.parse(input);
    const safeNode = validateNodeName(validated.node);
    const safeVmid = validateVMID(validated.vmid);

    const storage = validated.storage || 'local-lvm';
    const diskSize = validated.disk_size || '8G';
    const sizeValue = diskSize.replace(/[^0-9]/g, '');

    const body: Record<string, string | number> = {
      vmid: parseInt(safeVmid, 10),
      name: validated.name || `vm-${safeVmid}`,
      memory: validated.memory || 512,
      cores: validated.cores || 1,
      sockets: validated.sockets || 1,
      ostype: validated.ostype || 'l26',
      net0: validated.net0 || 'virtio,bridge=vmbr0',
      scsi0: `${storage}:${sizeValue}`,
    };

    if (validated.iso) {
      body.ide2 = `${validated.iso},media=cdrom`;
      body.boot = 'order=ide2;scsi0';
    }

    const result = await client.request(
      `/nodes/${safeNode}/qemu`,
      'POST',
      body
    );

    let output =
      `🖥️ **QEMU VM Creation Started**\n\n` +
      `• **VM ID**: ${safeVmid}\n` +
      `• **Name**: ${body.name}\n` +
      `• **Memory**: ${body.memory} MB\n` +
      `• **CPU**: ${body.sockets} socket(s), ${body.cores} core(s)\n` +
      `• **Disk**: ${body.scsi0}\n` +
      `• **Network**: ${body.net0}\n`;

    if (validated.iso) {
      output += `• **ISO**: ${validated.iso}\n`;
    }

    output +=
      `• **Task ID**: ${result}\n\n` +
      `**Next steps**:\n` +
      `1. Wait a moment for VM to be created\n` +
      `2. Start it with \`proxmox_guest_start\` (type='vm')\n` +
      `3. View status with \`proxmox_guest_status\` (type='vm')\n`;

    return formatToolResponse(output);
  } catch (error) {
    return formatErrorResponse(error as Error, 'Create QEMU VM');
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
