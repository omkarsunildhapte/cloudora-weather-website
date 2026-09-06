/**
 * Trusted Types policy names, allowlisted in public/_headers' CSP.
 *
 * `require-trusted-types-for 'script'` turns every string assignment to a
 * script sink into a thrown TypeError. Two sinks in this site hit that:
 * SeoService writes JSON-LD to `script.textContent`, and index.html's consent
 * stub sets `script.src` for gtag.js. Both are given a named policy rather than
 * the site being exempted, so anything *else* that reaches for a script sink
 * still fails loudly — which is the whole point of the header.
 *
 * `angular` and `angular#bundler` are Angular's own; they must stay in the CSP
 * allowlist or the framework itself cannot boot under enforcement.
 */
export const TRUSTED_TYPES_JSONLD_POLICY = 'cloudora-jsonld';
