import { TestBed } from '@angular/core/testing';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { ScrollProgressService } from '@services/scroll-progress/scroll-progress.service';

describe('SunriseLayer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SunriseLayer],
    }).compileComponents();
  });

  it('should create and starts the shared ScrollProgressService', () => {
    const service = TestBed.inject(ScrollProgressService);
    const startSpy = vi.spyOn(service, 'start');

    const fixture = TestBed.createComponent(SunriseLayer);

    expect(fixture.componentInstance).toBeTruthy();
    expect(startSpy).toHaveBeenCalled();
  });

  it('exposes the same progress signal as ScrollProgressService (single source of truth)', () => {
    const service = TestBed.inject(ScrollProgressService);
    const fixture = TestBed.createComponent(SunriseLayer);

    expect(fixture.componentInstance.progress).toBe(service.progress);
  });

  it('reflects progress changes onto the --progress custom property', () => {
    const service = TestBed.inject(ScrollProgressService);
    const fixture = TestBed.createComponent(SunriseLayer);
    fixture.detectChanges();

    service.progress.set(0.65);
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sky-layer');
    expect(layer.style.getPropertyValue('--progress')).toBe('0.65');
  });
});

describe('SunriseLayer markup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SunriseLayer] }).compileComponents();
  });

  it('renders the brand glow and three cloud bands with clouds in each', () => {
    const fixture = TestBed.createComponent(SunriseLayer);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('.sky-glow')).toHaveLength(2);
    expect(el.querySelector('.sun .sun-core')).not.toBeNull();
    expect(el.querySelector('.horizon')).not.toBeNull();
    const bands = el.querySelectorAll('.cloud-band');
    expect(bands).toHaveLength(3);
    bands.forEach((band) => expect(band.querySelectorAll('.cloud').length).toBeGreaterThan(0));
    expect(el.querySelector('.sky-layer')?.getAttribute('aria-hidden')).toBe('true');
  });
});
