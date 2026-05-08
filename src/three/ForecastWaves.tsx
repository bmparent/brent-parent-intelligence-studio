import { useMemo, useRef } from 'react'
import { AdditiveBlending, Group, Vector3 } from 'three'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

type ForecastWavesProps = {
  scroll: number
  section: string
}

export function ForecastWaves({ scroll, section }: ForecastWavesProps) {
  const group = useRef<Group>(null)
  const waves = useMemo(
    () =>
      Array.from({ length: 4 }, (_, band) =>
        Array.from({ length: 80 }, (_, index) => {
          const x = -3.6 + index * 0.092
          const y = Math.sin(index * 0.22 + band * 0.8) * (0.18 + band * 0.035) - 1.2 + band * 0.18
          const z = -0.6 - band * 0.18
          return new Vector3(x, y, z)
        }),
      ),
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const visible = section === 'eidos' || section === 'pricing' || section === 'process' ? 1 : 0.18
    group.current.position.y += (-1.0 + scroll * 1.4 - group.current.position.y) * 0.045
    group.current.position.x = Math.sin(clock.elapsedTime * 0.18) * 0.08
    group.current.scale.setScalar(0.8 + visible * 0.22)
  })

  return (
    <group ref={group} position={[0, -1, -0.6]}>
      {waves.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={index % 2 === 0 ? '#ffcc66' : '#74d7ff'}
          lineWidth={1}
          transparent
          opacity={0.16 + index * 0.035}
          blending={AdditiveBlending}
        />
      ))}
    </group>
  )
}
