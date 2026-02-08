import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  getNodeCertificates,
  uploadCustomCertificate,
  deleteCustomCertificate,
  orderAcmeCertificate,
  renewAcmeCertificate,
  revokeAcmeCertificate,
  getNodeAcmeConfig,
} from './certificate.js';

describe('getNodeCertificates', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted certificate information', async () => {
    const config = createTestConfig();
    const mockCerts = [
      {
        subject: 'CN=pve1.example.com',
        issuer: "CN=Let's Encrypt Authority X3",
        notbefore: 1609459200,
        notafter: 1617235200,
        fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
        'public-key-type': 'RSA',
        'public-key-bits': 2048,
        san: ['pve1.example.com', 'www.pve1.example.com'],
      },
    ];
    client.request.mockResolvedValue(mockCerts);

    const result = await getNodeCertificates(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔒 **Node Certificates**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('CN=pve1.example.com');
    expect(result.content[0].text).toContain('RSA');
    expect(result.content[0].text).toContain('2048');
  });

  it('handles empty certificate list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await getNodeCertificates(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔒 **Node Certificates**');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await getNodeCertificates(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});

describe('uploadCustomCertificate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await uploadCustomCertificate(client, config, {
      node: 'pve1',
      certificates: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('uploads custom certificate with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({});

    const result = await uploadCustomCertificate(client, config, {
      node: 'pve1',
      certificates: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
      key: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
      force: true,
      restart: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **Custom Certificate Uploaded**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('Force:** true');
    expect(result.content[0].text).toContain('Restart:** true');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/certificates/custom', 'POST', expect.objectContaining({
      certificates: expect.any(String),
      key: expect.any(String),
      force: true,
      restart: true,
    }));
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Invalid certificate'));

    const result = await uploadCustomCertificate(client, config, {
      node: 'pve1',
      certificates: 'invalid',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Invalid certificate');
  });
});

describe('deleteCustomCertificate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteCustomCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('deletes custom certificate with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({});

    const result = await deleteCustomCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **Custom Certificate Deleted**');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/certificates/custom', 'DELETE');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Certificate not found'));

    const result = await deleteCustomCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Certificate not found');
  });
});

describe('orderAcmeCertificate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await orderAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('orders ACME certificate with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234:00005678:5F9A1234:acmenewcert:root@pam:');

    const result = await orderAcmeCertificate(client, config, { node: 'pve1', force: true });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Certificate Ordered**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('Force:** true');
    expect(result.content[0].text).toContain('Task UPID:');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/certificates/acme/certificate', 'POST', { force: true });
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('ACME account not configured'));

    const result = await orderAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('ACME account not configured');
  });
});

describe('renewAcmeCertificate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await renewAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('renews ACME certificate with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue('UPID:pve1:00001234:00005678:5F9A1234:acmerenew:root@pam:');

    const result = await renewAcmeCertificate(client, config, { node: 'pve1', force: false });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Certificate Renewed**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('Force:** false');
    expect(result.content[0].text).toContain('Task UPID:');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/certificates/acme/certificate', 'PUT', { force: false });
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Certificate not found'));

    const result = await renewAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Certificate not found');
  });
});

describe('revokeAcmeCertificate', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await revokeAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('revokes ACME certificate with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({});

    const result = await revokeAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Certificate Revoked**');
    expect(result.content[0].text).toContain('pve1');
    expect(client.request).toHaveBeenCalledWith('/nodes/pve1/certificates/acme/certificate', 'DELETE');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Certificate not found'));

    const result = await revokeAcmeCertificate(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Certificate not found');
  });
});

describe('getNodeAcmeConfig', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME configuration', async () => {
    const config = createTestConfig();
    const mockConfig = {
      account: 'default',
      domains: ['pve1.example.com', 'www.pve1.example.com'],
      plugin: 'standalone',
    };
    client.request.mockResolvedValue(mockConfig);

    const result = await getNodeAcmeConfig(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔒 **Node ACME Configuration**');
    expect(result.content[0].text).toContain('pve1');
    expect(result.content[0].text).toContain('Account:** default');
    expect(result.content[0].text).toContain('pve1.example.com');
    expect(result.content[0].text).toContain('Plugin:** standalone');
  });

  it('handles empty ACME configuration', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({});

    const result = await getNodeAcmeConfig(client, config, { node: 'pve1' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔒 **Node ACME Configuration**');
    expect(result.content[0].text).toContain('N/A');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await getNodeAcmeConfig(client, config, { node: 'pve1' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});
