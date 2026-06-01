import { ArrowUpRight, Workflow } from 'lucide-react'
import type { Service } from '../../data/services'
import { clearSceneFocus, emitSceneFocus } from '../../three/utils/pointerState'

type ServiceNodeProps = {
  service: Service
  index: number
}

export function ServiceNode({ service, index }: ServiceNodeProps) {
  return (
    <article
      className="service-node glass-surface glass-surface--interactive"
      onMouseEnter={() => emitSceneFocus(service.id, 0.85)}
      onMouseLeave={clearSceneFocus}
      data-reveal
    >
      <div className="service-node__rail" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="service-node__content">
        <p className="micro-label">
          <Workflow size={14} aria-hidden="true" />
          {service.signal}
        </p>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <div className="service-flow" aria-label="Workflow pipeline preview">
          {[
            ['Messy Input', service.flow.input],
            ['Built System', service.flow.system],
            ['Business Outcome', service.flow.outcome],
          ].map(([label, value]) => (
            <div className="service-flow__step" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="service-node__columns">
          <div>
            <h4>Outcomes</h4>
            <ul>
              {service.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Deliverables</h4>
            <ul>
              {service.deliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <ArrowUpRight className="service-node__arrow" size={20} aria-hidden="true" />
    </article>
  )
}
