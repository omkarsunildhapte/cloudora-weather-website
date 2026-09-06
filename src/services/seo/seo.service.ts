import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoData, TrustedTypePolicy, WindowWithTrustedTypes } from '@appTypes/index';
import { SITE_URL } from '@constants/index';
import { CANONICAL_LINK_ID, STRUCTURED_DATA_ID, TRUSTED_TYPES_JSONLD_POLICY } from '@constants/index';

/**
 * Updates document title + description/OG meta tags, the canonical link,
 * and (optionally) a page-specific JSON-LD block, per route. With
 * `@angular/ssr` prerendering every route at build time (see
 * `.agents/seo-rules.md` Rule 0), these updates are baked into each route's
 * static HTML — visible to real browsers, JS-executing crawlers, and
 * non-JS social-preview bots (Facebook/Twitter/LinkedIn) alike, not just
 * hydrated in client-side after the fact.
 *
 * The canonical link and structured data are both injected via the
 * `DOCUMENT` token rather than the bare global `document` — the same DI
 * indirection Title/Meta use internally — so they work identically during
 * server-side prerendering and in the browser. `index.html`'s own
 * `MobileApplication` JSON-LD block is separate and untouched by this; a
 * page can carry both that and its own page-specific block.
 */
@Service()
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(data: SeoData): void {
    this.titleService.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.updateCanonicalLink(data.path);
    this.updateStructuredData(data.structuredData ?? null);
    this.updateRobots(data.noindex === true);
  }

  /**
   * Routes are single-page navigations, so the tag has to be removed again when
   * leaving a noindex route — otherwise the 404 page would poison every page
   * the visitor clicked through to afterwards.
   */
  private updateRobots(noindex: boolean): void {
    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
      return;
    }
    this.meta.removeTag("name='robots'");
  }

  /** Every route gets exactly one canonical `<link>`, always pointing at
   *  `SITE_URL + path` — no query strings/fragments, so URL variants
   *  (tracking params, trailing-slash mismatches) all canonicalize onto the
   *  one clean form that's also what's listed in sitemap.xml. */
  private updateCanonicalLink(path: string): void {
    let link = this.document.getElementById(CANONICAL_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.id = CANONICAL_LINK_ID;
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = `${SITE_URL}${path}`;
  }

  /** Swaps out this route's JSON-LD block. Removing the previous one on
   *  every call matters for client-side navigation (SPA route changes
   *  don't reload the document), not just the initial prerender. */
  private updateStructuredData(schema: Record<string, unknown> | null): void {
    this.document.getElementById(STRUCTURED_DATA_ID)?.remove();
    if (!schema) return;

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = STRUCTURED_DATA_ID;
    script.textContent = this.trustedJson(JSON.stringify(schema));
    this.document.head.appendChild(script);
  }

  /**
   * Wraps the serialised schema for `script.textContent`.
   *
   * Under the CSP's `require-trusted-types-for 'script'` that assignment throws
   * unless the value came from a policy — even though a JSON-LD block is data
   * the browser never executes, because the sink is typed by the element, not
   * by its `type` attribute. Without this, six routes threw on load and lost
   * their structured data entirely (seo-rules.md § 5).
   *
   * The pass-through body is safe here and nowhere else: the input is always
   * `JSON.stringify` of an object this app built, never anything a visitor
   * supplied. Returns the raw string when Trusted Types is unavailable — older
   * browsers, and the prerender, where there is no `window`.
   */
  private trustedJson(serialised: string): string {
    const api = (this.document.defaultView as WindowWithTrustedTypes | null)?.trustedTypes;
    if (!api) return serialised;
    this.jsonPolicy ??= api.createPolicy(TRUSTED_TYPES_JSONLD_POLICY, { createScript: (value: string) => value });
    return this.jsonPolicy.createScript(serialised) as unknown as string;
  }

  /** Created once — createPolicy throws on a duplicate name when the CSP names it. */
  private jsonPolicy: TrustedTypePolicy | null = null;
}
