/** One dBZ band in the radar guide's reflectivity legend. */
export interface ReflectivityBand {
  /** Reflectivity range as displayed, e.g. "20-30 dBZ". */
  dbz: string;
  /** Swatch colour for the legend chip. */
  colour: string;
  meaning: string;
}
