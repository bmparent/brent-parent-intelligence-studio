import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, ShaderMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import signalVertex from './shaders/signalVertex.glsl?raw'
import signalFragment from './shaders/signalFragment.glsl?raw'

type SignalFieldProps = {
  count: number
  scroll: number
  focus: number
}

function seeded(index: number, salt: number) {
  return (Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123) % 1
}

function unitSeed(index: number, salt: number) {
  return Math.abs(seeded(index, salt))
}

export function SignalField({ count, scroll, focus }: SignalFieldProps) {
  const material = useRef<ShaderMaterial>(null)
  const { positions, seeds } = useMemo(() => {
    const nextPositions = new Float32Array(count * 3)
    const nextSeeds = new Float32Array(count)

    for (let index = 0; index < count; index += 1) {
      const seed = index / count
      const radius = 2.2 + unitSeed(index, 0.2) * 6.5
      const theta = unitSeed(index, 0.4) * Math.PI * 2
      const phi = Math.acos(2 * unitSeed(index, 0.6) - 1)
      nextPositions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius
      nextPositions[index * 3 + 1] = (unitSeed(index, 0.8) - 0.5) * 5.4
      nextPositions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius - 1.5
      nextSeeds[index] = seed + unitSeed(index, 1.1) * 0.02
    }

    return { positions: nextPositions, seeds: nextSeeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uFocus: { value: 0 },
      uPointer: { value: [0, 0] },
      uColorA: { value: new Color('#65f3ff') },
      uColorB: { value: new Color('#9f8cff') },
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = clock.elapsedTime
    material.current.uniforms.uScroll.value += (scroll - material.current.uniforms.uScroll.value) * 0.045
    material.current.uniforms.uFocus.value += (focus - material.current.uniforms.uFocus.value) * 0.08
    material.current.uniforms.uPointer.value = [pointer.x, pointer.y]
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={signalVertex}
        fragmentShader={signalFragment}
        uniforms={uniforms}
      />
    </points>
  )
}
