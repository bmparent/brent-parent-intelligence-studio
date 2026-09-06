import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
};
type Rocket = { x: number; y: number; target: number; color: string };

/** Decorative only. One bounded animation loop, suspended outside the viewport. */
export function StorefrontFireworks({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      clock = 0,
      sequence = 0;
    let inView = false;
    let sparks: Spark[] = [];
    let rockets: Rocket[] = [];
    const colors = ["#f7dca5", "#b9e9ff", "#e5c7ff", "#94d7ff"];
    function burst(x: number, y: number, color: string) {
      const radius = Math.min(width * 0.19, 175);
      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const speed = radius * (0.5 + (i % 3) * 0.22);
        const life = 1.65 + (i % 5) * 0.15;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          max: life,
          color,
        });
      }
      sparks = sparks.slice(-320);
    }
    function resize() {
      if (!el || !ctx) return;
      const rect = el.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sparks = [];
      rockets = [];
      clock = 0;
    }
    function draw(time: number) {
      if (!ctx || !el) return;
      const dt = previous ? Math.min((time - previous) / 1000, 0.04) : 0.016;
      previous = time;
      clock -= dt;
      ctx.clearRect(0, 0, width, height);
      if (clock <= 0 && width > 0) {
        const x = width * [0.19, 0.81, 0.36, 0.67][sequence % 4];
        const color = colors[sequence % colors.length];
        const target = height * (sequence % 2 ? 0.25 : 0.18);
        if (sequence === 0) burst(x, target, color);
        rockets.push({ x, y: height * 0.85, target, color });
        sequence++;
        clock = 0.95;
      }
      ctx.lineCap = "round";
      for (const rocket of rockets) {
        rocket.y -= height * 0.68 * dt;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = rocket.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y + 28);
        ctx.lineTo(rocket.x, rocket.y);
        ctx.stroke();
        if (rocket.y <= rocket.target)
          burst(rocket.x, rocket.target, rocket.color);
      }
      rockets = rockets.filter((r) => r.y > r.target);
      for (const spark of sparks) {
        spark.life -= dt;
        const oldX = spark.x,
          oldY = spark.y;
        spark.vx *= Math.exp(-0.65 * dt);
        spark.vy = spark.vy * Math.exp(-0.65 * dt) + 30 * dt;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        ctx.globalAlpha = Math.max(
          0,
          Math.min(1, (spark.life / spark.max) * 1.35),
        );
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(oldX - spark.vx * 0.09, oldY - spark.vy * 0.09);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
      }
      sparks = sparks.filter((s) => s.life > 0);
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }
    function sync() {
      cancelAnimationFrame(frame);
      previous = 0;
      const running = !paused && !reduced.matches && !document.hidden && inView;
      el!.dataset.motion = running ? "running" : "paused";
      if (running) frame = requestAnimationFrame(draw);
      if (reduced.matches) ctx!.clearRect(0, 0, width, height);
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    const resizer = new ResizeObserver(resize);
    resize();
    observer.observe(el);
    resizer.observe(el);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);
  return <canvas ref={canvas} className="sd-fireworks" aria-hidden="true" />;
}
