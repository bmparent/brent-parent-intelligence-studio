import { Mail, Sparkles } from 'lucide-react'

const links = [
  { label: 'Website', href: 'mailto:bmparent@outlook.com?subject=Project%20Signal%20-%20Website' },
  { label: 'Automation', href: 'mailto:bmparent@outlook.com?subject=Project%20Signal%20-%20Automation' },
  { label: 'AI / Intelligence', href: 'mailto:bmparent@outlook.com?subject=Project%20Signal%20-%20AI%20Intelligence' },
]

export function ProjectSignalDock() {
  return (
    <aside className="project-signal-dock glass-surface glass-surface--strong" aria-label="Project Signal quick contact">
      <div className="project-signal-dock__header">
        <span className="status-dot status-dot--green" aria-hidden="true" />
        <span>Project Signal</span>
        <Sparkles size={14} aria-hidden="true" />
      </div>
      <a className="project-signal-dock__main" href="mailto:bmparent@outlook.com?subject=Project%20Signal">
        <Mail size={15} aria-hidden="true" />
        Tell me what you’re building
      </a>
      <div className="project-signal-dock__links" aria-label="Project type shortcuts">
        {links.map((link) => (
          <a href={link.href} key={link.label}>{link.label}</a>
        ))}
      </div>
    </aside>
  )
}
