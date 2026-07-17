// Curva de easing "premium" usada en todo el sitio (misma que ya usaba
// el landing viejo) — entrada rápida, salida suave.
export const EASE = [0.22, 1, 0.36, 1]

// Fade + slide-up genérico, para usar con whileInView.
export const fadeUp = (delay = 0, distance = 24) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: EASE },
})

export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, delay, ease: EASE },
})

// Contenedor con stagger — los hijos deben tener `variants={staggerItem}`.
export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0) => ({
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: {
    hidden: {},
    show: {
      transition: { staggerChildren: staggerDelay, delayChildren },
    },
  },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

// Revelado de texto por palabras (headline "mask reveal").
export const wordContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
}

export const wordReveal = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: EASE } },
}

// Escala + fade para elementos flotantes (chips, badges 3D-adjacent).
export const popIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.85, y: 12 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: EASE },
})
