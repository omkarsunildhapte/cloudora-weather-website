import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PLAY_STORE_URL } from '@constants/index';
import { PlayStoreButtonVariant } from '@appTypes/index';

/**
 * The site's single conversion component — every "download" moment on the
 * site renders this. Uses Google's official "Get it on Google Play" badge
 * artwork (public/badges/google-play-badge.webp — a lossless re-encode of
 * the PNG Google provides, pixel-identical, just smaller; sourced from Google's own
 * badge program at https://play.google.com/intl/en_us/badges/ — the badge
 * is provided by Google specifically for developer websites linking to
 * their own Play Store listing). Variants only control display size; the
 * badge's own design/colors must not be altered or recolored.
 */
@Component({
  selector: 'app-play-store-button',
  imports: [NgOptimizedImage],
  templateUrl: './play-store-button.html',
  styleUrl: './play-store-button.css',
})
export class PlayStoreButton {
  readonly variant = input<PlayStoreButtonVariant>('primary');
  readonly url = PLAY_STORE_URL;
}
