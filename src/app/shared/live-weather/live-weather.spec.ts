import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LiveWeather } from '@shared/live-weather/live-weather';
import { OwmCurrentWeather } from '@appTypes/index';

const payload: OwmCurrentWeather = {
  name: 'Pune',
  timezone: 19800,
  dt: 1788465245,
  weather: [{ id: 804, main: 'Clouds', description: 'overcast clouds', icon: '04n' }],
  main: {
    temp: 24.07,
    feels_like: 23.52,
    temp_min: 22.4,
    temp_max: 26.8,
    pressure: 1010,
    humidity: 38,
  },
  wind: { speed: 2.4, deg: 252 },
  clouds: { all: 91 },
  visibility: 10000,
  sys: { country: 'IN', sunrise: 1788483036, sunset: 1788527839 },
};

describe('LiveWeather', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveWeather],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the loading skeleton, not an empty card, before the reading arrives', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));

    const fixture = TestBed.createComponent(LiveWeather);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.live-temp')).toBeFalsy();
  });

  it('renders the live reading once the proxy responds', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(payload), { status: 200 })),
    );

    const fixture = TestBed.createComponent(LiveWeather);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(fixture.nativeElement.querySelector('.live-temp')).toBeTruthy();
    expect(text).toContain('24');
    expect(text).toContain('Overcast clouds');
    expect(text).toContain('Pune, IN');
    expect(fixture.nativeElement.querySelector('.skeleton')).toBeFalsy();
  });

  it('degrades to a presentable panel — never an error dump — when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const fixture = TestBed.createComponent(LiveWeather);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Live conditions are taking a break');
    expect(text).not.toContain('network down');
    expect(fixture.nativeElement.querySelector('.live-retry')).toBeTruthy();
  });

  it('exposes one chip per preset city, with the default marked active', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));

    const fixture = TestBed.createComponent(LiveWeather);
    fixture.detectChanges();

    const chips: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('.live-chip');
    expect(chips.length).toBe(4);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('select() re-points the resource at the chosen city', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(payload), { status: 200 })),
      );

    const fixture = TestBed.createComponent(LiveWeather);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.select('tokyo');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.selectedCity().id).toBe('tokyo');
    const lastRequest = String(fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1][0]);
    expect(lastRequest).toContain('lat=35.6762');
  });
});
