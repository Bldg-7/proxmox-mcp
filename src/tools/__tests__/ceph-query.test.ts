import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { handleCephTool } from '../ceph.js';

describe('handleCephTool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('action=status', () => {
    it('returns formatted Ceph status', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({
        health: { status: 'HEALTH_OK' },
        fsid: 'abc-123-def',
        monmap: { mons: 3 },
        osdmap: { num_osds: 6 },
        pgmap: { num_pgs: 128 },
      });

      const result = await handleCephTool(client, config, { action: 'status', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Status');
      expect(result.content[0].text).toContain('HEALTH_OK');
      expect(result.content[0].text).toContain('abc-123-def');
      expect(result.content[0].text).toContain('3');
      expect(result.content[0].text).toContain('6');
      expect(result.content[0].text).toContain('128');
      expect(client.request).toHaveBeenCalledWith('/nodes/pve1/ceph/status');
    });

    it('handles missing status fields gracefully', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue({});

      const result = await handleCephTool(client, config, { action: 'status', node: 'pve1' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Ceph Status');
      expect(result.content[0].text).toContain('No status details reported.');
    });

    it('handles API errors gracefully', async () => {
      const config = createTestConfig();
      client.request.mockRejectedValue(new Error('Connection refused'));

      const result = await handleCephTool(client, config, { action: 'status', node: 'pve1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Connection refused');
    });

    it('validates node name', async () => {
      const config = createTestConfig();

      const result = await handleCephTool(client, config, { action: 'status', node: '' });

      expect(result.isError).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('throws error for unknown action', async () => {
      const config = createTestConfig();

      await expect(
        handleCephTool(client, config, { action: 'nonexistent', node: 'pve1' })
      ).rejects.toThrow('Unknown ceph action');
    });
  });
});
