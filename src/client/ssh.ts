import { Client } from 'ssh2';
import type { ConnectConfig, ClientChannel } from 'ssh2';
import { readFileSync } from 'node:fs';
import { logger } from '../utils/index.js';

/** Maximum output size per stream (stdout/stderr) in bytes */
const MAX_OUTPUT_BYTES = 65_536;
const IDLE_TIMEOUT_MS = 5 * 60_000;
const KEEPALIVE_INTERVAL_MS = 30_000;

export interface SshConfig {
  host: string;
  port: number;
  username: string;
  privateKeyPath: string;
  /** Optional host key fingerprint for verification (sha256 format) */
  hostKeyFingerprint?: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class SshClient {
  private conn: Client | null = null;
  private connectPromise: Promise<Client> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly config: SshConfig;

  constructor(config: SshConfig) {
    this.config = config;
  }

  async exec(command: string, timeoutSeconds = 30): Promise<ExecResult> {
    const conn = await this.getConnection();
    return this.execOnConnection(conn, command, timeoutSeconds);
  }

  close(): void {
    this.clearIdleTimer();
    if (this.conn) {
      this.conn.end();
      this.conn = null;
    }
    this.connectPromise = null;
  }

  private async getConnection(): Promise<Client> {
    this.resetIdleTimer();

    if (this.conn) {
      return this.conn;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.createConnection();

    try {
      const conn = await this.connectPromise;
      return conn;
    } catch (error) {
      this.connectPromise = null;
      throw error;
    }
  }

  private createConnection(): Promise<Client> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let privateKey: Buffer;

      try {
        privateKey = readFileSync(this.config.privateKeyPath) as Buffer;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        reject(
          new Error(
            `Failed to read SSH private key at ${this.config.privateKeyPath}: ${message}`
          )
        );
        return;
      }

      const connectConfig: ConnectConfig = {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        privateKey,
        readyTimeout: 30_000,
        keepaliveInterval: KEEPALIVE_INTERVAL_MS,
        keepaliveCountMax: 3,
      };

      // Host key verification
      if (this.config.hostKeyFingerprint) {
        const expectedFingerprint = this.config.hostKeyFingerprint;
        connectConfig.hostVerifier = (keyHash: string): boolean => {
          const matches = keyHash === expectedFingerprint;
          if (!matches) {
            logger.error(
              { expected: expectedFingerprint, received: keyHash },
              'SSH host key fingerprint mismatch'
            );
          }
          return matches;
        };
      }

      conn
        .on('ready', () => {
          logger.info(
            { host: this.config.host, port: this.config.port },
            'SSH connection established'
          );
          this.conn = conn;
          this.connectPromise = null;
          this.resetIdleTimer();
          resolve(conn);
        })
        .on('error', (err) => {
          logger.error({ err }, 'SSH connection error');
          this.conn = null;
          this.connectPromise = null;
          reject(new Error(`SSH connection failed: ${err.message}`));
        })
        .on('close', () => {
          logger.info('SSH connection closed');
          this.conn = null;
          this.connectPromise = null;
        })
        .connect(connectConfig);
    });
  }

  private execOnConnection(
    conn: Client,
    command: string,
    timeoutSeconds: number
  ): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      const timeoutMs = timeoutSeconds * 1000;
      let stdoutBuf = '';
      let stderrBuf = '';
      let stdoutTruncated = false;
      let stderrTruncated = false;
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          // Connection may be in bad state after timeout — destroy it
          this.conn = null;
          conn.end();
          reject(
            new Error(
              `Command timed out after ${timeoutSeconds}s`
            )
          );
        }
      }, timeoutMs);

      conn.exec(command, (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          clearTimeout(timer);
          if (!settled) {
            settled = true;
            reject(new Error(`SSH exec failed: ${err.message}`));
          }
          return;
        }

        stream.on('data', (data: Buffer) => {
          if (!stdoutTruncated) {
            const chunk = data.toString('utf-8');
            if (stdoutBuf.length + chunk.length > MAX_OUTPUT_BYTES) {
              stdoutBuf += chunk.slice(0, MAX_OUTPUT_BYTES - stdoutBuf.length);
              stdoutTruncated = true;
            } else {
              stdoutBuf += chunk;
            }
          }
        });

        stream.stderr.on('data', (data: Buffer) => {
          if (!stderrTruncated) {
            const chunk = data.toString('utf-8');
            if (stderrBuf.length + chunk.length > MAX_OUTPUT_BYTES) {
              stderrBuf += chunk.slice(0, MAX_OUTPUT_BYTES - stderrBuf.length);
              stderrTruncated = true;
            } else {
              stderrBuf += chunk;
            }
          }
        });

        stream.on('close', (code: number) => {
          clearTimeout(timer);
          if (!settled) {
            settled = true;

            let stdout = stdoutBuf;
            let stderr = stderrBuf;

            if (stdoutTruncated) {
              stdout += '\n... [stdout truncated at 64KB]';
            }
            if (stderrTruncated) {
              stderr += '\n... [stderr truncated at 64KB]';
            }

            resolve({
              stdout,
              stderr,
              exitCode: code ?? 0,
            });
          }
        });

        stream.on('error', (streamErr: Error) => {
          clearTimeout(timer);
          if (!settled) {
            settled = true;
            reject(new Error(`SSH stream error: ${streamErr.message}`));
          }
        });
      });
    });
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      logger.info('SSH connection idle timeout — closing');
      this.close();
    }, IDLE_TIMEOUT_MS);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

let sshClientInstance: SshClient | null = null;

export function getSshClient(config: SshConfig): SshClient {
  if (!sshClientInstance) {
    sshClientInstance = new SshClient(config);
  }
  return sshClientInstance;
}

export function closeSshClient(): void {
  if (sshClientInstance) {
    sshClientInstance.close();
    sshClientInstance = null;
  }
}

/**
 * Shell-quote a string for safe use in `sh -c '...'`.
 * Escapes single quotes by ending the quoted string, adding an escaped quote, and reopening.
 * Example: "hello'world" → "'hello'\\''world'"
 */
export function shellQuote(s: string): string {
  // Normalize newlines and carriage returns to prevent injection via line breaks
  const normalized = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return "'" + normalized.replace(/'/g, "'\\''") + "'";
}
