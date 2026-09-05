import { GuideHeroContent, ReflectivityBand } from '@appTypes/index';
import { GUIDES_UPDATED, RADAR_GUIDE_PATH, guideFor } from '@constants/guides';

/**
 * Legend rendered by the precipitation-radar guide.
 */

export const REFLECTIVITY_BANDS: ReflectivityBand[] = [
  {
    dbz: 'Under 20 dBZ',
    colour: 'Pale blue / light green',
    meaning: 'Drizzle, or rain that may be evaporating before it lands. Often not worth a coat.',
  },
  {
    dbz: '20–30 dBZ',
    colour: 'Green',
    meaning: 'Light rain — the kind you can walk in for a few minutes without much thought.',
  },
  {
    dbz: '30–40 dBZ',
    colour: 'Yellow',
    meaning: 'Moderate rain. You will be wet in a minute or two without a coat.',
  },
  {
    dbz: '40–50 dBZ',
    colour: 'Orange to red',
    meaning: 'Heavy rain, typically from a convective shower or thunderstorm. Drains struggle.',
  },
  {
    dbz: 'Above 50 dBZ',
    colour: 'Deep red to magenta',
    meaning: 'Torrential rain, and often hail — hail scatters radar energy far more than rain.',
  },
];

/**
 * Masthead copy. `icon` and `readingTime` come off the catalogue entry rather
 * than being retyped here — they were literals in the template, duplicating
 * what `/guides` already shows for the same guide.
 */
export const RADAR_GUIDE_HERO: GuideHeroContent = {
  eyebrow: 'Radar',
  icon: guideFor(RADAR_GUIDE_PATH).icon,
  titleLead: 'How to Read',
  titleAccent: 'a Precipitation Radar Map',
  summary:
    'A radar map is not a forecast — it is a photograph of what is falling right now, taken with microwaves. Read it properly and you can time a walk to the minute.',
  readingTime: guideFor(RADAR_GUIDE_PATH).readingTime,
  updated: GUIDES_UPDATED.display,
};
