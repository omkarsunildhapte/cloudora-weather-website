import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { WhatsNew } from '@pages/whats-new/whats-new';
import { PLAY_STORE_URL } from '@constants/index';

describe('WhatsNew', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsNew],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('sets its own title, canonical path and release-aware JSON-LD', () => {
    const fixture = TestBed.createComponent(WhatsNew);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe("What's New — Cloudora Weather Release Notes");
    expect(document.getElementById('page-canonical-link')?.getAttribute('href')).toMatch(
      /\/whats-new$/,
    );

    const schema: {
      '@type': string;
      mainEntity: { softwareVersion: string; installUrl: string };
    } = JSON.parse(document.getElementById('page-structured-data')?.textContent ?? '{}');

    expect(schema['@type']).toBe('WebPage');
    expect(schema.mainEntity.softwareVersion).toBe(
      fixture.componentInstance.releases[0].version,
    );
    expect(schema.mainEntity.installUrl).toBe(PLAY_STORE_URL);
  });

  it('keeps releases newest-first, with the first one reported as latest', () => {
    const fixture = TestBed.createComponent(WhatsNew);
    const { releases, latest } = fixture.componentInstance;

    expect(releases.length).toBeGreaterThan(0);
    expect(latest).toBe(releases[0]);
    expect(latest.version).toBe('0.0.1');
    // Newest first: every entry is dated no earlier than the one after it.
    for (let i = 1; i < releases.length; i++) {
      expect(releases[i - 1].isoDate >= releases[i].isoDate).toBe(true);
    }
  });

  it('renders exactly one h1 and every change line of the initial release', () => {
    const fixture = TestBed.createComponent(WhatsNew);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.change').length).toBe(
      fixture.componentInstance.releases[0].changes.length,
    );
    expect(fixture.nativeElement.querySelector('.release-badge')?.textContent?.trim()).toBe(
      'Current',
    );
  });
});
