import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { usePointerVars } from '../hooks/usePointerVars';
import { useReducedMotion } from '../hooks/useReducedMotion';

function EdgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!('IntersectionObserver' in window)) {
      const timer = globalThis.setTimeout(() => setVisible(true), 0);
      return () => globalThis.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '180px' }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!visible || reducedMotion || typeof window === 'undefined') return;
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
          { CreateLines }
        ] = await Promise.all([
          import('@babylonjs/core/Engines/engine'),
          import('@babylonjs/core/scene'),
          import('@babylonjs/core/Cameras/freeCamera'),
          import('@babylonjs/core/Maths/math.vector'),
          import('@babylonjs/core/Maths/math.color'),
          import('@babylonjs/core/Lights/hemisphericLight'),
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

        const camera = new FreeCamera('edge-camera', new Vector3(0, 0, -8), scene);
        camera.setTarget(Vector3.Zero());
        const orthographicCamera = camera as typeof camera & {
          mode: number;
          orthoLeft: number;
          orthoRight: number;
          orthoTop: number;
          orthoBottom: number;
        };
        orthographicCamera.mode = 1;

        const light = new HemisphericLight('edge-light', new Vector3(0, 1, -0.2), scene);
        light.intensity = 0.5;

        const gold = new Color3(0.88, 0.74, 0.48);
        const pearl = new Color3(1, 1, 1);

        const edgeLines = [
          CreateLines('edge-top', { points: [new Vector3(-1, 0.92, 0), new Vector3(1, 0.92, 0)] }, scene),
          CreateLines('edge-right', { points: [new Vector3(0.96, 0.9, 0), new Vector3(0.96, -0.9, 0)] }, scene),
          CreateLines('edge-bottom', { points: [new Vector3(1, -0.92, 0), new Vector3(-1, -0.92, 0)] }, scene),
          CreateLines('edge-left', { points: [new Vector3(-0.96, -0.9, 0), new Vector3(-0.96, 0.9, 0)] }, scene)
        ];

        edgeLines.forEach((line, index) => {
          line.color = index % 2 === 0 ? pearl : gold;
          line.alpha = index % 2 === 0 ? 0.18 : 0.24;
        });

        const updateCamera = () => {
          const width = Math.max(activeCanvas.clientWidth, 1);
          const height = Math.max(activeCanvas.clientHeight, 1);
          const aspect = width / height;
          orthographicCamera.orthoLeft = -aspect;
          orthographicCamera.orthoRight = aspect;
          orthographicCamera.orthoTop = 1;
          orthographicCamera.orthoBottom = -1;
          engine.resize();
        };

        updateCamera();

        scene.onBeforeRenderObservable.add(() => {
          const time = performance.now() * 0.001;
          edgeLines.forEach((line, index) => {
            line.alpha = 0.15 + Math.sin(time * 0.7 + index) * 0.035;
          });
        });

        engine.runRenderLoop(() => {
          if (!disposed) scene.render();
        });

        window.addEventListener('resize', updateCamera);
        cleanup = () => {
          window.removeEventListener('resize', updateCamera);
          scene.dispose();
          engine.dispose();
        };
      } catch {
        // The CSS glass treatment is the fallback. The canvas is decorative only.
      }
    }

    void start();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reducedMotion, visible]);

  if (reducedMotion) return null;

  return <canvas className="glass-card__edge-canvas" ref={canvasRef} aria-hidden="true" />;
}

type GlassPanelProps = PropsWithChildren<{
  className?: string;
  ariaLabel?: string;
}>;

export function GlassPanel({ children, className = '', ariaLabel }: GlassPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  usePointerVars(panelRef);

  return (
    <div className={`glass-card ${className}`.trim()} ref={panelRef} aria-label={ariaLabel}>
      <EdgeCanvas />
      {children}
    </div>
  );
}
