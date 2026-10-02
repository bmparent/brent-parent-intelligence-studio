import { useState } from 'react';
import { showcase } from '../data/showcase';
import { mdcaBuild, storefrontBuilds, type BuildStory } from '../data/buildStories';
import { BuildDetails } from './BuildDetails';
import '../styles/digital-experiences.css';

const holidaysImage = showcase.find((project) => project.slug === 'holidays-in-hollywood')?.image ?? '';
const jingleImage = showcase.find((project) => project.slug === 'jingle-bell-jingle-bam')?.image ?? '';
const nighttimeImage = showcase.find((project) => project.slug === 'nighttime-spectaculars')?.image ?? '';

type Project = {
  title: string;
  kind: string;
  image: string;
  alt: string;
  href: string;
  action: string;
  external?: boolean;
  headline: string;
  description: string;
  build?: string[];
  buildStory?: BuildStory;
  application: string;
  disclosure: string;
  color: string;
};

const projects: Project[] = [
  {
    title: 'Holidays in Hollywood',
    kind: 'Theatrical storefront · Public reconstruction',
    image: holidaysImage,
    alt: 'Saved Holidays in Hollywood storefront design showing a theatrical holiday entrance and apparel paths.',
    href: '/work/holidays-in-hollywood',
    action: 'Explore the storefront',
    headline: 'Give a collection an entrance with a point of view.',
    description: 'A Hollywood-inspired holiday scene gives this cast-and-crew collection its own atmosphere. From that entrance, visitors can move into jackets, hoodies, headwear, and pants rather than deciphering a generic product grid.',
    buildStory: storefrontBuilds['holidays-in-hollywood'],
    application: 'When your product has a story, the first screen can set its tone and still lead people directly toward a useful choice.',
    disclosure: 'Storefront design within Data Graphics’ client-services workflow. Public design reconstruction; products and options are illustrative, with no orders or payments. Brand assets belong to their owners. No direct Disney relationship is claimed.',
    color: 'gold'
  },
  {
    title: 'MDCA Webstore',
    kind: 'Live hosted storefront · School uniforms',
    image: 'https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1780932549/mdca_snip_qbsoup.png',
    alt: 'Saved MDCA uniform-store entrance with school branding and ordering guidance.',
    href: 'https://stores.inksoft.com/mdca_webstore_/shop/home',
    action: 'Visit the live webstore',
    external: true,
    headline: 'Make the practical questions easy to answer.',
    description: 'The MDCA store helps families choose between shopping now and checking fit first. Its live entrance explains the ordering path, production timing, and pickup notification before the customer reaches the catalog.',
    buildStory: mdcaBuild,
    application: 'A useful customer experience often starts by answering the questions people would otherwise need to call or email about.',
    disclosure: 'Storefront work within Data Graphics’ client-services workflow; Eidos Works does not claim a direct MDCA client relationship or ownership of the school identity. Image is a saved design reference; the linked store is live. No conversion or sales uplift is claimed.',
    color: 'blue'
  },
  {
    title: 'Little House · Big Adventures',
    kind: 'Interactive game · Studio project',
    image: '/images/site-gallery/little-house-big-adventures.webp',
    alt: 'Illustrated Little House dollhouse with rooms to explore.',
    href: 'https://little-house-big-adventures.bmparent.chatgpt.site/dollhouse',
    action: 'Explore the illustrated house',
    external: true,
    headline: 'Turn a small action into a place to explore.',
    description: 'Room by room, Little House turns exploration into play. Visitors can look for hidden stars, rescue toys, decorate, and move through an illustrated dollhouse at their own pace.',
    build: [
      'The experience is organized around a repeatable loop: enter a room, explore it, and discover an action or challenge.',
      'Different modes and room choices give players a reason to return without hiding the basic controls.',
      'An illustrated dollhouse provides a separate playable route when the 3D experience is unavailable.'
    ],
    application: 'Participation can help people remember an idea. That same design thinking can inform a learning tool, exhibition, or campaign.',
    disclosure: 'Independent studio game. The linked illustrated experience is the reliable preview; the separate 3D view depends on browser and device support.',
    color: 'rose'
  },
  {
    title: 'Tidal',
    kind: 'Interactive experiment · Studio project',
    image: '/images/site-gallery/tidal-field.webp',
    alt: 'Tidal interactive current field with glowing particles and flowing motion.',
    href: 'https://tidal-field.bmparent.chatgpt.site',
    action: 'Shape the current',
    external: true,
    headline: 'Let the visitor shape what happens next.',
    description: 'Tidal is a responsive field of moving currents. Drag to stir it, add attracting or repelling forces, and change the energy, complexity, and trails to see how the field responds.',
    build: [
      'The interface puts a few direct controls around one visual idea, with immediate feedback for each choice.',
      'Distinct world presets change the character of the motion while pause and keyboard controls offer other ways to explore.',
      'The interaction is the content: the visitor learns by changing the field rather than watching a fixed sequence.'
    ],
    application: 'A demonstration or campaign can make a concept easier to grasp when a visitor is able to test it directly.',
    disclosure: 'Independent studio experiment. It demonstrates interaction design; no customer campaign outcome is claimed.',
    color: 'teal'
  }
];

const startingPoints = [
  { label: 'Explain an offer', title: 'Make the first decision clear.', body: 'Show what you do, whom it serves, and the most useful next step before asking someone to contact you.', project: 'MDCA Webstore' },
  { label: 'Guide a purchase', title: 'Give the collection a path.', body: 'Group the choices, surface practical details, and make it easy to inspect an item before committing.', project: 'Holidays in Hollywood' },
  { label: 'Invite participation', title: 'Give people something to do.', body: 'Let a visitor explore, test, or change an idea when interaction helps them understand it.', project: 'Little House · Big Adventures' },
  { label: 'Show a complex idea', title: 'Make the concept tangible.', body: 'Use a focused interactive model to reveal what changes when a person takes an action.', project: 'Tidal' }
];

function ProjectLink({ project }: { project: Project }) {
  return <a className="dx-link" href={project.href} {...(project.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{project.action} <span aria-hidden="true">↗</span></a>;
}

export function DigitalExperiencesPage() {
  const [active, setActive] = useState(0);
  const [startingPoint, setStartingPoint] = useState(0);
  const featured = projects[active];
  const selectedPath = startingPoints[startingPoint];

  return <div className="dx-page">
    <section className="dx-hero ew-shell" aria-labelledby="dx-title">
      <div className="dx-hero__copy">
        <p className="ew-eyebrow">Digital Experiences</p>
        <h1 id="dx-title">Custom websites.<br/><em>Unmistakable experiences.</em></h1>
        <p>We design and develop responsive websites, ecommerce storefronts, campaign landing pages, and interactive web applications. From a custom InkSoft storefront to a React and TypeScript frontend, the build starts with what your customer needs to understand or do.</p>
        <div className="dx-actions"><a className="ew-button ew-button--primary" href="#selected-experiences">Explore the work ↓</a><a className="dx-text-link" href="/friction-review">Show us what almost works ↗</a></div>
      </div>
      <div className={`dx-stage dx-stage--${featured.color}`}>
        <div className="dx-stage__top"><span>Selected experience</span><span aria-hidden="true">✳</span></div>
        <a href={featured.href} {...(featured.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-label={`Explore ${featured.title}`}>
          <img key={featured.title} src={featured.image} width="960" height="670" alt={featured.alt} fetchPriority={active === 0 ? 'high' : undefined} />
        </a>
        <div className="dx-stage__footer"><div><small>{featured.kind}</small><strong>{featured.title}</strong></div><span aria-hidden="true">↗</span></div>
      </div>
      <div className="dx-selector" aria-label="Choose a featured experience">
        {projects.map((project, index) => <button key={project.title} type="button" aria-pressed={index === active} onClick={() => setActive(index)}><strong>{project.title}</strong><small>{project.kind.split(' · ')[0]}</small></button>)}
      </div>
    </section>

    <section className="dx-capabilities ew-shell" aria-labelledby="dx-capabilities-title">
      <div><p className="ew-eyebrow">Web design & frontend development</p><h2 id="dx-capabilities-title">Choose the build that fits the job.</h2><p>A clearer website, a better shopping journey, or a custom interactive application: the technology should serve the experience and the team maintaining it.</p></div>
      <dl>
        <div><dt>React & TypeScript development</dt><dd>Custom interfaces, reusable components, interactive product views, and web applications with explicit state and typed data.</dd></div>
        <div><dt>InkSoft storefront customization</dt><dd>Branded HTML and CSS entrances, collection navigation, and responsive ecommerce UX within an existing hosted commerce platform.</dd></div>
        <div><dt>Responsive web design & UI/UX</dt><dd>Mobile layouts, keyboard controls, product inspection, HTML Canvas animation, and reduced-motion options built around useful customer actions.</dd></div>
        <div><dt>Technical SEO & search-ready content</dt><dd>Descriptive page titles, semantic HTML, canonical URLs, structured data, and prerendered service and case-study content. <a href="/services/agentic-seo">Explore our search-readiness approach →</a></dd></div>
      </dl>
    </section>

    <section className="dx-intro ew-shell" id="selected-experiences">
      <p className="ew-eyebrow">Selected experiences</p>
      <h2>The idea is visible.<br/><em>The thinking is, too.</em></h2>
      <p>Each project begins with a different question: how should someone enter a collection, choose the right uniform, explore a place, or understand an idea? Step into the work, then see how the content, interface, and existing technology fit together.</p>
    </section>

    <section className="dx-projects" aria-label="Featured digital experience projects">
      {projects.map((project) => <article className={`dx-project dx-project--${project.color}`} key={project.title}>
        <div className="dx-project__inner ew-shell">
          <div className="dx-project__visual"><a href={project.href} {...(project.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-label={`Explore ${project.title}`}><img src={project.image} width="1200" height="800" loading="lazy" alt={project.alt}/></a><p>{project.kind}</p></div>
          <div className="dx-project__story"><p className="ew-eyebrow">{project.title}</p><h3>{project.headline}</h3><p className="dx-project__description">{project.description}</p>{project.buildStory ? <BuildDetails story={project.buildStory} /> : <div className="dx-project__build"><h4>Behind the build</h4><ol>{project.build?.map((step) => <li key={step}>{step}</li>)}</ol></div>}<p className="dx-project__application"><strong>For your work</strong>{project.application}</p><ProjectLink project={project}/><small className="dx-project__disclosure">{project.disclosure}</small></div>
        </div>
      </article>)}
    </section>

    <section className="dx-more ew-shell" aria-labelledby="dx-more-title"><div><p className="ew-eyebrow">Storefront engineering</p><h2 id="dx-more-title">Custom storefronts, from artwork to interaction.</h2><p>See how two more InkSoft designs become working React portfolio experiences, with their own graphics and browsing details.</p><a className="dx-text-link" href="https://portal-pocket-ar.bmparent.chatgpt.site" target="_blank" rel="noopener noreferrer">Explore Pocket Portal, our camera-based studio experiment ↗</a></div><div className="dx-more__grid">
      <article><a href="/work/jingle-bell-jingle-bam"><img src={jingleImage} width="700" height="450" loading="lazy" alt="Jingle Bell, Jingle BAM holiday storefront theatre artwork"/></a><span>Public storefront reconstruction</span><h3>Jingle Bell, Jingle BAM!</h3><BuildDetails story={storefrontBuilds['jingle-bell-jingle-bam']} /><p className="dx-project__disclosure">Data Graphics client-services work. Public reconstruction with a demo cart; no orders or payments. Brand assets belong to their owners; no direct Disney engagement is claimed.</p><a className="dx-link" href="/work/jingle-bell-jingle-bam">Explore the holiday storefront ↗</a></article>
      <article><a href="/work/nighttime-spectaculars"><img src={nighttimeImage} width="700" height="450" loading="lazy" alt="Nighttime Spectaculars storefront artwork showing Hollywood Studios at night"/></a><span>Public storefront reconstruction</span><h3>Nighttime Spectaculars</h3><BuildDetails story={storefrontBuilds['nighttime-spectaculars']} /><p className="dx-project__disclosure">Data Graphics client-services work. Illustrative public catalog and temporary demo bag; no orders or payments. No direct Disney engagement or measured sales outcome is claimed.</p><a className="dx-link" href="/work/nighttime-spectaculars">Explore the animated storefront ↗</a></article>
    </div></section>

    <section className="dx-translate" aria-labelledby="dx-translate-title"><div className="ew-shell dx-translate__inner"><div><p className="ew-eyebrow">Your work, made easier to experience</p><h2 id="dx-translate-title">What should your customers be able to understand or do?</h2><p>A school store, an event, a service business, and a product launch need different paths. Choose a starting point to see the kind of question we would tackle first.</p></div><div className="dx-translate__tool"><div className="dx-translate__choices" aria-label="Choose a customer goal">{startingPoints.map((point, index) => <button type="button" key={point.label} aria-pressed={index === startingPoint} onClick={() => setStartingPoint(index)}>{point.label}</button>)}</div><div className="dx-translate__result" aria-live="polite"><span>First question / {selectedPath.project}</span><h3>{selectedPath.title}</h3><p>{selectedPath.body}</p><a href="/friction-review">Show us your customer path ↗</a></div></div></div></section>

    <section className="dx-process ew-shell" aria-labelledby="dx-process-title"><div><p className="ew-eyebrow">From idea to working experience</p><h2 id="dx-process-title">The build starts with the moment that matters.</h2></div><ol><li><span>01</span><h3>Understand the path</h3><p>Look at who arrives, what they know, where they hesitate, and the decision they need to make next.</p></li><li><span>02</span><h3>Shape the experience</h3><p>Map the content, navigation, and key interactions. Let the visual direction grow from the product and audience.</p></li><li><span>03</span><h3>Build within reality</h3><p>Work with the platform and workflow already in place when that is the right fit. Keep responsive behavior and accessible controls part of the design.</p></li><li><span>04</span><h3>Test the journey</h3><p>Check the essential path across screens and with reduced motion or advanced graphics unavailable.</p></li></ol></section>
  </div>;
}
