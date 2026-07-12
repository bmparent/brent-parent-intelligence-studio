import { FormEvent, useState } from 'react';
import { emailMailto, projectMailto, siteConfig } from '../config/site';
import { EmailAddress } from './EmailAddress';

type FormState = {
  name: string;
  email: string;
  company: string;
  service: string;
  currentUrl: string;
  problem: string;
  website: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  company: '',
  service: 'Website & UX Redesign',
  currentUrl: '',
  problem: '',
  website: ''
};

type SubmitState =
  | { status: 'idle'; message: '' }
  | { status: 'sending'; message: string }
  | { status: 'success' | 'fallback' | 'error'; message: string; mailto?: string };

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle', message: '' });

  const brief = [
    'Eidos Works project inquiry',
    '',
    `Service: ${form.service}`,
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company || 'Not provided'}`,
    `Current website: ${form.currentUrl || 'Not provided'}`,
    '',
    form.problem
  ].join('\n');

  const fallbackMailto = `${projectMailto()}&body=${encodeURIComponent(brief)}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: 'sending', message: 'Sending your project note…' });

    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectType: form.service,
          problem: form.problem,
          currentUrl: form.currentUrl,
          name: form.name,
          email: form.email,
          company: form.company,
          website: form.website,
          brief
        })
      });
      const data = (await response.json()) as {
        state?: string;
        submitted?: boolean;
        message?: string;
        mailto?: string;
      };

      if (response.ok && (data.submitted || data.state === 'sent')) {
        setSubmitState({
          status: 'success',
          message: data.message || 'Your project note reached Eidos Works. Expect a personal reply.'
        });
        setForm(initialForm);
        return;
      }

      if (data.mailto || data.state === 'fallback' || data.state === 'provider_error') {
        setSubmitState({
          status: 'fallback',
          message: data.message || 'Your note is ready. Use the email button to send it directly.',
          mailto: data.mailto || fallbackMailto
        });
        return;
      }

      setSubmitState({
        status: 'error',
        message: data.message || 'Please check the required fields and try again.',
        mailto: fallbackMailto
      });
    } catch {
      setSubmitState({
        status: 'fallback',
        message: 'The form could not connect, but your project note is ready to email.',
        mailto: fallbackMailto
      });
    }
  }

  return (
    <form className="ew-contact-form" onSubmit={submit}>
      <div className="ew-form-grid">
        <label>
          <span>Name</span>
          <input
            required
            type="text"
            maxLength={160}
            autoComplete="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            required
            type="email"
            maxLength={260}
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>
        <label>
          <span>Company or organization</span>
          <input type="text" maxLength={180} autoComplete="organization" value={form.company} onChange={(event) => update('company', event.target.value)} />
        </label>
        <label>
          <span>What can we help with?</span>
          <select value={form.service} onChange={(event) => update('service', event.target.value)}>
            <option>Website &amp; UX Redesign</option>
            <option>Storefront Platform Experiences</option>
            <option>Dashboards &amp; Automation</option>
            <option>Agentic SEO</option>
            <option>Eidos Snapshot</option>
            <option>Something else</option>
          </select>
        </label>
        <label className="ew-form-grid__wide">
          <span>Current website, if there is one</span>
          <input
            type="url"
            inputMode="url"
            maxLength={260}
            placeholder="https://"
            value={form.currentUrl}
            onChange={(event) => update('currentUrl', event.target.value)}
          />
        </label>
        <label className="ew-form-grid__wide">
          <span>What needs to become clearer, easier, or more useful?</span>
          <textarea
            required
            minLength={20}
            maxLength={1600}
            rows={6}
            value={form.problem}
            onChange={(event) => update('problem', event.target.value)}
          />
        </label>
        <label className="ew-honeypot" aria-hidden="true">
          <span>Website</span>
          <input type="text" maxLength={120} tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} />
        </label>
      </div>

      <div className="ew-form-actions">
        <button className="ew-button ew-button--primary" type="submit" disabled={submitState.status === 'sending'}>
          {submitState.status === 'sending' ? 'Sending…' : 'Send project note'}
        </button>
        <a className="ew-text-link" href={emailMailto(siteConfig.projectsEmail)}>
          Or email <EmailAddress address={siteConfig.projectsEmail} />
        </a>
      </div>

      {submitState.status !== 'idle' && submitState.status !== 'sending' ? (
        <div className={`ew-form-result ew-form-result--${submitState.status}`} role="status">
          <p>{submitState.message}</p>
          {submitState.mailto ? (
            <a className="ew-button ew-button--secondary" href={submitState.mailto}>
              Email this note
            </a>
          ) : null}
        </div>
      ) : (
        <p className="ew-form-note">Your note is used only to respond to this inquiry. If delivery is unavailable, we give you a direct email fallback.</p>
      )}
    </form>
  );
}
