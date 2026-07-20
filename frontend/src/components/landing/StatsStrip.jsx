import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { useCountUp } from '@/hooks/useCountUp'

// value en número real; `suffix` arma el formato final. `decimals` para
// el uptime (99.9%). Todo se anima desde 0 cuando entra en viewport.
const STATS = [
  { value: 2000000, suffix: '+', label: 'Órdenes completadas', compact: true },
  { value: 50000, suffix: '+', label: 'Clientes activos', compact: true },
  { value: 99.9, suffix: '%', label: 'Uptime garantizado', decimals: 1 },
  { value: 2, suffix: 'h', prefix: '< ', label: 'Tiempo de respuesta' },
]

function compactFormat(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M'
  if (n >= 1000) {
    const k = n / 1000
    if (k >= 999.5) return (k / 1000).toFixed(1) + 'M'
    return k.toFixed(0) + 'K'
  }
  return String(n)
}

function Stat({ stat, index }) {
  // Para valores con decimales (99.9%) contamos en décimas internamente
  // para que la animación se vea fluida, y dividimos de nuevo al formatear.
  const scale = stat.decimals ? 10 : 1
  const target = Math.round(stat.value * scale)

  const format = (raw) => {
    const v = raw / scale
    const base = stat.decimals ? v.toFixed(stat.decimals) : stat.compact ? compactFormat(v) : v
    return `${stat.prefix || ''}${base}${stat.suffix || ''}`
  }

  const { ref, display } = useCountUp(target, { format })

  return (
    <motion.div ref={ref} {...fadeUp(0.06 * index)} className="flex flex-col items-center text-center px-6 py-10">
      <div className="font-display font-extrabold text-[clamp(28px,4vw,42px)] tracking-tight text-em-3 mb-2 font-mono tabular-nums">
        {display}
      </div>
      <div className="text-[13px] text-txt-secondary">{stat.label}</div>
    </motion.div>
  )
}

export default function StatsStrip() {
  return (
    <section id="stats" className="relative px-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-border-dim bg-bg-secondary/40 backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border-dim overflow-hidden">
        {STATS.map((s, i) => (
          <Stat key={s.label} stat={s} index={i} />
        ))}
      </div>
    </section>
  )
}
