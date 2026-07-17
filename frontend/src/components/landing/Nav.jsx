import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { EASE } from '@/lib/motion'
import { NexaIcon } from '@/components/ui/NexaIcon'

const LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Vendedores', href: '#vendedores' },
  { label: 'Números', href: '#stats' },
]

export default function Nav() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (href) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-6xl px-4 transition-all duration-300`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 transition-all duration-300 ${
            scrolled
              ? 'h-14 bg-bg-secondary/80 border border-border-dim shadow-card backdrop-blur-xl'
              : 'h-16 bg-transparent border border-transparent'
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 shrink-0"
            data-cursor="link"
          >
            <NexaIcon size={32} className="flex-shrink-0" />
            <span className="font-display font-bold text-[15px] text-txt-primary tracking-tight">
              Nexa<span className="text-em">Panel</span>
            </span>
          </button>

          {/* Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.href)}
                data-cursor="link"
                className="relative px-4 py-2 text-[13px] font-medium text-txt-secondary hover:text-txt-primary transition-colors group"
              >
                {l.label}
                <span className="absolute left-4 right-4 -bottom-px h-px bg-em scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </button>
            ))}
          </nav>

          {/* Actions (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              data-cursor="link"
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-txt-secondary hover:text-txt-primary border border-transparent hover:border-border-dim transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              data-cursor="link"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-black bg-em hover:bg-em-2 transition-colors"
            >
              Empezar
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Burger (mobile) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-9 h-9 grid place-items-center rounded-lg text-txt-primary"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="md:hidden mx-4 mt-2 rounded-2xl border border-border-dim bg-bg-secondary/95 backdrop-blur-xl p-4 flex flex-col gap-1"
          >
            {LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.href)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-txt-secondary hover:text-txt-primary hover:bg-white/5"
              >
                {l.label}
              </button>
            ))}
            <div className="h-px bg-border-dim my-2" />
            <button
              onClick={() => navigate('/login')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-txt-secondary hover:text-txt-primary"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="mt-1 px-3 py-2.5 rounded-lg text-sm font-bold text-black bg-em text-center"
            >
              Empezar gratis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
