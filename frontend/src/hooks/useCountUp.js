import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function useCountUp(value, { duration = 1400, format } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState('')

  const formatRef = useRef(format)
  formatRef.current = format
  const valueRef = useRef(value)
  valueRef.current = value
  const durationRef = useRef(duration)
  durationRef.current = duration

  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationRef.current)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(valueRef.current * eased)
      setDisplay(formatRef.current ? formatRef.current(current) : current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  return { ref, display }
}
