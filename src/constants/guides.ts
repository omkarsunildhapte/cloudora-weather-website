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

export const GUIDES: GuideLink[] = [
  {
    title: 'What the Air Quality Index Actually Means',
    summary:
      'PM2.5, PM10, ozone and nitrogen dioxide — what the 1-to-5 rating is built from, and what to do at each level.',
    path: `${GUIDES_PATH}/air-quality-index`,
    icon: 'leaf',
    readingTime: '6 min read',
  },
  {
    title: 'How to Read the UV Index (and When You Actually Need Sunscreen)',
    summary:
      'Why UV has nothing to do with how warm it feels, what each band means, and how long protection really lasts.',
    path: `${GUIDES_PATH}/uv-index`,
    icon: 'uv',
    readingTime: '6 min read',
  },
  {
    title: 'Why "Feels Like" Differs From the Real Temperature',
    summary:
      'Humidity stops your sweat from working and wind strips away your warm layer — the two effects behind the second number.',
    path: `${GUIDES_PATH}/feels-like-temperature`,
    icon: 'droplet',
    readingTime: '7 min read',
  },
  {
    title: 'How to Read a Precipitation Radar Map',
    summary:
      'What the colours measure, why radar sometimes lies, and how to work out when the rain will actually reach you.',
    path: `${GUIDES_PATH}/precipitation-radar`,
    icon: 'radar',
    readingTime: '7 min read',
  },
];

/** Every guide except the one currently being read — the "keep reading" list. */
export function otherGuides(currentPath: string): GuideLink[] {
  return GUIDES.filter((guide) => guide.path !== currentPath);
}
