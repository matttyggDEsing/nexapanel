import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLOCKS = [
  { color: '#10B981', emissive: '#34D399', pos: [-0.9, 0, 0], scale: [0.5, 1.6, 0.5], rot: [0, 0, 0.15] },
  { color: '#10B981', emissive: '#10B981', pos: [0, 0, 0], scale: [0.45, 1.4, 0.45], rot: [0, 0, 0] },
  { color: '#059669', emissive: '#059669', pos: [0.9, 0, 0], scale: [0.5, 1.6, 0.5], rot: [0, 0, -0.15] },
]

export default function CoreOrb() {
  const groupRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1
      groupRef.current.rotation.y = t * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      {BLOCKS.map((b, i) => (
        <group key={i} position={b.pos} rotation={b.rot}>
          <mesh>
            <boxGeometry args={b.scale} />
            <meshPhysicalMaterial
              color={b.color}
              emissive={b.emissive}
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.25}
              clearcoat={0.3}
              clearcoatRoughness={0.4}
            />
          </mesh>
          <mesh scale={[0.98, 0.98, 0.98]}>
            <boxGeometry args={b.scale} />
            <meshBasicMaterial
              color={b.emissive}
              transparent
              opacity={0.08}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <mesh scale={1.8}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#34D399" transparent opacity={0.08} toneMapped={false} />
      </mesh>
    </group>
  )
}