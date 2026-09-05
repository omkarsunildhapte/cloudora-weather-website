import { AqiAdvice, AqiBand, GuideHeroContent } from '@appTypes/index';
import { GUIDES_UPDATED, AIR_QUALITY_GUIDE_PATH, guideFor } from '@constants/guides';

/**
 * Tables rendered by the air-quality guide.
 */

/** Source: OpenWeatherMap's published "Air Pollution Index levels scale",
 *  which is the scale the app's AQI reading comes from. */
export const AQI_BANDS: AqiBand[] = [
  { index: '1', name: 'Good', pm25: '0–10', pm10: '0–20', ozone: '0–60', no2: '0–40' },
  { index: '2', name: 'Fair', pm25: '10–25', pm10: '20–50', ozone: '60–100', no2: '40–70' },
  {
    index: '3',
    name: 'Moderate',
    pm25: '25–50',
    pm10: '50–100',
    ozone: '100–140',
    no2: '70–150',
  },
  { index: '4', name: 'Poor', pm25: '50–75', pm10: '100–200', ozone: '140–180', no2: '150–200' },
  { index: '5', name: 'Very Poor', pm25: '75+', pm10: '200+', ozone: '180+', no2: '200+' },
];

export const AQI_ADVICE: AqiAdvice[] = [
  {
    index: '1',
    name: 'Good',
    everyone: 'Nothing to change. Open the windows.',
    sensitive: 'No restrictions.',
  },
  {
    index: '2',
    name: 'Fair',
    everyone: 'Normal activity, including hard exercise outdoors.',
    sensitive: 'A few people with severe asthma may notice a difference on a long, hard effort.',
  },
  {
    index: '3',
    name: 'Moderate',
    everyone: 'Still fine for most people; you may prefer a quieter route than a main road.',
    sensitive:
      'Consider shortening or easing intense outdoor exercise, especially mid-afternoon when ozone peaks. Keep reliever medication with you.',
  },
  {
    index: '4',
    name: 'Poor',
    everyone:
      'Cut back prolonged heavy exertion outdoors and keep windows shut on the traffic side during rush hour.',
    sensitive:
      'Move exercise indoors. Watch for symptoms — tight chest, cough, eye or throat irritation — and act on them early.',
  },
  {
    index: '5',
    name: 'Very Poor',
    everyone:
      'Treat it as a health event: stay indoors where you can, keep windows shut, and postpone outdoor exercise.',
    sensitive:
      'Avoid going out at all if possible. A well-fitted FFP2/N95 respirator helps; a surgical or cloth mask does very little against fine particles.',
  },
];

/**
 * Masthead copy. `icon` and `readingTime` come off the catalogue entry rather
 * than being retyped here — they were literals in the template, duplicating
 * what `/guides` already shows for the same guide.
 */
export const AIR_QUALITY_GUIDE_HERO: GuideHeroContent = {
  eyebrow: 'Air Quality',
  icon: guideFor(AIR_QUALITY_GUIDE_PATH).icon,
  titleLead: 'What the Air Quality Index',
  titleAccent: 'Actually Means',
  summary:
    "Your weather app says the air is 'Moderate'. Moderate compared to what, made of what, and does it change what you should do today?",
  readingTime: guideFor(AIR_QUALITY_GUIDE_PATH).readingTime,
  updated: GUIDES_UPDATED.display,
};
