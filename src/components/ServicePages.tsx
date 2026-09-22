import { serviceBySlug, serviceFamilies } from '../data/editorial';
import { ConceptApplications } from './ConceptApplications';
import { ProblemExplorer, SupportedAnswerDemo } from './ServiceExplorer';
import '../styles/service-proof.css';

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

function ServiceDetailCta({ slug }: { slug: ServiceSlug }) {
  const copy: Record<ServiceSlug, { title: string; body: string }> = {
    'digital-experiences': {
      title: 'What should become easier to understand or use?',
      body: 'Show us the customer path, page, platform, or experience that almost works. We’ll identify the first place we would reduce friction.',
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

export function ServicesPage() {
  return (
    <>
      <ServiceHero
        eyebrow="Services"
        title="Build the part your current tools can’t quite do."
        lede="Eidos Works designs digital experiences, business systems, and focused AI tools around real workflows — not generic software categories. Start with the friction. We’ll work backward from what needs to become clearer, faster, or easier."
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

  return (
    <>
      <ServiceHero
        eyebrow={`Service ${service.number}`}
        title={slug==='digital-experiences'?'Make your website easier to explore, shop and use.':slug==='business-systems'?'Keep the work moving. Make the next decision clearer.':'Put useful assistance inside the work you already do.'}
        lede={service.summary}
      />
      <figure className={`ew-service-evidence ew-shell ew-service-evidence--${slug}`}>
        <img src={service.image} width="1200" height="800" alt={service.imageAlt} />
        <figcaption>{service.imageCaption}</figcaption>
      </figure>
      <ServiceProof slug={slug} />
      {slug==='digital-experiences' ? <ProblemExplorer/> : slug==='intelligent-systems' ? <SupportedAnswerDemo/> : null}
      <details className="ew-shell service-task">
        <summary>Scope, constraints and handoff</summary>
        <p>{detail.forWhom}</p>
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
      </details>
      <ServiceDetailCta slug={slug} />
    </>
  );
}

function ServiceProof({ slug }: { slug: ServiceSlug }) {
  if (slug === 'digital-experiences') return <section className="ew-shell service-proof"><div><p className="ew-eyebrow">A real hosted storefront</p><h2>A clearer entrance.<br/>A shorter path to the right product.</h2><p>Liberty Christian Early Learning runs on InkSoft. The custom entrance brings school identity, product categories and sizing guidance into the same customer journey.</p><a className="ew-text-link" href="https://stores.inksoft.com/liberty_christian_early_learnin/shop/home" target="_blank" rel="noreferrer">Visit the public storefront ↗</a><p className="service-proof__caption">Desktop and mobile captures: September 21, 2026. These show the delivered public interface, not a performance or conversion claim.</p></div><figure className="service-proof__phone"><img src="/images/services/liberty-mobile-20260921.png" width="390" height="844" loading="lazy" alt="Actual mobile Liberty storefront with classroom hero and product category paths"/><figcaption>Same store. A mobile entrance.</figcaption></figure><div className="service-proof__wide"><h3>Work within the platform. Improve the journey.</h3><p>Category hierarchy, sizing guidance, accessible controls and responsive layouts can improve a hosted store without replacing its checkout. Private roster access is a separate workflow.</p><a href="/work/pernr-access-gate">Explore the PERNR access case study →</a></div></section>;
  if (slug === 'business-systems') return <section className="ew-shell service-proof"><div className="service-proof__wide"><p className="ew-eyebrow">Try the workflow</p><h2>Useful tools start with the next decision.</h2><p>Filter production work, change an estimate, or inspect a reporting period. These three working examples use fictional records; they demonstrate interactions, not delivered customer installations.</p><ConceptApplications /></div><article><p className="ew-eyebrow">Delivered project · private access</p><h3>Promo Photo Organizer</h3><p>A job and company intake, labeled photo views, an upload queue and a SharePoint handoff. The uploader checks the supplied file’s byte count. Automatic folder sorting and physical-phone behavior still need acceptance evidence.</p><p>No customer photos or private storage are exposed here.</p><a href="/contact?project=promo-organizer">Discuss this workflow →</a></article><article><p className="ew-eyebrow">Working product</p><h3>EmbroideryCalc</h3><p>A focused estimating workspace for embroidery inputs. Product and device acceptance remain separate from these fictional production demos.</p><a href="https://embroiderycalc-public.pages.dev/">See the product in the work collection →</a></article></section>;
  return <section className="ew-shell service-proof"><div><p className="ew-eyebrow">Focused assistance</p><h2>Give AI a useful job.<br/>Keep the boundary visible.</h2><p>Wellway combines guided reflection with optional AI assistance. Local prompts remain available when hosted assistance is unavailable. It is a reflection tool, not diagnosis or emergency care.</p><a href="/demos/wellway/">Open Wellway →</a></div><article><p className="ew-eyebrow">Source-backed answers</p><h3>Ask Eidos about a real workflow.</h3><p>The site assistant retrieves from a maintained project catalogue. Its source answer remains available without an AI call. Follow-up context is bounded and can be reset.</p><p>Try “Do you have anything for print shops?” in Ask Eidos, then ask about the photo workflow.</p></article><div className="service-proof__wide"><h3>A practical engagement</h3><ol><li>Identify one task and its approved sources.</li><li>Define permissions, cost limits and a useful fallback.</li><li>Test representative questions and failure cases.</li><li>Review the evidence before expanding access.</li></ol><p>Sentinel is separate research-stage work. Its results are not evidence that every business AI task is solved.</p><a href="/lab">View the research boundary →</a></div></section>;
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
