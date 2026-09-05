/**
 * Everything the guide masthead renders.
 *
 * One object rather than the seven parallel inputs GuideHero used to take.
 * `icon` and `readingTime` are not authored here — each guide's constants file
 * reads them off its catalogue entry, which is what stops the masthead and the
 * `/guides` index from disagreeing about the same guide.
 */
export interface GuideHeroContent {
  /** Chip above the headline, e.g. "UV Index". */
  eyebrow: string;
  /** `@shared/feature-icon` key shown in the chip — from the catalogue. */
  icon: string;
  /** Headline split in two so the second half can take the brand gradient. */
  titleLead: string;
  titleAccent: string;
  /** Standfirst. Longer than the catalogue summary, which is index-card copy. */
  summary: string;
  /** From the catalogue, e.g. "6 min read". */
  readingTime: string;
  /** Human-readable update date, e.g. "September 4, 2026". */
  updated: string;
}
