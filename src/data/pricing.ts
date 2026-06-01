export type PricePackage = {
  id: string
  name: string
  startingAt: string
  bestFit: string
  summary: string
  includes: string[]
  cta: string
  subject: string
  advancedRange?: string
}

export const pricing: PricePackage[] = [
  {
    id: 'launch-module',
    name: 'Launch Module',
    startingAt: '$1,500+',
    bestFit: 'Business sites, landing pages, branded storefronts, and premium frontend polish.',
    summary:
      'For businesses that need a sharper digital presence, clearer service pages, or a more memorable launch experience.',
    includes: [
      'Business website or landing page direction',
      'Conversion-focused page structure',
      'Responsive glass interface polish',
      'WordPress, React, or InkSoft path depending on the build',
      'Cloudinary-ready media handling',
      'Launch checklist and handoff notes',
    ],
    cta: 'Start a launch build',
    subject: 'Launch%20Module%20Scope',
    advancedRange: 'Interactive React/WebGL builds typically start at $3,500+ depending on scope.',
  },
  {
    id: 'automation-module',
    name: 'Automation Module',
    startingAt: '$2,500+',
    bestFit: 'Messy workflows, Sheets, Printavo, InkSoft, reporting, and internal tools.',
    summary:
      'For teams that want to reduce repetitive work, clean up handoffs, and make operations easier to manage.',
    includes: [
      'Workflow audit and signal map',
      'Sheets, Apps Script, Python, or API control layer',
      'Printavo / InkSoft handoff cleanup where relevant',
      'Reporting or internal utility prototype',
      'Testing path and staff-facing documentation',
      'Post-launch refinement recommendations',
    ],
    cta: 'Audit my workflow',
    subject: 'Automation%20Module%20Scope',
    advancedRange: 'Complex automations and dashboards commonly range from $5,000-$15,000+.',
  },
  {
    id: 'intelligence-prototype-module',
    name: 'Intelligence Prototype Module',
    startingAt: '$5,000+',
    bestFit: 'Dashboards, AI assistants, anomaly concepts, and Eidos-style operational intelligence systems.',
    summary:
      'For teams exploring AI-assisted tools, internal intelligence layers, or signal-monitoring prototypes.',
    includes: [
      'Signal inventory and prototype architecture',
      'Assistant, dashboard, or incident-card interface direction',
      'Anomaly / risk logic concepting',
      'Human-reviewable recommendation flow',
      'Google Cloud deployment path where useful',
      'Prototype limits, assumptions, and next-step plan',
    ],
    cta: 'Scope an intelligence prototype',
    subject: 'Intelligence%20Prototype%20Module%20Scope',
    advancedRange: 'Advanced multi-source intelligence systems are scoped separately after discovery.',
  },
]
