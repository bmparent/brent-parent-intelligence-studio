export type IntelligenceMode = 'compass' | 'concierge' | 'automation' | 'brief'

export type ConfidenceLevel = 'directional' | 'strong' | 'high'

export interface PortfolioProof {
  title: string
  reason: string
  href?: string
}

export interface IntelligenceAnswers {
  projectType: string
  businessType: string
  currentStack: string
  pain: string
  timeline: string
  budget: string
}

export interface LocalKnowledgeEntry {
  id: string
  title: string
  category: 'website' | 'automation' | 'dashboard' | 'ai' | 'storefront' | 'strategy'
  tags: string[]
  summary: string
  proof: string
  href?: string
  recommendedPath: string
}

export interface LocalRecommendation {
  archetype: string
  headline: string
  diagnosis: string
  recommendedPath: string
  estimatedFirstBuild: string
  relevantProof: PortfolioProof[]
  nextSteps: string[]
  cta: {
    label: string
    href: string
  }
  confidence: ConfidenceLevel
}

export interface IntelligenceResult extends LocalRecommendation {
  mode: IntelligenceMode
  questionsForBrent: string[]
  tokenNote: string
  source: 'openai' | 'local-fallback'
}

export interface IntelligenceRequestPayload {
  mode: IntelligenceMode
  prompt: string
  answers: IntelligenceAnswers
  signals: string[]
  localMatchIds: string[]
}
