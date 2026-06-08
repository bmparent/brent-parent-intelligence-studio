import { storeCaseStudies } from '../data/portfolio';
import { LiveSitePreviewCard } from './LiveSitePreviewCard';
import { SectionHeader } from './SectionHeader';

export function CaseStudies() {
  return (
    <section id="work" className="section-shell section-block case-studies" aria-labelledby="case-studies-title">
      <SectionHeader
        id="case-studies-title"
        eyebrow="Featured case studies"
        title="Real storefront systems, dashboards, and visual work framed as business-facing proof."
        summary="The work is organized around the problem, approach, execution, and result so buyers can understand what Brent builds and why the interface choices matter."
      />

      <div className="case-grid">
        {storeCaseStudies.map((study, index) => (
          <LiveSitePreviewCard study={study} featured={index < 2} key={study.url} />
        ))}
      </div>
    </section>
  );
}
