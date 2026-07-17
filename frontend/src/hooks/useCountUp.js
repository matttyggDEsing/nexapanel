import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Anima un número entero desde 0 hasta `value` cuando el elemento
 * referenciado entra en viewport. Devuelve { ref, display } — `display`
 * ya viene formateado si se pasa `format`.
 *
 * No depende de librerías de conteo externas: usa requestAnimationFrame
 * con easing propio para no sumar otra dependencia al bundle.
 */
export function useCountUp(value, { duration = 1400, format } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(format ? format(0) : 0)

  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(value * eased)
      setDisplay(format ? format(current) : current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, format])

  return { ref, display }
}
