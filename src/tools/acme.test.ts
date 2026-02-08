import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  listAcmeAccounts,
  getAcmeAccount,
  createAcmeAccount,
  updateAcmeAccount,
  deleteAcmeAccount,
  listAcmePlugins,
  getAcmePlugin,
  getAcmeDirectories,
} from './acme.js';

describe('listAcmeAccounts', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME accounts list', async () => {
    const config = createTestConfig();
    const mockAccounts = [
      {
        name: 'production',
        directory: 'https://acme-v02.api.letsencrypt.org/directory',
        location: 'https://acme-v02.api.letsencrypt.org/acme/acct/123456',
        tos: 'https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf',
      },
    ];
    client.request.mockResolvedValue(mockAccounts);

    const result = await listAcmeAccounts(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔐 **ACME Accounts**');
    expect(result.content[0].text).toContain('production');
    expect(result.content[0].text).toContain('letsencrypt.org');
  });

  it('handles empty accounts list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await listAcmeAccounts(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No ACME accounts found');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await listAcmeAccounts(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});

describe('getAcmeAccount', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME account details', async () => {
    const config = createTestConfig();
    const mockAccount = {
      directory: 'https://acme-v02.api.letsencrypt.org/directory',
      location: 'https://acme-v02.api.letsencrypt.org/acme/acct/123456',
      tos: 'https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf',
      account: {
        status: 'valid',
        contact: ['mailto:admin@example.com'],
      },
    };
    client.request.mockResolvedValue(mockAccount);

    const result = await getAcmeAccount(client, config, { name: 'production' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔐 **ACME Account Details**');
    expect(result.content[0].text).toContain('production');
    expect(result.content[0].text).toContain('valid');
    expect(client.request).toHaveBeenCalledWith('/cluster/acme/account/production');
  });

  it('handles URL encoding for account names', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({});

    await getAcmeAccount(client, config, { name: 'test account' });

    expect(client.request).toHaveBeenCalledWith('/cluster/acme/account/test%20account');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Account not found'));

    const result = await getAcmeAccount(client, config, { name: 'production' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Account not found');
  });
});

describe('createAcmeAccount', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createAcmeAccount(client, config, {
      contact: 'admin@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('creates ACME account with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await createAcmeAccount(client, config, {
      name: 'production',
      contact: 'admin@example.com',
      tos_url: 'https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf',
      directory: 'https://acme-v02.api.letsencrypt.org/directory',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Account Created**');
    expect(result.content[0].text).toContain('[REDACTED]');
    expect(result.content[0].text).not.toContain('admin@example.com');
    expect(client.request).toHaveBeenCalledWith('/cluster/acme/account', 'POST', expect.objectContaining({
      contact: 'admin@example.com',
      name: 'production',
    }));
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Account already exists'));

    const result = await createAcmeAccount(client, config, {
      contact: 'admin@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Account already exists');
  });
});

describe('updateAcmeAccount', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await updateAcmeAccount(client, config, {
      name: 'production',
      contact: 'newadmin@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('updates ACME account with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await updateAcmeAccount(client, config, {
      name: 'production',
      contact: 'newadmin@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Account Updated**');
    expect(result.content[0].text).toContain('[REDACTED]');
    expect(result.content[0].text).not.toContain('newadmin@example.com');
    expect(client.request).toHaveBeenCalledWith('/cluster/acme/account/production', 'PUT', expect.objectContaining({
      contact: 'newadmin@example.com',
    }));
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Account not found'));

    const result = await updateAcmeAccount(client, config, {
      name: 'production',
      contact: 'newadmin@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Account not found');
  });
});

describe('deleteAcmeAccount', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('requires elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteAcmeAccount(client, config, {
      name: 'production',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
  });

  it('deletes ACME account with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await deleteAcmeAccount(client, config, {
      name: 'production',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **ACME Account Deleted**');
    expect(result.content[0].text).toContain('production');
    expect(client.request).toHaveBeenCalledWith('/cluster/acme/account/production', 'DELETE');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Account not found'));

    const result = await deleteAcmeAccount(client, config, {
      name: 'production',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Account not found');
  });
});

describe('listAcmePlugins', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME plugins list', async () => {
    const config = createTestConfig();
    const mockPlugins = [
      {
        plugin: 'cloudflare',
        type: 'dns',
        api: 'cf',
        data: 'CF_Token=abc123',
      },
    ];
    client.request.mockResolvedValue(mockPlugins);

    const result = await listAcmePlugins(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔌 **ACME Plugins**');
    expect(result.content[0].text).toContain('cloudflare');
    expect(result.content[0].text).toContain('dns');
  });

  it('handles empty plugins list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await listAcmePlugins(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No ACME plugins found');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await listAcmePlugins(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});

describe('getAcmePlugin', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME plugin details', async () => {
    const config = createTestConfig();
    const mockPlugin = {
      type: 'dns',
      api: 'cf',
      data: 'CF_Token=abc123',
      validation_delay: 30,
    };
    client.request.mockResolvedValue(mockPlugin);

    const result = await getAcmePlugin(client, config, { id: 'cloudflare' });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('🔌 **ACME Plugin Details**');
    expect(result.content[0].text).toContain('cloudflare');
    expect(result.content[0].text).toContain('dns');
    expect(client.request).toHaveBeenCalledWith('/cluster/acme/plugins/cloudflare');
  });

  it('handles URL encoding for plugin IDs', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({});

    await getAcmePlugin(client, config, { id: 'test plugin' });

    expect(client.request).toHaveBeenCalledWith('/cluster/acme/plugins/test%20plugin');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Plugin not found'));

    const result = await getAcmePlugin(client, config, { id: 'cloudflare' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Plugin not found');
  });
});

describe('getAcmeDirectories', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted ACME directories list', async () => {
    const config = createTestConfig();
    const mockDirectories = [
      {
        name: 'Let\'s Encrypt V2',
        url: 'https://acme-v02.api.letsencrypt.org/directory',
        tos: 'https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf',
      },
      {
        name: 'Let\'s Encrypt V2 Staging',
        url: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      },
    ];
    client.request.mockResolvedValue(mockDirectories);

    const result = await getAcmeDirectories(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('📁 **ACME Directories**');
    expect(result.content[0].text).toContain('Let\'s Encrypt V2');
    expect(result.content[0].text).toContain('letsencrypt.org');
  });

  it('handles empty directories list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await getAcmeDirectories(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No ACME directories found');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await getAcmeDirectories(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});
