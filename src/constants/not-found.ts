import { GuideLink } from '@appTypes/index';
import { FEATURES_PATH, WHATS_NEW_PATH } from './constants';
import { GUIDES_PATH } from './guides';

/**
 * The 404 route.
 *
 * Angular prerenders it to `/404/index.html`; the postbuild step copies that to
 * `404.html`, which is the filename Cloudflare's `not_found_handling` expects.
 */
export const NOT_FOUND_PATH = '/404';

/** Where to send someone who landed on a dead URL — the three routes worth reaching. */
export const NOT_FOUND_SUGGESTIONS: Pick<GuideLink, 'title' | 'summary' | 'path' | 'icon'>[] = [
  {
    title: 'Everything the app does',
    summary: 'Real-time conditions, forecasts, air quality and the AI insight.',
    path: FEATURES_PATH,
    icon: 'sun',
  },
  {
    title: 'Weather guides',
    summary: 'Plain-language explainers on AQI, UV, radar and feels-like temperature.',
    path: GUIDES_PATH,
    icon: 'droplet',
  },
  {
    title: "What's new",
    summary: 'Release notes for the Android app, newest first.',
    path: WHATS_NEW_PATH,
    icon: 'storm',
  },
];
