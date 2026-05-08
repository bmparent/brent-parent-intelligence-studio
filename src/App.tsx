import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { WebGLCanvas } from './three/WebGLCanvas'
import { Hero } from './sections/Hero'
import { CapabilitiesCommandCenter } from './sections/CapabilitiesCommandCenter'
import { BuilderProfile } from './sections/BuilderProfile'
import { Services } from './sections/Services'
import { CaseStudies } from './sections/CaseStudies'
import { EidosDeepDive } from './sections/EidosDeepDive'
import { SelectedWork } from './sections/SelectedWork'
import { Pricing } from './sections/Pricing'
import { Process } from './sections/Process'
import { FinalCTA } from './sections/FinalCTA'
import { emitSceneSection } from './three/utils/pointerState'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealTargets = gsap.utils.toArray<HTMLElement>('[data-reveal]')

    if (!reduceMotion) {
      revealTargets.forEach((target) => {
        gsap.fromTo(
          target,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: target,
              start: 'top 86%',
              once: true,
            },
          },
        )
      })
    }

    const sceneSections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target instanceof HTMLElement) {
          emitSceneSection(visible.target.dataset.scene ?? visible.target.id)
        }
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: [0.2, 0.45, 0.7] },
    )

    sceneSections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
      <WebGLCanvas />
      <Header />
      <main>
        <Hero />
        <CapabilitiesCommandCenter />
        <BuilderProfile />
        <Services />
        <CaseStudies />
        <EidosDeepDive />
        <SelectedWork />
        <Pricing />
        <Process />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
