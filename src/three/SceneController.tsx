import { useMemo } from 'react'
import { Color, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { SignalField } from './SignalField'
import { EidosCore } from './EidosCore'
import { NodeGraph } from './NodeGraph'
import { RibbonStreams } from './RibbonStreams'
import { ForecastWaves } from './ForecastWaves'
import { IncidentAssembler } from './IncidentAssembler'

type SceneControllerProps = {
  particleCount: number
  scroll: number
  focus: number
  section: string
}

export function SceneController({ particleCount, scroll, focus, section }: SceneControllerProps) {
  const target = useMemo(() => new Vector3(0, 0, -1), [])
  const clearColor = useMemo(() => new Color('#05070d'), [])

  useFrame(({ camera, gl, clock }) => {
    gl.setClearColor(clearColor, 0)
    const cameraRail = new Vector3(
      Math.sin(scroll * Math.PI * 1.4) * 1.3,
      0.25 + Math.sin(scroll * Math.PI * 2.2) * 0.46,
      7.2 - scroll * 2.15 + Math.sin(clock.elapsedTime * 0.12) * 0.2,
    )

    if (section === 'eidos') {
      cameraRail.set(0.55, 0.45, 4.6)
      target.set(0.4, 0, -1.1)
    } else if (section === 'pricing') {
      cameraRail.set(-1.2, 0.15, 5.3)
      target.set(0.2, -0.2, -0.9)
    } else if (section === 'cta') {
      cameraRail.set(0, 0.2, 6.1)
      target.set(0, 0, -1.5)
    } else {
      target.set(0.15, 0, -1.2)
    }

    camera.position.lerp(cameraRail, 0.035)
    camera.lookAt(target)
  })

  return (
    <>
      <fog attach="fog" args={['#05070d', 5, 15]} />
      <SignalField count={particleCount} scroll={scroll} focus={focus} />
      <RibbonStreams scroll={scroll} focus={focus} />
      <NodeGraph scroll={scroll} focus={focus} section={section} />
      <EidosCore scroll={scroll} focus={focus} section={section} />
      <ForecastWaves scroll={scroll} section={section} />
      <IncidentAssembler focus={focus} section={section} />
    </>
  )
}
