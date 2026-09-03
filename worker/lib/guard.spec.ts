import { describe, expect, it, vi } from 'vitest';
import { MAX_BODY_BYTES, clientIp, rateLimited, readJsonCapped, tooLarge } from './guard';

const req = (init: RequestInit = {}) =>
  new Request('https://cloudora-weather.app/api/ai', { method: 'POST', ...init });

const allow = { limit: vi.fn().mockResolvedValue({ success: true }) };
const deny = { limit: vi.fn().mockResolvedValue({ success: false }) };

describe('clientIp', () => {
  it('reads the edge-set header, not the spoofable one', () => {
    const r = req({ headers: { 'CF-Connecting-IP': '1.2.3.4', 'X-Forwarded-For': '9.9.9.9' } });
    expect(clientIp(r)).toBe('1.2.3.4');
  });

  it('falls back to a constant when the header is absent', () => {
    expect(clientIp(req())).toBe('unknown');
  });
});

describe('rateLimited', () => {
  it('allows a request inside the budget', async () => {
    expect(await rateLimited(allow, req())).toBeNull();
  });

  it('rejects with 429 and Retry-After once over', async () => {
    const res = await rateLimited(deny, req());
    expect(res?.status).toBe(429);
    expect(res?.headers.get('Retry-After')).toBe('60');
    await expect(res?.json()).resolves.toMatchObject({ ok: false });
  });

  it('merges the caller CORS headers into the 429', async () => {
    const res = await rateLimited(deny, req(), { 'Access-Control-Allow-Origin': '*' });
    expect(res?.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('keys the limit on the caller IP', async () => {
    allow.limit.mockClear();
    await rateLimited(allow, req({ headers: { 'CF-Connecting-IP': '5.6.7.8' } }));
    expect(allow.limit).toHaveBeenCalledWith({ key: '5.6.7.8' });
  });

  // A limiter that is itself broken must not take the endpoint down with it.
  it('fails open when the binding is not configured', async () => {
    expect(await rateLimited(undefined, req())).toBeNull();
  });

  it('fails open when the binding throws', async () => {
    const broken = { limit: vi.fn().mockRejectedValue(new Error('binding down')) };
    expect(await rateLimited(broken, req())).toBeNull();
  });
});

describe('tooLarge', () => {
  it('rejects a body that declares more than the cap', () => {
    const res = tooLarge(req({ headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } }));
    expect(res?.status).toBe(413);
  });

  it('allows a normal body', () => {
    expect(tooLarge(req({ headers: { 'Content-Length': '512' } }))).toBeNull();
  });

  // Content-Length is client-supplied and omitted entirely by chunked encoding,
  // which is why readJsonCapped below re-checks what actually arrived.
  it('cannot see a body that declares no length', () => {
    expect(tooLarge(req())).toBeNull();
  });
});

describe('readJsonCapped', () => {
  it('parses a normal JSON body', async () => {
    const read = await readJsonCapped<{ prompt: string }>(req({ body: JSON.stringify({ prompt: 'hi' }) }));
    expect('body' in read && read.body.prompt).toBe('hi');
  });

  it('rejects an oversized body even with no Content-Length declared', async () => {
    const big = JSON.stringify({ prompt: 'x'.repeat(MAX_BODY_BYTES + 100) });
    const r = req({ body: big });
    // The header route misses it entirely...
    expect(tooLarge(r)).toBeNull();
    // ...so the byte count has to catch it.
    const read = await readJsonCapped(r);
    expect('response' in read && read.response.status).toBe(413);
  });

  it('measures UTF-8 bytes, not UTF-16 units', async () => {
    // Four-byte characters: half as many code units as bytes, so a length-based
    // check would let roughly twice the intended payload through.
    const emoji = '😀'.repeat(MAX_BODY_BYTES / 4);
    const read = await readJsonCapped(req({ body: JSON.stringify({ prompt: emoji }) }));
    expect('response' in read && read.response.status).toBe(413);
  });

  it('yields an empty object for unparseable JSON so validation returns 400, not 500', async () => {
    const read = await readJsonCapped(req({ body: 'not json at all' }));
    expect('body' in read && read.body).toEqual({});
  });
});
