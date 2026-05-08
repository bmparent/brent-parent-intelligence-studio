import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Network, ScanSearch } from 'lucide-react'
import { capabilities } from '../data/capabilities'
import { SectionShell } from '../components/layout/SectionShell'
import { CapabilityTag } from '../components/ui/CapabilityTag'
import { clearSceneFocus, emitSceneFocus } from '../three/utils/pointerState'

export function CapabilitiesCommandCenter() {
  const [activeId, setActiveId] = useState(capabilities[0].id)
  const activeCapability = useMemo(
    () => capabilities.find((capability) => capability.id === activeId) ?? capabilities[0],
    [activeId],
  )

  return (
    <SectionShell
      id="capabilities"
      eyebrow="Capabilities Command Center"
      title="A business-services map built like an operational console."
      intro="Hover a module to route the visual signal layer and see what each capability can produce for a client."
      className="capabilities-section"
    >
      <div className="command-center">
        <div className="command-center__map" data-reveal>
          <div className="command-center__core" aria-hidden="true">
            <Network size={34} />
          </div>
          {capabilities.map((capability, index) => {
            const angle = (-90 + index * 45) * (Math.PI / 180)
            const nodeStyle = {
              '--node-x': `${Math.cos(angle) * 16}rem`,
              '--node-y': `${Math.sin(angle) * 14}rem`,
            } as CSSProperties

            return (
              <button
                className={`capability-node capability-node--${capability.accent} ${
                  capability.id === activeId ? 'is-active' : ''
                }`}
                style={nodeStyle}
                type="button"
                key={capability.id}
                onMouseEnter={() => {
                  setActiveId(capability.id)
                  emitSceneFocus(capability.id, 1)
                }}
                onFocus={() => {
                  setActiveId(capability.id)
                  emitSceneFocus(capability.id, 1)
                }}
                onMouseLeave={clearSceneFocus}
                onBlur={clearSceneFocus}
              >
                <span>{capability.title}</span>
                <small>{capability.signal}</small>
              </button>
            )
          })}
        </div>

        <article className={`command-panel command-panel--${activeCapability.accent}`} data-reveal>
          <p className="micro-label">
            <ScanSearch size={14} aria-hidden="true" />
            Active capability
          </p>
          <h3>{activeCapability.title}</h3>
          <p>{activeCapability.summary}</p>
          <div className="command-panel__split">
            <div>
              <h4>Outcomes</h4>
              <ul>
                {activeCapability.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Deliverables</h4>
              <ul>
                {activeCapability.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="tag-cloud">
            {activeCapability.tags.map((tag) => (
              <CapabilityTag key={tag} label={tag} tone={activeCapability.accent} />
            ))}
          </div>
          <div className="related-systems">
            <p className="micro-label">Related systems</p>
            {activeCapability.relatedCaseStudies.map((study) => (
              <span key={study}>{study}</span>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  )
}
