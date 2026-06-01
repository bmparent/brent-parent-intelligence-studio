import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import { SectionShell } from '../components/layout/SectionShell'
import { CapabilityTag } from '../components/ui/CapabilityTag'
import { selectedWork } from '../data/links'
import { clearSceneFocus, emitSceneFocus } from '../babylon/utils/pointerState'

export function SelectedWork() {
  return (
    <SectionShell
      id="selected-work"
      eyebrow="Selected Work"
      title="Concrete references inside the signal archive."
      intro="Public storefront links, Cloudinary-hosted visuals, and working references remain readable in HTML while the canvas adds the dimensional layer."
      className="selected-work-section"
    >
      <div className="work-observatory">
        {selectedWork.map((item) => (
          <article
            className="work-tile"
            key={item.title}
            onMouseEnter={() => emitSceneFocus(item.title.toLowerCase().replaceAll(' ', '-'), 0.75)}
            onMouseLeave={clearSceneFocus}
            data-reveal
          >
            <div className="work-tile__preview">
              {item.image ? (
                <img src={item.image} alt={`${item.title} preview`} loading="lazy" />
              ) : (
                <ImageIcon size={36} aria-hidden="true" />
              )}
            </div>
            <div className="work-tile__body">
              <p className="micro-label">{item.type}</p>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <div className="tag-cloud">
                {item.tags.map((tag) => (
                  <CapabilityTag key={tag} label={tag} tone="violet" />
                ))}
              </div>
              <a href={item.href} target={item.href.startsWith('#') ? undefined : '_blank'} rel="noreferrer">
                View reference
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
