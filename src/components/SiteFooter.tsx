import { SafeEmailLink } from './EmailAddress';
import { siteConfig } from '../config/site';
export function SiteFooter() {
  return (
    <footer className="ew-site-footer">
      <div className="ew-shell">
        <div className="ew-footer-top">
          <a className="ew-brand" href="/">
            <span className="ew-brand-mark" aria-hidden="true">
              e
            </span>
            <span>
              eidos<span className="ew-brand-works">works</span>
            </span>
          </a>
          <p>
            Thoughtful design.
            <br />
            Remarkable possibilities.
          </p>
          <SafeEmailLink address={siteConfig.contactEmail}>
            Say hello ↗
          </SafeEmailLink>
        </div>
        <div className="ew-footer-links">
          <nav aria-label="Studio links">
            <a href="/work">Work</a>
            <a href="/services">Services</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
          <nav aria-label="Explore links">
            <a href="/playground">Playground</a>
            <a href="/lab">Lab</a>
            <a href="/community">Community</a>
            <a href="/community/agents">Agent Exchange</a>
            <a href="/insights">Insights</a>
            <a href="/shop/cinematic-starter">Shop</a>
          </nav>
        </div>
        <div className="ew-footer-bottom">
          <span>© {new Date().getFullYear()} Eidos Works · Brent Parent</span>
          <div>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/editorial-policy">Editorial policy</a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('eidos:privacy'))}
            >
              Cookie choices
            </button>
          </div>
          <span>Built with intention.</span>
        </div>
      </div>
    </footer>
  );
}
