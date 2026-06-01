import { CheckCircle2 } from 'lucide-react'
import { SectionShell } from '../components/layout/SectionShell'
import { clearSceneFocus, emitSceneFocus } from '../babylon/utils/pointerState'

const steps = ['Discover', 'Map', 'Design', 'Build', 'Deploy', 'Refine']

export function Process() {
  return (
    <SectionShell
      id="process"
      eyebrow="Process"
      title="From business problem to deployed system."
      intro="I start by understanding the business problem, not just the interface. Then I map the workflow, design the system, build the prototype or production experience, test it in realistic conditions, and refine it into something the business can actually use."
      className="process-section"
    >
      <ol className="process-path" data-reveal>
        {steps.map((step, index) => (
          <li
            key={step}
            onMouseEnter={() => emitSceneFocus(step.toLowerCase(), 0.7)}
            onMouseLeave={clearSceneFocus}
          >
            <span className="process-path__index">{String(index + 1).padStart(2, '0')}</span>
            <CheckCircle2 size={18} aria-hidden="true" />
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
      <div className="process-output" data-reveal>
        <p className="micro-label">Final state</p>
        <h3>Deployed clarity</h3>
        <p>
          A sharper website, cleaner handoff, better dashboard, smarter assistant, or
          intelligence layer that helps the business see and act.
        </p>
      </div>
    </SectionShell>
  )
}
