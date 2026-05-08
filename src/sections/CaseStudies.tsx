import { caseStudies } from '../data/caseStudies'
import { SectionShell } from '../components/layout/SectionShell'
import { CaseStudyPortal } from '../components/ui/CaseStudyPortal'

export function CaseStudies() {
  const [featured, ...rest] = caseStudies

  return (
    <SectionShell
      id="case-studies"
      eyebrow="Mission Archive"
      title="Project systems, prototypes, and capability portals."
      intro="The archive is built as a connected observatory: practical business work on one side, experimental operational intelligence on the other."
      className="case-studies-section"
    >
      <div className="case-constellation">
        <CaseStudyPortal study={featured} featured />
        <div className="case-constellation__grid">
          {rest.map((study) => (
            <CaseStudyPortal key={study.id} study={study} />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
