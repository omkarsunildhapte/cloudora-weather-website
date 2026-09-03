# Cloudora Weather Website — Agent Rules

These rules must be followed by all agents working on the `cloudora-weather-website` project — the
public, promotional/marketing website (Angular 22 + Tailwind CSS v4) whose sole conversion goal
is driving Google Play installs of the real `cloudora-weather-app`. This site is Google Play only —
never add Apple App Store references, links, or copy.

This site is **prerendered, then hydrated**: `angular.json` sets `outputMode: "static"`, so every
route in `app.routes.ts` is built to its own real `index.html` at build time, and `app.config.ts`
calls `provideClientHydration()` so the browser adopts that markup instead of re-rendering it.
There is no request-time server rendering — `app.config.server.ts` and `main.server.ts` exist
only to run the prerender.

The practical consequence is that anything a visitor-specific value decides must not be decided
during construction, or the client’s first render disagrees with the prerendered HTML and trips
a hydration mismatch. `shared/cookie-consent` is the worked example: it reads the stored consent
decision in `afterNextRender`, so the banner is absent from the static HTML and appears once
hydration finishes. Follow that pattern for anything similar (A/B copy, geo hints, stored
preferences). Request-time-only APIs (the `RESPONSE` token, `withEventReplay()`) still do not
apply — there is no server at render time.

- **Code architecture, style, testing:** see `frontend-rules.md`.
- **SEO, Core Web Vitals, launch readiness:** see `seo-rules.md`.

## Deployment target: Cloudflare Workers

The site deploys to Cloudflare Workers (`wrangler.jsonc`, `npm run worker:deploy`). The prerendered
output is served by the `assets` binding; `worker/index.ts` matches the `/api/*` routes first and
hands everything else back to that asset server. This replaced an earlier Vercel deploy — there is
no `vercel.json`, no `api/` directory and no Vercel CLI in this project any more.

The Worker carries two kinds of route:

- **Mail relays** — `/api/contact` and `/api/feedback` send through **Resend**
  (`worker/lib/email.ts`), not SMTP. `RESEND_API_KEY`, `MAIL_FROM`, `CONTACT_TO_EMAIL` and
  `FEEDBACK_TO_EMAIL` are Worker secrets.
- **Provider proxies** — `/api/owm`, `/api/tiles` and `/api/ai` hold the OpenWeatherMap, Gemini
  and OpenRouter credentials so the mobile app ships none of them. `OPENWEATHER_API_KEY`,
  `GEMINI_API_KEY` and `OPENROUTER_API_KEY` are Worker secrets too.

Every route is rate-limited per IP and body-size capped (`worker/lib/guard.ts`). Set secrets with
`npx wrangler secret put <NAME>`; `.dev.vars` holds them for `npm run worker:dev` and is
gitignored. Never put any of them in `src/environments/*` — Angular compiles those into the
browser bundle.

- Routes degrade cleanly rather than throwing: an unconfigured mail relay answers a `500` with a
  real message, and the rate limiter fails **open** if its binding errors. Don’t "fix" either by
  hardcoding credentials or by removing the guard.
- If another feature needs server-side logic, it belongs in `worker/routes/` the same way —
  don’t reach for request-time `@angular/ssr` just to get a backend. The rendering stance above
  is about *rendering*, not about having zero server-side code.
- `ng serve` does **not** run the Worker. Use `npm run worker:dev` (build + `wrangler dev`, needs
  `.dev.vars`) to exercise `/api/*` locally.
- Worker routes have their own Vitest config: `npm run test:worker`
  (`vitest.worker.config.ts`, Node environment). `npm test` only picks up specs under `src/`.

## Sibling project: cloudora-weather-app

`d:\cloudora\cloudora-weather-app` is the real product this site promotes. Keep these in sync — treat
as a hard rule, not a suggestion:

1. **Play Store link.** `src/app/shared/constants.ts`'s `PLAY_STORE_URL` must always resolve to
   the app's actual, current Play Store package id (`com.cloudora.app` as of this writing, from
   `cloudora-weather-app/capacitor.config.ts`). If the app's package id ever changes, update this
   constant in the same change.
2. **Feature copy.** `src/app/pages/home/home.ts` and `src/app/pages/features/features.ts`
   describe real app features only — never advertise a feature that doesn't exist in
   `cloudora-weather-app` yet. When a feature is added/changed/removed in the app, update the matching
   copy here in the same session.
3. **Privacy Policy / Terms of Service.** This site's `/privacy-policy` and `/terms-of-service`
   pages are adapted copies of `cloudora-weather-app`'s in-app legal pages (source of truth). This
   site's copy also serves as the **publicly hosted Privacy Policy URL required for the Google
   Play Store listing** — keep it accurate and in sync whenever the app's data collection,
   permissions, or third-party integrations change.
4. **Screenshots.** `src/app/shared/screenshot-gallery` currently renders CSS-only placeholders
   annotated with what real screenshot belongs in each slot (see the component's template
   comments). Once real on-device screenshots exist, drop them into `public/screenshots/` and
   wire up the `src` field — don't regenerate more AI-art placeholders instead (see Rule 12 in
   `frontend-rules.md`).

---

## Coding Rules & Guidelines

These general rules must be followed by all agents working on this project.

### 1. Import Paths
Absolute paths with the `@` alias must be used everywhere. Relative paths (`../` or `./`) are strictly prohibited.

Allowed Aliases (mapped in `tsconfig.json`):
- `@shared/*`: `app/shared/*`
- `@pages/*`: `app/pages/*`
- `@services/*`: `services/*`
- `@app/*`: `app/*`
- `@environments/*`: `environments/*`
- `@appTypes/*`: `types/*`
- `@guards/*`: `guards/*`
- `@interceptors/*`: `interceptors/*`
- `@constants/*`: `constants/*`

### 2. Import Formatting
Imports must be kept on a single line where possible, avoiding multi-line destructured imports that take up excessive vertical space.
Example:
```typescript
// NOT ALLOWED:
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

// ALLOWED:
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
```

### 3. Strict Typing
The use of `any` is strictly prohibited. Use `unknown` or create proper interfaces/types. Server-side data must be properly typed when received.
This also applies to templates: the `$any()` template cast is prohibited. For DOM event handlers (e.g. `(input)`, `(change)`), pass the raw `$event` to a component method typed to accept `Event`, then cast `event.target` to the correct HTML element type (e.g. `event.target as HTMLSelectElement`) inside the `.ts` file — never inline in the template.

### 4. CSS Optimization
Avoid dumping component-specific styles into the global styles.css. If a CSS class is only used by one specific component, it must be placed in that component's respective .css file. Global styles.css should only contain design tokens, generic utility classes (like cta-pulse or glass-panel) and base resets.

### 5. Modern Templates & Control Flow
Do not import CommonModule. Use Angular 14+ standalone components and specific imports. Use the built-in `@if`, `@for`, and `@switch` control flow syntax exclusively. When using `@for`, a unique tracking key is **mandatory** (e.g., `@for (item of items(); track item.id)`) to ensure optimal DOM reconciliation.

### 6. Signals-First Reactivity
Use Angular Signals exclusively for reactivity and state management instead of traditional RxJS `BehaviorSubjects` or standard properties.
- **Component I/O:** Use `input()`, `input.required()`, `output()`, and `model()` instead of legacy `@Input`/`@Output` decorators.
- **Dependent State:** Use `linkedSignal()` for state that needs to reset based on a source signal, rather than manual `effect()` logic.
- **Queries:** Use signal-based `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` instead of `@ViewChild`/`@ContentChild`.

### 7. Dependency Injection
Prefer using the inject() function for dependency injection over traditional constructor parameter injection. Constructors should primarily be used for initialization logic, not for declaring dependencies.

### 8. Data Fetching (Resource APIs)
Angular services and components must use the built-in `resource()`, `rxResource()`, or `httpResource()` APIs for asynchronous operations and API calls, rather than manual RxJS subscriptions or returning raw Promises. This ensures declarative, auto-canceling async data fetching.

### 9. Service Layer Typings
The service layer must **never** declare its own data models/interfaces inline. All interfaces (like `ScreenshotSlot`, `SeoData`) must be declared in the types/ folder and imported using the `@appTypes/` alias.

### 10. Function Formatting
Functions with a single parameter should be kept on a single line where possible, avoiding multi-line formatting for single arguments. (e.g., `update(data: SeoData): void` instead of wrapping the argument on a new line). Prettier's printWidth has been increased to 140 to prevent aggressive wrapping of function signatures.

### 11. State Management (Loading States)
Do not maintain generic UI loading states (like `isLoading`) manually within components or services via boolean flags. Components should rely on the reactive getters provided by Resource APIs (`resource.isLoading()`, `resource.error()`) to automatically manage their loading states when fetching data.

### 12. Service Testing
Whenever a service is created or updated, you must write or update the corresponding unit test cases for it. Ensure full coverage of the service's logic, including mock HTTP calls if it's a data service.

### 13. SEO & Core Web Vitals
**Important**: this site is prerendered at build time and hydrated in the browser (see the rendering section at the top). Request-time SSR patterns (`RESPONSE` token, `withEventReplay()`, SSR TTFB timeouts, Express trailing-slash middleware) still do not apply — there is no server at render time — but the prerendered HTML *is* what crawlers receive, so treat it as the real first paint.

- Every routable page component MUST inject `SeoService` and call `setPage()` or `update()` with the appropriate page metadata so title, description, canonical, and robots meta are set correctly.
- Always use Angular's `NgOptimizedImage` (`ngSrc` instead of `src`, along with `width`, `height`, and `priority` attributes) to prevent layout shifts and maximize Core Web Vitals performance.
- Avoid using HashLocationStrategy; HTML5 pushState routing is required.
- **Semantic HTML & Links**: Do not use `(click)` handlers on `div` or `button` for navigation. ALWAYS use standard native `<a [routerLink]="...">` tags. Use proper `<main>`, `<article>`, and `<nav>` semantic tags and ensure only one `<h1>` per route.
- **Staging Isolation**: Non-production environments MUST dynamically inject a `<meta name="robots" content="noindex, nofollow" />` tag to prevent staging sites from polluting search indexes.
- **@defer Traps**: Do NOT use client-triggered `@defer (on interaction/hover)` for primary SEO content. Only use it for below-the-fold or non-critical UI elements.
- **Crawlable Pagination**: If infinite scrolling is used, a visually hidden or footer-based `<nav>` with hard `<a [routerLink]>` pagination links MUST be exposed for crawlers.
- **Dynamic Open Graph Images**: Dynamic routes must map `og:image` to a valid high-quality static asset rather than a generic fallback.

### 14. Zero-Dependency State Encapsulation
Services must manage state using private writable signals (`signal()`) exposed to components via public read-only views (`computed()`), avoiding heavy external libraries like NgRx unless absolutely necessary.

### 15. Functional Routing & Interceptors
Class-based guards and interceptors are legacy. Use functional `HttpInterceptorFn`, `CanActivateFn`, and `ResolveFn`. Enable `withComponentInputBinding()` in router config to automatically map route params to component signal inputs.

### 16. Signal-Driven Forms
Use `@angular/forms/signals` (`formGroup`, `formControl`) or bridge legacy Reactive Forms with `toSignal(control.valueChanges)`. Avoid manual RxJS form subscriptions in the UI.

### 17. Fine-Grained Hydration & Zoneless
- Applications must aim to be Zoneless (`provideExperimentalZonelessChangeDetection()`).
- Use `@defer (hydrate on ...)` for granular client-side hydration (e.g., `viewport`, `hover`, `idle`) to minimize JS payload execution times.

### 18. Security & Trusted Types
- SSR engines must dynamically generate and inject CSP Nonces for inline scripts.
- The web server must enforce Trusted Types (`require-trusted-types-for 'script'`) to eliminate DOM-based XSS attacks natively.

### 19. Animations & Assets
Prefer Web Animations API and CSS keyframes bound to component host classes over `@angular/animations` to save ~60KB on bundle sizes.

### 20. Strict Template Diagnostics
Enforce strict template checks (`strictTemplates`, `strictInputAccessModifiers`, `invalidBananaInBox`) in `tsconfig.json` to catch unhandled signals or missing control flows at build time.

### 21. Mandatory File Structure & Testing
- **Components:** Every Angular component MUST have its own dedicated `.ts`, `.html`, `.css`, and `.spec.ts` file. Inline templates or inline styles within the `.ts` file are strictly prohibited.
- **Other Elements:** All other architectural pieces (Services, Directives, Pipes, Guards, Interceptors, Utils) MUST have a `.ts` file and an accompanying `.spec.ts` file for unit testing.

### 22. No Hardcoded Values in TypeScript
Never use magic numbers or hardcoded string values directly in TypeScript (`.ts`) files. 
- All configuration values, API endpoints, status strings, or numeric thresholds must be extracted into constants (`const`), `enum`s, or environment variables. 
- *Exception:* Hardcoded string values are permitted in HTML template (`.html`) files for direct UI display purposes.
