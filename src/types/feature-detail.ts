/** The section headings the features page groups its list under. */
export type FeatureCategory =
  | 'Forecasting'
  | 'Air, sun & storms'
  | 'Tools'
  | 'On your phone';

/** One expanded feature row on the `/features` page. */
export interface FeatureDetail {
  /** Two-digit ordinal shown beside the row, e.g. "01". */
  index: string;
  /** `@shared/feature-icon` key. */
  icon: string;
  title: string;
  /** Which group the feature is listed under on /features. */
  category: FeatureCategory;
  /** Optional badge ("New", "Beta"); null renders no badge. */
  tag: string | null;
  description: string;
  points: string[];
}

/**
 * The condensed feature card on the home page.
 *
 * Structurally a FeatureDetail without the ordinal or the bullet points, and
 * derived from it so a change to those field types reaches both. The copy is
 * separate on purpose: the home page previews six of the eight features with
 * shorter descriptions than `/features` uses.
 */
export type FeaturePreview = Pick<FeatureDetail, 'icon' | 'title' | 'tag' | 'description'>;
