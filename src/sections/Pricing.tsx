import { pricing } from '../data/pricing'
import { SectionShell } from '../components/layout/SectionShell'
import { PriceModule } from '../components/ui/PriceModule'

export function Pricing() {
  return (
    <SectionShell
      id="pricing"
      eyebrow="Service Packages"
      title="Service Packages & Starting Points"
      intro="Every project is scoped around business goals, complexity, integrations, and timeline. These are starting points so clients can quickly understand the level of investment."
      className="pricing-section"
    >
      <div className="pricing-grid">
        {pricing.map((item, index) => (
          <PriceModule key={item.id} item={item} index={index} />
        ))}
      </div>
    </SectionShell>
  )
}
