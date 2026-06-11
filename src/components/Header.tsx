import { navItems } from '../data/platform';

export function Header({ currentPath = '/' }: { currentPath?: string }) {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <a className="brand-mark" href="/" aria-label="Eidos Works home">
        <span className="brand-mark__sig" aria-hidden="true">
          EW
        </span>
        <span>
          <strong>Eidos Works</strong>
          <small>by Brent Parent</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="Platform sections">
        {navItems.slice(0, -1).map((link) => (
          <a key={link.href} href={link.href} aria-current={currentPath === link.href ? 'page' : undefined}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="/work-with-eidos" aria-current={currentPath === '/work-with-eidos' ? 'page' : undefined}>
        Work With Eidos
      </a>
    </header>
  );
}
