import { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConsentService } from '@services/consent/consent.service';

/** Node 25 exposes a Web Storage global that shadows jsdom's and throws
 *  unless --localstorage-file is passed, so the suite installs its own
 *  in-memory Storage rather than relying on the environment's. */
function installStorageStub(): void {
  const data = new Map<string, string>();
  const stub: Storage = {
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  };
  Object.defineProperty(window, 'localStorage', { value: stub, configurable: true });
}

describe('ConsentService', () => {
  let service: ConsentService;
  let gtag: Mock<(...args: unknown[]) => void>;
  let loadAnalytics: Mock<() => void>;

  beforeEach(() => {
    installStorageStub();
    gtag = vi.fn<(...args: unknown[]) => void>();
    window.gtag = gtag;
    loadAnalytics = vi.fn<() => void>();
    window.loadAnalytics = loadAnalytics;
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsentService);
  });

  afterEach(() => {
    delete window.gtag;
    delete window.loadAnalytics;
    vi.restoreAllMocks();
  });

  it('starts undecided so the banner is shown', () => {
    expect(service.decision()).toBeNull();
  });

  it('accept() grants analytics_storage and persists the choice', () => {
    service.accept();

    expect(service.decision()).toBe('granted');
    expect(window.localStorage.getItem('cloudora_site_consent_v1')).toBe('granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
  });

  it('accept() loads gtag.js, which is not fetched before consent', () => {
    expect(loadAnalytics).not.toHaveBeenCalled();

    service.accept();

    expect(loadAnalytics).toHaveBeenCalled();
  });

  it('decline() never downloads gtag.js at all', () => {
    service.decline();

    expect(loadAnalytics).not.toHaveBeenCalled();
  });

  it('decline() sends an explicit denial rather than staying silent', () => {
    service.decline();

    expect(service.decision()).toBe('denied');
    expect(window.localStorage.getItem('cloudora_site_consent_v1')).toBe('denied');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'denied' });
  });

  it('reads a previous decision on construction, so the banner is asked once', () => {
    window.localStorage.setItem('cloudora_site_consent_v1', 'granted');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(ConsentService).decision()).toBe('granted');
  });

  it('ignores a corrupted stored value', () => {
    window.localStorage.setItem('cloudora_site_consent_v1', 'yes-please');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(ConsentService).decision()).toBeNull();
  });
});
