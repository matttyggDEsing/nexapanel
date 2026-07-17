import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NODES } from '@/lib/nodes'

const dummy = new THREE.Object3D()
const origin = new THREE.Vector3(0, 0, 0)

/**
 * Pequeñas esferas emisivas que viajan en loop desde el núcleo (CoreOrb)
 * hasta cada nodo orbital y de vuelta — como "paquetes de datos" fluyendo
 * por la red. Es lo que le da vida real a la escena además de la rotación
 * del orbe: sin esto, un orbe girando solo se lee como decorativo/estático.
 * Usa un único InstancedMesh (una draw call) por performance.
 */
export default function DataPulses() {
  const meshRef = useRef()

  const nodePos = useMemo(() => NODES.map(() => new THREE.Vector3()), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.getElapsedTime()

    NODES.forEach((n, i) => {
      const a = t * n.speed + n.offset
      tmp.set(Math.cos(a) * n.radius, 0, Math.sin(a) * n.radius)
      euler.set(n.tilt, n.tiltY, 0)
      tmp.applyEuler(euler)
      nodePos[i].copy(tmp)

      // Onda triangular 0→1→0, desfasada por nodo para que no viajen todos
      // a la vez — más orgánico, como tráfico real en la red.
      const cycle = (t * 0.32 + i * 0.37) % 1
      const travel = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2
      const eased = travel * travel * (3 - 2 * travel) // smoothstep

      dummy.position.lerpVectors(origin, nodePos[i], eased)
      const fade = Math.sin(Math.min(1, travel) * Math.PI) // aparece/desaparece en los extremos
      dummy.scale.setScalar(0.05 + fade * 0.035)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      tmpColor.set(n.color)
      mesh.setColorAt(i, tmpColor)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, NODES.length]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
    </instancedMesh>
  )
}
