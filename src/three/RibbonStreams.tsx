import { useMemo, useRef } from 'react'
import { AdditiveBlending, CatmullRomCurve3, Color, ShaderMaterial, TubeGeometry, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import ribbonVertex from './shaders/ribbonVertex.glsl?raw'
import ribbonFragment from './shaders/ribbonFragment.glsl?raw'

type RibbonStreamsProps = {
  scroll: number
  focus: number
}

export function RibbonStreams({ scroll, focus }: RibbonStreamsProps) {
  const materials = useRef<ShaderMaterial[]>([])
  const ribbons = useMemo(() => {
    const palette = ['#65f3ff', '#9f8cff', '#ffcc66', '#7dffa7']
    return palette.map((color, index) => {
      const offset = index - 1.5
      const curve = new CatmullRomCurve3([
        new Vector3(-5.4, -1.5 + offset * 0.5, -2.6 + index * 0.25),
        new Vector3(-2.2, 1.3 - offset * 0.28, -0.9),
        new Vector3(0.2, offset * 0.34, 0.5),
        new Vector3(2.5, -0.9 + offset * 0.2, -0.2),
        new Vector3(5.2, 1.2 - offset * 0.35, -2.2),
      ])
      return {
        color,
        geometry: new TubeGeometry(curve, 180, 0.012 + index * 0.004, 6, false),
        rotation: [0, index * 0.18, 0] as [number, number, number],
      }
    })
  }, [])

  useFrame(({ clock }) => {
    materials.current.forEach((material, index) => {
      material.uniforms.uTime.value = clock.elapsedTime + index * 0.7
      material.uniforms.uFlow.value = 0.7 + scroll + focus * 0.8
      material.uniforms.uOpacity.value = 0.18 + scroll * 0.12 + focus * 0.18
    })
  })

  return (
    <group position={[0, 0, -1.2]}>
      {ribbons.map((ribbon, index) => (
        <mesh key={ribbon.color} geometry={ribbon.geometry} rotation={ribbon.rotation}>
          <shaderMaterial
            ref={(material) => {
              if (material) materials.current[index] = material
            }}
            vertexShader={ribbonVertex}
            fragmentShader={ribbonFragment}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            uniforms={{
              uTime: { value: 0 },
              uFlow: { value: 1 },
              uOpacity: { value: 0.2 },
              uColor: { value: new Color(ribbon.color) },
            }}
          />
        </mesh>
      ))}
    </group>
  )
}
