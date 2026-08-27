import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { AnalyticsService } from '@services/analytics/analytics.service';
import { ConsentService } from '@services/consent/consent.service';
import { GA_MEASUREMENT_ID } from '@constants/index';

@Component({ template: '' })
class Blank {}

describe('AnalyticsService', () => {
  let gtagCalls: unknown[][];

  beforeEach(() => {
    gtagCalls = [];
    window.gtag = (...args: unknown[]) => {
      gtagCalls.push(args);
    };
    window.loadAnalytics = () => {};
    try {
      window.localStorage.clear();
    } catch {
      /* jsdom without storage */
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Blank },
          { path: 'features', component: Blank },
        ]),
      ],
    });
  });

  afterEach(() => {
    delete window.gtag;
    delete window.loadAnalytics;
  });

  const pageViews = () => gtagCalls.filter((c) => c[0] === 'event' && c[1] === 'page_view');

  it('sends nothing while consent has not been granted', async () => {
    TestBed.inject(AnalyticsService).start();
    await TestBed.inject(Router).navigateByUrl('/features');
    expect(pageViews()).toHaveLength(0);
  });

  it('sends one page_view per navigation once consent is granted', async () => {
    TestBed.inject(ConsentService).accept();
    gtagCalls = [];
    TestBed.inject(AnalyticsService).start();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await router.navigateByUrl('/features');

    const views = pageViews();
    expect(views).toHaveLength(2);
    expect(views[1][2]).toMatchObject({ send_to: GA_MEASUREMENT_ID, page_path: '/features' });
  });

  it('sends a page_view for the current page when consent is granted mid-session', async () => {
    const service = TestBed.inject(AnalyticsService);
    service.start();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/features');
    expect(pageViews()).toHaveLength(0);

    TestBed.inject(ConsentService).accept();
    TestBed.tick();

    const views = pageViews();
    expect(views).toHaveLength(1);
    expect(views[0][2]).toMatchObject({ page_path: '/features' });
  });

  it('start() is idempotent — a second call does not double-subscribe', async () => {
    TestBed.inject(ConsentService).accept();
    gtagCalls = [];
    const service = TestBed.inject(AnalyticsService);
    service.start();
    service.start();

    await TestBed.inject(Router).navigateByUrl('/features');
    expect(pageViews()).toHaveLength(1);
  });
});
