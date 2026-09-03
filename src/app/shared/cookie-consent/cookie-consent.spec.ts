import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CookieConsent } from '@shared/cookie-consent/cookie-consent';
import { ConsentService } from '@services/consent/consent.service';

/**
 * Visibility is decided in `afterNextRender`, which TestBed runs as part of
 * `detectChanges()` — so every assertion here has to come after that, not after
 * construction alone. That timing is the whole point of the component (it keeps
 * the banner out of the prerendered HTML to avoid a hydration mismatch), so it
 * is what these tests pin down.
 */
describe('CookieConsent', () => {
  const consent = {
    decision: () => null as string | null,
    accept: () => undefined,
    decline: () => undefined,
  };

  const setup = async (decision: string | null) => {
    const service = {
      ...consent,
      decision: () => decision,
      accept: vi.fn(),
      decline: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [CookieConsent],
      providers: [provideRouter([]), { provide: ConsentService, useValue: service }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CookieConsent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, service };
  };

  it('should create', async () => {
    const { fixture } = await setup(null);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the banner when no choice has been stored yet', async () => {
    const { fixture } = await setup(null);
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('stays hidden once a choice exists', async () => {
    const { fixture } = await setup('accepted');
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('records acceptance and dismisses itself', async () => {
    const { fixture, service } = await setup(null);
    fixture.componentInstance.accept();
    expect(service.accept).toHaveBeenCalled();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('records a decline and dismisses itself', async () => {
    const { fixture, service } = await setup(null);
    fixture.componentInstance.decline();
    expect(service.decline).toHaveBeenCalled();
    expect(fixture.componentInstance.visible()).toBe(false);
  });
});
