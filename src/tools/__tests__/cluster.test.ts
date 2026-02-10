import { describe, it, expect, beforeEach } from 'vitest';
import { createMockProxmoxClient, createTestConfig } from '../../__test-utils__/index.js';
import { sampleNodes } from '../../__fixtures__/nodes.js';
import { handleClusterTool } from '../cluster.js';

describe('handleClusterTool', () => {
  let client: ReturnType<typeof createMockProxmoxClient>;

  beforeEach(() => {
    client = createMockProxmoxClient();
  });

  describe('action=status', () => {
    it('returns formatted cluster status', async () => {
      const config = createTestConfig();
      client.request.mockResolvedValue(sampleNodes);

      const result = await handleClusterTool(client, config, { action: 'status' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Proxmox Cluster Status');
    });

    it('shows healthy status when all nodes online', async () => {
      const config = createTestConfig();
      const onlineNodes = sampleNodes.filter(n => n.status === 'online');
      client.request.mockResolvedValue(onlineNodes);

      const result = await handleClusterTool(client, config, { action: 'status' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Healthy');
    });

    it('handles API errors gracefully', async () => {
      const config = createTestConfig();
      client.request.mockRejectedValue(new Error('Cluster unreachable'));

      const result = await handleClusterTool(client, config, { action: 'status' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Cluster unreachable');
    });

    it('shows resource usage with elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: true });
      client.request.mockResolvedValue(sampleNodes);

      const result = await handleClusterTool(client, config, { action: 'status' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Resource Usage');
    });

    it('shows limited info without elevated permissions', async () => {
      const config = createTestConfig({ allowElevated: false });
      client.request.mockResolvedValue(sampleNodes);

      const result = await handleClusterTool(client, config, { action: 'status' });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Limited Information');
    });
  });

  describe('unknown action', () => {
    it('returns error for unknown action', async () => {
      const config = createTestConfig();

      const result = await handleClusterTool(client, config, { action: 'unknown' as any });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
