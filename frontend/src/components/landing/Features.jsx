import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, Globe, Clock, Users } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

const FEATURES = [
  {
    icon: Zap,
    title: 'Entrega instantánea',
    desc: 'Las órdenes comienzan en segundos. Sin demoras, sin esperas — el motor procesa la cola en tiempo real.',
    big: true,
  },
  { icon: Shield, title: 'Panel seguro', desc: 'Autenticación JWT, cifrado en tránsito y datos protegidos.' },
  { icon: TrendingUp, title: 'Alta calidad', desc: 'Seguidores, vistas y likes de fuentes verificadas.' },
  { icon: Globe, title: '30+ plataformas', desc: 'Todas las redes sociales en un solo lugar.' },
  { icon: Clock, title: 'Soporte 24/7', desc: 'Tickets respondidos en menos de 2 horas.' },
  { icon: Users, title: 'API pública', desc: 'Integra NexaPanel en tu propio sistema vía REST API.' },
]

function SpotlightCard({ feature, index }) {
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      {...fadeUp(0.05 * index)}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl border border-border-dim bg-bg-tertiary/60 p-7 transition-colors hover:border-em/25 ${
        feature.big ? 'md:col-span-2 md:row-span-1' : ''
      }`}
      style={{ '--mx': '50%', '--my': '50%' }}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(320px circle at var(--mx) var(--my), rgba(16,185,129,0.09), transparent 70%)',
        }}
      />

      <div className="relative">
        <div className="w-11 h-11 rounded-xl grid place-items-center mb-5 bg-em/10 border border-em/20">
          <feature.icon size={19} className="text-em-3" />
        </div>
        <h3 className="font-display font-bold text-[17px] text-txt-primary mb-2">{feature.title}</h3>
        <p className="text-[14px] text-txt-secondary leading-relaxed max-w-sm">{feature.desc}</p>
      </div>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="funciones" className="relative py-28 px-6 border-t border-b border-border-dim bg-bg-secondary/40">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp(0)} className="text-center max-w-lg mx-auto mb-16">
          <span className="text-[11px] tracking-[0.2em] uppercase text-em-3 font-semibold">Plataforma</span>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] tracking-tight text-txt-primary mt-3 mb-4">
            Todo lo que necesitás en un panel
          </h2>
          <p className="text-[16px] text-txt-secondary">
            Diseñado para agencias, creadores y resellers que necesitan velocidad y confiabilidad.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <SpotlightCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
