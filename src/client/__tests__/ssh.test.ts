import { describe, expect, it } from 'vitest';
import { shellQuote } from '../ssh.js';

describe('shellQuote', () => {
  it('wraps simple string in single quotes', () => {
    expect(shellQuote('hello')).toBe("'hello'");
  });

  it('handles empty string', () => {
    expect(shellQuote('')).toBe("''");
  });

  it('escapes single quotes', () => {
    expect(shellQuote("hello'world")).toBe("'hello'\\''world'");
  });

  it('escapes multiple single quotes', () => {
    expect(shellQuote("it's a 'test'")).toBe("'it'\\''s a '\\''test'\\'''");
  });

  it('preserves spaces and special characters inside quotes', () => {
    expect(shellQuote('echo hello world')).toBe("'echo hello world'");
  });

  it('normalizes \\r\\n to \\n', () => {
    const result = shellQuote('line1\r\nline2');
    expect(result).not.toContain('\r');
    expect(result).toBe("'line1\nline2'");
  });

  it('normalizes standalone \\r to \\n', () => {
    const result = shellQuote('line1\rline2');
    expect(result).not.toContain('\r');
    expect(result).toBe("'line1\nline2'");
  });
});
