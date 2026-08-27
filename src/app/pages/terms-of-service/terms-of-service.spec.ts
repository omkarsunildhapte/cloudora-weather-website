import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TermsOfService } from '@pages/terms-of-service/terms-of-service';
import { CONTACT_EMAIL, COMPANY_NAME } from '@constants/index';

describe('TermsOfService', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsOfService],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TermsOfService);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets a distinct page title via SeoService on init', () => {
    const fixture = TestBed.createComponent(TermsOfService);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Terms of Service — Cloudora Weather');
  });

  it('exposes the single-source-of-truth contact email and company name', () => {
    const fixture = TestBed.createComponent(TermsOfService);
    expect(fixture.componentInstance.email).toBe(CONTACT_EMAIL);
    expect(fixture.componentInstance.company).toBe(COMPANY_NAME);
  });
});
