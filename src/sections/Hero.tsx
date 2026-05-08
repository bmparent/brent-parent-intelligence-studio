import { ArrowDown, ArrowRight, BrainCircuit, Radar, ScanFace, Signal } from 'lucide-react'
import { motion } from 'framer-motion'
import { MagneticButton } from '../components/ui/MagneticButton'
import { portraitUrl } from '../data/links'

export function Hero() {
  return (
    <section className="hero-section" id="top" data-scene="hero">
      <div className="hero-layout">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">
            <Radar size={16} aria-hidden="true" />
            Living intelligence studio
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Advanced Web Experiences, Automation Systems, and Operational Intelligence.
          </motion.h1>
          <p className="hero-subhead">
            I help businesses create premium digital experiences, automate messy workflows,
            deploy AI-assisted tools, and turn scattered operational signals into clear next
            actions.
          </p>
          <p className="hero-proof">
            Built from hands-on experience in web development, print production, ecommerce
            operations, Python automation, Google Cloud, WordPress, Three.js, AI systems,
            and real business workflows.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <MagneticButton href="#services">
              Explore Services
              <ArrowRight size={16} aria-hidden="true" />
            </MagneticButton>
            <MagneticButton href="#case-studies" variant="secondary">
              View Case Studies
            </MagneticButton>
            <MagneticButton href="mailto:bmparent@outlook.com?subject=Project%20quote%20request" variant="quiet">
              Request a Project Quote
            </MagneticButton>
            <MagneticButton href="#eidos" variant="quiet">
              <BrainCircuit size={16} aria-hidden="true" />
              Explore Eidos Brain
            </MagneticButton>
          </div>
        </div>

        <motion.figure
          className="hero-portrait-panel"
          initial={{ opacity: 0, x: 34, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          data-reveal
        >
          <div className="hero-portrait-panel__image">
            <img src={portraitUrl} alt="Brent Parent" />
          </div>
          <figcaption>
            <span>
              <ScanFace size={15} aria-hidden="true" />
              Brent Parent
            </span>
            <small>
              <Signal size={14} aria-hidden="true" />
              Creative technologist / systems builder
            </small>
          </figcaption>
        </motion.figure>
      </div>
      <a className="scroll-cue" href="#capabilities" aria-label="Scroll to capabilities">
        <ArrowDown size={18} aria-hidden="true" />
        Signal map
      </a>
    </section>
  )
}
