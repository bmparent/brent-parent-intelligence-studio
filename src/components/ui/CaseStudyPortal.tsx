import { ExternalLink, RadioTower } from 'lucide-react'
import type { CaseStudy } from '../../data/caseStudies'
import { clearSceneFocus, emitSceneFocus } from '../../three/utils/pointerState'
import { CapabilityTag } from './CapabilityTag'
import { IncidentCard } from './IncidentCard'

type CaseStudyPortalProps = {
  study: CaseStudy
  featured?: boolean
}

export function CaseStudyPortal({ study, featured = false }: CaseStudyPortalProps) {
  return (
    <article
      className={featured ? 'case-portal case-portal--featured' : 'case-portal'}
      onMouseEnter={() => emitSceneFocus(study.id, featured ? 1 : 0.8)}
      onMouseLeave={clearSceneFocus}
      data-reveal
    >
      <div className="case-portal__visual">
        {study.image ? <img src={study.image} alt={`${study.title} visual reference`} loading="lazy" /> : null}
        <div className="case-portal__mesh" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="case-portal__content">
        <p className="micro-label">
          <RadioTower size={14} aria-hidden="true" />
          {study.type}
        </p>
        <h3>{study.title}</h3>
        <p>{study.summary}</p>
        <p className="case-portal__visual-copy">{study.visual}</p>
        {study.note ? <p className="case-portal__note">{study.note}</p> : null}
        {study.incident ? <IncidentCard {...study.incident} /> : null}
        <div className="tag-cloud">
          {study.capabilities.slice(0, featured ? 9 : 6).map((capability) => (
            <CapabilityTag key={capability} label={capability} tone={featured ? 'violet' : 'cyan'} />
          ))}
        </div>
        {study.links ? (
          <div className="case-portal__links">
            {study.links.map((link) => (
              <a href={link.href} key={link.href} target={link.href.startsWith('#') ? undefined : '_blank'} rel="noreferrer">
                {link.label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
