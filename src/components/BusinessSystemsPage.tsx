import { ConceptApplications } from './ConceptApplications';
import { BuildDetails } from './BuildDetails';
import { businessDemoBuild } from '../data/buildStories';
import '../styles/business-systems.css';

const examples = [
  {
    number: '01', label: 'Working product', title: 'EmbroideryCalc',
    image: '/images/site-gallery/embroiderycalc-pro.webp',
    alt: 'EmbroideryCalc interface showing embroidery estimating inputs and calculated output.',
    headline: 'Make the estimate explain itself.',
    challenge: 'Embroidery pricing depends on production inputs that are easy to lose in a spreadsheet or a hurried handoff.',
    approach: 'A focused workspace brings the inputs and resulting estimate into the same view so the operator can inspect the assumptions before using the number.',
    boundary: 'A working estimating product. The public view demonstrates the interface; it does not quote or commit to a customer price.',
    href: 'https://embroiderycalc-public.pages.dev/', action: 'Open EmbroideryCalc', external: true,
  },
  {
    number: '02', label: 'Internal workflow · Public case study', title: 'Production reporting',
    image: '/images/case-studies/production-dashboard.png',
    alt: 'Production dashboard case study showing schedule counts, filters, and work-order rows.',
    headline: 'Put the exception beside the schedule.',
    challenge: 'A long job list leaves the team searching for late work, due dates, and the next department handoff.',
    approach: 'The reporting interface groups attention cues, filters, and work-order details around the decision the operator needs to make next.',
    boundary: 'Built within Data Graphics’ internal production workflow. The public capture excludes customer rows. This is not presented as a direct Eidos Works client engagement or a measured improvement claim.',
    href: '/work/production-dashboard', action: 'Explore the case study', external: false,
  },
  {
    number: '03', label: 'Private operational project', title: 'Promo Photo Organizer',
    image: '', alt: '',
    headline: 'Carry the job context with the photo.',
    challenge: 'Production photos need a job identity, view labels, and a reliable handoff before they can be useful to the next person.',
    approach: 'A private intake flow captures job details and photo views and checks the upload queue before a planned SharePoint handoff. Customer images and employee records stay out of the public portfolio.',
    boundary: 'Private Data Graphics workflow. The public description covers intake and queue behavior; automatic downstream sorting and image enhancement outcomes are not represented as verified here.',
    href: '/contact?project=promo-organizer', action: 'Discuss a similar workflow', external: false,
  },
] as const;

export function BusinessSystemsPage() {
  return <div className="bs-page">
    <section className="bs-hero ew-shell" aria-labelledby="bs-title">
      <div><p className="ew-eyebrow">Business Systems</p><h1 id="bs-title">Make the next step <em>visible.</em></h1><p>Custom web applications, operational dashboards, workflow automation, and API integrations should make daily work easier to follow. When jobs move through spreadsheets, inboxes, and disconnected tools, we build around the moment someone needs to know what is current, what needs attention, or who has the next action.</p><a className="ew-button ew-button--primary" href="#bs-work">See the work ↓</a></div>
      <div className="bs-hero__index" aria-label="Examples on this page"><span>Selected systems</span>{examples.map(item => <a key={item.number} href={`#bs-example-${item.number}`}><span>{item.title}</span><span aria-hidden="true">↘</span></a>)}</div>
    </section>

    <section className="bs-intro ew-shell" id="bs-work" aria-labelledby="bs-work-title"><p className="ew-eyebrow">Selected work</p><h2 id="bs-work-title">Different jobs. One useful question: <em>what happens next?</em></h2><p>These examples cover an estimator, a production view, and a photo handoff. Each starts with the operator’s decision, then works backward to the fields, checks, and interface needed to support it.</p></section>

    <section className="bs-cases" aria-label="Business Systems examples">{examples.map(item => <article id={`bs-example-${item.number}`} className="bs-case" key={item.number}><div className="ew-shell bs-case__grid"><div className="bs-case__visual"><div className="bs-case__visual-head"><span>{item.label}</span></div>{item.image ? <img src={item.image} width="1200" height="800" loading="lazy" alt={item.alt}/> : <div className="bs-private" role="img" aria-label="Diagram of a private photo intake: job details, labeled photos, upload queue, then planned handoff review"><span>Private workflow / No customer photos shown</span><ol><li>Job details</li><li>Labeled views</li><li>Upload queue</li><li>Handoff review</li></ol></div>}<small>{item.boundary}</small></div><div className="bs-case__copy"><p className="ew-eyebrow">{item.title}</p><h3>{item.headline}</h3><div><h4>The friction</h4><p>{item.challenge}</p></div><div><h4>How the interface is shaped</h4><p>{item.approach}</p></div><a href={item.href} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.action} <span aria-hidden="true">↗</span></a></div></div></article>)}</section>

    <section className="bs-demo ew-shell" aria-labelledby="bs-demo-title"><div className="bs-demo__heading"><div><p className="ew-eyebrow">Try a working interaction</p><h2 id="bs-demo-title">Change a value. Find an exception. Inspect the next action.</h2></div><p>These three small demonstrations use fictional records and rates. They show how a production board, estimator, and reporting view can respond to a real operator action. They are not connected to customer systems.</p></div><ConceptApplications /><BuildDetails story={businessDemoBuild} headingLevel={3} /></section>

    <section className="bs-process ew-shell" aria-labelledby="bs-process-title"><div><p className="ew-eyebrow">How we build</p><h2 id="bs-process-title">Start at the handoff that keeps breaking.</h2></div><ol><li><span>01</span><h3>Trace the work</h3><p>Identify the source of each field, the person who changes it, and the decision it supports.</p></li><li><span>02</span><h3>Choose the smallest useful tool</h3><p>Prototype the view or action around the actual operator, with the existing systems and permissions in mind.</p></li><li><span>03</span><h3>Handle imperfect data</h3><p>Make missing, stale, and failed inputs visible. Define what can be retried and what needs a person to review.</p></li><li><span>04</span><h3>Test the handoff</h3><p>Check the route from input to output, including access, export, and recovery before expanding the workflow.</p></li></ol></section>
  </div>;
}
