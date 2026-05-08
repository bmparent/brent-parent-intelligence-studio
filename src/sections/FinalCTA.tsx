import { ArrowRight, Mail, MapPin, Radar } from 'lucide-react'
import { MagneticButton } from '../components/ui/MagneticButton'

export function FinalCTA() {
  return (
    <section className="final-cta" id="contact" data-scene="cta">
      <div data-reveal>
        <p className="eyebrow">
          <Radar size={16} aria-hidden="true" />
          Start a project
        </p>
        <h2>Need more than a normal website?</h2>
        <p>
          I build premium web experiences, workflow automations, AI assistants, and
          operational intelligence systems for businesses that want to look sharper,
          move faster, and understand their own operations more clearly.
        </p>
        <div className="hero-actions">
          <MagneticButton href="mailto:bmparent@outlook.com?subject=Project%20quote%20request">
            Request a Project Quote
            <ArrowRight size={16} aria-hidden="true" />
          </MagneticButton>
          <MagneticButton href="mailto:bmparent@outlook.com?subject=Systems%20audit%20request" variant="secondary">
            Start with a Systems Audit
          </MagneticButton>
          <MagneticButton href="#eidos" variant="quiet">
            Explore Eidos Brain
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
