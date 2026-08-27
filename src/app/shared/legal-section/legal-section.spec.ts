import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LegalSection } from '@shared/legal-section/legal-section';

@Component({
  selector: 'app-legal-section-host',
  imports: [LegalSection],
  template: `<app-legal-section heading="1. What We Collect"
    ><p>Projected legal body text.</p></app-legal-section
  >`,
})
class HostComponent {}

describe('LegalSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('renders the heading input', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2')?.textContent).toBe('1. What We Collect');
  });

  it('projects arbitrary content via ng-content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Projected legal body text.');
  });
});
