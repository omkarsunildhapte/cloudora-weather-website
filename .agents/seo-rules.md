# Cloudora Weather Website — SEO & Launch Readiness Rules

These rules must be followed by all agents working on `cloudora-weather-website`. For coding style and
architecture, see `frontend-rules.md`. This site exists to be found and to convert visitors into
Google Play installs — SEO here isn't optional polish, it's the site's whole job.

## 0. Prerendering Is Live

`@angular/ssr` is configured with `outputMode: 'server'` and `ssr.entry: 'src/server.ts'`, but
`src/app/app.routes.server.ts` sets `RenderMode.Prerender` for **every** route, so in practice
this site is still fully static: `npm run build` prerenders all 12 routes to real static HTML at
build time and no live server is needed to serve them. `outputMode: 'server'` is there so a
future dynamic route can opt into `RenderMode.Server` without an architecture change; until one
does, nothing renders at request time and the deploy is plain static files exactly as before.

Adding such a route means paying for it — see `AGENTS.md`'s rendering section for the measured
Worker cost and the two-line switch in `worker/index.ts`. Do not turn it on speculatively. Per-route
`Title`/`Meta` updates via `SeoService` (`og:title`/`og:description` included) are baked into each
route's prerendered HTML, so non-JS-executing social-preview bots (Facebook/Twitter/LinkedIn link
unfurlers) now see accurate, per-page tags too — not just `src/index.html`'s homepage defaults.

- `src/index.html`'s static `<title>`/`<meta description>`/OG tags still matter as the fallback
  for `index.csr.html` (served for any URL that isn't one of the 11 known routes), so keep them
  representative of the homepage.
- Any new page component must inject `SeoService` per Rule 1 — without it, that route's
  prerendered HTML falls back to whatever the previous route left in `index.html`'s template
  slots, which is wrong for crawlers even though the client hydrates over it correctly.
- `SunriseLayer`'s `ScrollProgressService` (and anything else that touches `window`/`document`
  outside `afterNextRender`/a `PLATFORM_ID` guard) will crash the prerender build, not just warn —
  see the guard pattern already in `scroll-progress.service.ts` if adding new browser-only code
  to a component used on more than one route.

## 1. Per-Page SEO Metadata

Every routable page component must `inject(SeoService)` and call `.update({ title, description })`
in `ngOnInit` — see `Home`, `Features`, `PrivacyPolicy`, `TermsOfService` for the existing
pattern. No two routes may share an identical title/description pair.

## 2. Core Web Vitals & Images

- Use explicit `width`/`height` on every `<img>` to prevent layout shift (CLS) — already done
  for the nav/footer icon and hero logo; keep it for any new image.
- Use `loading="lazy"` for below-the-fold images (see `screenshot-gallery`'s real-screenshot
  slots once populated); reserve eager/`fetchpriority="high"` loading for true above-the-fold
  LCP candidates (the hero logo is the current example).
- Track LCP (< 2.5s), INP (< 200ms), CLS (< 0.1). Don't reference FID — it's retired from Chrome
  tooling, replaced by INP.
- Watch image weight specifically: `public/logo.png` was a 1254×1254, ~1.2MB source export used
  directly in the hero, nav, footer, and favicon — that was the actual LCP bottleneck (5–11s LCP
  measured via Lighthouse before the fix). It's now a 512×512, 256-color PNG (~55KB), sized for
  the largest actual on-page usage (~96–104px CSS, i.e. up to ~312px at 3x DPR) with headroom to
  spare. Keep it that way: if the logo art changes, re-export at ≤512×512, don't drop the source
  PNG straight in.

## 3. Routing & URL Hygiene

- HTML5 `pushState` routing is already the default (no `HashLocationStrategy`) — keep it that
  way.
- The site is served by Cloudflare Workers (`wrangler.jsonc`), not Vercel. Its `assets` binding
  serves each prerendered route from its own real file, and `worker/index.ts` matches the
  `/api/*` routes before handing anything else back to the asset server. Do not reintroduce a
  catch-all rewrite to `/index.html`: with prerendering it silently makes every route serve the
  homepage's HTML while the URL bar stays correct — invisible in a browser (client JS hydrates
  and the router "fixes" it), but wrong for every crawler and social-preview bot, and it poisons
  the sitemap (Rule 8's "check `<loc>`" becomes false once this regresses).
- `not_found_handling: "single-page-application"` in `wrangler.jsonc` is the one deliberate
  exception: it serves `index.html` for paths with no prerendered file so the Angular router can
  render an unknown deep link, rather than Cloudflare's default 404 page.
- `SeoService.update()` sets a canonical `<link>` from `SITE_URL + path` on every route (baked into
  the prerendered HTML, same as title/OG) — keep passing a correct, sitemap-matching `path` on
  every `.update()` call; it's what keeps trailing-slash/query-param variants from being treated as
  separate indexable URLs.
- Trailing slashes are normalised by Cloudflare, and the direction matters. `wrangler.jsonc` sets
  `html_handling: "drop-trailing-slash"`, so `/features` serves 200 and `/features/` redirects to
  it. That is the form `SeoService`'s canonical emits and the form `sitemap.xml` lists — all three
  must stay the same string. Cloudflare's default (`auto-trailing-slash`) does the opposite and
  put every sitemap URL behind a 307 whose target then declared a canonical pointing back at the
  redirecting URL.

## 4. Semantic HTML & Crawlable Links

- Never use `(click)` handlers on `div`/`button` for navigation — always `<a [routerLink]="...">`
  (or a plain `<a href>` for external links like the Play Store button and `mailto:`), so links
  are crawlable and keyboard/screen-reader accessible.
- Use proper `<main>`/`<nav>`/`<footer>` semantic tags — `NavBar` and `Footer` already do this;
  keep new page sections wrapped in `<section>`, not bare `<div>` soup.
- Exactly one `<h1>` per route (each page component currently has exactly one — keep it that way
  when editing).

## 5. Structured Data

`src/index.html` carries a global `MobileApplication` JSON-LD block (`operatingSystem: ANDROID`,
`installUrl` pointing at the Play Store constant) — present on every route, since prerendering
starts from that same shell. On top of that, `Features`, `Contact`, `PrivacyPolicy`, and
`TermsOfService` each add their own page-specific JSON-LD via `SeoData.structuredData` (see
`SeoService.updateStructuredData`) — `WebPage` for the first and last two, `ContactPage` for
Contact. `Home` deliberately has none of its own; the global `MobileApplication` block already
covers it. A route can carry both the global block and a page-specific one — they're separate
`<script>` tags, and that's valid JSON-LD, not a conflict.

If you add a new page or new structured data:

- Pass it via `structuredData` on the `SeoService.update()` call in that page's `ngOnInit` — don't
  hand-roll a `<script>` tag in the template, `SeoService` already handles inject/replace/cleanup
  (including removing it again on client-side route changes, which a template-level script
  wouldn't).
- Keep it JSON-LD, keep it in sync with what's actually rendered on the page, and confirm the
  schema.org type is still an active/supported rich result type before relying on it — supported
  types change over time.
- Reuse `SITE_URL` (`constants/constants.ts`) for `url` fields rather than hardcoding the domain.

## 6. Staging Isolation (when a staging deploy exists)

There is currently no separate staging environment for this project. If one is added, it must
dynamically inject `<meta name="robots" content="noindex, nofollow">` so it never gets indexed
alongside production — do not add this to the production `index.html`.

## 7. `@defer` Discipline

Below-the-fold sections (`home`, `features`, `screenshot-gallery`) use `@defer (on viewport)` —
keep new deferred sections on that same trigger. Never gate primary above-the-fold content (hero,
nav) behind any `@defer`, and especially not `(on interaction/hover)` — that content must be
present at first render for both users and crawlers. Interaction-triggered defer is only for
genuinely non-critical UI, and this project doesn't currently use it anywhere.

## 8. Pre-Launch Checklist

Before treating a deploy as launch-ready:

- [x] `public/robots.txt`, `public/sitemap.xml` and `public/llms.txt` all use the real production
      domain (`https://cloudora-weather.app`, matching `SITE_URL` in `constants/constants.ts`) —
      no placeholder left in any of them. If the domain changes, update all four together.
      `robots.txt` disallows only `/api/` (the Worker routes — real backend
      endpoints, not content; blocking them avoids wasted crawl budget, not a security control)
      — every real page, plus all CSS/JS/image assets, stays crawlable. Don't add more Disallow
      entries as a substitute for `noindex` (Rule 6) — robots.txt keeps crawlers from _visiting_ a
      URL, it doesn't stop that URL from being indexed if something else links to it.
- [x] All 11 routes (`/`, `/features`, `/guides`, the four `/guides/<slug>` pages, `/whats-new`,
      `/contact`, `/privacy-policy`, `/terms-of-service`) pass Rule 1 — no missing/duplicate
      titles or descriptions. Keep `public/sitemap.xml` and `public/llms.txt` in sync with the
      route list — both are separate hand-maintained files, not generated from `app.routes.ts`.
      Guide slugs additionally live in `src/constants/guides.ts` (the index and the per-guide
      cross-links both read from it), so a new guide is four places: route, catalogue, sitemap,
      llms.txt.
- [x] No "App Store"/iOS copy anywhere (`grep -ri "app store\|ios" src/app` returns nothing
      unintended) — this site is Google Play only.
- [x] Every Play Store button resolves to the current, correct `PLAY_STORE_URL`
      (`constants/constants.ts`).
- [ ] Lighthouse/PageSpeed passes Core Web Vitals thresholds (Rule 2) on both mobile and desktop
      — this is a mobile-install funnel, mobile scores matter more than desktop here. Run
      `npm run lighthouse` (audits `/`, `/features/`, `/contact/` against the real prerendered
      build; reports land in `lighthouse-reports/`, gitignored — pass route args to audit others).
      Last local run: Performance 47–61, LCP 4.0–5.3s on all three — **below the <2.5s target**,
      not launch-ready yet. Fixed so far: the oversized `logo.png` (Rule 2) and missing
      `fetchpriority="high"` on the Features/Contact/legal-page hero images. Remaining known
      opportunity: ~83KB of unused JS in the initial bundle (framework/polyfill overhead) — not
      yet investigated. Re-run on a real deploy or a quieter machine before trusting these numbers
      as final; local lab runs on a busy dev box read noisy on TBT in particular.
- [x] `npm run build` succeeds with no new bundle-budget warnings (`angular.json`: 500kB
      warning / 1MB error on the initial bundle) — currently ~145kB initial, well under budget.
