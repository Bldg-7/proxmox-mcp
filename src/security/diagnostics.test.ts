import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanitizeDiagnostic, MAX_ERROR_CHARS, MAX_REPORT_CHARS } from './diagnostics.js';
import { createLogger, logger } from '../utils/index.js';
import { formatErrorResponse } from '../formatters/index.js';
import { getNodeReport } from '../tools/node.js';
import { createMockProxmoxClient, createTestConfig } from '../__test-utils__/index.js';
import { ProxmoxApiClient } from '../client/proxmox.js';
import { createServer } from '../server.js';
import type { ToolResponse } from '../types/tools.js';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('diagnostic redaction', () => {
  it.each([
    '--token hunter-secret', '--token=hunter-secret', '--password "hunter-secret more"',
    "--api-key='hunter-secret'", 'TOKEN=hunter-secret', 'Authorization: Bearer hunter-secret',
    'PVEAPIToken=root@pam!test=hunter-secret', '{"password":"hunter-secret"}',
    '{"nested":{"api_token":"hunter-secret"}}', 'https://user:hunter-secret@example.test',
    '/api?token=hunter-secret&limit=10', '-----BEGIN PRIVATE KEY-----\nhunter-secret\n-----END PRIVATE KEY-----',
  ])('masks known secret syntax: %s', input => {
    expect(sanitizeDiagnostic(input)).not.toContain('hunter-secret');
    expect(sanitizeDiagnostic(input)).toContain('[REDACTED]');
  });

  it('redacts known configured credentials even without a label', () => {
    vi.stubEnv('PROXMOX_TOKEN_VALUE','bare-secret');
    expect(sanitizeDiagnostic('bare-secret is present')).not.toContain('bare-secret');
    expect(sanitizeDiagnostic('additional-secret', MAX_ERROR_CHARS, ['additional-secret'])).toBe('[REDACTED]');
  });

  it('redacts before truncation and retains a bounded truncation notice', () => {
    const result = sanitizeDiagnostic('x'.repeat(4000) + ' --token ' + 'secret'.repeat(2000) + ' trailing'.repeat(500));
    expect(result.length).toBeLessThanOrEqual(MAX_ERROR_CHARS);
    expect(result).not.toContain('secret');
    expect(result).toContain('[truncated:');
  });

  it('preserves useful normal diagnostics', () => {
    expect(sanitizeDiagnostic('HTTP 400: invalid node lab; CPU=0%')).toBe('HTTP 400: invalid node lab; CPU=0%');
  });

  it('sanitizes Error objects, nested fields and message strings before log output', () => {
    let output = '';
    const log = createLogger({write: (chunk: string): void => { output += chunk; }});
    log.error({err:new Error('--token hunter-secret'), nested:{password:'nested-secret', toJSON: (): string => 'serializer-secret'}, endpoint:'/api?token=url-secret'}, '--password message-secret');
    expect(output).not.toMatch(/hunter-secret|nested-secret|url-secret|message-secret|serializer-secret/);
    expect(output).toContain('[REDACTED]');
    expect(JSON.parse(output).level).toBe(50);
  });

  it('redacts interpolated log arguments after formatting', () => {
    let output = '';
    const log = createLogger({write: (chunk: string): void => { output += chunk; }});
    log.error('--token %s', 'interpolated-secret');
    log.error({node:'lab'}, '--password %s', 'second-secret');
    expect(output).not.toMatch(/interpolated-secret|second-secret/);
    expect(output).toContain('[REDACTED]');
  });

  it('sanitizes and bounds MCP error text', () => {
    const result = formatErrorResponse(new Error('--token hunter-secret ' + 'x'.repeat(10000)), 'Test');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain('hunter-secret');
    expect(result.content[0].text.length).toBeLessThanOrEqual(MAX_ERROR_CHARS);
    expect(result.content[0].text).toContain('[truncated:');
  });

  it('sanitizes MCP dispatch validation and handler errors with the configured token', async () => {
    const config = createTestConfig();
    const client = createMockProxmoxClient();
    const server = createServer(client, config);
    type Handler = (request: unknown) => Promise<ToolResponse>;
    const handler = (server as unknown as {_requestHandlers: Map<string, Handler>})._requestHandlers.get('tools/call')!;
    const validation = await handler({method:'tools/call',params:{name:'proxmox_node',arguments:{action:config.tokenValue}}});
    expect(validation.isError).toBe(true);
    expect(validation.content[0].text).not.toContain(config.tokenValue);
    client.request.mockRejectedValue(new Error(`upstream echoed ${config.tokenValue}`));
    const failure = await handler({method:'tools/call',params:{name:'proxmox_node',arguments:{action:'list'}}});
    expect(failure.isError).toBe(true);
    expect(failure.content[0].text).not.toContain(config.tokenValue);
  });

  it('blocks reports without elevated permissions before the API call', async () => {
    const client = createMockProxmoxClient();
    const result = await getNodeReport(client, createTestConfig(), {node:'lab'});
    expect(result.isError).toBe(true);
    expect(client.request).not.toHaveBeenCalled();
  });

  it('redacts and bounds diagnostic reports, including the configured API token', async () => {
    const config = createTestConfig({allowElevated:true});
    const client = createMockProxmoxClient();
    client.request.mockResolvedValue(`cloudflared tunnel run --token hunter-secret\n${config.tokenValue}\n` + 'x'.repeat(80000));
    const result = await getNodeReport(client, config, {node:'lab'});
    const text = result.content[0].text;
    expect(result.isError).toBe(false);
    expect(text).not.toContain('hunter-secret');
    expect(text).not.toContain(config.tokenValue);
    expect(text.length).toBeLessThanOrEqual(MAX_REPORT_CHARS);
    expect(text).toContain('[truncated:');
  });

  it('sanitizes real client API errors before both logging and MCP formatting', async () => {
    const config = createTestConfig();
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(`{"password":"hunter-secret","message":"${config.tokenValue}"}` + 'x'.repeat(10000), {status:400})));
    const errorLog = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const client = new ProxmoxApiClient(config);
    const error = await client.request('/nodes').catch((value: unknown) => value);
    expect(error).toBeInstanceOf(Error);
    expect(errorLog).toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('hunter-secret');
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(config.tokenValue);
    const message = (error as Error).message;
    expect(message).not.toContain('hunter-secret'); expect(message).not.toContain(config.tokenValue);
    expect(message.length).toBeLessThanOrEqual(MAX_ERROR_CHARS);
    expect(formatErrorResponse(error as Error, 'Query').content[0].text).not.toContain('hunter-secret');
  });
});
