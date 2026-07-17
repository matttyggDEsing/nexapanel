import { Instagram, Twitter, Youtube, Music, Send, Globe } from 'lucide-react'
import { fadeIn } from '@/lib/motion'
import { motion } from 'framer-motion'

const NETWORKS = [
  { icon: Instagram, label: 'Instagram', color: '#E1306C' },
  { icon: Twitter, label: 'TikTok', color: '#69C9D0' },
  { icon: Youtube, label: 'YouTube', color: '#FF0000' },
  { icon: Music, label: 'Spotify', color: '#1DB954' },
  { icon: Send, label: 'Telegram', color: '#2AABEE' },
  { icon: Globe, label: 'Facebook', color: '#1877F2' },
]

// Duplicamos la lista para el loop infinito sin salto — el keyframe
// `ticker` (definido en tailwind.config.js) mueve el track exactamente
// -50%, que es el ancho de un set completo.
const LOOP = [...NETWORKS, ...NETWORKS]

export default function PlatformMarquee() {
  return (
    <section className="relative py-16 px-6">
      <motion.p
        {...fadeIn()}
        className="text-center text-[11px] tracking-[0.2em] uppercase text-txt-muted mb-8"
      >
        Compatible con las principales plataformas
      </motion.p>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        }}
      >
        <div className="flex w-max gap-3 animate-ticker hover:[animation-play-state:paused]">
          {LOOP.map(({ icon: Icon, label, color }, i) => (
            <div
              key={label + i}
              className="group flex items-center gap-2.5 px-5 py-3 rounded-xl border border-border-dim bg-bg-secondary/50 backdrop-blur-sm text-sm font-medium text-txt-secondary shrink-0 transition-colors"
              style={{ '--hover-color': color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = color
                e.currentTarget.style.borderColor = `${color}55`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = ''
                e.currentTarget.style.borderColor = ''
              }}
            >
              <Icon size={16} style={{ color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
