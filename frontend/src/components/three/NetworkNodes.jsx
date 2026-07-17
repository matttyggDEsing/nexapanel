import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { NODES } from '@/lib/nodes'

const RING_SEGMENTS = 72

function OrbitRing({ color, radius, speed, offset, tilt, tiltY }) {
  const nodeRef = useRef()
  const haloRef = useRef()

  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= RING_SEGMENTS; i++) {
      const a = (i / RING_SEGMENTS) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return pts
  }, [radius])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius
    if (nodeRef.current) nodeRef.current.position.set(x, 0, z)
    if (haloRef.current) haloRef.current.position.set(x, 0, z)
  })

  return (
    <group rotation={[tilt, tiltY, 0]}>
      <Line points={points} color={color} transparent opacity={0.16} lineWidth={1} />
      <mesh ref={nodeRef}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* halo suave detrás del nodo para reforzar el bloom */}
      <mesh ref={haloRef} scale={2.6}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Conjunto de anillos orbitales alrededor del CoreOrb. Al avanzar el
 * scroll (`progress`) toda la formación se expande levemente y gira más
 * rápido, dando sensación de "crecimiento" — coherente con el copy de
 * la landing ("Crecé sin límites").
 */
export default function NetworkNodes({ progress = 0 }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (0.05 + progress * 0.05)
    const targetScale = THREE.MathUtils.lerp(1, 1.3, progress)
    const s = groupRef.current.scale
    s.setScalar(THREE.MathUtils.lerp(s.x, targetScale, 0.05))
  })

  return (
    <group ref={groupRef}>
      {NODES.map((n, i) => (
        <OrbitRing key={i} {...n} />
      ))}
    </group>
  )
}
