import { BrainCircuit, GitBranch, ShieldCheck, Waves } from 'lucide-react'
import { SectionShell } from '../components/layout/SectionShell'
import { CapabilityTag } from '../components/ui/CapabilityTag'
import { IncidentCard } from '../components/ui/IncidentCard'
import { clearSceneFocus, emitSceneFocus } from '../babylon/utils/pointerState'
import { frameworkStack } from '../data/frameworkStack'

const subsystems = [
  {
    name: 'Sentinel Monitor',
    description: 'Watches live signals for instability, novelty, surprise, and state changes.',
  },
  {
    name: 'Streaming Reservoir',
    description: 'Maintains a moving representation of recent activity so pattern shifts are visible over time.',
  },
  {
    name: 'Bicameral Compression',
    description: 'Compresses streams into useful frames and summaries without losing the shape of what happened.',
  },
  {
    name: 'Hippocampus / Memory Layer',
    description: 'Stores meaningful events and patterns so new observations can be compared against prior experience.',
  },
  {
    name: 'Forecast Mode',
    description: 'Projects possible near-future risks, workload issues, and operational bottlenecks.',
  },
  {
    name: 'Incident Cards',
    description: 'Turns detected issues into readable summaries with evidence, confidence, impact, and action.',
  },
  {
    name: 'Domain Adapters',
    description: 'Connects the intelligence layer to print shops, ecommerce, logs, documents, telemetry, and business signals.',
  },
  {
    name: 'Human-in-the-Loop Control',
    description: 'Keeps recommendations reviewable, auditable, and designed to support human decisions.',
  },
]

const mapColumns = [
  {
    title: 'Inputs',
    items: [
      'orders',
      'storefront activity',
      'production notes',
      'customer messages',
      'cloud logs',
      'datasets',
      'workflow events',
      'documents',
      'operational signals',
    ],
  },
  {
    title: 'Processing',
    items: [
      'signal compression',
      'anomaly detection',
      'memory matching',
      'forecasting',
      'event classification',
      'AI summarization',
      'risk scoring',
    ],
  },
  {
    title: 'Outputs',
    items: [
      'dashboards',
      'incident cards',
      'alerts',
      'recommendations',
      'summaries',
      'workflow actions',
      'project intelligence',
    ],
  },
]

export function EidosDeepDive() {
  return (
    <SectionShell
      id="eidos"
      eyebrow="Eidos Brain"
      title="A living intelligence platform for operational signals."
      intro="Eidos Brain is an experimental intelligence architecture designed to watch streams of activity, detect unusual patterns, remember important events, forecast risk, and produce human-readable incident cards and recommendations."
      className="eidos-section"
    >
      <div className="eidos-layout">
        <div className="eidos-core-panel" data-reveal>
          <div className="eidos-core-panel__symbol" aria-hidden="true">
            <BrainCircuit size={52} />
            <span />
          </div>
          <p>
            The platform vision treats business activity as a signal environment. It
            watches, compresses, remembers, forecasts, and explains so people can make
            better decisions without losing control of the system.
          </p>
          <div className="eidos-modes">
            <span>
              <Waves size={16} aria-hidden="true" />
              Forecast waves
            </span>
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              Human review
            </span>
            <span>
              <GitBranch size={16} aria-hidden="true" />
              Domain adapters
            </span>
          </div>
        </div>
        <div className="subsystem-grid">
          {subsystems.map((system) => (
            <article
              key={system.name}
              className="subsystem-node"
              onMouseEnter={() => emitSceneFocus(system.name.toLowerCase().replaceAll(' ', '-'), 0.85)}
              onMouseLeave={clearSceneFocus}
              data-reveal
            >
              <h3>{system.name}</h3>
              <p>{system.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="intelligence-map" data-reveal>
        {mapColumns.map((column) => (
          <div className="intelligence-map__column" key={column.title}>
            <p className="micro-label">{column.title}</p>
            <div className="tag-cloud">
              {column.items.map((item) => (
                <CapabilityTag key={item} label={item} tone={column.title === 'Outputs' ? 'green' : 'cyan'} />
              ))}
            </div>
          </div>
        ))}
      </div>


      <div className="creative-engine glass-surface" data-reveal>
        <div>
          <p className="micro-label">Build Stack / Creative Engine</p>
          <h3>Framework-aware, without dependency bloat.</h3>
          <p>
            The current build now runs Babylon.js as the primary scene layer while documenting a clean path for Babylon, WebGPU, physics, Spline, Rive, and Astro when real assets or interactions justify them.
          </p>
        </div>
        <div className="creative-engine__layers">
          {frameworkStack.map((layer) => (
            <div className="creative-engine__layer" key={layer.layer}>
              <span>{layer.layer}</span>
              <div>
                {layer.items.map((item) => (
                  <span className={item.status === 'active' ? 'engine-badge' : 'physics-badge'} title={item.role} key={item.name}>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="incident-demo" data-reveal>
        <div>
          <p className="micro-label">Interactive incident sequence</p>
          <h3>Signal destabilizes. Memory matches. The card assembles.</h3>
          <p>
            The Babylon.js layer mirrors this sequence in the background: normal stream,
            anomaly pulse, clustered particles, memory rings, and a stabilized incident
            output.
          </p>
        </div>
        <IncidentCard />
      </div>
    </SectionShell>
  )
}
