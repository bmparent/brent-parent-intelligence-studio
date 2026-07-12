import { ContactForm } from './ContactForm';
import { articles, featuredArticle } from '../data/articles';
import { primaryCaseStudies, serviceFamilies } from '../data/editorial';

const process = [
  ['01', 'Understand the problem', 'Start with the customer decision or operating problem—not a list of requested features.'],
  ['02', 'Map the real workflow', 'Document the people, platforms, handoffs, constraints, and exceptions around the work.'],
  ['03', 'Design and build the right system', 'Create the website, storefront, dashboard, or automation that gives the next person a reliable next step.'],
  ['04', 'Test, launch, and improve', 'Verify the route, responsive behavior, accessibility, and live delivery before calling it finished.']
] as const;

const insightPreview = featuredArticle
  ? [featuredArticle, ...articles.filter((article) => article.slug !== featuredArticle.slug)].slice(0, 3)
  : articles.slice(0, 3);

export function HomePage() {
  return (
    <>
      <section id="top" className="ew-ledger-hero ew-shell" aria-labelledby="home-title">
        <div className="ew-ledger-hero__copy">
          <p className="ew-eyebrow">Eidos Works</p>
          <h1 id="home-title">Digital experiences and operational tools for complicated real-world workflows.</h1>
          <span className="ew-rule" aria-hidden="true" />
          <p className="ew-ledger-hero__lede">
            Eidos Works designs storefronts, access systems, dashboards, and focused automation for organizations whose digital tools have to work in the real world.
          </p>
          <div className="ew-actions">
            <a className="ew-button ew-button--primary" href="#work">View Selected Work</a>
            <a className="ew-button ew-button--secondary" href="/contact">Discuss a Project</a>
          </div>
          <p className="ew-founder-byline">Founded by Brent Parent in Central Florida.</p>
        </div>

        <div className="ew-studio-work-composition" aria-label="Examples of Eidos Works storefront, access, and reporting interfaces">
          <figure className="ew-studio-work-composition__main">
            <img src="/images/case-studies/production-dashboard.png" width="1200" height="800" alt="Production dashboard with date, department, and schedule controls." fetchPriority="high" />
            <figcaption>Workflow tools</figcaption>
          </figure>
          <figure>
            <img src="/images/case-studies/storefront-experience-framed.png" width="1200" height="800" alt="Branded early-learning storefront entrance." fetchPriority="high" />
            <figcaption>Storefronts</figcaption>
          </figure>
          <figure>
            <img src="/images/case-studies/pernr-access-gate.png" width="1200" height="800" alt="Public-safe private-store eligibility check." fetchPriority="high" />
            <figcaption>Access systems</figcaption>
          </figure>
        </div>
      </section>

      <section id="work" className="ew-case-rail" aria-labelledby="selected-work-title">
        <div className="ew-shell">
          <div className="ew-case-rail__header">
            <p className="ew-eyebrow">Selected work</p>
            <h2 id="selected-work-title">See how Eidos Works solves real access, storefront, and workflow problems.</h2>
            <a className="ew-text-link ew-text-link--light" href="/work">View all work</a>
          </div>
          <div className="ew-case-rail__grid">
            {primaryCaseStudies.map((project, index) => (
              <article className={index === 0 ? 'ew-case-tile ew-case-tile--feature' : 'ew-case-tile'} key={project.slug}>
                <a href={`/work/${project.slug}`} aria-label={`Read ${project.shortTitle} case study`}>
                  <img src={project.image} width="1200" height="800" loading={index === 0 ? 'eager' : 'lazy'} alt={project.imageAlt} />
                  <div>
                    <span>{project.eyebrow}</span>
                    <h3>{project.shortTitle}</h3>
                    <p>{project.role}</p>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="ew-ledger-section ew-shell" aria-labelledby="services-title">
        <header className="ew-ledger-heading">
          <p className="ew-eyebrow">Services</p>
          <h2 id="services-title">Make your website, storefront, or workflow easier to use.</h2>
          <p>Start with the customer path, private store, or repeated task that is creating the most friction.</p>
        </header>
        <div className="ew-service-ledger">
          {serviceFamilies.map((service) => (
            <article key={service.slug}>
              <span>{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </div>
              <a className="ew-text-link" href={`/services/${service.slug}`}>See the service</a>
            </article>
          ))}
        </div>
      </section>

      <section className="ew-ledger-section ew-ledger-about" aria-labelledby="studio-context-title">
        <div className="ew-shell ew-ledger-about__grid">
          <div>
            <p className="ew-eyebrow">Studio context</p>
            <h2 id="studio-context-title">Digital systems shaped by an understanding of the work behind them.</h2>
          </div>
          <div>
            <p>
              Eidos Works is led by Brent Parent, whose experience spans UI/UX, storefront development, decorated-apparel production, shipping, fulfillment, reporting, and automation.
            </p>
            <p>
              The studio combines that practical context with frontend development, Google Cloud Platform knowledge, appropriate collaborators, and client teams to build tools people can understand without a tour.
            </p>
            <a className="ew-text-link" href="/about">About Brent and Eidos Works</a>
          </div>
        </div>
      </section>

      <section className="ew-ledger-section ew-shell" aria-labelledby="process-title">
        <header className="ew-ledger-heading ew-ledger-heading--compact">
          <p className="ew-eyebrow">Working together</p>
          <h2 id="process-title">From a difficult workflow to a system people can actually use.</h2>
        </header>
        <ol className="ew-process-ledger">
          {process.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="insights" className="ew-ledger-section ew-insights-preview" aria-labelledby="home-insights-title">
        <div className="ew-shell">
          <header className="ew-ledger-heading">
            <p className="ew-eyebrow">Insights</p>
            <h2 id="home-insights-title">Practical ideas for better websites, storefronts, and operations.</h2>
            <a className="ew-text-link" href="/insights">Browse Insights</a>
          </header>
          <div className="ew-insight-ledger">
            {insightPreview.map((article) => (
              <article key={article.slug}>
                <div><span>{article.category}</span><span>{article.readingTime}</span></div>
                <h3><a href={article.canonicalPath}>{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="ew-ledger-section ew-shell ew-contact" aria-labelledby="home-contact-title">
        <div className="ew-contact__intro">
          <p className="ew-eyebrow">Discuss a project</p>
          <h2 id="home-contact-title">What are you trying to improve?</h2>
          <p>Share the awkward customer path, private-store requirement, reporting gap, or repeated manual work. You will hear directly from Eidos Works.</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
