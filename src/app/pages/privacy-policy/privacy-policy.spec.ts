import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { PrivacyPolicy } from '@pages/privacy-policy/privacy-policy';
import { CONTACT_EMAIL, COMPANY_NAME } from '@constants/index';

describe('PrivacyPolicy', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicy],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PrivacyPolicy);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets a distinct page title via SeoService on init', () => {
    const fixture = TestBed.createComponent(PrivacyPolicy);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Privacy Policy — Cloudora Weather');
  });

  it('exposes the single-source-of-truth contact email and company name', () => {
    const fixture = TestBed.createComponent(PrivacyPolicy);
    expect(fixture.componentInstance.email).toBe(CONTACT_EMAIL);
    expect(fixture.componentInstance.company).toBe(COMPANY_NAME);
  });
});
