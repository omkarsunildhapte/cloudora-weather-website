import { GuideHeroContent, UvBand } from '@appTypes/index';
import { GUIDES_UPDATED, UV_GUIDE_PATH, guideFor } from '@constants/guides';

/**
 * Table rendered by the UV-index guide.
 */

/** Source: the WHO/WMO/UNEP/ICNIRP Global Solar UV Index, the international
 *  standard the app's UV labels follow. */
export const UV_BANDS: UvBand[] = [
  {
    range: '0–2',
    name: 'Low',
    advice: 'No protection needed for most people. You can safely stay outside.',
  },
  {
    range: '3–5',
    name: 'Moderate',
    advice:
      'Protection starts here: shade around midday, a shirt, sunscreen and a hat if you are out for a while.',
  },
  {
    range: '6–7',
    name: 'High',
    advice:
      'Protection required. Seek shade during the middle of the day, cover up, and reapply sunscreen.',
  },
  {
    range: '8–10',
    name: 'Very High',
    advice:
      'Extra protection. Unprotected skin burns quickly; avoid being out between late morning and mid-afternoon.',
  },
  {
    range: '11+',
    name: 'Extreme',
    advice:
      'Take every precaution. Unprotected skin can burn in minutes. Stay inside during the peak hours if you can.',
  },
];

/**
 * Masthead copy. `icon` and `readingTime` come off the catalogue entry rather
 * than being retyped here — they were literals in the template, duplicating
 * what `/guides` already shows for the same guide.
 */
export const UV_GUIDE_HERO: GuideHeroContent = {
  eyebrow: 'UV Index',
  icon: guideFor(UV_GUIDE_PATH).icon,
  titleLead: 'How to Read the UV Index',
  titleAccent: 'and When You Need Sunscreen',
  summary:
    'It is not a temperature, it is not a brightness reading, and a cool cloudy day can still burn you. Here is what the number is actually counting.',
  readingTime: guideFor(UV_GUIDE_PATH).readingTime,
  updated: GUIDES_UPDATED.display,
};
