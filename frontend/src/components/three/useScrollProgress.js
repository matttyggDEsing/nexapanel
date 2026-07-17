import { useEffect, useRef, useState } from 'react'

/**
 * Devuelve un valor 0→1 que representa cuánto se scrolleó dentro del
 * contenedor referenciado por `ref` (desde que su top toca el top del
 * viewport hasta que su bottom lo abandona). Se usa para animar la
 * escena 3D (cámara, orbe, nodos) en sincronía con el scroll de la
 * landing, sin depender de ninguna librería externa.
 */
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    function update() {
      ticking.current = false
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const total = rect.height - vh
      if (total <= 0) {
        setProgress(0)
        return
      }
      const passed = -rect.top
      const p = Math.min(1, Math.max(0, passed / total))
      setProgress(p)
    }

    function onScrollOrResize() {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [ref])

  return progress
}
