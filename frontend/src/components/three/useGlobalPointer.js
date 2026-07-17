import { useEffect, useRef } from 'react'

/**
 * Rastrea la posición del mouse a nivel de `window` y la normaliza a
 * -1..1. Se usa en vez de `state.pointer` de R3F porque el canvas 3D
 * vive *detrás* del contenido (pointer-events: none) — así el parallax
 * sigue funcionando sin robarle clicks a los botones de la landing.
 * Devuelve un ref mutable (no state) para no re-renderizar en cada
 * movimiento de mouse.
 */
export function useGlobalPointer() {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function handleMove(e) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return pointer
}
