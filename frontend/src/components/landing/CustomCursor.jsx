import { useEffect, useRef, useState } from 'react'

/**
 * Cursor custom: un punto sólido + un anillo que lo persigue con lag
 * (spring manual vía lerp en rAF). Al pasar sobre cualquier elemento
 * marcado con `data-cursor="link"` el anillo crece y el punto se
 * achica, dando feedback de "esto es interactivo" sin depender de
 * :hover en CSS (así funciona igual con elementos dentro de Canvas).
 *
 * Se auto-desactiva en dispositivos touch / sin puntero fino, y
 * respeta prefers-reduced-motion (el cursor nativo sigue funcionando
 * siempre, esto es puramente decorativo).
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reduced)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: mouse.x, y: mouse.y }

    const handleMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`
      }
      const target = e.target.closest?.('[data-cursor="link"]')
      setHovering(!!target)
    }

    let raf
    const animateRing = () => {
      ring.x += (mouse.x - ring.x) * 0.18
      ring.y += (mouse.y - ring.y) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`
      }
      raf = requestAnimationFrame(animateRing)
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    raf = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden="true" role="presentation" tabIndex={-1} style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}>
      <div
        ref={dotRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 6, height: 6, marginLeft: -3, marginTop: -3,
          borderRadius: '50%', background: '#34D399',
          transition: 'opacity .2s',
          opacity: hovering ? 0 : 1,
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: hovering ? 56 : 32, height: hovering ? 56 : 32,
          marginLeft: hovering ? -28 : -16, marginTop: hovering ? -28 : -16,
          borderRadius: '50%',
          border: `1px solid ${hovering ? 'rgba(52,211,153,0.55)' : 'rgba(240,244,248,0.25)'}`,
          background: hovering ? 'rgba(16,185,129,0.08)' : 'transparent',
          transition: 'width .25s, height .25s, margin .25s, border-color .25s, background .25s',
        }}
      />
    </div>
  )
}
