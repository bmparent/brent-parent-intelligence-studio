import { billingNotes, engagementModels, retainerOptions } from '../data/portfolio';
import { SectionHeader } from './SectionHeader';

export function PricingCards() {
  return (
    <section id="pricing" className="section-shell section-block pricing" aria-labelledby="pricing-title">
      <SectionHeader
        id="pricing-title"
        eyebrow="Pricing and engagement models"
        title="Clear starting ranges before a detailed scope."
        summary="Each project is quoted after discovery, but starting ranges help buyers understand the likely engagement shape before opening a conversation."
      />

      <div className="pricing-grid">
        {engagementModels.map((model) => (
          <article className="pricing-card" key={model.title} data-reveal>
            <span>{model.range}</span>
            <h3>{model.title}</h3>
            <p>{model.bestFor}</p>
            <div>
              <strong>Deliverables</strong>
              <ul>
                {model.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="pricing-card__timeline">{model.timeline}</p>
            <div>
              <strong>What affects price</strong>
              <ul>
                {model.priceFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <a className="btn btn--secondary" href="#start">
              Start a Project
            </a>
          </article>
        ))}
      </div>

      <div className="billing-panel" data-reveal>
        <div>
          <p className="section-kicker">Billing notes</p>
          <h3>Transparent enough to plan, flexible enough to scope correctly.</h3>
          <ul>
            {billingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <div className="retainer-list" aria-label="Suggested retainer options">
          {retainerOptions.map((option) => (
            <article key={option.title}>
              <span>{option.title}</span>
              <strong>{option.range}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
