import { useRef } from 'react'

/**
 * Efecto magnético estilo Linear/Raycast: el elemento sigue el cursor
 * dentro de su propio área con desplazamiento amortiguado, y vuelve a
 * su lugar con un spring al salir. Se desactiva solo en touch (no hay
 * "hover" real) — se detecta vía CSS con `pointer: fine` en el propio
 * componente que lo usa, no acá, para no depender de otro hook.
 *
 * strength: cuánto se "estira" hacia el cursor (0.2–0.5 es sutil, 1 es
 * agresivo). El propio elemento debe tener `transition: transform`
 * suave en su CSS/clase (usamos spring de framer-motion en su lugar
 * cuando el consumer es un motion.button).
 */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
  }

  return { ref, onMouseMove, onMouseLeave }
}
