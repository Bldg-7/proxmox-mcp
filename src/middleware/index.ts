import type { Config } from '../config/index.js';

/**
 * Checks if elevated permissions are allowed and throws if not.
 * Used to guard dangerous operations that require explicit opt-in.
 *
 * @throws {Error} If elevated permissions are not allowed
 */
export function requireElevated(config: Config, action: string): void {
  if (!config.allowElevated) {
    throw new Error(`Permission denied: ${action} requires elevated permissions`);
  }
}

/**
 * Simple in-memory rate limiter using a sliding window approach.
 * Tracks requests per key and enforces a maximum request count within a time window.
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * @param maxRequests Maximum number of requests allowed in the window
   * @param windowMs Time window in milliseconds
   */
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  /**
   * Check if a request is allowed for the given key.
   * Returns true if allowed, false if rate limited.
   *
   * @param key Identifier for the rate limit bucket (e.g., user ID, IP address)
   * @returns true if request is allowed, false if rate limited
   */
  check(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or initialize request timestamps for this key
    let timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if we've exceeded the limit
    if (timestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current request timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return true;
  }

  /**
   * Reset the rate limiter (clear all tracked requests).
   * Useful for testing or manual reset.
   */
  reset(): void {
    this.requests.clear();
  }

  /**
   * Get the number of requests for a key within the current window.
   * Useful for monitoring and testing.
   */
  getRequestCount(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = this.requests.get(key) || [];
    return timestamps.filter((ts) => ts > windowStart).length;
  }
}
