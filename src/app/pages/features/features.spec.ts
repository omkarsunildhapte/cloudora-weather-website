import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Features } from '@pages/features/features';

describe('Features', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Features],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Features);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets a distinct page title via SeoService on init', () => {
    const fixture = TestBed.createComponent(Features);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Features — Cloudora Weather');
  });

  it('indexes every feature sequentially from 01, with no gaps', () => {
    const fixture = TestBed.createComponent(Features);
    const features = fixture.componentInstance.features;

    // Asserting the shape rather than a fixed count: the list grows as the app
    // does, and a hardcoded 8 only ever failed to notice that it had.
    expect(features.length).toBeGreaterThan(0);
    expect(features.map((f) => f.index)).toEqual(
      features.map((_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it('marks exactly one feature (AI Weather Insight) as flagship-tagged', () => {
    const fixture = TestBed.createComponent(Features);
    const tagged = fixture.componentInstance.features.filter((f) => f.tag !== null);

    expect(tagged.length).toBe(1);
    expect(tagged[0].title).toBe('AI Weather Insight');
  });

  it('files every feature under a rendered category, with none stranded', () => {
    const fixture = TestBed.createComponent(Features);
    const { features, categories } = fixture.componentInstance;

    // A feature whose category is not in the list would silently never render.
    const grouped = categories.flatMap((c) => fixture.componentInstance.featuresIn(c));
    expect(grouped.length).toBe(features.length);
    expect(new Set(grouped.map((f) => f.title)).size).toBe(features.length);
  });

  it('turns each category into a unique anchor slug', () => {
    const fixture = TestBed.createComponent(Features);
    const slugs = fixture.componentInstance.categories.map((c) =>
      fixture.componentInstance.slug(c),
    );

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
});
