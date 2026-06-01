import { useEffect, useMemo, useRef, useState } from 'react'
import { createBabylonEngine } from './engineSupport'
import { createGlassStudioScene, type GlassStudioSceneState } from './createGlassStudioScene'
import { getDeviceProfile, prefersReducedMotion, supportsBabylonScene } from './utils/performance'
import { sceneFocusEvent, sceneSectionEvent, type SceneFocusDetail } from './utils/pointerState'
import { useScrollProgress } from './utils/scrollState'

export function BabylonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GlassStudioSceneState>({ scroll: 0, focus: 0, section: 'hero' })
  const [enabled] = useState(() => supportsBabylonScene() && !prefersReducedMotion())
  const [focus, setFocus] = useState(0)
  const [section, setSection] = useState('hero')
  const [engineMode, setEngineMode] = useState<'webgpu' | 'webgl' | 'fallback'>('fallback')
  const scroll = useScrollProgress()
  const profile = useMemo(() => getDeviceProfile(), [])
  const preserveDrawingBuffer = useMemo(
    () => new URLSearchParams(window.location.search).has('verifyCanvas'),
    [],
  )

  useEffect(() => {
    stateRef.current.scroll = scroll
  }, [scroll])

  useEffect(() => {
    stateRef.current.focus = focus
  }, [focus])

  useEffect(() => {
    stateRef.current.section = section
  }, [section])

  useEffect(() => {
    const handleFocus = (event: Event) => {
      const detail = (event as CustomEvent<SceneFocusDetail>).detail
      setFocus(detail?.intensity ?? 0)
    }

    const handleSection = (event: Event) => {
      setSection((event as CustomEvent<string>).detail || 'hero')
    }

    window.addEventListener(sceneFocusEvent, handleFocus)
    window.addEventListener(sceneSectionEvent, handleSection)

    return () => {
      window.removeEventListener(sceneFocusEvent, handleFocus)
      window.removeEventListener(sceneSectionEvent, handleSection)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !canvasRef.current) return undefined

    let disposed = false
    let cleanup = () => {}

    const setup = async () => {
      const { engine, mode } = await createBabylonEngine(canvasRef.current!, profile, preserveDrawingBuffer)
      if (disposed) {
        engine.dispose()
        return
      }

      setEngineMode(mode)
      const controller = createGlassStudioScene(engine, canvasRef.current!, profile)
      const render = () => {
        controller.update(stateRef.current)
        controller.scene.render()
      }
      engine.runRenderLoop(render)

      const handleResize = () => controller.resize()
      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          engine.stopRenderLoop(render)
        } else {
          engine.runRenderLoop(render)
        }
      }

      window.addEventListener('resize', handleResize)
      document.addEventListener('visibilitychange', handleVisibility)

      cleanup = () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('visibilitychange', handleVisibility)
        engine.stopRenderLoop(render)
        controller.dispose()
      }
    }

    void setup()

    return () => {
      disposed = true
      cleanup()
    }
  }, [enabled, preserveDrawingBuffer, profile])

  if (!enabled) {
    return (
      <div
        className="babylon-fallback"
        aria-hidden="true"
        data-engine-state={prefersReducedMotion() ? 'reduced-motion' : 'unavailable'}
      />
    )
  }

  return (
    <div className="babylon-shell" aria-hidden="true" data-engine={engineMode}>
      <canvas ref={canvasRef} />
    </div>
  )
}
