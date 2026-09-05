import { FeatureDetail } from '@appTypes/index';

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
    tag: null,
    description: 'The next 24 hours in 3-hour steps, so you know whether to carry an umbrella to lunch or wait until evening.',
    points: ['Temperature and condition icon for every slot', 'Chance of rain shown per slot'],
  },
  {
    index: '04',
    icon: 'forecast',
    title: '5-Day Forecast',
    tag: null,
    description: 'Daily highs and lows with a proportional min–max range bar, plus rain probability for each day.',
    points: ['See the whole week\'s shape at a glance', 'Rain chance per day so you can plan ahead'],
  },
  {
    index: '05',
    icon: 'leaf',
    title: 'Air Quality Index',
    tag: null,
    description: 'Live AQI for your location, rated from Good to Very Poor and colour-coded so you can read it in a second.',
    points: ['Shown right beside the current temperature — no digging through menus', 'Based on OpenWeatherMap air-pollution data'],
  },
  {
    index: '06',
    icon: 'uv',
    title: 'UV, Wind, Pressure & Visibility',
    tag: null,
    description: 'The details strip gives you the numbers that matter: humidity, wind speed and direction, UV index, pressure, and visibility.',
    points: ['UV index labelled from Low to Extreme', 'Wind with compass direction, not just a number'],
  },
  {
    index: '07',
    icon: 'rain',
    title: 'Rain Heads-Up',
    tag: null,
    description:
      'A quick chip under the temperature tells you whether rain is expected in the next couple of hours — and turns into a warning when it is.',
    points: ['Derived from the hourly forecast\'s precipitation probability', 'Optional local notifications for weather alerts (with your permission)'],
  },
  {
    index: '08',
    icon: 'lock',
    title: 'Privacy-First',
    tag: null,
    description:
      'No account, no ads, no trackers. Your preferences and consent choices stay on your device; only your coordinates go out, and only to fetch the weather.',
    points: ['Manage or withdraw consent for AI processing and notifications any time', 'Delete all locally stored data from inside the app'],
  },
];
