import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { PrecipitationRadarGuide } from '@pages/guides/precipitation-radar/precipitation-radar';
import { GUIDES } from '@constants/index';

describe('PrecipitationRadarGuide', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecipitationRadarGuide],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets its own title, canonical path and Article JSON-LD', () => {
    const fixture = TestBed.createComponent(PrecipitationRadarGuide);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe(
      'How to Read a Precipitation Radar Map — Cloudora Weather',
    );
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/guides\/precipitation-radar$/,
    );

    const schema: { '@type': string; url: string } = JSON.parse(
      document.getElementById('page-structured-data')?.textContent ?? '{}',
    );
    expect(schema['@type']).toBe('Article');
    expect(schema.url).toMatch(/\/guides\/precipitation-radar$/);
  });

  it('renders exactly one h1 and the reflectivity bands', () => {
    const fixture = TestBed.createComponent(PrecipitationRadarGuide);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.dbz-bands > li').length).toBe(
      fixture.componentInstance.bands.length,
    );
  });

  it('cross-links to every other guide, and never to itself', () => {
    const fixture = TestBed.createComponent(PrecipitationRadarGuide);
    fixture.detectChanges();

    const related = fixture.componentInstance.related;
    expect(related.length).toBe(GUIDES.length - 1);
    expect(related.some((g) => g.path === '/guides/precipitation-radar')).toBe(false);
  });
});
