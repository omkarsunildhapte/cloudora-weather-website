/**
 * Element ids SeoService owns in <head>.
 *
 * Stable ids rather than "last <script type=ld+json>": the service replaces its
 * own tags on every route change and must not touch anything index.html ships.
 */
export const STRUCTURED_DATA_ID = 'page-structured-data';
export const CANONICAL_LINK_ID = 'page-canonical-link';
