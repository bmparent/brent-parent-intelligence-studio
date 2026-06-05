import { intelligenceKnowledge } from '../data/intelligenceKnowledge'
import type {
  IntelligenceAnswers,
  IntelligenceMode,
  LocalKnowledgeEntry,
  LocalRecommendation,
} from '../types/intelligence'

const defaultAnswers: IntelligenceAnswers = {
  projectType: '',
  businessType: '',
  currentStack: '',
  pain: '',
  timeline: '',
  budget: '',
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ')

const hasAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(needle))

function scoreEntry(
  entry: LocalKnowledgeEntry,
  mode: IntelligenceMode,
  prompt: string,
  answers: IntelligenceAnswers,
  signals: string[],
) {
  const text = normalize([
    prompt,
    answers.projectType,
    answers.businessType,
    answers.currentStack,
    answers.pain,
    answers.timeline,
    answers.budget,
    ...signals,
  ].join(' '))

  let score = 0

  for (const tag of entry.tags) {
    if (text.includes(normalize(tag))) score += 4
  }

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

function getArchetype(prompt: string, answers: IntelligenceAnswers, signals: string[]) {
  const text = normalize([prompt, answers.pain, answers.projectType, answers.currentStack, ...signals].join(' '))

  if (hasAny(text, ['spreadsheet', 'copy', 'manual', 'repeat', 'duplicate'])) return 'The Spreadsheet-Heavy Operator'
  if (hasAny(text, ['dashboard', 'report', 'kpi', 'visibility', 'production'])) return 'The Data-Rich but Insight-Poor Team'
  if (hasAny(text, ['store', 'inksoft', 'apparel', 'merch', 'school'])) return 'The Brand That Outgrew the Template Store'
  if (hasAny(text, ['ai', 'assistant', 'knowledge', 'docs', 'brain'])) return 'The Knowledge-Heavy Business'
  if (hasAny(text, ['website', 'portfolio', 'brand', 'conversion'])) return 'The Offer That Needs a Sharper Front Door'

  return 'The Bottlenecked Builder'
}

export function buildLocalRecommendation(input: {
  mode: IntelligenceMode
  prompt?: string
  answers?: Partial<IntelligenceAnswers>
  signals?: string[]
}): LocalRecommendation & { context: LocalKnowledgeEntry[] } {
  const mode = input.mode
  const prompt = input.prompt ?? ''
  const answers = { ...defaultAnswers, ...input.answers }
  const signals = input.signals ?? []

  const context = [...intelligenceKnowledge]
    .map((entry) => ({ entry, score: scoreEntry(entry, mode, prompt, answers, signals) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entry }) => entry)

  const primary = context[0] ?? intelligenceKnowledge[0]
  const secondary = context[1] ?? intelligenceKnowledge[1]
  const archetype = getArchetype(prompt, answers, signals)

  const modeHeadline: Record<IntelligenceMode, string> = {
    compass: 'Your strongest next move is a focused system sprint, not a generic rebuild.',
    concierge: 'The closest proof path is already in the portfolio - start with the matching case study.',
    automation: 'There is likely a repeatable workflow hiding behind the pain point.',
    brief: 'This is ready to become a clean project brief Brent can respond to quickly.',
  }

  const diagnosisByMode: Record<IntelligenceMode, string> = {
    compass:
      'The signals point to a project that should clarify the offer, reduce friction, and create one obvious next action for the visitor or operator.',
    concierge:
      'The request maps best to a small number of existing proof points, so the site should route the visitor to those examples instead of making them browse everything.',
    automation:
      'The pain is probably not the individual task itself; it is the handoff pattern around intake, tracking, reporting, and follow-up.',
    brief:
      'The messy version is useful. It contains enough context to shape a first diagnostic conversation and identify the smallest valuable build.',
  }

  return {
    archetype,
    headline: modeHeadline[mode],
    diagnosis: diagnosisByMode[mode],
    recommendedPath: primary.recommendedPath,
    estimatedFirstBuild:
      mode === 'automation'
        ? 'A workflow map, one high-friction automation, and a simple status/reporting layer.'
        : mode === 'brief'
          ? 'A short discovery brief, proof match, scope outline, and first build recommendation.'
          : 'A focused first release that proves value before expanding the system.',
    relevantProof: context.map((entry) => ({
      title: entry.title,
      reason: entry.proof,
      href: entry.href,
    })),
    nextSteps: [
      `Start with ${primary.recommendedPath}.`,
      `Use ${secondary.title} as the nearest proof reference.`,
      'Define the first useful deliverable before expanding into a larger system.',
      'Send Brent the short brief so the next conversation starts with context instead of a blank page.',
    ],
    cta: {
      label: 'Send this brief to Brent',
      href: 'mailto:1brent.bm@gmail.com?subject=Project%20brief%20from%20the%20Intelligence%20Studio',
    },
    confidence: prompt || signals.length || Object.values(answers).some(Boolean) ? 'strong' : 'directional',
    context,
  }
}
