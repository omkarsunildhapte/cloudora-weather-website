import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { GUIDES, PLAY_STORE_URL, otherGuides } from '@constants/index';

describe('GuideOutro', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideOutro],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(currentPath: string) {
    const fixture = TestBed.createComponent(GuideOutro);
    fixture.componentRef.setInput('related', otherGuides(currentPath));
    fixture.detectChanges();
    return fixture;
  }

  it('renders one crawlable routerLink per related guide, excluding the current one', () => {
    const current = GUIDES[0];
    const fixture = render(current.path);

    const links: NodeListOf<HTMLAnchorElement> =
      fixture.nativeElement.querySelectorAll('.related-guide');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));

    expect(hrefs.length).toBe(GUIDES.length - 1);
    expect(hrefs).not.toContain(current.path);
    expect(hrefs).toContain(GUIDES[1].path);
  });

  it('closes with the Play Store CTA and a link back to the features page', () => {
    const fixture = render(GUIDES[0].path);
    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    ).map((a) => a.getAttribute('href'));

    expect(hrefs).toContain(PLAY_STORE_URL);
    expect(hrefs).toContain('/features');
  });
});
