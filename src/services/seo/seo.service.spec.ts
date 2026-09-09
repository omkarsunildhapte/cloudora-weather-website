import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from '@services/seo/seo.service';
import { OG_IMAGE_URL, SITE_URL, TRUSTED_TYPES_JSONLD_POLICY } from '@constants/index';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  afterEach(() => {
    document.getElementById('page-structured-data')?.remove();
    document.getElementById('page-canonical-link')?.remove();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('sets the document title', () => {
    service.update({
      title: 'Features — Cloudora Weather',
      description: 'See everything Cloudora Weather can do.',
      path: '/features',
    });
    expect(titleService.getTitle()).toBe('Features — Cloudora Weather');
  });

  it('sets description and OG meta tags', () => {
    service.update({
      title: 'Contact — Cloudora Weather',
      description: 'Get in touch with the Cloudora Weather team.',
      path: '/contact',
    });

    expect(meta.getTag('name="description"')?.content).toBe(
      'Get in touch with the Cloudora Weather team.',
    );
    expect(meta.getTag('property="og:title"')?.content).toBe('Contact — Cloudora Weather');
    expect(meta.getTag('property="og:description"')?.content).toBe(
      'Get in touch with the Cloudora Weather team.',
    );
  });

  it('overwrites tags on a second update() rather than duplicating them', () => {
    service.update({ title: 'First', description: 'First description', path: '/first' });
    service.update({ title: 'Second', description: 'Second description', path: '/second' });

    expect(titleService.getTitle()).toBe('Second');
    expect(meta.getTag('name="description"')?.content).toBe('Second description');
  });

  it('sets a canonical link built from SITE_URL + path', () => {
    service.update({ title: 'Features — Cloudora Weather', description: 'x', path: '/features' });

    const link = document.getElementById('page-canonical-link') as HTMLLinkElement | null;
    expect(link?.rel).toBe('canonical');
    expect(link?.href).toBe(`${SITE_URL}/features`);
  });

  it('updates the existing canonical link in place rather than duplicating it', () => {
    service.update({ title: 'First', description: 'x', path: '/first' });
    service.update({ title: 'Second', description: 'x', path: '/second' });

    const links = document.querySelectorAll('#page-canonical-link');
    expect(links.length).toBe(1);
    expect((links[0] as HTMLLinkElement).href).toBe(`${SITE_URL}/second`);
  });

  it('injects a JSON-LD structured-data script when provided', () => {
    service.update({
      title: 'Contact — Cloudora Weather',
      description: 'Get in touch.',
      path: '/contact',
      structuredData: { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact' },
    });

    const script = document.getElementById('page-structured-data');
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(JSON.parse(script?.textContent ?? '{}')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact',
    });
  });

  it('adds no structured-data script when none is given', () => {
    service.update({ title: 'Home', description: 'Home page', path: '/' });
    expect(document.getElementById('page-structured-data')).toBeNull();
  });

  it("removes a previous route's structured data when the next route has none", () => {
    service.update({
      title: 'Contact — Cloudora Weather',
      description: 'Get in touch.',
      path: '/contact',
      structuredData: { '@context': 'https://schema.org', '@type': 'ContactPage' },
    });
    service.update({ title: 'Home', description: 'Home page', path: '/' });

    expect(document.getElementById('page-structured-data')).toBeNull();
  });

  it('replaces rather than duplicates the structured-data script across updates', () => {
    service.update({
      title: 'A',
      description: 'A',
      path: '/a',
      structuredData: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'A' },
    });
    service.update({
      title: 'B',
      description: 'B',
      path: '/b',
      structuredData: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'B' },
    });

    const scripts = document.querySelectorAll('#page-structured-data');
    expect(scripts.length).toBe(1);
    expect(JSON.parse(scripts[0].textContent ?? '{}').name).toBe('B');
  });

  /**
   * Under the deployed CSP (public/_headers) `script.textContent` is a Trusted
   * Types sink, and a plain string assignment throws — which silently cost six
   * routes their JSON-LD when the header was first trialled. jsdom has no
   * Trusted Types, so the API is stubbed onto the window to prove the service
   * routes through a policy when one is available, and still works when it is
   * not (older browsers, and the prerender, where there is no window at all).
   */
  describe('Trusted Types', () => {
    const SCHEMA = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Guides' };

    afterEach(() => {
      delete (window as unknown as Record<string, unknown>)['trustedTypes'];
    });

    it('creates its policy under the name the CSP allowlists', () => {
      const createPolicy = jasmineLikeSpy();
      (window as unknown as Record<string, unknown>)['trustedTypes'] = { createPolicy };

      service.update({ title: 'G', description: 'G', path: '/guides', structuredData: SCHEMA });

      expect(createPolicy.calls[0][0]).toBe(TRUSTED_TYPES_JSONLD_POLICY);
      expect(TRUSTED_TYPES_JSONLD_POLICY).toBe('cloudora-jsonld');
    });

    it('passes the serialised schema through the policy rather than assigning it raw', () => {
      const createPolicy = jasmineLikeSpy();
      (window as unknown as Record<string, unknown>)['trustedTypes'] = { createPolicy };

      service.update({ title: 'G', description: 'G', path: '/guides', structuredData: SCHEMA });

      const script = document.getElementById('page-structured-data');
      expect(script?.textContent).toContain('POLICY:');
      expect(JSON.parse((script?.textContent ?? '').replace('POLICY:', '')).name).toBe('Guides');
    });

    it('creates the policy once, since a duplicate name throws when the CSP names it', () => {
      const createPolicy = jasmineLikeSpy();
      (window as unknown as Record<string, unknown>)['trustedTypes'] = { createPolicy };

      service.update({ title: 'A', description: 'A', path: '/a', structuredData: SCHEMA });
      service.update({ title: 'B', description: 'B', path: '/b', structuredData: SCHEMA });

      expect(createPolicy.calls.length).toBe(1);
    });

    it('still writes the JSON-LD where Trusted Types is unavailable', () => {
      service.update({ title: 'G', description: 'G', path: '/guides', structuredData: SCHEMA });

      const script = document.getElementById('page-structured-data');
      expect(JSON.parse(script?.textContent ?? '{}').name).toBe('Guides');
    });
  });

  /**
   * Social cards shipped broken for months: og:image was the relative string
   * "icon-256.png", which the Open Graph spec does not allow and which every
   * unfurler resolves to nothing. Nothing caught it, because the tag was
   * present and non-empty — only its shape was wrong. These assert the shape.
   */
  describe('social card tags', () => {
    const content = (selector: string): string | null =>
      document.querySelector(selector)?.getAttribute('content') ?? null;

    beforeEach(() => {
      service.update({ title: 'UV Index Guide', description: 'How to read it.', path: '/guides/uv-index' });
    });

    it('gives og:image an absolute URL, since a relative one silently unfurls as nothing', () => {
      const image = content('meta[property="og:image"]');
      expect(image).toBe(OG_IMAGE_URL);
      expect(image?.startsWith('https://')).toBe(true);
    });

    it('points og:url at this route, not whatever page the scraper landed on', () => {
      expect(content('meta[property="og:url"]')).toBe(`${SITE_URL}/guides/uv-index`);
    });

    it('keeps og:url and the canonical link identical', () => {
      const canonical = document.getElementById('page-canonical-link')?.getAttribute('href');
      expect(content('meta[property="og:url"]')).toBe(canonical);
    });

    it('mirrors title and description onto the twitter tags', () => {
      expect(content('meta[name="twitter:title"]')).toBe('UV Index Guide');
      expect(content('meta[name="twitter:description"]')).toBe('How to read it.');
      expect(content('meta[name="twitter:image"]')).toBe(OG_IMAGE_URL);
    });

    it('rewrites them on the next route rather than leaving the previous ones', () => {
      service.update({ title: 'Contact', description: 'Get in touch.', path: '/contact' });
      expect(content('meta[property="og:url"]')).toBe(`${SITE_URL}/contact`);
      expect(content('meta[name="twitter:title"]')).toBe('Contact');
      expect(document.querySelectorAll('meta[property="og:url"]').length).toBe(1);
    });
  });
});

/** Minimal call-recording stub whose policy tags its output, so a test can tell
 *  a policy-produced value apart from a raw string assignment. */
function jasmineLikeSpy() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
    return { createScript: (value: string) => `POLICY:${value}` };
  };
  return Object.assign(fn, { calls });
}
