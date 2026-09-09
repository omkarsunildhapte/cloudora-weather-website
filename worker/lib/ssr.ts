/**
 * Server-side rendering fallback.
 *
 * The site is hybrid (see .agents/seo-rules.md § 0): every route in
 * `app.routes.server.ts` is `RenderMode.Prerender` today and lands on disk as a
 * real file, but `outputMode: "server"` means a route can opt into
 * `RenderMode.Server` without any further plumbing. This is that plumbing.
 *
 * The ordering below is the whole point. Assets are tried FIRST and win
 * whenever they hit, so a prerendered page keeps costing zero render time —
 * calling the Angular engine first would quietly turn all twelve static routes
 * into per-request renders, which is exactly the trade this setup exists to
 * avoid. Only a genuine asset miss reaches the renderer.
 */

/** What the built Angular server bundle's default export accepts and returns. */
export type SsrHandler = (request: Request) => Promise<Response | null> | Response | null;

/** Minimal shape of the assets binding — `Fetcher` without the Workers types. */
export interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

/**
 * Loads the built server bundle, once per isolate.
 *
 * The path resolves only after `ng build` has run; `worker:dev` and
 * `worker:deploy` both build first, so by the time Wrangler bundles this the
 * file exists. Cached including the failure case, so a missing bundle costs one
 * attempt rather than one per request.
 */
let cached: SsrHandler | null | undefined;

export async function loadSsrHandler(): Promise<SsrHandler | null> {
  if (cached !== undefined) return cached;
  try {
    const bundle = (await import('../../dist/cloudora-weather-website/server/server.mjs')) as {
      default?: SsrHandler;
    };
    cached = bundle.default ?? null;
  } catch {
    // No server bundle in this deploy — every route is prerendered, so the
    // asset server alone is a complete answer. Degrading here rather than
    // throwing keeps a build-order mistake from taking the whole site down.
    cached = null;
  }
  return cached;
}

/**
 * Answers a non-API request: the asset server first, the renderer only when
 * there is no file to serve.
 *
 * `load` is injectable so the decision logic can be tested without the built
 * bundle, which does not exist when the worker specs run.
 */
export async function serveWithSsr(
  request: Request,
  assets: AssetFetcher,
  load: () => Promise<SsrHandler | null> = loadSsrHandler,
): Promise<Response> {
  const asset = await assets.fetch(request);

  // Anything the asset server actually holds — prerendered HTML, JS, CSS,
  // images — is returned as-is. `not_found_handling: "404-page"` means a miss
  // arrives as a 404 rather than an error, so that status is the signal.
  if (asset.status !== 404) return asset;

  const handler = await load();
  if (!handler) return asset;

  try {
    const rendered = await handler(request);
    // A null means the renderer does not own this route either, so the asset
    // server's 404 page stands.
    return rendered ?? asset;
  } catch {
    // A render failure must not be worse than having no renderer: fall back to
    // the 404 page rather than surfacing a 500.
    return asset;
  }
}
