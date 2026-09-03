import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LiveWeatherService } from '@services/live-weather/live-weather.service';
import { DemoCity, OwmCurrentWeather } from '@appTypes/index';

/** Trimmed but realistic `/api/owm/weather?...&units=metric` payload — an
 *  overcast night in Pune, matching what the live Worker actually returns. */
const puneNight: OwmCurrentWeather = {
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
  wind: { speed: 2.4, deg: 252, gust: 4.16 },
  clouds: { all: 91 },
  visibility: 10000,
  sys: { country: 'IN', sunrise: 1788483036, sunset: 1788527839 },
};

function cityFor(service: LiveWeatherService, id: string): DemoCity {
  const city = service.cities.find((c) => c.id === id);
  if (!city) throw new Error(`Test fixture expects a "${id}" preset city`);
  return city;
}

describe('LiveWeatherService', () => {
  let service: LiveWeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveWeatherService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers four preset cities and defaults to Pune', () => {
    expect(service.cities.length).toBe(4);
    expect(service.cities.map((c) => c.id)).toEqual(['pune', 'london', 'new-york', 'tokyo']);
    expect(service.selectedCity().name).toBe('Pune');
  });

  it('select() switches the active city, and ignores ids that are not presets', () => {
    service.select('tokyo');
    expect(service.selectedCity().id).toBe('tokyo');

    service.select('atlantis');
    expect(service.selectedCity().id).toBe('tokyo');
  });

  describe('toSnapshot()', () => {
    it('rounds the temperatures and sentence-cases the provider description', () => {
      const snapshot = service.toSnapshot(cityFor(service, 'pune'), puneNight);

      expect(snapshot.temperature).toBe(24);
      expect(snapshot.feelsLike).toBe(24);
      expect(snapshot.low).toBe(22);
      expect(snapshot.high).toBe(27);
      expect(snapshot.condition).toBe('Overcast clouds');
      expect(snapshot.place).toBe('Pune, IN');
    });

    it('reads night from the observation time relative to sunrise/sunset', () => {
      const night = service.toSnapshot(cityFor(service, 'pune'), puneNight);
      expect(night.isNight).toBe(true);

      // Same payload, observed just after sunrise.
      const day = service.toSnapshot(cityFor(service, 'pune'), {
        ...puneNight,
        dt: puneNight.sys.sunrise! + 3600,
      });
      expect(day.isNight).toBe(false);
    });

    it('maps the provider icon code to a feature-icon key, with a night variant for clear skies', () => {
      const clearNight = service.toSnapshot(cityFor(service, 'pune'), {
        ...puneNight,
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01n' }],
      });
      expect(clearNight.icon).toBe('moon');

      const clearDay = service.toSnapshot(cityFor(service, 'pune'), {
        ...puneNight,
        dt: puneNight.sys.sunrise! + 3600,
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      });
      expect(clearDay.icon).toBe('sun');

      const storm = service.toSnapshot(cityFor(service, 'pune'), {
        ...puneNight,
        weather: [{ id: 211, main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' }],
      });
      expect(storm.icon).toBe('storm');
    });

    it('formats the detail strip with units, km/h wind and a compass point', () => {
      const { details } = service.toSnapshot(cityFor(service, 'pune'), puneNight);

      expect(details.map((d) => d.label)).toEqual([
        'Humidity',
        'Wind',
        'Pressure',
        'Visibility',
        'Cloud cover',
      ]);
      expect(details[0].value).toBe('38%');
      // 2.4 m/s -> 8.64 km/h -> 9; 252° -> WSW
      expect(details[1].value).toBe('9 km/h WSW');
      expect(details[2].value).toBe('1010 hPa');
      expect(details[3].value).toBe('10 km');
      expect(details[4].value).toBe('91%');
    });

    it('falls back to the provider cap when visibility is missing', () => {
      const withoutVisibility: OwmCurrentWeather = { ...puneNight };
      delete withoutVisibility.visibility;

      const { details } = service.toSnapshot(cityFor(service, 'pune'), withoutVisibility);
      expect(details[3].value).toBe('10 km');
    });

    it('renders the observation time in the observed location\'s own timezone', () => {
      // dt 1788465245 is 19:54 UTC; Pune is UTC+5:30, so 01:24 the next day.
      const snapshot = service.toSnapshot(cityFor(service, 'pune'), puneNight);
      expect(snapshot.observedAt).toBe('01:24');
    });
  });

  describe('snapshot resource', () => {
    it('requests the selected city through the same-origin Worker proxy', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(() =>
          Promise.resolve(new Response(JSON.stringify(puneNight), { status: 200 })),
        );

      TestBed.tick();
      await TestBed.inject(ApplicationRef).whenStable();

      expect(fetchSpy).toHaveBeenCalled();
      const requested = String(fetchSpy.mock.calls[0][0]);
      expect(requested).toContain('/api/owm/weather');
      expect(requested).toContain('lat=18.5204');
      expect(requested).toContain('lon=73.8567');
      expect(requested).toContain('units=metric');
      expect(service.snapshot.value()?.place).toBe('Pune, IN');
    });

    it('surfaces a non-OK proxy response as a resource error rather than a value', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response('{"ok":false}', { status: 502 })),
      );

      TestBed.tick();
      await TestBed.inject(ApplicationRef).whenStable();

      expect(service.snapshot.hasValue()).toBe(false);
      expect(service.snapshot.error()).toBeTruthy();
    });
  });
});
