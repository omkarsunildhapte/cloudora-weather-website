import { TestBed } from '@angular/core/testing';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { PLAY_STORE_URL } from '@constants/index';

describe('PlayStoreButton', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayStoreButton],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayStoreButton);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('links to the single source-of-truth Play Store URL', () => {
    const fixture = TestBed.createComponent(PlayStoreButton);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe(PLAY_STORE_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('defaults to the primary variant', () => {
    const fixture = TestBed.createComponent(PlayStoreButton);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.classList.contains('ps-primary')).toBe(true);
  });

  it('applies the compact variant class when set', () => {
    const fixture = TestBed.createComponent(PlayStoreButton);
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.classList.contains('ps-compact')).toBe(true);
    expect(link.classList.contains('ps-primary')).toBe(false);
  });
});
