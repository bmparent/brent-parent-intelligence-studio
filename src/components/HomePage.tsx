import { ContactForm } from './ContactForm';
import { articles, featuredArticle } from '../data/articles';
import { featuredMedia } from '../data/media';
import { profileImage } from '../data/portfolio';
import { cld, cldSrcSet } from '../utils';
import { siteConfig } from '../config/site';

const audiences = ['Small businesses', 'Service teams', 'Storefront and merchandise teams', 'Schools and organizations', 'Operations-heavy teams'];

const services = [
  {
    number: '01',
    title: 'Website & UX Redesign',
    description: 'Clarify the offer, strengthen the first impression, and give every visitor a cleaner path to the next useful action.',
    outcomes: ['Page strategy', 'Responsive interface design', 'Conversion-focused content structure']
  },
  {
    number: '02',
    title: 'Storefront Platform Experiences',
    description: 'Shape branded storefronts, team stores, company shops, and merchandise portals around how customers actually choose and order.',
    outcomes: ['Product-path clarity', 'Platform-ready content', 'Mobile ordering hierarchy']
  },
  {
    number: '03',
    title: 'Dashboards & Automation',
    description: 'Turn scattered spreadsheets, reports, and repeated follow-ups into operating views that show what changed and what needs attention.',
    outcomes: ['Operational dashboards', 'Workflow automation', 'Human-readable alerts and briefs']
  },
  {
    number: '04',
    title: 'Agentic SEO',
    description: 'Build pages that are useful to customers and easier for search engines and AI assistants to understand, compare, and summarize.',
    outcomes: ['Technical foundations', 'Structured content and schema', 'Search and AI-readiness']
  }
];

const proof = [
  {
    ...featuredMedia[0],
    eyebrow: 'Storefront experience systems',
    summary: 'Selected interface work shaped around branded ordering paths, product discovery, and clearer mobile decisions.'
  },
  {
    ...featuredMedia[3],
    eyebrow: 'Dashboards and automation',
    summary: 'Operational tools designed around real production signals, exceptions, and the next decision a team needs to make.'
  },
  {
    ...featuredMedia[1],
    eyebrow: 'Website and UX direction',
    summary: 'Customer-facing concepts that turn an unclear offer into a confident visual hierarchy and a practical build direction.'
  }
].filter((item) => item.src);

const insightPreview = featuredArticle
  ? [featuredArticle, ...articles.filter((article) => article.slug !== featuredArticle.slug)].slice(0, 3)
  : articles.slice(0, 3);

export function HomePage() {
  return (
    <>
      <section id="top" className="ew-hero ew-shell" aria-labelledby="home-title">
        <div className="ew-hero__copy">
          <p className="ew-eyebrow">Web design · storefront UX · business systems</p>
          <h1 id="home-title">Websites, storefronts, and systems that make the next step clear.</h1>
          <p className="ew-hero__lede">
            Eidos Works helps businesses turn scattered ideas, awkward customer paths, and manual processes into digital experiences people can understand and teams can actually use.
          </p>
          <div className="ew-actions">
            <a className="ew-button ew-button--primary" href="/snapshot">
              Start with a $5 Snapshot
            </a>
            <a className="ew-button ew-button--secondary" href="#services">
              Explore services
            </a>
          </div>
          <p className="ew-hero__note">A practical first step for an existing site—or a direct path to a complete build.</p>
        </div>

        <div className="ew-hero__visual" role="group" aria-label="Brent Parent and Eidos Works service overview">
          <div className="ew-orbit ew-orbit--one" aria-hidden="true" />
          <div className="ew-orbit ew-orbit--two" aria-hidden="true" />
          <img
            className="ew-hero__portrait"
            src={cld(profileImage, 760)}
            srcSet={cldSrcSet(profileImage, [420, 620, 760, 960])}
            sizes="(max-width: 800px) 82vw, 420px"
            width="760"
            height="950"
            alt="Illustrated portrait of Brent Parent, founder of Eidos Works."
            fetchPriority="high"
          />
          <div className="ew-hero__identity">
            <span>Founded and led by</span>
            <strong>Brent Parent</strong>
            <small>Creative technologist · designer · systems builder</small>
          </div>
          <div className="ew-hero__signal ew-hero__signal--top">
            <span>Customer path</span>
            <strong>Clearer</strong>
          </div>
          <div className="ew-hero__signal ew-hero__signal--bottom">
            <span>Operating friction</span>
            <strong>Lower</strong>
          </div>
        </div>
      </section>

      <section className="ew-audience" aria-labelledby="audience-title">
        <div className="ew-shell ew-audience__inner">
          <div>
            <p className="ew-eyebrow">Who Eidos Works helps</p>
            <h2 id="audience-title">For teams that have outgrown the way their digital work currently feels.</h2>
          </div>
          <ul>
            {audiences.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="ew-section ew-shell" aria-labelledby="services-title">
        <header className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">Services</p>
            <h2 id="services-title">Clarity at the customer layer and the operating layer.</h2>
          </div>
          <p>
            The work can begin with one page, one storefront, or one broken workflow. The goal is the same: make the system easier to understand and easier to act on.
          </p>
        </header>

        <div className="ew-service-list">
          {services.map((service) => (
            <article className="ew-service" key={service.title}>
              <span className="ew-service__number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="snapshot" className="ew-section ew-snapshot-band" aria-labelledby="snapshot-title">
        <div className="ew-shell ew-snapshot-band__grid">
          <div>
            <p className="ew-eyebrow">Eidos Snapshot · $5 one time</p>
            <h2 id="snapshot-title">See what your website could become.</h2>
            <p>
              Paste your current website and get a visual redesign concept plus practical SEO and UX recommendations. It is a focused way to get direction before committing to a full redesign.
            </p>
            <div className="ew-actions">
              <a className="ew-button ew-button--light" href="/snapshot">
                See what is included
              </a>
              <a
                className="ew-text-link ew-text-link--light"
                href={
                  siteConfig.snapshotCheckoutEnabled
                    ? '/snapshot/start'
                    : `mailto:${siteConfig.snapshotEmail}?subject=${encodeURIComponent('Eidos Snapshot launch notice')}`
                }
              >
                {siteConfig.snapshotCheckoutEnabled ? 'Start my Snapshot' : 'Get a launch notice'}
              </a>
            </div>
            <small>Concept and recommendation report—not a finished coded website or ranking guarantee.</small>
          </div>

          <div className="ew-snapshot-preview" role="img" aria-label="Example Eidos Snapshot report structure">
            <div className="ew-snapshot-preview__bar">
              <span />
              <span />
              <span />
              <strong>Snapshot direction</strong>
            </div>
            <div className="ew-snapshot-preview__hero">
              <span>Clear value proposition</span>
              <strong>A stronger first screen and next step</strong>
              <i />
            </div>
            <div className="ew-snapshot-preview__rows">
              <span>01 · First impression</span>
              <span>02 · UX priorities</span>
              <span>03 · Search readiness</span>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="ew-section ew-shell" aria-labelledby="work-title">
        <header className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">Selected work</p>
            <h2 id="work-title">Proof from real production and customer-facing workflows.</h2>
          </div>
          <p>
            Selected storefront, interface, and operations work created through production and agency workflows. The focus here is the problem solved—not overstated ownership or borrowed logos.
          </p>
        </header>

        <div className="ew-proof-grid">
          {proof.map((item, index) => (
            <article className={`ew-proof-card${index === 0 ? ' ew-proof-card--feature' : ''}`} key={item.id}>
              <div className="ew-proof-card__image">
                <img
                  src={cld(item.src, index === 0 ? 1100 : 760)}
                  srcSet={cldSrcSet(item.src, [420, 680, 900, 1100])}
                  sizes={index === 0 ? '(max-width: 800px) 94vw, 62vw' : '(max-width: 800px) 94vw, 32vw'}
                  width="1100"
                  height="760"
                  loading="lazy"
                  alt={item.alt}
                />
              </div>
              <div className="ew-proof-card__copy">
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </article>
          ))}
          <article className="ew-proof-card ew-proof-card--system">
            <div className="ew-proof-system" role="img" aria-label="Signals gathered into a concise brief for human review">
              <span>Business signals</span>
              <i aria-hidden="true">→</i>
              <strong>Useful brief</strong>
              <i aria-hidden="true">→</i>
              <span>Human review</span>
            </div>
            <div className="ew-proof-card__copy">
              <span>AI and intelligence prototypes</span>
              <h3>Eidos Brain &amp; Sentinel</h3>
              <p>
                Proof-stage research into narrow, inspectable intelligence tools that organize signals and support a human decision without pretending to run the business autonomously.
              </p>
              <a className="ew-text-link" href="/insights/eidos-brain-sentinel-small-business-intelligence">
                Read the case note <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <section id="agentic-seo" className="ew-section ew-agentic" aria-labelledby="agentic-title">
        <div className="ew-shell ew-agentic__grid">
          <div className="ew-agentic__diagram" aria-hidden="true">
            <span className="ew-agentic__node ew-agentic__node--human">People</span>
            <span className="ew-agentic__node ew-agentic__node--search">Search</span>
            <span className="ew-agentic__node ew-agentic__node--ai">AI assistants</span>
            <strong>Your website</strong>
          </div>
          <div>
            <p className="ew-eyebrow">Agentic SEO &amp; AI-ready strategy</p>
            <h2 id="agentic-title">Built for how people search now.</h2>
            <p>
              Modern websites need more than good visuals. Eidos Works structures pages so customers, search engines, and AI assistants can understand your services, proof, and next steps.
            </p>
            <ul className="ew-check-list">
              <li>Useful, crawlable service pages</li>
              <li>Clear metadata, schema, and internal links</li>
              <li>Accessible paths and real customer answers</li>
              <li>Measurement without promises no one can honestly make</li>
            </ul>
            <a className="ew-button ew-button--primary" href="/services/agentic-seo">
              Explore Agentic SEO
            </a>
          </div>
        </div>
      </section>

      <section id="insights" className="ew-section ew-shell" aria-labelledby="insights-title">
        <header className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">Insights</p>
            <h2 id="insights-title">Useful notes for a better digital business.</h2>
          </div>
          <p>Practical thinking on website strategy, storefront UX, automation, dashboards, and search in the age of AI assistants.</p>
        </header>

        <div className="ew-insight-preview">
          {insightPreview.map((article) => (
            <article key={article.slug}>
              <div>
                <span>{article.category}</span>
                <span>{article.readingTime}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a className="ew-text-link" href={article.canonicalPath}>
                Read insight <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
        <a className="ew-button ew-button--secondary" href="/insights">
          Browse all Insights
        </a>
      </section>

      <section id="process" className="ew-section ew-process" aria-labelledby="process-title">
        <div className="ew-shell">
          <header className="ew-section-heading">
            <div>
              <p className="ew-eyebrow">A simple process</p>
              <h2 id="process-title">Start with the real problem, then build only what earns its place.</h2>
            </div>
          </header>
          <ol>
            <li>
              <span>01</span>
              <h3>Find the friction</h3>
              <p>We identify where customers hesitate or where the team repeats work that should be easier.</p>
            </li>
            <li>
              <span>02</span>
              <h3>Shape the system</h3>
              <p>We turn the problem into a clear page, workflow, or operating model before polishing details.</p>
            </li>
            <li>
              <span>03</span>
              <h3>Build and prove it</h3>
              <p>We implement, test across devices, and leave behind something the customer and team can use.</p>
            </li>
          </ol>
        </div>
      </section>

      <section id="contact" className="ew-section ew-shell ew-contact" aria-labelledby="contact-title">
        <div className="ew-contact__intro">
          <p className="ew-eyebrow">Start a project</p>
          <h2 id="contact-title">What needs to become clearer?</h2>
          <p>
            Tell Eidos Works what is slowing customers down, creating manual work, or making the business harder to understand. You will get a direct reply—not an automated sales sequence.
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
