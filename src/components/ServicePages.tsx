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
      'Teams with an unclear offer, awkward customer path, generic website, campaign deadline, or hosted platform that works technically but does not feel intentional.',
    constraints:
      'Existing content and platforms, accessibility, search discovery, performance, responsive behavior, brand systems, and the need for an interface that remains useful without decorative effects.',
    proof:
      'A responsive working experience with clear calls to action, crawlable content, intentional interaction states, performance-minded implementation, and browser-verified behavior.',
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
      'Operations teams reviewing schedules, exceptions, handoffs, spreadsheets, repeated reports, approvals, or manual follow-up that should be easier to see and operate.',
    constraints:
      'Data availability, API reliability, permissions, field consistency, existing software, operator habits, exports, alerts, error recovery, and the need to fit the real workflow rather than replace useful systems unnecessarily.',
    proof:
      'A working tool tied to actual decisions: clear states, filters, handoffs, repeatable tests, and explicit handling of missing, stale, or failed data.',
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
      'Teams with a specific AI-assisted job to perform: finding approved information, surfacing patterns, supporting decisions, or taking bounded actions under explicit human-controlled rules.',
    constraints:
      'Approved knowledge sources, permissions, provenance, evaluation, privacy, failure behavior, human review, model limitations, and clear separation between useful assistance and uncontrolled authority.',
    proof:
      'A bounded capability with visible inputs and outputs, documented permissions, testable behavior, human review where needed, and explicit limits rather than a generic chatbot claim.',
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

function FrictionCta() {
  return (
    <section className="ew-engagement-note">
      <div className="ew-shell">
        <p className="ew-eyebrow">Have something that almost works?</p>
        <h2>Show us the friction.</h2>
        <p>
          Send us the website, workflow, process, or tool that keeps getting in
          the way. We’ll identify what we would change first.
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

export function ServicesPage() {
  return (
    <>
      <ServiceHero
        eyebrow="Services"
        title="Start with the friction. Build the missing piece."
        lede="Eidos Works designs and builds digital experiences, business systems, and focused AI tools around the point where an existing site, workflow, platform, or piece of software stops fitting the way the work actually happens."
      />
      <section className="ew-ledger-section ew-shell">
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
                <h2>{service.title}</h2>
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
                Explore service
              </a>
            </article>
          ))}
        </div>
      </section>
      <FrictionCta />
    </>
  );
}

export function ServiceDetailPage({ slug }: { slug: ServiceSlug }) {
  const service = serviceBySlug(slug);
  const detail = serviceContext[slug];
  if (!service || !detail) return null;

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
      <FrictionCta />
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
