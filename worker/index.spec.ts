import { describe, expect, it, vi } from 'vitest';
import worker from './index';

/**
 * The root `?section=` redirect. It exists in the Worker rather than the app
 * because a query param, unlike a fragment, is actually sent to the server —
 * so the wrong page never loads at all.
 */
const env = { ASSETS: { fetch: vi.fn(async () => new Response('asset', { status: 200 })) } };
const get = (url: string) => new Request(url);

describe('root ?section= redirect', () => {
  it('sends a sectioned root URL to the features page, keeping the param', async () => {
    const res = await worker.fetch(
      get('https://example.com/?section=air-sun-storms'),
      env as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://example.com/features?section=air-sun-storms');
  });

  it('passes an unknown section through rather than validating it here', async () => {
    // The category list lives in the app; duplicating it in the Worker is how
    // the two would drift. The features page ignores what it cannot match.
    const res = await worker.fetch(get('https://example.com/?section=nonsense'), env as never);

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://example.com/features?section=nonsense');
  });

  it('leaves the plain root alone', async () => {
    const res = await worker.fetch(get('https://example.com/'), env as never);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('asset');
  });

  it('does not touch ?section= on any other path', async () => {
    const res = await worker.fetch(
      get('https://example.com/guides?section=air-sun-storms'),
      env as never,
    );

    expect(res.status).toBe(200);
  });
});
