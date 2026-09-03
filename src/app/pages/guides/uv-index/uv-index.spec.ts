import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { UvIndexGuide } from '@pages/guides/uv-index/uv-index';
import { GUIDES } from '@constants/index';

describe('UvIndexGuide', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UvIndexGuide],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets its own title, canonical path and Article JSON-LD', () => {
    const fixture = TestBed.createComponent(UvIndexGuide);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe(
      'How to Read the UV Index — and When You Need Sunscreen',
    );
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/guides\/uv-index$/,
    );

    const schema: { '@type': string; url: string } = JSON.parse(
      document.getElementById('page-structured-data')?.textContent ?? '{}',
    );
    expect(schema['@type']).toBe('Article');
    expect(schema.url).toMatch(/\/guides\/uv-index$/);
  });

  it('renders exactly one h1 and all five WHO/WMO UV bands', () => {
    const fixture = TestBed.createComponent(UvIndexGuide);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.uv-bands > li').length).toBe(5);
    expect(fixture.componentInstance.bands.map((b) => b.name)).toEqual([
      'Low',
      'Moderate',
      'High',
      'Very High',
      'Extreme',
    ]);
  });

  it('cross-links to every other guide, and never to itself', () => {
    const fixture = TestBed.createComponent(UvIndexGuide);
    fixture.detectChanges();

    const related = fixture.componentInstance.related;
    expect(related.length).toBe(GUIDES.length - 1);
    expect(related.some((g) => g.path === '/guides/uv-index')).toBe(false);
  });
});
