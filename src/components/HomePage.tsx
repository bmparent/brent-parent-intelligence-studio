import { SiteGallery } from './SiteGallery';
import { showcase, labUrl } from '../data/showcase';
import { articles } from '../data/articles';
import { ProjectTile } from './ShowcasePages';
export function HomePage() {
  return (
    <>
      <section className="ew-cinema" aria-labelledby="home-title">
        <img
          className="ew-cinema-art"
          src="/images/eidos-glass-hero.webp"
          alt=""
          width="1536"
          height="1024"
          fetchPriority="high"
        />
        <div className="ew-cinema-shade" />
        <div className="ew-shell ew-cinema-content">
          <p className="ew-eyebrow">
            <span className="ew-status-dot" /> Independent studio. Expansive
            possibilities.
          </p>
          <h1 id="home-title">
            Good ideas deserve
            <br />
            an <em>extraordinary</em>
            <br />
            digital life.
          </h1>
          <p className="ew-cinema-lede">
            Creative development. Intelligent systems. Human direction.
            <br className="ew-desktop-break" /> We turn ambitious ideas into
            websites and tools that work.
          </p>
          <div className="ew-actions">
            <a className="ew-button ew-button--light" href="/work">
              Explore the work <span aria-hidden="true">↗</span>
            </a>
            <a className="ew-cinema-link" href="/contact">
              Tell us what you’re imagining <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="ew-cinema-bottom ew-shell">
          <span>Designed with intention. Built with AI.</span>
          <a href="#selected-work">
            Scroll to explore <span aria-hidden="true">↓</span>
          </a>
          <span>Central Florida · Working everywhere</span>
        </div>
      </section>
      <section id="selected-work" className="ew-featured ew-shell">
        <div className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">01 / Selected work</p>
            <h2>A little of what’s possible.</h2>
          </div>
          <a className="ew-text-link" href="/work">
            View all projects ↗
          </a>
        </div>
        <div className="ew-project-grid">
          {showcase.slice(0, 2).map((project, index) => (
            <ProjectTile key={project.slug} project={project} index={index} />
          ))}
        </div>
        <div className="ew-work-footnote">
          <p>
            Public storefront recreations. The original stores are private and
            password-protected; these demos showcase their design and browsing
            experience.
          </p>
          <span>Art direction / Development / Commerce</span>
        </div>
      </section>
      <section className="ew-capability-section ew-shell">
        <div>
          <p className="ew-eyebrow">02 / Built around your idea</p>
          <h2>
            Beautiful on the surface.
            <br />
            <em>Capable underneath.</em>
          </h2>
          <p className="ew-section-lede">
            A campaign that feels like a film. A storefront that finally makes
            sense. A tool that takes the repetitive work off your plate. Let’s
            find the right way to build it.
          </p>
          <a className="ew-text-link" href="/services">
            How we can help ↗
          </a>
        </div>
        <div className="ew-capability-list">
          {[
            [
              '01',
              'Websites with a point of view',
              'Distinctive brands, cinematic campaigns, responsive experiences.',
              '/services/digital-experiences',
            ],
            [
              '02',
              'Commerce that feels effortless',
              'Custom storefronts, guided collections, thoughtful access systems.',
              '/services/storefront-access-systems',
            ],
            [
              '03',
              'Tools that do the heavy lifting',
              'Dashboards, connected workflows, focused AI assistance.',
              '/services/dashboards-workflow-tools',
            ],
          ].map(([n, title, body, href]) => (
            <a href={href} key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
      <section className="ew-lab-feature">
        <div className="ew-shell ew-lab-feature-grid">
          <div>
            <p className="ew-eyebrow">
              <span className="ew-status-dot" /> 03 / Inside the lab
            </p>
            <h2>
              Curiosity.
              <br />
              With the receipts.
            </h2>
            <p>
              Eidos / Sentinel Lab is where we explore what comes next. Inspect
              the experiments, follow the evidence, and see the questions we’re
              still working through.
            </p>
            <a
              className="ew-button ew-button--glass"
              href={labUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enter Sentinel Lab ↗
            </a>
            <small>
              Active research. Experimental results are not product guarantees.
            </small>
          </div>
          <a className="ew-lab-window" href="/lab">
            <div className="ew-window-bar">
              <span />
              <span />
              <span />
              <p>Eidos / Sentinel Lab</p>
              <span aria-hidden="true">↗</span>
            </div>
            <img
              src="/images/work/sentinel-lab.webp"
              width="1440"
              height="1000"
              alt="The Sentinel Lab interface, showing research controls and evidence status."
              loading="lazy"
            />
            <span className="ew-lab-caption">
              Explore the project and its current boundaries →
            </span>
          </a>
        </div>
      </section>
      <SiteGallery compact />
      <section className="ew-open-studio ew-shell">
        <div className="ew-section-heading">
          <div>
            <p className="ew-eyebrow">04 / An open studio</p>
            <h2>Good questions lead somewhere.</h2>
          </div>
          <a className="ew-text-link" href="/community">
            Join the conversation ↗
          </a>
        </div>
        <div className="ew-studio-columns">
          <a className="ew-question-invite" href="/community">
            <span className="ew-orbit-icon" aria-hidden="true">
              ✳
            </span>
            <h3>What are you trying to build?</h3>
            <p>
              Ask a question, share a challenge, or bring your assistant. Eidos
              is here to help you find a useful next step.
            </p>
            <span className="ew-text-link">Ask the community →</span>
          </a>
          <div className="ew-insight-list">
            {articles.slice(0, 2).map((article) => (
              <a key={article.slug} href={article.canonicalPath}>
                <span className="ew-eyebrow">{article.category}</span>
                <h3>{article.title}</h3>
                <span className="ew-text-link">Read the field note ↗</span>
              </a>
            ))}
            <a className="ew-text-link" href="/insights">
              All insights →
            </a>
          </div>
        </div>
      </section>
      <section className="ew-closing ew-shell">
        <p className="ew-eyebrow">Your idea. Our next favorite project.</p>
        <h2>
          What if we
          <br />
          <em>built it?</em>
        </h2>
        <a className="ew-button ew-button--primary" href="/contact">
          Start a conversation ↗
        </a>
        <p>Founded by Brent Parent in Central Florida.</p>
      </section>
    </>
  );
}
