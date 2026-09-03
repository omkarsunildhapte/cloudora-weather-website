import { describe, expect, it } from 'vitest';
import { handleVersion } from './version';

const req = (method = 'GET') => new Request('https://example.com/api/version', { method });

describe('handleVersion', () => {
  it('returns defaults when no env overrides are set', async () => {
    const res = handleVersion(req(), {});
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body['ok']).toBe(true);
    expect(body['latest']).toBe('0.0.1');
    expect(body['minSupported']).toBe('0.0.1');
    expect(body['storeUrl']).toContain('com.cloudora.app');
  });

  it('prefers the Worker vars over the baked-in defaults', async () => {
    const res = handleVersion(req(), {
      APP_LATEST_VERSION: '1.2.0',
      APP_MIN_SUPPORTED_VERSION: '1.0.0',
    });
    const body = (await res.json()) as Record<string, unknown>;
    expect(body['latest']).toBe('1.2.0');
    expect(body['minSupported']).toBe('1.0.0');
  });

  it('answers CORS preflight and rejects non-GET', () => {
    expect(handleVersion(req('OPTIONS'), {}).status).toBe(204);
    expect(handleVersion(req('POST'), {}).status).toBe(405);
  });

  it('is edge-cacheable and CORS-open', () => {
    const res = handleVersion(req(), {});
    expect(res.headers.get('Cache-Control')).toContain('max-age=300');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
