import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLOCKS = [
  { color: '#10B981', emissive: '#34D399', pos: [-0.9, 0, 0], scale: [0.5, 1.6, 0.5], rot: [0, 0, 0.15] },
  { color: '#10B981', emissive: '#10B981', pos: [0, 0, 0], scale: [0.45, 1.4, 0.45], rot: [0, 0, 0] },
  { color: '#059669', emissive: '#059669', pos: [0.9, 0, 0], scale: [0.5, 1.6, 0.5], rot: [0, 0, -0.15] },
]

function BlockFace({ block }) {
  const edgeRef = useRef()

  useFrame((state) => {
    if (edgeRef.current) {
      edgeRef.current.material.opacity = 0.3 + Math.sin(state.clock.getElapsedTime() * 1.2 + block.pos[0]) * 0.15
    }
  })

  return (
    <group position={block.pos} rotation={block.rot}>
      <mesh>
        <boxGeometry args={block.scale} />
        <meshPhysicalMaterial
          color={block.color}
          emissive={block.emissive}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
        />
      </mesh>
      <mesh scale={[0.98, 0.98, 0.98]}>
        <boxGeometry args={block.scale} />
        <meshBasicMaterial
          color={block.emissive}
          transparent
          opacity={0.1}
          toneMapped={false}
        />
      </mesh>
      <lineSegments ref={edgeRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(...block.scale)]} />
        <lineBasicMaterial color="#34D399" transparent opacity={0.35} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

export default function CoreOrb() {
  const groupRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1
      groupRef.current.rotation.y = t * 0.12
    }
    if (glowRef.current) {
      const pulse = 0.06 + Math.sin(t * 0.5) * 0.03
      glowRef.current.scale.setScalar(1.8 + pulse)
    }
  })

  const ringPoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const r = 1.1
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
    }
    return pts
  }, [])

  return (
    <group ref={groupRef}>
      {BLOCKS.map((b, i) => (
        <BlockFace key={i} block={b} />
      ))}

      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#34D399" transparent opacity={0.06} toneMapped={false} />
      </mesh>

      <mesh scale={2.2}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.025} toneMapped={false} />
      </mesh>
    </group>
  )
}
