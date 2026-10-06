import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { COMPANY_NAME, COMPANY_URL } from '@constants/index';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, PlayStoreButton],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly company = COMPANY_NAME;
  readonly companyUrl = COMPANY_URL;
  readonly year = new Date().getFullYear();
}
