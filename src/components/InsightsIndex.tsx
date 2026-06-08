import { useMemo, useState } from 'react';
import { articles } from '../data/articles';
import { SectionHeader } from './SectionHeader';

export function InsightsIndex() {
  const [activeSlug, setActiveSlug] = useState(articles[0]?.slug ?? '');
  const activeArticle = useMemo(() => articles.find((article) => article.slug === activeSlug) ?? articles[0], [activeSlug]);

  return (
    <section id="insights" className="section-shell section-block insights" aria-labelledby="insights-title">
      <SectionHeader
        id="insights-title"
        eyebrow="Insights"
        title="Weekly field notes on storefront UX, production systems, automation, and applied intelligence."
        summary="The insights area is set up for a daily or weekly publishing rhythm with structured article data, author metadata, updated dates, tags, and internal links back to the work."
      />

      <div className="insights-layout">
        <div className="article-list" aria-label="Article list">
          {articles.map((article) => (
            <button
              className={article.slug === activeSlug ? 'is-active' : ''}
              key={article.slug}
              type="button"
              aria-pressed={article.slug === activeSlug}
              onClick={() => setActiveSlug(article.slug)}
            >
              <span>{article.category}</span>
              <strong>{article.title}</strong>
              <small>
                {article.updated} - {article.readingTime}
              </small>
            </button>
          ))}
        </div>

        {activeArticle ? (
          <article className="article-detail" id={activeArticle.slug}>
            <div className="article-detail__meta">
              <span>{activeArticle.category}</span>
              <span>Updated {activeArticle.updated}</span>
              <span>{activeArticle.author}</span>
            </div>
            <h3>{activeArticle.title}</h3>
            <p className="article-detail__excerpt">{activeArticle.excerpt}</p>
            <div className="article-detail__tags" aria-label="Article tags">
              {activeArticle.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {activeArticle.body.map((section) => (
              <section key={section.heading}>
                <h4>{section.heading}</h4>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <div className="article-detail__links">
              <a href="#capabilities">Explore services</a>
              <a href="#work">View related work</a>
              <a href="#start">Start a project</a>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
