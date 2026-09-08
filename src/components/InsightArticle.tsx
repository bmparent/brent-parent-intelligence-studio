import type { MouseEvent } from 'react';
import { SaveArticle } from './MemberPages';
import { getArticleBySlug, getArticleSlugFromPath } from '../data/articles';

export type InsightArticleProps = {
  currentPath?: string;
  slug?: string;
  onBack?: () => void;
};

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

export function InsightArticle({ currentPath, slug, onBack }: InsightArticleProps) {
  const resolvedSlug = slug ?? getArticleSlugFromPath(currentPath);
  const article = getArticleBySlug(resolvedSlug);

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onBack) return;
    event.preventDefault();
    onBack();
  };

  if (!article) {
    return (
      <section className="section-shell section-block insight-article insight-article--missing" aria-labelledby="insight-missing-title">
        <p className="eyebrow">Insights</p>
        <h1 id="insight-missing-title">That insight could not be found.</h1>
        <p>The guide may have moved, or the address may be incomplete.</p>
        <a className="insights-hub__link" href="/insights" onClick={goBack}>
          Browse all insights <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }

  const relatedArticles = article.relatedSlugs
    .map((relatedSlug) => getArticleBySlug(relatedSlug))
    .filter((relatedArticle) => Boolean(relatedArticle));

  return (
    <section className="section-shell section-block insight-article" id={article.slug} aria-labelledby={`${article.slug}-title`}>
      <nav className="insight-article__breadcrumb" aria-label="Breadcrumb">
        <a href="/">Eidos Works</a>
        <span aria-hidden="true">/</span>
        <a href="/insights" onClick={goBack}>Insights</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>

      <article className="article-detail">
        <header className="insight-article__header">
          <p className="eyebrow">{article.category}</p>
          <h1 id={`${article.slug}-title`}>{article.title}</h1>
          <p className="article-detail__excerpt">{article.excerpt}</p>
          <div className="article-detail__meta">
            <span>By {article.byline}</span>
            <time dateTime={article.publishedAt}>Published {formatArticleDate(article.date)}</time>
            {article.updated !== article.date ? (
              <time dateTime={article.updatedAt}>Updated {formatArticleDate(article.updated)}</time>
            ) : null}
            <span>{article.readingTime}</span>
          </div>
          <div className="article-detail__tags" role="list" aria-label="Topics covered">
            {article.tags.map((tag) => (
              <span role="listitem" key={tag}>{tag}</span>
            ))}
          </div>
        </header>
        <SaveArticle slug={article.slug} />

        <aside className="insight-article__takeaways" aria-labelledby={`${article.slug}-takeaways`}>
          <h2 id={`${article.slug}-takeaways`}>Practical takeaways</h2>
          <ul>
            {article.practicalTakeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </aside>

        <div className="insight-article__body">
          {article.body.map((section) => (
            <section key={section.heading} aria-labelledby={`${article.slug}-${toId(section.heading)}`}>
              <h2 id={`${article.slug}-${toId(section.heading)}`}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {article.correctionNote ? (
          <aside className="insight-article__correction" aria-label="Correction or update note">
            <strong>Update note</strong>
            <p>{article.correctionNote}</p>
          </aside>
        ) : null}

        <section className="insight-article__sources" aria-labelledby={`${article.slug}-sources`}>
          <p className="eyebrow">Sources and references</p>
          <h2 id={`${article.slug}-sources`}>What informed this guide</h2>
          <ol>
            {article.sources.map((source) => (
              <li key={`${source.url}-${source.title}`}>
                <a href={source.url} rel="noreferrer">
                  {source.title}
                </a>
                <span>{source.publisher}</span>
              </li>
            ))}
          </ol>
        </section>

        {relatedArticles.length ? (
          <section className="insight-article__related" aria-labelledby={`${article.slug}-related`}>
            <p className="eyebrow">Continue with</p>
            <h2 id={`${article.slug}-related`}>Related practical guides</h2>
            <div>
              {relatedArticles.map((relatedArticle) => relatedArticle ? (
                <a href={relatedArticle.canonicalPath} key={relatedArticle.slug}>
                  <span>{relatedArticle.category}</span>
                  <strong>{relatedArticle.title}</strong>
                </a>
              ) : null)}
            </div>
          </section>
        ) : null}

        <footer className="insight-article__footer">
          <div>
            <p className="eyebrow">A clearer next step</p>
            <h2>Turn the useful ideas into a practical plan for your site.</h2>
            <p>Bring the current website, the problem you want to solve, and any constraints already in place.</p>
          </div>
          <div className="article-detail__links">
            <a href={article.cta.href}>{article.cta.label}</a>
            <a href="/snapshot">Get an Eidos Snapshot</a>
            <a href="/insights" onClick={goBack}>Browse more insights</a>
          </div>
        </footer>
      </article>
    </section>
  );
}

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
