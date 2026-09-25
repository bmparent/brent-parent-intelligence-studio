import { growthContext, inquiryAttribution } from '../lib/growth';
import { FormEvent, useRef, useState } from 'react';
import { projectMailto, siteConfig } from '../config/site';
import { track } from '../lib/analytics';
import { EmailAddress, SafeEmailLink } from './EmailAddress';
import { Turnstile } from './Turnstile';

type FormState = {
  name: string;
  email: string;
  company: string;
  currentUrl: string;
  friction: string;
  desiredOutcome: string;
  supportingUrl: string;
  foundVia: string;
  website: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  company: '',
  currentUrl: '',
  friction: '',
  desiredOutcome: '',
  supportingUrl: '',
  foundVia: '',
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

export function FrictionReviewPage() {
  const [form, setForm] = useState(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: '',
  });
  const started = useRef(false);
  const [challenge, setChallenge] = useState('');
  const [challengeReset, setChallengeReset] = useState(0);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function noteStart() {
    if (started.current) return;
    started.current = true;
    track('friction_form_start');
  }

  const brief = [
    'Eidos Works Friction Review request',
    '',
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company || 'Not provided'}`,
    `Relevant URL: ${form.currentUrl || 'Not provided'}`,
    `Supporting link: ${form.supportingUrl || 'Not provided'}`,
    `Found Eidos Works via: ${form.foundVia || 'Not provided'}`,
    '',
    'Where is the friction?',
    form.friction,
    '',
    'What would you rather happen?',
    form.desiredOutcome || 'Not provided',
  ].join('\n');

  const fallbackMailto = `${projectMailto('Eidos Works Friction Review')}&body=${encodeURIComponent(brief)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({
      status: 'sending',
      message: 'Sending your friction review request…',
    });

    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          inquiryKind: 'friction-review',
          projectType: 'Friction Review',
          problem: form.friction,
          desiredOutcome: form.desiredOutcome,
          currentUrl: form.currentUrl,
          supportingUrl: form.supportingUrl,
          foundVia: form.foundVia,
          name: form.name,
          email: form.email,
          company: form.company,
          website: form.website,
          brief,
          ...inquiryAttribution(),
          growth: growthContext(),
          challenge,
        }),
      });
      setChallenge('');
      setChallengeReset(value => value + 1);
      const data = (await response.json()) as {
        state?: string;
        submitted?: boolean;
        message?: string;
        mailto?: string;
      };

      if (response.ok && (data.submitted || data.state === 'sent')) {
        setSubmitState({
          status: 'success',
          message: 'Got it. We’ll take a look.',
        });
        track('friction_submit');
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
            'Delivery is unavailable right now, but your review request is ready to email directly.',
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
      setChallenge('');
      setChallengeReset(value => value + 1);
      setSubmitState({
        status: 'fallback',
        message:
          'The form could not connect, but your review request is ready to email directly.',
        mailto: fallbackMailto,
      });
    }
  }

  return (
    <>
      <section className="ew-friction-hero ew-shell" aria-labelledby="friction-title">
        <div className="ew-friction-hero__intro">
          <p className="ew-eyebrow">Show Me the Friction</p>
          <h1 id="friction-title">What almost works?</h1>
          <p className="ew-friction-hero__lede">
            Send us one website, workflow, storefront, application, repeated task,
            or digital process that is not working the way you want. We’ll review
            it and tell you what we would change first.
          </p>
          <p className="ew-friction-support">
            You do not need a finished brief. Show us where people get stuck, what
            your team keeps doing by hand, or the part of your current tools that
            no longer fits.
          </p>
          <div className="ew-friction-promise" aria-label="What the review includes">
            <p className="ew-eyebrow">What you’ll get</p>
            <h2>A focused second set of eyes.</h2>
            <p className="ew-friction-promise__intro">
              We’ll return a concise friction readout with up to three specific
              observations, why they matter, and the most useful next step we
              would take first. When a visual example would materially clarify
              the answer, we may include a lightweight annotated concept or
              prototype direction.
            </p>
            <div>
              <span>01</span>
              <p><strong>Up to three friction points</strong><br />Specific observations, not generic advice.</p>
            </div>
            <div>
              <span>02</span>
              <p><strong>Why they matter</strong><br />A short explanation tied to the actual path or workflow.</p>
            </div>
            <div>
              <span>03</span>
              <p><strong>The first move we would make</strong><br />A practical next step, whether or not you hire us.</p>
            </div>
          </div>
          <p className="ew-friction-note">
            No obligation to hire Eidos Works. No sales call required before the
            review. This is a focused friction readout, not a security, legal,
            accessibility, or full technical audit.
          </p>
        </div>

        <form className="ew-contact-form ew-friction-form" onSubmit={submit} onFocusCapture={noteStart}>
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
              <span>Company or organization <em>optional</em></span>
              <input
                type="text"
                maxLength={180}
                autoComplete="organization"
                value={form.company}
                onChange={(event) => update('company', event.target.value)}
              />
            </label>
            <label>
              <span>Website or relevant URL <em>optional</em></span>
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
              <span>Where is the friction?</span>
              <textarea
                required
                minLength={20}
                maxLength={1600}
                rows={6}
                placeholder="Tell us what almost works, where people get stuck, or what your team keeps doing by hand."
                value={form.friction}
                onChange={(event) => update('friction', event.target.value)}
              />
            </label>
            <label className="ew-form-grid__wide">
              <span>What would you rather happen? <em>optional</em></span>
              <textarea
                maxLength={1200}
                rows={4}
                placeholder="If this worked exactly the way you wanted, what would be different?"
                value={form.desiredOutcome}
                onChange={(event) => update('desiredOutcome', event.target.value)}
              />
            </label>
            <label>
              <span>Screenshot or supporting file/link <em>optional</em></span>
              <input
                type="url"
                inputMode="url"
                maxLength={500}
                placeholder="Share link from Drive, Loom, Dropbox, or similar"
                value={form.supportingUrl}
                onChange={(event) => update('supportingUrl', event.target.value)}
              />
              <small>Paste a link to a screenshot or document that you are comfortable sharing. This form does not upload files. You can send an attachment by email after we reply.</small>
            </label>
            <label>
              <span>How did you find Eidos Works? <em>optional</em></span>
              <select value={form.foundVia} onChange={(event) => update('foundVia', event.target.value)}>
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

          <Turnstile onToken={setChallenge} action="inquiry" resetKey={challengeReset} />
          <div className="ew-form-actions ew-friction-form__actions">
            <button
              className="ew-button ew-button--primary"
              type="submit"
              disabled={submitState.status === 'sending'}
            >
              {submitState.status === 'sending' ? 'Sending…' : 'Send the Friction →'}
            </button>
            <SafeEmailLink className="ew-text-link" address={siteConfig.projectsEmail}>
              Prefer email? <EmailAddress address={siteConfig.projectsEmail} />
            </SafeEmailLink>
          </div>

          {submitState.status !== 'idle' && submitState.status !== 'sending' ? (
            <div
              className={`ew-form-result ew-form-result--${submitState.status}`}
              role="status"
            >
              <p>{submitState.message}</p>
              {submitState.status === 'success' ? (
                <>
                  <p>
                    If there is something useful to identify, we’ll show you
                    where the friction is and what we would change first — not
                    just send a sales pitch.
                  </p>
                  <a className="ew-button ew-button--secondary" href="/work">
                    Explore What We’ve Built →
                  </a>
                </>
              ) : submitState.mailto ? (
                <a className="ew-button ew-button--secondary" href={submitState.mailto}>
                  Email this request
                </a>
              ) : null}
            </div>
          ) : (
            <p className="ew-form-note">
              Your submission is used to review and respond to this request. Do
              not include passwords, regulated data, private customer records,
              or other sensitive information.
            </p>
          )}
        </form>
      </section>

      <section className="ew-friction-examples">
        <div className="ew-shell">
          <p className="ew-eyebrow">Examples of friction you could submit</p>
          <div className="ew-friction-examples__grid">
            <p>“Customers keep getting lost between these two pages.”</p>
            <p>“We manually copy this information every day.”</p>
            <p>“Our hosted store works, but it feels disconnected from the brand.”</p>
            <p>“We need managers to see what requires attention without exporting five reports.”</p>
          </div>
        </div>
      </section>
    </>
  );
}
