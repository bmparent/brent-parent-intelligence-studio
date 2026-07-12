import { FormEvent, useEffect, useState } from 'react';
import { siteConfig } from '../config/site';
import { SafeEmailLink } from './EmailAddress';

const deliverables = [
  'A homepage redesign concept image',
  'Top UI/UX opportunities',
  'SEO quick wins',
  'Suggested homepage structure',
  'AI and search-readiness notes',
  'A recommended next step'
];

type SnapshotFormState = {
  websiteUrl: string;
  businessName: string;
  industry: string;
  primaryGoal: string;
  stylePreference: string;
  biggestIssue: string;
  email: string;
  consent: boolean;
};

const initialSnapshotForm: SnapshotFormState = {
  websiteUrl: '',
  businessName: '',
  industry: '',
  primaryGoal: 'modernize design',
  stylePreference: 'clean premium',
  biggestIssue: '',
  email: '',
  consent: false
};

type Opportunity = {
  title: string;
  whyItMatters: string;
  suggestedFix: string;
  priority: 'high' | 'medium' | 'low';
};

type SnapshotReport = {
  overallImpression: string;
  businessTypeGuess: string;
  primaryConversionGoal: string;
  uiUxOpportunities: Opportunity[];
  seoOpportunities: Opportunity[];
  suggestedHomepageStructure: Array<{ section: string; purpose: string; sampleCopy: string }>;
  suggestedTitleTag: string;
  suggestedMetaDescription: string;
  aiSearchReadiness: Array<{ title: string; recommendation: string }>;
  nextStepRecommendation: { label: string; reason: string; cta: string };
  imagePrompt?: string;
};

type SnapshotStatus = {
  state?: string;
  status?: string;
  resultToken?: string;
  resultUrl?: string;
  businessName?: string;
  websiteUrl?: string;
  report?: SnapshotReport;
  conceptImage?: string;
  conceptImageUrl?: string;
  captureNotice?: string;
  message?: string;
};

function statusName(status: SnapshotStatus) {
  return status.status || status.state || 'processing';
}

export function SnapshotLandingPage() {
  return (
    <>
      <section className="ew-page-hero ew-page-hero--snapshot">
        <div className="ew-shell ew-page-hero__inner">
          <div>
            <p className="ew-eyebrow">Eidos Snapshot</p>
            <h1>See what your website could become.</h1>
            <p>
              Paste your current website and get a visual redesign concept plus practical SEO and UX recommendations. Built for business owners who want a clearer direction before committing to a full redesign.
            </p>
            <div className="ew-actions">
              {siteConfig.snapshotCheckoutEnabled ? (
                <a className="ew-button ew-button--primary" href="/snapshot/start">Generate my Snapshot — $5</a>
              ) : (
                <SafeEmailLink className="ew-button ew-button--primary" address={siteConfig.snapshotEmail} subject="Eidos Snapshot launch notice">Get a launch notice</SafeEmailLink>
              )}
              <SafeEmailLink className="ew-button ew-button--secondary" address={siteConfig.projectsEmail} subject="Eidos Works Full Website Build">
                Ask about a full build
              </SafeEmailLink>
            </div>
            {!siteConfig.snapshotCheckoutEnabled ? (
              <p className="ew-availability-note">Secure checkout stays hidden until Stripe and durable report storage are enabled in production.</p>
            ) : null}
          </div>
          <div className="ew-snapshot-sheet" role="group" aria-label="Eidos Snapshot deliverables preview">
            <span className="ew-snapshot-sheet__price">$5 · one time</span>
            <strong>Your website, translated into a practical direction.</strong>
            <ul>
              {deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ew-section ew-shell ew-snapshot-explainer" aria-labelledby="snapshot-contents-title">
        <div>
          <p className="ew-eyebrow">What you receive</p>
          <h2 id="snapshot-contents-title">A useful first pass—not a vague AI score.</h2>
        </div>
        <div className="ew-snapshot-deliverables">
          {deliverables.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="ew-section ew-snapshot-for" aria-labelledby="snapshot-for-title">
        <div className="ew-shell ew-snapshot-for__grid">
          <div>
            <p className="ew-eyebrow">Built for a real decision</p>
            <h2 id="snapshot-for-title">Use Snapshot when you know the site needs work but do not yet know where to begin.</h2>
          </div>
          <div>
            <p>
              Snapshot focuses on first impression, hierarchy, calls to action, trust, mobile structure, metadata, page clarity, and how easily your business can be understood by search and AI-assisted discovery.
            </p>
            <p>
              For storefronts, team shops, company stores, and merchandise portals, it also looks for clearer product paths and cleaner platform-ready content structure.
            </p>
          </div>
        </div>
      </section>

      <section className="ew-section ew-shell ew-expectation" aria-labelledby="expectation-title">
        <div>
          <p className="ew-eyebrow">Clear expectations</p>
          <h2 id="expectation-title">A concept and recommendation report.</h2>
        </div>
        <p>
          Eidos Snapshot is AI-assisted. It is not a finished coded website, a full technical SEO audit, a ranking guarantee, or a replacement for a project discovery call. The concept preview shows one possible direction—not a design already live on your site.
        </p>
      </section>
    </>
  );
}

export function SnapshotStartPage() {
  const [form, setForm] = useState(initialSnapshotForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const canSubmit = Boolean(form.websiteUrl && form.businessName && form.primaryGoal && form.email && form.consent);

  function update<K extends keyof SnapshotFormState>(key: K, value: SnapshotFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !siteConfig.snapshotCheckoutEnabled) return;
    setStatus('submitting');
    setMessage('Preparing secure checkout…');

    try {
      const createResponse = await fetch('/api/snapshot/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form)
      });
      const created = (await createResponse.json()) as {
        requestId?: string;
        resultToken?: string;
        checkoutConfigured?: boolean;
        message?: string;
        checkoutUrl?: string;
        status?: string;
        state?: string;
      };

      if (!createResponse.ok || !created.requestId || !created.resultToken) {
        throw new Error(created.message || 'The Snapshot request could not be created.');
      }

      if (!created.checkoutConfigured) {
        throw new Error('Secure checkout is not configured yet. No payment was taken.');
      }

      if (created.checkoutUrl) {
        window.location.assign(created.checkoutUrl);
        return;
      }

      const checkoutResponse = await fetch('/api/snapshot/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requestId: created.requestId, resultToken: created.resultToken })
      });
      const checkout = (await checkoutResponse.json()) as {
        url?: string;
        checkoutUrl?: string;
        resultUrl?: string;
        status?: string;
        state?: string;
        message?: string;
      };
      const checkoutUrl = checkout.url || checkout.checkoutUrl;
      const checkoutStatus = checkout.status || checkout.state;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      if (checkoutStatus === 'complete' && checkout.resultUrl) {
        window.location.assign(checkout.resultUrl);
        return;
      }

      if (checkoutStatus === 'processing' || checkoutStatus === 'paid') {
        window.location.assign(`/snapshot/success?token=${encodeURIComponent(created.resultToken)}`);
        return;
      }

      throw new Error(checkout.message || 'Secure checkout is not available yet.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Snapshot could not start. Please try again.');
    }
  }

  if (!siteConfig.snapshotCheckoutEnabled) {
    return (
      <section className="ew-page-simple ew-shell" aria-labelledby="snapshot-start-title">
        <p className="ew-eyebrow">Eidos Snapshot</p>
        <h1 id="snapshot-start-title">Checkout is being connected carefully.</h1>
        <p>
          The intake and generation system is ready for configuration, but Eidos Works will not display a payment button until Stripe, webhook verification, and durable report storage are all enabled.
        </p>
        <div className="ew-actions">
          <SafeEmailLink className="ew-button ew-button--primary" address={siteConfig.snapshotEmail} subject="Notify me when Eidos Snapshot opens">
            Notify me when it opens
          </SafeEmailLink>
          <a className="ew-button ew-button--secondary" href="/snapshot">
            Back to Snapshot
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="ew-page-simple ew-shell" aria-labelledby="snapshot-start-title">
      <div className="ew-form-page-heading">
        <div>
          <p className="ew-eyebrow">Eidos Snapshot · secure checkout next</p>
          <h1 id="snapshot-start-title">Tell us what the website needs to do better.</h1>
        </div>
        <p>The form takes a few minutes. Your answers guide the concept and keep the recommendations tied to a real business goal.</p>
      </div>

      <form className="ew-snapshot-form" onSubmit={submit}>
        <div className="ew-form-grid">
          <label className="ew-form-grid__wide">
            <span>Current website URL</span>
            <input
              required
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder="https://yourbusiness.com"
              value={form.websiteUrl}
              onChange={(event) => update('websiteUrl', event.target.value)}
            />
          </label>
          <label>
            <span>Business name</span>
            <input required type="text" minLength={2} maxLength={140} value={form.businessName} onChange={(event) => update('businessName', event.target.value)} />
          </label>
          <label>
            <span>Industry (optional)</span>
            <input type="text" maxLength={120} value={form.industry} onChange={(event) => update('industry', event.target.value)} />
          </label>
          <label>
            <span>Primary goal</span>
            <select required value={form.primaryGoal} onChange={(event) => update('primaryGoal', event.target.value)}>
              <option value="more leads">More leads</option>
              <option value="better trust">Better trust</option>
              <option value="modernize design">Modernize design</option>
              <option value="improve storefront conversions">Improve storefront conversions</option>
              <option value="improve local SEO">Improve local SEO</option>
              <option value="improve AI/search readiness">Improve AI/search readiness</option>
            </select>
          </label>
          <label>
            <span>Style direction</span>
            <select value={form.stylePreference} onChange={(event) => update('stylePreference', event.target.value)}>
              <option value="clean premium">Clean premium</option>
              <option value="bold modern">Bold modern</option>
              <option value="warm local business">Warm local business</option>
              <option value="high-end editorial">High-end editorial</option>
              <option value="tech-forward">Tech-forward</option>
              <option value="playful storefront">Playful storefront</option>
            </select>
          </label>
          <label className="ew-form-grid__wide">
            <span>Biggest issue right now (optional)</span>
            <textarea rows={5} maxLength={700} value={form.biggestIssue} onChange={(event) => update('biggestIssue', event.target.value)} />
          </label>
          <label className="ew-form-grid__wide">
            <span>Email for checkout and Snapshot support</span>
            <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </label>
        </div>

        <label className="ew-consent">
          <input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} />
          <span>I understand this is an AI-assisted concept and recommendation report, not a finished coded website.</span>
        </label>

        <div className="ew-form-actions">
          <button className="ew-button ew-button--primary" type="submit" disabled={!canSubmit || status === 'submitting'}>
            {status === 'submitting' ? 'Preparing checkout…' : 'Continue to secure checkout — $5'}
          </button>
          <span>Payment is confirmed by Stripe before generation begins.</span>
        </div>
        <div className="ew-form-status" aria-live="polite">
          {message}
        </div>
      </form>
    </section>
  );
}

export function SnapshotSuccessPage() {
  const [status, setStatus] = useState<SnapshotStatus>({ status: 'processing' });
  const token = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!token) return;
    let active = true;
    let timer: number | undefined;

    async function poll() {
      try {
        const response = await fetch(`/api/snapshot/status?token=${encodeURIComponent(token)}`, { headers: { accept: 'application/json' } });
        const next = (await response.json()) as SnapshotStatus;
        if (!active) return;
        if (!response.ok) {
          setStatus({ status: 'failed', message: next.message || 'This Snapshot could not be found.' });
          return;
        }
        setStatus(next);
        if (!['ready', 'complete', 'completed', 'failed'].includes(statusName(next))) {
          timer = window.setTimeout(poll, 4000);
        }
      } catch {
        if (active) timer = window.setTimeout(poll, 6000);
      }
    }

    void poll();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [token]);

  const state = statusName(status);
  const ready = ['ready', 'complete', 'completed'].includes(state);
  const failed = state === 'failed';
  const paymentPending = state === 'created' || state === 'checkout_created';
  const eyebrow = !token
    ? 'Snapshot link missing'
    : ready || state === 'paid' || state === 'processing'
      ? 'Secure checkout confirmed'
      : paymentPending
        ? 'Confirming secure checkout'
        : 'Snapshot status';
  const heading = !token
    ? 'This processing link is incomplete.'
    : ready
      ? 'Your Snapshot is ready.'
      : failed
        ? 'Your Snapshot needs attention.'
        : paymentPending
          ? 'We are confirming your checkout.'
          : 'Your Snapshot is being prepared.';
  const description = !token
    ? 'Use the private processing link from checkout, or contact Eidos Works with the email used for the order.'
    : ready
      ? 'Your practical redesign direction and recommendations are available through the private result link below.'
      : failed
        ? status.message || 'The report could not be completed automatically. Contact Eidos Works and include the email used at checkout so the order can be reviewed.'
        : paymentPending
          ? 'Stripe confirmation can take a moment. Generation begins only after the signed payment event is verified.'
          : 'The report reviews the public website content, builds structured recommendations, and prepares one concept direction. This can take a few minutes.';

  return (
    <section className="ew-page-simple ew-shell ew-processing" aria-labelledby="processing-title">
      <div className={`ew-processing__mark${ready ? ' is-ready' : ''}`} aria-hidden="true">
        <span />
        <span />
        <strong>{ready ? '✓' : 'EW'}</strong>
      </div>
      <p className="ew-eyebrow">{eyebrow}</p>
      <h1 id="processing-title">{heading}</h1>
      <p>{description}</p>
      {ready ? (
        <a className="ew-button ew-button--primary" href={status.resultUrl || `/snapshot/result/${token}`}>
          View my Snapshot
        </a>
      ) : null}
      {!token ? <p className="ew-form-result ew-form-result--error">The private result token is missing. Use the Contact page and include your checkout email.</p> : null}
      {failed ? <p className="ew-form-result ew-form-result--error">No private provider details are shown here; use the Contact page for help.</p> : null}
    </section>
  );
}

export function SnapshotResultPage({ token }: { token: string }) {
  const [status, setStatus] = useState<SnapshotStatus>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetch(`/api/snapshot/status?token=${encodeURIComponent(token)}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal
    })
      .then(async (response) => {
        const data = (await response.json()) as SnapshotStatus;
        if (!response.ok) throw new Error(data.message || 'Snapshot could not be loaded.');
        return data;
      })
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (active) setStatus({ status: 'failed', message: error instanceof Error ? error.message : 'Snapshot could not be loaded.' });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [token]);

  const report = status.report;
  const image = status.conceptImageUrl || status.conceptImage;

  if (!report) {
    return (
      <section className="ew-page-simple ew-shell" aria-labelledby="result-loading-title">
        <p className="ew-eyebrow">Eidos Snapshot</p>
        <h1 id="result-loading-title">{statusName(status) === 'failed' ? 'This Snapshot could not be opened.' : 'Your Snapshot is still being prepared.'}</h1>
        <p>{status.message || 'Return to the processing page in a few minutes, or contact Eidos Works if this link continues to wait.'}</p>
        <SafeEmailLink className="ew-button ew-button--secondary" address={siteConfig.snapshotEmail}>
          Contact Snapshot support
        </SafeEmailLink>
      </section>
    );
  }

  return (
    <article className="ew-result ew-shell">
      <header className="ew-result__header">
        <p className="ew-eyebrow">Eidos Snapshot</p>
        <h1>{status.businessName ? `${status.businessName}: a clearer direction` : 'Your website Snapshot'}</h1>
        <p>Your Snapshot gives you a practical direction for improving the first impression, structure, and search-readiness of your site.</p>
        {status.websiteUrl ? <a href={status.websiteUrl}>{status.websiteUrl}</a> : null}
      </header>

      <section className="ew-result__section" aria-labelledby="concept-title">
        <div className="ew-result__section-heading">
          <span>01</span>
          <div>
            <h2 id="concept-title">Homepage concept direction</h2>
            <p>This concept preview shows one possible direction for clearer hierarchy, stronger calls to action, and a more polished customer path.</p>
          </div>
        </div>
        {image ? <img className="ew-result__concept" src={image} alt="AI-assisted homepage redesign concept created for this Eidos Snapshot." /> : <div className="ew-result__placeholder">The written direction is ready. The concept image may still be processing.</div>}
        {status.captureNotice ? <p className="ew-result__notice">{status.captureNotice}</p> : null}
      </section>

      <section className="ew-result__section" aria-labelledby="impression-title">
        <div className="ew-result__section-heading">
          <span>02</span>
          <div>
            <h2 id="impression-title">Overall impression</h2>
            <p>{report.overallImpression}</p>
          </div>
        </div>
        <dl className="ew-result__facts">
          <div>
            <dt>Business type</dt>
            <dd>{report.businessTypeGuess}</dd>
          </div>
          <div>
            <dt>Primary conversion goal</dt>
            <dd>{report.primaryConversionGoal}</dd>
          </div>
        </dl>
      </section>

      <OpportunitySection number="03" title="UI and UX priorities" opportunities={report.uiUxOpportunities} />
      <OpportunitySection number="04" title="SEO priorities" opportunities={report.seoOpportunities} />

      <section className="ew-result__section" aria-labelledby="structure-title">
        <div className="ew-result__section-heading">
          <span>05</span>
          <div>
            <h2 id="structure-title">Suggested homepage structure</h2>
            <p>These notes focus on what to clarify, what to restructure, and what to fix first.</p>
          </div>
        </div>
        <ol className="ew-result__structure">
          {report.suggestedHomepageStructure.map((item) => (
            <li key={`${item.section}-${item.purpose}`}>
              <h3>{item.section}</h3>
              <p>{item.purpose}</p>
              <blockquote>{item.sampleCopy}</blockquote>
            </li>
          ))}
        </ol>
      </section>

      <section className="ew-result__section" aria-labelledby="metadata-title">
        <div className="ew-result__section-heading">
          <span>06</span>
          <div>
            <h2 id="metadata-title">Search preview direction</h2>
          </div>
        </div>
        <div className="ew-search-preview">
          <span>{status.websiteUrl || 'yourwebsite.com'}</span>
          <strong>{report.suggestedTitleTag}</strong>
          <p>{report.suggestedMetaDescription}</p>
        </div>
      </section>

      <section className="ew-result__section" aria-labelledby="ai-ready-title">
        <div className="ew-result__section-heading">
          <span>07</span>
          <div>
            <h2 id="ai-ready-title">AI and search-readiness</h2>
          </div>
        </div>
        <div className="ew-result__recommendations">
          {report.aiSearchReadiness.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.recommendation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ew-result__next" aria-labelledby="next-step-title">
        <p className="ew-eyebrow">Recommended next step</p>
        <h2 id="next-step-title">{report.nextStepRecommendation.label}</h2>
        <p>{report.nextStepRecommendation.reason}</p>
        <SafeEmailLink className="ew-button ew-button--light" address={siteConfig.projectsEmail} subject={`Snapshot follow-up: ${status.businessName || 'website project'}`}>
          {report.nextStepRecommendation.cta || 'Ask Eidos Works about the build'}
        </SafeEmailLink>
      </section>
    </article>
  );
}

function OpportunitySection({ number, title, opportunities }: { number: string; title: string; opportunities: Opportunity[] }) {
  const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`;
  return (
    <section className="ew-result__section" aria-labelledby={id}>
      <div className="ew-result__section-heading">
        <span>{number}</span>
        <div>
          <h2 id={id}>{title}</h2>
          <p>Prioritized around what will make the page clearer and more useful first.</p>
        </div>
      </div>
      <div className="ew-result__opportunities">
        {opportunities.map((item) => (
          <article key={`${item.title}-${item.priority}`}>
            <span className={`ew-priority ew-priority--${item.priority}`}>{item.priority} priority</span>
            <h3>{item.title}</h3>
            <p>{item.whyItMatters}</p>
            <strong>Suggested fix</strong>
            <p>{item.suggestedFix}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
