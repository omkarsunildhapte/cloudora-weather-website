import {
  AIR_QUALITY_GUIDE_PATH,
  FEELS_LIKE_GUIDE_PATH,
  GUIDES,
  GUIDES_PATH,
  GUIDES_UPDATED,
  RADAR_GUIDE_PATH,
  UV_GUIDE_PATH,
  otherGuides,
} from '@constants/index';

describe('guides catalogue', () => {
  it('lists four guides, each under the /guides path with a unique slug', () => {
    expect(GUIDES.length).toBe(4);

    const paths = GUIDES.map((g) => g.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path.startsWith(`${GUIDES_PATH}/`)).toBe(true);
      // Sitemap/canonical form: leading slash, no trailing slash, lowercase.
      expect(path).toMatch(/^\/guides\/[a-z0-9-]+$/);
    }
  });

  it('gives every guide the copy the index and cross-links need', () => {
    for (const guide of GUIDES) {
      expect(guide.title.length).toBeGreaterThan(0);
      expect(guide.summary.length).toBeGreaterThan(0);
      expect(guide.icon.length).toBeGreaterThan(0);
      expect(guide.readingTime).toMatch(/^\d+ min read$/);
    }
  });

  it('otherGuides() returns every guide except the one being read', () => {
    const current = GUIDES[0];
    const rest = otherGuides(current.path);

    expect(rest.length).toBe(GUIDES.length - 1);
    expect(rest.some((g) => g.path === current.path)).toBe(false);
  });

  it('otherGuides() returns the whole catalogue for a path that is not a guide', () => {
    expect(otherGuides('/features').length).toBe(GUIDES.length);
  });

  it('exposes a named path constant for every catalogue entry', () => {
    // The guide pages import these instead of retyping the literal. If one drifted
    // from the catalogue, otherGuides() would stop matching and the page would
    // cross-link to itself — silently, as the test above shows.
    const named = [
      AIR_QUALITY_GUIDE_PATH,
      UV_GUIDE_PATH,
      FEELS_LIKE_GUIDE_PATH,
      RADAR_GUIDE_PATH,
    ];

    expect(new Set(named).size).toBe(named.length);
    expect([...named].sort()).toEqual([...GUIDES.map((g) => g.path)].sort());
  });

  it('states the last-updated date identically in both formats', () => {
    const rendered = new Date(`${GUIDES_UPDATED.iso}T00:00:00Z`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    expect(GUIDES_UPDATED.display).toBe(rendered);
  });
});
