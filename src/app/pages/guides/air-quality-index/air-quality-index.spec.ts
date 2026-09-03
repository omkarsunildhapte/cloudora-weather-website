import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AirQualityIndexGuide } from '@pages/guides/air-quality-index/air-quality-index';
import { GUIDES } from '@constants/index';

describe('AirQualityIndexGuide', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirQualityIndexGuide],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets its own title, canonical path and Article JSON-LD', () => {
    const fixture = TestBed.createComponent(AirQualityIndexGuide);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe(
      'What the Air Quality Index Actually Means — Cloudora Weather',
    );
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/guides\/air-quality-index$/,
    );

    const schema: { '@type': string; url: string } = JSON.parse(
      document.getElementById('page-structured-data')?.textContent ?? '{}',
    );
    expect(schema['@type']).toBe('Article');
    expect(schema.url).toMatch(/\/guides\/air-quality-index$/);
  });

  it('renders exactly one h1 and the full index band table', () => {
    const fixture = TestBed.createComponent(AirQualityIndexGuide);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.band-table tbody tr').length).toBe(5);
    expect(fixture.componentInstance.bands.map((b) => b.name)).toEqual([
      'Good',
      'Fair',
      'Moderate',
      'Poor',
      'Very Poor',
    ]);
  });

  it('cross-links to every other guide, and never to itself', () => {
    const fixture = TestBed.createComponent(AirQualityIndexGuide);
    fixture.detectChanges();

    const related = fixture.componentInstance.related;
    expect(related.length).toBe(GUIDES.length - 1);
    expect(related.some((g) => g.path === '/guides/air-quality-index')).toBe(false);
  });
});
