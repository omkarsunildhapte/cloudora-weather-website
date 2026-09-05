import { describe, expect, it } from 'vitest';
import { json, readJson } from './http';

/**
 * Both helpers exist to keep a malformed request from becoming a 500. The
 * envelope has to stay exactly what src/app/pages/contact and the app's
 * FeedbackService already parse, and readJson has to swallow garbage so the
 * per-field validation downstream is what rejects it.
 */

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request('https://cloudora-weather.app/api/contact', { method: 'POST', body, headers });

describe('json', () => {
  it('serialises the body and defaults to 200', async () => {
    const res = json({ ok: true });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it('always declares a JSON content type, so clients can parse the envelope', () => {
    expect(json({ ok: true }).headers.get('Content-Type')).toBe('application/json');
  });

  it('carries the status through', () => {
    expect(json({ ok: false, error: 'nope' }, 400).status).toBe(400);
  });

  it('merges extra headers alongside the content type — the CORS routes depend on this', () => {
    const res = json({ ok: true }, 200, { 'Access-Control-Allow-Origin': '*' });
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('lets a caller override the content type rather than duplicating it', () => {
    const res = json('plain', 200, { 'Content-Type': 'text/plain' });
    expect(res.headers.get('Content-Type')).toBe('text/plain');
  });
});

describe('readJson', () => {
  it('parses a well-formed body', async () => {
    await expect(readJson<{ name: string }>(post('{"name":"Ada"}'))).resolves.toEqual({ name: 'Ada' });
  });

  it('returns {} for a malformed body instead of throwing a 500', async () => {
    await expect(readJson(post('{not json'))).resolves.toEqual({});
  });

  it('returns {} for an empty body', async () => {
    await expect(readJson(post(''))).resolves.toEqual({});
  });

  it('returns {} for a JSON null, which would otherwise become a null body', async () => {
    await expect(readJson(post('null'))).resolves.toEqual({});
  });
});
