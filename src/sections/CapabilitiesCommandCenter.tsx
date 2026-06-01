import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Lock, Network, ScanSearch } from 'lucide-react'
import { capabilities } from '../data/capabilities'
import { SectionShell } from '../components/layout/SectionShell'
import { CapabilityTag } from '../components/ui/CapabilityTag'
import { clearSceneFocus, emitSceneFocus } from '../babylon/utils/pointerState'

export function CapabilitiesCommandCenter() {
  const [activeId, setActiveId] = useState(capabilities[0].id)
  const [lockedId, setLockedId] = useState<string | null>(null)
  const activeCapability = useMemo(
    () => capabilities.find((capability) => capability.id === activeId) ?? capabilities[0],
    [activeId],
  )

  const previewCapability = (id: string) => {
    if (!lockedId) {
      setActiveId(id)
    }
    emitSceneFocus(id, 1)
  }

  const toggleLock = (id: string) => {
    setLockedId((current) => {
      const next = current === id ? null : id
      setActiveId(next ?? id)
      emitSceneFocus(id, next ? 1.15 : 0.85)
      return next
    })
  }

  return (
    <SectionShell
      id="capabilities"
      eyebrow="Capabilities Command Center"
      title="A business-services map built like an operational console."
      intro="Hover to preview. Click to lock signal. Each module routes a messy business input toward a clearer built system."
      className="capabilities-section"
    >
      <div className="command-center">
        <div className="command-center__map glass-surface" data-reveal>
          <div className="command-center__core" aria-hidden="true">
            <Network size={34} />
          </div>
          {capabilities.map((capability, index) => {
            const angle = (-90 + index * 45) * (Math.PI / 180)
            const nodeStyle = {
              '--node-x': `${Math.cos(angle) * 16}rem`,
              '--node-y': `${Math.sin(angle) * 14}rem`,
            } as CSSProperties
            const isLocked = lockedId === capability.id

            return (
              <button
                className={`capability-node capability-node--${capability.accent} ${
                  capability.id === activeId ? 'is-active' : ''
                } ${isLocked ? 'is-locked' : ''}`}
                style={nodeStyle}
                type="button"
                key={capability.id}
                aria-pressed={isLocked}
                onClick={() => toggleLock(capability.id)}
                onMouseEnter={() => previewCapability(capability.id)}
                onFocus={() => previewCapability(capability.id)}
                onMouseLeave={clearSceneFocus}
                onBlur={clearSceneFocus}
              >
                <span>{capability.title}</span>
                <small>{capability.signal}</small>
                {isLocked ? <Lock size={13} aria-label="Signal locked" /> : null}
              </button>
            )
          })}
        </div>

        <article className={`command-panel command-panel--${activeCapability.accent} glass-surface--strong`} data-reveal>
          <p className="micro-label">
            <ScanSearch size={14} aria-hidden="true" />
            {lockedId ? 'Locked capability' : 'Active capability'}
          </p>
          <h3>{activeCapability.title}</h3>
          <p>{activeCapability.summary}</p>
          <div className="signal-flow" aria-label="Capability output preview">
            {[
              ['Input Signal', activeCapability.preview.input],
              ['Built System', activeCapability.preview.system],
              ['Business Result', activeCapability.preview.output],
            ].map(([label, value]) => (
              <div className="signal-flow__step" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
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
            <h4>Related systems</h4>
            {activeCapability.relatedCaseStudies.map((study) => (
              <span key={study}>{study}</span>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  )
}
