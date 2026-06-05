import { processSteps } from '../data/portfolio';
import { SectionHeader } from './SectionHeader';

export function Process() {
  return (
    <section id="process" className="section-shell section-block process" aria-labelledby="process-title">
      <SectionHeader
        id="process-title"
        eyebrow="How I work"
        title="A clear process keeps the work premium, practical, and launchable."
        summary="The client experience is designed to reduce ambiguity. First map the system, then design the path, then build, test, launch, and improve from real feedback."
      />

      <div className="process-timeline" data-reveal>
        {processSteps.map((step, index) => (
          <article className="process-step" key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
