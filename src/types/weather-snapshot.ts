/** One of the preset locations the homepage live demo can show. */
export interface DemoCity {
  /** Stable key — used as the `@for` track expression and the active-chip test. */
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

/** A single labelled reading in the demo card's detail grid. */
export interface WeatherDetail {
  /** `@shared/feature-icon` key. */
  icon: string;
  label: string;
  /** Already formatted for display, unit included. */
  value: string;
}

/**
 * A normalised, display-ready view of one current-weather observation.
 *
 * Everything the template needs is pre-formatted here rather than in the
 * template or a pipe, so the card renders raw strings and never has to reach
 * back into the provider's snake_case shape (`OwmCurrentWeather`).
 */
export interface WeatherSnapshot {
  cityId: string;
  place: string;
  /** Rounded whole degrees Celsius, no unit suffix. */
  temperature: number;
  feelsLike: number;
  low: number;
  high: number;
  /** e.g. "Overcast clouds" — the provider's description, sentence-cased. */
  condition: string;
  /** `@shared/feature-icon` key chosen from the provider's icon code. */
  icon: string;
  /** True between the observation's sunset and sunrise. */
  isNight: boolean;
  /** Local clock time at the observed location, e.g. "21:44". */
  observedAt: string;
  details: WeatherDetail[];
}
