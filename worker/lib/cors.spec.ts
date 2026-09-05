import { describe, expect, it } from 'vitest';
import { CORS_HEADERS, preflight } from './cors';

/**
 * The wildcard origin is a deliberate decision documented in cors.ts: the app
 * calls these routes from a Capacitor WebView whose origin cannot be
 * enumerated, and every proxied route is unauthenticated and read-only. These
 * tests pin the shape so a future change to it has to be deliberate.
 */

describe('CORS_HEADERS', () => {
  it('answers any origin — the Capacitor WebView has no stable one to allowlist', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Origin']).toBe('*');
  });

  it('allows only the methods the proxy routes actually serve', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
  });

  it('does not allow credentials, which a wildcard origin could not carry anyway', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Credentials']).toBeUndefined();
  });
});

describe('preflight', () => {
  it('answers 204 with no body', async () => {
    const res = preflight();
    expect(res.status).toBe(204);
    await expect(res.text()).resolves.toBe('');
  });

  it('carries the CORS headers, without which the real request is never sent', () => {
    const res = preflight();
    for (const [name, value] of Object.entries(CORS_HEADERS)) {
      expect(res.headers.get(name)).toBe(value);
    }
  });
});
