import { ExternalLink, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">Brent Parent Intelligence Studio</p>
        <p>
          Premium web experiences, workflow automations, AI assistants, and operational
          intelligence prototypes from Central Florida.
        </p>
      </div>
      <div className="footer-links">
        <a href="mailto:bmparent@outlook.com">
          <Mail size={16} aria-hidden="true" />
          bmparent@outlook.com
        </a>
        <span>
          <MapPin size={16} aria-hidden="true" />
          Central Florida
        </span>
        <a href="https://github.com/bmparent/brent-parent-intelligence-studio" target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          GitHub repo
        </a>
      </div>
    </footer>
  )
}
