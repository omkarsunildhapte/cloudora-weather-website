import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { FeelsLikeTemperatureGuide } from '@pages/guides/feels-like-temperature/feels-like-temperature';
import { GUIDES } from '@constants/index';

describe('FeelsLikeTemperatureGuide', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeelsLikeTemperatureGuide],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets its own title, canonical path and Article JSON-LD', () => {
    const fixture = TestBed.createComponent(FeelsLikeTemperatureGuide);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe(
      'Why "Feels Like" Differs From the Real Temperature',
    );
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/guides\/feels-like-temperature$/,
    );

    const schema: { '@type': string; url: string } = JSON.parse(
      document.getElementById('page-structured-data')?.textContent ?? '{}',
    );
    expect(schema['@type']).toBe('Article');
    expect(schema.url).toMatch(/\/guides\/feels-like-temperature$/);
  });

  it('renders exactly one h1 and the dew-point comfort bands', () => {
    const fixture = TestBed.createComponent(FeelsLikeTemperatureGuide);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.dew-bands > li').length).toBe(
      fixture.componentInstance.dewPoints.length,
    );
    expect(fixture.componentInstance.dewPoints.map((b) => b.name)).toContain('Oppressive');
  });

  it('cross-links to every other guide, and never to itself', () => {
    const fixture = TestBed.createComponent(FeelsLikeTemperatureGuide);
    fixture.detectChanges();

    const related = fixture.componentInstance.related;
    expect(related.length).toBe(GUIDES.length - 1);
    expect(related.some((g) => g.path === '/guides/feels-like-temperature')).toBe(false);
  });
});
