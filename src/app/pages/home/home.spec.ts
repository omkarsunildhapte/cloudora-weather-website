import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Home } from '@pages/home/home';
import { FEATURE_DETAILS, PREVIEW_FEATURES } from '@constants/index';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets a distinct page title via SeoService on init', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const title = TestBed.inject(Title).getTitle();
    expect(title).toBe("Cloudora Weather — Real-Time Forecasts, Air Quality & AI Insight for Android");
  });

  it('lists exactly 6 preview features', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance.previewFeatures.length).toBe(6);
  });

  it('only previews features that /features actually documents', () => {
    // The home cards are a shorter retelling of FEATURE_DETAILS. A preview whose
    // title has no counterpart there means the two pages have drifted, and the
    // "View all N features" link would lead somewhere that never mentions it.
    const documented = new Set(FEATURE_DETAILS.map((f) => f.title));
    const orphans = PREVIEW_FEATURES.filter((p) => !documented.has(p.title)).map((p) => p.title);

    expect(orphans).toEqual([]);
  });

  it('lists exactly 4 screenshot slots, each pointing at a real captured image', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance.screenshotSlots.length).toBe(4);
    expect(
      fixture.componentInstance.screenshotSlots.every(
        (slot) => typeof slot.src === 'string' && slot.src.startsWith('screenshots/'),
      ),
    ).toBe(true);
  });
});
