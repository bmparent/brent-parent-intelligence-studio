import type { CSSProperties } from 'react';
import { capabilities } from '../data/portfolio';
import { SectionHeader } from './SectionHeader';

const pillars = [
  {
    title: 'Customer-facing polish',
    text: 'The first screen explains who you are, why the work matters, and what the visitor should do next.'
  },
  {
    title: 'Operational clarity',
    text: 'Dashboards, filters, reporting views, and workflow states turn hidden business activity into visible decision support.'
  },
  {
    title: 'Technical restraint',
    text: 'Motion, glass, and WebGL support attention without burying the content or slowing the user down.'
  }
];

export function Capabilities() {
  return (
    <section id="capabilities" className="section-shell section-block capabilities" aria-labelledby="capabilities-title">
      <SectionHeader
        id="capabilities-title"
        eyebrow="Services / capabilities"
        title="Custom storefronts, dashboards, automation, and intelligence prototypes built around real workflows."
        summary="Eidos Works sits at the intersection of storefront design, graphic systems, workflow automation, production reporting, and applied intelligence. Each capability is framed around the business problem it solves."
      />

      <div className="pillar-grid" data-reveal>
        {pillars.map((pillar) => (
          <article className="pillar-card" key={pillar.title}>
            <span aria-hidden="true" />
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>

      <div className="capability-grid">
        {capabilities.map((capability, index) => (
          <article className="capability-card" key={capability.title} data-reveal style={{ '--delay': `${index * 35}ms` } as CSSProperties}>
            <div className="capability-card__topline">
              <span>{capability.tag}</span>
              <small>{String(index + 1).padStart(2, '0')}</small>
            </div>
            <h3>{capability.title}</h3>
            <p>{capability.summary}</p>
            <strong>{capability.businessValue}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
