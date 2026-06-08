import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import '../../styles/intelligence-agent.css'
import { signalOptions } from '../../data/intelligenceKnowledge'
import { buildLocalRecommendation } from '../../lib/intelligenceRouter'
import type {
  IntelligenceAnswers,
  IntelligenceMode,
  IntelligenceRequestPayload,
  IntelligenceResult,
} from '../../types/intelligence'

const modes: Array<{
  id: IntelligenceMode
  label: string
  eyebrow: string
  description: string
}> = [
  {
    id: 'compass',
    label: 'Project Compass',
    eyebrow: 'Find the right build',
    description: 'A guided diagnostic that maps a visitor to the most useful Eidos Works path.',
  },
  {
    id: 'concierge',
    label: 'Case Study Concierge',
    eyebrow: 'Route to proof',
    description: 'Ask what Brent has built and get the closest proof path instead of browsing blindly.',
  },
  {
    id: 'automation',
    label: 'Automation Scanner',
    eyebrow: 'Spot bottlenecks',
    description: 'Describe a repeating task and turn it into an automation opportunity.',
  },
  {
    id: 'brief',
    label: 'Eidos Brief Builder',
    eyebrow: 'Make it actionable',
    description: 'Turn a messy project idea into a clean first conversation brief.',
  },
]

const starterPrompts: Record<IntelligenceMode, string[]> = {
  compass: [
    'I need my website to feel more premium and generate better leads.',
    'I need a dashboard or workflow system for my team.',
    'I have a messy process and I am not sure what kind of build I need.',
  ],
  concierge: [
    'Have you built anything for apparel stores or InkSoft?',
    'Show me the most relevant proof for dashboards and reporting.',
    'What work connects to AI assistants or knowledge systems?',
  ],
  automation: [
    'We copy the same order details between tools every week.',
    'Reporting takes hours because the data is scattered.',
    'Customer intake, follow-up, and status updates are too manual.',
  ],
  brief: [
    'I have an idea for a smarter client portal but do not know the scope.',
    'Our team needs one place to understand work, status, and next steps.',
    'I want AI in the business, but only where it is actually useful.',
  ],
}

const initialAnswers: IntelligenceAnswers = {
  projectType: 'Not sure yet',
  businessType: '',
  currentStack: '',
  pain: '',
  timeline: 'Exploring',
  budget: 'Not sure yet',
}

function createFallbackResult(mode: IntelligenceMode, local: ReturnType<typeof buildLocalRecommendation>): IntelligenceResult {
  return {
    mode,
    archetype: local.archetype,
    headline: local.headline,
    diagnosis: local.diagnosis,
    recommendedPath: local.recommendedPath,
    estimatedFirstBuild: local.estimatedFirstBuild,
    relevantProof: local.relevantProof,
    nextSteps: local.nextSteps,
    cta: local.cta,
    confidence: local.confidence,
    questionsForBrent: [
      'What system or process is causing the most friction right now?',
      'What would a useful first version need to prove?',
      'Which tools, sites, forms, or reports already exist?',
    ],
    tokenNote: 'Local fallback used. The diagnostic can still build a useful brief when the API is unavailable.',
    source: 'local-fallback',
  }
}

function resultToClipboardText(result: IntelligenceResult) {
  return [
    `Archetype: ${result.archetype}`,
    `Headline: ${result.headline}`,
    `Diagnosis: ${result.diagnosis}`,
    `Recommended path: ${result.recommendedPath}`,
    `First build: ${result.estimatedFirstBuild}`,
    '',
    'Relevant proof:',
    ...result.relevantProof.map((proof) => `- ${proof.title}: ${proof.reason}${proof.href ? ` (${proof.href})` : ''}`),
    '',
    'Next steps:',
    ...result.nextSteps.map((step) => `- ${step}`),
    '',
    'Questions for Brent:',
    ...result.questionsForBrent.map((question) => `- ${question}`),
  ].join('\n')
}

export function IntelligenceStudioAgent() {
  const [mode, setMode] = useState<IntelligenceMode>('compass')
  const [prompt, setPrompt] = useState('')
  const [answers, setAnswers] = useState<IntelligenceAnswers>(initialAnswers)
  const [signals, setSignals] = useState<string[]>(['Website redesign', 'Workflow automation'])
  const [result, setResult] = useState<IntelligenceResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const activeMode = modes.find((item) => item.id === mode) ?? modes[0]
  const localRecommendation = useMemo(
    () => buildLocalRecommendation({ mode, prompt, answers, signals }),
    [answers, mode, prompt, signals],
  )

  const updateAnswer = (key: keyof IntelligenceAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  const toggleSignal = (signal: string) => {
    setSignals((current) =>
      current.includes(signal) ? current.filter((item) => item !== signal) : [...current, signal],
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setCopied(false)

    const payload: IntelligenceRequestPayload = {
      mode,
      prompt: prompt.trim(),
      answers,
      signals,
      localMatchIds: localRecommendation.context.map((entry) => entry.id),
    }

    try {
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Intelligence API returned ${response.status}`)

      const data = (await response.json()) as IntelligenceResult
      setResult(data)
      setStatus('done')
    } catch (error) {
      console.info('Using local intelligence fallback:', error)
      setResult(createFallbackResult(mode, localRecommendation))
      setStatus('error')
    }
  }

  const copyResult = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(resultToClipboardText(result))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="intelligence-agent section" id="intelligence-agent" data-reveal data-scene="agent">
      <div className="agent-shell">
        <div className="agent-heading-block">
          <p className="section-eyebrow">Interactive diagnostic layer</p>
          <h2 className="section-heading">Start with a diagnostic, not a chatbot.</h2>
          <p className="section-lede">
            A lightweight Eidos Works interface that routes visitors to the right proof, service path, and next action from compact project signals.
          </p>
        </div>

        <div className="agent-layout">
          <aside className="agent-mode-panel" aria-label="Choose an intelligence mode">
            {modes.map((item) => (
              <button
                className={`agent-mode-card${item.id === mode ? ' is-active' : ''}`}
                key={item.id}
                type="button"
                aria-pressed={item.id === mode}
                onClick={() => {
                  setMode(item.id)
                  setResult(null)
                  setStatus('idle')
                }}
              >
                <span>{item.eyebrow}</span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </aside>

          <form className="agent-console" onSubmit={submit}>
            <div className="agent-console-header">
              <div>
                <span className="agent-kicker">{activeMode.eyebrow}</span>
                <h3>{activeMode.label}</h3>
              </div>
              <span className="agent-token-badge">Guided diagnostic</span>
            </div>

            <label className="agent-field agent-field-full" htmlFor="agent-prompt">
              <span>Describe the project, question, or bottleneck.</span>
              <textarea
                id="agent-prompt"
                rows={5}
                maxLength={900}
                value={prompt}
                placeholder="Example: We run a small apparel shop and lose time copying order details into spreadsheets before production meetings."
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>

            <div className="agent-prompt-row" aria-label="Starter prompts">
              {starterPrompts[mode].map((item) => (
                <button className="agent-chip" type="button" key={item} onClick={() => setPrompt(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className="agent-grid-fields">
              <label className="agent-field" htmlFor="agent-project-type">
                <span>Project type</span>
                <select
                  id="agent-project-type"
                  value={answers.projectType}
                  onChange={(event) => updateAnswer('projectType', event.target.value)}
                >
                  <option>Not sure yet</option>
                  <option>Website / portfolio</option>
                  <option>Storefront / ecommerce</option>
                  <option>Automation</option>
                  <option>Dashboard / reporting</option>
                  <option>AI assistant / knowledge system</option>
                </select>
              </label>

              <label className="agent-field" htmlFor="agent-business-type">
                <span>Business type</span>
                <input
                  id="agent-business-type"
                  value={answers.businessType}
                  placeholder="Print shop, school, nonprofit, agency..."
                  onChange={(event) => updateAnswer('businessType', event.target.value)}
                />
              </label>

              <label className="agent-field" htmlFor="agent-stack">
                <span>Current tools</span>
                <input
                  id="agent-stack"
                  value={answers.currentStack}
                  placeholder="InkSoft, Printavo, Sheets, forms, email..."
                  onChange={(event) => updateAnswer('currentStack', event.target.value)}
                />
              </label>

              <label className="agent-field" htmlFor="agent-timeline">
                <span>Timeline</span>
                <select
                  id="agent-timeline"
                  value={answers.timeline}
                  onChange={(event) => updateAnswer('timeline', event.target.value)}
                >
                  <option>Exploring</option>
                  <option>This month</option>
                  <option>Next 60 days</option>
                  <option>Quarterly planning</option>
                </select>
              </label>
            </div>

            <label className="agent-field agent-field-full" htmlFor="agent-pain">
              <span>What makes this painful right now?</span>
              <input
                id="agent-pain"
                value={answers.pain}
                placeholder="Too manual, hard to explain, scattered data, old design, unclear next step..."
                onChange={(event) => updateAnswer('pain', event.target.value)}
              />
            </label>

            <div className="agent-signal-group" aria-label="Signals to include">
              {signalOptions.map((signal) => (
                <button
                  className={`agent-signal${signals.includes(signal) ? ' is-active' : ''}`}
                  type="button"
                  key={signal}
                  aria-pressed={signals.includes(signal)}
                  onClick={() => toggleSignal(signal)}
                >
                  {signal}
                </button>
              ))}
            </div>

            <div className="agent-preview" aria-live="polite">
              <span>Local pre-read</span>
              <strong>{localRecommendation.archetype}</strong>
              <p>{localRecommendation.recommendedPath}</p>
            </div>

            <div className="agent-actions">
              <button className="agent-submit" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Reading signals...' : 'Generate intelligence brief'}
              </button>
              <a className="agent-secondary" href="#work">
                Browse proof first
              </a>
            </div>
          </form>

          <article className="agent-output" aria-live="polite" aria-busy={status === 'loading'}>
            {result ? (
              <>
                <div className="agent-output-topline">
                  <span>{result.source === 'openai' ? 'Studio AI brief' : 'Local fallback brief'}</span>
                  <strong>{result.confidence} confidence</strong>
                </div>
                <h3>{result.headline}</h3>
                <p>{result.diagnosis}</p>

                <div className="agent-output-card">
                  <span>Recommended path</span>
                  <strong>{result.recommendedPath}</strong>
                  <p>{result.estimatedFirstBuild}</p>
                </div>

                <div className="agent-proof-list">
                  <span>Relevant proof</span>
                  {result.relevantProof.map((proof) =>
                    proof.href ? (
                      <a href={proof.href} key={`${proof.title}-${proof.href}`}>
                        <strong>{proof.title}</strong>
                        <small>{proof.reason}</small>
                      </a>
                    ) : (
                      <div key={proof.title}>
                        <strong>{proof.title}</strong>
                        <small>{proof.reason}</small>
                      </div>
                    ),
                  )}
                </div>

                <div className="agent-steps">
                  <span>Next steps</span>
                  <ol>
                    {result.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="agent-question-list">
                  <span>Questions for Brent</span>
                  {result.questionsForBrent.map((question) => (
                    <p key={question}>{question}</p>
                  ))}
                </div>

                <div className="agent-output-actions">
                  <a className="agent-submit" href={result.cta.href}>
                    {result.cta.label}
                  </a>
                  <button className="agent-secondary" type="button" onClick={copyResult}>
                    {copied ? 'Copied' : 'Copy brief'}
                  </button>
                </div>

                <p className="agent-token-note">{result.tokenNote}</p>
              </>
            ) : (
              <div className="agent-empty-state">
                <span>Awaiting signal</span>
                <h3>{localRecommendation.headline}</h3>
                <p>{localRecommendation.diagnosis}</p>
                <div>
                  {localRecommendation.context.map((entry) => (
                    <small key={entry.id}>{entry.title}</small>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
