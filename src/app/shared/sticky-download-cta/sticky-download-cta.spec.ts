import { TestBed } from '@angular/core/testing';
import { StickyDownloadCta } from '@shared/sticky-download-cta/sticky-download-cta';
import { PLAY_STORE_URL } from '@constants/index';

describe('StickyDownloadCta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StickyDownloadCta] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StickyDownloadCta);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('links to the single source-of-truth Play Store URL', () => {
    const fixture = TestBed.createComponent(StickyDownloadCta);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.href).toBe(PLAY_STORE_URL);
  });

  // The bar is mounted once in app.html for every route, so it must not compete
  // with the nav bar's own CTA on desktop.
  it('is hidden on desktop, where the nav bar already shows a CTA', () => {
    const fixture = TestBed.createComponent(StickyDownloadCta);
    fixture.detectChanges();
    const bar: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(bar.className).toContain('md:hidden');
    expect(bar.className).toContain('fixed');
  });
});
