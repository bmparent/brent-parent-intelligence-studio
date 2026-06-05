import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type NodePoint = {
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
};

const seedPositions = (): NodePoint[] => {
  const points: NodePoint[] = [];
  let seed = 42;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let index = 0; index < 42; index += 1) {
    points.push({
      x: (random() - 0.5) * 10.5,
      y: (random() - 0.5) * 5.8,
      z: (random() - 0.5) * 4.8,
      speed: 0.18 + random() * 0.28,
      phase: random() * Math.PI * 2
    });
  }

  return points;
};

export function IntelligenceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldStart, setShouldStart] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let visible = (() => {
      const rect = canvas.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    })();
    let started = false;
    let fallbackTimer = 0;
    let startTimer = 0;

    const begin = () => {
      if (started || !visible) return;
      started = true;
      startTimer = window.setTimeout(() => setShouldStart(true), 300);
    };

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([entry]) => {
              visible = Boolean(entry?.isIntersecting);
            },
            { rootMargin: '120px' }
          )
        : null;

    observer?.observe(canvas);

    const events: Array<keyof WindowEventMap> = ['pointermove', 'scroll', 'touchstart', 'keydown'];
    events.forEach((eventName) => window.addEventListener(eventName, begin, { once: true, passive: true }));
    fallbackTimer = window.setTimeout(begin, 12000);

    return () => {
      observer?.disconnect();
      events.forEach((eventName) => window.removeEventListener(eventName, begin));
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(startTimer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!shouldStart || reducedMotion || typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeCanvas = canvas;

    let disposed = false;
    let cleanup = () => undefined as void;

    async function start() {
      try {
        const [
          { Engine },
          { Scene },
          { FreeCamera },
          { Vector3 },
          { Color3, Color4 },
          { HemisphericLight },
          { StandardMaterial },
          { CreateSphere },
          { CreateLines }
        ] = await Promise.all([
          import('@babylonjs/core/Engines/engine'),
          import('@babylonjs/core/scene'),
          import('@babylonjs/core/Cameras/freeCamera'),
          import('@babylonjs/core/Maths/math.vector'),
          import('@babylonjs/core/Maths/math.color'),
          import('@babylonjs/core/Lights/hemisphericLight'),
          import('@babylonjs/core/Materials/standardMaterial'),
          import('@babylonjs/core/Meshes/Builders/sphereBuilder'),
          import('@babylonjs/core/Meshes/Builders/linesBuilder')
        ]);
        const engine = new Engine(activeCanvas, true, {
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false,
          stencil: false
        });
        engine.setHardwareScalingLevel(Math.max(1, Math.min(window.devicePixelRatio || 1, 2)));

        const scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 0);
        scene.autoClear = true;

        const camera = new FreeCamera('studio-camera', new Vector3(0, 0.2, -9), scene);
        camera.setTarget(new Vector3(0, 0, 0));
        camera.fov = 0.72;
        camera.minZ = 0.1;
        camera.maxZ = 80;

        const light = new HemisphericLight('studio-light', new Vector3(0.2, 1, -0.3), scene);
        light.intensity = 0.86;

        const gold = new StandardMaterial('node-gold', scene);
        gold.diffuseColor = new Color3(0.94, 0.78, 0.45);
        gold.emissiveColor = new Color3(0.36, 0.24, 0.08);
        gold.alpha = 0.72;

        const ice = new StandardMaterial('node-ice', scene);
        ice.diffuseColor = new Color3(0.45, 0.85, 1);
        ice.emissiveColor = new Color3(0.08, 0.24, 0.32);
        ice.alpha = 0.46;

        const pulseMaterial = new StandardMaterial('pulse', scene);
        pulseMaterial.diffuseColor = new Color3(0.98, 0.94, 0.78);
        pulseMaterial.emissiveColor = new Color3(0.74, 0.5, 0.18);
        pulseMaterial.alpha = 0.82;

        const positions = seedPositions();
        const meshes = positions.map((point, index) => {
          const sphere = CreateSphere(
            `signal-node-${index}`,
            { diameter: index % 6 === 0 ? 0.055 : 0.034, segments: 8 },
            scene
          );
          sphere.position.set(point.x, point.y, point.z);
          sphere.material = index % 5 === 0 ? gold : ice;
          return sphere;
        });

        const edges: Array<[number, number]> = [];
        for (let index = 0; index < positions.length - 1; index += 1) {
          if (index % 2 === 0) edges.push([index, index + 1]);
          if (index % 7 === 0 && index + 8 < positions.length) edges.push([index, index + 8]);
        }

        edges.forEach(([a, b], index) => {
          const line = CreateLines(
            `signal-link-${index}`,
            {
              points: [
                new Vector3(positions[a].x, positions[a].y, positions[a].z),
                new Vector3(positions[b].x, positions[b].y, positions[b].z)
              ]
            },
            scene
          );
          line.color = index % 3 === 0 ? new Color3(0.94, 0.72, 0.38) : new Color3(0.42, 0.78, 0.94);
          line.alpha = index % 3 === 0 ? 0.21 : 0.16;
        });

        const pulses = edges.slice(0, 9).map(([a, b], index) => {
          const pulse = CreateSphere(`signal-pulse-${index}`, { diameter: 0.042, segments: 8 }, scene);
          pulse.material = pulseMaterial;
          return { pulse, a, b, offset: index / 9 };
        });

        const pointer = { x: 0, y: 0 };
        const handlePointerMove = (event: PointerEvent) => {
          const rect = activeCanvas.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        let running = true;
        const handleVisibility = () => {
          running = document.visibilityState !== 'hidden';
        };
        document.addEventListener('visibilitychange', handleVisibility);

        scene.onBeforeRenderObservable.add(() => {
          const time = performance.now() * 0.001;
          camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.025;
          camera.position.y += (-pointer.y * 0.18 + 0.16 - camera.position.y) * 0.025;
          camera.setTarget(new Vector3(pointer.x * 0.12, -pointer.y * 0.08, 0));

          meshes.forEach((mesh, index) => {
            const source = positions[index];
            mesh.position.y = source.y + Math.sin(time * source.speed + source.phase) * 0.13;
            mesh.position.x = source.x + Math.cos(time * source.speed * 0.8 + source.phase) * 0.055;
          });

          pulses.forEach(({ pulse, a, b, offset }, index) => {
            const progress = (time * (0.055 + index * 0.004) + offset) % 1;
            const start = positions[a];
            const end = positions[b];
            pulse.position.set(
              start.x + (end.x - start.x) * progress,
              start.y + (end.y - start.y) * progress + Math.sin(time + index) * 0.04,
              start.z + (end.z - start.z) * progress
            );
          });
        });

        engine.runRenderLoop(() => {
          if (running && !disposed) scene.render();
        });

        const handleResize = () => engine.resize();
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('visibilitychange', handleVisibility);
          scene.dispose();
          engine.dispose();
        };
      } catch {
        // WebGL is progressive enhancement only. The HTML/CSS portfolio remains fully usable.
      }
    }

    void start();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reducedMotion, shouldStart]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="intelligence-canvas" aria-hidden="true" />;
}
