import type { CSSProperties } from 'react';
import { absoluteUrl } from '../config/site';
import { eidosBrainExamples } from '../data/eidosBrainExamples';
import { eidosScenarios } from '../data/portfolio';
import { EidosBrainStreamField } from './EidosBrainStreamField';
import { GlassPanel } from './GlassPanel';
import { SectionHeader } from './SectionHeader';

const lifecycleSteps = [
  {
    title: 'Listen',
    text: 'Receive live streams from sensors, logs, documents, dashboards, or operational systems.'
  },
  {
    title: 'Predict',
    text: 'Build a local expectation for what ordinary movement looks like in that context.'
  },
  {
    title: 'Measure surprise',
    text: 'Compare each new window against the expected rhythm and score what changed.'
  },
  {
    title: 'Compress ordinary',
    text: 'Summarize routine signal so storage, attention, and compute are not spent on noise.'
  },
  {
    title: 'Preserve strange',
    text: 'Keep the abnormal window, surrounding context, and source references for review.'
  },
  {
    title: 'Produce receipts',
    text: 'Create human-readable incident receipts with timestamps, inputs, evidence, and caveats.'
  }
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Eidos Brain example domains',
  url: absoluteUrl('/#eidos'),
  itemListElement: eidosBrainExamples.map((example, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'CreativeWork',
      name: example.title,
      url: absoluteUrl(`/#${example.slug}`),
      description: example.summary
    }
  }))
};

export function EidosBrain() {
  return (
    <section id="eidos" className="section-shell section-block eidos eidos-expanded" aria-labelledby="eidos-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EidosBrainStreamField />
      <SectionHeader
        id="eidos-title"
        eyebrow="Eidos Brain / Sentinel"
        title="Eidos Brain is an anomaly-preserving intelligence codec for live data streams."
        summary="The proof-stage idea is simple: compress ordinary signal, preserve strange windows, and generate reviewable incident receipts for people who need evidence, not hype."
      />

      <GlassPanel className="eidos-feature-card" ariaLabel="Eidos Brain positioning">
        <div>
          <p className="section-kicker">Proof-stage sprint</p>
          <h3>Listen, predict, preserve, and explain.</h3>
          <p>
            Eidos Brain and Sentinel prototypes are built for live streams where most moments are ordinary but the unusual windows matter. The interface keeps important content in HTML, then uses WebGL only as ambient context.
          </p>
        </div>
        <a className="btn btn--primary" href="#start">
          Discuss Eidos Brain
        </a>
      </GlassPanel>

      <div className="stream-lifecycle" aria-label="Eidos Brain stream lifecycle">
        {lifecycleSteps.map((step, index) => (
          <article key={step.title} data-reveal style={{ '--delay': `${index * 35}ms` } as CSSProperties}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <div className="surprise-pulse" data-reveal aria-label="Surprise pulse concept">
        <div className="surprise-pulse__line" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="section-kicker">Surprise pulse</p>
          <h3>Calm signal stays compressed. The strange window becomes a receipt.</h3>
          <p>
            The pulse model shows the system moving from routine stream behavior into a highlighted anomaly window. A prototype can attach source context, confidence notes, and next-review prompts to that moment.
          </p>
        </div>
      </div>

      <div className="eidos-example-grid" aria-label="Eidos Brain example domains">
        {eidosBrainExamples.map((example, index) => (
          <article id={example.slug} key={example.slug} data-reveal style={{ '--delay': `${index * 25}ms` } as CSSProperties}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{example.title}</h3>
            <p>{example.summary}</p>
            <dl>
              <div>
                <dt>Stream inputs</dt>
                <dd>{example.streamInputs.join(', ')}</dd>
              </div>
              <div>
                <dt>What Eidos Brain watches</dt>
                <dd>{example.watches.join(' ')}</dd>
              </div>
              <div>
                <dt>Preserved anomaly examples</dt>
                <dd>{example.preservedAnomalies.join(' ')}</dd>
              </div>
              <div>
                <dt>Output / receipt examples</dt>
                <dd>{example.receiptExamples.join(' ')}</dd>
              </div>
            </dl>
            <strong>{example.valueStatement}</strong>
            {example.safetyNote ? <p className="eidos-safety-note">{example.safetyNote}</p> : null}
          </article>
        ))}
      </div>

      <div className="scenario-strip" aria-label="Practical Eidos Brain scenarios">
        {eidosScenarios.map((scenario, index) => (
          <article key={scenario.title} data-reveal style={{ '--delay': `${index * 35}ms` } as CSSProperties}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{scenario.title}</h3>
            <dl>
              <div>
                <dt>Signal</dt>
                <dd>{scenario.signal}</dd>
              </div>
              <div>
                <dt>Sentinel detects</dt>
                <dd>{scenario.sentinelDetects}</dd>
              </div>
              <div>
                <dt>Eidos Brain helps</dt>
                <dd>{scenario.brainHelps}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <aside className="eidos-disclaimer" data-reveal>
        <h3>Advisory prototypes, not autonomous authority.</h3>
        <p>
          Eidos Brain and Sentinel prototypes are review tools. They are not regulated diagnostic, safety, financial, legal, medical, aerospace, or emergency decision systems. Any high-stakes use requires qualified human review, compliance review, testing, and domain-specific validation.
        </p>
        <a className="btn btn--secondary" href="#start">
          Scope a Proof-Stage Sprint
        </a>
      </aside>
    </section>
  );
}
