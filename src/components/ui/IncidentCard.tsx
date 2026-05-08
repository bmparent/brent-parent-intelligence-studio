import { AlertTriangle, CheckCircle2 } from 'lucide-react'

type IncidentCardProps = {
  title?: string
  confidence?: string
  workflow?: string
  evidence?: string
  action?: string
}

export function IncidentCard({
  title = 'Potential Production Risk Detected',
  confidence = '87%',
  workflow = 'Storefront order intake',
  evidence = 'Missing decoration notes on 7 incoming orders.',
  action = 'Review order group before invoice creation.',
}: IncidentCardProps) {
  return (
    <article className="incident-card" aria-label={title}>
      <div className="incident-card__header">
        <span className="incident-card__icon">
          <AlertTriangle size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="micro-label">Incident card</p>
          <h3>{title}</h3>
        </div>
      </div>
      <dl className="incident-card__grid">
        <div>
          <dt>Confidence</dt>
          <dd>{confidence}</dd>
        </div>
        <div>
          <dt>Affected workflow</dt>
          <dd>{workflow}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{evidence}</dd>
        </div>
        <div>
          <dt>Recommended action</dt>
          <dd>
            <CheckCircle2 size={16} aria-hidden="true" />
            {action}
          </dd>
        </div>
      </dl>
    </article>
  )
}
