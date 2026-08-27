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

  it('lists all 8 real app features, sequentially indexed 01–08', () => {
    const fixture = TestBed.createComponent(Features);
    const features = fixture.componentInstance.features;

    expect(features.length).toBe(8);
    expect(features.map((f) => f.index)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08']);
  });

  it('marks exactly one feature (AI Weather Insight) as flagship-tagged', () => {
    const fixture = TestBed.createComponent(Features);
    const tagged = fixture.componentInstance.features.filter((f) => f.tag !== null);

    expect(tagged.length).toBe(1);
    expect(tagged[0].title).toBe('AI Weather Insight');
  });
});
