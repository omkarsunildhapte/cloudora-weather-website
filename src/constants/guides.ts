import { GuideLink } from '@appTypes/index';

/**
 * The weather-guides catalogue.
 *
 * This is the one exception to frontend-rules Rule 14 ("per-page copy arrays
 * live in the owning page"): five separate routes read this list — the
 * `/guides` index renders all of it, and each individual guide renders the
 * other four as its "keep reading" cross-links. Keeping one array here is what
 * stops the index and the cross-links from drifting apart, and means adding a
 * fifth guide is a single entry plus a route.
 *
 * `path` must stay in sync with `app.routes.ts`, `public/sitemap.xml` and
 * `public/llms.txt`.
 */
export const GUIDES_PATH = '/guides';

/**
 * Canonical path per guide.
 *
 * Each page imports its own rather than retyping the literal, because it hands
 * that string to `otherGuides()`, which filters this catalogue by exact match.
 * A drifted path does not throw — it just fails to match, and the guide ends up
 * cross-linking to itself.
 */
export const AIR_QUALITY_GUIDE_PATH = `${GUIDES_PATH}/air-quality-index`;
export const UV_GUIDE_PATH = `${GUIDES_PATH}/uv-index`;
export const FEELS_LIKE_GUIDE_PATH = `${GUIDES_PATH}/feels-like-temperature`;
export const RADAR_GUIDE_PATH = `${GUIDES_PATH}/precipitation-radar`;

/**
 * When the guides were last reviewed. All four were written and revised
 * together; split this per guide the first time one changes on its own.
 *
 * `iso` feeds each page's JSON-LD `datePublished`/`dateModified`; `display` is
 * the byline GuideHero renders. They were previously two literals per page —
 * eight copies of one date in two formats. guides.spec.ts now asserts the pair
 * describes the same day, so changing one without the other fails the suite
 * instead of shipping a page that tells the reader one date and Google another.
 */
export const GUIDES_UPDATED = {
  iso: '2026-09-04',
  display: 'September 4, 2026',
} as const;

export const GUIDES: GuideLink[] = [
  {
    title: 'What the Air Quality Index Actually Means',
    summary:
      'PM2.5, PM10, ozone and nitrogen dioxide — what the 1-to-5 rating is built from, and what to do at each level.',
    path: AIR_QUALITY_GUIDE_PATH,
    icon: 'leaf',
    readingTime: '6 min read',
  },
  {
    title: 'How to Read the UV Index (and When You Actually Need Sunscreen)',
    summary:
      'Why UV has nothing to do with how warm it feels, what each band means, and how long protection really lasts.',
    path: UV_GUIDE_PATH,
    icon: 'uv',
    readingTime: '6 min read',
  },
  {
    title: 'Why "Feels Like" Differs From the Real Temperature',
    summary:
      'Humidity stops your sweat from working and wind strips away your warm layer — the two effects behind the second number.',
    path: FEELS_LIKE_GUIDE_PATH,
    icon: 'droplet',
    readingTime: '7 min read',
  },
  {
    title: 'How to Read a Precipitation Radar Map',
    summary:
      'What the colours measure, why radar sometimes lies, and how to work out when the rain will actually reach you.',
    path: RADAR_GUIDE_PATH,
    icon: 'radar',
    readingTime: '7 min read',
  },
];

/** Every guide except the one currently being read — the "keep reading" list. */
export function otherGuides(currentPath: string): GuideLink[] {
  return GUIDES.filter((guide) => guide.path !== currentPath);
}

/**
 * The catalogue entry for a guide, by path.
 *
 * Throws instead of returning undefined: every guide page has an entry, so a
 * miss is a wiring mistake to surface at build/prerender time, not a runtime
 * condition for callers to branch on.
 */
export function guideFor(path: string): GuideLink {
  const guide = GUIDES.find((entry) => entry.path === path);
  if (!guide) throw new Error(`No guide catalogue entry for ${path}`);
  return guide;
}

