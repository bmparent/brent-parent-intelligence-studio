import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, Group } from 'three'
import { useFrame } from '@react-three/fiber'

type MemoryRingsProps = {
  scroll: number
  focus: number
}

export function MemoryRings({ scroll, focus }: MemoryRingsProps) {
  const group = useRef<Group>(null)
  const rings = useMemo(
    () => [
      { radius: 1.45, color: '#9f8cff', speed: 0.28 },
      { radius: 1.82, color: '#74d7ff', speed: -0.22 },
      { radius: 2.16, color: '#7dffa7', speed: 0.18 },
    ],
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 0.08 + scroll * 0.8
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.16
  })

  return (
    <group ref={group}>
      {rings.map((ring, index) => (
        <mesh key={ring.radius} rotation={[Math.PI / 2 + index * 0.38, index * 0.28, 0]}>
          <torusGeometry args={[ring.radius + focus * 0.06, 0.012 + index * 0.004, 10, 160]} />
          <meshBasicMaterial
            color={new Color(ring.color)}
            transparent
            opacity={0.24 + focus * 0.12}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
