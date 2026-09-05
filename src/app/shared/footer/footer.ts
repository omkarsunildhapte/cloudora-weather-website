import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { COMPANY_NAME } from '@constants/index';

@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage, RouterLink, PlayStoreButton],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly company = COMPANY_NAME;
  readonly year = new Date().getFullYear();
}
