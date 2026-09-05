/** The contact form's model — also the exact JSON body POSTed to `/api/contact`. */
export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot. Real visitors never see this field, so anything here is a bot. */
  company: string;
}
