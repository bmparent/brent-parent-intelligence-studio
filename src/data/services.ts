export type Service = {
  id: string
  title: string
  description: string
  outcomes: string[]
  deliverables: string[]
  signal: string
}

export const services: Service[] = [
  {
    id: 'advanced-web-experiences',
    title: 'Advanced Web Experiences',
    description:
      'For brands and businesses that need more than a normal website, I build immersive digital experiences using advanced frontend techniques, Three.js, animation, and visual storytelling.',
    outcomes: [
      'Stronger first impression',
      'Premium brand presentation',
      'Interactive storytelling',
      'Memorable launch pages',
      'Better engagement',
    ],
    deliverables: [
      'Custom React/Vite frontend',
      'Interactive sections',
      'Three.js scenes',
      'Scroll choreography',
      'Cloudinary image integration',
      'Responsive optimization',
    ],
    signal: 'WebGL signal layer',
  },
  {
    id: 'wordpress-business-websites',
    title: 'WordPress & Business Websites',
    description:
      'Not every business needs an experimental WebGL environment. Some need a clean, fast, professional WordPress site that explains the offer, builds trust, and converts visitors.',
    outcomes: [
      'Clearer business presence',
      'Better service pages',
      'Stronger contact paths',
      'Improved content structure',
      'More professional brand impression',
    ],
    deliverables: [
      'WordPress setup/redesign',
      'Service pages',
      'Landing pages',
      'Responsive design',
      'SEO-aware structure',
      'Forms and CTA setup',
      'Performance cleanup',
    ],
    signal: 'Conversion pathway',
  },
  {
    id: 'inksoft-storefront-experiences',
    title: 'InkSoft Storefront Experiences',
    description:
      'I design and improve branded InkSoft storefronts so merch, school, team, staff, and organization stores feel polished instead of generic.',
    outcomes: [
      'Cleaner storefront structure',
      'Premium brand presentation',
      'Better category navigation',
      'Fewer customer questions',
      'Better launch experience',
    ],
    deliverables: [
      'Store structure',
      'Category organization',
      'Product setup',
      'Branded graphics',
      'Custom embeds',
      'Mobile review',
      'Cloudinary asset integration',
    ],
    signal: 'Storefront module',
  },
  {
    id: 'printavo-inksoft-workflow-automation',
    title: 'Printavo / InkSoft Workflow Automation',
    description:
      'I help print shops clean up the messy handoff between online orders, invoices, production notes, design metadata, and staff workflows.',
    outcomes: [
      'Fewer manual cleanup steps',
      'Clearer production notes',
      'Better order grouping',
      'Reduced staff confusion',
      'Improved production visibility',
    ],
    deliverables: [
      'Workflow audit',
      'Order handoff map',
      'Google Sheets control layer',
      'Apps Script or API automation',
      'Production note enrichment',
      'Staff-facing documentation',
    ],
    signal: 'Production handoff',
  },
  {
    id: 'python-automation-internal-tools',
    title: 'Python Automation / Internal Tools',
    description:
      'Python is the practical bridge between messy business data and useful systems.',
    outcomes: [
      'Less repetitive work',
      'Faster reporting',
      'Cleaner data',
      'More consistent processes',
      'Prototype tools before full platforms',
    ],
    deliverables: [
      'Python scripts',
      'API connectors',
      'CSV/Excel cleanup',
      'Report generation',
      'File processing',
      'Scheduled workflows',
      'Internal utilities',
    ],
    signal: 'Automation kernel',
  },
  {
    id: 'google-cloud-prototypes',
    title: 'Google Cloud Prototypes & Systems',
    description:
      'I use Google Cloud to design event-driven systems, automation backends, and AI-enabled prototypes that can move beyond local scripts.',
    outcomes: [
      'Scalable prototypes',
      'Cloud-native automation',
      'Event-driven workflows',
      'Better logging and observability',
      'Cleaner architecture for AI systems',
    ],
    deliverables: [
      'Cloud Run services',
      'Pub/Sub architecture',
      'Cloud Storage workflows',
      'Logging/monitoring plan',
      'Deployment documentation',
      'AI orchestration concepts',
    ],
    signal: 'Cloud event mesh',
  },
  {
    id: 'ai-workflow-assistants',
    title: 'AI Workflow Assistants',
    description:
      'I design AI-assisted tools that help teams search knowledge, learn workflows, answer operational questions, and move faster.',
    outcomes: [
      'Easier onboarding',
      'Fewer repetitive questions',
      'Faster SOP lookup',
      'Clearer internal guidance',
      'Smarter daily operations',
    ],
    deliverables: [
      'Assistant concept',
      'Prompt system',
      'Knowledge structure',
      'Prototype interface',
      'Training assistant',
      'Workflow Q&A tool',
    ],
    signal: 'Guided answer layer',
  },
  {
    id: 'eidos-operational-intelligence',
    title: 'Eidos / Operational Intelligence Prototypes',
    description:
      'I build early-stage intelligence systems that watch business signals, detect unusual patterns, generate incident cards, forecast risks, and recommend next actions.',
    outcomes: [
      'Early warning for operational issues',
      'Better visibility across workflows',
      'Anomaly detection',
      'Incident summaries',
      'Human-reviewable recommendations',
      'Future-ready intelligence layer',
    ],
    deliverables: [
      'Signal inventory',
      'Dashboard prototype',
      'Anomaly/risk logic',
      'Incident-card interface',
      'Forecast visualization',
      'Recommendation flow',
      'Memory/domain-adapter concept',
    ],
    signal: 'Sentinel loop',
  },
]
