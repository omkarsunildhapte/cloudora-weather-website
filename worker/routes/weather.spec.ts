import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleTile, handleWeather } from './weather';

/**
 * What matters about the proxy is the boundary: the key is added on the way out
 * and never comes back, and a caller cannot steer the request anywhere except
 * the handful of upstream endpoints the app actually uses.
 */

const KEY = { OPENWEATHER_API_KEY: 'owm-test' };
const get = (path: string) => new Request('https://cloudora-weather.app' + path);
const jsonUpstream = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('handleWeather', () => {
  it('adds the key upstream and returns the payload', async () => {
    fetchMock.mockResolvedValueOnce(jsonUpstream({ name: 'Pune', main: { temp: 23 } }));

    const res = await handleWeather(get('/api/owm/weather?lat=18.5&lon=73.9&units=metric'), KEY);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ name: 'Pune', main: { temp: 23 } });

    const upstream = new URL(fetchMock.mock.calls[0][0]);
    expect(upstream.origin + upstream.pathname).toBe('https://api.openweathermap.org/data/2.5/weather');
    expect(upstream.searchParams.get('appid')).toBe('owm-test');
    expect(upstream.searchParams.get('lat')).toBe('18.5');
    expect(upstream.searchParams.get('units')).toBe('metric');
  });

  it('routes geocoding to the geo API rather than the data API', async () => {
    fetchMock.mockResolvedValueOnce(jsonUpstream([]));

    await handleWeather(get('/api/owm/geo/direct?q=Delhi&limit=5'), KEY);

    const upstream = new URL(fetchMock.mock.calls[0][0]);
    expect(upstream.origin + upstream.pathname).toBe('https://api.openweathermap.org/geo/1.0/direct');
    expect(upstream.searchParams.get('q')).toBe('Delhi');
  });

  it('refuses an endpoint that is not on the allowlist', async () => {
    const res = await handleWeather(get('/api/owm/onecall?lat=1&lon=2'), KEY);

    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores a caller-supplied appid instead of forwarding it', async () => {
    fetchMock.mockResolvedValueOnce(jsonUpstream({}));

    await handleWeather(get('/api/owm/weather?lat=1&lon=2&appid=attacker-key'), KEY);

    const upstream = new URL(fetchMock.mock.calls[0][0]);
    expect(upstream.searchParams.getAll('appid')).toEqual(['owm-test']);
  });

  it('drops unknown query parameters', async () => {
    fetchMock.mockResolvedValueOnce(jsonUpstream({}));

    await handleWeather(get('/api/owm/weather?lat=1&lon=2&callback=evil'), KEY);

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has('callback')).toBe(false);
  });

  it('passes the upstream status through without its body', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"cod":429,"message":"over quota"}', { status: 429 }));

    const res = await handleWeather(get('/api/owm/weather?lat=1&lon=2'), KEY);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain('over quota');
  });

  it('fails clean when the key is not configured', async () => {
    const res = await handleWeather(get('/api/owm/weather?lat=1&lon=2'), {});

    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('handleTile', () => {
  it('proxies an allowed layer and caches it at the edge', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('png-bytes', { status: 200, headers: { 'Content-Type': 'image/png' } }),
    );

    const res = await handleTile(get('/api/tiles/precipitation_new/6/44/28.png'), KEY);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('max-age=600');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('https://tile.openweathermap.org/map/precipitation_new/6/44/28.png');
    expect(url).toContain('appid=owm-test');
    expect(init.cf.cacheEverything).toBe(true);
  });

  it('refuses a layer that is not offered', async () => {
    const res = await handleTile(get('/api/tiles/secret_layer/6/44/28.png'), KEY);

    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a malformed tile path rather than building an upstream URL from it', async () => {
    const res = await handleTile(get('/api/tiles/precipitation_new/../../etc/passwd.png'), KEY);

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
