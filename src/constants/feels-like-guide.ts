import { DewPointBand, GuideHeroContent } from '@appTypes/index';
import { GUIDES_UPDATED, FEELS_LIKE_GUIDE_PATH, guideFor } from '@constants/guides';

/**
 * Table rendered by the feels-like-temperature guide.
 */

/** Dew point is the humidity measure that actually tracks comfort; these
 *  bands are the widely used forecaster rules of thumb, not a formal
 *  standard. */
export const DEW_POINT_BANDS: DewPointBand[] = [
  { range: 'Below 10 °C', name: 'Dry', note: 'Air feels crisp. Sweat evaporates almost instantly.' },
  {
    range: '10–15 °C',
    name: 'Comfortable',
    note: 'The range most people describe as pleasant, whatever the thermometer says.',
  },
  {
    range: '16–20 °C',
    name: 'Noticeably humid',
    note: 'Sticky on exertion. Shirts stop drying between efforts.',
  },
  {
    range: '21–24 °C',
    name: 'Oppressive',
    note: 'Uncomfortable even at rest; hard exercise starts to carry real risk.',
  },
  {
    range: '25 °C and above',
    name: 'Dangerous',
    note: 'Evaporative cooling is barely working. Heat illness becomes a serious concern.',
  },
];

/**
 * Masthead copy. `icon` and `readingTime` come off the catalogue entry rather
 * than being retyped here — they were literals in the template, duplicating
 * what `/guides` already shows for the same guide.
 */
export const FEELS_LIKE_GUIDE_HERO: GuideHeroContent = {
  eyebrow: 'Feels Like',
  icon: guideFor(FEELS_LIKE_GUIDE_PATH).icon,
  titleLead: "Why 'Feels Like' Differs",
  titleAccent: 'From the Real Temperature',
  summary:
    'The thermometer measures the air. The second number tries to measure you — and on a humid afternoon or a windy morning the two can be ten degrees apart.',
  readingTime: guideFor(FEELS_LIKE_GUIDE_PATH).readingTime,
  updated: GUIDES_UPDATED.display,
};
