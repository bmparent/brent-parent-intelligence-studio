import { CircuitBoard, Mail, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { MagneticButton } from '../ui/MagneticButton'

const navItems = [
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#services', label: 'Services' },
  { href: '#case-studies', label: 'Systems' },
  { href: '#eidos', label: 'Eidos' },
  { href: '#pricing', label: 'Pricing' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <header className="site-header" aria-label="Primary navigation">
      <a className="brand-mark" href="#top" aria-label="Brent Parent Intelligence Studio home">
        <CircuitBoard size={20} aria-hidden="true" />
        <span>
          Brent Parent
          <small>Intelligence Studio</small>
        </span>
      </a>

      <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Main menu">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <MagneticButton href="mailto:bmparent@outlook.com" variant="quiet">
          <Mail size={16} aria-hidden="true" />
          Project Quote
        </MagneticButton>
        <button
          className="icon-button menu-toggle"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
