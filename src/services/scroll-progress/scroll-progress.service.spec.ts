import { TestBed } from '@angular/core/testing';
import { ScrollProgressService } from '@services/scroll-progress/scroll-progress.service';

describe('ScrollProgressService', () => {
  let service: ScrollProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollProgressService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create with progress at 0', () => {
    expect(service).toBeTruthy();
    expect(service.progress()).toBe(0);
  });

  it('start() computes progress from scroll position vs. scrollable height', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(1400);

    service.start();

    // scrollable = 1400 - 800 = 600; progress = 300 / 600 = 0.5
    expect(service.progress()).toBe(0.5);
  });

  it('clamps progress to [0, 1] even with out-of-range scroll values', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(5000);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(1400);

    service.start();

    expect(service.progress()).toBe(1);
  });

  it('start() is idempotent — attaches the scroll listener only once', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    service.start();
    service.start();
    service.start();

    const scrollListenerCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'scroll',
    );
    expect(scrollListenerCalls.length).toBe(1);
  });
});
