import { FeaturePreview, ScreenshotSlot } from '@appTypes/index';

/**
 * Home page content.
 */

export const SCREENSHOT_SLOTS: ScreenshotSlot[] = [
  {
    src: 'screenshots/home.webp',
    alt: 'Cloudora Weather home screen with current conditions, hourly and daily forecast',
    caption: 'Home',
    brief: 'Home screen: current conditions, hourly + 5-day forecast, AI insight',
    icon: 'sun',
  },
  {
    src: 'screenshots/forecast.webp',
    alt: 'Cloudora Weather 10-day forecast screen with temperature and precipitation charts',
    caption: 'Forecast',
    brief: 'Forecast screen: temperature trend, precipitation chart, daily list',
    icon: 'forecast',
  },
  {
    src: 'screenshots/radar.webp',
    alt: 'Cloudora Weather live precipitation radar screen',
    caption: 'Radar',
    brief: 'Radar screen: live precipitation map with timeline scrubber',
    icon: 'radar',
  },
  {
    src: 'screenshots/air-quality.webp',
    alt: 'Cloudora Weather air quality screen with AQI gauge and pollutant breakdown',
    caption: 'Air Quality',
    brief: 'Air quality screen: AQI gauge, pollutants, health recommendations',
    icon: 'leaf',
  },
];

/**
 * The six features the home page previews, in display order.
 *
 * A subset of FEATURE_DETAILS by title — home.spec.ts asserts that, so a
 * preview can never advertise something `/features` does not list — but with
 * its own shorter copy.
 */
export const PREVIEW_FEATURES: FeaturePreview[] = [
  {
    icon: 'sun',
    title: 'Real-Time Conditions',
    description: 'Temperature, feels-like, highs and lows for your exact location — refreshed on demand.',
    tag: null,
  },
  {
    icon: 'ai',
    title: 'AI Weather Insight',
    description: 'A short, plain-language read on your day, generated from the live forecast.',
    tag: 'AI',
  },
  {
    icon: 'hourly',
    title: 'Hourly Forecast',
    description: 'The next 24 hours in 3-hour steps, with the chance of rain for every slot.',
    tag: null,
  },
  {
    icon: 'forecast',
    title: '5-Day Forecast',
    description: 'Daily highs, lows and rain probability at a glance, with a range bar for each day.',
    tag: null,
  },
  {
    icon: 'leaf',
    title: 'Air Quality Index',
    description: 'Live AQI from Good to Very Poor, right next to the current temperature.',
    tag: null,
  },
  {
    icon: 'rain',
    title: 'Rain Heads-Up',
    description: 'A "no rain expected" chip when you\'re clear, and a warning when showers are likely.',
    tag: null,
  },
];
