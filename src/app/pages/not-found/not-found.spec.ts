import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NotFound } from '@pages/not-found/not-found';
import { NOT_FOUND_SUGGESTIONS } from '@constants/index';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets a distinct title via SeoService', () => {
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Page not found — Cloudora Weather');
  });

  it('tells crawlers not to index it', () => {
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();

    // The 404 status covers server-served hits; this covers client-side
    // navigation, where no status code is involved.
    expect(TestBed.inject(Meta).getTag("name='robots'")?.content).toBe('noindex, follow');
  });

  it('offers a route out for every suggestion, plus home', () => {
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();

    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>,
    ).map((a) => a.getAttribute('href'));

    expect(hrefs).toContain('/');
    for (const s of NOT_FOUND_SUGGESTIONS) {
      expect(hrefs).toContain(s.path);
    }
  });
});
