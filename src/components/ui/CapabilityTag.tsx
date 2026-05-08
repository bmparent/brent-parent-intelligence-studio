type CapabilityTagProps = {
  label: string
  tone?: 'blue' | 'cyan' | 'violet' | 'amber' | 'green' | 'danger'
}

export function CapabilityTag({ label, tone = 'cyan' }: CapabilityTagProps) {
  return <span className={`capability-tag capability-tag--${tone}`}>{label}</span>
}
