import { siteConfig } from '../config/site';
import { EmailAddress, SafeEmailLink } from './EmailAddress';

export function SiteFooter() {
  return (
    <footer className="ew-footer">
      <div className="ew-shell ew-footer__grid">
        <div className="ew-footer__brand">
          <img src={siteConfig.logos.horizontal} alt="Eidos Works" width="188" height="52" loading="lazy" />
          <p>Digital experiences and operational tools for organizations with complicated real-world workflows.</p>
        </div>
        <nav aria-label="Footer services">
          <strong>Explore</strong>
          <a href="/work">Selected work</a>
          <a href="/services">Services</a>
          <a href="/about">About</a>
          <a href="/insights">Insights</a>
          <a href="/contact">Contact</a>
          <a href="/lab/eidos-brain">Lab</a>
        </nav>
        <div>
          <strong>Start a conversation</strong>
          <SafeEmailLink address={siteConfig.projectsEmail}><EmailAddress address={siteConfig.projectsEmail} /></SafeEmailLink>
          <SafeEmailLink address={siteConfig.contactEmail}><EmailAddress address={siteConfig.contactEmail} /></SafeEmailLink>
          <p>Based in Central Florida · available for focused remote work.</p>
        </div>
      </div>
      <div className="ew-shell ew-footer__bottom">
        <span>© {new Date().getUTCFullYear()} Eidos Works</span>
        <span>Technology in service of human understanding.</span>
      </div>
    </footer>
  );
}
