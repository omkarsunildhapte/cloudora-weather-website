import { Component, input } from '@angular/core';

@Component({
  selector: 'app-legal-section',
  templateUrl: './legal-section.html',
  styleUrl: './legal-section.css',
})
export class LegalSection {
  readonly heading = input.required<string>();
}
