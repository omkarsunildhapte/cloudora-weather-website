import { json } from '../lib/http';
import { CORS_HEADERS, preflight } from '../lib/cors';

/**
 * OpenWeatherMap proxy.
 *
 * The app used to call OpenWeatherMap directly with the key compiled into its
 * bundle, which meant anyone could read it out of the shipped JavaScript and
 * spend the quota. The key now lives only as a Worker secret and requests are
 * relayed through here.
 *
 * Two things keep this from being an open relay for arbitrary traffic:
 * the upstream path must be on ALLOWED_PATHS, and `appid` is always taken from
 * the environment — a caller cannot smuggle in one of their own or redirect the
 * request somewhere else.
 *
 * Responses are edge-cached. Weather observations only update every ~10
 * minutes upstream, so a short TTL cuts both latency and quota consumption
 * without the app ever showing meaningfully stale data.
 */

export interface WeatherEnv {
  OPENWEATHER_API_KEY?: string;
}

const DATA_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0';
const TILE_BASE = 'https://tile.openweathermap.org/map';

/** Upstream data paths the app actually uses. Anything else is rejected. */
const ALLOWED_PATHS = new Set([
  'weather',
  'forecast',
  'air_pollution',
  'air_pollution/forecast',
  'air_pollution/history',
  'geo/direct',
]);

/** Tile layers the radar page offers. */
const ALLOWED_LAYERS = new Set(['precipitation_new', 'clouds_new', 'temp_new', 'wind_new']);

/** Query parameters worth forwarding. `appid` is deliberately absent. */
const ALLOWED_PARAMS = new Set(['lat', 'lon', 'q', 'units', 'cnt', 'start', 'end', 'limit']);

const DATA_CACHE_SECONDS = 300; // observations refresh upstream every ~10 min
const TILE_CACHE_SECONDS = 600; // radar tiles roll over every ~10 min

function missingKey(): Response {
  return json({ ok: false, error: 'Weather service is not configured.' }, 500, CORS_HEADERS);
}

/**
 * `/api/owm/<path>` — JSON endpoints.
 * Example: `/api/owm/weather?lat=18.5&lon=73.9&units=metric`
 */
export async function handleWeather(request: Request, env: WeatherEnv): Promise<Response> {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405, CORS_HEADERS);
  }
  if (!env.OPENWEATHER_API_KEY) return missingKey();

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/owm\//, '');
  if (!ALLOWED_PATHS.has(path)) {
    return json({ ok: false, error: 'Unknown weather endpoint.' }, 404, CORS_HEADERS);
  }

  const base = path.startsWith('geo/') ? GEO_BASE : DATA_BASE;
  const upstreamPath = path.startsWith('geo/') ? path.slice('geo/'.length) : path;
  const upstream = new URL(`${base}/${upstreamPath}`);
  for (const [k, v] of url.searchParams) {
    if (ALLOWED_PARAMS.has(k)) upstream.searchParams.set(k, v);
  }
  upstream.searchParams.set('appid', env.OPENWEATHER_API_KEY);

  return relay(upstream, DATA_CACHE_SECONDS, 'application/json');
}

/**
 * `/api/tiles/<layer>/<z>/<x>/<y>.png` — map tiles.
 *
 * Tiles are by far the highest-volume request the app makes, which is why they
 * get the longer cache TTL: a repeat view of the same area is served from
 * Cloudflare's edge and never reaches OpenWeatherMap.
 */
export async function handleTile(request: Request, env: WeatherEnv): Promise<Response> {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405, CORS_HEADERS);
  }
  if (!env.OPENWEATHER_API_KEY) return missingKey();

  const { pathname } = new URL(request.url);
  const match = pathname.match(/^\/api\/tiles\/([a-z_]+)\/(\d{1,2})\/(\d{1,7})\/(\d{1,7})\.png$/);
  if (!match) {
    return json({ ok: false, error: 'Malformed tile request.' }, 400, CORS_HEADERS);
  }

  const [, layer, z, x, y] = match;
  if (!ALLOWED_LAYERS.has(layer)) {
    return json({ ok: false, error: 'Unknown tile layer.' }, 404, CORS_HEADERS);
  }

  const upstream = new URL(`${TILE_BASE}/${layer}/${z}/${x}/${y}.png`);
  upstream.searchParams.set('appid', env.OPENWEATHER_API_KEY);

  return relay(upstream, TILE_CACHE_SECONDS, 'image/png');
}

/**
 * Fetches upstream with Cloudflare's edge cache in front, and returns the body
 * with CORS headers attached. The upstream URL (carrying the key) is used as
 * the cache key by Cloudflare internally but is never echoed back to the
 * caller — only status, content type and body cross the boundary.
 */
async function relay(upstream: URL, ttl: number, contentType: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(upstream.toString(), {
      cf: { cacheEverything: true, cacheTtl: ttl },
    });
  } catch {
    return json({ ok: false, error: 'Weather service is unreachable.' }, 502, CORS_HEADERS);
  }

  if (!response.ok) {
    // Pass the upstream status through so the app can tell "no data here" (404)
    // from "we are over quota" (429) — but never the upstream's error body,
    // which can echo the query string back.
    return json(
      { ok: false, error: `Weather service returned ${response.status}.` },
      response.status,
      CORS_HEADERS,
    );
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': response.headers.get('Content-Type') ?? contentType,
      'Cache-Control': `public, max-age=${ttl}`,
    },
  });
}
