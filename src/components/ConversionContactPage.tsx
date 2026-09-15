import { ContactForm } from './ContactForm';
import { EmailAddress, SafeEmailLink } from './EmailAddress';
import { siteConfig } from '../config/site';

export function ConversionContactPage() {
  return (
    <>
      <section className="ew-editorial-hero ew-shell">
        <div>
          <p className="ew-eyebrow">Start a Project</p>
          <h1>Ready to build something? Tell us what needs to become better.</h1>
        </div>
        <div className="ew-editorial-hero__lede">
          <p>
            If you already have a project, deadline, or defined outcome in mind,
            send it here. If you are still trying to understand the problem,
            start with a Friction Review instead.
          </p>
        </div>
      </section>

      <section className="ew-shell ew-contact-choice" aria-label="Choose how to start">
        <a href="#project-form">
          <span className="ew-eyebrow">01 / Defined project</span>
          <h2>I know what I want to build.</h2>
          <p>Continue with the project form.</p>
          <span className="ew-text-link">Send a Project Note ↓</span>
        </a>
        <a href="/friction-review">
          <span className="ew-eyebrow">02 / Define the problem</span>
          <h2>I know what is frustrating me, but not the solution.</h2>
          <p>Start with the problem. We’ll identify what we would change first.</p>
          <span className="ew-text-link">Get a Friction Review →</span>
        </a>
      </section>

      <section id="project-form" className="ew-contact-page ew-shell">
        <div className="ew-contact-page__intro">
          <p className="ew-eyebrow">Project form</p>
          <h2>What should we build together?</h2>
          <p>
            Share the current path, the people affected, the outcome you want,
            and any platform or deadline constraints you already know.
          </p>
          <p>
            Prefer email?{' '}
            <SafeEmailLink address={siteConfig.projectsEmail}>
              <EmailAddress address={siteConfig.projectsEmail} />
            </SafeEmailLink>
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
