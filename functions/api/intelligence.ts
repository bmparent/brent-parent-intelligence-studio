import { buildLocalFallback, selectKnowledge, type IntelligencePayload } from '../_shared/portfolioKnowledge'

interface Env {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
}

type PagesContext = {
  request: Request
  env: Env
}

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    mode: { type: 'string', enum: ['compass', 'concierge', 'automation', 'brief'] },
    archetype: { type: 'string' },
    headline: { type: 'string' },
    diagnosis: { type: 'string' },
    recommendedPath: { type: 'string' },
    estimatedFirstBuild: { type: 'string' },
    relevantProof: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' },
          href: { type: 'string' },
        },
        required: ['title', 'reason', 'href'],
      },
    },
    nextSteps: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: { type: 'string' },
    },
    cta: {
      type: 'object',
      additionalProperties: false,
      properties: {
        label: { type: 'string' },
        href: { type: 'string' },
      },
      required: ['label', 'href'],
    },
    questionsForBrent: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: { type: 'string' },
    },
    confidence: { type: 'string', enum: ['directional', 'strong', 'high'] },
    tokenNote: { type: 'string' },
    source: { type: 'string', enum: ['openai', 'local-fallback'] },
  },
  required: [
    'mode',
    'archetype',
    'headline',
    'diagnosis',
    'recommendedPath',
    'estimatedFirstBuild',
    'relevantProof',
    'nextSteps',
    'cta',
    'questionsForBrent',
    'confidence',
    'tokenNote',
    'source',
  ],
}

const cache = new Map<string, { expires: number; value: unknown }>()

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

const MAX_REQUEST_BYTES = 6000

function json(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers ?? {}) },
  })
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanStringArray(value: unknown, fallback: string[], maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return fallback

  const cleaned = value.map((item) => cleanString(item, maxLength)).filter(Boolean).slice(0, maxItems)
  return cleaned.length ? cleaned : fallback
}

function cleanProofList(value: unknown, fallback: Array<{ title: string; reason: string; href?: string }>) {
  if (!Array.isArray(value)) return fallback

  const cleaned = value
    .map((item) => {
      if (!isRecord(item)) return null

      const title = cleanString(item.title, 110)
      const reason = cleanString(item.reason, 220)
      const href = cleanString(item.href, 260)

      if (!title || !reason) return null
      return { title, reason, href }
    })
    .filter(Boolean)
    .slice(0, 3) as Array<{ title: string; reason: string; href: string }>

  return cleaned.length ? cleaned : fallback
}

function cleanPayload(raw: unknown): IntelligencePayload {
  const body = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const answers = body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {}

  const mode = ['compass', 'concierge', 'automation', 'brief'].includes(String(body.mode))
    ? (String(body.mode) as IntelligencePayload['mode'])
    : 'compass'

  return {
    mode,
    prompt: cleanString(body.prompt, 900),
    answers: {
      projectType: cleanString(answers.projectType, 90),
      businessType: cleanString(answers.businessType, 90),
      currentStack: cleanString(answers.currentStack, 140),
      pain: cleanString(answers.pain, 180),
      timeline: cleanString(answers.timeline, 80),
      budget: cleanString(answers.budget, 80),
    },
    signals: Array.isArray(body.signals) ? body.signals.map((item) => cleanString(item, 60)).filter(Boolean).slice(0, 9) : [],
    localMatchIds: Array.isArray(body.localMatchIds)
      ? body.localMatchIds.map((item) => cleanString(item, 80)).filter(Boolean).slice(0, 4)
      : [],
  }
}

function getTextFromOpenAIResponse(data: Record<string, unknown>) {
  if (typeof data.output_text === 'string') return data.output_text

  const output = Array.isArray(data.output) ? data.output : []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as Array<Record<string, unknown>>)
      : []

    for (const block of content) {
      if (typeof block.text === 'string') return block.text
    }
  }

  return ''
}

function buildCacheKey(payload: IntelligencePayload) {
  return JSON.stringify({
    mode: payload.mode,
    prompt: payload.prompt?.toLowerCase(),
    answers: payload.answers,
    signals: payload.signals,
    localMatchIds: payload.localMatchIds,
  })
}

function normalizeOpenAIResult(raw: unknown, fallback: ReturnType<typeof buildLocalFallback>) {
  const value = isRecord(raw) ? raw : {}
  const openAITokenNote = 'OpenAI generated this structured brief from compact visitor signals and selected portfolio context.'

  return {
    ...fallback,
    mode: ['compass', 'concierge', 'automation', 'brief'].includes(String(value.mode)) ? value.mode : fallback.mode,
    archetype: cleanString(value.archetype, 120) || fallback.archetype,
    headline: cleanString(value.headline, 180) || fallback.headline,
    diagnosis: cleanString(value.diagnosis, 420) || fallback.diagnosis,
    recommendedPath: cleanString(value.recommendedPath, 180) || fallback.recommendedPath,
    estimatedFirstBuild: cleanString(value.estimatedFirstBuild, 220) || fallback.estimatedFirstBuild,
    relevantProof: cleanProofList(value.relevantProof, fallback.relevantProof),
    nextSteps: cleanStringArray(value.nextSteps, fallback.nextSteps, 4, 180),
    cta: isRecord(value.cta)
      ? {
          label: cleanString(value.cta.label, 80) || fallback.cta.label,
          href: cleanString(value.cta.href, 260) || fallback.cta.href,
        }
      : fallback.cta,
    questionsForBrent: cleanStringArray(value.questionsForBrent, fallback.questionsForBrent, 4, 180),
    confidence: ['directional', 'strong', 'high'].includes(String(value.confidence)) ? value.confidence : fallback.confidence,
    tokenNote: openAITokenNote,
    source: 'openai',
  }
}

export const onRequestOptions = () =>
  new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  })

export const onRequestPost = async ({ request, env }: PagesContext) => {
  let payload: IntelligencePayload

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: 'Request body is too large.' }, { status: 413 })
  }

  try {
    payload = cleanPayload(await request.json())
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const cacheKey = buildCacheKey(payload)
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return json(cached.value)

  const fallback = buildLocalFallback(payload)

  if (!env.OPENAI_API_KEY) {
    return json(fallback)
  }

  const context = selectKnowledge(payload, 3).map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    summary: entry.summary,
    proof: entry.proof,
    href: entry.href ?? '',
    recommendedPath: entry.recommendedPath,
  }))

  const systemPrompt = [
    'You are the compact intelligence layer for Brent Parent Intelligence Studio.',
    'Your job is to turn a visitor signal into a concise project diagnosis, proof match, and next action.',
    'Do not invent case studies, clients, metrics, timelines, or prices.',
    'Use only the provided portfolio context for proof references.',
    'Keep the language premium, practical, business-facing, and specific.',
    'Prefer short outputs. No markdown. No long chatty paragraphs.',
    'Set source to openai.',
    'The visitor is evaluating Brent Parent as a creative technologist, automation builder, UI/UX designer, and intelligence-systems developer.',
  ].join(' ')

  const userContext = {
    mode: payload.mode,
    visitorPrompt: payload.prompt,
    answers: payload.answers,
    signals: payload.signals,
    matchedPortfolioContext: context,
    fallbackRecommendation: fallback,
    requiredCTA: fallback.cta,
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        store: false,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userContext) },
        ],
        max_output_tokens: 650,
        temperature: 0.35,
        text: {
          format: {
            type: 'json_schema',
            name: 'portfolio_intelligence_response',
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    })

    if (!openAIResponse.ok) {
      console.warn('OpenAI Responses API error', openAIResponse.status)
      return json(fallback)
    }

    const data = (await openAIResponse.json()) as Record<string, unknown>
    const outputText = getTextFromOpenAIResponse(data)
    const parsed = JSON.parse(outputText) as Record<string, unknown>
    const value = normalizeOpenAIResult(parsed, fallback)

    cache.set(cacheKey, { expires: Date.now() + 1000 * 60 * 15, value })
    return json(value)
  } catch {
    console.warn('Portfolio intelligence fallback used')
    return json(fallback)
  }
}
