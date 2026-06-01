import { ArrowRight, Mail, MapPin, Radar } from 'lucide-react'
import { MagneticButton } from '../components/ui/MagneticButton'

const projectChips = ['Website', 'Automation', 'AI / Intelligence']

export function FinalCTA() {
  return (
    <section className="final-cta" id="contact" data-scene="cta">
      <div className="launch-terminal glass-surface glass-surface--strong" data-reveal>
        <p className="eyebrow">
          <Radar size={16} aria-hidden="true" />
          Launch terminal
        </p>
        <h2>Ready to turn a messy idea, workflow, or business presence into a working system?</h2>
        <p>
          Start with the signal: a better website, cleaner automation path, AI assistant, or Eidos-style intelligence prototype. I’ll help shape it into something business-ready and human-reviewable.
        </p>
        <div className="terminal-chips" aria-label="Project types">
          {projectChips.map((chip) => <span className="glass-chip" key={chip}>{chip}</span>)}
        </div>
        <div className="hero-actions">
          <MagneticButton href="mailto:bmparent@outlook.com?subject=Project%20Signal">
            Start a Project
            <ArrowRight size={16} aria-hidden="true" />
          </MagneticButton>
          <MagneticButton href="mailto:bmparent@outlook.com?subject=Systems%20audit%20request" variant="secondary">
            Start with a Systems Audit
          </MagneticButton>
          <MagneticButton href="#eidos" variant="quiet">
            Explore Eidos
          </MagneticButton>
        </div>
        <div className="contact-strip">
          <a href="mailto:bmparent@outlook.com">
            <Mail size={16} aria-hidden="true" />
            bmparent@outlook.com
          </a>
          <span>
            <MapPin size={16} aria-hidden="true" />
            Central Florida
          </span>
        </div>
      </div>
    </section>
  )
}
