import { TestBed } from '@angular/core/testing';
import { FeatureCard } from '@shared/feature-card/feature-card';

describe('FeatureCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCard],
    }).compileComponents();
  });

  it('renders the title and description inputs', () => {
    const fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput('icon', 'sun');
    fixture.componentRef.setInput('title', 'Real-Time Conditions');
    fixture.componentRef.setInput('description', 'A custom expression parser.');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h3')?.textContent).toContain('Real-Time Conditions');
    expect(el.querySelector('p')?.textContent).toContain('A custom expression parser.');
  });

  it('hides the tag badge when tag is null (the default)', () => {
    const fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput('icon', 'sun');
    fixture.componentRef.setInput('title', 'Real-Time Conditions');
    fixture.componentRef.setInput('description', 'A custom expression parser.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('AI');
  });

  it('renders the tag badge when provided', () => {
    const fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput('icon', 'ai');
    fixture.componentRef.setInput('title', 'AI Weather Insight');
    fixture.componentRef.setInput('description', 'Chat with an AI.');
    fixture.componentRef.setInput('tag', 'AI');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('AI');
  });
});
