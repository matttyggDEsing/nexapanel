import { NexaIcon } from '@/components/ui/NexaIcon'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'

const FOOTER_LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Vendedores', href: '#vendedores' },
  { label: 'Números', href: '#stats' },
  { label: 'Términos', href: '#' },
  { label: 'Privacidad', href: '#' },
  { label: 'API', href: '#' },
]

export default function Footer() {
  return (
    <motion.footer {...fadeUp(0)} className="relative px-6 border-t border-border-dim">
      <div className="mx-auto max-w-5xl py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <NexaIcon size={26} className="flex-shrink-0" />
          <div>
            <span className="font-display font-bold text-[14px] text-txt-primary tracking-tight">
              Nexa<span className="text-em">Panel</span>
            </span>
            <p className="text-[11px] text-txt-muted mt-0.5">Panel SMM #1 en Latinoamérica</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[12px] text-txt-muted hover:text-txt-secondary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl border-t border-border-dim py-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] text-txt-muted">
          © {new Date().getFullYear()} NexaPanel. Todos los derechos reservados.
        </p>
        <p className="text-[11px] text-txt-muted">
          Hecho con <span className="text-em-3">&#9829;</span> para creadores digitales
        </p>
      </div>
    </motion.footer>
  )
}
