import { useState } from 'react';
import { SupportedAnswerDemo } from './ServiceExplorer';
import '../styles/intelligent-systems.css';

const projects = [
  {
    number: '01', title: 'Wellway', status: 'Reflection tool · fictional scenario',
    image: '/images/site-gallery/wellway-journey.webp',
    alt: 'Wellway fictional member workspace with a check-in, journey chart, and editable plan.',
    problem: 'Personal notes and check-ins can be hard to revisit when they live in separate places.',
    system: 'A guided workspace brings check-ins, a journey view, an editable plan, and optional assistance together around the member’s own reflection.',
    control: 'The person chooses what to record and review. The advisor view is part of the fictional demo; AI does not approve a plan. Local prompts remain available when hosted assistance is unavailable.',
    verified: 'The rebuilt demo and 23 local data, evidence, and storage tests passed. The public scenario uses fictional people and records. This is a reflection tool, not diagnosis, treatment, or emergency care.',
    href: '/demos/wellway/', action: 'Explore the fictional demo',
  },
  {
    number: '02', title: 'Ask Eidos', status: 'Published-source assistant',
    image: '', alt: '',
    problem: 'Visitors need a specific answer about studio work without guessing which page to open.',
    system: 'The assistant starts with a maintained project catalogue and shows links to its published sources. A separate optional AI elaboration is labeled when available.',
    control: 'Questions stay in the current tab until reset. The visitor can reset context, inspect source links, or stop. Optional AI sends the question and bounded context to a provider; visitors are asked to avoid private information.',
    verified: 'Local catalogue and follow-up tests cover supported project answers and reset behavior. The source-answer exercise below runs without an AI request. The current hosted model and paired provider behavior remain unverified.',
    href: '#is-answer', action: 'Try a source-backed answer',
  },
  {
    number: '03', title: 'Sentinel Lab', status: 'Research-stage system',
    image: '/images/work/sentinel-lab.webp',
    alt: 'Sentinel Lab research interface showing experiment and evidence status.',
    problem: 'Experiments can look conclusive before their inputs, failure cases, and evidence have been examined.',
    system: 'A separate research application makes experiment status and evidence gates visible for streaming prediction and surprise investigations.',
    control: 'A person reviews experiment status and evidence before drawing conclusions. The public assistant does not operate Lab experiments or take action on a visitor’s behalf.',
    verified: 'The interface and engineering checks are available for inspection. Synthetic tests do not establish scientific qualification, field performance, or a customer security outcome. Research validation remains open.',
    href: '/lab', action: 'Inspect the research boundary',
  },
] as const;

function ProjectImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <div className="is-image-fallback" role="img" aria-label={`${title} image unavailable`}><strong>{title}</strong><span>Image unavailable. Project details remain below.</span></div>
    : <img src={src} width="1200" height="800" loading="lazy" alt={alt} onError={() => setFailed(true)} />;
}

export function IntelligentSystemsPage() {
  return <div className="is-page">
    <section className="is-hero ew-shell" aria-labelledby="is-title">
      <div>
        <p className="ew-eyebrow">Service 03 / Intelligent Systems</p>
        <h1 id="is-title">Give assistance a job. <em>Keep people in control.</em></h1>
        <p>Useful intelligence begins with a specific question, trustworthy information, and a clear limit on what the system may do. These three projects show different ways to make that boundary visible.</p>
        <a className="ew-button ew-button--primary" href="#is-work">See the projects ↓</a>
      </div>
      <nav className="is-hero__index" aria-label="Projects on this page">
        <span>Selected systems / 03</span>
        {projects.map(project => <a key={project.number} href={`#is-project-${project.number}`}><b>{project.number}</b>{project.title}<span aria-hidden="true">↘</span></a>)}
      </nav>
    </section>

    <section className="is-intro ew-shell" id="is-work" aria-labelledby="is-work-title">
      <p className="ew-eyebrow">Selected work</p>
      <h2 id="is-work-title">A useful answer needs an <em>inspectable boundary.</em></h2>
      <p>Wellway supports personal reflection. Ask Eidos answers questions about published work. Sentinel Lab is a place to test research ideas. Each has a different purpose and a different level of evidence.</p>
    </section>

    <section className="is-projects" aria-label="Intelligent Systems projects">
      {projects.map(project => <article className="is-project" id={`is-project-${project.number}`} key={project.number}>
        <div className="ew-shell is-project__grid">
          <figure className="is-project__visual">
            <div className="is-project__visual-head"><span>{project.number} / 03</span><span>{project.status}</span></div>
            {project.image ? <ProjectImage src={project.image} alt={project.alt} title={project.title} /> : <div className="is-source-flow" role="img" aria-label="Ask Eidos source-answer path: visitor question, published project catalogue, answer with source links"><span>Published-source path</span><ol><li>Visitor question</li><li>Project catalogue</li><li>Answer + source links</li></ol><small>Optional AI elaboration is separate and labeled.</small></div>}
            <figcaption>{project.title === 'Wellway' ? 'Existing public capture · fictional scenario data' : project.title === 'Sentinel Lab' ? 'Existing public research-interface capture · current status lives in the Lab' : 'Diagram of the source-answer flow · no provider request shown'}</figcaption>
          </figure>
          <div className="is-project__copy">
            <p className="ew-eyebrow">{project.status}</p>
            <h3>{project.title}</h3>
            <dl>
              <div><dt>The problem</dt><dd>{project.problem}</dd></div>
              <div><dt>How it works</dt><dd>{project.system}</dd></div>
              <div><dt>Human control</dt><dd>{project.control}</dd></div>
              <div><dt>What is verified</dt><dd>{project.verified}</dd></div>
            </dl>
            <a href={project.href}>{project.action} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>)}
    </section>

    <div className="is-answer" id="is-answer"><SupportedAnswerDemo /></div>
    <section className="is-method ew-shell" aria-labelledby="is-method-title">
      <div><p className="ew-eyebrow">How we work</p><h2 id="is-method-title">Define the task, then test the limit.</h2></div>
      <ol>
        <li><span>01</span><div><h3>Name the decision</h3><p>Start with the question a person needs answered and the approved sources it can use.</p></div></li>
        <li><span>02</span><div><h3>Set the controls</h3><p>Decide who may see, change, or approve each result; make cost and permission limits explicit.</p></div></li>
        <li><span>03</span><div><h3>Check failures</h3><p>Test missing sources, uncertain answers, unavailable assistance, and recovery before broadening access.</p></div></li>
      </ol>
    </section>
  </div>;
}
