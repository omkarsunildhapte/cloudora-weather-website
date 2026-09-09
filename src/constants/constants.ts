/**
 * Single source of truth for the Google Play Store listing.
 * Every download CTA on the site imports this constant — never hardcode
 * the URL in a component.
 *
 * NOTE: cloudora-weather-app's capacitor.config.ts / android build.gradle
 * still carry the Ionic starter id (`io.ionic.starter`). This is the
 * intended release id — when the app's package id is finalised, update it
 * here and in the app in the same change.
 */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cloudora.app';

/** Canonical production origin — used for sitemap/robots (see public/) and
 *  per-page structured-data `url` fields. Keep in sync with those files if
 *  the deployment domain ever changes. No trailing slash. */
export const SITE_URL = 'https://cloudora-weather.vernokasoftwaretechnology.com';

/**
 * Absolute URL of the social-share card.
 *
 * Absolute, not a path: the Open Graph spec requires og:image to be a full
 * URL, and every unfurler — Facebook, X, LinkedIn, WhatsApp, Slack — silently
 * shows no image for a relative one. index.html shipped `icon-256.png` for
 * months, so every share of this site rendered without a picture.
 *
 * Still the 256px app icon, which is below the 1200x630 a card wants and will
 * render as a small square rather than a banner. Replace with a real card at
 * public/og-card.png when one exists; this constant is the only place to
 * change.
 */
export const OG_IMAGE_URL = `${SITE_URL}/icon-256.png`;

export const CONTACT_EMAIL = 'support@vernokasoftwaretechnology.com';

export const COMPANY_NAME = 'Vernoka Technology';

export const COMPANY_URL = 'https://vernoka-sand.vercel.app/';

/** GA4 measurement id for this website (not the app — the app ships no
 *  analytics). Also hardcoded in the inline consent stub in src/index.html,
 *  which can't import from here — change both together. Placeholder until
 *  the site's own GA4 property exists. */
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

/**
 * The release-notes route.
 *
 * Also written out in `app.routes.ts` (without the leading slash, as Angular's
 * route config wants it) and in the footer's routerLink. This constant is what
 * the page itself uses for its canonical URL and JSON-LD, where a mismatch with
 * the real route would be invisible on screen and wrong in search results.
 */
export const WHATS_NEW_PATH = '/whats-new';

/** The feature-list route. Also written out in app.routes.ts and the nav bar. */
export const FEATURES_PATH = '/features';

