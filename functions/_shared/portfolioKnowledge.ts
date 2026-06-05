export type IntelligenceMode = 'compass' | 'concierge' | 'automation' | 'brief'

export interface IntelligenceAnswers {
  projectType?: string
  businessType?: string
  currentStack?: string
  pain?: string
  timeline?: string
  budget?: string
}

export interface IntelligencePayload {
  mode?: IntelligenceMode
  prompt?: string
  answers?: IntelligenceAnswers
  signals?: string[]
  localMatchIds?: string[]
}

export interface KnowledgeEntry {
  id: string
  title: string
  category: 'website' | 'automation' | 'dashboard' | 'ai' | 'storefront' | 'strategy'
  tags: string[]
  summary: string
  proof: string
  href?: string
  recommendedPath: string
}

export const portfolioKnowledge: KnowledgeEntry[] = [
  {
    id: 'portfolio-redesign',
    title: 'Premium Intelligence Studio Portfolio',
    category: 'website',
    tags: ['website', 'portfolio', 'brand', 'conversion', 'ux', 'seo', 'cloudflare', 'react', 'vite'],
    summary: 'Premium business-services showcase and operational intelligence platform demonstration for Brent Parent.',
    proof: 'Best when the visitor needs a more credible website, stronger positioning, and a clearer conversion path.',
    recommendedPath: 'Conversion-focused website and positioning sprint',
  },
  {
    id: 'inksoft-storefronts',
    title: 'InkSoft Storefront Systems',
    category: 'storefront',
    tags: ['inksoft', 'storefront', 'apparel', 'school', 'shop', 'merch', 'ecommerce', 'webstore'],
    summary: 'Branded apparel-store experiences and shopping flows for schools, organizations, events, and merch programs.',
    proof: 'Relevant for teams that need a better storefront experience without replacing the commerce platform.',
    href: '#case-studies',
    recommendedPath: 'Storefront UX upgrade with branded product pathways',
  },
  {
    id: 'dg-printavo-reports',
    title: 'DG Printavo Production Reports',
    category: 'dashboard',
    tags: ['printavo', 'dashboard', 'production', 'reporting', 'operations', 'kpi', 'workflow', 'shop'],
    summary: 'A dashboard/reporting system for filtering production work by department, date range, and operational context.',
    proof: 'Relevant when data exists but leaders need cleaner visibility, faster meetings, and more useful operational views.',
    href: 'https://dg-printavo-production-reports.1brent-bm.workers.dev/?range=custom&department=ALL&from=2026-06-04&to=2026-07-09',
    recommendedPath: 'Operational dashboard and reporting build',
  },
  {
    id: 'eidos-brain',
    title: 'Eidos Brain / Sentinel Intelligence Platform',
    category: 'ai',
    tags: ['ai', 'knowledge', 'memory', 'agent', 'eidos', 'sentinel', 'research', 'brief', 'assistant'],
    summary: 'A concept for organizing knowledge, signals, decisions, briefs, and operational context into an intelligence interface.',
    proof: 'Relevant when scattered knowledge should become searchable, structured, reusable, and connected to decisions.',
    href: '#eidos',
    recommendedPath: 'Knowledge-system prototype and AI brief workflow',
  },
  {
    id: 'automation-systems',
    title: 'Automation and Workflow Systems',
    category: 'automation',
    tags: ['automation', 'workflow', 'intake', 'routing', 'spreadsheet', 'manual', 'forms', 'ops'],
    summary: 'Targeted automations for repeated work across intake, routing, follow-up, reporting, and internal handoffs.',
    proof: 'Relevant for teams losing time to duplicate entry, spreadsheet cleanup, or manual updates across tools.',
    recommendedPath: 'Workflow audit and first automation build',
  },
  {
    id: 'uiux-system',
    title: 'UI/UX System and Component Direction',
    category: 'strategy',
    tags: ['ui', 'ux', 'design system', 'tokens', 'components', 'accessibility', 'responsive', 'motion'],
    summary: 'Clean UI/UX systems built around reusable components, clear hierarchy, responsive layout, accessibility, and conversion clarity.',
    proof: 'Relevant when the product or site needs a more coherent design language before adding more features.',
    recommendedPath: 'UI/UX system refresh and component cleanup',
  },
]

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ')

const hasAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(needle))

function scoreEntry(entry: KnowledgeEntry, payload: IntelligencePayload) {
  const mode = payload.mode ?? 'compass'
  const answers = payload.answers ?? {}
  const text = normalize([
    payload.prompt ?? '',
    answers.projectType ?? '',
    answers.businessType ?? '',
    answers.currentStack ?? '',
    answers.pain ?? '',
    answers.timeline ?? '',
    answers.budget ?? '',
    ...(payload.signals ?? []),
  ].join(' '))

  let score = payload.localMatchIds?.includes(entry.id) ? 6 : 0

  for (const tag of entry.tags) if (text.includes(normalize(tag))) score += 4

  if (mode === 'automation' && entry.category === 'automation') score += 8
  if (mode === 'brief' && ['ai', 'automation', 'dashboard'].includes(entry.category)) score += 5
  if (mode === 'concierge' && ['storefront', 'dashboard', 'ai'].includes(entry.category)) score += 4
  if (mode === 'compass' && ['website', 'automation', 'dashboard'].includes(entry.category)) score += 3

  if (hasAny(text, ['inksoft', 'apparel', 'store', 'merch', 'school']) && entry.category === 'storefront') score += 10
  if (hasAny(text, ['dashboard', 'report', 'kpi', 'printavo', 'production']) && entry.category === 'dashboard') score += 10
  if (hasAny(text, ['manual', 'repeat', 'copy', 'spreadsheet', 'intake', 'handoff']) && entry.category === 'automation') score += 10
  if (hasAny(text, ['ai', 'assistant', 'knowledge', 'brain', 'brief', 'agent']) && entry.category === 'ai') score += 10
  if (hasAny(text, ['website', 'portfolio', 'brand', 'seo', 'conversion']) && entry.category === 'website') score += 8

  return score
}

export function selectKnowledge(payload: IntelligencePayload, limit = 3) {
  return [...portfolioKnowledge]
    .map((entry) => ({ ...entry, score: scoreEntry(entry, payload) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, title, category, tags, summary, proof, href, recommendedPath }) => ({
      id,
      title,
      category,
      tags,
      summary,
      proof,
      href,
      recommendedPath,
    }))
}

export function buildLocalFallback(payload: IntelligencePayload) {
  const mode = payload.mode ?? 'compass'
  const context = selectKnowledge(payload, 3)
  const primary = context[0] ?? portfolioKnowledge[0]
  const secondary = context[1] ?? portfolioKnowledge[1]
  const text = normalize([
    payload.prompt ?? '',
    payload.answers?.pain ?? '',
    payload.answers?.projectType ?? '',
    ...(payload.signals ?? []),
  ].join(' '))

  const archetype = hasAny(text, ['spreadsheet', 'copy', 'manual', 'repeat', 'duplicate'])
    ? 'The Spreadsheet-Heavy Operator'
    : hasAny(text, ['dashboard', 'report', 'kpi', 'visibility', 'production'])
      ? 'The Data-Rich but Insight-Poor Team'
      : hasAny(text, ['store', 'inksoft', 'apparel', 'merch', 'school'])
        ? 'The Brand That Outgrew the Template Store'
        : hasAny(text, ['ai', 'assistant', 'knowledge', 'docs', 'brain'])
          ? 'The Knowledge-Heavy Business'
          : hasAny(text, ['website', 'portfolio', 'brand', 'conversion'])
            ? 'The Offer That Needs a Sharper Front Door'
            : 'The Bottlenecked Builder'

  return {
    mode,
    archetype,
    headline: 'Your strongest next move is a focused system sprint, not a generic rebuild.',
    diagnosis:
      'The inputs point to a project that should reduce friction, clarify the offer or workflow, and create a useful first build before expanding into a larger system.',
    recommendedPath: primary.recommendedPath,
    estimatedFirstBuild:
      mode === 'automation'
        ? 'A workflow map, one high-friction automation, and a simple status or reporting layer.'
        : 'A focused first release that proves value before expanding the system.',
    relevantProof: context.map((entry) => ({ title: entry.title, reason: entry.proof, href: entry.href })),
    nextSteps: [
      `Start with ${primary.recommendedPath}.`,
      `Use ${secondary.title} as the nearest proof reference.`,
      'Define the smallest useful first deliverable before expanding scope.',
      'Send Brent this brief so the next conversation starts with context.',
    ],
    cta: {
      label: 'Send this brief to Brent',
      href: 'mailto:1brent.bm@gmail.com?subject=Project%20brief%20from%20the%20Intelligence%20Studio',
    },
    questionsForBrent: [
      'What current system, page, report, or workflow is causing the most friction?',
      'What outcome would make the first version worth shipping?',
      'Which tools and data sources are already involved?',
    ],
    confidence: payload.prompt || payload.signals?.length ? 'strong' : 'directional',
    tokenNote: 'Local fallback used because the OpenAI secret was unavailable or the model call failed.',
    source: 'local-fallback',
  }
}
