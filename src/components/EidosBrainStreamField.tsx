import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type StreamPoint = {
  x: number;
  y: number;
  z: number;
  phase: number;
};

function seedPoints() {
  const points: StreamPoint[] = [];
  let seed = 77;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let index = 0; index < 34; index += 1) {
    points.push({
      x: -4.8 + (index % 10) * 1.08 + (random() - 0.5) * 0.24,
      y: -1.8 + Math.floor(index / 10) * 1.12 + (random() - 0.5) * 0.28,
      z: (random() - 0.5) * 1.2,
      phase: random() * Math.PI * 2
    });
  }

  return points;
}

export function EidosBrainStreamField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        const camera = new FreeCamera('eidos-stream-camera', new Vector3(0, 0, -8), scene);
        camera.setTarget(Vector3.Zero());
        camera.fov = 0.62;

        const light = new HemisphericLight('eidos-stream-light', new Vector3(0.2, 1, -0.2), scene);
        light.intensity = 0.74;

        const nodeMaterial = new StandardMaterial('stream-node', scene);
        nodeMaterial.diffuseColor = new Color3(0.82, 0.9, 1);
        nodeMaterial.emissiveColor = new Color3(0.08, 0.16, 0.22);
        nodeMaterial.alpha = 0.54;

        const anomalyMaterial = new StandardMaterial('stream-anomaly', scene);
        anomalyMaterial.diffuseColor = new Color3(0.95, 0.78, 0.48);
        anomalyMaterial.emissiveColor = new Color3(0.58, 0.34, 0.08);
        anomalyMaterial.alpha = 0.82;

        const points = seedPoints();
        const nodes = points.map((point, index) => {
          const sphere = CreateSphere(`stream-node-${index}`, { diameter: index === 24 ? 0.12 : 0.045, segments: 8 }, scene);
          sphere.position.set(point.x, point.y, point.z);
          sphere.material = index === 24 ? anomalyMaterial : nodeMaterial;
          return sphere;
        });

        for (let index = 0; index < points.length - 1; index += 1) {
          if (index % 10 === 9) continue;
          const line = CreateLines(
            `stream-link-${index}`,
            {
              points: [
                new Vector3(points[index].x, points[index].y, points[index].z),
                new Vector3(points[index + 1].x, points[index + 1].y, points[index + 1].z)
              ]
            },
            scene
          );
          line.color = index % 7 === 0 ? new Color3(0.88, 0.66, 0.38) : new Color3(0.54, 0.72, 0.86);
          line.alpha = index % 7 === 0 ? 0.26 : 0.14;
        }

        const pointer = { x: 0, y: 0 };
        const handlePointerMove = (event: PointerEvent) => {
          const rect = activeCanvas.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        scene.onBeforeRenderObservable.add(() => {
          const time = performance.now() * 0.001;
          camera.position.x += (pointer.x * 0.24 - camera.position.x) * 0.03;
          camera.position.y += (-pointer.y * 0.12 - camera.position.y) * 0.03;
          camera.setTarget(new Vector3(pointer.x * 0.08, -pointer.y * 0.05, 0));

          nodes.forEach((node, index) => {
            const point = points[index];
            const anomaly = index === 24;
            const pulse = anomaly ? 1 + Math.max(0, Math.sin(time * 1.35)) * 1.4 : 1;
            node.scaling.setAll(pulse);
            node.position.y = point.y + Math.sin(time * 0.45 + point.phase) * 0.08;
          });
        });

        engine.runRenderLoop(() => {
          if (!disposed) scene.render();
        });

        const handleResize = () => engine.resize();
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('pointermove', handlePointerMove);
          scene.dispose();
          engine.dispose();
        };
      } catch {
        // Eidos Brain content remains fully readable without WebGL.
      }
    }

    void start();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reducedMotion, visible]);

  if (reducedMotion) return null;

  return <canvas className="eidos-stream-field" ref={canvasRef} aria-hidden="true" />;
}
