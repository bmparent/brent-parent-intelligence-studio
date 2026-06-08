import { useEffect, useState } from 'react';
import { siteConfig } from '../config/site';

const links = [
  { href: '#top', label: 'Home' },
  { href: '#capabilities', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#intelligence-agent', label: 'Diagnostics' },
  { href: '#eidos', label: 'Eidos Brain' },
  { href: '#insights', label: 'Insights' },
  { href: '#pricing', label: 'Pricing' }
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="site-header" aria-label="Primary navigation">
      <a className="brand-mark" href="#top" aria-label="Eidos Works home" onClick={() => setOpen(false)}>
        <img src={siteConfig.logos.horizontal} alt="Eidos Works" width="188" height="52" />
        <span>
          <strong>Eidos Works</strong>
          <small>by Brent Parent</small>
        </span>
      </a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((current) => !current)}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <strong>{open ? 'Close' : 'Menu'}</strong>
      </button>
      <nav id="primary-nav" className={`nav-links${open ? ' is-open' : ''}`} aria-label="Site sections">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#start" onClick={() => setOpen(false)}>
        Start a Project
      </a>
    </header>
  );
}
