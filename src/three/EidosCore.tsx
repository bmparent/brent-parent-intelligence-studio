import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, Group, ShaderMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import coreVertex from './shaders/coreVertex.glsl?raw'
import coreFragment from './shaders/coreFragment.glsl?raw'
import { MemoryRings } from './MemoryRings'

type EidosCoreProps = {
  scroll: number
  focus: number
  section: string
}

export function EidosCore({ scroll, focus, section }: EidosCoreProps) {
  const group = useRef<Group>(null)
  const material = useRef<ShaderMaterial>(null)
  const sectionPulse = section === 'eidos' || section === 'case-studies' ? 1 : 0

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uCoreColor: { value: new Color('#74d7ff') },
      uMemoryColor: { value: new Color('#9f8cff') },
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.11 + scroll * 1.5
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.12
      group.current.position.x += ((section === 'hero' ? 1.2 : 0.15) + pointer.x * 0.16 - group.current.position.x) * 0.04
      group.current.position.y += ((section === 'cta' ? -0.2 : 0.1) + pointer.y * 0.12 - group.current.position.y) * 0.04
    }

    if (material.current) {
      material.current.uniforms.uTime.value = clock.elapsedTime
      material.current.uniforms.uPulse.value += (focus * 0.8 + sectionPulse * 0.5 - material.current.uniforms.uPulse.value) * 0.06
    }
  })

  return (
    <group ref={group} position={[0.9, 0.15, -1.4]}>
      <mesh>
        <icosahedronGeometry args={[0.86, 12]} />
        <shaderMaterial
          ref={material}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
          uniforms={uniforms}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.08}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshBasicMaterial color="#65f3ff" wireframe transparent opacity={0.17 + focus * 0.08} />
      </mesh>
      <MemoryRings scroll={scroll} focus={focus} />
    </group>
  )
}
