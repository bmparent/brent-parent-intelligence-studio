import { BadgeCheck, Layers3, Sparkles } from 'lucide-react'
import { SectionShell } from '../components/layout/SectionShell'
import { CapabilityTag } from '../components/ui/CapabilityTag'
import { portraitUrl } from '../data/links'
import { clearSceneFocus, emitSceneFocus } from '../three/utils/pointerState'

const proofPoints = [
  'Web development and online marketing since 2010',
  'Print/promotions operations since 2015',
  'WordPress, Joomla, Adobe Photoshop, Python, ChatGPT, and AI workflows',
  'Operational leadership across production departments',
]

export function BuilderProfile() {
  return (
    <SectionShell
      id="profile"
      eyebrow="Builder Profile"
      title="Operator-built. System-minded. Technically curious."
      intro="The work is grounded in real operations, not just visual taste or abstract architecture."
      className="profile-section"
    >
      <div className="profile-grid">
        <figure
          className="operator-frame"
          onMouseEnter={() => emitSceneFocus('builder-profile', 0.9)}
          onMouseLeave={clearSceneFocus}
          data-reveal
        >
          <img src={portraitUrl} alt="Portrait of Brent Parent" loading="lazy" />
          <figcaption>
            <Sparkles size={16} aria-hidden="true" />
            Creative technologist / systems builder
          </figcaption>
        </figure>
        <div className="profile-copy" data-reveal>
          <p>
            I build from the inside of real operations. My background spans web
            development, online marketing, graphic design, print production, ecommerce
            storefronts, embroidery, digital workflows, shipping, automation, and AI
            experimentation. That mix gives me a practical advantage: I understand how
            systems look from the outside, but also how they break from the inside.
          </p>
          <p>
            That is why my work focuses on more than visuals. I build tools, websites,
            automations, and intelligence layers that help businesses reduce friction,
            present themselves better, and understand what is happening inside their
            workflows.
          </p>
          <div className="profile-proof">
            {proofPoints.map((point) => (
              <span key={point}>
                <BadgeCheck size={16} aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
          <div className="tag-cloud">
            {['Web systems', 'Print operations', 'Python automation', 'AI workflows', 'Google Cloud'].map(
              (tag) => (
                <CapabilityTag key={tag} label={tag} tone="green" />
              ),
            )}
          </div>
          <div className="operator-note">
            <Layers3 size={18} aria-hidden="true" />
            <span>Visual systems, workflow systems, and intelligence systems treated as one connected practice.</span>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
