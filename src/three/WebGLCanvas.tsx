import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneController } from './SceneController'
import { getDeviceProfile, prefersReducedMotion, supportsWebGL } from './utils/performance'
import { sceneFocusEvent, sceneSectionEvent, type SceneFocusDetail } from './utils/pointerState'
import { useScrollProgress } from './utils/scrollState'

export function WebGLCanvas() {
  const [enabled] = useState(() => supportsWebGL() && !prefersReducedMotion())
  const [focus, setFocus] = useState(0)
  const [section, setSection] = useState('hero')
  const [paused, setPaused] = useState(document.visibilityState === 'hidden')
  const scroll = useScrollProgress()
  const profile = useMemo(() => getDeviceProfile(), [])
  const preserveDrawingBuffer = useMemo(
    () => new URLSearchParams(window.location.search).has('verifyCanvas'),
    [],
  )

  useEffect(() => {
    const handleFocus = (event: Event) => {
      const detail = (event as CustomEvent<SceneFocusDetail>).detail
      setFocus(detail?.intensity ?? 0)
    }

    const handleSection = (event: Event) => {
      setSection((event as CustomEvent<string>).detail || 'hero')
    }

    const handleVisibility = () => {
      setPaused(document.visibilityState === 'hidden')
    }

    window.addEventListener(sceneFocusEvent, handleFocus)
    window.addEventListener(sceneSectionEvent, handleSection)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener(sceneFocusEvent, handleFocus)
      window.removeEventListener(sceneSectionEvent, handleSection)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  if (!enabled) {
    return (
      <div
        className="webgl-fallback"
        aria-hidden="true"
        data-webgl-state={prefersReducedMotion() ? 'reduced-motion' : 'unavailable'}
      />
    )
  }

  return (
    <div className="webgl-shell" aria-hidden="true">
      <Canvas
        dpr={profile.dpr as [number, number]}
        frameloop={paused ? 'never' : 'always'}
        camera={{ position: [0, 0.25, 7.2], fov: 46, near: 0.1, far: 80 }}
        gl={{
          alpha: true,
          antialias: !profile.lowPower,
          preserveDrawingBuffer,
          powerPreference: profile.lowPower ? 'low-power' : 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneController
            particleCount={profile.particleCount}
            scroll={scroll}
            focus={focus}
            section={section}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
