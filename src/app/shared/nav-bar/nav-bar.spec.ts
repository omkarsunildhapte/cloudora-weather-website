import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavBar } from '@shared/nav-bar/nav-bar';

describe('NavBar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBar],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavBar);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with the mobile menu closed', () => {
    const fixture = TestBed.createComponent(NavBar);
    expect(fixture.componentInstance.mobileMenuOpen()).toBe(false);
  });

  it('toggleMenu() flips mobileMenuOpen open and closed', () => {
    const fixture = TestBed.createComponent(NavBar);
    const nav = fixture.componentInstance;

    nav.toggleMenu();
    expect(nav.mobileMenuOpen()).toBe(true);

    nav.toggleMenu();
    expect(nav.mobileMenuOpen()).toBe(false);
  });

  it('closeMenu() forces the menu closed even if already open', () => {
    const fixture = TestBed.createComponent(NavBar);
    const nav = fixture.componentInstance;

    nav.toggleMenu();
    expect(nav.mobileMenuOpen()).toBe(true);

    nav.closeMenu();
    expect(nav.mobileMenuOpen()).toBe(false);
  });

  it('exposes the Guides link in both the desktop nav and the mobile menu', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();

    const hrefs = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
      ).map((a) => a.getAttribute('href'));

    // Desktop nav is always rendered; the mobile menu only when open.
    expect(hrefs().filter((h) => h === '/guides').length).toBe(1);

    fixture.componentInstance.toggleMenu();
    fixture.detectChanges();
    expect(hrefs().filter((h) => h === '/guides').length).toBe(2);
  });

  it('onWindowScroll() marks the nav scrolled past the 12px threshold', () => {
    const fixture = TestBed.createComponent(NavBar);
    const nav = fixture.componentInstance;
    const scrollYSpy = vi.spyOn(window, 'scrollY', 'get');

    scrollYSpy.mockReturnValue(0);
    nav.onWindowScroll();
    expect(nav.scrolled()).toBe(false);

    scrollYSpy.mockReturnValue(50);
    nav.onWindowScroll();
    expect(nav.scrolled()).toBe(true);

    scrollYSpy.mockRestore();
  });
});
