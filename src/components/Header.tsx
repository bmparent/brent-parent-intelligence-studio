import { contactMailto } from '../utils';

const links = [
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#case-studies', label: 'Case studies' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#production', label: 'Dashboard' },
  { href: '#eidos', label: 'Eidos Brain' },
  { href: '#process', label: 'Process' }
];

export function Header() {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <a className="brand-mark" href="#top" aria-label="Brent Parent Intelligence Studio home">
        <span className="brand-mark__sig" aria-hidden="true">
          BP
        </span>
        <span>
          <strong>Brent Parent</strong>
          <small>Intelligence Studio</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="Portfolio sections">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href={contactMailto}>
        Start a project
      </a>
    </header>
  );
}
