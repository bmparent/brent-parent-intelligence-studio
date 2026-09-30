import { DigitalExperiencesPage } from './DigitalExperiencesPage';
import '../styles/service-start-paths.css';
import { serviceBySlug, serviceFamilies } from '../data/editorial';

type ServiceSlug = (typeof serviceFamilies)[number]['slug'];

type ServiceContext = {
  forWhom: string;
  constraints: string;
  proof: string;
  problems: string[];
};

const serviceContext: Record<ServiceSlug, ServiceContext> = {
  'digital-experiences': {
    forWhom:
      'Teams with an unclear web presence, awkward customer journey, platform limitation, campaign deadline, or digital experience that does not feel as capable as the work behind it.',
    constraints:
      'Existing content, legacy and hosted platforms, accessibility, search discovery, performance, brand systems, mobile behavior, and the need for the experience to remain useful without decorative effects.',
    proof:
      'Clear hierarchy, responsive implementation, crawlable content, verified calls to action, browser-tested behavior, and documentation for any platform-specific extension.',
    problems: [
      'People do not understand what we offer.',
      'Our website looks generic or dated.',
      'The customer journey is confusing.',
      'Our hosted platform works, but the experience does not feel like us.',
      'The software underneath is fine; the experience around it is not.',
    ],
  },
  'business-systems': {
    forWhom:
      'Teams managing repeated reports, spreadsheets, handoffs, approvals, exceptions, manual follow-up, or information spread across systems that were never designed to work together.',
    constraints:
      'Data availability, API reliability, permissions, field consistency, export needs, operator habits, failure recovery, and what people actually need to decide or do next.',
    proof:
      'Working interface states, decision-relevant filters, repeatable tests, documented data assumptions, and clear handling of missing, stale, or failed inputs.',
    problems: [
      'We keep rebuilding the same report.',
      'Everything lives in different spreadsheets.',
      'We cannot tell what needs attention.',
      'This workflow depends on one person remembering every step.',
      'We are doing by hand what software should be doing for us.',
    ],
  },
  'intelligent-systems': {
    forWhom:
      'Teams that have a concrete AI use case but need something more useful and controlled than a generic chatbot.',
    constraints:
      'Data sensitivity, source quality, model limitations, permissions, cost, latency, hallucination risk, auditability, human oversight, and what the system must never be allowed to change on its own.',
    proof:
      'Defined use cases, permission boundaries, representative evaluations, source and provenance behavior where applicable, known limitations, fallback states, and a clear human-control model.',
    problems: [
      'A generic chatbot does not understand our actual process.',
      'People spend too much time finding the right information.',
      'We want AI to take specific actions, but only under defined rules.',
      'We have data, but the useful patterns are hard to see.',
      'We need assistance without turning over control.',
    ],
  },
};

function ServiceHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="ew-editorial-hero ew-editorial-hero--services ew-shell">
      <div>
        <p className="ew-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="ew-editorial-hero__lede">
        <p>{lede}</p>
      </div>
    </section>
  );
}

function StartingPointCta() {
  return (
    <section className="ew-engagement-note">
      <div className="ew-shell">
        <p className="ew-eyebrow">Starting point</p>
        <h2>Start with the problem costing the most time or creating the most confusion.</h2>
        <p>
          You do not need a finished technical brief. Show us what almost works,
          where people get stuck, or what your team keeps doing by hand.
        </p>
        <div className="ew-actions">
          <a className="ew-button ew-button--light" href="/friction-review">
            Get a Friction Review →
          </a>
          <a className="ew-button ew-button--secondary" href="/contact">
            Start a Project ↗
          </a>
        </div>
      </div>
    </section>
  );
}

function DigitalStartingPaths() {
  return <section className="ew-shell service-start-paths" aria-labelledby="digital-start-title">
    <div><h2 id="digital-start-title">Start with a draft. Take it as far as you want.</h2>
      <p>Make the first page in Playground, hand its files to your team, or bring the idea to Eidos Works for a scoped build.</p></div>
    <div className="service-start-paths__options">
      <a href="/playground/"><span>01 · Free tool</span><strong>Build a page in Playground</strong><small>Arrange content, preview it and download your own editable files.</small><b aria-hidden="true">↗</b></a>
      <a href="/shop/cinematic-starter/"><span>02 · $29 product</span><strong>Get the Cinematic Starter kit</strong><small>A separate ready-made page kit with its own checkout and terms.</small><b aria-hidden="true">↗</b></a>
      <a href="/contact/#project-form"><span>03 · Custom service</span><strong>Ask Eidos Works to design and build it</strong><small>Tell us the goal and constraints; custom work is scoped and quoted separately.</small><b aria-hidden="true">↗</b></a>
    </div>
  </section>;
}

function ServiceDetailCta({ slug }: { slug: ServiceSlug }) {
  const copy: Record<ServiceSlug, { title: string; body: string }> = {
    'digital-experiences': {
      title: 'Show us the part that almost works.',
      body: 'Send a page, storefront, campaign idea, or customer path that is not doing justice to the work behind it. We’ll identify the first place we would make it clearer, more useful, or more compelling.',
    },
    'business-systems': {
      title: 'What is your team still doing by hand?',
      body: 'Show us the repeated step, report, spreadsheet, or handoff. We’ll identify where a focused tool or automation could remove friction without replacing systems that still work.',
    },
    'intelligent-systems': {
      title: 'What should AI help with — and what should it never control?',
      body: 'Bring the task, the information involved, and the boundary. We’ll help determine whether AI belongs in the workflow at all and what a useful implementation would need.',
    },
  };
  return (
    <section className="ew-engagement-note">
      <div className="ew-shell">
        <p className="ew-eyebrow">Starting point</p>
        <h2>{copy[slug].title}</h2>
        <p>{copy[slug].body}</p>
        <div className="ew-actions">
          <a className="ew-button ew-button--light" href="/friction-review">
            Get a Friction Review →
          </a>
          <a className="ew-button ew-button--secondary" href="/contact">
            Start a Project ↗
          </a>
        </div>
      </div>
    </section>
  );
}

export function ServiceFamiliesSection() {
  return (
    <>
      <section className="ew-ledger-section ew-shell" aria-labelledby="about-work-title">
        <p className="ew-eyebrow">What we build</p>
        <h2 id="about-work-title">Build the part your current tools can’t quite do.</h2>
        <p>Eidos Works designs digital experiences, business systems, and focused AI tools around real workflows. Start with the friction. We work backward from what needs to become clearer, faster, or easier.</p>
        <div className="ew-service-index">
          {serviceFamilies.map((service) => (
            <article key={service.slug}>
              <span>{service.number}</span>
              <figure className={`ew-service-index__image ew-service-index__image--${service.slug}`}>
                <img
                  src={service.image}
                  width="1200"
                  height="800"
                  loading="lazy"
                  alt={service.imageAlt}
                />
                <figcaption>{service.imageCaption}</figcaption>
              </figure>
              <div>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <ul>
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <a
                className="ew-button ew-button--secondary"
                href={`/services/${service.slug}`}
              >
                Explore {service.title} ↗
              </a>
            </article>
          ))}
        </div>
      </section>
      <StartingPointCta />
    </>
  );
}

export function ServiceDetailPage({ slug }: { slug: ServiceSlug }) {
  const service = serviceBySlug(slug);
  const detail = serviceContext[slug];
  if (!service || !detail) return null;
  if (slug === 'digital-experiences') return <><DigitalExperiencesPage /><DigitalStartingPaths /><ServiceDetailCta slug={slug} /></>;

  return (
    <>
      <ServiceHero
        eyebrow={`Service ${service.number}`}
        title={service.title}
        lede={service.summary}
      />
      <figure className={`ew-service-evidence ew-shell ew-service-evidence--${slug}`}>
        <img src={service.image} width="1200" height="800" alt={service.imageAlt} />
        <figcaption>{service.imageCaption}</figcaption>
      </figure>
      <section className="ew-ledger-section ew-shell ew-service-detail">
        <div>
          <p className="ew-eyebrow">Who it is for</p>
          <h2>{detail.forWhom}</h2>
        </div>
        <div className="ew-service-detail__facts">
          <article>
            <h3>What the work can include</h3>
            <ul>
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Common friction</h3>
            <ul>
              {detail.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Constraints considered</h3>
            <p>{detail.constraints}</p>
          </article>
          <article>
            <h3>Evidence at handoff</h3>
            <p>{detail.proof}</p>
          </article>
        </div>
      </section>
      <ServiceDetailCta slug={slug} />
    </>
  );
}

export function LegacyServicePage({ legacySlug }: { legacySlug: string }) {
  if (legacySlug === 'storefront-access-systems') {
    return <ServiceDetailPage slug="digital-experiences" />;
  }
  if (legacySlug === 'dashboards-workflow-tools') {
    return <ServiceDetailPage slug="business-systems" />;
  }
  return null;
}
