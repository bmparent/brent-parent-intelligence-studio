import { ContactForm } from './ContactForm';

const foundations = [
  {
    number: '01',
    title: 'Crawlable, structured public pages',
    body: 'Service pages, case notes, pricing context, contact paths, canonicals, sitemap rules, and internal links that form a coherent public map.'
  },
  {
    number: '02',
    title: 'Metadata and schema that match the page',
    body: 'Accurate titles, descriptions, social previews, Organization and Person signals, Service schema, Article schema, and useful breadcrumbs.'
  },
  {
    number: '03',
    title: 'Content that answers real questions',
    body: 'Clear headings, answer-first sections, specific examples, and practical explanations written for the questions customers ask before contacting you.'
  },
  {
    number: '04',
    title: 'Agent-friendly customer experience',
    body: 'Semantic HTML, accessible labels, real links and buttons, predictable forms, clear confirmation states, and important information outside of decorative effects.'
  },
  {
    number: '05',
    title: 'Measurement and iteration',
    body: 'Search Console, Bing Webmaster Tools where relevant, index checks, conversion tracking, and AI-referral observation when the data is available.'
  }
];

export function AgenticSeoPage() {
  return (
    <>
      <section className="ew-page-hero ew-page-hero--agentic">
        <div className="ew-shell ew-page-hero__inner">
          <div>
            <p className="ew-eyebrow">Agentic SEO &amp; AI-ready website strategy</p>
            <h1>SEO for people, search engines, and AI assistants.</h1>
            <p>
              Search is changing. Customers still use Google, but they also ask AI assistants to compare options, summarize businesses, and recommend next steps. Eidos Works builds websites with clear structure, useful content, strong technical foundations, and machine-readable signals so your business is easier to understand wherever discovery happens.
            </p>
            <div className="ew-actions">
              <a className="ew-button ew-button--primary" href="#agentic-contact">
                Discuss your website
              </a>
              <a className="ew-button ew-button--secondary" href="/snapshot">
                Start with a $5 Snapshot
              </a>
            </div>
          </div>
          <div className="ew-agentic-stack" role="group" aria-label="Three audiences a well-structured website should serve">
            <span>01 · Customers looking for an answer</span>
            <span>02 · Search engines mapping the site</span>
            <span>03 · AI assistants comparing the evidence</span>
          </div>
        </div>
      </section>

      <section className="ew-section ew-shell ew-definition" aria-labelledby="definition-title">
        <p className="ew-eyebrow">What we mean by agentic SEO</p>
        <h2 id="definition-title">Make the business easier for humans and software to understand.</h2>
        <p>
          That means clear pages, clean metadata, structured content, helpful service explanations, strong internal links, accessible forms, and technical signals that support discovery. It is foundational website work applied to the way discovery now happens—not a shortcut or ranking trick.
        </p>
      </section>

      <section className="ew-section ew-why-agentic" aria-labelledby="why-agentic-title">
        <div className="ew-shell">
          <header className="ew-section-heading">
            <div>
              <p className="ew-eyebrow">Why it matters</p>
              <h2 id="why-agentic-title">The answer often gets summarized before the customer ever opens your page.</h2>
            </div>
          </header>
          <div className="ew-reason-grid">
            <article>
              <span>01</span>
              <p>Customers are asking more detailed questions before they ever contact you.</p>
            </article>
            <article>
              <span>02</span>
              <p>AI-assisted search tools summarize pages instead of only presenting a list of blue links.</p>
            </article>
            <article>
              <span>03</span>
              <p>Weak structure makes your services, proof, pricing context, and contact paths harder to interpret.</p>
            </article>
            <article>
              <span>04</span>
              <p>A clearer website helps both visitors and search systems find the right answer faster.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="ew-section ew-shell" aria-labelledby="implementation-title">
        <header className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">What Eidos Works implements</p>
            <h2 id="implementation-title">A practical foundation, built into the site.</h2>
          </div>
          <p>Each layer supports the next: readable pages, accurate signals, useful answers, accessible paths, and measurement that shows what is actually happening.</p>
        </header>

        <div className="ew-foundation-list">
          {foundations.map((foundation) => (
            <article key={foundation.title}>
              <span>{foundation.number}</span>
              <h3>{foundation.title}</h3>
              <p>{foundation.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ew-section ew-shell ew-honesty" aria-labelledby="honesty-title">
        <div>
          <p className="ew-eyebrow">What we do not promise</p>
          <h2 id="honesty-title">No invented certainty.</h2>
        </div>
        <p>
          No one can guarantee AI citations, rankings, or instant traffic. The goal is to build a cleaner foundation: pages that are useful, crawlable, understandable, and easier to trust.
        </p>
      </section>

      <section id="agentic-contact" className="ew-section ew-shell ew-contact" aria-labelledby="agentic-contact-title">
        <div className="ew-contact__intro">
          <p className="ew-eyebrow">Build a clearer discovery foundation</p>
          <h2 id="agentic-contact-title">Where is your website being misunderstood?</h2>
          <p>Share the site and the customers you want to reach. Eidos Works will help separate foundational improvements from noise.</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
