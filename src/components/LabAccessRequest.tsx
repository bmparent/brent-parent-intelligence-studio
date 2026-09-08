import { type FormEvent, useState } from 'react';
import { projectMailto } from '../config/site';
import { labUrl } from '../data/showcase';
import { track } from '../lib/analytics';

type AccessForm = {
  name: string;
  email: string;
  company: string;
  track: string;
  useCase: string;
  safeData: boolean;
  website: string;
};

const initialForm: AccessForm = {
  name: '',
  email: '',
  company: '',
  track: 'Guided full-engine trial',
  useCase: '',
  safeData: false,
  website: '',
};

type SubmitState =
  | { status: 'idle'; message: '' }
  | { status: 'sending'; message: string }
  | {
      status: 'success' | 'fallback' | 'error';
      message: string;
      mailto?: string;
    };

export function LabAccessRequest() {
  const [form, setForm] = useState(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: '',
  });

  function update<K extends keyof AccessForm>(key: K, value: AccessForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const brief = [
    'Eidos Brain / Sentinel test-access request',
    '',
    `Access path: ${form.track}`,
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Organization: ${form.company || 'Not provided'}`,
    '',
    'Proposed experiment:',
    form.useCase,
    '',
    'Data acknowledgement: public, synthetic, or authorized data only.',
  ].join('\n');
  const fallbackMailto = `${projectMailto(
    'Eidos Brain / Sentinel Test Access',
  )}&body=${encodeURIComponent(brief)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({
      status: 'sending',
      message: 'Sending your access request…',
    });

    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectType: `Eidos / Sentinel access — ${form.track}`,
          problem: `${form.useCase}\n\nData acknowledgement confirmed.`,
          currentUrl: '',
          name: form.name,
          email: form.email,
          company: form.company,
          website: form.website,
          brief,
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
            'Request received. Test access is reviewed individually; you’ll hear back with the next step.',
        });
        track('generate_lead', { item_id: 'sentinel-test-access' });
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
            'Your request is ready. Use the email button to send it directly.',
          mailto: data.mailto || fallbackMailto,
        });
        return;
      }

      setSubmitState({
        status: 'error',
        message: data.message || 'Check the required fields and try again.',
        mailto: fallbackMailto,
      });
    } catch {
      setSubmitState({
        status: 'fallback',
        message:
          'The form could not connect, but your request is ready to email.',
        mailto: fallbackMailto,
      });
    }
  }

  return (
    <section
      className="ew-lab-access ew-shell"
      id="request-access"
      aria-labelledby="lab-access-title"
    >
      <div className="ew-lab-access__intro">
        <p className="ew-eyebrow">Limited full-engine access</p>
        <h2 id="lab-access-title">Request a Sentinel test key.</h2>
        <p>
          The quick demo is open to everyone. Full-engine experiments use
          isolated compute, so launch keys are reviewed, scoped to an agreed
          test window, and revocable.
        </p>
        <ol>
          <li>
            <span>01</span>
            Tell us what you want to test.
          </li>
          <li>
            <span>02</span>
            We review fit, data boundaries, and available compute.
          </li>
          <li>
            <span>03</span>
            Approved testers receive a key to enter in the live Lab.
          </li>
        </ol>
        <p className="ew-form-note">
          A request does not guarantee access. Never submit private,
          confidential, regulated, or otherwise restricted data.
        </p>
      </div>

      <form className="ew-contact-form ew-lab-access__form" onSubmit={submit}>
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
            <span>Preferred test path</span>
            <select
              value={form.track}
              onChange={(event) => update('track', event.target.value)}
            >
              <option>Guided full-engine trial</option>
              <option>Technical evaluation</option>
              <option>Independent reproduction</option>
            </select>
          </label>
          <label className="ew-form-grid__wide">
            <span>What do you want to test, and what would you inspect?</span>
            <textarea
              required
              minLength={20}
              maxLength={1600}
              rows={6}
              placeholder="Describe the stream or dataset, the question, and the evidence you would want to review."
              value={form.useCase}
              onChange={(event) => update('useCase', event.target.value)}
            />
          </label>
          <label className="ew-consent ew-form-grid__wide">
            <input
              required
              type="checkbox"
              checked={form.safeData}
              onChange={(event) => update('safeData', event.target.checked)}
            />
            <span>
              I will use only public, synthetic, or properly authorized data and
              understand that a test run is engineering evidence, not proof of
              production readiness.
            </span>
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
            {submitState.status === 'sending'
              ? 'Sending…'
              : 'Request test access'}
          </button>
          <a
            className="ew-text-link"
            href={labUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the quick demo ↗
          </a>
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
                Email this request
              </a>
            ) : null}
          </div>
        ) : (
          <p className="ew-form-note">
            Requests go to Eidos Works for personal review. Keys are never sent
            from the browser or stored on this page.
          </p>
        )}
      </form>
    </section>
  );
}
