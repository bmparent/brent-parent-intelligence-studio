export function EditorialPolicy() {
  return (
    <section className="section-shell section-block editorial-policy" aria-labelledby="editorial-policy-title">
      <div className="section-header section-header--left" data-reveal>
        <p className="eyebrow">Editorial Policy</p>
        <h1 id="editorial-policy-title">How Eidos Works publishes Insights.</h1>
        <p>
          Eidos Works publishes practical articles about storefront UX, automation, AI-ready search, operations, media workflows,
          and applied interface systems. The goal is useful context, not volume for its own sake.
        </p>
      </div>

      <div className="policy-grid" data-reveal>
        <article>
          <h2>Topic selection</h2>
          <p>
            Topics are selected from recurring Eidos Works themes: UI/UX, InkSoft and storefront systems, production workflows,
            Cloudinary media systems, agentic search, structured data, practical automation, and Eidos Brain research context.
          </p>
          <p>
            Before a new article is published, it is compared against existing Insights content so the site does not repeat the same
            announcement, title pattern, search intent, or thesis without a meaningful reason.
          </p>
        </article>

        <article>
          <h2>Sourcing and current claims</h2>
          <p>
            Time-sensitive claims are checked against current public sources before publication. Official documentation, standards
            bodies, primary announcements, and first-party technical references are preferred when available.
          </p>
          <p>
            Each article includes visible source links when external facts, platform behavior, standards, or technical guidance shape
            the article. Eidos Works analysis is kept separate from confirmed source claims.
          </p>
        </article>

        <article>
          <h2>Editorial technology</h2>
          <p>
            Editorial technology may assist research, drafting, validation, metadata generation, accessibility checks, feed updates,
            and publication workflow. Assisted drafting does not mean a source was reviewed by Brent Parent unless that review actually
            happened.
          </p>
          <p>
            Published content is informational. Readers should independently verify high-stakes legal, medical, financial, security,
            or platform-specific decisions before acting.
          </p>
        </article>

        <article>
          <h2>Corrections and updates</h2>
          <p>
            Material updates should receive an updated date and, when needed, a correction or update note. If a source changes,
            becomes unavailable, or no longer supports the article's interpretation, the article should be revised or unpublished.
          </p>
          <p>
            Correction requests can be sent through the Start a Project contact path with the article URL, the issue, and the source
            or evidence that supports the correction.
          </p>
        </article>
      </div>
    </section>
  );
}
