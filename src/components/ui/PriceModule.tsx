import { ArrowRight, Gauge } from 'lucide-react'
import type { PricePackage } from '../../data/pricing'
import { emitSceneFocus, clearSceneFocus } from '../../three/utils/pointerState'
import { MagneticButton } from './MagneticButton'

type PriceModuleProps = {
  item: PricePackage
  index: number
}

export function PriceModule({ item, index }: PriceModuleProps) {
  return (
    <article
      className="price-module"
      onMouseEnter={() => emitSceneFocus(item.id, 0.9)}
      onMouseLeave={clearSceneFocus}
      data-reveal
    >
      <div className="price-module__header">
        <span className="module-index">{String(index + 1).padStart(2, '0')}</span>
        <Gauge size={18} aria-hidden="true" />
      </div>
      <h3>{item.name}</h3>
      <p className="price-module__price">Starting at {item.startingAt}</p>
      <div className="price-module__body">
        <p className="micro-label">Best for</p>
        <ul>
          {item.bestFor.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        <p className="micro-label">Includes</p>
        <ul>
          {item.includes.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        {item.advancedRange ? <p className="advanced-range">{item.advancedRange}</p> : null}
        {item.advancedIncludes ? (
          <ul className="advanced-list">
            {item.advancedIncludes.slice(0, 5).map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <MagneticButton href="mailto:bmparent@outlook.com?subject=Project%20scope%20request" variant="secondary">
        Request Scope
        <ArrowRight size={16} aria-hidden="true" />
      </MagneticButton>
    </article>
  )
}
