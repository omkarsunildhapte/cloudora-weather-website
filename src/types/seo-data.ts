export interface SeoData {
  title: string;
  description: string;
  /** Route path with leading slash, e.g. '/' or '/features' — no trailing
   *  slash except for the root itself. Used to build the canonical link
   *  (`SITE_URL + path`) and must match what's listed in sitemap.xml. */
  path: string;
  /**
   * Optional page-specific JSON-LD, rendered in ADDITION to the global
   * `MobileApplication` schema baked into src/index.html (which every
   * route inherits, since prerendering starts from that same shell — see
   * SeoService). Must be a valid schema.org type with `@context`/`@type`.
   * Omit on routes that don't need anything beyond the global app schema.
   */
  structuredData?: Record<string, unknown>;
}
