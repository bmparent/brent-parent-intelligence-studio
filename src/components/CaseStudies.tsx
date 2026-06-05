import { storeCaseStudies } from '../data/portfolio';
import { externalLinkProps } from '../utils';
import { SectionHeader } from './SectionHeader';

export function CaseStudies() {
  return (
    <section id="case-studies" className="section-shell section-block case-studies" aria-labelledby="case-studies-title">
      <SectionHeader
        id="case-studies-title"
        eyebrow="Featured case studies"
        title="Real storefront systems, framed as business-facing design work."
        summary="These InkSoft projects are presented as custom storefront experiences and embedded UI systems. Each card explains the business problem, the design/build approach, technical execution, and the practical result without pretending the work is a generic portfolio thumbnail."
      />

      <div className="case-grid">
        {storeCaseStudies.map((study, index) => (
          <a
            className={index < 2 ? 'case-card case-card--feature' : 'case-card'}
            href={study.url}
            key={study.url}
            data-reveal
            {...externalLinkProps(`Open ${study.title} live store`)}
          >
            <div className="case-card__header">
              <span>{study.category}</span>
              <small>Live store ↗</small>
            </div>
            <h3>{study.title}</h3>
            <p className="case-card__client">{study.client}</p>
            <div className="case-card__body">
              <section>
                <h4>Problem</h4>
                <p>{study.problem}</p>
              </section>
              <section>
                <h4>Approach</h4>
                <p>{study.approach}</p>
              </section>
              <section>
                <h4>Execution</h4>
                <p>{study.execution}</p>
              </section>
              <section>
                <h4>Result</h4>
                <p>{study.result}</p>
              </section>
            </div>
            <div className="case-card__proof" aria-label="What this project proves">
              {study.proves.map((proof) => (
                <span key={proof}>{proof}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
