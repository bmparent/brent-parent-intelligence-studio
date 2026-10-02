import '../styles/home-services.css';

const services = [
  { id: 'web', artwork: 'websites', width: 1717, height: 916, title: 'Websites & experiences',
    description: 'Give your business a distinct place online.', includes: 'Design / Development / CMS', href: '/services/digital-experiences' },
  { id: 'commerce', artwork: 'commerce', width: 1568, height: 1003, title: 'Online stores',
    description: 'Make browsing and buying feel effortless.', includes: 'Commerce / Payments / Booking', href: '/services/digital-experiences' },
  { id: 'apps', artwork: 'business', width: 1796, height: 876, title: 'Business apps',
    description: "Tools shaped around your team's work.", includes: 'Apps / Portals / Reporting', href: '/services/business-systems' },
  { id: 'workflow', artwork: 'automation', width: 1834, height: 858, title: 'Integrations & automation',
    description: 'Connect the steps that slow you down.', includes: 'APIs / Workflows / CRM', href: '/services/business-systems' },
  { id: 'agents', artwork: 'assistants', width: 1836, height: 857, title: 'AI assistants',
    description: 'Useful help, grounded in your knowledge.', includes: 'Knowledge / Assistants / Agents', href: '/services/intelligent-systems' },
  { id: 'growth', artwork: 'performance', width: 1761, height: 893, title: 'Performance & care',
    description: 'Keep your site fast, clear and discoverable.', includes: 'SEO / Accessibility / Maintenance', href: '/services/digital-experiences' },
] as const;

function ServiceArrow() {
  return <img className="hs-arrow" src="/images/services/folio/arrow-up-right.svg" width="24" height="24" alt="" aria-hidden="true" />;
}

export function HomeServices() {
  return (
    <section className="hs-section" id="services" aria-labelledby="home-services-title">
      <div className="ew-shell">
        <div className="hs-intro">
          <div>
            <p className="ew-eyebrow">The studio toolkit</p>
            <h2 id="home-services-title">What your business<br /><em>could become.</em></h2>
          </div>
          <div className="hs-intro__copy">
            <p>A better website. Smoother operations.<br />Technology that earns its place.</p>
            <nav className="hs-families" aria-label="Explore our services">
              <a href="/services/digital-experiences">Digital Experiences <ServiceArrow /></a>
              <a href="/services/business-systems">Business Systems <ServiceArrow /></a>
              <a href="/services/intelligent-systems">Intelligent Systems <ServiceArrow /></a>
            </nav>
          </div>
        </div>
        <div className="hs-grid">
          {services.map((service) => (
            <a className={'hs-card hs-card--' + service.id} key={service.id} href={service.href} aria-labelledby={'home-service-' + service.id}>
              <div className="hs-card__art" aria-hidden="true">
                <img
                  src={'/images/services/folio/' + service.artwork + '.webp'}
                  srcSet={'/images/services/folio/' + service.artwork + '-small.webp 640w, /images/services/folio/' + service.artwork + '.webp 1280w'}
                  sizes="(max-width: 700px) calc(100vw - 48px), (max-width: 1100px) 50vw, 720px"
                  width={service.width}
                  height={service.height}
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
              </div>
              <div className="hs-card__copy">
                <h3 id={'home-service-' + service.id}>{service.title}</h3>
                <p>{service.description}</p>
                <div className="hs-card__meta"><span className="hs-card__includes">{service.includes}</span><ServiceArrow /></div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="hs-invitation">
        <div className="ew-shell hs-invitation__inner">
          <div><h3>Let's make the next thing work better.</h3><p>Design, development, hosting, migrations and ongoing care.</p></div>
          <a className="ew-button hs-start" href="/contact">Start a project <ServiceArrow /></a>
        </div>
      </div>
    </section>
  );
}
