import { growthContext, inquiryAttribution } from '../lib/growth';
import { track } from '../lib/analytics';
import { isQuoteDeskFeedback, quoteDeskFeedbackService } from '../lib/contactIntent';
import { FormEvent, useState, useSyncExternalStore } from 'react';
import { projectMailto, siteConfig } from '../config/site';
import { EmailAddress, SafeEmailLink } from './EmailAddress';

type FormState = {
  name: string;
  email: string;
  company: string;
  service: string;
  currentUrl: string;
  problem: string;
  foundVia: string;
  quoteDeskVolume: string;
  quoteDeskPriceIntent: string;
  website: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  company: '',
  service: 'Digital Experiences',
  currentUrl: '',
  problem: '',
  foundVia: '',
  quoteDeskVolume: '',
  quoteDeskPriceIntent: '',
  website: '',
};

const subscribeToLocation = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};
const quoteDeskFeedbackSnapshot = () => isQuoteDeskFeedback(window.location.search);
const serverQuoteDeskFeedbackSnapshot = () => false;

type SubmitState =
  | { status: 'idle'; message: '' }
  | { status: 'sending'; message: string }
  | {
      status: 'success' | 'fallback' | 'error';
      message: string;
      mailto?: string;
    };

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [serviceTouched, setServiceTouched] = useState(false);
  const [foundViaTouched, setFoundViaTouched] = useState(false);
  const quoteDeskCampaign = useSyncExternalStore(subscribeToLocation, quoteDeskFeedbackSnapshot, serverQuoteDeskFeedbackSnapshot);
  const selectedService = quoteDeskCampaign && !serviceTouched ? quoteDeskFeedbackService : form.service;
  const selectedFoundVia = quoteDeskCampaign && !foundViaTouched ? 'Saw one of our projects' : form.foundVia;
  const quoteDeskFeedback = selectedService === quoteDeskFeedbackService;
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: '',
  });

  const submittedProblem = quoteDeskFeedback
    ? [
        `Typical weekly embroidery quotes: ${form.quoteDeskVolume || 'Not provided'}`,
        `Interest at the proposed $19/month: ${form.quoteDeskPriceIntent || 'Not provided'}`,
        '',
        form.problem,
      ].join('\n').slice(0, 1_600)
    : form.problem;

  const brief = [
    'Eidos Works project inquiry',
    '',
    `Service: ${selectedService}`,
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company || 'Not provided'}`,
    `Current website: ${form.currentUrl || 'Not provided'}`,
    `Found Eidos Works via: ${selectedFoundVia || 'Not provided'}`,
    '',
    submittedProblem,
  ].join('\n');

  const fallbackMailto = `${projectMailto()}&body=${encodeURIComponent(brief)}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({
      status: 'sending',
      message: 'Sending your project note…',
    });

    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectType: selectedService,
          problem: submittedProblem,
          currentUrl: form.currentUrl,
          name: form.name,
          email: form.email,
          company: form.company,
          foundVia: selectedFoundVia,
          website: form.website,
          brief,
          ...inquiryAttribution(),
          growth: growthContext(),
        }),
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
          message:
            data.message ||
            'Your project note reached Eidos Works. Expect a personal reply.',
        });
        track('contact_submit');
        track('generate_lead');
        setForm(initialForm);
        return;
      }

      if (
        data.mailto ||
        data.state === 'fallback' ||
        data.state === 'provider_error'
      ) {
        setSubmitState({
          status: 'fallback',
          message:
            data.message ||
            'Your note is ready. Use the email button to send it directly.',
          mailto: data.mailto || fallbackMailto,
        });
        return;
      }

      setSubmitState({
        status: 'error',
        message:
          data.message || 'Please check the required fields and try again.',
        mailto: fallbackMailto,
      });
    } catch {
      setSubmitState({
        status: 'fallback',
        message:
          'The form could not connect, but your project note is ready to email.',
        mailto: fallbackMailto,
      });
    }
  }

  return (
    <form className="ew-contact-form" onSubmit={submit}>
      {quoteDeskFeedback ? (
        <div className="ew-form-result" role="note">
          <p><strong>Quote Desk feedback</strong></p>
          <p>Tell us which part of repeat quoting should be saved, reused, or planned. Two quick signals help us decide whether the proposed $19/month workspace is worth building. It is useful to say when it is not.</p>
        </div>
      ) : null}
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
          <input
            type="text"
            maxLength={180}
            autoComplete="organization"
            value={form.company}
            onChange={(event) => update('company', event.target.value)}
          />
        </label>
        <label>
          <span>What can we help with?</span>
          <select
            value={selectedService}
            onChange={(event) => { setServiceTouched(true); update('service', event.target.value); }}
          >
            <option>Digital Experiences</option>
            <option>Business Systems</option>
            <option>{quoteDeskFeedbackService}</option>
            <option>Intelligent Systems</option>
            <option>Prototype / Product Exploration</option>
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
        {quoteDeskFeedback ? (
          <>
            <label>
              <span>About how many embroidery quotes do you build in a typical week?</span>
              <select
                required
                value={form.quoteDeskVolume}
                onChange={(event) => update('quoteDeskVolume', event.target.value)}
              >
                <option value="">Choose one</option>
                <option>1–5</option>
                <option>6–15</option>
                <option>16–30</option>
                <option>31+</option>
                <option>I do not quote embroidery work</option>
              </select>
            </label>
            <label>
              <span>If it handled that workflow well, how does $19/month feel?</span>
              <select
                required
                value={form.quoteDeskPriceIntent}
                onChange={(event) => update('quoteDeskPriceIntent', event.target.value)}
              >
                <option value="">Choose one</option>
                <option>I would try it</option>
                <option>I might try it</option>
                <option>Too expensive for me</option>
                <option>I would not use it</option>
              </select>
            </label>
          </>
        ) : null}
        <label className="ew-form-grid__wide">
          <span>{quoteDeskFeedback ? 'What should Quote Desk save, reuse, or plan for you?' : 'What needs to become clearer, easier, or more useful?'}</span>
          <textarea
            required
            minLength={20}
            maxLength={quoteDeskFeedback ? 1_400 : 1_600}
            rows={6}
            value={form.problem}
            onChange={(event) => update('problem', event.target.value)}
          />
        </label>
        <label className="ew-form-grid__wide">
          <span>How did you find Eidos Works?</span>
          <select value={selectedFoundVia} onChange={(event) => { setFoundViaTouched(true); update('foundVia', event.target.value); }}>
            <option value="">Choose one</option>
            <option>LinkedIn</option>
            <option>Google / search</option>
            <option>Reddit / community</option>
            <option>Referral</option>
            <option>Saw one of our projects</option>
            <option>Other</option>
          </select>
        </label>
        <label className="ew-honeypot" aria-hidden="true">
          <span>Website</span>
          <input
            type="text"
            maxLength={120}
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(event) => update('website', event.target.value)}
          />
        </label>
      </div>

      <div className="ew-form-actions">
        <button
          className="ew-button ew-button--primary"
          type="submit"
          disabled={submitState.status === 'sending'}
        >
          {submitState.status === 'sending' ? 'Sending…' : quoteDeskFeedback ? 'Send Quote Desk Feedback' : 'Send Project Note'}
        </button>
        <SafeEmailLink
          className="ew-text-link"
          address={siteConfig.projectsEmail}
        >
          Or email <EmailAddress address={siteConfig.projectsEmail} />
        </SafeEmailLink>
      </div>

      {submitState.status !== 'idle' && submitState.status !== 'sending' ? (
        <div
          className={`ew-form-result ew-form-result--${submitState.status}`}
          role="status"
        >
          <p>{submitState.message}</p>
          {submitState.mailto ? (
            <a
              className="ew-button ew-button--secondary"
              href={submitState.mailto}
            >
              Email this note
            </a>
          ) : null}
        </div>
      ) : (
        <p className="ew-form-note">
          Your note is used only to respond to this inquiry. Do not include
          passwords, regulated data, private customer records, or other sensitive
          information.
        </p>
      )}
    </form>
  );
}
