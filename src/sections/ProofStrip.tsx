import { BadgeCheck } from 'lucide-react'

const proofTokens = [
  'Web Development',
  'Print Production',
  'Ecommerce Operations',
  'Python Automation',
  'Google Cloud',
  'WordPress',
  'InkSoft',
  'Printavo',
  'Three.js',
  'GSAP',
  'Cloudinary',
  'AI Systems',
]

export function ProofStrip() {
  return (
    <section className="proof-strip glass-surface" aria-labelledby="proof-strip-title" data-scene="proof">
      <div className="proof-strip__copy" data-reveal>
        <p className="micro-label" id="proof-strip-title">
          <BadgeCheck size={14} aria-hidden="true" />
          Practical build experience across real business systems
        </p>
        <p>Hands-on work across design, web, production workflows, automation, and prototype intelligence.</p>
      </div>
      <div className="proof-strip__tokens" aria-label="Experience areas" data-reveal>
        {proofTokens.map((token) => (
          <span className="glass-chip" key={token}>{token}</span>
        ))}
      </div>
    </section>
  )
}
