import { articles, getArticleByPath, getRelatedArticles, siteConfig } from '../../data/platform';
import { Capabilities } from '../../sections/Capabilities';
import { CaseStudies } from '../../sections/CaseStudies';
import { ProjectGallery } from '../../sections/ProjectGallery';
import { ProductionIntelligence } from '../../sections/ProductionIntelligence';
import { EidosBrain } from '../../sections/EidosBrain';
import { Process } from '../../sections/Process';
import { ContactCTA } from '../../sections/ContactCTA';
import { IntelligenceStudioAgent } from '../ui/IntelligenceStudioAgent';
import {
  ArticleCard,
  CardGrid,
  MonetizationDisclosure,
  NewsletterSignup,
  PageHero,
  PlatformCard,
  PolicyBlock,
  RecommendedToolsGrid,
  ResourceDownloadGrid,
  SourceLinks,
  SponsorUnit,
  ToolLinkRow,
  WorkWithEidosCTA
} from './Shared';
import {
  AgenticSeoReadinessTool,
  AutomationScoreTool,
  ToolSupportSection,
  UiUxAuditChecklistTool
} from './Tools';

function articleGroup(category: 'UI/UX' | 'Agentic SEO' | 'Automation') {
  return articles.filter((article) => article.category === category);
}

function PlatformIntro() {
  return (
    <section className="section-shell platform-intro" data-reveal>
      <article>
        <p className="section-kicker">Strategic direction</p>
        <h2>A premium intelligence hub first, a service brochure second.</h2>
      </article>
      <article>
        <h3>Editorial platform</h3>
        <p>
          Guides, checklists, diagnostics, and implementation judgment for teams trying to make modern
          websites work better in public search, AI-assisted search, and real operations.
        </p>
      </article>
      <article>
        <h3>Revenue surfaces</h3>
        <p>
          Sponsorships, resource cards, and tool recommendations are designed as clearly labeled,
          trust-preserving layers. No popups, fake partner links, or intrusive ad mechanics.
        </p>
      </article>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="Eidos Works"
        title="Practical intelligence for better websites and smarter operations."
        dek="A searchable platform for current UI/UX standards, agentic SEO, AI-search visibility, and small-business automation systems by Brent Parent."
        actions={
          <>
            <a className="btn btn--primary" href="/intelligence">
              Read intelligence
            </a>
            <a className="btn btn--secondary" href="/tools">
              Run a diagnostic
            </a>
          </>
        }
      />
      <PlatformIntro />
      <section className="section-shell platform-feature-band" data-reveal>
        <div>
          <p className="section-kicker">Start here</p>
          <h2>Three ways into the platform.</h2>
        </div>
        <CardGrid>
          <PlatformCard eyebrow="Editorial" title="Current UI/UX standards" href="/intelligence/ui-ux-standards-2026">
            <p>Accessibility-first design, tokenized systems, semantic content, and performance as product quality.</p>
          </PlatformCard>
          <PlatformCard eyebrow="AI Search" title="Agentic SEO guide" href="/intelligence/agentic-seo-guide">
            <p>Build websites that remain useful to humans while becoming easier for answer engines to cite.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Tools" title="Automation score" href="/tools/automation-score">
            <p>Find where manual work, missed follow-up, and disconnected tools are costing the most attention.</p>
          </PlatformCard>
        </CardGrid>
      </section>
      <IntelligenceStudioAgent />
      <Capabilities />
      <CaseStudies />
      <ProjectGallery />
      <ProductionIntelligence />
      <EidosBrain />
      <Process />
      <ContactCTA />
    </>
  );
}

export function IntelligenceIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Intelligence"
        title="Guides for modern websites, AI search, and automation."
        dek="A structured library of practical implementation guidance for teams that need clear decisions, not trend noise."
        compact
      />
      <section className="section-shell" data-reveal>
        <CardGrid>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </CardGrid>
      </section>
      <SponsorUnit placement="library" />
      <WorkWithEidosCTA compact />
    </>
  );
}

export function TopicPage({ topic }: { topic: 'ui-ux' | 'agentic-seo' | 'automation' }) {
  const copy = {
    'ui-ux': {
      eyebrow: 'UI/UX',
      title: 'Accessible, component-driven design for current web expectations.',
      dek:
        'Interface guidance for premium websites that need to feel sharp while staying readable, semantic, performant, and usable.',
      articles: articleGroup('UI/UX')
    },
    'agentic-seo': {
      eyebrow: 'Agentic SEO',
      title: 'AI-search visibility without hype or shortcut promises.',
      dek:
        'Practical SEO, structured data, crawler policy, and agent-friendly UX for websites that want to be discoverable and source-worthy.',
      articles: articleGroup('Agentic SEO')
    },
    automation: {
      eyebrow: 'Automation',
      title: 'Small-business automation that removes real operational drag.',
      dek:
        'Examples and diagnostics for teams stuck between spreadsheets, missed follow-up, disconnected tools, and repeated owner tasks.',
      articles: articles.filter((article) => ['agentic-seo-guide', 'seo-for-ai-browsers'].includes(article.slug))
    }
  }[topic];

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.title} dek={copy.dek} compact />
      <section className="section-shell platform-feature-band" data-reveal>
        <div>
          <p className="section-kicker">Field Notes</p>
          <h2>Useful reads for this track.</h2>
        </div>
        <CardGrid>
          {copy.articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </CardGrid>
      </section>
      <section className="section-shell topic-principles" data-reveal>
        <div>
          <p className="section-kicker">Operating principles</p>
          <h2>How Eidos approaches this work.</h2>
        </div>
        <CardGrid>
          <PlatformCard title="Evidence before claims">
            <p>Recommendations should be tied to visible page structure, measured workflow friction, or a concrete audit finding.</p>
          </PlatformCard>
          <PlatformCard title="Systems over one-off fixes">
            <p>The best improvements create reusable patterns: tokens, templates, forms, dashboards, checklists, and routing logic.</p>
          </PlatformCard>
          <PlatformCard title="Trust-preserving monetization">
            <p>Revenue surfaces are labeled, quiet, and secondary to the reader task. No intrusive ads or fake affiliate links.</p>
          </PlatformCard>
        </CardGrid>
      </section>
      <WorkWithEidosCTA compact />
    </>
  );
}

export function ArticlePage({ path }: { path: string }) {
  const article = getArticleByPath(path);

  if (!article) return <NotFoundPage />;

  const related = getRelatedArticles(article);

  return (
    <article className="article-page section-shell" data-reveal>
      <header className="article-header">
        <p className="section-kicker">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="article-dek">{article.dek}</p>
        <div className="article-meta">
          <span>Updated {article.updated}</span>
          <span>By {article.author}</span>
        </div>
      </header>

      <aside className="article-toc" aria-labelledby="table-of-contents">
        <h2 id="table-of-contents">Table of Contents</h2>
        <ol>
          {article.sections.map((section) => (
            <li key={section.heading}>
              <a href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{section.heading}</a>
            </li>
          ))}
        </ol>
      </aside>

      <section className="key-takeaways" aria-labelledby="key-takeaways">
        <h2 id="key-takeaways">Key Takeaways</h2>
        <ul>
          {article.takeaways.map((takeaway) => (
            <li key={takeaway}>{takeaway}</li>
          ))}
        </ul>
      </section>

      <div className="article-layout">
        <div className="article-body">
          {article.sections.map((section) => {
            const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <section key={section.heading} id={id}>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.table ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {section.table.headers.map((header) => (
                            <th key={header} scope="col">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row.join('-')}>
                            {row.map((cell) => (
                              <td key={cell}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {section.example ? <pre><code>{section.example}</code></pre> : null}
              </section>
            );
          })}
          <SourceLinks sources={article.sources} />
          <MonetizationDisclosure />
        </div>
        <aside className="article-sidebar" aria-label="Article sidebar">
          <NewsletterSignup context={`article ${article.slug}`} />
          <SponsorUnit placement="article" />
          <ToolLinkRow />
        </aside>
      </div>

      <section className="related-articles" aria-labelledby="related-articles">
        <h2 id="related-articles">Related Articles</h2>
        <CardGrid>
          {related.map((relatedArticle) => (
            <ArticleCard key={relatedArticle.slug} article={relatedArticle} />
          ))}
        </CardGrid>
      </section>

      <WorkWithEidosCTA compact />
    </article>
  );
}

export function ToolsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Tools"
        title="Diagnostics that turn vague website problems into decisions."
        dek="Simple client-side calculators for automation drag, AI-search readiness, and UI/UX site quality."
        compact
      />
      <section className="section-shell" data-reveal>
        <CardGrid>
          <PlatformCard eyebrow="Calculator" title="Automation Score" href="/tools/automation-score">
            <p>Score manual data entry, missed lead response, disconnected tools, billing follow-up, and owner-task load.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Checklist" title="Agentic SEO Readiness Checker" href="/tools/agentic-seo-readiness-checker">
            <p>Check crawlability, sitemap/robots, canonicals, schema, article structure, performance, and accessibility.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Checklist" title="UI/UX Site Audit Checklist" href="/tools/ui-ux-site-audit-checklist">
            <p>Audit navigation, hierarchy, contrast, mobile behavior, form semantics, trust, and monetization restraint.</p>
          </PlatformCard>
        </CardGrid>
      </section>
      <WorkWithEidosCTA compact />
    </>
  );
}

export function ToolPage({ path }: { path: string }) {
  if (path === '/tools/automation-score') {
    return (
      <>
        <AutomationScoreTool />
        <ToolSupportSection />
      </>
    );
  }

  if (path === '/tools/agentic-seo-readiness-checker') {
    return (
      <>
        <AgenticSeoReadinessTool />
        <ToolSupportSection />
      </>
    );
  }

  if (path === '/tools/ui-ux-site-audit-checklist') {
    return (
      <>
        <UiUxAuditChecklistTool />
        <ToolSupportSection />
      </>
    );
  }

  return <ToolsIndexPage />;
}

export function NewsletterPage() {
  return (
    <>
      <PageHero
        eyebrow="Newsletter"
        title="Field notes for better sites and smarter systems."
        dek="A quiet newsletter for UI/UX standards, AI-search visibility, automation patterns, useful tools, and Eidos build notes."
        compact
      />
      <section className="section-shell newsletter-layout" data-reveal>
        <div>
          <h2>What it will cover</h2>
          <ul>
            <li>Current UI/UX standards and practical site teardown notes.</li>
            <li>Agentic SEO, AI search visibility, and crawler-policy changes.</li>
            <li>Small-business automation examples that remove real manual work.</li>
            <li>Tool comparisons, templates, checklists, and implementation receipts.</li>
          </ul>
        </div>
        <NewsletterSignup context="newsletter page" />
      </section>
      <SponsorUnit placement="newsletter" />
    </>
  );
}

export function ResourcesPage({ variant = 'index' }: { variant?: 'index' | 'tool-stack' | 'templates' | 'recommended-tools' }) {
  if (variant === 'tool-stack' || variant === 'recommended-tools') {
    return (
      <>
        <PageHero
          eyebrow={variant === 'tool-stack' ? 'Tool Stack' : 'Recommended Tools'}
          title="A transparent resource stack with relationship labels."
          dek="Normal outbound links are used until real affiliate or sponsor relationships exist. No fake partner URLs are present."
          compact
        />
        <section className="section-shell" data-reveal>
          <MonetizationDisclosure force={variant === 'recommended-tools'} />
          <RecommendedToolsGrid />
        </section>
      </>
    );
  }

  if (variant === 'templates') {
    return (
      <>
        <PageHero
          eyebrow="Templates"
          title="Downloadable resources, staged honestly."
          dek="The resource surfaces are ready, but PDF files are placeholders until final assets are prepared."
          compact
        />
        <section className="section-shell" data-reveal>
          <ResourceDownloadGrid />
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Checklists, tool stacks, and implementation resources."
        dek="A practical resource library for better public websites, AI-search visibility, and automation decisions."
        compact
      />
      <section className="section-shell" data-reveal>
        <CardGrid>
          <PlatformCard eyebrow="Tools" title="Tool Stack" href="/resources/tool-stack">
            <p>Recommended design, SEO, analytics, hosting, automation, research, and accessibility tools.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Templates" title="Checklists and scorecards" href="/resources/templates">
            <p>Placeholder download surfaces for the Eidos resource library until final PDFs are prepared.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Transparency" title="Recommended Tools" href="/resources/recommended-tools">
            <p>A central tool list with relationship labels and no invented affiliate relationships.</p>
          </PlatformCard>
        </CardGrid>
      </section>
    </>
  );
}

export function SponsorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sponsors"
        title="Partner resources, only when clearly labeled."
        dek="Sponsor slots are built into the platform architecture, but inactive placeholder sponsors are hidden from public pages."
        compact
      />
      <section className="section-shell policy-stack" data-reveal>
        <PolicyBlock title="Current status">
          <p>No active sponsor placements are configured. Placeholder sponsor data remains inactive until a real partner is approved.</p>
        </PolicyBlock>
        <PolicyBlock title="Placement standard">
          <p>
            Sponsors may appear as small resource cards in article sidebars, article footers, resource pages, or newsletters.
            They are never popups, autoplay units, sticky bottom bars, tracking pixels, or interstitials.
          </p>
        </PolicyBlock>
      </section>
    </>
  );
}

export function AdvertisePage() {
  return (
    <>
      <PageHero
        eyebrow="Advertise"
        title="Tasteful sponsorships for builders and operators."
        dek="Eidos Works is built for founders, designers, developers, marketers, small-business operators, and practitioners working on AI/search and automation systems."
        compact
      />
      <section className="section-shell policy-stack" data-reveal>
        <PolicyBlock title="Sponsorship types">
          <ul>
            <li>Newsletter sponsorship</li>
            <li>Guide sponsorship</li>
            <li>Resource card</li>
            <li>Tool sponsor</li>
            <li>Report sponsor</li>
          </ul>
        </PolicyBlock>
        <PolicyBlock title="What Eidos will not run">
          <p>
            No intrusive ads, fake endorsements, popups, auto-play video ads, interstitials, or bottom sticky ad bars.
            Sponsor surfaces must be useful to the reader and clearly labeled.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Contact">
          <p>Use the work inquiry path and include audience fit, placement type, and the exact resource being proposed.</p>
          <a className="btn btn--primary" href="/work-with-eidos">
            Contact Eidos
          </a>
        </PolicyBlock>
      </section>
    </>
  );
}

export function DisclosuresPage() {
  return (
    <>
      <PageHero
        eyebrow="Disclosures"
        title="Affiliate and sponsorship disclosure."
        dek="A plain-English policy for how Eidos Works handles affiliate links, sponsorships, and editorial independence."
        compact
      />
      <section className="section-shell policy-stack" data-reveal>
        <PolicyBlock title="Affiliate links">
          <p>
            Eidos Works may earn commissions from affiliate links in the future. Affiliate-enabled tools will only be
            marked as affiliate when a real relationship and real link exist.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Sponsored placements">
          <p>
            Sponsored placements are labeled as sponsored or partner resources. They do not change the editorial
            standard, and they are not allowed to interrupt the reader task.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Editorial standard">
          <p>
            Editorial recommendations are not sold unless they are clearly marked. Practical usefulness, trust,
            accessibility, and evidence stay ahead of monetization.
          </p>
        </PolicyBlock>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy posture for a lightweight public platform."
        dek="Eidos Works is designed to stay useful without privacy-invasive tracking by default."
        compact
      />
      <section className="section-shell policy-stack" data-reveal>
        <PolicyBlock title="Forms">
          <p>
            Newsletter and inquiry forms are prepared for future provider configuration. Until a real provider is
            connected, newsletter submissions do not send data anywhere.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Analytics">
          <p>
            Analytics event hooks and data attributes exist for future measurement, but no privacy-invasive tracking
            provider is added by default.
          </p>
        </PolicyBlock>
        <PolicyBlock title="External links">
          <p>
            External tools and source links open directly to their official sites. Sponsored or affiliate links will
            be labeled when configured.
          </p>
        </PolicyBlock>
      </section>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Use Eidos resources as decision support, not guarantees."
        dek="The site provides educational guidance, diagnostics, and service context. It does not promise rankings, traffic, revenue, or automation outcomes."
        compact
      />
      <section className="section-shell policy-stack" data-reveal>
        <PolicyBlock title="Editorial resources">
          <p>
            Articles, checklists, and tools are practical guidance. They should be validated against your site,
            business process, and current platform constraints before implementation.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Interactive tools">
          <p>
            Scores are lightweight diagnostics based on the answers selected in the browser. They are not a substitute
            for a full audit, accessibility review, technical SEO crawl, or workflow analysis.
          </p>
        </PolicyBlock>
        <PolicyBlock title="Service work">
          <p>
            Any custom work starts with scope, assumptions, deliverables, timeline, and acceptance criteria agreed
            outside the public site.
          </p>
        </PolicyBlock>
      </section>
    </>
  );
}

export function WorkWithEidosPage() {
  return (
    <>
      <PageHero
        eyebrow="Work With Eidos"
        title="Custom systems for sites, search visibility, and operations."
        dek="Eidos builds focused UI/UX improvements, agentic SEO foundations, automation workflows, dashboards, storefront layers, and intelligence interfaces."
        actions={
          <>
            <a className="btn btn--primary" href="/audit" data-event="audit_cta_click">
              Request an audit
            </a>
            <a className="btn btn--secondary" href={`mailto:${siteConfig.email}`}>
              Email Brent
            </a>
          </>
        }
        compact
      />
      <section className="section-shell" data-reveal>
        <CardGrid>
          <PlatformCard eyebrow="Build path" title="Website and UI/UX systems">
            <p>Premium public pages, component systems, storefront embeds, interaction polish, and accessibility cleanup.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Build path" title="AI-search visibility">
            <p>Route metadata, sitemap/robots policy, structured data, editorial architecture, and source-worthy content systems.</p>
          </PlatformCard>
          <PlatformCard eyebrow="Build path" title="Automation and dashboards">
            <p>Small operational systems that reduce manual handoffs, reporting gaps, missed follow-up, and owner-task drag.</p>
          </PlatformCard>
        </CardGrid>
      </section>
      <Process />
      <ContactCTA />
    </>
  );
}

export function AuditPage() {
  return (
    <>
      <PageHero
        eyebrow="Audit"
        title="Request a focused Eidos audit."
        dek="Choose a practical audit lane: public website quality, AI-search visibility, or small-business automation drag."
        compact
      />
      <section className="section-shell audit-layout" data-reveal>
        <div>
          <h2>Audit lanes</h2>
          <ul>
            <li>UI/UX and conversion clarity audit.</li>
            <li>Agentic SEO and AI-search visibility audit.</li>
            <li>Automation and operations friction audit.</li>
          </ul>
          <p>
            A useful audit should end with prioritized fixes, not a generic score. The interactive tools can help
            frame the first conversation.
          </p>
          <ToolLinkRow />
        </div>
        <div className="audit-card">
          <p className="section-kicker">Inquiry</p>
          <h2>Send a compact brief.</h2>
          <p>
            Include the site URL, current tools, what feels broken, and what a useful first improvement would prove.
          </p>
          <a className="btn btn--primary" href={`mailto:${siteConfig.email}?subject=Eidos%20audit%20request`} data-event="audit_cta_click">
            Email audit request
          </a>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHero
        eyebrow="Not Found"
        title="This route is not in the Eidos map yet."
        dek="Use the intelligence library, tools, or audit path to get back to the active platform."
        compact
      />
      <section className="section-shell" data-reveal>
        <CardGrid>
          <PlatformCard title="Intelligence library" href="/intelligence">
            <p>Read the current platform guides.</p>
          </PlatformCard>
          <PlatformCard title="Tools" href="/tools">
            <p>Run a practical diagnostic.</p>
          </PlatformCard>
          <PlatformCard title="Work With Eidos" href="/work-with-eidos">
            <p>Start a focused project path.</p>
          </PlatformCard>
        </CardGrid>
      </section>
    </>
  );
}

