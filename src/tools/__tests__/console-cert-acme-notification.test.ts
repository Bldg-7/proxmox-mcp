import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProxmoxApiClient } from '../../client/proxmox.js';
import type { Config } from '../../config/index.js';

// Import consolidated handlers (will be created)
import { handleConsoleVnc, handleConsoleTerm } from '../console-access.js';
import { getSpiceProxy } from '../console-access.js';
import { handleCloudInit } from '../cloud-init.js';
import { handleCertificate, handleAcmeCert } from '../certificate.js';
import { handleAcmeAccount, handleAcmeInfo } from '../acme.js';
import { handleNotification } from '../notifications.js';

// Mock client and config
const mockClient = {
  request: vi.fn(),
} as unknown as ProxmoxApiClient;

const mockConfig = {
  allowElevated: true,
} as unknown as Config;

const mockConfigNoElevated = {
  allowElevated: false,
} as unknown as Config;

describe('Console, Cloud-Init, Cert, ACME, Notification Consolidation (Wave 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // CONSOLE ACCESS
  // ============================================================
  describe('handleConsoleVnc (proxmox_console_vnc)', () => {
    it('should get VNC proxy for VM (type=vm)', async () => {
      (mockClient.request as any).mockResolvedValue({ ticket: 'abc', port: 5900 });

      const result = await handleConsoleVnc(mockClient, mockConfig, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VNC Proxy');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/vncproxy',
        'POST'
      );
    });

    it('should get VNC proxy for LXC (type=lxc)', async () => {
      (mockClient.request as any).mockResolvedValue({ ticket: 'def', port: 5901 });

      const result = await handleConsoleVnc(mockClient, mockConfig, {
        type: 'lxc',
        node: 'pve2',
        vmid: 200,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('VNC Proxy');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve2/lxc/200/vncproxy',
        'POST'
      );
    });

    it('should require elevated permissions', async () => {
      const result = await handleConsoleVnc(mockClient, mockConfigNoElevated, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('handleConsoleTerm (proxmox_console_term)', () => {
    it('should get terminal proxy for VM (type=vm)', async () => {
      (mockClient.request as any).mockResolvedValue({ ticket: 'abc' });

      const result = await handleConsoleTerm(mockClient, mockConfig, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Terminal Proxy');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/termproxy',
        'POST'
      );
    });

    it('should get terminal proxy for LXC (type=lxc)', async () => {
      (mockClient.request as any).mockResolvedValue({ ticket: 'def' });

      const result = await handleConsoleTerm(mockClient, mockConfig, {
        type: 'lxc',
        node: 'pve2',
        vmid: 200,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Terminal Proxy');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve2/lxc/200/termproxy',
        'POST'
      );
    });

    it('should require elevated permissions', async () => {
      const result = await handleConsoleTerm(mockClient, mockConfigNoElevated, {
        type: 'vm',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('getSpiceProxy (proxmox_get_spice_proxy) - singleton', () => {
    it('should get SPICE proxy for VM', async () => {
      (mockClient.request as any).mockResolvedValue({ ticket: 'spice-abc' });

      const result = await getSpiceProxy(mockClient, mockConfig, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('SPICE Proxy');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/spiceproxy',
        'POST'
      );
    });

    it('should require elevated permissions', async () => {
      const result = await getSpiceProxy(mockClient, mockConfigNoElevated, {
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // CLOUD-INIT
  // ============================================================
  describe('handleCloudInit (proxmox_cloudinit)', () => {
    it('should get cloud-init config (action=get)', async () => {
      (mockClient.request as any).mockResolvedValue({ ciuser: 'admin' });

      const result = await handleCloudInit(mockClient, mockConfig, {
        action: 'get',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Cloud-Init');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/cloudinit'
      );
    });

    it('should dump cloud-init config (action=dump)', async () => {
      (mockClient.request as any).mockResolvedValue('#cloud-config\n...');

      const result = await handleCloudInit(mockClient, mockConfig, {
        action: 'dump',
        node: 'pve1',
        vmid: 100,
        dump_type: 'user',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Cloud-Init');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/cloudinit/dump?type=user'
      );
    });

    it('should regenerate cloud-init drive (action=regenerate)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleCloudInit(mockClient, mockConfig, {
        action: 'regenerate',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Regenerated');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/qemu/100/cloudinit',
        'PUT'
      );
    });

    it('should require elevated for regenerate action', async () => {
      const result = await handleCloudInit(mockClient, mockConfigNoElevated, {
        action: 'regenerate',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(true);
    });

    it('should allow basic for get action', async () => {
      (mockClient.request as any).mockResolvedValue({ ciuser: 'admin' });

      const result = await handleCloudInit(mockClient, mockConfigNoElevated, {
        action: 'get',
        node: 'pve1',
        vmid: 100,
      });

      expect(result.isError).toBe(false);
    });
  });

  // ============================================================
  // CERTIFICATE
  // ============================================================
  describe('handleCertificate (proxmox_certificate)', () => {
    it('should list certificates (action=list)', async () => {
      (mockClient.request as any).mockResolvedValue([
        { subject: '/CN=pve1', fingerprint: 'abc123' },
      ]);

      const result = await handleCertificate(mockClient, mockConfig, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Certificate');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/info'
      );
    });

    it('should upload certificate (action=upload)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleCertificate(mockClient, mockConfig, {
        action: 'upload',
        node: 'pve1',
        certificates: 'PEM_DATA_HERE',
        key: 'KEY_DATA',
        force: true,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Uploaded');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/custom',
        'POST',
        expect.objectContaining({ certificates: 'PEM_DATA_HERE' })
      );
    });

    it('should delete certificate (action=delete)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleCertificate(mockClient, mockConfig, {
        action: 'delete',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Deleted');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/custom',
        'DELETE'
      );
    });

    it('should require elevated for upload', async () => {
      const result = await handleCertificate(mockClient, mockConfigNoElevated, {
        action: 'upload',
        node: 'pve1',
        certificates: 'PEM_DATA',
      });

      expect(result.isError).toBe(true);
    });

    it('should allow basic for list', async () => {
      (mockClient.request as any).mockResolvedValue([]);

      const result = await handleCertificate(mockClient, mockConfigNoElevated, {
        action: 'list',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('handleAcmeCert (proxmox_acme_cert)', () => {
    it('should order ACME certificate (action=order)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:123');

      const result = await handleAcmeCert(mockClient, mockConfig, {
        action: 'order',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ordered');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/acme/certificate',
        'POST',
        expect.any(Object)
      );
    });

    it('should renew ACME certificate (action=renew)', async () => {
      (mockClient.request as any).mockResolvedValue('UPID:pve1:456');

      const result = await handleAcmeCert(mockClient, mockConfig, {
        action: 'renew',
        node: 'pve1',
        force: true,
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Renewed');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/acme/certificate',
        'PUT',
        expect.objectContaining({ force: true })
      );
    });

    it('should revoke ACME certificate (action=revoke)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleAcmeCert(mockClient, mockConfig, {
        action: 'revoke',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Revoked');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/acme/certificate',
        'DELETE'
      );
    });

    it('should get ACME config (action=config)', async () => {
      (mockClient.request as any).mockResolvedValue({ account: 'default' });

      const result = await handleAcmeCert(mockClient, mockConfig, {
        action: 'config',
        node: 'pve1',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('ACME');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/nodes/pve1/certificates/acme'
      );
    });

    it('should require elevated for order', async () => {
      const result = await handleAcmeCert(mockClient, mockConfigNoElevated, {
        action: 'order',
        node: 'pve1',
      });

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // ACME
  // ============================================================
  describe('handleAcmeAccount (proxmox_acme_account)', () => {
    it('should list accounts (action=list)', async () => {
      (mockClient.request as any).mockResolvedValue([
        { name: 'default', directory: 'https://acme.example.com' },
      ]);

      const result = await handleAcmeAccount(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('ACME Account');
      expect(mockClient.request).toHaveBeenCalledWith('/cluster/acme/account');
    });

    it('should get account (action=get)', async () => {
      (mockClient.request as any).mockResolvedValue({
        directory: 'https://acme.example.com',
        location: 'https://acme.example.com/acct/1',
      });

      const result = await handleAcmeAccount(mockClient, mockConfig, {
        action: 'get',
        name: 'default',
      });

      expect(result.isError).toBe(false);
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/acme/account/default'
      );
    });

    it('should create account (action=create)', async () => {
      (mockClient.request as any).mockResolvedValue('ok');

      const result = await handleAcmeAccount(mockClient, mockConfig, {
        action: 'create',
        contact: 'admin@example.com',
        name: 'test',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Created');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/acme/account',
        'POST',
        expect.objectContaining({ contact: 'admin@example.com' })
      );
    });

    it('should update account (action=update)', async () => {
      (mockClient.request as any).mockResolvedValue('ok');

      const result = await handleAcmeAccount(mockClient, mockConfig, {
        action: 'update',
        name: 'default',
        contact: 'new@example.com',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Updated');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/acme/account/default',
        'PUT',
        expect.objectContaining({ contact: 'new@example.com' })
      );
    });

    it('should delete account (action=delete)', async () => {
      (mockClient.request as any).mockResolvedValue('ok');

      const result = await handleAcmeAccount(mockClient, mockConfig, {
        action: 'delete',
        name: 'old',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Deleted');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/acme/account/old',
        'DELETE'
      );
    });

    it('should require elevated for create', async () => {
      const result = await handleAcmeAccount(mockClient, mockConfigNoElevated, {
        action: 'create',
        contact: 'admin@example.com',
      });

      expect(result.isError).toBe(true);
    });

    it('should allow basic for list', async () => {
      (mockClient.request as any).mockResolvedValue([]);

      const result = await handleAcmeAccount(mockClient, mockConfigNoElevated, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('handleAcmeInfo (proxmox_acme_info)', () => {
    it('should list plugins (action=list_plugins)', async () => {
      (mockClient.request as any).mockResolvedValue([
        { plugin: 'standalone', type: 'standalone' },
      ]);

      const result = await handleAcmeInfo(mockClient, mockConfig, {
        action: 'list_plugins',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Plugin');
      expect(mockClient.request).toHaveBeenCalledWith('/cluster/acme/plugins');
    });

    it('should get plugin (action=get_plugin)', async () => {
      (mockClient.request as any).mockResolvedValue({
        type: 'standalone',
        api: 'http-01',
      });

      const result = await handleAcmeInfo(mockClient, mockConfig, {
        action: 'get_plugin',
        id: 'standalone',
      });

      expect(result.isError).toBe(false);
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/acme/plugins/standalone'
      );
    });

    it('should list directories (action=directories)', async () => {
      (mockClient.request as any).mockResolvedValue([
        { name: "Let's Encrypt V2", url: 'https://acme-v02.api.letsencrypt.org/directory' },
      ]);

      const result = await handleAcmeInfo(mockClient, mockConfig, {
        action: 'directories',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Director');
      expect(mockClient.request).toHaveBeenCalledWith('/cluster/acme/directories');
    });

    it('should allow basic access (no elevated needed)', async () => {
      (mockClient.request as any).mockResolvedValue([]);

      const result = await handleAcmeInfo(mockClient, mockConfigNoElevated, {
        action: 'list_plugins',
      });

      expect(result.isError).toBe(false);
    });
  });

  // ============================================================
  // NOTIFICATION
  // ============================================================
  describe('handleNotification (proxmox_notification)', () => {
    it('should list notification targets (action=list)', async () => {
      (mockClient.request as any).mockResolvedValue([
        { name: 'mail-root', type: 'sendmail' },
      ]);

      const result = await handleNotification(mockClient, mockConfig, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Notification');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/notifications/targets'
      );
    });

    it('should get notification target (action=get)', async () => {
      (mockClient.request as any).mockResolvedValue({
        comment: 'test target',
      });

      const result = await handleNotification(mockClient, mockConfig, {
        action: 'get',
        name: 'mail-root',
        target_type: 'sendmail',
      });

      expect(result.isError).toBe(false);
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/notifications/endpoints/sendmail/mail-root'
      );
    });

    it('should create notification target (action=create)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNotification(mockClient, mockConfig, {
        action: 'create',
        name: 'my-smtp',
        target_type: 'smtp',
        server: 'smtp.example.com',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Created');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/notifications/endpoints/smtp',
        'POST',
        expect.objectContaining({ name: 'my-smtp', server: 'smtp.example.com' })
      );
    });

    it('should delete notification target (action=delete)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNotification(mockClient, mockConfig, {
        action: 'delete',
        name: 'my-smtp',
        target_type: 'smtp',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Deleted');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/notifications/endpoints/smtp/my-smtp',
        'DELETE'
      );
    });

    it('should test notification target (action=test)', async () => {
      (mockClient.request as any).mockResolvedValue(null);

      const result = await handleNotification(mockClient, mockConfig, {
        action: 'test',
        name: 'mail-root',
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Test');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/cluster/notifications/targets/mail-root/test',
        'POST'
      );
    });

    it('should require elevated for create', async () => {
      const result = await handleNotification(mockClient, mockConfigNoElevated, {
        action: 'create',
        name: 'test',
        target_type: 'smtp',
      });

      expect(result.isError).toBe(true);
    });

    it('should allow basic for list', async () => {
      (mockClient.request as any).mockResolvedValue([]);

      const result = await handleNotification(mockClient, mockConfigNoElevated, {
        action: 'list',
      });

      expect(result.isError).toBe(false);
    });
  });
});
