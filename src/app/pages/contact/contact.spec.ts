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

  /** Fill the form through its fields, the way the bound controls do. */
  function fill(values: { name?: string; email?: string; subject?: string; message?: string }) {
    const form = component.contactForm;
    if (values.name !== undefined) form.name().value.set(values.name);
    if (values.email !== undefined) form.email().value.set(values.email);
    if (values.subject !== undefined) form.subject().value.set(values.subject);
    if (values.message !== undefined) form.message().value.set(values.message);
    fixture.detectChanges();
  }

  const messages = (field: 'name' | 'email' | 'message') =>
    component.contactForm[field]()
      .errors()
      .map((e) => e.message);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects submission with an empty name, without calling the Worker', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    fill({ email: 'visitor@example.com', message: 'This message is long enough.' });

    await component.send(submitEvent());

    expect(messages('name')).toContain('Please enter your name.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email address', async () => {
    fill({ name: 'Visitor', email: 'not-an-email', message: 'This message is long enough.' });

    await component.send(submitEvent());

    expect(messages('email')).toContain('Please enter a valid email address.');
  });

  it('rejects a message shorter than the minimum', async () => {
    fill({ name: 'Visitor', email: 'visitor@example.com', message: 'too short' });

    await component.send(submitEvent());

    expect(messages('message')).toContain('Message must be at least 10 characters.');
  });

  it('reports every invalid field at once, not just the first', async () => {
    fill({ name: '', email: 'not-an-email', message: 'short' });

    await component.send(submitEvent());

    expect(messages('name').length).toBeGreaterThan(0);
    expect(messages('email').length).toBeGreaterThan(0);
    expect(messages('message').length).toBeGreaterThan(0);
  });

  it('on success, posts to /api/contact and resets the form', async () => {
    fill({
      name: 'Visitor',
      email: 'visitor@example.com',
      subject: 'Hello',
      message: 'This message is long enough.',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await component.send(submitEvent());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ name: 'Visitor', email: 'visitor@example.com' });

    expect(component.sent()).toBe(true);
    expect(component.contactForm.name().value()).toBe('');
    expect(component.contactForm.email().value()).toBe('');
    expect(component.contactForm.message().value()).toBe('');
  });

  it('on a server-reported failure, shows the returned error and keeps the form filled in', async () => {
    fill({ name: 'Visitor', email: 'visitor@example.com', message: 'This message is long enough.' });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ ok: false, error: 'Email service is not configured yet.' }),
      }),
    );

    await component.send(submitEvent());

    expect(component.errorMessage()).toBe('Email service is not configured yet.');
    expect(component.sent()).toBe(false);
    // Failed submissions must not clear what the visitor typed.
    expect(component.contactForm.name().value()).toBe('Visitor');
  });

  it('on a network failure, shows a generic network error', async () => {
    fill({ name: 'Visitor', email: 'visitor@example.com', message: 'This message is long enough.' });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await component.send(submitEvent());

    expect(component.errorMessage()).toBe(
      'Network error — please check your connection and try again.',
    );
  });
});
