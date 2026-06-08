import { useReveal } from './hooks/useReveal';
import { Header } from './components/layout/Header';
import { Hero } from './sections/Hero';
import { Capabilities } from './sections/Capabilities';
import { CaseStudies } from './sections/CaseStudies';
import { ProductionIntelligence } from './sections/ProductionIntelligence';
import { EidosBrain } from './sections/EidosBrain';
import { Process } from './sections/Process';
import { IntelligenceStudioAgent } from './components/ui/IntelligenceStudioAgent';
import { WorkMediaExplorer } from './components/WorkMediaExplorer';
import { PricingCards } from './components/PricingCards';
import { InsightsIndex } from './components/InsightsIndex';
import { ProjectIntakeWizard } from './components/ProjectIntakeWizard';
import { SEOJsonLd } from './components/SEOJsonLd';
import { siteConfig } from './config/site';

function App() {
  useReveal();

  return (
    <>
      <SEOJsonLd />
      <Header />
      <main>
        <Hero />
        <section className="section-shell intro-grid" aria-label="What the studio builds" data-reveal>
          <article>
            <span className="section-kicker">Who Eidos Works is</span>
            <h2>A creative technology studio led by Brent Parent.</h2>
          </article>
          <article>
            <h3>What I build</h3>
            <p>Custom storefronts, graphic design and mockups, production dashboards, workflow automation, WebGL interface layers, and Eidos Brain / Sentinel prototypes.</p>
          </article>
          <article>
            <h3>Why it matters</h3>
            <p>Teams need digital systems that explain the offer, reduce manual friction, support operations, and make the next useful action easier to see.</p>
          </article>
        </section>
        <IntelligenceStudioAgent />
        <Capabilities />
        <CaseStudies />
        <WorkMediaExplorer />
        <ProductionIntelligence />
        <EidosBrain />
        <Process />
        <PricingCards />
        <InsightsIndex />
        <ProjectIntakeWizard />
      </main>
      <footer className="site-footer section-shell">
        <div className="site-footer__brand">
          <img src={siteConfig.logos.stacked} alt="Eidos Works logo" width="126" height="126" loading="lazy" />
          <p>
            <strong>Eidos Works</strong>
            <span>Systems, storefronts, dashboards, automation, and intelligence prototypes by Brent Parent.</span>
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#top">Top</a>
          <a href="#capabilities">Services</a>
          <a href="#work">Work</a>
          <a href="#eidos">Eidos Brain</a>
          <a href="#insights">Insights</a>
          <a href="#start">Start a Project</a>
        </nav>
      </footer>
    </>
  );
}

export default App;
