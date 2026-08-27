import { RenderMode, ServerRoute } from '@angular/ssr';

// All routes on this site are static (no route params), so every route is
// fully prerendered at build time — no live Node server is needed to serve
// this site, it deploys as plain static HTML/JS like before.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
