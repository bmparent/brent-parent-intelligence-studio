import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { articles, formatArticleDate, getArticleSlugFromPath, type Article } from '../data/articles';
import { SectionHeader } from './SectionHeader';

type InsightsIndexProps = {
  initialSlug?: string;
  standalone?: boolean;
};

const archiveStep = 9;

function uniqueCategories(items: Article[]) {
  return ['All', ...Array.from(new Set(items.map((article) => article.category)))];
}

function wordCount(article: Article) {
  return article.body.reduce((count, section) => {
    const paragraphs = section.paragraphs.join(' ');
    const bullets = section.bullets?.join(' ') ?? '';
    return count + `${section.heading} ${paragraphs} ${bullets}`.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
}

export function InsightsIndex({ initialSlug, standalone = false }: InsightsIndexProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug ?? articles[0]?.slug ?? '');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(archiveStep);

  const activeArticle = useMemo(() => articles.find((article) => article.slug === activeSlug) ?? articles[0], [activeSlug]);
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
  const categories = useMemo(() => uniqueCategories(articles), []);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return articles.filter((article) => {
      const categoryMatches = category === 'All' || article.category === category;
      const queryMatches =
        !normalizedQuery ||
        [article.title, article.description, article.excerpt, article.category, article.pillar, ...article.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return categoryMatches && queryMatches;
    });
  }, [category, query]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMoreArticles = visibleArticles.length < filteredArticles.length;

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
    if (!standalone && typeof window !== 'undefined') return;
    event.preventDefault();
    setActiveSlug(slug);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new Event('eidos:navigation'));
    }
  };

  const activeRelated = activeArticle?.relatedSlugs
    .map((slug) => articles.find((article) => article.slug === slug))
    .filter((article): article is Article => Boolean(article));
  const isArticleRoute = standalone && Boolean(initialSlug);

  return (
    <section id="insights" className={`section-shell section-block insights${standalone ? ' insights--standalone' : ''}`} aria-labelledby="insights-title">
      <SectionHeader
        id="insights-title"
        eyebrow="Insights"
        title="Field notes for storefront UX, automation, AI-ready search, and applied systems."
        summary="Insights is the Eidos Works knowledge hub: source-linked articles, original frameworks, practical guides, and strategy notes connected back to real service and proof surfaces."
        titleAs={standalone && !isArticleRoute ? 'h1' : 'h2'}
      />

      {featuredArticle ? (
        <article className="insights-feature" data-reveal>
          <div>
            <span>{featuredArticle.category}</span>
            <h2>{featuredArticle.title}</h2>
            <p>{featuredArticle.dek}</p>
          </div>
          <a href={featuredArticle.canonicalPath} onClick={(event) => selectArticle(event, featuredArticle.slug, featuredArticle.canonicalPath)}>
            Read featured insight
          </a>
        </article>
      ) : null}

      <div className="insights-controls" data-reveal>
        <label>
          <span>Search insights</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(archiveStep);
            }}
            placeholder="Search topics, platforms, or problems"
          />
        </label>
        <div className="insights-topic-nav" aria-label="Insight categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? 'is-active' : ''}
              onClick={() => {
                setCategory(item);
                setVisibleCount(archiveStep);
              }}
              aria-pressed={item === category}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="insights-layout">
        <div className="article-list" aria-label="Article list">
          {visibleArticles.length ? (
            visibleArticles.map((article) => (
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
                  {formatArticleDate(article.publishedAt)} - {article.readingTimeMinutes} min read
                </small>
              </a>
            ))
          ) : (
            <div className="article-empty-state">
              <strong>No matching Insights yet.</strong>
              <p>Try a broader term or clear the category filter.</p>
            </div>
          )}

          {hasMoreArticles ? (
            <button className="archive-more" type="button" onClick={() => setVisibleCount((count) => count + archiveStep)}>
              Show more insights
            </button>
          ) : null}
        </div>

        {activeArticle ? (
          <article className="article-detail" id={activeArticle.slug}>
            <div className="article-detail__meta">
              <span>{activeArticle.category}</span>
              <span>Published {formatArticleDate(activeArticle.publishedAt)}</span>
              <span>Updated {formatArticleDate(activeArticle.updatedAt)}</span>
              <span>{activeArticle.byline}</span>
              <span>{activeArticle.readingTimeMinutes} min read</span>
            </div>
            {isArticleRoute ? <h1>{activeArticle.title}</h1> : <h2>{activeArticle.title}</h2>}
            <p className="article-detail__excerpt">{activeArticle.dek}</p>
            <div className="article-detail__tags" aria-label="Article tags">
              {activeArticle.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            {activeArticle.takeaways?.length ? (
              <section className="article-callout" aria-labelledby={`${activeArticle.slug}-takeaways`}>
                <h3 id={`${activeArticle.slug}-takeaways`}>Key takeaways</h3>
                <ul>
                  {activeArticle.takeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {activeArticle.body.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets?.length ? (
                  <ul>
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="article-sources" aria-labelledby={`${activeArticle.slug}-sources`}>
              <h3 id={`${activeArticle.slug}-sources`}>Sources</h3>
              <ul>
                {activeArticle.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer noopener">
                      {source.title}
                    </a>
                    <span>
                      {source.publisher}
                      {source.publishedDate !== 'unknown' ? ` - ${source.publishedDate}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {activeRelated.length ? (
              <section className="article-related" aria-labelledby={`${activeArticle.slug}-related`}>
                <h3 id={`${activeArticle.slug}-related`}>Related Insights</h3>
                <div>
                  {activeRelated.map((article) => (
                    <a key={article.slug} href={article.canonicalPath} onClick={(event) => selectArticle(event, article.slug, article.canonicalPath)}>
                      <span>{article.category}</span>
                      <strong>{article.title}</strong>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="article-detail__links">
              <a href={activeArticle.cta.href}>{activeArticle.cta.label}</a>
              <a href="/editorial-policy">Editorial policy</a>
              <span>{wordCount(activeArticle).toLocaleString()} words</span>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
