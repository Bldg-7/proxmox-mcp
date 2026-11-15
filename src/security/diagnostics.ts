/** Diagnostic-only sanitization: do not apply to intentional credential creation results. */
export const MAX_ERROR_CHARS = 4096;
export const MAX_REPORT_CHARS = 16000;
export const REDACTED = '[REDACTED]';
const TRUNCATED = '\n[truncated: diagnostic output limit reached]';
const sensitiveKey = /password|passwd|secret|token|authorization|cookie|private[_-]?key|api[_-]?key|credential/i;

/** Best effort only: arbitrary unlabelled secrets cannot be reliably recognized. Redact before truncating. */
export function sanitizeDiagnostic(text: string, maxChars = MAX_ERROR_CHARS, secrets: readonly string[] = []): string {
  let safe = text;
  for (const secret of [...secrets, process.env.PROXMOX_TOKEN_VALUE ?? ''].filter(Boolean).sort((a, b) => b.length - a.length)) {
    safe = safe.split(secret).join(REDACTED);
  }
  safe = safe
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g, REDACTED)
    .replace(/\bPVEAPIToken=[^\s"'<>]+/gi, `PVEAPIToken=${REDACTED}`)
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9+/_.=:-]+/gi, `$1 ${REDACTED}`)
    .replace(/(https?:\/\/)[^\s/@:]+:[^\s/@]+@/gi, `$1${REDACTED}@`)
    // JSON-style quoted fields (including escaped quotes inside a value).
    .replace(/("[^"\n]*(?:password|passwd|secret|token|authorization|cookie|private[_-]?key|api[_-]?key|credential)[^"\n]*"\s*:\s*)"(?:\\.|[^"\\])*"/gi, `$1"${REDACTED}"`)
    // CLI flags, environment assignments and query parameters, with optional quotes.
    .replace(/((?:--|\b)[\w-]*(?:password|passwd|secret|token|authorization|cookie|private[_-]?key|api[_-]?key|credential)[\w-]*["']?\s*(?:=|:|\s)\s*)(?:"(?:\\.|[^"\\])*"|'[^']*'|[^\s&,;"'<>]+)/gi, `$1${REDACTED}`);
  if (safe.length <= maxChars) return safe;
  return safe.slice(0, Math.max(0, maxChars - TRUNCATED.length)) + TRUNCATED;
}

/** Copy structured log arguments without leaking nested secrets or Error messages/stacks. */
export function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') return sanitizeDiagnostic(value);
  if (typeof value === 'function') return '[omitted: function]';
  if (depth >= 8) return '[omitted: log depth limit]';
  if (value instanceof Error) {
    return { type: sanitizeDiagnostic(value.name), message: sanitizeDiagnostic(value.message), stack: sanitizeDiagnostic(value.stack ?? '') };
  }
  if (Array.isArray(value)) return value.slice(0, 50).map(item => sanitizeLogValue(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 50).map(([key, item]) => [
      sanitizeDiagnostic(key), sensitiveKey.test(key) ? REDACTED : sanitizeLogValue(item, depth + 1),
    ]));
  }
  return value;
}
