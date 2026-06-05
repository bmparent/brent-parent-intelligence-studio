import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    document.documentElement.classList.add('js')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = gsap.utils.toArray<HTMLElement>('[data-reveal]')

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    const tweens = elements.map((element) =>
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          ease: 'power3.out',
          delay: Number.parseFloat(element.dataset.delay ?? '0') || 0,
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        },
      ),
    )

    return () => {
      tweens.forEach((tween) => tween.kill())
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])
}
