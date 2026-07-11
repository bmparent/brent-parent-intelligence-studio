import { useState } from 'react';
import type { MouseEvent } from 'react';
import {
  featuredArticle,
  getArticleSlugFromPath,
  getArticlesByCategory,
  insightCategories
} from '../data/articles';
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
  const selectedSlug = activeSlug ?? getArticleSlugFromPath(currentPath);
  const matches = getArticlesByCategory(category);
  const visibleArticles = category === 'All' ? matches.filter((article) => article.slug !== featuredArticle?.slug) : matches;

  const selectArticle = (event: MouseEvent<HTMLAnchorElement>, article: Article) => {
    if (!onSelectArticle) return;
    event.preventDefault();
    onSelectArticle(article);
  };

  return (
    <section id="insights" className="section-shell section-block insights insights-hub" aria-labelledby="insights-title">
      <header className="insights-hub__hero" data-reveal>
        <p className="eyebrow">Insights</p>
        <h1 id="insights-title">Practical notes on websites, storefronts, automation, and AI-ready search.</h1>
        <p>
          Insights from Eidos Works on building digital systems that are easier for customers to use, easier for
          teams to manage, and easier for search engines and AI assistants to understand.
        </p>
      </header>

      {featuredArticle ? (
        <article className="insights-hub__featured" aria-labelledby={`featured-${featuredArticle.slug}`} data-reveal>
          <div className="insights-hub__featured-label">
            <span>Start here</span>
            <span>{featuredArticle.category}</span>
          </div>
          <div>
            <h3 id={`featured-${featuredArticle.slug}`}>{featuredArticle.title}</h3>
            <p>{featuredArticle.description}</p>
            <div className="insights-hub__meta">
              <time dateTime={featuredArticle.updated}>{formatArticleDate(featuredArticle.updated)}</time>
              <span>{featuredArticle.readingTime}</span>
            </div>
          </div>
          <a
            className="insights-hub__link"
            href={featuredArticle.canonicalPath}
            aria-current={selectedSlug === featuredArticle.slug ? 'page' : undefined}
            onClick={(event) => selectArticle(event, featuredArticle)}
          >
            Read the guide <span aria-hidden="true">→</span>
          </a>
        </article>
      ) : null}

      <div className="insights-hub__browse" data-reveal>
        <div>
          <p className="eyebrow">Browse the library</p>
          <h3>Choose a topic or start with the latest practical guide.</h3>
        </div>
        <div className="insights-hub__filters" role="group" aria-label="Filter insights by category">
          {(['All', ...insightCategories] as const).map((option) => (
            <button
              type="button"
              className={category === option ? 'is-active' : undefined}
              aria-pressed={category === option}
              key={option}
              onClick={() => setCategory(option)}
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
                <div className="insights-hub__meta">
                  <span>{article.category}</span>
                  <span>{article.readingTime}</span>
                </div>
                <h3 id={`card-${article.slug}`}>{article.title}</h3>
                <p>{article.description}</p>
                <time dateTime={article.updated}>Updated {formatArticleDate(article.updated)}</time>
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
          No guides are published in this category yet. Choose another topic to keep browsing.
        </p>
      )}
    </section>
  );
}
