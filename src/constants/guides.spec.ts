import { GUIDES, GUIDES_PATH, otherGuides } from '@constants/index';

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
});
