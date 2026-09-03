import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Guides } from '@pages/guides/guides';
import { GUIDES } from '@constants/index';

describe('Guides (index)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guides],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets a distinct title, description and canonical path via SeoService', () => {
    const fixture = TestBed.createComponent(Guides);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe(
      'Weather Guides — Understanding AQI, UV, Feels-Like and Radar',
    );
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toContain(
      'Air Quality Index',
    );
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/guides$/,
    );
  });

  it('emits CollectionPage JSON-LD listing every guide with an absolute URL', () => {
    const fixture = TestBed.createComponent(Guides);
    fixture.detectChanges();

    const script = document.getElementById('page-structured-data');
    expect(script).toBeTruthy();

    const schema: { '@type': string; mainEntity: { itemListElement: { url: string }[] } } =
      JSON.parse(script?.textContent ?? '{}');
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.mainEntity.itemListElement.length).toBe(GUIDES.length);
    for (const item of schema.mainEntity.itemListElement) {
      expect(item.url).toMatch(/^https:\/\/[^/]+\/guides\/[a-z0-9-]+$/);
    }
  });

  // The list is deliberately not deferred (seo-rules Rule 7) — a crawler must
  // see the outbound links in the prerendered HTML, not a placeholder.
  it('renders exactly one h1 and a crawlable card per guide with no defer trigger', () => {
    const fixture = TestBed.createComponent(Guides);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);

    const cards: NodeListOf<HTMLAnchorElement> =
      fixture.nativeElement.querySelectorAll('.guide-card');
    expect(cards.length).toBe(GUIDES.length);
    expect(Array.from(cards).map((a) => a.getAttribute('href'))).toEqual(
      GUIDES.map((g) => g.path),
    );
  });
});
