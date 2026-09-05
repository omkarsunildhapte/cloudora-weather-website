/** One US AQI category row in the air-quality guide's concentration table. */
export interface AqiBand {
  /** Index range as displayed, e.g. "51-100". */
  index: string;
  name: string;
  pm25: string;
  pm10: string;
  ozone: string;
  no2: string;
}

/** The same AQI categories, paired with who should act and how. */
export interface AqiAdvice {
  index: string;
  name: string;
  everyone: string;
  sensitive: string;
}
