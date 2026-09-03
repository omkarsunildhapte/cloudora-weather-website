/**
 * One entry in the weather-guides catalogue. Used by the `/guides` index, by
 * each guide's "keep reading" cross-links, and by `@shared/guide-outro` —
 * hence `src/types` rather than a page-local interface.
 */
export interface GuideLink {
  /** Headline as it appears on the index card. */
  title: string;
  /** One-line summary — also the basis of the page's meta description. */
  summary: string;
  /** Route path with a leading slash, e.g. `/guides/uv-index`. Must match
   *  what the page passes to `SeoService.update()` and what's in
   *  `public/sitemap.xml`. */
  path: string;
  /** `@shared/feature-icon` key. */
  icon: string;
  /** Rough reading time, e.g. "6 min read". */
  readingTime: string;
}
