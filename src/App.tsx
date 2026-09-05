import { Header } from './components/Header';
import { SiteFooter } from './components/SiteFooter';
import { HomePage } from './components/HomePage';
import { AgenticSeoPage } from './components/AgenticSeoPage';
import { InsightsHub } from './components/InsightsHub';
import { InsightArticle } from './components/InsightArticle';
import {
  SnapshotLandingPage,
  SnapshotResultPage,
  SnapshotStartPage,
  SnapshotSuccessPage,
} from './components/SnapshotPages';
import { SEOJsonLd } from './components/SEOJsonLd';
import { PageMeta } from './components/PageMeta';
import { EditorialPolicy } from './components/EditorialPolicy';
import { PernrGateCaseStudy } from './components/PernrGateCaseStudy';
import {
  AboutPage,
  ContactPage,
  EidosBrainLabPage,
  ProductionDashboardCaseStudy,
  ServiceDetailPage,
  ServicesPage,
  StorefrontExperienceCaseStudy,
} from './components/EditorialPages';
import {
  ShowcasePage,
  StorefrontShowcase,
  LabPage,
} from './components/ShowcasePages';
import { EidosAssistant } from './components/EidosAssistant';
import { PrivacyControls } from './components/PrivacyControls';
import { CommunityPage, AgentGuide } from './components/CommunityPages';
import { ModerationPage } from './components/ModerationPage';
import { StarterPage, PurchaseSuccess } from './components/ShopPages';
import { PolicyPage } from './components/PolicyPages';
import type { ServiceSlug } from './data/editorial';
import { normalizePath } from './data/pages';

type AppProps = {
  requestPath?: string;
};

function NotFoundPage() {
  return (
    <section
      className="ew-page-simple ew-shell"
      aria-labelledby="not-found-title"
    >
      <p className="ew-eyebrow">404</p>
      <h1 id="not-found-title">That page does not exist.</h1>
      <p>
        The useful path is still close. Return to Eidos Works, browse the work,
        or ask the studio a question.
      </p>
      <div className="ew-actions">
        <a className="ew-button ew-button--primary" href="/">
          Return home
        </a>
        <a className="ew-button ew-button--secondary" href="/insights">
          Browse Insights
        </a>
      </div>
    </section>
  );
}

function routeFor(path: string) {
  if (path === '/') return <HomePage />;
  if (path === '/community') return <CommunityPage />;
  if (path === '/community/agents') return <CommunityPage agentsOnly />;
  if (path === '/community/agent-guide') return <AgentGuide />;
  if (path === '/community/moderate') return <ModerationPage />;
  if (path === '/community/guidelines') return <PolicyPage kind="guidelines" />;
  if (path === '/privacy') return <PolicyPage kind="privacy" />;
  if (path === '/terms') return <PolicyPage kind="terms" />;
  if (path === '/shop/cinematic-starter') return <StarterPage />;
  if (path === '/shop/success') return <PurchaseSuccess />;
  if (path === '/snapshot') return <SnapshotLandingPage />;
  if (path === '/snapshot/start') return <SnapshotStartPage />;
  if (path === '/snapshot/success') return <SnapshotSuccessPage />;
  if (path === '/services/agentic-seo') return <AgenticSeoPage />;
  if (path === '/services') return <ServicesPage />;
  if (path.startsWith('/services/')) {
    const slug = path.slice('/services/'.length) as ServiceSlug;
    if (
      [
        'digital-experiences',
        'storefront-access-systems',
        'dashboards-workflow-tools',
      ].includes(slug)
    ) {
      return <ServiceDetailPage slug={slug} />;
    }
  }
  if (path === '/work') return <ShowcasePage />;
  if (path === '/lab') return <LabPage />;
  if (
    ['/work/nighttime-spectaculars', '/work/holidays-in-hollywood'].includes(
      path,
    )
  )
    return <StorefrontShowcase slug={path.split('/').pop()!} />;
  if (path === '/work/pernr-access-gate') return <PernrGateCaseStudy />;
  if (path === '/work/production-dashboard')
    return <ProductionDashboardCaseStudy />;
  if (path === '/work/storefront-experience')
    return <StorefrontExperienceCaseStudy />;
  if (path === '/about') return <AboutPage />;
  if (path === '/contact') return <ContactPage />;
  if (path === '/lab/eidos-brain') return <EidosBrainLabPage />;
  if (path === '/insights') return <InsightsHub currentPath={path} />;
  if (path === '/editorial-policy') return <EditorialPolicy />;
  if (path.startsWith('/insights/'))
    return <InsightArticle currentPath={path} />;
  if (path.startsWith('/snapshot/result/')) {
    try {
      const token = decodeURIComponent(path.slice('/snapshot/result/'.length));
      return token ? <SnapshotResultPage token={token} /> : <NotFoundPage />;
    } catch {
      return <NotFoundPage />;
    }
  }

  return <NotFoundPage />;
}

function App({ requestPath }: AppProps) {
  const sourcePath =
    typeof window === 'undefined'
      ? requestPath || '/'
      : window.location.pathname;
  const path = normalizePath(sourcePath);

  return (
    <>
      <PageMeta path={path} />
      <SEOJsonLd path={path} />
      <a className="ew-skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">{routeFor(path)}</main>
      <SiteFooter />
      <EidosAssistant />
      <PrivacyControls />
    </>
  );
}

export default App;
