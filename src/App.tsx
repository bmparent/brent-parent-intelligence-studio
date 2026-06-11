import { useReveal } from './hooks/useReveal';
import { Header } from './components/layout/Header';
import {
  AuditPage,
  AdvertisePage,
  ArticlePage,
  DisclosuresPage,
  HomePage,
  IntelligenceIndexPage,
  NewsletterPage,
  NotFoundPage,
  PrivacyPage,
  ResourcesPage,
  SponsorsPage,
  TermsPage,
  ToolPage,
  ToolsIndexPage,
  TopicPage,
  WorkWithEidosPage
} from './components/platform/Pages';
import {
  JsonLd
} from './components/platform/Shared';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd
} from './data/structuredData';
import {
  allRoutes,
  getArticleByPath,
  navItems,
  normalizePath,
  siteConfig
} from './data/platform';

type AppProps = {
  initialPath?: string;
};

function getBrowserPath() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

function renderRoute(path: string) {
  if (path === '/') return <HomePage />;
  if (path === '/intelligence') return <IntelligenceIndexPage />;
  if (path === '/ui-ux') return <TopicPage topic="ui-ux" />;
  if (path === '/agentic-seo') return <TopicPage topic="agentic-seo" />;
  if (path === '/automation') return <TopicPage topic="automation" />;
  if (path === '/tools') return <ToolsIndexPage />;
  if (path.startsWith('/tools/')) return <ToolPage path={path} />;
  if (path === '/newsletter') return <NewsletterPage />;
  if (path === '/resources') return <ResourcesPage />;
  if (path === '/resources/tool-stack') return <ResourcesPage variant="tool-stack" />;
  if (path === '/resources/templates') return <ResourcesPage variant="templates" />;
  if (path === '/resources/recommended-tools') return <ResourcesPage variant="recommended-tools" />;
  if (path === '/sponsors') return <SponsorsPage />;
  if (path === '/advertise') return <AdvertisePage />;
  if (path === '/disclosures') return <DisclosuresPage />;
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/terms') return <TermsPage />;
  if (path === '/work-with-eidos') return <WorkWithEidosPage />;
  if (path === '/audit') return <AuditPage />;
  if (getArticleByPath(path)) return <ArticlePage path={path} />;
  return <NotFoundPage />;
}

function buildStructuredData(path: string) {
  const article = getArticleByPath(path);
  const data: unknown[] = [buildOrganizationJsonLd(), buildWebsiteJsonLd()];

  if (path !== '/') {
    data.push(buildBreadcrumbJsonLd(path));
  }

  if (article) {
    data.push(buildArticleJsonLd(article));
  }

  return data;
}

function Footer() {
  return (
    <footer className="site-footer section-shell">
      <p>{siteConfig.name} by Brent Parent</p>
      <nav aria-label="Footer navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
        <a href="/disclosures">Disclosures</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>
  );
}

function App({ initialPath }: AppProps) {
  const path = normalizePath(initialPath ?? getBrowserPath());
  const isKnownRoute = allRoutes.includes(path);
  const structuredData = buildStructuredData(isKnownRoute ? path : '/');

  useReveal();

  return (
    <>
      {structuredData.map((data, index) => (
        <JsonLd data={data} key={index} />
      ))}
      <a className="skip-link btn btn--secondary" href="#main">
        Skip to content
      </a>
      <Header currentPath={path} />
      <main id="main">{renderRoute(path)}</main>
      <Footer />
    </>
  );
}

export default App;
