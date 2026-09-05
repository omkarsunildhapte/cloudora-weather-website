/**
 * LiveWeatherService: the Worker endpoint it calls, the unit conversions it
 * applies, and the label tables it maps provider codes through.
 */

/** Same-origin Worker route; see `worker/index.ts`. */
export const WEATHER_ENDPOINT = '/api/owm/weather';
export const UNITS = 'metric';
export const DEFAULT_CITY_ID = 'pune';

/** Metres per kilometre, for the visibility reading. */
export const METRES_PER_KM = 1000;
/** OpenWeatherMap caps reported visibility at 10 km. */
export const MAX_VISIBILITY_M = 10000;
/** `wind.speed` arrives in m/s under `units=metric`. */
export const MS_TO_KMH = 3.6;
export const MS_PER_SECOND = 1000;

export const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];
export const DEGREES_PER_POINT = 360 / COMPASS_POINTS.length;

/**
 * OpenWeatherMap icon-code prefix → `@shared/feature-icon` key. The trailing
 * `d`/`n` of the provider's code is stripped first; clear skies are the only
 * condition where day and night get different glyphs.
 */
export const CONDITION_ICONS: Record<string, string> = {
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
export const FALLBACK_CONDITION_ICON = 'cloud';
export const NIGHT_CLEAR_ICON = 'moon';
