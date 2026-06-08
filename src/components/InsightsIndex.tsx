import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { articles, getArticleSlugFromPath } from '../data/articles';
import { SectionHeader } from './SectionHeader';

type InsightsIndexProps = {
  initialSlug?: string;
};

export function InsightsIndex({ initialSlug }: InsightsIndexProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug ?? articles[0]?.slug ?? '');
  const activeArticle = useMemo(() => articles.find((article) => article.slug === activeSlug) ?? articles[0], [activeSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromPath = () => {
      const slug = getArticleSlugFromPath(window.location.pathname);
      if (slug) setActiveSlug(slug);
    };

    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  const selectArticle = (event: MouseEvent<HTMLAnchorElement>, slug: string, path: string) => {
    event.preventDefault();
    setActiveSlug(slug);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

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
            <a
              className={article.slug === activeSlug ? 'is-active' : ''}
              href={article.canonicalPath}
              key={article.slug}
              aria-current={article.slug === activeSlug ? 'true' : undefined}
              onClick={(event) => selectArticle(event, article.slug, article.canonicalPath)}
            >
              <span>{article.category}</span>
              <strong>{article.title}</strong>
              <small>
                {article.updated} - {article.readingTime}
              </small>
            </a>
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
