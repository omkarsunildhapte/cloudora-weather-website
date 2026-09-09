import { Env } from './lib/email';
import { handleContact } from './routes/contact';
import { handleFeedback } from './routes/feedback';
import { handleAi, AiEnv } from './routes/ai';
import { handleWeather, handleTile, WeatherEnv } from './routes/weather';
import { handleVersion, VersionEnv } from './routes/version';

/**
 * Worker entry point, fronting the prerendered Angular site.
 *
 * Static assets are matched first by the assets binding (see wrangler.jsonc);
 * only requests with no matching file reach this handler, which is why the
 * API routes below can share the origin with the site without shadowing any
 * page. Anything else is handed back to the asset server, which holds a real
 * prerendered file for every route the site has.
 *
 * SSR is deliberately NOT wired in here, even though angular.json is on
 * `outputMode: "server"` and lib/ssr.ts is written and tested. Importing the
 * renderer inlines the entire Angular server app into this Worker: measured,
 * 44.25 KiB -> 665.72 KiB gzipped (200 KiB -> 2.8 MB raw), a 14x increase in
 * the script every single request has to start, for a capability no route uses
 * yet. Every route in app.routes.server.ts is RenderMode.Prerender.
 *
 * To turn it on, when a route actually needs RenderMode.Server:
 *   1. import { serveWithSsr } from './lib/ssr';
 *   2. replace the env.ASSETS.fetch(request) below with
 *      serveWithSsr(request, env.ASSETS)
 * lib/ssr.spec.ts already covers the behaviour, including the ordering that
 * keeps prerendered routes on the zero-cost path.
 *
 * Two kinds of route live here:
 *  - /api/contact and /api/feedback relay mail through Resend (these replaced
 *    the two Vercel serverless functions that used to live in api/).
 *  - /api/owm, /api/tiles and /api/ai proxy the upstream providers so their
 *    keys stay server-side instead of being compiled into the app bundle.
 */
export default {
  async fetch(
    request: Request,
    env: Env & AiEnv & WeatherEnv & VersionEnv & { ASSETS: Fetcher },
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // /?section=air-sun-storms -> /features?section=air-sun-storms.
    //
    // The category anchors live on /features, so the root-level form points at
    // nothing. This is the reason those links carry a query param rather than a
    // fragment: a fragment never reaches the server, so it could only be fixed
    // after the wrong page had already loaded. The value is passed through
    // unvalidated — the features page ignores one it does not recognise, and
    // keeping the category list out of the Worker stops the two from drifting.
    if (pathname === '/' && url.searchParams.has('section')) {
      const target = new URL(url);
      target.pathname = '/features';
      return Response.redirect(target.toString(), 302);
    }

    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname === '/api/feedback') return handleFeedback(request, env);
    if (pathname === '/api/ai') return handleAi(request, env);
    if (pathname === '/api/version') return handleVersion(request, env);
    if (pathname.startsWith('/api/owm/')) return handleWeather(request, env);
    if (pathname.startsWith('/api/tiles/')) return handleTile(request, env);

    return env.ASSETS.fetch(request);
  },
};
