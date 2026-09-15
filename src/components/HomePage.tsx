import { SiteGallery } from './SiteGallery';
import { showcase, labUrl } from '../data/showcase';
import { articles } from '../data/articles';
import { ProjectTile } from './ShowcasePages';
import { LivingHero } from './LivingHero';
import { LiquidGlassSurface } from './LiquidGlassSurface';
export function HomePage() {
  return (
    <>
      <section className="ew-cinema" aria-labelledby="home-title">
        <LivingHero />
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
            <br className="ew-desktop-break" /> Eidos Works builds distinctive
            digital experiences, business systems, and focused AI tools for teams
            whose existing technology does not quite fit what they need.
          </p>
          <div className="ew-actions">
            <a className="ew-cinema-link ew-hero-glass" href="/friction-review">
              <LiquidGlassSurface variant="hero" />
              <span>Get a Friction Review</span> <span aria-hidden="true">→</span>
            </a>
            <a className="ew-button ew-button--light" href="/work">
              Explore the Work <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="ew-cinema-bottom ew-shell">
          <span>Designed with intention. Built to work.</span>
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
          <p className="ew-eyebrow">02 / Built around the problem</p>
          <h2>
            Beautiful on the surface.
            <br />
            <em>Capable underneath.</em>
          </h2>
          <p className="ew-section-lede">
            A customer journey that feels harder than it should. A workflow your
            team still manages by hand. An AI idea that needs real boundaries.
            Start with the friction; we’ll work backward to the right build.
          </p>
          <a className="ew-text-link" href="/services">
            See how we can help ↗
          </a>
        </div>
        <div className="ew-capability-list">
          {[
            [
              '01',
              'Digital Experiences',
              'Websites, interactive experiences, commerce journeys, and campaigns with a clear point of view.',
              '/services/digital-experiences',
            ],
            [
              '02',
              'Business Systems',
              'Dashboards, internal tools, workflow applications, and automation built around the way work actually happens.',
              '/services/business-systems',
            ],
            [
              '03',
              'Intelligent Systems',
              'Focused AI assistants, agentic workflows, and decision tools with clear boundaries and human control.',
              '/services/intelligent-systems',
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
        <p className="ew-eyebrow">Have something that almost works?</p>
        <h2>Show us the <em>friction.</em></h2>
        <p>
          Send us the website, workflow, process, or tool that keeps getting in
          the way. We’ll identify what we would change first.
        </p>
        <div className="ew-actions">
          <a className="ew-button ew-button--primary" href="/friction-review">
            Get a Friction Review →
          </a>
          <a className="ew-button ew-button--secondary" href="/contact">
            Start a Project ↗
          </a>
        </div>
        <p>Founded by Brent Parent in Central Florida.</p>
      </section>
    </>
  );
}
