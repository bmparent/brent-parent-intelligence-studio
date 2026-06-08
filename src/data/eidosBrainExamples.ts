export type EidosBrainExample = {
  slug: string;
  title: string;
  summary: string;
  streamInputs: string[];
  watches: string[];
  preservedAnomalies: string[];
  receiptExamples: string[];
  valueStatement: string;
  safetyNote?: string;
};

export const eidosBrainExamples: EidosBrainExample[] = [
  {
    slug: 'medical-biosignal-monitoring',
    title: 'Medical and biosignal monitoring',
    summary:
      'Signal preservation for EEG, ECG, HRV, respiration, glucose monitors, wearables, and hospital telemetry where abnormal windows need careful review.',
    streamInputs: ['EEG', 'ECG', 'HRV', 'Respiration', 'Glucose monitors', 'Wearables', 'Hospital telemetry'],
    watches: [
      'Rhythm changes that differ from a person or unit baseline',
      'Sensor dropout, compression artifacts, and noisy windows',
      'Correlated shifts across multiple biosignal streams'
    ],
    preservedAnomalies: [
      'Short abnormal EEG or ECG windows with surrounding context',
      'Respiration and HRV divergence during an incident window',
      'Wearable signal changes that deserve clinician review'
    ],
    receiptExamples: [
      'Timestamped event window with source streams and confidence context',
      'Noise and data-quality notes',
      'Clinician-reviewable incident summary'
    ],
    valueStatement:
      'Eidos Brain can help preserve the signal moments that matter, reduce repeated noise, and make review windows easier to audit.',
    safetyNote:
      'Eidos Brain prototypes are advisory review tools. They are not replacements for clinicians, regulated diagnostic systems, emergency monitoring, or medical judgment.'
  },
  {
    slug: 'cybersecurity-network-anomaly-detection',
    title: 'Cybersecurity and network anomaly detection',
    summary:
      'A Sentinel layer for packet metadata, firewall logs, DNS logs, Zeek, Suricata, endpoint telemetry, cloud audit logs, and application logs.',
    streamInputs: ['Packet metadata', 'Firewall logs', 'DNS logs', 'Zeek', 'Suricata', 'Endpoint telemetry', 'Cloud audit logs', 'Application logs'],
    watches: [
      'Network motion that diverges from normal service rhythm',
      'Repeated low-value alerts that should be suppressed or grouped',
      'Rare combinations across identity, endpoint, application, and DNS events'
    ],
    preservedAnomalies: [
      'New outbound beacon pattern with DNS context',
      'Endpoint process behavior paired with unusual cloud audit activity',
      'Firewall and application events that form a single incident chain'
    ],
    receiptExamples: [
      'Incident receipt with source log references',
      'Suppressed-noise summary and escalation reason',
      'Analyst handoff brief with timeline and affected entities'
    ],
    valueStatement:
      'The goal is fewer loose alerts and more reviewable incident receipts that explain why a window was preserved.',
    safetyNote:
      'Security prototypes are decision-support tools and should be reviewed by qualified security operators before response actions.'
  },
  {
    slug: 'flight-aerospace-telemetry',
    title: 'Flight data, black boxes, and aerospace telemetry',
    summary:
      'Telemetry review for altitude, attitude, vibration, engine state, control inputs, navigation signals, and fault codes.',
    streamInputs: ['Altitude', 'Attitude', 'Vibration', 'Engine state', 'Control inputs', 'Navigation signals', 'Fault codes'],
    watches: [
      'Early divergence before an obvious fault',
      'Vibration or engine-state drift paired with control changes',
      'Navigation or sensor disagreement across redundant streams'
    ],
    preservedAnomalies: [
      'Abnormal vibration window before a fault code',
      'Control-input and attitude mismatch',
      'Short sensor-disagreement interval with surrounding telemetry'
    ],
    receiptExamples: [
      'Abnormal window with pre-event and post-event context',
      'Stream-alignment receipt for engineering review',
      'Fault-code companion brief'
    ],
    valueStatement:
      'Eidos Brain can preserve abnormal windows and help engineering teams see early divergence without storing every ordinary frame forever.',
    safetyNote:
      'Aerospace prototypes are advisory analysis tools, not certified flight-safety systems or substitutes for regulated review.'
  },
  {
    slug: 'intelligence-osint-monitoring',
    title: 'Intelligence, OSINT, and OSTIN-style monitoring',
    summary:
      'Open-source intelligence monitoring for social signals, public records, news streams, market signals, geospatial feeds, cyber indicators, and operational logs.',
    streamInputs: ['Open-source intelligence', 'Social signals', 'Public records', 'News streams', 'Market signals', 'Geospatial feeds', 'Cyber indicators', 'Operational logs'],
    watches: [
      'Rhythm changes in narratives or activity patterns',
      'Emerging clusters across unrelated public sources',
      'Operational indicators that become meaningful only in combination'
    ],
    preservedAnomalies: [
      'Narrative shift paired with geospatial movement',
      'Cyber indicator cluster linked to public reporting',
      'Market or public-record movement that changes an analyst question'
    ],
    receiptExamples: [
      'Analyst-reviewable source bundle',
      'Narrative-change receipt with timestamped evidence',
      'Cluster summary with source quality notes'
    ],
    valueStatement:
      'The system helps analysts preserve the strange, changing, and clustered evidence that deserves human review.',
    safetyNote:
      'OSINT prototypes should preserve source context and support analyst judgment; they should not be used as autonomous legal, safety, or enforcement decisions.'
  },
  {
    slug: 'industrial-predictive-maintenance',
    title: 'Industrial systems and predictive maintenance',
    summary:
      'Drift detection for motors, bearings, factory sensors, energy grid telemetry, water treatment, oil and gas systems, robotics, and HVAC.',
    streamInputs: ['Motors', 'Bearings', 'Factory sensors', 'Energy grid telemetry', 'Water treatment', 'Oil and gas telemetry', 'Robotics', 'HVAC'],
    watches: [
      'Pre-failure drift across vibration, energy use, temperature, or throughput',
      'Short bursts that precede operator-visible problems',
      'Maintenance patterns that repeat across equipment classes'
    ],
    preservedAnomalies: [
      'Bearing vibration pattern outside normal rhythm',
      'HVAC energy spike paired with temperature instability',
      'Water-treatment sensor drift before an alarm threshold'
    ],
    receiptExamples: [
      'Maintenance review receipt with affected asset and stream context',
      'Pre-failure evidence window',
      'Suggested inspection checklist for a human operator'
    ],
    valueStatement:
      'Eidos Brain can help maintenance teams spend attention on drift evidence instead of raw telemetry overload.',
    safetyNote:
      'Industrial prototypes support maintenance review and should not bypass required safety controls, inspections, or operating procedures.'
  },
  {
    slug: 'edge-iot-compression',
    title: 'Edge devices and IoT compression',
    summary:
      'An edge-to-cloud intelligence codec for remote sensors, smart-city devices, environmental monitoring, wearables, fleet sensors, agriculture, and industrial IoT.',
    streamInputs: ['Remote sensors', 'Smart-city devices', 'Environmental monitoring', 'Wearables', 'Fleet sensors', 'Agriculture sensors', 'Industrial IoT'],
    watches: [
      'Ordinary signal that can be compressed aggressively',
      'Change windows that deserve more bytes and richer context',
      'Device health, dropout, and sensor disagreement'
    ],
    preservedAnomalies: [
      'Environmental sensor spike across a small area',
      'Fleet sensor divergence from normal route behavior',
      'Agriculture telemetry shift that deserves inspection'
    ],
    receiptExamples: [
      'Edge receipt summarizing what was compressed and what was preserved',
      'Change-window packet with richer context',
      'Device-quality note for downstream review'
    ],
    valueStatement:
      'Compress ordinary signal. Spend more bytes on change. Preserve the strange windows for later review.',
    safetyNote:
      'IoT prototypes should be validated against device constraints, data loss tolerance, and operational safety requirements.'
  },
  {
    slug: 'finance-market-risk-monitoring',
    title: 'Finance, markets, and prediction systems',
    summary:
      'Risk-regime and anomaly monitoring across price movement, liquidity, order-book structure, volatility, sentiment, and external event streams.',
    streamInputs: ['Price movement', 'Liquidity', 'Order-book structure', 'Volatility', 'Sentiment', 'External event streams'],
    watches: [
      'Risk-regime changes rather than price targets',
      'Liquidity and volatility shifts that change model assumptions',
      'Model drift or surprise against expected behavior'
    ],
    preservedAnomalies: [
      'Liquidity collapse window with volatility context',
      'Order-book behavior that differs from recent baseline',
      'External event stream paired with market-structure change'
    ],
    receiptExamples: [
      'Risk-regime receipt with source streams',
      'Model-drift note for analyst review',
      'Anomaly window with no price-prediction claim'
    ],
    valueStatement:
      'Eidos Brain can help preserve regime changes, anomaly windows, and model-drift evidence without claiming to predict prices.',
    safetyNote:
      'Finance prototypes are not investment advice, trading systems, or guarantees of future performance.'
  },
  {
    slug: 'scientific-laboratory-monitoring',
    title: 'Scientific and laboratory monitoring',
    summary:
      'Monitoring for quantum systems, particle detectors, microscopes, lab automation, chemical processes, and experimental rigs.',
    streamInputs: ['Quantum systems', 'Particle detectors', 'Microscopes', 'Lab automation', 'Chemical processes', 'Experimental rigs'],
    watches: [
      'Drift, bias, burst errors, and unexpected transitions',
      'Strange runs that should be preserved instead of averaged away',
      'Instrument disagreement and calibration artifacts'
    ],
    preservedAnomalies: [
      'Burst error that appears only in a narrow window',
      'Unexpected transition across experimental streams',
      'Microscope or detector anomaly with instrument context'
    ],
    receiptExamples: [
      'Strange-run receipt with instrument state',
      'Bias or drift note for scientist review',
      'Experiment window preserved for repeatability analysis'
    ],
    valueStatement:
      'The system helps labs retain unusual evidence and context that ordinary compression or summaries might erase.',
    safetyNote:
      'Scientific prototypes support review and documentation; conclusions require domain expert analysis and appropriate validation.'
  },
  {
    slug: 'public-safety-infrastructure-monitoring',
    title: 'Public safety and infrastructure monitoring',
    summary:
      'Abnormal-transition monitoring for traffic flow, utilities, dispatch systems, power grids, transportation, and environmental hazards.',
    streamInputs: ['Traffic flow', 'Utilities', 'Dispatch systems', 'Power grids', 'Transportation telemetry', 'Environmental hazards'],
    watches: [
      'Abnormal transitions across public systems',
      'Short windows that deserve review without storing every raw feed forever',
      'Infrastructure signals that become important in combination'
    ],
    preservedAnomalies: [
      'Traffic-flow collapse paired with dispatch activity',
      'Utility telemetry drift before an outage report',
      'Environmental hazard signal crossing a review threshold'
    ],
    receiptExamples: [
      'Reviewable incident receipt with source classes',
      'Abnormal-transition brief for operators',
      'Retention note explaining what raw context was preserved'
    ],
    valueStatement:
      'Eidos Brain can help operators preserve abnormal windows and hand off clearer receipts for human review.',
    safetyNote:
      'Public-safety prototypes must not replace emergency systems, regulated infrastructure controls, or trained operator judgment.'
  },
  {
    slug: 'documents-logs-organizational-knowledge',
    title: 'Documents, logs, and organizational knowledge',
    summary:
      'Knowledge-drift monitoring across software logs, tickets, reports, support messages, diagnostic dumps, code changes, and operational notes.',
    streamInputs: ['Software logs', 'Tickets', 'Reports', 'Support messages', 'Diagnostic dumps', 'Code changes', 'Operational notes'],
    watches: [
      'Rare combinations across logs, tickets, and code changes',
      'New error clusters and repeated fault patterns',
      'Compliance evidence trails and knowledge-base drift'
    ],
    preservedAnomalies: [
      'Support theme linked to new log cluster',
      'Diagnostic dump that matches a recent code path change',
      'Repeated operational note that signals outdated documentation'
    ],
    receiptExamples: [
      'Incident receipt with related tickets, logs, and code references',
      'Knowledge-base drift summary',
      'Compliance-friendly evidence trail'
    ],
    valueStatement:
      'The system turns scattered organizational memory into reviewable receipts, repeated-fault patterns, and clearer update prompts.',
    safetyNote:
      'Organizational knowledge prototypes should respect access control, privacy, retention policy, and compliance requirements.'
  }
];
