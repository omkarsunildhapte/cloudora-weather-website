import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from '@shared/footer/footer';
import { COMPANY_NAME } from '@constants/index';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Footer);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the current company name and year in the copyright line', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(COMPANY_NAME);
    expect(text).toContain(String(new Date().getFullYear()));
  });
});
