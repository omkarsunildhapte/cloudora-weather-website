/** How a change is labelled in the What's New timeline. */
export type ChangeKind = 'new' | 'improved' | 'fixed';

export interface ReleaseChange {
  kind: ChangeKind;
  title: string;
  detail: string;
}

/** One release entry on `/whats-new`, also the source of that page's JSON-LD. */
export interface Release {
  version: string;
  /** Display date, e.g. "September 2026". */
  date: string;
  /** Machine-readable date for `<time datetime>` and JSON-LD. */
  isoDate: string;
  headline: string;
  summary: string;
  changes: ReleaseChange[];
}
