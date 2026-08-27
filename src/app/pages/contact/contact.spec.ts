import { TestBed } from '@angular/core/testing';
import { Contact } from '@pages/contact/contact';

function submitEvent(): Event {
  const event = new Event('submit');
  vi.spyOn(event, 'preventDefault');
  return event;
}

describe('Contact', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Contact>>;
  let component: Contact;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects submission with an empty name', async () => {
    component.emailField.set('visitor@example.com');
    component.message.set('This message is long enough.');

    await component.submit(submitEvent());

    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe('Please enter your name.');
  });

  it('rejects submission with an invalid email', async () => {
    component.name.set('Visitor');
    component.emailField.set('not-an-email');
    component.message.set('This message is long enough.');

    await component.submit(submitEvent());

    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe('Please enter a valid email address.');
  });

  it('rejects a message shorter than 10 characters', async () => {
    component.name.set('Visitor');
    component.emailField.set('visitor@example.com');
    component.message.set('too short');

    await component.submit(submitEvent());

    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe('Message must be at least 10 characters.');
  });

  it('on success, posts to /api/contact and resets the form', async () => {
    component.name.set('Visitor');
    component.emailField.set('visitor@example.com');
    component.subject.set('Hello');
    component.message.set('This message is long enough.');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await component.submit(submitEvent());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(component.status()).toBe('success');
    expect(component.name()).toBe('');
    expect(component.emailField()).toBe('');
    expect(component.message()).toBe('');
  });

  it('on a server-reported failure, shows the returned error and keeps the form filled in', async () => {
    component.name.set('Visitor');
    component.emailField.set('visitor@example.com');
    component.message.set('This message is long enough.');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ ok: false, error: 'Email service is not configured yet.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await component.submit(submitEvent());

    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe('Email service is not configured yet.');
    // Failed submissions must not clear what the visitor typed.
    expect(component.name()).toBe('Visitor');
  });

  it('on a network failure, shows a generic network error', async () => {
    component.name.set('Visitor');
    component.emailField.set('visitor@example.com');
    component.message.set('This message is long enough.');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await component.submit(submitEvent());

    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe(
      'Network error — please check your connection and try again.',
    );
  });
});
