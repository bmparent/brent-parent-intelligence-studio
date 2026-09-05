import { useEffect, useState, type CSSProperties } from 'react';
import { post, usePublicConfig } from '../lib/platform';
import { track } from '../lib/analytics';
import { Turnstile } from './Turnstile';
import { SafeEmailLink } from './EmailAddress';
export function StarterPage() {
  const config = usePublicConfig();
  const [accent, setAccent] = useState('#a5e4d6'),
    [headline, setHeadline] = useState('Make something worth feeling.'),
    [useCase, setUseCase] = useState('unspecified'),
    [accepted, setAccepted] = useState(false),
    [verification, setVerification] = useState(''),
    [reset, setReset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const result = await post<{ url: string }>('/api/shop/checkout', {
        acceptTerms: accepted,
        challenge: verification,
        useCase,
      });
      const url = new URL(result.url);
      if (url.hostname !== 'checkout.stripe.com' || url.protocol !== 'https:')
        throw Error('The payment link could not be verified.');
      track('begin_checkout', {
        item_id: 'cinematic-starter',
        value: 29,
        currency: 'USD',
      });
      window.location.assign(url.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
      setBusy(false);
      setVerification('');
      setReset((n) => n + 1);
    }
  }
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <p className="ew-eyebrow">The studio shop / First edition</p>
        <h1>
          Your idea.
          <br />
          <em>A cinematic beginning.</em>
        </h1>
        <p>
          A glass header and cinematic hero, ready to make your own. A small,
          useful piece of the Eidos approach in plain HTML, CSS, and JavaScript.
        </p>
      </section>
      <section className="ew-product-layout ew-shell">
        <div>
          <div
            className="ew-kit-demo"
            style={{ '--kit-accent': accent } as CSSProperties}
          >
            <div className="ew-kit-demo-header">
              <span>afterlight</span>
              <span>Work &nbsp; Studio &nbsp; ↗</span>
            </div>
            <div className="ew-kit-demo-orbit" />
            <p className="ew-eyebrow">A considered point of view</p>
            <h2>{headline || 'Make something worth feeling.'}</h2>
            <p>Thoughtful design. A remarkable first impression.</p>
            <span className="ew-kit-demo-button">Explore the work ↗</span>
          </div>
          <div className="ew-kit-controls">
            <label className="ew-field">
              Try your headline
              <input
                maxLength={65}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </label>
            <label className="ew-field">
              Accent color
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              />
            </label>
          </div>
          <p className="ew-form-note">
            The controls above explore the visual direction. Edit the variables
            and copy in the downloaded files to apply your choices.
          </p>
          <a
            className="ew-text-link"
            href="/kit-preview/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track('product_preview', { item_id: 'cinematic-starter' })
            }
          >
            Open the working template ↗
          </a>
        </div>
        <aside className="ew-product-purchase">
          <p className="ew-eyebrow">Cinematic Starter · v1.0</p>
          <h2>
            A strong first impression.
            <br />A simple starting point.
          </h2>
          <p className="ew-product-price">
            $29 <span>USD · one-time purchase</span>
          </p>
          <ul>
            <li>Responsive glass navigation and cinematic hero</li>
            <li>Original CSS artwork with editable colors</li>
            <li>HTML, CSS, and JavaScript source files</li>
            <li>Setup notes and one website commercial license</li>
            <li>No dependencies, paid fonts, or AI usage fees</li>
          </ul>
          <p className="ew-form-note">
            For developers and people comfortable editing HTML/CSS. Hosting,
            platform integration, and custom design are separate. Client artwork
            and the Eidos homepage image are not included.
          </p>
          <label className="ew-field">
            What will you use it for?{' '}
            <small>Optional — helps us decide what to build next.</small>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
            >
              <option value="unspecified">Choose if you’d like</option>
              <option value="own-website">My own website</option>
              <option value="client-project">A client project</option>
              <option value="learning">Learning from the source</option>
            </select>
          </label>
          <label className="ew-check-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I understand the <a href="/terms">license and product terms</a>.
            </span>
          </label>
          <Turnstile
            action="checkout"
            onToken={setVerification}
            resetKey={reset}
          />
          <button
            className="ew-button ew-button--primary"
            type="button"
            disabled={
              !config?.shopReady ||
              !accepted ||
              busy ||
              (!config.localTest && !verification)
            }
            onClick={() => void checkout()}
          >
            {busy ? 'Opening secure checkout…' : 'Get the starter — $29 ↗'}
          </button>
          {config && !config.shopReady && (
            <p className="ew-notice">
              The preview is ready. Purchasing will open once payment setup is
              complete. <a href="/contact">Tell us you’re interested →</a>
            </p>
          )}
          {error && (
            <p className="ew-notice ew-error" role="alert">
              {error}
            </p>
          )}
          <p className="ew-form-note">
            Payment is handled by Stripe. Your download becomes available after
            payment is verified. No subscription.
          </p>
        </aside>
      </section>
      <section className="ew-reading ew-shell">
        <h2>Less setup. More making.</h2>
        <p>
          Unzip the package, open the HTML file, and start changing the text and
          color variables. There is no build command or framework to learn. The
          working preview uses the same files included in the package.
        </p>
        <h3>Can I use it inside my existing platform?</h3>
        <p>
          The package is a standalone web template. A developer can adapt it for
          a hosted storefront, React app, or CMS. It is not a platform plugin,
          and custom integration is not included.
        </p>
        <h3>What if I need more?</h3>
        <p>
          <a href="/contact">Tell us about your project.</a> We can scope a full
          site, a branded campaign, or an implementation around your existing
          platform.
        </p>
        <h3>Download or payment trouble?</h3>
        <p>
          Keep your payment reference and{' '}
          <SafeEmailLink address="billing@eidos-works.com">
            contact billing
          </SafeEmailLink>
          . Never send card details or passwords.
        </p>
      </section>
    </>
  );
}
export function PurchaseSuccess() {
  const [receipt, setReceipt] = useState(''),
    [status, setStatus] = useState('loading'),
    [orderId, setOrderId] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const fromUrl =
      new URLSearchParams(window.location.hash.slice(1)).get('receipt') || '';
    let saved = '';
    try {
      saved = sessionStorage.getItem('eidos.purchase.receipt') || '';
    } catch {
      /* optional */
    }
    const value = /^[a-f0-9]{64}$/.test(fromUrl) ? fromUrl : saved;
    if (fromUrl) window.history.replaceState(null, '', '/shop/success');
    if (value) {
      try {
        sessionStorage.setItem('eidos.purchase.receipt', value);
      } catch {
        /* optional */
      }
      queueMicrotask(() => setReceipt(value));
    } else queueMicrotask(() => setStatus('missing'));
  }, []);
  useEffect(() => {
    if (!receipt) return;
    let active = true,
      timer: ReturnType<typeof setTimeout> | undefined,
      count = 0;
    async function check() {
      try {
        const data = await post<{ status: string; orderId: string }>(
          '/api/shop/status',
          { receipt },
        );
        if (!active) return;
        setStatus(data.status);
        setOrderId(data.orderId);
        if (data.status === 'paid') {
          let seen = false;
          try {
            seen =
              sessionStorage.getItem(
                'eidos.purchase.tracked.' + data.orderId,
              ) === 'yes';
          } catch {
            /* optional */
          }
          if (!seen) {
            track('purchase', {
              transaction_id: data.orderId,
              item_id: 'cinematic-starter',
              value: 29,
              currency: 'USD',
            });
            try {
              sessionStorage.setItem(
                'eidos.purchase.tracked.' + data.orderId,
                'yes',
              );
            } catch {
              /* optional */
            }
          }
        } else if (data.status === 'pending' && count++ < 10)
          timer = setTimeout(check, 3000);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : 'Payment status could not be checked.',
          );
          setStatus('error');
        }
      }
    }
    void check();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [receipt, attempt]);
  async function download() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/shop/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipt }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw Error(
          (await response.json()).error ||
            'The download could not be prepared.',
        );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eidos-cinematic-starter-v1.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <p className="ew-eyebrow">Your Cinematic Starter</p>
        <h1>
          {status === 'paid' ? (
            <>
              It’s yours.
              <br />
              <em>Make it something.</em>
            </>
          ) : (
            <>
              Let’s check
              <br />
              <em>your purchase.</em>
            </>
          )}
        </h1>
        <p>
          {status === 'paid'
            ? 'Payment verified. Download your package and keep a copy with your payment receipt.'
            : status === 'missing'
              ? 'Open the confirmation link from your completed checkout, or contact billing with your payment reference.'
              : status === 'refunded'
                ? 'This purchase is no longer eligible for download. Contact billing if you need help.'
                : 'We are waiting for payment verification. This page will check automatically for a short time.'}
        </p>
      </section>
      <section className="ew-reading ew-shell">
        {status === 'paid' && (
          <button
            className="ew-button ew-button--primary"
            type="button"
            disabled={busy}
            onClick={() => void download()}
          >
            {busy ? 'Preparing download…' : 'Download Cinematic Starter ↓'}
          </button>
        )}
        {['pending', 'error'].includes(status) && (
          <button
            className="ew-button ew-button--secondary"
            type="button"
            onClick={() => {
              setError('');
              setAttempt((n) => n + 1);
            }}
          >
            Check payment again
          </button>
        )}
        {error && (
          <p className="ew-notice ew-error" role="alert">
            {error}
          </p>
        )}
        {orderId && <p className="ew-form-note">Order reference: {orderId}</p>}
        <p>
          Need help?{' '}
          <SafeEmailLink address="billing@eidos-works.com">
            Contact billing
          </SafeEmailLink>{' '}
          with your payment reference.
        </p>
        <a href="/shop/cinematic-starter">Return to the product →</a>
      </section>
    </>
  );
}
