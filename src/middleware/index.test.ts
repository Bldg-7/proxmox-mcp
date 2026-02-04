import { describe, it, expect } from 'vitest';
import { requireElevated, RateLimiter } from './index.js';
import { createTestConfig } from '../__test-utils__/index.js';

describe('requireElevated', () => {
  it('allows action when allowElevated is true', () => {
    const config = createTestConfig({ allowElevated: true });
    expect(() => requireElevated(config, 'delete_vm')).not.toThrow();
  });

  it('throws when allowElevated is false', () => {
    const config = createTestConfig({ allowElevated: false });
    expect(() => requireElevated(config, 'delete_vm')).toThrow(
      'Permission denied: delete_vm requires elevated permissions'
    );
  });

  it('includes action name in error message', () => {
    const config = createTestConfig({ allowElevated: false });
    expect(() => requireElevated(config, 'custom_action')).toThrow('custom_action');
  });
});

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
  });

  it('blocks requests exceeding limit', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
  });

  it('tracks separate keys independently', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user2')).toBe(true);
    expect(limiter.check('user2')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
    expect(limiter.check('user2')).toBe(false);
  });

  it('resets after window expires', async () => {
    const limiter = new RateLimiter(1, 100);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(limiter.check('user1')).toBe(true);
  });

  it('getRequestCount returns correct count', () => {
    const limiter = new RateLimiter(5, 1000);
    expect(limiter.getRequestCount('user1')).toBe(0);
    limiter.check('user1');
    expect(limiter.getRequestCount('user1')).toBe(1);
    limiter.check('user1');
    expect(limiter.getRequestCount('user1')).toBe(2);
  });

  it('reset clears all tracked requests', () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.check('user1');
    limiter.check('user1');
    expect(limiter.check('user1')).toBe(false);

    limiter.reset();

    expect(limiter.check('user1')).toBe(true);
  });

  it('handles multiple keys with reset', () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.check('user1');
    limiter.check('user2');
    expect(limiter.getRequestCount('user1')).toBe(1);
    expect(limiter.getRequestCount('user2')).toBe(1);

    limiter.reset();

    expect(limiter.getRequestCount('user1')).toBe(0);
    expect(limiter.getRequestCount('user2')).toBe(0);
  });
});
