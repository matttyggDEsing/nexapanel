import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor({ progress = 0 }) {
  const ref = useRef()

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.z = ((ref.current.position.z + delta * (0.15 + progress * 0.25)) % 2)
    }
  })

  return (
    <gridHelper
      ref={ref}
      args={[44, 36, '#10B981', '#10B981']}
      position={[0, -3.4, -1]}
    >
      <lineBasicMaterial transparent opacity={0.12} color="#10B981" />
    </gridHelper>
  )
}
