import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, computed, inject, resource, signal } from '@angular/core';
import { DemoCity, OwmCurrentWeather, WeatherDetail, WeatherSnapshot } from '@appTypes/index';

/**
 * Live current-conditions feed for the homepage demo card.
 *
 * Talks to this site's own Worker proxy (`worker/routes/weather.ts`), which
 * relays OpenWeatherMap with the API key held server-side — so the request is
 * same-origin and carries no credentials of its own. The proxy edge-caches for
 * five minutes, which is also roughly how often the upstream observation
 * changes, so the demo is "live" without hammering anyone's quota.
 *
 * **Why `resource()` and not `httpResource()`** (frontend-rules Rule 8): this
 * is exactly the reactive-GET shape the Resource APIs are for — the selected
 * city signal drives the fetch, previous requests auto-abort when the visitor
 * clicks a different chip. `httpResource()` would fit equally well but would
 * mean adding `provideHttpClient()` to an app that otherwise has no
 * `HttpClient` at all (the contact form uses bare `fetch` too), so plain
 * `fetch` inside a `resource()` loader keeps the bundle and the DI graph as
 * they are while still being fully declarative.
 *
 * **Prerender safety** (seo-rules Rule 0): `params` returns `undefined` on the
 * server, which leaves the resource in its `idle` state and means the loader —
 * and therefore `fetch` — never runs during the static build. The prerendered
 * HTML ships the card's skeleton; the browser fills it in after hydration.
 */

/** Same-origin Worker route; see `worker/index.ts`. */
const WEATHER_ENDPOINT = '/api/owm/weather';
const UNITS = 'metric';
const DEFAULT_CITY_ID = 'pune';

/** Metres per kilometre, for the visibility reading. */
const METRES_PER_KM = 1000;
/** OpenWeatherMap caps reported visibility at 10 km. */
const MAX_VISIBILITY_M = 10000;
/** `wind.speed` arrives in m/s under `units=metric`. */
const MS_TO_KMH = 3.6;
const MS_PER_SECOND = 1000;

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];
const DEGREES_PER_POINT = 360 / COMPASS_POINTS.length;

/**
 * OpenWeatherMap icon-code prefix → `@shared/feature-icon` key. The trailing
 * `d`/`n` of the provider's code is stripped first; clear skies are the only
 * condition where day and night get different glyphs.
 */
const CONDITION_ICONS: Record<string, string> = {
  '01': 'sun',
  '02': 'cloud',
  '03': 'cloud',
  '04': 'cloud',
  '09': 'rain',
  '10': 'rain',
  '11': 'storm',
  '13': 'snow',
  '50': 'mist',
};
const FALLBACK_CONDITION_ICON = 'cloud';
const NIGHT_CLEAR_ICON = 'moon';

@Service()
export class LiveWeatherService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Four widely-spread presets so the demo shows a genuinely different sky
   *  depending on which chip is picked. Coordinates are hardcoded rather than
   *  geocoded — the geocode round-trip would double the latency of the one
   *  request this section makes, for a list that never changes. */
  readonly cities: DemoCity[] = [
    { id: DEFAULT_CITY_ID, name: 'Pune', country: 'IN', lat: 18.5204, lon: 73.8567 },
    { id: 'london', name: 'London', country: 'GB', lat: 51.5072, lon: -0.1276 },
    { id: 'new-york', name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
    { id: 'tokyo', name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  ];

  private readonly selectedId = signal(DEFAULT_CITY_ID);

  readonly selectedCity = computed<DemoCity>(
    () => this.cities.find((city) => city.id === this.selectedId()) ?? this.cities[0],
  );

  readonly snapshot = resource<WeatherSnapshot, DemoCity | undefined>({
    // `undefined` on the server keeps the resource idle so nothing is fetched
    // during prerendering — see the class comment.
    params: () => (this.isBrowser ? this.selectedCity() : undefined),
    loader: async ({ params: city, abortSignal }) => {
      const url = `${WEATHER_ENDPOINT}?lat=${city.lat}&lon=${city.lon}&units=${UNITS}`;
      const response = await fetch(url, { signal: abortSignal });
      if (!response.ok) {
        throw new Error(`Weather request failed with status ${response.status}`);
      }
      return this.toSnapshot(city, (await response.json()) as OwmCurrentWeather);
    },
  });

  select(id: string): void {
    if (this.cities.some((city) => city.id === id)) this.selectedId.set(id);
  }

  /**
   * Turns the provider's raw payload into the display-ready shape the card
   * renders. Public so it can be unit-tested against a fixed payload without
   * driving the resource; nothing else calls it.
   */
  toSnapshot(city: DemoCity, data: OwmCurrentWeather): WeatherSnapshot {
    const conditions = data.weather[0];
    const isNight = this.isNight(data);

    return {
      cityId: city.id,
      place: `${city.name}, ${data.sys.country ?? city.country}`,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      low: Math.round(data.main.temp_min),
      high: Math.round(data.main.temp_max),
      condition: this.sentenceCase(conditions?.description ?? conditions?.main ?? ''),
      icon: this.conditionIcon(conditions?.icon, isNight),
      isNight,
      observedAt: this.localTime(data.dt, data.timezone),
      details: this.buildDetails(data),
    };
  }

  private buildDetails(data: OwmCurrentWeather): WeatherDetail[] {
    const visibilityKm = Math.round((data.visibility ?? MAX_VISIBILITY_M) / METRES_PER_KM);

    return [
      { icon: 'droplet', label: 'Humidity', value: `${Math.round(data.main.humidity)}%` },
      {
        icon: 'wind',
        label: 'Wind',
        value: `${Math.round(data.wind.speed * MS_TO_KMH)} km/h ${this.compass(data.wind.deg)}`,
      },
      { icon: 'gauge', label: 'Pressure', value: `${Math.round(data.main.pressure)} hPa` },
      { icon: 'eye', label: 'Visibility', value: `${visibilityKm} km` },
      { icon: 'cloud', label: 'Cloud cover', value: `${Math.round(data.clouds.all)}%` },
    ];
  }

  /** Sunrise/sunset are absolute UTC stamps, so this works regardless of the
   *  visitor's own timezone. Falls back to the provider's `d`/`n` icon suffix
   *  for the stations that omit them. */
  private isNight(data: OwmCurrentWeather): boolean {
    const { sunrise, sunset } = data.sys;
    if (sunrise === undefined || sunset === undefined) {
      return data.weather[0]?.icon.endsWith('n') ?? false;
    }
    return data.dt < sunrise || data.dt >= sunset;
  }

  private conditionIcon(code: string | undefined, isNight: boolean): string {
    const key = CONDITION_ICONS[code?.slice(0, 2) ?? ''] ?? FALLBACK_CONDITION_ICON;
    return isNight && key === 'sun' ? NIGHT_CLEAR_ICON : key;
  }

  /** Wall-clock time where the observation was taken. Built by shifting the
   *  UTC stamp by the location's own offset and reading it back in UTC, which
   *  avoids depending on the visitor's `Intl` timezone database. */
  private localTime(unixSeconds: number, offsetSeconds: number): string {
    const shifted = new Date((unixSeconds + offsetSeconds) * MS_PER_SECOND);
    const hours = String(shifted.getUTCHours()).padStart(2, '0');
    const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private compass(degrees: number): string {
    const index = Math.round(degrees / DEGREES_PER_POINT) % COMPASS_POINTS.length;
    return COMPASS_POINTS[index];
  }

  private sentenceCase(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  }
}
