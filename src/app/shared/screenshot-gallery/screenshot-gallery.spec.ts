import { DeferBlockState, TestBed } from '@angular/core/testing';
import { ScreenshotGallery } from '@shared/screenshot-gallery/screenshot-gallery';
import { ScreenshotSlot } from '@appTypes/index';

const sampleItems: ScreenshotSlot[] = [
  {
    src: null,
    alt: 'Home screen',
    caption: 'Real-Time Conditions',
    brief: 'Real screenshot: home',
    icon: 'sun',
  },
  {
    src: 'screenshots/ai.webp',
    alt: 'AI insight screen',
    caption: 'AI Insight',
    brief: 'Real screenshot: AI chat',
    icon: 'ai',
  },
];

describe('ScreenshotGallery', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotGallery],
    }).compileComponents();
  });

  it('does not render the gallery grid before the @defer(on viewport) trigger fires', async () => {
    const fixture = TestBed.createComponent(ScreenshotGallery);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gallery')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.gallery-placeholder')).toBeTruthy();
  });

  it('renders placeholder frames vs. real images correctly once deferred content loads', async () => {
    const fixture = TestBed.createComponent(ScreenshotGallery);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.detectChanges();
    await fixture.whenStable();

    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);
    fixture.detectChanges();

    const items: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.gallery-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.placeholder-fill')).toBeTruthy();
    expect(items[0].querySelector('img')).toBeFalsy();

    const img: HTMLImageElement | null = items[1].querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('screenshots/ai.webp');
  });
});
