import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  getActiveSponsors,
  getBreadcrumbs,
  getHasAffiliateTools,
  getToolsByCategory,
  resourceDownloads
} from '../../data/platform';
import type { Article, Relationship } from '../../data/platform';
import { contactMailto } from '../../utils';

export function PageHero({
  eyebrow,
  title,
  dek,
  actions,
  compact = false
}: {
  eyebrow: string;
  title: string;
  dek: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`platform-hero section-shell${compact ? ' platform-hero--compact' : ''}`} data-reveal>
      <div className="platform-hero__content">
        <p className="section-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="platform-hero__dek">{dek}</p>
        {actions ? <div className="platform-hero__actions">{actions}</div> : null}
      </div>
      <div className="platform-hero__panel" aria-label="Eidos Works platform focus">
        <span>Platform pillars</span>
        <ul>
          <li>Current UI/UX standards</li>
          <li>Agentic SEO and AI-search visibility</li>
          <li>Small-business automation systems</li>
          <li>Tools, checklists, and practical guides</li>
        </ul>
      </div>
    </section>
  );
}

export function Breadcrumbs({ path }: { path: string }) {
  const crumbs = getBreadcrumbs(path);

  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumbs section-shell" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.path}-${crumb.name}`}>
            {index === crumbs.length - 1 ? <span>{crumb.name}</span> : <a href={crumb.path}>{crumb.name}</a>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CardGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`platform-card-grid ${className}`.trim()}>{children}</div>;
}

export function PlatformCard({
  eyebrow,
  title,
  children,
  href,
  dataEvent
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  href?: string;
  dataEvent?: string;
}) {
  const body = (
    <>
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h3>{title}</h3>
      <div>{children}</div>
    </>
  );

  if (href) {
    return (
      <a className="platform-card platform-card--link" href={href} data-event={dataEvent}>
        {body}
      </a>
    );
  }

  return <article className="platform-card">{body}</article>;
}

export function SponsorUnit({ placement = 'inline' }: { placement?: string }) {
  const activeSponsors = getActiveSponsors();
  const sponsor = activeSponsors[0];

  if (!sponsor) return null;

  return (
    <aside className={`sponsor-unit sponsor-unit--${placement}`} aria-label="Sponsored resource">
      <span>{sponsor.label}</span>
      <h3>{sponsor.name}</h3>
      <p>{sponsor.description}</p>
      <a href={sponsor.url} rel="sponsored noopener noreferrer" target="_blank" data-event="sponsor_click">
        Visit partner resource
      </a>
    </aside>
  );
}

export function MonetizationDisclosure({ force = false }: { force?: boolean }) {
  const hasAffiliate = getHasAffiliateTools();

  if (!force && !hasAffiliate && getActiveSponsors().length === 0) return null;

  return (
    <aside className="disclosure-note">
      <strong>Disclosure</strong>
      <p>
        Sponsored placements are labeled. Affiliate relationships are only marked when a real partner link exists.
        Editorial recommendations remain independent.
      </p>
      <a href="/disclosures">Read the disclosure policy</a>
    </aside>
  );
}

export function NewsletterSignup({ context = 'newsletter page' }: { context?: string }) {
  const [status, setStatus] = useState<'idle' | 'not-configured'>('idle');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Connect Beehiiv, ConvertKit, Mailchimp, Buttondown, or a custom Worker endpoint.
    setStatus('not-configured');
  };

  return (
    <form className="newsletter-form" onSubmit={submit} data-event="newsletter_signup_submit" data-context={context}>
      <label htmlFor={`newsletter-email-${context.replace(/\s+/g, '-')}`}>Email address</label>
      <div>
        <input
          id={`newsletter-email-${context.replace(/\s+/g, '-')}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <button className="btn btn--primary" type="submit">
          Request access
        </button>
      </div>
      <p aria-live="polite">
        {status === 'not-configured'
          ? 'Newsletter provider is not configured yet, so no signup was submitted.'
          : 'No fake submission is sent until a real email provider is configured.'}
      </p>
    </form>
  );
}

export function ResourceDownloadGrid() {
  return (
    <CardGrid className="resource-grid">
      {resourceDownloads.map((resource) => (
        <PlatformCard key={resource.id} eyebrow="Resource placeholder" title={resource.title}>
          <p>{resource.description}</p>
          <button className="resource-placeholder" type="button" disabled data-event="resource_download">
            {resource.status}
          </button>
        </PlatformCard>
      ))}
    </CardGrid>
  );
}

function relationshipLabel(relationship: Relationship) {
  if (relationship === 'affiliate') return 'Affiliate';
  if (relationship === 'sponsored') return 'Sponsored';
  return 'Standard link';
}

function relationshipRel(relationship: Relationship) {
  return relationship === 'affiliate' || relationship === 'sponsored'
    ? 'sponsored noopener noreferrer'
    : 'noopener noreferrer';
}

export function RecommendedToolsGrid() {
  const groupedTools = useMemo(() => getToolsByCategory(), []);

  return (
    <div className="tool-stack-list">
      {Object.entries(groupedTools).map(([category, tools]) => (
        <section className="tool-category" key={category} aria-labelledby={`tool-category-${category.replace(/\W+/g, '-')}`}>
          <div>
            <span className="section-kicker">Category</span>
            <h2 id={`tool-category-${category.replace(/\W+/g, '-')}`}>{category}</h2>
          </div>
          <CardGrid>
            {tools.map((tool) => (
              <PlatformCard key={tool.id} eyebrow={relationshipLabel(tool.relationship)} title={tool.name}>
                <p>{tool.description}</p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel={relationshipRel(tool.relationship)}
                  data-event={tool.relationship === 'affiliate' ? 'affiliate_click' : undefined}
                >
                  Visit official site
                </a>
              </PlatformCard>
            ))}
          </CardGrid>
        </section>
      ))}
    </div>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <PlatformCard eyebrow={article.category} title={article.title} href={article.path} dataEvent="article_read_more">
      <p>{article.dek}</p>
      <small>Updated {article.updated}</small>
    </PlatformCard>
  );
}

export function SourceLinks({ sources }: { sources: Article['sources'] }) {
  return (
    <section className="article-sources" aria-labelledby="source-links">
      <h2 id="source-links">Source Links</h2>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkWithEidosCTA({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`work-cta section-shell${compact ? ' work-cta--compact' : ''}`} data-reveal>
      <div>
        <p className="section-kicker">Work With Eidos</p>
        <h2>Turn the diagnosis into a focused build.</h2>
        <p>
          Eidos still builds custom UI/UX systems, agentic SEO foundations, automation workflows, dashboards,
          and intelligence interfaces. The platform helps you decide what deserves attention first.
        </p>
      </div>
      <div className="work-cta__actions">
        <a className="btn btn--primary" href="/audit" data-event="audit_cta_click">
          Request an audit
        </a>
        <a className="btn btn--secondary" href={contactMailto}>
          Email Brent
        </a>
      </div>
    </section>
  );
}

export function PolicyBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="policy-block">
      <h2>{title}</h2>
      <div>{children}</div>
    </article>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ToolLinkRow() {
  return (
    <div className="tool-link-row" aria-label="Interactive tools">
      <a href="/tools/automation-score">Automation score</a>
      <a href="/tools/agentic-seo-readiness-checker">Agentic SEO checker</a>
      <a href="/tools/ui-ux-site-audit-checklist">UI/UX audit checklist</a>
    </div>
  );
}
