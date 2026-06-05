import { useReveal } from './hooks/useReveal';
import { Header } from './components/layout/Header';
import { Hero } from './sections/Hero';
import { Capabilities } from './sections/Capabilities';
import { CaseStudies } from './sections/CaseStudies';
import { ProjectGallery } from './sections/ProjectGallery';
import { ProductionIntelligence } from './sections/ProductionIntelligence';
import { EidosBrain } from './sections/EidosBrain';
import { Process } from './sections/Process';
import { ContactCTA } from './sections/ContactCTA';

function App() {
  useReveal();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <section className="section-shell intro-grid" aria-label="What the studio builds" data-reveal>
          <article>
            <span className="section-kicker">Who I am</span>
            <h2>Brent Parent, building at the edge of design, automation, and intelligence systems.</h2>
          </article>
          <article>
            <h3>What I build</h3>
            <p>Custom web experiences, premium storefronts, InkSoft embeds, production dashboards, workflow automations, WebGL interface layers, and proof-stage AI/intelligence prototypes.</p>
          </article>
          <article>
            <h3>Why it matters</h3>
            <p>Businesses do not need more generic screens. They need digital systems that explain the offer, reduce manual friction, support operations, and create confidence quickly.</p>
          </article>
        </section>
        <Capabilities />
        <CaseStudies />
        <ProjectGallery />
        <ProductionIntelligence />
        <EidosBrain />
        <Process />
        <ContactCTA />
      </main>
      <footer className="site-footer section-shell">
        <p>Brent Parent / Intelligence Studio</p>
        <nav aria-label="Footer navigation">
          <a href="#top">Top</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#case-studies">Case studies</a>
          <a href="#contact">Start a project</a>
        </nav>
      </footer>
    </>
  );
}

export default App;
