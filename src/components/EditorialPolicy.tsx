const policies = [
  {
    title: 'Topic selection',
    paragraphs: [
      'Insights focus on recurring Eidos Works work: website strategy, storefront UX, dashboards, automation, AI-ready search, and proof-stage prototyping. The goal is useful context, not volume for its own sake.',
      'Before publication, a new guide is compared with existing titles, questions, categories, and takeaways so it adds a distinct reason to read.'
    ]
  },
  {
    title: 'Sources and current claims',
    paragraphs: [
      'Time-sensitive claims are checked against current public sources. Official documentation, standards bodies, primary announcements, and first-party technical references are preferred when they are available.',
      'Source links appear with the article when outside facts or platform behavior shape the guidance. Eidos Works analysis is kept separate from what a source directly confirms.'
    ]
  },
  {
    title: 'Editorial technology',
    paragraphs: [
      'Editorial tools may assist research, drafting, validation, metadata, accessibility checks, feed generation, and publication QA. Assisted drafting is not represented as personal review unless that review actually happened.',
      'Published content is informational. High-stakes legal, medical, financial, security, and platform-specific decisions still require qualified review.'
    ]
  },
  {
    title: 'Corrections and updates',
    paragraphs: [
      'Material revisions receive an updated date and, when useful, a visible update note. If a source changes or no longer supports the article, the article should be revised or unpublished.',
      'Correction requests can be sent through the Contact page with the article URL, the issue, and the evidence that supports the correction.'
    ]
  }
];

export function EditorialPolicy() {
  return (
    <section className="ew-page-simple ew-shell ew-editorial-policy" aria-labelledby="editorial-policy-title">
      <header className="ew-editorial-policy__header">
        <p className="ew-eyebrow">Editorial policy</p>
        <h1 id="editorial-policy-title">How Eidos Works publishes Insights.</h1>
        <p>
          Practical guidance should be clear about what is known, what is interpreted, what has changed, and what a reader should verify before acting.
        </p>
      </header>

      <div className="ew-editorial-policy__grid">
        {policies.map((policy) => (
          <article key={policy.title}>
            <h2>{policy.title}</h2>
            {policy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
