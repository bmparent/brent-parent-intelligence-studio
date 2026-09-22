import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  articles,
  getArticleSlugFromPath,
  getArticlesByCategory,
  insightCategories
} from '../data/articles';
import '../styles/insights-publication.css';
import type { Article, InsightCategory } from '../data/articles';

export type InsightsHubProps = {
  currentPath?: string;
  activeSlug?: string;
  initialCategory?: InsightCategory | 'All';
  onSelectArticle?: (article: Article) => void;
};

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

export function InsightsHub({
  currentPath,
  activeSlug,
  initialCategory = 'All',
  onSelectArticle
}: InsightsHubProps) {
  const [category, setCategory] = useState<InsightCategory | 'All'>(initialCategory);
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  useEffect(() => {
    function read() {
      const params = new URLSearchParams(location.search), topic = params.get('topic');
      setCategory(insightCategories.includes(topic as InsightCategory) ? topic as InsightCategory : 'All');
      const q = (params.get('q') || '').slice(0, 160); setQuery(q); setDraftQuery(q);
    }
    read(); window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  function filter(nextCategory: InsightCategory | 'All', nextQuery: string) {
    const url = new URL(location.href);
    if (nextCategory === 'All') url.searchParams.delete('topic'); else url.searchParams.set('topic', nextCategory);
    if (nextQuery.trim()) url.searchParams.set('q', nextQuery.trim()); else url.searchParams.delete('q');
    history.pushState(null, '', url.pathname + url.search + url.hash);
    setCategory(nextCategory); setQuery(nextQuery.trim()); setDraftQuery(nextQuery.trim());
  }
  const featuredArticle = articles[0];
  const selectedSlug = activeSlug ?? getArticleSlugFromPath(currentPath);
  const matches = getArticlesByCategory(category).filter(article => [article.title, article.description, ...article.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
  const visibleArticles = category === 'All' && !query ? matches.filter((article) => article.slug !== featuredArticle?.slug) : matches;

  const selectArticle = (event: MouseEvent<HTMLAnchorElement>, article: Article) => {
    if (!onSelectArticle) return;
    event.preventDefault();
    onSelectArticle(article);
  };

  return (
    <section id="insights" className="section-shell section-block insights insights-hub" aria-labelledby="insights-title">
      <header className="insights-hub__hero" data-reveal>
        <p className="eyebrow">Insights</p>
        <h1 id="insights-title">Ideas for work that works.</h1>
        <p>
          Insights from Eidos Works on building digital systems that are easier for customers to use, easier for
          teams to manage, and easier for search engines and AI assistants to understand.
        </p>
      </header>

      {featuredArticle && category === 'All' && !query ? (
        <article className="insights-hub__featured" aria-labelledby={`featured-${featuredArticle.slug}`} data-reveal>
          <div className="insights-hub__featured-label">
            <span>Latest analysis</span>
            <span>{featuredArticle.category}</span>
            <img src={featuredArticle.ogImage} alt="" width="1200" height="630" />
          </div>
          <div>
            <h2 id={`featured-${featuredArticle.slug}`}>{featuredArticle.title}</h2>
            <p>{featuredArticle.description}</p>
            <div className="insights-hub__meta">
              <span>{featuredArticle.byline}</span>
              <time dateTime={featuredArticle.date}>Published {formatArticleDate(featuredArticle.date)}</time>
              <time dateTime={featuredArticle.updated}>Updated {formatArticleDate(featuredArticle.updated)}</time>
              <span>{featuredArticle.readingTime}</span>
            </div>
          </div>
          <a
            className="insights-hub__link"
            href={featuredArticle.canonicalPath}
            aria-current={selectedSlug === featuredArticle.slug ? 'page' : undefined}
            onClick={(event) => selectArticle(event, featuredArticle)}
          >
            Read the story <span aria-hidden="true">→</span>
          </a>
        </article>
      ) : null}

      {category === 'All' && !query && <div className="insights-secondary" aria-label="More current stories">
        {articles.slice(1, 3).map(article => <article key={article.slug}>
          <p className="eyebrow">{article.category} · {article.format === 'evergreen' || article.format === 'practical-guide' ? 'Guide' : 'Analysis'}</p>
          <h2><a href={article.canonicalPath} onClick={event => selectArticle(event, article)}>{article.title}</a></h2>
          <p>{article.description}</p>
          <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
        </article>)}
      </div>}

      <div className="insights-hub__browse" data-reveal>
        <div>
          <p className="eyebrow">Browse the library</p>
          <h2>Latest & useful guides</h2>
        </div>
        <form className="insights-search" role="search" onSubmit={event => { event.preventDefault(); filter(category, draftQuery); }}>
          <label htmlFor="insights-query">Search Insights</label>
          <div><input id="insights-query" type="search" maxLength={160} value={draftQuery} onChange={event => setDraftQuery(event.target.value)} placeholder="A task, topic or question" /><button type="submit">Search</button></div>
        </form>
        <div className="insights-hub__filters" role="group" aria-label="Filter insights by category">
          {(['All', ...insightCategories] as const).map((option) => (
            <button
              type="button"
              className={category === option ? 'is-active' : undefined}
              aria-pressed={category === option}
              key={option}
              onClick={() => filter(option, query)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {visibleArticles.length > 0 ? (
        <ul className="insights-hub__grid" aria-live="polite">
          {visibleArticles.map((article) => (
            <li key={article.slug}>
              <article className="insights-hub__card" aria-labelledby={`card-${article.slug}`}>
                <img className="insights-story-image" src={article.ogImage} alt="" loading="lazy" width="1200" height="630" />
                <div className="insights-hub__meta">
                  <span>{article.category}</span>
                  {(article.format === 'evergreen' || article.format === 'practical-guide') && <span>Guide</span>}
                  <span>{article.readingTime}</span>
                </div>
                <h3 id={`card-${article.slug}`}>{article.title}</h3>
                <p>{article.description}</p>
                <p className="insights-hub__byline">By {article.byline}</p>
                <div className="insights-hub__dates">
                  <time dateTime={article.date}>Published {formatArticleDate(article.date)}</time>
                  <time dateTime={article.updated}>Updated {formatArticleDate(article.updated)}</time>
                </div>
                <a
                  className="insights-hub__link"
                  href={article.canonicalPath}
                  aria-current={selectedSlug === article.slug ? 'page' : undefined}
                  onClick={(event) => selectArticle(event, article)}
                >
                  Read insight <span aria-hidden="true">→</span>
                </a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="insights-hub__empty" role="status">
          No stories match these filters. <button type="button" onClick={() => filter('All', '')}>Clear search and topic</button>
        </p>
      )}
    </section>
  );
}
