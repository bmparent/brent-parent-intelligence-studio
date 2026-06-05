import { useRef } from 'react';
import { proofStats, profileImage } from '../data/portfolio';
import { usePointerVars } from '../hooks/usePointerVars';
import { cld, cldSrcSet } from '../utils';
import { BabylonCanvas } from '../babylon/BabylonCanvas';

const proofChips = ['InkSoft custom embeds', 'Cloudinary workflows', 'Printavo reporting', 'Babylon/WebGL UI'];

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  usePointerVars(heroRef);

  return (
    <section id="top" ref={heroRef} className="hero section-shell" aria-labelledby="hero-title">
      <BabylonCanvas />
      <div className="hero__content" data-reveal>
        <p className="eyebrow">Brent Parent / Intelligence Studio</p>
        <h1 id="hero-title">Systems, storefronts, automation, and intelligence interfaces built beyond the template.</h1>
        <p className="hero__lede">
          I design and build premium digital systems for businesses that need clean customer experiences, sharper operations, and interfaces that make complex work easier to act on.
        </p>
        <div className="hero__actions" aria-label="Primary actions">
          <a className="btn btn--primary" href="mailto:1brent.bm@gmail.com?subject=Freelance%20project%20inquiry">
            Start a project
          </a>
          <a className="btn btn--secondary" href="#case-studies">
            View case studies
          </a>
        </div>
        <ul className="hero__chips" aria-label="Core proof signals">
          {proofChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      </div>

      <aside className="hero-card" aria-label="Profile and studio positioning" data-reveal>
        <div className="hero-card__glow" aria-hidden="true" />
        <img
          src={cld(profileImage, 760)}
          srcSet={cldSrcSet(profileImage, [360, 520, 760, 960])}
          sizes="(max-width: 760px) 78vw, 420px"
          width="760"
          height="950"
          alt="Illustrated portrait of Brent Parent."
          fetchPriority="high"
        />
        <div className="hero-card__panel">
          <span className="status-dot">Available for freelance systems work</span>
          <h2>Creative technologist. UI/UX designer. Automation builder.</h2>
          <p>Business-facing systems with enough polish for customers and enough structure for real operations.</p>
        </div>
      </aside>

      <div className="proof-strip" aria-label="Portfolio proof summary" data-reveal>
        {proofStats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
