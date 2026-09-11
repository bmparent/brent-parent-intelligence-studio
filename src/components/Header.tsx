import { useEffect, useRef, useState } from 'react';
import { LiquidGlassSurface } from './LiquidGlassSurface';
const links = [
  { href: '/work', label: 'Work' },
  { href: '/playground', label: 'Playground' },
  { href: '/lab', label: 'Lab' },
  { href: '/community', label: 'Community' },
  { href: '/insights', label: 'Insights' },
  { href: '/about', label: 'Studio' },
  { href: '/account', label: 'Account' },
];
export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        !nav.current?.contains(event.target as Node) &&
        !toggle.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  return (
    <header className="ew-header ew-glass-header">
      <div className="ew-header__inner">
        <LiquidGlassSurface />
        <a className="ew-brand" href="/" aria-label="Eidos Works home">
          <span className="ew-brand-mark" aria-hidden="true">
            e
          </span>
          <span>
            eidos<span className="ew-brand-works">works</span>
          </span>
        </a>
        <button
          ref={toggle}
          className="ew-menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}{' '}
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <nav
          ref={nav}
          id="primary-nav"
          className={`ew-nav${open ? ' is-open' : ''}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a className="ew-nav-mobile-extra" href="/services">
            Services
          </a>
          <a className="ew-nav-mobile-extra" href="/contact">
            Let’s build ↗
          </a>
        </nav>
        <a className="ew-header__cta" href="/contact">
          Let’s build <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
