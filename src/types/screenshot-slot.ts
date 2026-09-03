export interface ScreenshotSlot {
  /** Path under public/screenshots/, e.g. 'screenshots/radar.webp'. Leave null to render the placeholder. */
  src: string | null;
  alt: string;
  caption: string;
  /** What to actually capture/source for this slot — shown as an on-page note only while src is null. */
  brief: string;
  /** Icon key (shared/feature-icon) shown inside the placeholder frame. */
  icon: string;
}
