import { TestBed } from '@angular/core/testing';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';

describe('FeatureIcon', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureIcon],
    }).compileComponents();
  });

  const knownKeys = [
    'sun',
    'ai',
    'cloud',
    'rain',
    'wind',
    'uv',
    'hourly',
    'forecast',
    'radar',
    'leaf',
    'location',
    'bell',
    'history',
    'lock',
    'document',
    'save',
    'blocked',
    'mail',
    'globe',
    'warning',
  ];

  it.each(knownKeys)('renders SVG content for the "%s" icon key', (key) => {
    const fixture = TestBed.createComponent(FeatureIcon);
    fixture.componentRef.setInput('key', key);
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.children.length).toBeGreaterThan(0);
  });

  it('renders an empty (but present) SVG for an unrecognized key rather than throwing', () => {
    const fixture = TestBed.createComponent(FeatureIcon);
    fixture.componentRef.setInput('key', 'not-a-real-icon');
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });
});
