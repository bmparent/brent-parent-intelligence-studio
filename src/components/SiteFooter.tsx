import { siteConfig } from '../config/site';

export function SiteFooter() {
  return (
    <footer className="ew-footer">
      <div className="ew-shell ew-footer__grid">
        <div className="ew-footer__brand">
          <img src={siteConfig.logos.horizontal} alt="Eidos Works" width="188" height="52" loading="lazy" />
          <p>Websites, storefronts, dashboards, automation, and AI-ready search strategy by Brent Parent.</p>
        </div>
        <nav aria-label="Footer services">
          <strong>Explore</strong>
          <a href="/#work">Selected work</a>
          <a href="/#services">Services</a>
          <a href="/snapshot">Eidos Snapshot</a>
          <a href="/services/agentic-seo">Agentic SEO</a>
          <a href="/insights">Insights</a>
          <a href="/editorial-policy">Editorial policy</a>
        </nav>
        <div>
          <strong>Start a conversation</strong>
          <a href={`mailto:${siteConfig.projectsEmail}`}>{siteConfig.projectsEmail}</a>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <p>Based in Central Florida · available for focused remote work.</p>
        </div>
      </div>
      <div className="ew-shell ew-footer__bottom">
        <span>© {new Date().getUTCFullYear()} Eidos Works</span>
        <span>Clear systems. Useful interfaces. Honest expectations.</span>
      </div>
    </footer>
  );
}
