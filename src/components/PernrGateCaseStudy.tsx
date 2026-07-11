import { FormEvent, useState } from 'react';

const demoRecords = new Set(['EIDOS-1042', 'EIDOS-2187', 'MORGAN REED']);

const applications = [
  {
    title: 'Employee merchandise stores',
    text: 'Limit ordering to a current roster while keeping the shopping experience simple for employees.'
  },
  {
    title: 'Schools, teams, and clubs',
    text: 'Confirm a student, family, athlete, or member against an approved list before revealing a private store.'
  },
  {
    title: 'Events and productions',
    text: 'Give cast, crew, volunteers, or attendees access through an event-specific credential or roster.'
  },
  {
    title: 'Dealer and partner portals',
    text: 'Create a lightweight first gate for approved partners before routing them to restricted resources or pricing.'
  },
  {
    title: 'Benefits and allowance programs',
    text: 'Pair roster verification with role, location, or eligibility data to guide people to the correct program.'
  },
  {
    title: 'Preorder and uniform programs',
    text: 'Keep limited ordering windows available to the intended group without forcing every shopper to create an account.'
  }
];

export function PernrGateCaseStudy() {
  const [entry, setEntry] = useState('');
  const [status, setStatus] = useState<'idle' | 'approved' | 'denied'>('idle');

  function verifyDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = entry.trim().replace(/\s+/g, ' ').toUpperCase();
    setStatus(demoRecords.has(normalized) ? 'approved' : 'denied');
  }

  return (
    <>
      <section className="ew-case-hero ew-shell" aria-labelledby="pernr-title">
        <div>
          <p className="ew-eyebrow">Storefront access system · case study</p>
          <h1 id="pernr-title">A private-store gate that checks eligibility without making shopping feel difficult.</h1>
          <p>
            Built for a Disney employee merchandise experience on InkSoft, the PERNR gate verifies an employee identifier or approved name against a controlled roster before allowing the visitor into the store.
          </p>
          <div className="ew-actions">
            <a className="ew-button ew-button--primary" href="#gate-demo">Try the safe demo</a>
            <a className="ew-button ew-button--secondary" href="#applications">See other applications</a>
          </div>
        </div>
        <div className="ew-gate-map" aria-label="Access gate flow">
          <div><span>01</span><strong>Enter credential</strong><small>PERNR or approved name</small></div>
          <i aria-hidden="true">→</i>
          <div><span>02</span><strong>Check roster</strong><small>Server-side lookup</small></div>
          <i aria-hidden="true">→</i>
          <div><span>03</span><strong>Route visitor</strong><small>Allow or retry</small></div>
        </div>
      </section>

      <section id="gate-demo" className="ew-section ew-gate-demo" aria-labelledby="demo-title">
        <div className="ew-shell ew-gate-demo__grid">
          <div>
            <p className="ew-eyebrow">Interactive demonstration</p>
            <h2 id="demo-title">Try the decision point.</h2>
            <p>This demonstration is isolated from the live store and contains no employee information.</p>
            <div className="ew-demo-credentials" aria-label="Fictional demonstration credentials">
              <span>Try an approved example</span>
              <button type="button" onClick={() => { setEntry('EIDOS-1042'); setStatus('idle'); }}>EIDOS-1042</button>
              <button type="button" onClick={() => { setEntry('Morgan Reed'); setStatus('idle'); }}>Morgan Reed</button>
            </div>
          </div>

          <div className="ew-gate-panel">
            <div className="ew-gate-panel__brand"><span>E</span><div><strong>Private team store</strong><small>Eligibility check</small></div></div>
            <form onSubmit={verifyDemo}>
              <label htmlFor="demo-pernr">Employee ID or approved name</label>
              <input
                id="demo-pernr"
                value={entry}
                onChange={(event) => { setEntry(event.target.value); setStatus('idle'); }}
                placeholder="Enter a fictional demo credential"
                autoComplete="off"
              />
              <button className="ew-button ew-button--primary" type="submit">Verify access</button>
            </form>
            <div className={`ew-gate-result ew-gate-result--${status}`} aria-live="polite">
              {status === 'idle' && <><span>Ready</span><p>The gate is waiting for a credential.</p></>}
              {status === 'approved' && <><span>Access approved</span><p>The visitor would now be routed into the private storefront.</p></>}
              {status === 'denied' && <><span>Not recognized</span><p>The store remains closed and the visitor can correct the entry or request help.</p></>}
            </div>
          </div>
        </div>
      </section>

      <section className="ew-section ew-shell" aria-labelledby="how-title">
        <header className="ew-section-heading">
          <div><p className="ew-eyebrow">How it works</p><h2 id="how-title">A small interface connected to a controlled source of truth.</h2></div>
          <p>The visitor sees a simple prompt. The operational logic stays outside the storefront presentation layer.</p>
        </header>
        <ol className="ew-gate-steps">
          <li><span>01</span><h3>Collect</h3><p>The gate accepts a PERNR or approved name and normalizes spacing and capitalization to reduce avoidable entry errors.</p></li>
          <li><span>02</span><h3>Verify</h3><p>A Google Apps Script endpoint compares the submitted value with an authorized Google Sheet roster. The roster is not shipped to the browser.</p></li>
          <li><span>03</span><h3>Decide</h3><p>The endpoint returns only the decision needed by the interface. It does not expose the full list or reveal which other records exist.</p></li>
          <li><span>04</span><h3>Continue</h3><p>An approved visitor enters the InkSoft store. An unrecognized visitor receives a clear retry path without seeing private merchandise first.</p></li>
        </ol>
      </section>

      <section className="ew-section ew-gate-reason" aria-labelledby="why-title">
        <div className="ew-shell ew-gate-reason__grid">
          <div><p className="ew-eyebrow">Why it works</p><h2 id="why-title">The control matches the actual risk and the shopper’s context.</h2></div>
          <div className="ew-gate-reason__cards">
            <article><h3>Low friction</h3><p>Employees can use a credential they already know instead of creating and remembering another storefront account.</p></article>
            <article><h3>Maintainable roster</h3><p>Authorized staff can update one Sheet without rebuilding the store or editing the embed whenever eligibility changes.</p></article>
            <article><h3>Minimal disclosure</h3><p>The browser receives an approval decision rather than a downloadable employee roster.</p></article>
            <article><h3>Platform compatible</h3><p>The gate adds a tailored access experience around a hosted commerce platform without replacing its ordering and fulfillment tools.</p></article>
          </div>
          <aside>
            <strong>Important boundary</strong>
            <p>This is a practical eligibility gate for a private merchandise experience—not a substitute for enterprise SSO, regulated-data authorization, payment security, or high-assurance identity verification. Higher-risk systems should use authenticated accounts, signed sessions, rate limiting, logging, and role-based access controls.</p>
          </aside>
        </div>
      </section>

      <section id="applications" className="ew-section ew-shell" aria-labelledby="applications-title">
        <header className="ew-section-heading">
          <div><p className="ew-eyebrow">Reusable pattern</p><h2 id="applications-title">The same logic can open the right experience for many kinds of groups.</h2></div>
          <p>The interface, source roster, decision rules, and destination can all be adapted to the organization.</p>
        </header>
        <div className="ew-application-grid">
          {applications.map((application) => <article key={application.title}><h3>{application.title}</h3><p>{application.text}</p></article>)}
        </div>
      </section>

      <section className="ew-section ew-case-cta">
        <div className="ew-shell">
          <p className="ew-eyebrow">Have a restricted storefront or portal?</p>
          <h2>Build the smallest access system that responsibly fits the job.</h2>
          <p>Eidos Works can map the roster, access rules, platform constraints, exception path, and customer experience before choosing the technology.</p>
          <a className="ew-button ew-button--light" href="/#contact">Discuss an access workflow</a>
        </div>
      </section>
    </>
  );
}
