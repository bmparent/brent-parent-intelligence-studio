import { ArrowDown, ArrowRight, BrainCircuit, Radar, ScanFace, Signal } from 'lucide-react'
import { motion } from 'framer-motion'
import { MagneticButton } from '../components/ui/MagneticButton'
import { portraitUrl } from '../data/links'

const statusItems = [
  ['Advanced Web', 'Interactive', 'cyan'],
  ['Automation', 'Workflow-ready', 'green'],
  ['AI Systems', 'Prototype phase', 'violet'],
  ['Operational Intelligence', 'Human-reviewable', 'amber'],
]

const stackItems = ['Vite', 'React', 'GSAP', 'Three.js / Babylon-ready', 'Cloudinary']

export function Hero() {
  return (
    <section className="hero-section" id="top" data-scene="hero">
      <div className="hero-layout">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">
            <Radar size={16} aria-hidden="true" />
            Glass Intelligence Studio
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium websites, workflow automation, and human-reviewable AI systems.
          </motion.h1>
          <p className="hero-subhead">
            I help businesses turn unclear digital presence, messy internal workflows, and scattered operational signals into useful web experiences and working systems.
          </p>
          <p className="hero-proof">
            Brent Parent / Intelligence Studio is a hands-on build practice for business owners, print shops, ecommerce teams, and founders who need practical execution—not generic AI theater.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <MagneticButton href="mailto:bmparent@outlook.com?subject=Project%20Signal">
              Start a Project
              <ArrowRight size={16} aria-hidden="true" />
            </MagneticButton>
            <MagneticButton href="#case-studies" variant="secondary">
              View Systems
            </MagneticButton>
            <MagneticButton href="#eidos" variant="quiet">
              <BrainCircuit size={16} aria-hidden="true" />
              Explore Eidos
            </MagneticButton>
          </div>
        </div>

        <div className="hero-command-stack" data-reveal>
          <motion.figure
            className="hero-portrait-panel glass-surface glass-surface--cyan"
            initial={{ opacity: 0, x: 34, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-portrait-panel__image">
              <img
                src={portraitUrl}
                alt="Brent Parent"
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.style.opacity = '0'
                }}
              />
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

          <aside className="studio-status glass-surface glass-surface--strong" aria-label="Studio status">
            <div className="studio-status__header">
              <span className="status-dot status-dot--green" aria-hidden="true" />
              <div>
                <strong>Studio Status</strong>
                <small>Available for select builds</small>
              </div>
            </div>
            <div className="studio-status__grid">
              {statusItems.map(([label, value, tone]) => (
                <div className="scene-status" key={label}>
                  <span className={`status-dot status-dot--${tone}`} aria-hidden="true" />
                  <strong>{label}</strong>
                  <small>{value}</small>
                </div>
              ))}
            </div>
            <div className="engine-stack" aria-label="Engine stack">
              {stackItems.map((item) => (
                <span className="engine-badge" key={item}>{item}</span>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <a className="scroll-cue" href="#capabilities" aria-label="Scroll to capabilities">
        <ArrowDown size={18} aria-hidden="true" />
        Signal map
      </a>
    </section>
  )
}
