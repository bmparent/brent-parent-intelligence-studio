import { useState } from 'react';
import '../styles/source-answer-demo.css';

// Public showcase examples. This component never contacts an assistant or provider.
const examples = [
  {
    question: 'What can help a print shop organize promo photos?',
    answer: 'Promo Photo Organizer is a private Data Graphics photo-intake workflow. Job details, labeled photo views, and an upload queue keep context with each image before handoff review. Customer photos stay private. Automatic downstream sorting remains unverified.',
    sources: [{ title: 'Business Systems · private photo workflow', href: '/services/business-systems' }],
  },
  {
    question: 'What does Wellway help with?',
    answer: 'Wellway is a fictional reflection tool with check-ins, a journey view, and editable plans. Local prompts remain available when optional hosted assistance is unavailable. Its people and records are demonstration data; it is not diagnosis, treatment, or emergency care.',
    sources: [{ title: 'Wellway · fictional demonstration', href: '/demos/wellway/' }],
  },
  {
    question: 'How does the PERNR access gate work?',
    answer: 'The PERNR case study describes checking an employee identifier or approved name against a controlled roster. The public demonstration uses fictional credentials and keeps the employee roster private. The work was completed within Data Graphics’ client-services workflow; it is not enterprise SSO or a direct Disney engagement.',
    sources: [{ title: 'PERNR · public access-gate case study', href: '/work/pernr-access-gate' }],
  },
];

export function SupportedAnswerDemo() {
  const [selected, setSelected] = useState(0);
  const example = examples[selected];
  return <section className="ew-shell service-task">
    <p className="ew-eyebrow">Try a supported task</p>
    <h2>Inspect the answer and its sources.</h2>
    <p>This demonstration uses three published project examples. No AI request is made.</p>
    <label>Choose a question<select value={selected} onChange={event => setSelected(Number(event.target.value))}>
      {examples.map((item, index) => <option key={item.question} value={index}>{item.question}</option>)}
    </select></label>
    <article aria-live="polite">
      <h3>Published-source answer</h3><p>{example.answer}</p>
      <ul>{example.sources.map(source => <li key={source.href}><a href={source.href}>{source.title}</a></li>)}</ul>
      <small>Fictional health records in Wellway are demonstration data. Private employee records and customer photos are never part of this example.</small>
    </article>
  </section>;
}
