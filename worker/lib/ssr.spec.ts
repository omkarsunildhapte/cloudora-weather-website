import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetFetcher, SsrHandler, serveWithSsr } from './ssr';

/**
 * The ordering is the whole feature. If the renderer were consulted before the
 * asset server, all twelve prerendered routes would silently become
 * per-request renders — the site would still be correct and would still pass
 * every other test, it would just be paying render cost on every navigation
 * and nobody would notice. These tests pin that order down.
 */

const request = (path = '/features') => new Request('https://cloudora-weather.app' + path);

// 204 and 304 are null-body statuses — the Response constructor rejects a body
// on them, so the fixture has to honour that rather than always passing one.
const NULL_BODY_STATUSES = new Set([204, 304]);

const assetsReturning = (status: number, body = 'asset'): AssetFetcher & { calls: number } => {
  const fetcher = {
    calls: 0,
    async fetch() {
      fetcher.calls++;
      return new Response(NULL_BODY_STATUSES.has(status) ? null : body, { status });
    },
  };
  return fetcher;
};

let handler: ReturnType<typeof vi.fn>;
const load = () => Promise.resolve(handler as unknown as SsrHandler);

beforeEach(() => {
  handler = vi.fn();
});

describe('serveWithSsr', () => {
  it('serves a prerendered page from assets without ever calling the renderer', async () => {
    const assets = assetsReturning(200, 'prerendered html');

    const res = await serveWithSsr(request(), assets, load);

    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe('prerendered html');
    expect(handler).not.toHaveBeenCalled();
  });

  it('passes non-404 statuses straight through rather than treating them as misses', async () => {
    for (const status of [200, 204, 301, 304, 500]) {
      handler.mockClear();
      const res = await serveWithSsr(request(), assetsReturning(status), load);
      expect(res.status).toBe(status);
      expect(handler).not.toHaveBeenCalled();
    }
  });

  it('renders when the asset server has no file — how a RenderMode.Server route is served', async () => {
    handler.mockResolvedValue(new Response('rendered', { status: 200 }));

    const res = await serveWithSsr(request('/blog/hello'), assetsReturning(404), load);

    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe('rendered');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('keeps the 404 page when the renderer does not own the route either', async () => {
    handler.mockResolvedValue(null);

    const res = await serveWithSsr(request('/nope'), assetsReturning(404, '404 page'), load);

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe('404 page');
  });

  it('falls back to the 404 page when a render throws, rather than surfacing a 500', async () => {
    handler.mockRejectedValue(new Error('render exploded'));

    const res = await serveWithSsr(request('/blog/hello'), assetsReturning(404, '404 page'), load);

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe('404 page');
  });

  it('serves assets normally when there is no server bundle at all', async () => {
    const assets = assetsReturning(200, 'prerendered html');

    const res = await serveWithSsr(request(), assets, () => Promise.resolve(null));

    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe('prerendered html');
  });

  it('returns the 404 page on a miss when there is no server bundle', async () => {
    const res = await serveWithSsr(request('/nope'), assetsReturning(404, '404 page'), () => Promise.resolve(null));

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe('404 page');
  });

  it('asks the asset server exactly once per request', async () => {
    handler.mockResolvedValue(new Response('rendered'));
    const assets = assetsReturning(404);

    await serveWithSsr(request('/blog/hello'), assets, load);

    expect(assets.calls).toBe(1);
  });

  it('hands the renderer the original request, so the route and method survive', async () => {
    handler.mockResolvedValue(new Response('rendered'));
    const original = request('/blog/hello');

    await serveWithSsr(original, assetsReturning(404), load);

    expect(handler.mock.calls[0][0]).toBe(original);
  });
});
