import type { BuildStory } from '../data/buildStories';
import '../styles/build-details.css';

export function BuildDetails({ story, headingLevel = 4 }: { story: BuildStory; headingLevel?: 3 | 4 }) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  return <div className="ew-build-details">
    <Heading className="ew-build-details__heading"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" /></svg>Behind the build</Heading>
    <p className="ew-build-details__service">{story.service}</p>
    <p className="ew-build-details__summary">{story.summary}</p>
    <dl className="ew-build-details__stack">{story.stack.map(group => <div key={group.label}><dt>{group.label}</dt><dd><ul>{group.tools.map(tool => <li key={tool}>{tool}</li>)}</ul></dd></div>)}</dl>
    <ol className="ew-build-details__steps">{story.steps.map(step => <li key={step.title}><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol>
  </div>;
}
