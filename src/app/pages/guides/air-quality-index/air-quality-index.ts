import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, SITE_URL, otherGuides } from '@constants/index';

/** One row of OpenWeatherMap's documented air-pollution index scale. All
 *  concentrations are in µg/m³. */
interface AqiBand {
  index: string;
  name: string;
  pm25: string;
  pm10: string;
  ozone: string;
  no2: string;
}

interface AqiAdvice {
  index: string;
  name: string;
  everyone: string;
  sensitive: string;
}

const PATH = '/guides/air-quality-index';
const UPDATED_ISO = '2026-09-04';

@Component({
  selector: 'app-guide-air-quality-index',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './air-quality-index.html',
  styleUrl: './air-quality-index.css',
})
export class AirQualityIndexGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly updated = 'September 4, 2026';
  readonly related = otherGuides(PATH);

  /** Source: OpenWeatherMap's published "Air Pollution Index levels scale",
   *  which is the scale the app's AQI reading comes from. */
  readonly bands: AqiBand[] = [
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

  readonly advice: AqiAdvice[] = [
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

  ngOnInit(): void {
    const title = 'What the Air Quality Index Actually Means — Cloudora Weather';
    const description =
      'PM2.5, PM10, ozone and nitrogen dioxide explained, with the concentration bands behind the 1–5 air quality rating and what to do at each level.';

    this.seo.update({
      title,
      description,
      path: PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'What the Air Quality Index Actually Means',
        description,
        url: `${SITE_URL}${PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
        datePublished: UPDATED_ISO,
        dateModified: UPDATED_ISO,
        inLanguage: 'en',
        about: ['Air quality', 'PM2.5', 'Air Quality Index'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
