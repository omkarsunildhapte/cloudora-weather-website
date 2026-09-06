import { FeatureCategory, FeatureDetail } from '@appTypes/index';

/**
 * The expanded feature list rendered by `/features`.
 *
 * `index` is the displayed ordinal and must stay sequential and in step with
 * the array order — features.spec.ts asserts both, and the home page's "View
 * all N features" copy is derived from this length.
 */
export const FEATURE_DETAILS: FeatureDetail[] = [
  {
    index: '01',
    icon: 'sun',
    title: 'Real-Time Conditions',
    category: 'Forecasting',
    tag: null,
    description:
      'Current temperature, feels-like, and today\'s high and low for wherever you are — pulled fresh from OpenWeatherMap every time you open the app or pull to refresh.',
    points: [
      'Uses your device location (with your permission), with a sensible fallback if it\'s denied',
      'Condition-aware hero: the background changes with the sky — clear, cloudy, rain, storms, night',
      'Sunrise and sunset times for the day',
    ],
  },
  {
    index: '02',
    icon: 'ai',
    title: 'AI Weather Insight',
    category: 'Forecasting',
    tag: 'AI',
    description:
      'A short, human-sounding summary of what the day actually feels like and what to plan for, generated from the live forecast data.',
    points: [
      'Written from real numbers — temperature, humidity, wind, rain chance — not canned phrases',
      'You choose what to share — AI processing can be switched off in the app\'s privacy preferences',
      'Falls back gracefully when you\'re offline or the AI service is unavailable',
    ],
  },
  {
    index: '03',
    icon: 'hourly',
    title: 'Hourly Forecast',
    category: 'Forecasting',
    tag: null,
    description: 'The next 24 hours in 3-hour steps, so you know whether to carry an umbrella to lunch or wait until evening.',
    points: ['Temperature and condition icon for every slot', 'Chance of rain shown per slot'],
  },
  {
    index: '04',
    icon: 'forecast',
    title: '5-Day Forecast',
    category: 'Forecasting',
    tag: null,
    description: 'Daily highs and lows with a proportional min–max range bar, plus rain probability for each day.',
    points: ['See the whole week\'s shape at a glance', 'Rain chance per day so you can plan ahead'],
  },
  {
    index: '05',
    icon: 'leaf',
    title: 'Air Quality Index',
    category: 'Air, sun & storms',
    tag: null,
    description: 'Live AQI for your location, rated from Good to Very Poor and colour-coded so you can read it in a second.',
    points: ['Shown right beside the current temperature — no digging through menus', 'Based on OpenWeatherMap air-pollution data'],
  },
  {
    index: '06',
    icon: 'uv',
    title: 'UV, Wind, Pressure & Visibility',
    category: 'Air, sun & storms',
    tag: null,
    description: 'The details strip gives you the numbers that matter: humidity, wind speed and direction, UV index, pressure, and visibility.',
    points: ['UV index labelled from Low to Extreme', 'Wind with compass direction, not just a number'],
  },
  {
    index: '07',
    icon: 'rain',
    title: 'Rain Heads-Up',
    category: 'Forecasting',
    tag: null,
    description:
      'A quick chip under the temperature tells you whether rain is expected in the next couple of hours — and turns into a warning when it is.',
    points: ['Derived from the hourly forecast\'s precipitation probability', 'Optional local notifications for weather alerts (with your permission)'],
  },
  {
    index: '08',
    icon: 'radar',
    title: 'Live Radar Map',
    category: 'Forecasting',
    tag: null,
    description:
      'A scrubbable radar map with a timeline, so you can watch where the rain has been and where it is heading rather than reading a single still frame.',
    points: [
      'Four layers: precipitation, clouds, temperature and wind',
      'Drag the timeline through recent frames, or press play to animate it',
      'Falls back to a model heat map where live radar has no coverage',
      'Two-hour rain-chance chart for your exact spot',
    ],
  },
  {
    index: '09',
    icon: 'bell',
    title: 'Weather Alerts',
    category: 'Air, sun & storms',
    tag: null,
    description:
      'Alerts worked out on your device from the forecast, not pulled from a paid feed — thunderstorms, heavy rain, heat, cold and strong wind across the next 48 hours.',
    points: [
      'Optional notifications, off until you turn them on',
      'A daily briefing at an hour you choose',
      'Watches your saved places too, not just where you are standing',
      'River outlook flags unusual discharge on nearby waterways',
    ],
  },
  {
    index: '10',
    icon: 'storm',
    title: 'Storm & Lightning Outlook',
    category: 'Air, sun & storms',
    tag: null,
    description:
      'A five-day thunderstorm view built on CAPE — the meteorological measure of how much fuel the atmosphere is holding for storms.',
    points: [
      'Storm energy with a plain-language reading of what it means',
      'Storm windows: the specific hours worth avoiding',
      'Safety guidance for when thunder actually arrives',
    ],
  },
  {
    index: '11',
    icon: 'moon',
    title: 'Sun & Moon',
    category: 'Air, sun & storms',
    tag: null,
    description:
      'Sunrise, sunset, daylight length and the lunar cycle, plus how much solar energy is actually reaching the ground.',
    points: [
      'Golden hour and solar noon, not just rise and set times',
      'Moon phase, illumination and the next new and full moon',
      'Shortwave radiation and sunshine duration for the day ahead',
    ],
  },
  {
    index: '12',
    icon: 'history',
    title: 'Past Weather',
    category: 'Tools',
    tag: null,
    description:
      'Up to three months of history for your location, with the seasonal normals to compare it against.',
    points: [
      'Daily highs, lows, rainfall and wind going back 92 days',
      'Usual high and low for the date, drawn from the climate record',
      'Chart and day-by-day list, so you can check a specific date',
    ],
  },
  {
    index: '13',
    icon: 'globe',
    title: 'Compare Cities',
    category: 'Tools',
    tag: null,
    description:
      'Up to six cities side by side, right now — useful when you are deciding where to go or what to pack.',
    points: [
      'Temperature, feels-like, humidity and wind in one row each',
      'Search any city; the list is kept on your device',
    ],
  },
  {
    index: '14',
    icon: 'leaf',
    title: 'Field & Soil Conditions',
    category: 'Tools',
    tag: null,
    description:
      'What the ground is doing, not just the sky. Readings most weather apps never show, aimed at anyone whose work happens outdoors.',
    points: [
      'Soil temperature and moisture measured 3–9 cm down, where shallow roots sit',
      'Dew point, evapotranspiration and storm energy',
      'Plain-language guidance on whether conditions suit field work',
    ],
  },
  {
    index: '15',
    icon: 'home',
    title: 'Home-Screen Widget & Shortcuts',
    category: 'On your phone',
    tag: null,
    description:
      'Current conditions on your Android home screen, without opening the app.',
    points: [
      'Widget refreshes from the last reading Cloudora synced',
      'Quick-settings tile for a one-tap check',
      'Long-press shortcuts straight to radar, forecast, alerts or air quality',
    ],
  },
  {
    index: '16',
    icon: 'document',
    title: 'Climate & Weather News',
    category: 'Tools',
    tag: null,
    description:
      'Weather, climate and environment stories from public feeds, filtered so the list stays relevant.',
    points: [
      'Sorted newest first, capped at 20 stories',
      'Filter by weather, climate or environment',
      'Headlines are classified by their own text, not just the feed they came from',
    ],
  },
  {
    index: '17',
    icon: 'lock',
    title: 'Privacy-First',
    category: 'On your phone',
    tag: null,
    description:
      'No account, no ads, no trackers. Your preferences and consent choices stay on your device; only your coordinates go out, and only to fetch the weather.',
    points: ['Manage or withdraw consent for AI processing and notifications any time', 'Delete all locally stored data from inside the app'],
  },
];

/** Section order on /features. Anything not listed here would simply not render. */
export const FEATURE_CATEGORIES: FeatureCategory[] = [
  'Forecasting',
  'Air, sun & storms',
  'Tools',
  'On your phone',
];

/** The features in one section, in declaration order. */
export function featuresIn(category: FeatureCategory): FeatureDetail[] {
  return FEATURE_DETAILS.filter((feature) => feature.category === category);
}

/**
 * Category name -> anchor id on /features.
 *
 * Shared rather than a method on the page: the home page needs the same mapping
 * to recognise a category fragment, and two copies of this would drift into
 * links that point at ids nothing renders.
 */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** The category a root-level fragment refers to, or null if it means nothing. */
export function categoryForSlug(fragment: string | null): FeatureCategory | null {
  if (!fragment) return null;
  return FEATURE_CATEGORIES.find((c) => categorySlug(c) === fragment) ?? null;
}

