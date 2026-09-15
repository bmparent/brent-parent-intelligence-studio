import { useEffect, useRef } from 'react';
import { mountHero } from '../lib/hero/renderer';
import { HERO } from '../lib/hero/scene';

export function LivingHero() {
  const scene = useRef<HTMLDivElement>(null);
  const pause = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const canvas = scene.current?.querySelector('canvas');
    const photo = scene.current?.querySelector('img');
    if (canvas && photo && pause.current) return mountHero(canvas, photo, pause.current);
  }, []);
  return <>
    <div className="ew-hero-scene" ref={scene} aria-hidden="true" data-motion-amount={HERO.motion} data-water={HERO.water} data-light={HERO.light}>
      <img src="/images/eidos-glass-hero.webp" crossOrigin="anonymous" alt="" width={HERO.width} height={HERO.height} fetchPriority="high" />
      <canvas />
    </div>
    <button ref={pause} className="ew-hero-pause" type="button" hidden>Pause motion</button>
  </>;
}
