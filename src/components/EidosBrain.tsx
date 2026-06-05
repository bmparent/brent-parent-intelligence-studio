import type { CSSProperties } from 'react';
import { SectionHeader } from './SectionHeader';

const systemFlow = ['Signal intake', 'Normalization', 'Anomaly detection', 'Case graph', 'Analyst interface', 'Action brief'];

const whitePaperBlocks = [
  {
    title: 'Problem',
    text: 'Most teams do not struggle because they lack data. They struggle because signals are scattered, context is missing, and the interface does not help a human build a clear case from noisy inputs.'
  },
  {
    title: 'System concept',
    text: 'Eidos Brain explores an intelligence architecture where raw signals become observable events, suspicious patterns become case candidates, and the interface turns machine output into readable evidence.'
  },
  {
    title: 'Interface design',
    text: 'The UI is designed around progressive disclosure: a calm overview first, then anomaly detail, confidence context, supporting signals, and case-building notes only when the user needs depth.'
  },
  {
    title: 'Technical approach',
    text: 'The research direction combines signal processing concepts, anomaly detection, stateful observability, entity relationships, and human-readable intelligence cards rather than a black-box chat surface.'
  },
  {
    title: 'Proof-stage research',
    text: 'This is framed as experimental architecture, not a finished surveillance or production intelligence product. The value is in prototyping the system logic, interface patterns, and reasoning workflow.'
  },
  {
    title: 'What it demonstrates',
    text: 'Eidos Brain shows the ability to think past normal web design: model a complex system, design for trust and clarity, and make advanced technical workflows understandable to business users.'
  }
];

export function EidosBrain() {
  return (
    <section id="eidos" className="section-shell section-block eidos" aria-labelledby="eidos-title">
      <SectionHeader
        id="eidos-title"
        eyebrow="Eidos Brain case study / white paper"
        title="Experimental Intelligence Architecture for signal, anomaly, and case-building workflows."
        summary="A more advanced portfolio proof point: not a storefront, but a research-oriented intelligence interface concept for observing signals, detecting anomalies, and making complex system behavior explainable."
      />

      <div className="eidos-hero" data-reveal>
        <div>
          <p className="section-kicker">Eidos Brain / proof-stage research</p>
          <h3>Calm intelligence UI for messy signal environments.</h3>
          <p>
            The goal is not to make vague AI claims. The goal is to show how an experimental system can receive signals, identify unusual patterns, preserve context, and help a human assemble a case with traceable evidence.
          </p>
        </div>
        <div className="eidos-flow" aria-label="Eidos Brain system concept flow">
          {systemFlow.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="whitepaper-grid">
        {whitePaperBlocks.map((block, index) => (
          <article className="whitepaper-card" key={block.title} data-reveal style={{ '--delay': `${index * 40}ms` } as CSSProperties}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{block.title}</h3>
            <p>{block.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
