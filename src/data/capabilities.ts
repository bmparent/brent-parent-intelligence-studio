export type Capability = {
  id: string
  title: string
  signal: string
  summary: string
  outcomes: string[]
  deliverables: string[]
  tags: string[]
  relatedCaseStudies: string[]
  accent: 'blue' | 'cyan' | 'violet' | 'amber' | 'green' | 'danger'
}

export const capabilities: Capability[] = [
  {
    id: 'advanced-web',
    title: 'Advanced Web Experiences',
    signal: 'Immersive presentation',
    summary:
      'Cinematic frontend systems built with Three.js, motion, scroll choreography, shaders, and responsive interaction.',
    outcomes: [
      'Premium first impression',
      'Interactive storytelling',
      'Memorable launch pages',
      'Higher engagement',
    ],
    deliverables: [
      'React/Vite frontends',
      'Three.js scenes',
      'Shader effects',
      'Scroll-driven interfaces',
      'Cloudinary media integration',
    ],
    tags: ['Three.js', 'WebGL', 'GSAP', 'Cloudinary', 'React'],
    relatedCaseStudies: ['EPCOT Storefront', 'Animal Kingdom Storefront', 'Eidos Brain'],
    accent: 'cyan',
  },
  {
    id: 'wordpress',
    title: 'WordPress & Business Websites',
    signal: 'Conversion clarity',
    summary:
      'Fast, polished WordPress and business websites with clearer offers, stronger contact paths, and practical content structure.',
    outcomes: [
      'Cleaner service pages',
      'Better trust signals',
      'Stronger contact paths',
      'Professional brand presence',
    ],
    deliverables: [
      'WordPress setup or redesign',
      'Landing pages',
      'SEO-aware content structure',
      'Forms and CTA setup',
      'Performance cleanup',
    ],
    tags: ['WordPress', 'SEO Structure', 'Responsive UX', 'Business Sites'],
    relatedCaseStudies: ['Business Site Systems', 'YMCA Category Experience'],
    accent: 'blue',
  },
  {
    id: 'inksoft',
    title: 'InkSoft Storefront Experiences',
    signal: 'Storefront polish',
    summary:
      'Branded InkSoft storefronts and custom embeds that make school, team, staff, and merch stores feel intentional.',
    outcomes: [
      'Cleaner storefront structure',
      'Better category navigation',
      'Fewer customer questions',
      'More polished launches',
    ],
    deliverables: [
      'Store structure',
      'Category sections',
      'Hero banners',
      'Custom embeds',
      'Mobile storefront review',
      'Cloudinary assets',
    ],
    tags: ['InkSoft', 'Ecommerce UX', 'Custom Embeds', 'Cloudinary'],
    relatedCaseStudies: ['EPCOT Storefront', 'Animal Kingdom Storefront', 'YMCA Staff Store'],
    accent: 'green',
  },
  {
    id: 'printavo',
    title: 'Printavo / InkSoft Workflow Automation',
    signal: 'Operational handoff',
    summary:
      'Workflow cleanup for the messy handoff between storefront orders, invoices, production notes, and staff action.',
    outcomes: [
      'Fewer manual cleanup steps',
      'Clearer production notes',
      'Better order grouping',
      'Reduced staff confusion',
    ],
    deliverables: [
      'Workflow audit',
      'Order handoff map',
      'Google Sheets control layer',
      'Apps Script or API automation',
      'Production documentation',
    ],
    tags: ['Printavo', 'InkSoft', 'Apps Script', 'Workflow Maps'],
    relatedCaseStudies: ['Print Shop Sentinel', 'Training Assistant'],
    accent: 'amber',
  },
  {
    id: 'python',
    title: 'Python Automation',
    signal: 'Messy data to useful tools',
    summary:
      'Practical scripts, connectors, reporting utilities, and prototypes that turn repetitive business work into repeatable systems.',
    outcomes: [
      'Less repetitive work',
      'Cleaner data',
      'Faster reporting',
      'More consistent processes',
    ],
    deliverables: [
      'Python scripts',
      'API connectors',
      'CSV and Excel cleanup',
      'File processing',
      'Prototype dashboards',
      'Anomaly experiments',
    ],
    tags: ['Python', 'APIs', 'Reporting', 'Automation'],
    relatedCaseStudies: ['Eidos Brain', 'Print Shop Sentinel'],
    accent: 'violet',
  },
  {
    id: 'google-cloud',
    title: 'Google Cloud Systems',
    signal: 'Event-driven scale',
    summary:
      'Cloud Run, Pub/Sub, storage, logging, and AI orchestration concepts for prototypes that need to move beyond local scripts.',
    outcomes: [
      'Scalable prototypes',
      'Cloud-native automation',
      'Observable event flows',
      'Cleaner AI architecture',
    ],
    deliverables: [
      'Cloud Run services',
      'Pub/Sub event plans',
      'Cloud Storage workflows',
      'Logging and monitoring plans',
      'Deployment documentation',
    ],
    tags: ['Google Cloud', 'Cloud Run', 'Pub/Sub', 'Observability'],
    relatedCaseStudies: ['Google Cloud Architecture', 'Eidos Brain'],
    accent: 'blue',
  },
  {
    id: 'ai-assistants',
    title: 'AI Workflow Assistants',
    signal: 'Guided decisions',
    summary:
      'Business copilots, SOP assistants, training tools, and guided interfaces for teams that need better answers faster.',
    outcomes: [
      'Easier onboarding',
      'Fewer repetitive questions',
      'Faster SOP lookup',
      'Clearer internal guidance',
    ],
    deliverables: [
      'Assistant concept',
      'Prompt system',
      'Knowledge structure',
      'Prototype interface',
      'Workflow Q&A tool',
    ],
    tags: ['AI Assistant', 'LLMs', 'SOPs', 'Knowledge Tools'],
    relatedCaseStudies: ['Training Assistant', 'Eidos Brain'],
    accent: 'green',
  },
  {
    id: 'eidos',
    title: 'Eidos Brain / Operational Intelligence',
    signal: 'Signals to next action',
    summary:
      'Early-stage intelligence systems that watch signals, detect unusual patterns, generate incident cards, and forecast risks.',
    outcomes: [
      'Early warning for operational issues',
      'Anomaly detection',
      'Incident summaries',
      'Human-reviewable recommendations',
    ],
    deliverables: [
      'Signal inventory',
      'Dashboard prototype',
      'Anomaly logic',
      'Incident-card interface',
      'Forecast visualization',
      'Memory and adapter concepts',
    ],
    tags: ['Eidos Brain', 'Sentinel', 'Incident Cards', 'Forecast Mode'],
    relatedCaseStudies: ['Eidos Brain', 'Print Shop Sentinel', 'Google Cloud Architecture'],
    accent: 'danger',
  },
]
