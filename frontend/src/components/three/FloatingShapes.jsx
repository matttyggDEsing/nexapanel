import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SHAPES = [
  { pos: [-4.2, 1.4, -3], scale: 0.55, speed: 0.4, color: '#34D399' },
  { pos: [4.6, -1.1, -2.4], scale: 0.5, speed: 0.32, color: '#10B981' },
  { pos: [-3.4, -2.4, -4.5], scale: 0.4, speed: 0.5, color: '#6EE7B7' },
  { pos: [5.2, 2.1, -5], scale: 0.35, speed: 0.28, color: '#34D399' },
]

const FACET = [
  { pos: [0, 0.5, 0], scale: [0.35, 0.9, 0.25], rot: 0.15 },
  { pos: [0, 0, 0], scale: [0.3, 0.8, 0.25], rot: 0 },
  { pos: [0, -0.5, 0], scale: [0.35, 0.9, 0.25], rot: -0.15 },
]

function NexaFacet({ color }) {
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.x = t * 0.3
      ref.current.rotation.y = t * 0.4
    }
  })

  return (
    <group ref={ref}>
      {FACET.map((f, i) => (
        <mesh key={i} position={f.pos} rotation={[0, 0, f.rot]}>
          <boxGeometry args={f.scale} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export default function FloatingShapes() {
  return (
    <group>
      {SHAPES.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          scale={s.scale}
        >
          <boxGeometry args={[0.6, 1.4, 0.35]} />
          <meshBasicMaterial color={s.color} wireframe transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  )
}
