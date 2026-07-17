import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NODES } from '@/lib/nodes'

const SEGMENTS = NODES.length * 2 // núcleo→nodo + nodo→siguiente nodo, por cada nodo

/**
 * Dibuja el "campo neural": líneas del CoreOrb hacia cada nodo orbital
 * y entre nodos consecutivos, formando un anillo conectado. La
 * opacidad crece con el scroll (`progress`) — la red se ve tenue en
 * el hero y se densifica visualmente a medida que se avanza por la
 * landing, reforzando el copy de "crecé sin límites".
 */
export default function ConnectionLines({ progress = 0 }) {
  const lineRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEGMENTS * 2 * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SEGMENTS * 2 * 3), 3))
    return geo
  }, [])

  const nodePos = useMemo(() => NODES.map(() => new THREE.Vector3()), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    NODES.forEach((n, i) => {
      const a = t * n.speed + n.offset
      tmp.set(Math.cos(a) * n.radius, 0, Math.sin(a) * n.radius)
      euler.set(n.tilt, n.tiltY, 0)
      tmp.applyEuler(euler)
      nodePos[i].copy(tmp)
    })

    const posArr = geometry.attributes.position.array
    const colArr = geometry.attributes.color.array
    let ptr = 0

    const pushSegment = (a, b, hex) => {
      tmpColor.set(hex)
      posArr[ptr] = a.x; posArr[ptr + 1] = a.y; posArr[ptr + 2] = a.z
      colArr[ptr] = tmpColor.r; colArr[ptr + 1] = tmpColor.g; colArr[ptr + 2] = tmpColor.b
      ptr += 3
      posArr[ptr] = b.x; posArr[ptr + 1] = b.y; posArr[ptr + 2] = b.z
      colArr[ptr] = tmpColor.r; colArr[ptr + 1] = tmpColor.g; colArr[ptr + 2] = tmpColor.b
      ptr += 3
    }

    NODES.forEach((n, i) => {
      pushSegment(origin, nodePos[i], n.color)
      pushSegment(nodePos[i], nodePos[(i + 1) % NODES.length], n.color)
    })

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true

    if (lineRef.current) {
      lineRef.current.material.opacity = 0.05 + progress * 0.32
    }
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}
