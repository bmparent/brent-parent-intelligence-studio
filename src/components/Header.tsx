import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../config/site';

const links = [
  { href: '/#work', label: 'Work' },
  { href: '/#services', label: 'Services' },
  { href: '/snapshot', label: 'Snapshot' },
  { href: '/services/agentic-seo', label: 'Agentic SEO' },
  { href: '/insights', label: 'Insights' },
  { href: '/#contact', label: 'Contact' }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement | null>(null);
  const toggle = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    firstLink.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="ew-header" aria-label="Primary navigation">
      <div className="ew-header__inner">
        <a className="ew-brand" href="/" aria-label="Eidos Works home" onClick={() => setOpen(false)}>
          <img src={siteConfig.logos.horizontal} alt="Eidos Works" width="188" height="52" />
        </a>

        <button
          ref={toggle}
          className="ew-menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <strong>{open ? 'Close' : 'Menu'}</strong>
        </button>

        <nav id="primary-nav" className={`ew-nav${open ? ' is-open' : ''}`} aria-label="Site navigation">
          {links.map((link, index) => (
            <a
              ref={index === 0 ? firstLink : undefined}
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a className="ew-header__cta" href="/snapshot" onClick={() => setOpen(false)}>
          {siteConfig.snapshotCheckoutEnabled ? 'Get a $5 Snapshot' : 'Explore $5 Snapshot'}
        </a>
      </div>
    </header>
  );
}
