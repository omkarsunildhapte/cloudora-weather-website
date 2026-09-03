import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';

describe('GuideHero', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideHero],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(GuideHero);
    fixture.componentRef.setInput('eyebrow', 'Air Quality');
    fixture.componentRef.setInput('icon', 'leaf');
    fixture.componentRef.setInput('titleLead', 'What the Air Quality Index');
    fixture.componentRef.setInput('titleAccent', 'Actually Means');
    fixture.componentRef.setInput('summary', 'A short standfirst.');
    fixture.componentRef.setInput('readingTime', '6 min read');
    fixture.componentRef.setInput('updated', 'September 4, 2026');
    fixture.detectChanges();
    return fixture;
  }

  it('renders exactly one h1, assembled from the lead and accent halves', () => {
    const fixture = render();

    const headings: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'What the Air Quality Index Actually Means',
    );
  });

  it('renders the byline and a crawlable breadcrumb back to the index', () => {
    const fixture = render();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('6 min read');
    expect(text).toContain('Updated September 4, 2026');

    const crumbs: NodeListOf<HTMLAnchorElement> =
      fixture.nativeElement.querySelectorAll('nav[aria-label="Breadcrumb"] a');
    expect(Array.from(crumbs).map((a) => a.getAttribute('href'))).toEqual(['/', '/guides']);
  });
});
