import { useEffect, useRef } from 'react';

/** Independent particles wrap continuously. Nothing restarts on a shared timer. */
export function JingleMotion({
  paused,
  fireworks = false,
}: {
  paused: boolean;
  fireworks?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      visible = false,
      last = 0,
      nextBurst = 1;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const flakes = Array.from({ length: fireworks ? 85 : 27 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.5,
      speed: 0.025 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    }));
    let sparks: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      hue: number;
    }[] = [];
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    });
    function draw(dt: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        f.y = (f.y + f.speed * dt) % 1;
        f.x = (f.x + Math.sin(f.phase + f.y * 7) * dt * 0.012 + 1) % 1;
        ctx.fillStyle = `rgba(240,250,255,${0.32 + f.r / 4})`;
        ctx.beginPath();
        ctx.arc(f.x * width, f.y * height, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!fireworks || !dt) return;
      nextBurst -= dt;
      if (nextBurst <= 0 && sparks.length < 180) {
        const x = width * (0.45 + Math.random() * 0.5),
          y = height * (0.08 + Math.random() * 0.32),
          hue = [35, 165, 345][Math.floor(Math.random() * 3)];
        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2,
            speed = 25 + Math.random() * 65;
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.1 + Math.random() * 0.7,
            hue,
          });
        }
        nextBurst = 1.5 + Math.random() * 2.8;
      }
      sparks = sparks.filter((p) => p.life > 0);
      for (const p of sparks) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 19 * dt;
        ctx.fillStyle = `hsla(${p.hue},95%,78%,${Math.max(0, Math.min(1, p.life))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tick = (time: number) => {
      draw(Math.min((time - (last || time)) / 1000, 0.05));
      last = time;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!paused && !reduce.matches && visible && !document.hidden)
        frame = requestAnimationFrame(tick);
      else draw(0);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    resize.observe(canvas);
    reduce.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      reduce.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [paused, fireworks]);
  return <canvas ref={ref} className="jbjb-demo-canvas" aria-hidden="true" />;
}
