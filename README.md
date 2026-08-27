# Cloudora Weather — Website

Marketing / landing site for the **Cloudora Weather** Android app (`../cloudora-weather-app`).
Angular 22 + Tailwind CSS v4, fully prerendered at build time (`@angular/ssr`, `outputMode: 'static'`),
deployed as a Cloudflare Worker with static assets plus two API routes (`/api/contact`, `/api/feedback`)
that relay email through Resend.

The structure, components and tooling are a 1:1 port of `d:\arithmaxa\arithmaxa-website`, rethemed to
the Cloudora v2 brand palette (see `src/styles.css` and `../TASKS.md` → "Brand — v2") with
weather-specific copy, legal pages, icons and screenshots.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on http://localhost:5300 |
| `npm run build` | Production build, prerenders every route to `dist/cloudora-weather-website/browser` |
| `npm test` | Vitest unit tests for the Angular app (`src/**/*.spec.ts`) |
| `npm run test:worker` | Vitest unit tests for the Worker routes (`worker/**/*.spec.ts`, Node environment) |
| `npm run lighthouse` | Builds, serves the static output, audits `/`, `/features/`, `/contact/` |
| `npm run worker:dev` | Build + `wrangler dev` (needs `.dev.vars`, see `.env.example`) |
| `npm run worker:deploy` | Build + `wrangler deploy` |

## Before launch — values that still need confirming

- `src/constants/constants.ts`: `PLAY_STORE_URL` package id (`com.cloudora.app`), `SITE_URL`,
  `CONTACT_EMAIL`, `COMPANY_URL`. The app's `capacitor.config.ts` still uses `io.ionic.starter`.
- `src/index.html`: GA4 measurement id `G-XXXXXXXXXX`.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`: production domain.
- `worker/lib/email.ts` / Worker secrets: `RESEND_API_KEY`, `MAIL_FROM` on a Resend-verified domain.
- `public/screenshots/`: currently the app design mockups; swap for on-device captures when available.

See `.agents/` for the coding, SEO and launch-readiness rules the site follows.
