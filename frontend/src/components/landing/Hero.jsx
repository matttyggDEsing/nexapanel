import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Instagram, Youtube, Music, Send, Shield } from 'lucide-react'
import { wordContainer, wordReveal, fadeUp, EASE } from '@/lib/motion'
import { useMagnetic } from '@/hooks/useMagnetic'

const HEADLINE_LINE_1 = ['Impulsa', 'tus', 'redes']
const HEADLINE_LINE_2 = ['al', 'siguiente', 'nivel']

const FEED = [
  { icon: Instagram, color: '#E1306C', label: 'Seguidores Instagram', qty: '+250', time: 'hace 2s' },
  { icon: Music,      color: '#1DB954', label: 'Reproducciones Spotify', qty: '+1,200', time: 'hace 6s' },
  { icon: Youtube,    color: '#FF0000', label: 'Vistas YouTube', qty: '+5,000', time: 'hace 11s' },
  { icon: Send,       color: '#2AABEE', label: 'Miembros Telegram', qty: '+180', time: 'hace 15s' },
  { icon: Instagram,  color: '#E1306C', label: 'Likes Instagram', qty: '+890', time: 'hace 21s' },
]

function LiveOrdersHUD() {
  const [rows, setRows] = useState(FEED)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => {
        const [first, ...rest] = prev
        return [...rest, first]
      })
    }, 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      style={{ perspective: 1000 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full max-w-[360px] transition-transform duration-300"
    >
      <div
        className={`absolute -inset-6 rounded-full -z-10 transition-all duration-500 ${
          hovered ? 'bg-em/20 blur-[80px] scale-110' : 'bg-em/10 blur-3xl'
        }`}
      />
      <div
        className={`rounded-2xl border bg-bg-secondary/70 backdrop-blur-xl shadow-card overflow-hidden transition-all duration-300 ${
          hovered ? 'border-em/25 -translate-y-1 shadow-em-lg' : 'border-border-dim'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-em animate-pulse-dot" />
            <span className="font-mono text-[11px] tracking-widest uppercase text-txt-secondary">
              Órdenes en vivo
            </span>
          </div>
          <span className="font-mono text-[11px] text-em-3">99.9% uptime</span>
        </div>

        <div className="flex flex-col divide-y divide-border-dim">
          {rows.slice(0, 4).map((row, i) => (
            <motion.div
              key={`${row.label}-${row.time}-${i}`}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span
                className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                style={{ background: `${row.color}1A` }}
              >
                <row.icon size={13} style={{ color: row.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-txt-primary font-medium truncate">{row.label}</p>
                <p className="font-mono text-[10.5px] text-txt-muted">{row.time}</p>
              </div>
              <span className="font-mono text-[13px] font-semibold text-em-3 shrink-0">{row.qty}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function HeadlineLine({ words, delay = 0 }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        variants={wordContainer}
        initial="hidden"
        animate="show"
        transition={{ delayChildren: delay }}
        className="inline-flex flex-wrap"
      >
        {words.map((w, i) => (
          <span key={w + i} className="overflow-hidden mr-[0.28em] py-1">
            <motion.span variants={wordReveal} className="inline-block">
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const cta = useMagnetic(0.3)

  return (
    <section className="relative pt-36 pb-28 px-6 md:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-bg-primary/30 via-transparent to-transparent"
      />

      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        {/* Copy */}
        <div className="relative z-10">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-em/10 border border-em/20 text-em-3 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-em animate-pulse-dot" />
            Panel SMM #1 en Latinoamérica
          </motion.span>

          <h1 className="font-display font-extrabold text-txt-primary leading-[0.98] tracking-tight text-[clamp(40px,6.4vw,74px)] mb-7">
            <HeadlineLine words={HEADLINE_LINE_1} delay={0.15} />
            <span className="block bg-gradient-to-r from-em via-em-4 to-em bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
              <HeadlineLine words={HEADLINE_LINE_2} delay={0.4} />
            </span>
          </h1>

          <motion.p {...fadeUp(0.55)} className="text-lg text-txt-secondary max-w-md leading-relaxed mb-10">
            Seguidores, vistas, likes y más — para Instagram, TikTok, YouTube, Spotify y 30+ plataformas.
            Todo desde un solo panel.
          </motion.p>

          <motion.div {...fadeUp(0.65)} className="flex flex-wrap items-center gap-4 mb-12">
            <motion.button
              ref={cta.ref}
              onMouseMove={cta.onMouseMove}
              onMouseLeave={cta.onMouseLeave}
              onClick={() => navigate('/register')}
              data-cursor="link"
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-bold text-black bg-em shadow-em transition-shadow hover:shadow-em-lg"
            >
              Empezar gratis <ArrowRight size={16} />
            </motion.button>
            <button
              onClick={() => document.getElementById('vendedores')?.scrollIntoView({ behavior: 'smooth' })}
              data-cursor="link"
              className="px-6 py-3.5 rounded-xl text-[15px] font-semibold text-txt-secondary border border-border-dim hover:border-em/30 hover:text-txt-primary transition-colors"
            >
              Buscar vendedor
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.75)} className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#FCD34D" color="#FCD34D" />
                ))}
              </div>
              <span className="text-[13px] text-txt-secondary">
                <strong className="text-txt-primary">4.9/5</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-txt-secondary">
              <Shield size={13} className="text-em-3" />
              +50,000 clientes satisfechos
            </div>
          </motion.div>
        </div>

        {/* HUD flotante */}
        <div className="relative flex justify-center lg:justify-end">
          <LiveOrdersHUD />
        </div>
      </div>
    </section>
  )
}
