import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from '@services/seo/seo.service';

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
    expect(link?.href).toBe('https://cloudora-weather.app/features');
  });

  it('updates the existing canonical link in place rather than duplicating it', () => {
    service.update({ title: 'First', description: 'x', path: '/first' });
    service.update({ title: 'Second', description: 'x', path: '/second' });

    const links = document.querySelectorAll('#page-canonical-link');
    expect(links.length).toBe(1);
    expect((links[0] as HTMLLinkElement).href).toBe('https://cloudora-weather.app/second');
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
});
