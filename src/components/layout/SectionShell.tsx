import type { ReactNode } from 'react'

type SectionShellProps = {
  id: string
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
  className?: string
}

export function SectionShell({ id, eyebrow, title, intro, children, className }: SectionShellProps) {
  return (
    <section className={`section-shell ${className ?? ''}`} id={id} data-scene={id}>
      <div className="section-heading" data-reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {intro ? <p className="section-intro">{intro}</p> : null}
      </div>
      {children}
    </section>
  )
}
