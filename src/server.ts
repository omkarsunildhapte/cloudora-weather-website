import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

/**
 * SSR entry point.
 *
 * `AngularAppEngine`, not `AngularNodeAppEngine`: this one speaks Web-standard
 * `Request`/`Response` and has no Node dependency, so the same handler runs
 * under the Cloudflare Workers runtime the site deploys to. The Node variant
 * would need `node:http` objects that do not exist there.
 *
 * Required by `angular.json`'s `ssr.entry` as soon as `outputMode` is
 * `"server"` — which it is, so that a route can opt into `RenderMode.Server`.
 * Today none do (see `app.routes.server.ts`): all 11 routes are still
 * `RenderMode.Prerender`, so this is exercised at *build* time to produce their
 * static HTML and never at runtime. Nothing about the current deploy changes.
 *
 * Returning `null` rather than a 404 is deliberate: it tells the caller "not
 * mine", so `worker/index.ts` can hand the request on to the static asset
 * server instead of the Worker swallowing it. A 404 here would shadow every
 * real file — including the prerendered pages themselves.
 */
const angularApp = new AngularAppEngine();

const handler = createRequestHandler(async (request: Request) => await angularApp.handle(request));

export default handler;
