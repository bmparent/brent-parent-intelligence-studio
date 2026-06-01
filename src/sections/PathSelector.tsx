import { ArrowRight, Bot, Workflow, MonitorSmartphone } from 'lucide-react'

const paths = [
  {
    href: '#services',
    label: 'Route 01',
    title: 'I need a better website',
    summary: 'Business websites, premium frontends, storefront polish, and clearer conversion paths.',
    icon: MonitorSmartphone,
  },
  {
    href: '#services',
    label: 'Route 02',
    title: 'I need workflow automation',
    summary: 'Printavo, InkSoft, Sheets, Python, and internal tools that reduce repeated manual work.',
    icon: Workflow,
  },
  {
    href: '#eidos',
    label: 'Route 03',
    title: 'I want an AI / intelligence prototype',
    summary: 'Assistants, anomaly detection, dashboards, and operational intelligence concepts.',
    icon: Bot,
  },
]

export function PathSelector() {
  return (
    <section className="path-selector section-shell" aria-labelledby="path-selector-title" data-scene="path-selector">
      <div className="section-heading" data-reveal>
        <p className="eyebrow">Business signal router</p>
        <h2 id="path-selector-title">Choose the path that matches what you need built.</h2>
        <p className="section-intro">Start with the business problem. The technical system follows from there.</p>
      </div>
      <div className="path-selector__grid">
        {paths.map(({ href, label, title, summary, icon: Icon }) => (
          <a className="path-card glass-surface glass-surface--interactive" href={href} key={title} data-reveal>
            <span className="path-card__icon" aria-hidden="true"><Icon size={22} /></span>
            <span className="micro-label">{label}</span>
            <strong>{title}</strong>
            <p>{summary}</p>
            <span className="path-card__cta">Route signal <ArrowRight size={15} aria-hidden="true" /></span>
          </a>
        ))}
      </div>
    </section>
  )
}
