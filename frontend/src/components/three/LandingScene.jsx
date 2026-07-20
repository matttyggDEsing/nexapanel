import { Component, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

import CoreOrb from './CoreOrb'
import NetworkNodes from './NetworkNodes'
import ConnectionLines from './ConnectionLines'
import AmbientParticles from './AmbientParticles'
import FloatingShapes from './FloatingShapes'
import DataPulses from './DataPulses'
import GridFloor from './GridFloor'
import { useGlobalPointer } from './useGlobalPointer'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return reduced
}

function useIsTouchDevice() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  return touch
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

function usePageScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return progress
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.warn('[LandingScene] 3D desactivado por error de render:', error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function StaticGlowFallback() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <div
        className="animate-glow-pulse"
        style={{
          position: 'absolute', top: '18%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '55%', left: '15%', transform: 'translate(-50%,-50%)',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '10%', right: '10%', transform: 'translate(-50%,-50%)',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

function SceneRig({ progress, pointer }) {
  const rigRef = useRef()

  useFrame((state) => {
    if (!rigRef.current) return
    const t = state.clock.getElapsedTime()

    const targetScale = THREE.MathUtils.lerp(1, 0.45, progress)
    const targetX = THREE.MathUtils.lerp(0, -2.6, progress)
    const targetY = THREE.MathUtils.lerp(0.1, 2.2, progress) + Math.sin(t * 0.35) * 0.05

    const s = rigRef.current.scale
    s.setScalar(THREE.MathUtils.lerp(s.x, targetScale, 0.06))

    const p = rigRef.current.position
    p.x = THREE.MathUtils.lerp(p.x, targetX, 0.05)
    p.y = THREE.MathUtils.lerp(p.y, targetY, 0.05)

    const px = pointer.current.x * 0.3
    const py = pointer.current.y * 0.18
    rigRef.current.rotation.y = THREE.MathUtils.lerp(rigRef.current.rotation.y, px, 0.04)
    rigRef.current.rotation.x = THREE.MathUtils.lerp(rigRef.current.rotation.x, -py, 0.04)
  })

  return (
    <group ref={rigRef}>
      <CoreOrb />
      <NetworkNodes progress={progress} />
      <ConnectionLines progress={progress} />
    </group>
  )
}

function CameraRig({ progress }) {
  useFrame((state) => {
    const targetZ = THREE.MathUtils.lerp(7, 10.5, progress)
    const targetY = THREE.MathUtils.lerp(0, 0.6, progress)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function LandingScene({ fullPage = false }) {
  const reducedMotion = usePrefersReducedMotion()
  const touchDevice = useIsTouchDevice()
  const progress = usePageScrollProgress()
  const pointer = useGlobalPointer()
  const [webglOk, setWebglOk] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setWebglOk(hasWebGL())
    if (fullPage) {
      setVisible(true)
      return
    }
    const el = document.querySelector('[data-scene-zone]')
    if (!el) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [fullPage])

  if (reducedMotion || !webglOk) return <StaticGlowFallback />
  if (!visible) return null

  const lowPower = touchDevice

  return (
    <div
      aria-hidden="true"
      style={{
        position: fullPage ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <SceneErrorBoundary fallback={<StaticGlowFallback />}>
        <Canvas
          dpr={lowPower ? 1 : [1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 7], fov: 42 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={0.45} />
          <pointLight position={[6, 4, 6]} intensity={45} color="#10B981" distance={22} />
          <pointLight position={[-6, -3, -4]} intensity={22} color="#34D399" distance={22} />
          <pointLight position={[0, -6, 2]} intensity={12} color="#6EE7B7" distance={18} />

          <Suspense fallback={null}>
            <CameraRig progress={progress} />
            <SceneRig progress={progress} pointer={pointer} />
            <DataPulses />
            <AmbientParticles lowPower={lowPower} />
            {!lowPower && <FloatingShapes />}
            <GridFloor progress={progress} />
            {!lowPower && (
              <EffectComposer multisampling={0}>
                <Bloom
                  intensity={1.4}
                  luminanceThreshold={0.12}
                  luminanceSmoothing={0.8}
                  mipmapBlur
                  radius={0.8}
                />
                <Vignette eskil={false} offset={0.1} darkness={0.9} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
