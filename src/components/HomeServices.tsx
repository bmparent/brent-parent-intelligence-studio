import '../styles/home-services.css';

const services = [
  {
    icon: 'web',
    title: 'Websites & digital experiences',
    description: 'Custom websites, thoughtful redesigns, landing pages and interactive experiences that make your business memorable.',
    includes: 'Web design · UX/UI · Responsive development · CMS',
    href: '/services/digital-experiences',
  },
  {
    icon: 'commerce',
    title: 'Commerce & customer journeys',
    description: 'Online stores, booking flows and customer portals that make it easier to browse, buy and come back.',
    includes: 'E-commerce · Bookings · Memberships · Payment integrations',
    href: '/services/digital-experiences',
  },
  {
    icon: 'apps',
    title: 'Apps & business systems',
    description: 'Custom web applications, dashboards and internal tools built around the way your team actually works.',
    includes: 'Web apps · Portals · Reporting · Data tools',
    href: '/services/business-systems',
  },
  {
    icon: 'workflow',
    title: 'Integrations & automation',
    description: 'Connect the tools you already use and turn repetitive handoffs into clear, dependable workflows.',
    includes: 'APIs · CRM · Email & calendar · Workflow automation',
    href: '/services/business-systems',
  },
  {
    icon: 'agents',
    title: 'AI assistants & agent workflows',
    description: 'Give AI a useful job: answer from your knowledge, help customers and move routine work forward with people in control.',
    includes: 'Knowledge search · Assistants · Agents · Human approvals',
    href: '/services/intelligent-systems',
  },
  {
    icon: 'growth',
    title: 'Visibility, performance & care',
    description: 'Help people discover your business, improve the experience and keep your digital presence working as you grow.',
    includes: 'SEO & AI search readiness · Analytics · Accessibility · Performance',
    href: '/services/digital-experiences',
  },
] as const;

type ServiceIconKind = (typeof services)[number]['icon'];

function ServiceIcon({ kind }: { kind: ServiceIconKind }) {
  return (
    <span className={`hs-icon hs-icon--${kind}`} aria-hidden="true">
      <svg viewBox="0 0 80 80" fill="none" focusable="false">
        <ellipse className="hs-icon__ground" cx="40" cy="66" rx="27" ry="5" />
        <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {kind === 'web' ? <>
            <rect className="hs-icon__glass" x="10" y="16" width="53" height="37" rx="5" />
            <path d="M10 25h53M17 21h1m4 0h1m4 0h1" />
            <rect className="hs-icon__accent" x="17" y="32" width="19" height="14" rx="2" />
            <path d="M42 33h13M42 39h9M42 45h11" />
            <rect className="hs-icon__front" x="52" y="35" width="17" height="27" rx="4" />
            <path d="M58 40h5M59 57h3" />
          </> : null}
          {kind === 'commerce' ? <>
            <path className="hs-icon__glass" d="M15 27h45l5 29a5 5 0 0 1-5 6H18a5 5 0 0 1-5-6l2-29Z" />
            <path d="M28 31v-9a11 11 0 0 1 22 0v9" />
            <path className="hs-icon__accent" d="m29 43 7 7 13-14" />
            <rect className="hs-icon__front" x="48" y="42" width="23" height="16" rx="4" />
            <path d="M48 48h23M53 53h6" />
          </> : null}
          {kind === 'apps' ? <>
            <rect className="hs-icon__glass" x="11" y="17" width="55" height="42" rx="5" />
            <path d="M11 26h55M24 26v33M16 33h3m-3 7h3m-3 7h3" />
            <rect className="hs-icon__accent" x="30" y="33" width="11" height="9" rx="2" />
            <rect className="hs-icon__accent" x="47" y="33" width="12" height="9" rx="2" />
            <path d="m30 52 7-5 8 3 13-6" />
            <circle className="hs-icon__front" cx="63" cy="55" r="10" />
            <path d="m59 55 3 3 5-6" />
          </> : null}
          {kind === 'workflow' ? <>
            <path d="M27 27h25a8 8 0 0 1 8 8v7M52 54H28a8 8 0 0 1-8-8V35" />
            <path d="m55 37 5 5 5-5M15 40l5-5 5 5" />
            <rect className="hs-icon__glass" x="9" y="16" width="23" height="19" rx="5" />
            <rect className="hs-icon__front" x="48" y="44" width="23" height="19" rx="5" />
            <path d="m16 22 4 4 5-4M54 51h11M54 56h7" />
            <path className="hs-icon__accent" d="m41 32-9 13h8l-1 9 10-15h-9l1-7Z" />
          </> : null}
          {kind === 'agents' ? <>
            <path d="M40 21v9M40 50v10M21 40h9M50 40h10M25 24l8 8M48 48l8 8" />
            <circle className="hs-icon__glass" cx="40" cy="40" r="15" />
            <path className="hs-icon__accent" d="m40 31 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" />
            <rect className="hs-icon__front" x="31" y="8" width="18" height="14" rx="5" />
            <circle className="hs-icon__front" cx="15" cy="40" r="7" />
            <circle className="hs-icon__front" cx="65" cy="40" r="7" />
            <rect className="hs-icon__front" x="31" y="59" width="18" height="14" rx="5" />
            <path d="m36 66 3 3 5-6" />
          </> : null}
          {kind === 'growth' ? <>
            <rect className="hs-icon__glass" x="11" y="23" width="46" height="39" rx="5" />
            <path d="M20 52v-9M30 52V37M40 52V32" />
            <path className="hs-icon__accent" d="m17 36 12-8 9 2 13-13M43 17h8v8" />
            <circle className="hs-icon__front" cx="57" cy="42" r="12" />
            <path d="m65 51 7 8M53 42l3 3 5-6" />
          </> : null}
        </g>
      </svg>
    </span>
  );
}

export function HomeServices() {
  return (
    <section className="hs-section" id="services" aria-labelledby="home-services-title">
      <div className="ew-shell">
        <div className="hs-intro">
          <div>
            <p className="ew-eyebrow">01 / What we can build for you</p>
            <h2 id="home-services-title">A remarkable website.<br /><em>A more capable business.</em></h2>
          </div>
          <div className="hs-intro__copy">
            <p>We design and develop websites, online stores and custom applications—and connect them to the systems, automation and AI that help your business move forward.</p>
            <p className="hs-intro__note">From your first website to a complete digital ecosystem. Built for the agentic age, with human direction.</p>
          </div>
        </div>
        <nav className="hs-families" aria-label="Explore our services">
          <a href="/services/digital-experiences">Digital Experiences <span aria-hidden="true">↗</span></a>
          <a href="/services/business-systems">Business Systems <span aria-hidden="true">↗</span></a>
          <a href="/services/intelligent-systems">Intelligent Systems <span aria-hidden="true">↗</span></a>
        </nav>
        <div className="hs-grid">
          {services.map((service, index) => (
            <a className="hs-card" key={service.icon} href={service.href} aria-labelledby={`home-service-${service.icon}`}>
              <div className="hs-card__top">
                <ServiceIcon kind={service.icon} />
                <span className="hs-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')} / <span>↗</span></span>
              </div>
              <h3 id={`home-service-${service.icon}`}>{service.title}</h3>
              <p>{service.description}</p>
              <span className="hs-card__includes">{service.includes}</span>
            </a>
          ))}
        </div>
        <div className="hs-invitation">
          <div><h3>What would make your business work better?</h3><p>Bring us an idea, an existing site or a process that needs a better way.</p><p className="hs-invitation__scope">Strategy, design, development, hosting setup, migrations and ongoing care—scoped around what you need.</p></div>
          <div className="ew-actions">
            <a className="ew-button hs-start" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
            <a className="hs-review" href="/friction-review">Get a Friction Review <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
