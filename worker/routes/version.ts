import { json } from '../lib/http';
import { CORS_HEADERS, preflight } from '../lib/cors';

/**
 * App version check.
 *
 * The app calls GET /api/version on startup and compares its own baked-in
 * version against these values:
 *
 *   latest        newest published build — app may show a gentle "update
 *                 available" nudge when it's behind this.
 *   minSupported  oldest version still allowed to talk to this API — app
 *                 should block with an "update required" screen below this
 *                 (used when an API change would break old clients).
 *
 * Values come from Worker vars so a release bump is one dashboard/wrangler
 * change (`APP_LATEST_VERSION`, `APP_MIN_SUPPORTED_VERSION`), no code deploy
 * needed; the constants below are the fallbacks.
 */
export interface VersionEnv {
  APP_LATEST_VERSION?: string;
  APP_MIN_SUPPORTED_VERSION?: string;
}

const DEFAULT_LATEST = '0.0.1';
const DEFAULT_MIN_SUPPORTED = '0.0.1';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cloudora.app';

export function handleVersion(request: Request, env: VersionEnv): Response {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405, CORS_HEADERS);
  }

  return json(
    {
      ok: true,
      latest: env.APP_LATEST_VERSION || DEFAULT_LATEST,
      minSupported: env.APP_MIN_SUPPORTED_VERSION || DEFAULT_MIN_SUPPORTED,
      storeUrl: PLAY_STORE_URL,
    },
    200,
    // Cached at the edge so a version check never counts against anything and
    // survives brief origin hiccups; 5 minutes keeps rollout latency low.
    { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=300' },
  );
}
