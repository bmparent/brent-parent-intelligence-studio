import { useMemo, useRef } from 'react'
import { AdditiveBlending, Group, Vector3 } from 'three'
import { Line, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { clearSceneFocus, emitSceneFocus } from './utils/pointerState'

type NodeGraphProps = {
  scroll: number
  focus: number
  section: string
}

const graphNodes = [
  { id: 'storefronts', label: 'Storefronts', position: [-3.2, 1.4, 0.2], tone: '#7dffa7' },
  { id: 'orders', label: 'Orders', position: [-2.9, -0.6, -0.2], tone: '#ffcc66' },
  { id: 'documents', label: 'Docs/SOPs', position: [-2.1, 0.5, 1.2], tone: '#74d7ff' },
  { id: 'automation', label: 'Automation', position: [-0.6, 0.9, 0.1], tone: '#65f3ff' },
  { id: 'memory', label: 'Memory', position: [0.4, -0.6, 0.6], tone: '#9f8cff' },
  { id: 'forecasting', label: 'Forecasting', position: [1.4, 0.6, -0.2], tone: '#ffcc66' },
  { id: 'review', label: 'Human Review', position: [2.5, -0.7, 0.4], tone: '#f5f7fb' },
  { id: 'dashboards', label: 'Dashboards', position: [3.1, 1.1, -0.4], tone: '#7dffa7' },
]

const graphLinks = [
  ['storefronts', 'automation'],
  ['orders', 'automation'],
  ['documents', 'memory'],
  ['automation', 'memory'],
  ['memory', 'forecasting'],
  ['forecasting', 'review'],
  ['automation', 'dashboards'],
  ['review', 'dashboards'],
]

export function NodeGraph({ scroll, focus, section }: NodeGraphProps) {
  const group = useRef<Group>(null)
  const nodes = useMemo(
    () =>
      graphNodes.map((node) => ({
        ...node,
        vector: new Vector3(node.position[0], node.position[1], node.position[2]),
      })),
    [],
  )

  const links = useMemo(
    () =>
      graphLinks.map(([from, to]) => {
        const start = nodes.find((node) => node.id === from)?.vector ?? new Vector3()
        const end = nodes.find((node) => node.id === to)?.vector ?? new Vector3()
        return { from, to, points: [start, end] as [Vector3, Vector3] }
      }),
    [nodes],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const targetOpacity = section === 'capabilities' || section === 'services' || section === 'eidos' ? 1 : 0.42
    group.current.position.z += (-1.8 + scroll * 1.1 - group.current.position.z) * 0.04
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.14 + scroll * 0.42
    group.current.scale.setScalar(0.82 + targetOpacity * 0.12 + focus * 0.03)
  })

  return (
    <group ref={group} position={[0, 0, -1.8]}>
      {links.map((link) => (
        <Line
          key={`${link.from}-${link.to}`}
          points={link.points}
          color="#65f3ff"
          lineWidth={1}
          transparent
          opacity={0.18 + focus * 0.14}
          blending={AdditiveBlending}
        />
      ))}
      {nodes.map((node, index) => (
        <group key={node.id} position={node.vector}>
          <mesh
            onPointerOver={(event) => {
              event.stopPropagation()
              emitSceneFocus(node.id, 1)
            }}
            onPointerOut={clearSceneFocus}
          >
            <sphereGeometry args={[0.07 + index * 0.002, 16, 16]} />
            <meshBasicMaterial color={node.tone} transparent opacity={0.78} blending={AdditiveBlending} />
          </mesh>
          {section === 'capabilities' || section === 'services' || section === 'eidos' ? (
            <Html distanceFactor={8} className="webgl-label" center>
              {node.label}
            </Html>
          ) : null}
        </group>
      ))}
    </group>
  )
}
