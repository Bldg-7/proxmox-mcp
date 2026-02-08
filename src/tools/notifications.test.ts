import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import {
  listNotificationTargets,
  getNotificationTarget,
  createNotificationTarget,
  deleteNotificationTarget,
  testNotificationTarget,
} from './notifications.js';

describe('listNotificationTargets', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted notification targets list', async () => {
    const config = createTestConfig();
    const mockTargets = [
      {
        name: 'smtp-alerts',
        type: 'smtp',
        origin: 'user-created',
        comment: 'Production alerts',
        disable: false,
      },
      {
        name: 'gotify-notifications',
        type: 'gotify',
        origin: 'user-created',
      },
    ];
    client.request.mockResolvedValue(mockTargets);

    const result = await listNotificationTargets(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('📬 **Notification Targets**');
    expect(result.content[0].text).toContain('smtp-alerts');
    expect(result.content[0].text).toContain('gotify-notifications');
    expect(result.content[0].text).toContain('Production alerts');
    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/targets');
  });

  it('handles empty targets list', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue([]);

    const result = await listNotificationTargets(client, config, {});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No notification targets found');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Connection failed'));

    const result = await listNotificationTargets(client, config, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Connection failed');
  });
});

describe('getNotificationTarget', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('returns formatted SMTP notification target details', async () => {
    const config = createTestConfig();
    const mockTarget = {
      server: 'smtp.example.com',
      port: 587,
      username: 'alerts@example.com',
      mailto: 'admin@example.com',
      from: 'proxmox@example.com',
      mode: 'starttls',
      comment: 'Production SMTP',
      disable: false,
    };
    client.request.mockResolvedValue(mockTarget);

    const result = await getNotificationTarget(client, config, {
      type: 'smtp',
      name: 'smtp-alerts',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('📬 **Notification Target Details**');
    expect(result.content[0].text).toContain('smtp-alerts');
    expect(result.content[0].text).toContain('smtp.example.com');
    expect(result.content[0].text).toContain('587');
    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/endpoints/smtp/smtp-alerts');
  });

  it('handles URL encoding for target names', async () => {
    const config = createTestConfig();
    client.request.mockResolvedValue({});

    await getNotificationTarget(client, config, {
      type: 'smtp',
      name: 'test target',
    });

    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/endpoints/smtp/test%20target');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig();
    client.request.mockRejectedValue(new Error('Target not found'));

    const result = await getNotificationTarget(client, config, {
      type: 'smtp',
      name: 'nonexistent',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Target not found');
  });
});

describe('createNotificationTarget', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('creates SMTP notification target with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await createNotificationTarget(client, config, {
      type: 'smtp',
      name: 'new-smtp',
      server: 'smtp.example.com',
      port: 587,
      mailto: 'admin@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **Notification Target Created**');
    expect(result.content[0].text).toContain('smtp');
    expect(result.content[0].text).toContain('new-smtp');
    expect(client.request).toHaveBeenCalledWith(
      '/cluster/notifications/endpoints/smtp',
      'POST',
      expect.objectContaining({
        name: 'new-smtp',
        server: 'smtp.example.com',
        port: 587,
        mailto: 'admin@example.com',
      })
    );
  });

  it('denies creation without elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await createNotificationTarget(client, config, {
      type: 'smtp',
      name: 'new-smtp',
      server: 'smtp.example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
    expect(result.content[0].text).toContain('create notification target');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Invalid configuration'));

    const result = await createNotificationTarget(client, config, {
      type: 'smtp',
      name: 'new-smtp',
      server: 'smtp.example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Invalid configuration');
  });
});

describe('deleteNotificationTarget', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('deletes notification target with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await deleteNotificationTarget(client, config, {
      type: 'smtp',
      name: 'old-smtp',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **Notification Target Deleted**');
    expect(result.content[0].text).toContain('smtp');
    expect(result.content[0].text).toContain('old-smtp');
    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/endpoints/smtp/old-smtp', 'DELETE');
  });

  it('denies deletion without elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await deleteNotificationTarget(client, config, {
      type: 'smtp',
      name: 'old-smtp',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
    expect(result.content[0].text).toContain('delete notification target');
  });

  it('handles URL encoding for target names', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    await deleteNotificationTarget(client, config, {
      type: 'smtp',
      name: 'test target',
    });

    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/endpoints/smtp/test%20target', 'DELETE');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Target not found'));

    const result = await deleteNotificationTarget(client, config, {
      type: 'smtp',
      name: 'nonexistent',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Target not found');
  });
});

describe('testNotificationTarget', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  it('tests notification target with elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    const result = await testNotificationTarget(client, config, {
      name: 'smtp-alerts',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('✅ **Notification Target Test Sent**');
    expect(result.content[0].text).toContain('smtp-alerts');
    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/targets/smtp-alerts/test', 'POST');
  });

  it('denies test without elevated permissions', async () => {
    const config = createTestConfig({ allowElevated: false });

    const result = await testNotificationTarget(client, config, {
      name: 'smtp-alerts',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Permission denied');
    expect(result.content[0].text).toContain('test notification target');
  });

  it('handles URL encoding for target names', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockResolvedValue({ success: true });

    await testNotificationTarget(client, config, {
      name: 'test target',
    });

    expect(client.request).toHaveBeenCalledWith('/cluster/notifications/targets/test%20target/test', 'POST');
  });

  it('handles API errors gracefully', async () => {
    const config = createTestConfig({ allowElevated: true });
    client.request.mockRejectedValue(new Error('Test failed'));

    const result = await testNotificationTarget(client, config, {
      name: 'smtp-alerts',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Test failed');
  });
});
