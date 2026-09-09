import { RenderMode, ServerRoute } from '@angular/ssr';

// Hybrid, but static in practice today.
//
// `angular.json` sets `outputMode: "server"`, which is what makes a
// `RenderMode.Server` route possible at all — but nothing here uses one. Every
// route on this site is parameterless with no per-request data, so all of them
// stay `Prerender` and land on disk as real files. Nothing is rendered at
// request time and the site still deploys as plain static HTML/JS.
//
// To add a genuinely dynamic route, put it ABOVE the catch-all with
// `renderMode: RenderMode.Server` — order matters, `**` would otherwise claim
// it and prerendering would fail for want of a parameter value:
//
//   { path: 'blog/:slug', renderMode: RenderMode.Server },
//   { path: '**',         renderMode: RenderMode.Prerender },
//
// No other wiring is needed: worker/lib/ssr.ts already falls through to the
// renderer whenever the asset server has no file (and only then, so the
// prerendered routes keep costing zero render time).
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
