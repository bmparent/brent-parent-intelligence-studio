import { ContactForm } from './ContactForm';
import { primaryCaseStudies, serviceBySlug, serviceFamilies, type ServiceSlug } from '../data/editorial';
import { productionDashboardUrl, profileImage } from '../data/portfolio';
import { featuredMedia } from '../data/media';
import { cld, cldSrcSet, externalLinkProps } from '../utils';

function EditorialHero({ eyebrow, title, lede, aside, className = '' }: { eyebrow: string; title: string; lede: string; aside?: string; className?: string }) {
  return (
    <section className={`ew-editorial-hero ew-shell ${className}`.trim()}>
      <div>
        <p className="ew-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="ew-editorial-hero__lede">
        <p>{lede}</p>
        {aside ? <small>{aside}</small> : null}
      </div>
    </section>
  );
}

function RoleDisclosure({ children }: { children: React.ReactNode }) {
  return <p className="ew-role-disclosure"><strong>Role disclosure</strong>{children}</p>;
}

export function WorkPage() {
  return (
    <>
      <EditorialHero
        eyebrow="Selected work"
        title="Work that makes a complicated process easier to use."
        lede="Three primary case studies show the range: controlled storefront access, daily production reporting, and a hosted store shaped around a real audience. Additional concepts and production context stay in a clearly labeled archive."
      />
      <section className="ew-ledger-section ew-shell" aria-label="Primary case studies">
        <div className="ew-work-index">
          {primaryCaseStudies.map((project, index) => (
            <article key={project.slug}>
              <a href={`/work/${project.slug}`}>
                <img src={project.image} width="1200" height="800" loading={index === 0 ? 'eager' : 'lazy'} alt={project.imageAlt} />
                <div>
                  <p className="ew-eyebrow">{project.eyebrow}</p>
                  <h2>{project.title}</h2>
                  <p>{project.problem}</p>
                  <span className="ew-text-link">Read the case study</span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="ew-ledger-section ew-supporting-work">
        <div className="ew-shell ew-supporting-work__grid">
          <div><p className="ew-eyebrow">Concept and context archive</p><h2>Additional directions and production context, clearly separated from finished case-study evidence.</h2></div>
          <div className="ew-supporting-work__images">
            {featuredMedia.slice(0, 3).map((item) => (
              <figure key={item.id}>
                <img src={cld(item.src, 720)} width="720" height="520" loading="lazy" alt={item.alt} />
                <figcaption>{item.type === 'operations' ? 'Operational context' : 'Concept direction'} · {item.title} · {item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductionDashboardCaseStudy() {
  return (
    <>
      <EditorialHero
        eyebrow="Operational reporting · case study"
        title="A production schedule built for the morning planning decision."
        lede="Production teams can see what is late, what is due next, and where active work stands without rebuilding the schedule in a spreadsheet."
        aside="Completed as part of Data Graphics' internal production workflow."
      />
      <section className="ew-case-image ew-shell">
        <img src="/images/case-studies/production-dashboard.png" width="1200" height="800" alt="Production reporting dashboard showing schedule counts, filters, and the work-order table." />
        <p>Public interface view captured July 11, 2026. Customer rows were not included in the capture.</p>
      </section>
      <section className="ew-case-narrative ew-shell" aria-labelledby="dashboard-context-title">
        <div className="ew-case-narrative__main">
          <p className="ew-eyebrow">Context and problem</p>
          <h2 id="dashboard-context-title">Daily planning depended on seeing the same schedule from several angles.</h2>
          <p>Production work moves through departments with different due dates, quantities, statuses, tags, links, and notes. A useful view has to answer what is late, what is due, where the work sits, and what deserves attention without turning the morning huddle into a spreadsheet exercise.</p>
          <h3>What the project brought together</h3>
          <p>The work mapped the daily review, made the reporting interface responsive, added date and department filtering, exposed searchable work orders and completed-work controls, and kept CSV export and data refresh available during the planning review.</p>
          <h3>How the system works</h3>
          <ol className="ew-flow-ledger">
            <li><span>01</span><strong>Source</strong><p>Production schedule data is retrieved from the existing operating source.</p></li>
            <li><span>02</span><strong>Normalize</strong><p>Dates, departments, statuses, quantities, notes, and links are shaped into a consistent record.</p></li>
            <li><span>03</span><strong>Review</strong><p>Teams filter the schedule by department and date, then search for the work order that needs attention.</p></li>
            <li><span>04</span><strong>Act</strong><p>The team can plan the next run, follow up on an exception, export the schedule, or refresh the data.</p></li>
          </ol>
        </div>
        <aside className="ew-case-facts">
          <RoleDisclosure> Internal workflow design and implementation for Data Graphics. This is not presented as a standalone Eidos Works client engagement.</RoleDisclosure>
          <dl>
            <div><dt>People affected</dt><dd>Production planners and department leads.</dd></div>
            <div><dt>Constraints</dt><dd>Live operational data, wide tables, changing date windows, and department-specific review.</dd></div>
            <div><dt>Observed change</dt><dd>One filterable schedule now supports the daily planning review.</dd></div>
            <div><dt>Unknown</dt><dd>No time-saved, revenue, or productivity percentage has been claimed.</dd></div>
          </dl>
          <a className="ew-button ew-button--secondary" href={productionDashboardUrl} {...externalLinkProps('Open the public production dashboard')}>Open public dashboard</a>
        </aside>
      </section>
      <CaseOutcome
        result="Production teams can review late work, upcoming due dates, department status, and active exceptions in one schedule."
        next="Add documented refresh health, stronger empty and error receipts, and a reviewed mobile summary if the daily operating workflow calls for it."
      />
    </>
  );
}

export function StorefrontExperienceCaseStudy() {
  return (
    <>
      <EditorialHero
        eyebrow="Hosted storefront UX · case study"
        title="A hosted school store made to feel intentional before the product grid."
        lede="Families enter through a branded school experience that points them to the right apparel, sizing information, and ordering details before they reach the product grid."
        aside="Storefront presentation completed within Data Graphics' client-services workflow."
      />
      <section className="ew-case-image ew-shell">
        <img src="/images/case-studies/storefront-experience-framed.png" width="1200" height="800" alt="Public Liberty Christian Early Learning storefront with a custom editorial entrance." />
        <p>Public storefront view captured July 11, 2026. The underlying ordering platform remains InkSoft.</p>
      </section>
      <section className="ew-case-narrative ew-shell" aria-labelledby="store-context-title">
        <div className="ew-case-narrative__main">
          <p className="ew-eyebrow">Context and problem</p>
          <h2 id="store-context-title">Families needed an official path into everyday school apparel.</h2>
          <p>A default hosted-store entrance can make every product feel equally important. This project needed a warmer opening, visible category choices, product guidance, deadline and pickup context where relevant, and mobile behavior that still makes the first decision easy.</p>
          <h3>What the project included</h3>
          <p>Within Data Graphics' client-services workflow, the project brought together storefront strategy, interface development, production-aware content, Cloudinary-backed assets, clearer product paths, and responsive behavior for restrictive hosted pages.</p>
          <p>Brent contributed storefront strategy, interface development, operational context, and implementation as part of that broader client-services workflow.</p>
          <h3>What changed</h3>
          <p>The public store now opens with a deliberate branded entrance instead of asking shoppers to interpret a generic catalog first. The interface points families toward polos, layers, and sizing guidance while leaving product, cart, and checkout behavior with the platform.</p>
          <h3>Platform constraint</h3>
          <p>The custom entrance works inside InkSoft. It improves the path into the catalog while InkSoft continues to handle products, accounts, cart behavior, and checkout.</p>
        </div>
        <aside className="ew-case-facts">
          <RoleDisclosure> Completed within Data Graphics' client-services workflow. Eidos Works does not claim a direct client relationship or ownership of the school's identity.</RoleDisclosure>
          <dl>
            <div><dt>People affected</dt><dd>Parents and families shopping for early-learning apparel.</dd></div>
            <div><dt>Constraints</dt><dd>Hosted platform markup, existing cart and account pages, responsive embeds, and client-owned branding.</dd></div>
            <div><dt>Observed change</dt><dd>The store now presents a guided, branded entrance with clearer product paths.</dd></div>
            <div><dt>Unknown</dt><dd>No conversion, traffic, revenue, or testimonial claim is made.</dd></div>
          </dl>
        </aside>
      </section>
      <CaseOutcome
        result="Families reach a branded school-store entrance with clearer product paths, sizing guidance, and ordering context before they enter the catalog."
        next="Review product-level analytics and recurring customer questions before deciding whether the store needs additional guidance."
      />
    </>
  );
}

function CaseOutcome({ result, next }: { result: string; next: string }) {
  return (
    <section className="ew-case-learning">
      <div className="ew-shell">
        <div><p className="ew-eyebrow">Result</p><h2>{result}</h2></div>
        <div><p className="ew-eyebrow">Next opportunity</p><p>{next}</p><a className="ew-button ew-button--light" href="/contact">Discuss a related project</a></div>
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <>
      <EditorialHero className="ew-editorial-hero--services" eyebrow="Services" title="Design and development for the problem getting in people's way." lede="Bring us the website people struggle to understand, the private store that needs better access, or the workflow your team still manages by hand. Eidos Works designs and builds a focused solution around the way the work actually happens." />
      <section className="ew-ledger-section ew-shell">
        <div className="ew-service-index">
          {serviceFamilies.map((service) => (
            <article key={service.slug}>
              <span>{service.number}</span>
              <figure className={`ew-service-index__image ew-service-index__image--${service.slug}`}>
                <img src={service.image} width="1200" height="800" loading="lazy" alt={service.imageAlt} />
                <figcaption>{service.imageCaption}</figcaption>
              </figure>
              <div><h2>{service.title}</h2><p>{service.summary}</p><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <a className="ew-button ew-button--secondary" href={`/services/${service.slug}`}>Explore service</a>
            </article>
          ))}
        </div>
      </section>
      <section className="ew-engagement-note"><div className="ew-shell"><p className="ew-eyebrow">Starting point</p><h2>Start with the problem that is costing the most time or creating the most confusion.</h2><p>Scope and price depend on content readiness, data access, platform constraints, integrations, and review depth. A project conversation establishes those facts before a proposal.</p><a className="ew-button ew-button--light" href="/contact">Tell us what needs to work better</a></div></section>
    </>
  );
}

export function ServiceDetailPage({ slug }: { slug: ServiceSlug }) {
  const service = serviceBySlug(slug);
  if (!service) return null;
  const context: Record<ServiceSlug, { forWhom: string; constraints: string; proof: string }> = {
    'digital-experiences': {
      forWhom: 'Organizations with an unclear offer, awkward customer path, campaign deadline, or service page that is difficult to understand.',
      constraints: 'Existing content, legacy platforms, accessibility, search discovery, performance, and the need for an interface that still works without decorative effects.',
      proof: 'Page hierarchy, responsive implementation, metadata, crawlable content, clear calls to action, and browser-verified behavior.'
    },
    'storefront-access-systems': {
      forWhom: 'Teams running employee stores, school stores, preorder programs, private merchandise experiences, or hosted storefronts that need a clearer entrance.',
      constraints: 'InkSoft or another hosted platform, client-owned branding, roster privacy, cart behavior, mobile ordering, deadlines, pickup, and product guidance.',
      proof: 'Real interface states, scoped embeds, public-safe access demos, role disclosure, responsive views, and documented privacy boundaries.'
    },
    'dashboards-workflow-tools': {
      forWhom: 'Operations teams reviewing schedules, exceptions, handoffs, spreadsheets, repeated reports, or manual follow-up.',
      constraints: 'Data availability, API reliability, permissions, field consistency, export needs, operator habits, and failure recovery.',
      proof: 'A working dashboard, filters and states tied to decisions, repeatable tests, and clear handling of missing or stale data.'
    }
  };
  const detail = context[slug];
  return (
    <>
      <EditorialHero eyebrow={`Service ${service.number}`} title={service.title} lede={service.summary} />
      <figure className={`ew-service-evidence ew-shell ew-service-evidence--${slug}`}>
        <img src={service.image} width="1200" height="800" alt={service.imageAlt} />
        <figcaption>{service.imageCaption}</figcaption>
      </figure>
      <section className="ew-ledger-section ew-shell ew-service-detail">
        <div><p className="ew-eyebrow">Who it is for</p><h2>{detail.forWhom}</h2></div>
        <div className="ew-service-detail__facts">
          <article><h3>What the work can include</h3><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>Constraints considered</h3><p>{detail.constraints}</p></article>
          <article><h3>Evidence at handoff</h3><p>{detail.proof}</p></article>
        </div>
      </section>
      <section className="ew-ledger-section ew-shell ew-contact" aria-labelledby={`${slug}-contact-title`}>
        <div className="ew-contact__intro"><p className="ew-eyebrow">Discuss the workflow</p><h2 id={`${slug}-contact-title`}>What should become easier to understand or operate?</h2><p>Describe the current path, the people affected, and the platform or data constraints you already know.</p></div>
        <ContactForm />
      </section>
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <EditorialHero eyebrow="About" title="A studio led by operational experience." lede="Brent Parent founded and leads Eidos Works, bringing design judgment, hands-on technical contribution, and experience from the work behind storefronts, production, fulfillment, reporting, and automation." />
      <section className="ew-about-profile ew-shell">
        <img src={cld(profileImage, 820)} srcSet={cldSrcSet(profileImage, [480, 640, 820])} sizes="(max-width: 760px) 90vw, 420px" width="820" height="1025" alt="Illustrated portrait of Brent Parent, founder and principal of Eidos Works." />
        <div>
          <p className="ew-eyebrow">Brent Parent · Central Florida</p>
          <h2>Design and operations belong in the same conversation.</h2>
          <p>Brent's experience includes product setup, embroidery, decorated-apparel production, fulfillment, shipping, logistics, deadlines, exceptions, and the reports people use to keep work moving.</p>
          <p>That background sits beside UI/UX, React and frontend development, Google Cloud Platform, Google Apps Script, reporting, and focused automation. Data Graphics contributed substantial practical knowledge, but it did not solely inspire or define Eidos Works.</p>
          <p>Eidos Works can collaborate with client teams, specialists, platforms, automation, AI-assisted workflows, and other technical resources appropriate to the project. Brent leads the studio and contributes directly without claiming to perform every discipline or implementation task alone.</p>
          <p>Eidos Works is also exploring how AI can help people recognize patterns and make better decisions without hiding how an answer was reached. Eidos Brain is that proof-stage research initiative; Sentinel is a monitoring concept within it, not the primary identity of the studio.</p>
          <a className="ew-button ew-button--primary" href="/contact">Discuss a project</a>
        </div>
      </section>
      <section className="ew-ledger-section ew-about-principles"><div className="ew-shell"><p className="ew-eyebrow">Working principles</p><ul><li>Understand the real workflow before choosing the interface.</li><li>Use technology where it removes confusion or repeated work.</li><li>Keep ownership and evidence clear.</li><li>Test the thing people will actually use.</li></ul></div></section>
    </>
  );
}

export function ContactPage() {
  return (
      <section className="ew-contact-page ew-shell">
       <div className="ew-contact-page__intro"><p className="ew-eyebrow">Contact</p><h1>Tell Eidos Works what you are trying to improve.</h1><p>Share the customer path, storefront constraint, reporting gap, or repeated manual work. You do not need a finished brief.</p><p>Email directly: <a href="mailto:projects@eidos-works.com">projects@eidos-works.com</a></p></div>
      <ContactForm />
    </section>
  );
}

export function EidosBrainLabPage() {
  return (
    <>
      <EditorialHero eyebrow="Lab · proof-stage research" title="Eidos Brain explores how streaming data can reveal meaningful change." lede="The research tests prediction, unusual changes, human-readable incident records, and human review. It remains separate from the primary Eidos Works studio offer." />
      <section className="ew-lab-status">
        <div className="ew-shell ew-lab-status__grid">
          <div><p className="ew-eyebrow">Current maturity</p><h2>Research with receipts. Not a finished commercial platform.</h2></div>
          <dl>
            <div><dt>Input</dt><dd>Live or replayed streams represented as bounded signals.</dd></div>
            <div><dt>Processing</dt><dd>Prediction error and surprise scoring identify changes worth preserving.</dd></div>
            <div><dt>Output</dt><dd>Metrics, incident receipts, plots, and proof artifacts for human review.</dd></div>
            <div><dt>Authority</dt><dd>Human-reviewed; no claim of autonomous operational control.</dd></div>
          </dl>
        </div>
      </section>
      <section className="ew-ledger-section ew-shell ew-lab-method" aria-labelledby="lab-method-title">
        <p className="ew-eyebrow">Research method</p><h2 id="lab-method-title">Learn the expected stream, measure the residual, preserve the part that changes meaning.</h2>
        <div><article><span>01</span><h3>Observe</h3><p>Process a time-ordered stream and maintain a compact internal state.</p></article><article><span>02</span><h3>Predict</h3><p>Estimate the next signal and measure the residual between prediction and observation.</p></article><article><span>03</span><h3>Review surprise</h3><p>Compare error with recent error behavior so unusual change can be inspected.</p></article><article><span>04</span><h3>Emit receipts</h3><p>Keep raw and calibrated metrics visible beside human-readable evidence.</p></article></div>
      </section>
      <section className="ew-ledger-section ew-lab-limit"><div className="ew-shell"><p className="ew-eyebrow">Limits and next experiment</p><h2>The work does not prove general intelligence, consciousness, universal prediction, or autonomous decision-making.</h2><p>Current research value comes from reproducible domain proofs, false-positive discipline, compression and anomaly-preservation measurements, and incident explanations. The next experiment should be chosen from a documented proof gap, not a broader claim.</p><a className="ew-text-link ew-text-link--light" href="/insights/eidos-brain-sentinel-small-business-intelligence">Read the public case note</a></div></section>
    </>
  );
}
