export type CaseStudy = {
  id: string
  title: string
  type: string
  summary: string
  capabilities: string[]
  visual: string
  image?: string
  links?: { label: string; href: string }[]
  note?: string
  incident?: {
    title: string
    confidence: string
    workflow: string
    evidence: string
    action: string
  }
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'eidos-brain',
    title: 'Eidos Brain / Sentinel Intelligence Platform',
    type: 'Experimental AI / operational intelligence platform',
    summary:
      'A domain-agnostic intelligence system designed to monitor streams of activity, detect anomalies, compress signal patterns, generate incident cards, forecast risk, and support human-reviewed decisions.',
    capabilities: [
      'Python architecture',
      'Anomaly detection',
      'Streaming intelligence',
      'Signal compression',
      'Memory layer',
      'Incident generation',
      'Forecast mode',
      'Google Cloud deployment concepts',
      'AI-assisted recommendations',
    ],
    visual: 'Living Eidos Core with signal streams, memory rings, anomaly pulses, and incident-card outputs.',
    note:
      'Eidos Brain explores what happens when business operations, data streams, and AI reasoning are treated as a living signal environment. The system watches, compresses, remembers, forecasts, and explains.',
  },
  {
    id: 'print-shop-sentinel',
    title: 'Print Shop Intelligence Sentinel',
    type: 'Operational intelligence / automation concept',
    summary:
      'A practical intelligence layer for print shops that watches InkSoft storefront orders, Printavo workflows, production notes, design metadata, and order handoffs to detect risks before they become production problems.',
    capabilities: [
      'Printavo workflow understanding',
      'InkSoft storefront operations',
      'Google Sheets control layers',
      'Apps Script / API automation',
      'Production note enrichment',
      'Order grouping',
      'Anomaly detection',
      'Incident cards',
      'Operational dashboards',
    ],
    visual: 'Raw webstore orders flowing into structured production-ready cards.',
    incident: {
      title: 'Potential Production Risk Detected',
      confidence: '87%',
      workflow: 'Storefront order intake',
      evidence: 'Seven incoming storefront orders are missing decoration notes or source identifiers.',
      action: 'Review order group before invoice creation.',
    },
  },
  {
    id: 'inksoft-immersive-storefronts',
    title: 'InkSoft Immersive Storefront Experiences',
    type: 'Advanced web / ecommerce design',
    summary:
      'Custom storefront experiences for InkSoft stores using branded hero sections, category widgets, Cloudinary-hosted visuals, custom HTML/CSS/JS embeds, and Three.js enhancements.',
    capabilities: [
      'InkSoft custom embeds',
      'Advanced frontend development',
      'Responsive design',
      'Cloudinary image workflow',
      'Three.js animation',
      'Category experience design',
      'Ecommerce storytelling',
    ],
    visual: 'Spatial gallery of storefront portals with preview panels and related project notes.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777404633/epcotbanner_mz3b72.png',
    links: [
      { label: 'Animal Kingdom Shows', href: 'https://stores.inksoft.com/wdw_animal_kingdom' },
      { label: 'EPCOT Shows', href: 'https://stores.inksoft.com/epcot_shows' },
      {
        label: 'Liberty Christian Preparatory School',
        href: 'https://stores.inksoft.com/Liberty_Christian_Preparatory_Sc',
      },
      { label: 'YMCA Staff Store', href: 'https://stores.inksoft.com/cfymca' },
    ],
  },
  {
    id: 'epcot-storefront',
    title: 'EPCOT Shows Interactive Storefront System',
    type: 'Three.js / InkSoft / Cloudinary storefront prototype',
    summary:
      'An advanced storefront concept using layered hero imagery, separated model assets, animated stage lighting, category widgets, and Three.js-driven motion to make the shopping experience feel alive.',
    capabilities: [
      'Cloudinary asset pipeline',
      'Layered visual composition',
      'Three.js animation planning',
      'Interactive storefront embeds',
      'Scroll/hover animation',
      'Character/model separation',
      'Mobile-friendly storefront design',
    ],
    visual: 'Layered stage atmosphere with asset-separated performers and responsive category motion.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777571651/ChatGPT_Image_Apr_30_2026_01_17_47_PM_keroas.png',
    links: [
      { label: 'EPCOT Storefront', href: 'https://stores.inksoft.com/epcot_shows' },
      {
        label: 'Encanto model',
        href: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/encanto_model_ansmoe.png',
      },
      {
        label: 'Broadway model',
        href: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/broadway_model_gl99le.png',
      },
      {
        label: 'Candlelight models',
        href: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777575329/candlelight_models_n2ihhj.png',
      },
    ],
    note:
      'Presented as an internal storefront visual prototype and capability example, not as an affiliation claim.',
  },
  {
    id: 'animal-kingdom-storefront',
    title: 'Animal Kingdom Shows Storefront Experience',
    type: 'Advanced InkSoft / Three.js environment concept',
    summary:
      'An immersive nature/theatrical storefront experience using warm environmental visuals, animated grass, birds, mist, layered transitions, and category tiles that feel part of a living scene.',
    capabilities: [
      'Atmospheric web design',
      'Three.js grass animation',
      'Transition smoothing',
      'Animated environmental overlays',
      'Custom InkSoft embed problem solving',
      'Full-width responsive custom sections',
    ],
    visual: 'Warm environmental storefront concept with living-scene category navigation.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1777483710/animal_kingdom_banner_mttqh4.png',
    links: [{ label: 'Animal Kingdom Shows', href: 'https://stores.inksoft.com/wdw_animal_kingdom' }],
  },
  {
    id: 'ymca-staff-store',
    title: 'YMCA Staff Store / Category Experience',
    type: 'Brand-aligned ecommerce storefront design',
    summary:
      'A YMCA-inspired store/category experience focused on staff apparel and category navigation, using branded visual direction and interactive category sections.',
    capabilities: [
      'Brand research',
      'Category architecture',
      'Custom storefront layout',
      'Three.js concept prototyping',
      'Interactive navigation',
      'Mobile storefront thinking',
    ],
    visual: 'Category pathways for instructor tees, lifeguard, staff jackets, polos, learning center, and camper shirts.',
    image:
      'https://res.cloudinary.com/dhcmpzn9e/image/upload/v1776783875/ChatGPT_Image_Apr_21_2026_11_04_19_AM_5_gqpeq2.png',
    links: [
      { label: 'YMCA Staff Store', href: 'https://stores.inksoft.com/cfymca' },
      { label: 'YMCA reference', href: 'https://ymcacf.org/' },
    ],
  },
  {
    id: 'printavo-training-assistant',
    title: 'Printavo Training / AI Assistant Concept',
    type: 'AI workflow assistant / internal training platform',
    summary:
      'A training and assistant concept for print shop operations that helps staff understand workflows, ask operational questions, and surface useful information like jobs due today, booked work, and production priorities.',
    capabilities: [
      'AI assistant planning',
      'Gemini / LLM workflow concepts',
      'Next.js / React direction',
      'Printavo workflow understanding',
      'Internal training tools',
      'Preset question buttons',
      'Live operational question answering',
      'Knowledge base structuring',
    ],
    visual: 'Operational Q&A surface with preset workflows and live job-priority prompts.',
    note:
      'Instead of burying SOPs and tribal knowledge in documents, this concept turns operational training into an interactive assistant that helps staff learn, search, and act.',
  },
  {
    id: 'google-cloud-intelligence',
    title: 'Google Cloud Event-Driven Intelligence Architecture',
    type: 'Cloud architecture / AI orchestration concept',
    summary:
      'A cloud-native architecture for Eidos-style systems using event-driven services, Pub/Sub topics, Cloud Run workers, logging, storage, and AI-powered council/review services.',
    capabilities: [
      'Google Cloud',
      'Cloud Run',
      'Pub/Sub',
      'Event-driven architecture',
      'Logging and audit trails',
      'Cloud Storage',
      'Serverless service design',
      'AI orchestration',
      'Risk/quorum/budget gating concepts',
    ],
    visual: 'Cloud system map with event topics, runners, council service, artifact buckets, audit logs, and feedback loops.',
  },
]
