/**
 * The subset of OpenWeatherMap's current-weather response
 * (`/data/2.5/weather`) that this site actually reads.
 *
 * The site never talks to OpenWeatherMap directly — it goes through the
 * Worker proxy at `/api/owm/weather`, which relays the upstream JSON
 * unchanged (see `worker/routes/weather.ts`). That means this shape is the
 * provider's, not ours: fields are snake_case and optional wherever the
 * upstream omits them for some stations (`wind.gust`, `visibility` and the
 * `sea_level`/`grnd_level` pressures are the common gaps).
 */
export interface OwmCurrentWeather {
  name: string;
  /** Shift in seconds from UTC for the observation's location. */
  timezone: number;
  /** Time of data calculation, unix UTC seconds. */
  dt: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  /** Metres, capped at 10000 by the provider. Absent for some stations. */
  visibility?: number;
  sys: { country?: string; sunrise?: number; sunset?: number };
}
