import { useState } from 'react';
import { showcase, labUrl, type ShowcaseProject } from '../data/showcase';
export function ProjectTile({
  project,
  index = 0,
}: {
  project: ShowcaseProject;
  index?: number;
}) {
  return (
    <article className="ew-project-tile">
      <a href={project.href}>
        <div className={`ew-project-image ew-project-image--${project.slug}`}>
          <img
            src={project.image}
            alt={project.alt}
            width="1200"
            height="760"
            loading="lazy"
          />
          <span className="ew-project-open" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="ew-project-meta">
          <span>
            {String(index + 1).padStart(2, '0')} / {project.status}
          </span>
          <span>{project.category}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </a>
    </article>
  );
}
export function ShowcasePage() {
  const [filter, setFilter] = useState('All work');
  const projects = showcase.filter(
    (project) => filter === 'All work' || project.category === filter,
  );
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <p className="ew-eyebrow">The portfolio</p>
        <h1>
          Ideas, made <em>real.</em>
        </h1>
        <p>
          Immersive storefronts. Useful systems. Experiments with something to
          teach us. Explore the range, and imagine what comes next.
        </p>
      </section>
      <section
        className="ew-shell ew-work-collection"
        aria-label="Project collection"
      >
        <div
          className="ew-filter-bar"
          role="group"
          aria-label="Filter projects"
        >
          {['All work', 'Storefronts', 'Systems', 'Experiments'].map(
            (label) => (
              <button
                key={label}
                type="button"
                aria-pressed={filter === label}
                onClick={() => setFilter(label)}
              >
                {label}
              </button>
            ),
          )}
        </div>
        <p className="ew-sr-only" role="status">
          {projects.length} projects shown
        </p>
        <div className="ew-project-grid">
          {projects.map((project, index) => (
            <ProjectTile key={project.slug} project={project} index={index} />
          ))}
        </div>
        <div className="ew-collection-note">
          <h2>More than the first impression.</h2>
          <p>
            Explore the{' '}
            <a href="/work/production-dashboard">
              production reporting case study
            </a>{' '}
            for a look at the operational side of the work.
          </p>
          <p>
            Storefront work includes contributions within Data Graphics’
            client-services workflow. Brand identities and artwork belong to
            their respective owners. Design references are labeled; protected
            stores remain private.
          </p>
        </div>
      </section>
      <BuildCTA />
    </>
  );
}
export function StorefrontShowcase({ slug }: { slug: string }) {
  const project = showcase.find((item) => item.slug === slug) ?? showcase[0];
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <a className="ew-text-link" href="/work">
          ← Selected work
        </a>
        <p className="ew-eyebrow">{project.status} / InkSoft</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </section>
      <figure className="ew-showcase-hero ew-shell">
        <img src={project.image} width="1500" height="940" alt={project.alt} />
        <figcaption>
          Saved project artwork and design reference. This is a static portfolio
          presentation, not a live view of the protected store.
        </figcaption>
      </figure>
      <section className="ew-showcase-story ew-shell">
        <div>
          <p className="ew-eyebrow">The thinking behind the experience</p>
          <h2>A storefront with a sense of occasion.</h2>
          <p>
            The entrance sets the mood, makes the collection easy to understand,
            and gives shoppers a clear way forward. Cinematic artwork does the
            storytelling; real HTML controls provide navigation and accessible
            actions.
          </p>
          <h3>How it was built</h3>
          <p>
            The custom experience fits inside InkSoft’s hosted storefront.
            Scoped styles and responsive layout rules shape the header, hero,
            and collection paths while the platform continues to own product
            selection, cart, accounts, and checkout.
          </p>
          <p>
            Layouts need to accommodate narrow screens, landscape phones, long
            labels, and the platform’s existing markup. Static imagery is paired
            with live controls rather than making the whole interface a picture.
          </p>
        </div>
        <aside>
          <p className="ew-eyebrow">Focus</p>
          <ul>
            {project.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <p className="ew-role-disclosure">
            <strong>Role disclosure</strong> Storefront design and
            implementation work within Data Graphics’ client-services workflow.
            No direct Disney engagement, endorsement, or ownership of brand
            assets is claimed.
          </p>
          <p className="ew-form-note">
            No measured conversion or revenue uplift is claimed. Public access
            to the protected store is not required to explore this case study.
          </p>
        </aside>
      </section>
      <BuildCTA />
    </>
  );
}
export function LabPage() {
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <p className="ew-eyebrow">Eidos / Sentinel Lab</p>
        <h1>
          Explore. Test.
          <br />
          <em>Show the evidence.</em>
        </h1>
        <p>
          A working research space for streaming prediction, surprise, and human
          review. Follow the engineering and inspect the boundaries of what has
          been demonstrated.
        </p>
        <a
          className="ew-button ew-button--primary"
          href={labUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the live lab ↗
        </a>
      </section>
      <figure className="ew-showcase-hero ew-shell">
        <a href={labUrl} target="_blank" rel="noopener noreferrer">
          <img
            src="/images/work/sentinel-lab.webp"
            width="1440"
            height="1000"
            alt="Sentinel Lab’s experiment interface and evidence reporting."
          />
        </a>
        <figcaption>
          Interface capture. The live Vercel application is the source for
          current experiment status.
        </figcaption>
      </figure>
      <section className="ew-lab-details ew-shell">
        <div>
          <p className="ew-eyebrow">A separate place to experiment</p>
          <h2>Research, in the open.</h2>
          <p>
            The lab runs on its existing Vercel deployment. Opening it takes you
            into the research application; the public Eidos assistant does not
            operate its experiments.
          </p>
        </div>
        <div>
          <h3>What to look for</h3>
          <ul>
            <li>
              The distinction between synthetic engineering tests and research
              evidence.
            </li>
            <li>
              Visible evidence gates, blocked runs, and remaining questions.
            </li>
            <li>
              A record of what was attempted and what the result supports.
            </li>
          </ul>
          <a className="ew-text-link" href="/lab/eidos-brain">
            Read the research background →
          </a>
          <p className="ew-form-note">
            Experimental work is not a validated production AI product. Current
            results and limitations are documented in the lab.
          </p>
        </div>
      </section>
      <BuildCTA />
    </>
  );
}
export function BuildCTA() {
  return (
    <section className="ew-build-cta">
      <div className="ew-shell">
        <h2>Have something in mind?</h2>
        <a className="ew-button ew-button--light" href="/contact">
          Let’s talk about it ↗
        </a>
      </div>
    </section>
  );
}
