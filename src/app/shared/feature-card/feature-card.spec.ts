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
    fixture.componentRef.setInput('feature', {
      icon: 'sun',
      title: 'Real-Time Conditions',
      description: 'A custom expression parser.',
      tag: null,
    });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h3')?.textContent).toContain('Real-Time Conditions');
    expect(el.querySelector('p')?.textContent).toContain('A custom expression parser.');
  });

  it('hides the tag badge when tag is null (the default)', () => {
    const fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput('feature', {
      icon: 'sun',
      title: 'Real-Time Conditions',
      description: 'A custom expression parser.',
      tag: null,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('AI');
  });

  it('renders the tag badge when provided', () => {
    const fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput('feature', {
      icon: 'ai',
      title: 'AI Weather Insight',
      description: 'Chat with an AI.',
      tag: 'AI',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('AI');
  });
});
