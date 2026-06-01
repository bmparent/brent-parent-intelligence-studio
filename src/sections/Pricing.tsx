import { pricing } from '../data/pricing'
import { SectionShell } from '../components/layout/SectionShell'
import { PriceModule } from '../components/ui/PriceModule'

export function Pricing() {
  return (
    <SectionShell
      id="pricing"
      eyebrow="Engagement Modules"
      title="Choose the clearest engagement path."
      intro="Pricing starts with the outcome: launch presence, workflow clarity, or a prototype intelligence layer. Each module is scoped around practical business value before technical complexity."
      className="pricing-section"
    >
      <div className="pricing-grid pricing-grid--modules">
        {pricing.map((item, index) => (
          <PriceModule key={item.id} item={item} index={index} />
        ))}
      </div>
    </SectionShell>
  )
}
