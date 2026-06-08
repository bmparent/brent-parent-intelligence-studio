import { useRef } from 'react';
import { proofStats, profileImage } from '../data/portfolio';
import { usePointerVars } from '../hooks/usePointerVars';
import { cld, cldSrcSet } from '../utils';
import { BabylonCanvas } from '../babylon/BabylonCanvas';
import { GlassPanel } from './GlassPanel';

const proofChips = ['Custom storefronts', 'Production dashboards', 'Workflow automation', 'Eidos Brain prototypes'];

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  usePointerVars(heroRef);

  return (
    <section id="top" ref={heroRef} className="hero section-shell" aria-labelledby="hero-title">
      <BabylonCanvas />
      <div className="hero__content" data-reveal>
        <h1 id="hero-title">Eidos Works</h1>
        <p className="hero__lede">
          Systems, storefronts, dashboards, automation, and intelligence prototypes by Brent Parent. Sharp systems. Calm interfaces. Practical automation. Built for real operations.
        </p>
        <div className="hero__actions" aria-label="Primary actions">
          <a className="btn btn--primary" href="#start">
            Start a Project
          </a>
          <a className="btn btn--secondary" href="#work">
            Explore Work
          </a>
        </div>
        <ul className="hero__chips" aria-label="Core proof signals">
          {proofChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      </div>

      <GlassPanel className="hero-card" ariaLabel="Profile and Eidos Works positioning">
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
          <span className="status-dot">Founder / operator / builder: Brent Parent</span>
          <h2>Creative technology, UI/UX, storefronts, automation, and applied intelligence.</h2>
          <p>Eidos Works is Brent Parent's public studio for premium systems work.</p>
        </div>
      </GlassPanel>

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
