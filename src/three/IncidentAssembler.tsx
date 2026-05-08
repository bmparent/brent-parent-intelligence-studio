import { useMemo, useRef } from 'react'
import { AdditiveBlending, Group, Vector3 } from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

type IncidentAssemblerProps = {
  focus: number
  section: string
}

function fragmentSeed(index: number, salt: number) {
  return Math.abs((Math.sin(index * 91.7 + salt * 43.3) * 10000) % 1)
}

export function IncidentAssembler({ focus, section }: IncidentAssemblerProps) {
  const group = useRef<Group>(null)
  const shouldRender = section === 'eidos' || section === 'case-studies' || focus > 0.4
  const fragments = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        start: new Vector3(
          (fragmentSeed(index, 0.2) - 0.5) * 4,
          (fragmentSeed(index, 0.5) - 0.5) * 2.4,
          (fragmentSeed(index, 0.8) - 0.5) * 1.8,
        ),
        end: new Vector3(-0.72 + (index % 4) * 0.48, 0.46 - Math.floor(index / 4) * 0.28, 0),
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const active = shouldRender ? 1 : 0
    group.current.visible = shouldRender
    group.current.position.x = 1.7 + Math.sin(clock.elapsedTime * 0.4) * 0.08
    group.current.position.y = -0.25
    group.current.rotation.y = -0.18 + Math.sin(clock.elapsedTime * 0.24) * 0.08
    group.current.scale.setScalar(0.7 + active * 0.18 + focus * 0.05)
  })

  if (!shouldRender) return null

  return (
    <group ref={group} position={[1.7, -0.25, 0.1]}>
      {fragments.map((fragment, index) => (
        <mesh key={index} position={fragment.end.clone().lerp(fragment.start, section === 'eidos' ? 0.04 : 0.55)}>
          <boxGeometry args={[0.32, 0.08, 0.012]} />
          <meshBasicMaterial
            color={index % 5 === 0 ? '#ffcc66' : '#65f3ff'}
            transparent
            opacity={0.24 + focus * 0.16}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
      <Html transform distanceFactor={7} position={[0, -0.38, 0.02]} className="incident-webgl-card">
        <strong>Potential Production Risk</strong>
        <span>Confidence 87% / review before invoice creation</span>
      </Html>
    </group>
  )
}
