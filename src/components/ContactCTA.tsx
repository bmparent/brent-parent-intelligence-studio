import { useState } from 'react';
import { contactMailto, projectBriefText } from '../utils';

export function ContactCTA() {
  const [copied, setCopied] = useState(false);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(projectBriefText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="section-shell final-cta" aria-labelledby="contact-title">
      <div className="final-cta__panel" data-reveal>
        <p className="eyebrow">Freelance inquiries</p>
        <h2 id="contact-title">Need a storefront, dashboard, automation, or intelligence interface that actually feels custom?</h2>
        <p>
          Bring the business problem, the platform constraints, and the outcome you want. I'll help turn it into a clear interface, workflow, or working system that looks premium and functions in the real world.
        </p>
        <div className="final-cta__actions">
          <a className="btn btn--primary" href={contactMailto}>
            Contact Brent
          </a>
          <a className="btn btn--secondary" href="#case-studies">
            View case studies
          </a>
          <button className="btn btn--ghost" type="button" onClick={copyBrief} aria-live="polite">
            {copied ? 'Brief copied' : 'Copy project brief'}
          </button>
        </div>
      </div>

      <aside className="brief-card" aria-label="Project inquiry brief" data-reveal>
        <span className="section-kicker">Useful first message</span>
        <pre>{projectBriefText}</pre>
      </aside>
    </section>
  );
}
