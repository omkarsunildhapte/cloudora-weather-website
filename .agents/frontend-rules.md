# Cloudora Weather Website — Frontend Architecture & Style Rules

These rules must be followed by all agents working on `cloudora-weather-website`. For SEO and launch
readiness, see `seo-rules.md`.

## 1. Import Paths
Absolute paths with the `@` alias must be used everywhere. Relative paths (`../` or `./`) are strictly prohibited.

Allowed Aliases (mapped in `tsconfig.json`):
- `@shared/*`: `app/shared/*`
- `@pages/*`: `app/pages/*`
- `@services/*`: `services/*`
- `@app/*`: `app/*`
- `@environments/*`: `environments/*`
- `@directives/*`: `directives/*`
- `@appTypes/*`: `types/*`
- `@guards/*`: `guards/*`
- `@interceptors/*`: `interceptors/*`
- `@constants/*`: `constants/*`

## 2. Import Formatting
Keep imports on a single line where reasonable; Prettier's `printWidth` is 100
(`.prettierrc`) — let it wrap only when a line genuinely needs it.

## 3. Strict Typing
`any` is prohibited — use `unknown` or a proper interface (`ScreenshotSlot` in
`shared/screenshot-gallery` is the existing pattern to follow). No `$any()` template casts; type
event handlers as `Event` and cast `event.target` inside the `.ts` file.

## 4. CSS Optimization
Component-specific styling belongs in that component's own `.css` file. `src/styles.css` is
reserved for brand tokens (`@theme` block: `--color-brand-*`, `--font-sans`), the Outfit font
import, and truly global utility classes (`.glass-panel`, `.glass-nav`, `.placeholder-fill`,
`.snap-row`) — not one-off page styling. Most layout in this project is Tailwind utility classes
directly in templates, which is intentional; only add component CSS for what Tailwind can't
express cleanly (keyframes, scroll-snap, the placeholder gradient animation).

## 5. Modern Templates & Control Flow
Do not import `CommonModule`. Use standalone components with explicit `imports` and the built-in
`@if`/`@for`/`@switch`. `@for` requires a `track` expression — use a stable field (`f.title`,
`item.caption`), not array index.

Below-the-fold section entrances use `@defer (on viewport) { ... } @placeholder { ... }` — not a
custom `IntersectionObserver` directive. This both defers rendering (real perf win — content isn't
built until it's about to be seen) and gives a free "reveal" moment: pair the deferred block's root
element with the shared `.animate-fade-in-up` class (`styles.css`) for the entrance, plus
`[style.animation-delay.ms]="i * N"` for staggered items in a `@for`. Give the `@placeholder` a
`min-height` roughly matching the real content to avoid layout shift on trigger. See
`shared/screenshot-gallery`, `pages/home`, and `pages/features` for the pattern. The hero on each
page is the one exception — it's above the fold and uses its own on-load `.hero-in`/`.feat-in`
stagger classes instead, since there's nothing to defer until scrolled into view.

## 6. Signals-First Reactivity
Use `input()`/`input.required()` for component props (see `FeatureCard`, `PlayStoreButton`,
`ScreenshotGallery`) and `signal()` for local component state (see `NavBar.mobileMenuOpen`).
This is a marketing site with minimal state — don't reach for `computed()`/`linkedSignal()`
machinery where a plain signal already reads clearly.

## 7. Dependency Injection
Use `inject()` over constructor injection — see `SeoService` usage in every page component
(`Home`, `Features`, `PrivacyPolicy`, `TermsOfService`).

## 8. Data Fetching
This site has no reactive/GET-style HTTP-backed data (all page content is static/hardcoded copy).
If that kind of content is ever added (e.g. a live download counter, remote-config'd feature
flags), use `resource()`/`httpResource()` rather than manual `.subscribe()` — there is no
SSR/Transfer State here, so results are purely client-fetched.

**Exception — form submissions:** `pages/contact` posts to `api/contact` via a plain `fetch()`
call inside an imperative `async submit()` method, not `httpResource()`. This is intentional, not
an oversight: the Resource APIs are built around reactive GET-style data binding (a signal input
drives a fetch, the result renders), which doesn't map cleanly onto "POST on user submit, branch
on success/error, reset the form" — forcing that into `resource()` would fight the API rather than
use it. Any *other* future POST/PUT-style user action (not a reactive data read) should follow
this same plain-`fetch()`-in-an-async-method pattern rather than contorting `resource()` to fit.

**Note on `api/`:** as of the contact form, this repo also has server-side code — see
`AGENTS.md`'s "Deployment target: Vercel" section. `api/contact.ts` and `api/_lib/email-config.ts`
are Vercel serverless functions/Node modules, not part of the Angular application (`src/`) at all,
so this document's rules (standalone components, signals, Angular DI, etc.) don't apply to them —
they're plain TypeScript/Node, reviewed against normal backend conventions instead.

## 9. Constants & Typings
`src/constants/constants.ts` (`PLAY_STORE_URL`, `CONTACT_EMAIL`, `COMPANY_NAME`, `COMPANY_URL`,
imported via the `src/constants` barrel) is the single source of truth for site-wide values — never
hardcode the Play Store URL, contact email, or company site link a second time anywhere; import
from there. Reusable shapes used by more than one unrelated feature area (`ScreenshotSlot`,
`SeoData`, `PlayStoreButtonVariant`) live in `src/types/` (imported via the `src/types` barrel);
shapes local to a single component or page (`Contact`'s `SubmitStatus`, `Features`'
`FeatureDetail`) stay private in that file — don't promote something to `src/types/` just because
it's an interface, only when a second, unrelated consumer actually needs it (see Rule 1).

## 10. Function Formatting
Single-parameter functions stay on one line where reasonable.

## 11. Testing
Every component should have a `.spec.ts`. As of the audit-remediation pass, every `shared/*` and
`pages/*` component has one — keep it that way: any component added or meaningfully changed going
forward gets a spec in the same change, not as a follow-up. Depth should match how much real logic
there is (`PlayStoreButton`'s `href`-per-`variant`, `SeoService.update()`'s `Title`/`Meta` writes,
`Contact.submit()`'s validation branches and mocked `fetch()` paths, `ScrollProgressService`'s
scroll-math and idempotent `start()`), not padded with meaningless "should create" tests where
there's nothing to assert beyond that. Test runner is **Vitest** (`ng test` →
`@angular/build:unit-test`).

Components with a `@defer (on viewport)` block (Rule 5) need Angular's own defer-testing API, not
an `IntersectionObserver` mock — TestBed defaults to manual defer control, so nothing renders past
the `@placeholder` until you advance it explicitly:
```ts
import { DeferBlockState, TestBed } from '@angular/core/testing';
// ...
const [deferBlock] = await fixture.getDeferBlocks();
await deferBlock.render(DeferBlockState.Complete);
fixture.detectChanges();
```
See `shared/screenshot-gallery/screenshot-gallery.spec.ts` for the full pattern (one test asserting
the placeholder renders and the real content doesn't, before the block is advanced; one asserting
the real content after `DeferBlockState.Complete`). `afterNextRender`-based components that don't
use `@defer` (e.g. `shared/sunrise-layer`) are unaffected by this and don't need it.

## 12. No AI-Generated Imagery
Per explicit product decision, this site does not use AI-generated illustration/art anywhere —
only the real app logo/icons (genuine brand assets, not decorative art) and real, human-sourced
photography/screenshots are used. `shared/screenshot-gallery` renders placeholder phone frames
with sourcing instructions instead of filler AI art — do not "fill in" those placeholders with
generated images; leave them as placeholders until a real screenshot is provided.

## 13. Mandatory File Structure
Every component gets its own `.ts`, `.html`, `.css`, and (per Rule 11) a `.spec.ts` — no inline
templates/styles in the `.ts` file. This matches every component built so far
(`shared/nav-bar`, `shared/footer`, `pages/home`, etc.).

## 14. No Hardcoded Values in TypeScript
Site-wide values go through `shared/constants.ts` (Rule 9). Per-page copy arrays (feature lists,
screenshot slot briefs) are typed arrays in the owning page's `.ts` file, not scattered
`<div>`-by-`<div>` in the template — see `Home.previewFeatures` and `Features.features` as the
pattern to follow for any new repeated list content.
